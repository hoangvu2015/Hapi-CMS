'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Moment = require('moment');
const async = require("async");
const _ = require('lodash');
const Wreck = require('wreck');
const Mongoose = require('mongoose');
const kue = require('kue')
const queue = kue.createQueue();
const EventLog = require(BASE_PATH + '/app/utils/events/logs.event.js');
const Log = Mongoose.model('Log');
const SaleContact = Mongoose.model('SaleContact');
const SaleContactTmp = Mongoose.model('SaleContactTmp');
const ErrorHandler = require(BASE_PATH + '/app/utils/error.js');
const UserHelper = require(BASE_PATH + '/app/modules/api-user/util/user.js');
const UploadFile = require(BASE_PATH + '/app/modules/api-upload/util/upload.js');
const SCHelper = require(BASE_PATH + '/app/modules/admin-salecontact/util/salecontact.js');
// const mdwAuth = require(BASE_PATH + '/app/utils/middleware/auth.js');

module.exports = {
	find: find,
	findOne: findOne,
	create: create,
	update: update,
	uploadFileTest: uploadFileTest,
	destroy: destroy,
	findByEmail: findByEmail,
	evictContact: evictContact,
	assignForSalemans: assignForSalemans,
};

/*Bàn giao cho saleman từ popup assign saleman*/
function assignForSalemans(){
	return{
		auth: 'jwt',
		handler: function(request, reply){
			let items = request.payload.contacts;
			let formData = request.payload.formData;
			let userAuth = request.auth.credentials;


			if(!request.payload.formData._user_dest || request.payload.formData._user_dest === '')
				return reply(Boom.badRequest('Lỗi không có user đích !'));

			let listAsync = [];
			for (let k in items) {
				if (items.hasOwnProperty(k)) {
					listAsync.push(function(callback){
						if(items[k]){
							SaleContact
							.findOne({_id: Mongoose.Types.ObjectId(k)})
							.then(function(doc){
								/*Log contact*/
								SCHelper.hpgetByContactId(k).then(function(resp){
									let log = {
										_id_auth: userAuth.id,
										type: 'assign_saleman',
										content: {
											_id_contact: resp._id,
											_id_user_dest: request.payload.formData._user_dest,
											_id_user_src: doc._sale_usermember || request.payload.formData._user_src,
											desc: "Bàn giao contact từ "+resp._sale_usermember.email+' đến '+request.payload.email_dest
										}
									};
									EventLog('log-save', log);

									doc.eviction = Boolean(0);
									doc._sale_usermember = request.payload.formData._user_dest;
									doc._sale_userconvert = request.payload.formData._user_src || userAuth.id;
									doc.save();
								});
								return callback();

							}).catch(function(err){return callback();});

						}else{
							return callback();
						}
					});
				}
			}

			async.parallel(listAsync,function(err, result){
				return reply({success: true});
			});
		}
	};
}

/*Thu hồi contacts*/
function evictContact(){
	return{
		auth: 'jwt',
		handler: function(request, reply){
			let items = request.payload.items;
			let listAsync = [];

			for (let k in items) {
				if (items.hasOwnProperty(k)) {
					listAsync.push(function(callback){
						if(items[k]){
							SaleContact.findOne({_id: Mongoose.Types.ObjectId(k)}).then(function(doc){
								doc.eviction = Boolean(1);
								doc.save();
								return callback();
							}).catch(function(err){return callback();});

						}else{
							return callback();
						}
					});
				}
			}
			async.parallel(listAsync,function(err, result){
				return reply({success: true});
			});
		}
	};
}

function uploadFileTest(){
	return {
		auth: 'jwt',
		pre: [
		{ method: getById, assign: 'saleContact' }
		],
		handler: function(request, reply) {
			UploadFile.uploadFile(request).then(function(resp){
				if(resp && resp.filename){
					/* format data contact*/
					let data = request.pre.saleContact;
					data = _.extend(data, { level_5: {test_file: resp.filename} });
					/*update contact*/
					let promise = data.save();
					promise.then(function(result) {
						return reply(resp);
					}).catch(function(err) {
						return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
					});
				}else{
					return reply(resp);
				}
			}).catch(function(err){
				return reply(err);
			});
			return reply({success:true});
		},
		validate: {
			payload: {
				file: Joi.any().required().meta({ swaggerType: 'file' }).description('File'),
				type: Joi.string().description('Type'),
				prefix: Joi.string().description('prefix'),
				id: Joi.string().description('id')
			}
		},
		payload: {
			maxBytes: 10048576,
			parse: true,
			allow: ['application/json', 'image/jpeg', 'multipart/form-data','application/pdf'],
			output: 'stream'
		}
	};
}

function find(){
	return {
		auth: 'jwt',
		pre: [
		{ method: getTotalFilter(), assign: 'totalFilters' },
		{ method: UserHelper.getUserSaleActive, assign: 'userSaleActive' }
		],
		handler: function(request, reply) {
			let config = request.server.configManager;
			let page = request.query.page || 1;
			let itemsPerPage = parseInt(request.query.limit) || config.get('web.paging.itemsPerPage');
			let filters = {};
			let conditions = {};

			// console.log('vv',request.pre.userSaleActive);
			/*Keyword*/
			if (request.query.keyword && request.query.keyword.length > 0) {
				let re = new RegExp(request.query.keyword, 'i');
				filters.$or = [
				{ 'level_1.name': re},
				{ 'level_1.email': re},
				{ 'level_1.phone': re}
				]
			}
			/*Bài viết của saleman*/
			if (request.query.uid && request.query.uid.length > 0)
				filters._sale_usermember = {$eq: request.query.uid};

			/*Phân loại*/
			if (request.query.type && request.query.type.length > 0) {
				if(request.query.type === 'null')
					filters['level_2.type'] = {$in:[null,'']};
				else
					filters['level_2.type'] = request.query.type;
			}

			/*Bàn giao*/
			if (request.query.is_finish === 'true')
				filters.is_finish = request.query.is_finish;
			if (request.query.is_finish === 'false')
				filters.is_finish = request.query.is_finish;

			/*Filter Trạng thái cuộc gọi*/
			if (request.query.call_status)
				filters['call_info.call_status'] = request.query.call_status;

			/*Filter Trạng thái Chăm sóc*/
			if (request.query.care_status)
				filters['call_info.care_status'] = request.query.care_status;

			/*Filter Level*/
			if (request.query.call_level){
				if(request.query.call_level === 'new')
					filters['call_info.call_level'] = {$nin: [1,2,3,4,5,6,7,8]};
				else
					filters['call_info.call_level'] = request.query.call_level;
			}

			/*Filter Level*/
			if (request.query.is_recall_schedule === 'true')
				filters['call_info.is_recall_schedule'] = {$ne : false};

			/*Filter Lịch hẹn test phỏng vấn*/
			if (request.query.schedule_inteview === 'true')
				filters['level_3.schedule_inteview'] = {$ne : null};

			/*Filter Today, Week, Month, Option*/
			if (request.query.filterDay && request.query.filterDay.length > 0){
				let start,end;
				
				if(request.query.filterDay === 'orther'){
					start 	= request.query.startDate;
					end 	= request.query.endDate;
				}else{
					start 	= Moment().startOf(request.query.filterDay);
					end 	= Moment().endOf(request.query.filterDay);
				}
				
				filters['createdAt'] = { $gt: start, $lt: end };
			}

			/*Filter dup*/
			if (request.query.dup === 'true')
				filters['dup'] = true;
			else if(request.query.dup === 'false')
				filters['dup'] = { $nin: [true] } ;

			/*Filter eviction*/
			if (request.query.eviction === 'true')
				filters['eviction'] = true;
			else if(request.query.eviction === 'false')
				filters['eviction'] = { $nin: [true] } ;

			/*List contact*/
			SaleContact
			.find(filters)
			.populate('_sale_userconvert', 'name email')
			.populate('_sale_usermember', 'name email')
			.where(conditions)
			.sort({ createdAt: -1, 'level_1.email': -1})
			.paginate(page, itemsPerPage, function(err, items, total) {
				if (err) {
					request.log(['error', 'list', 'user'], err);
					reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
				}
				let totalPage = Math.ceil(total / itemsPerPage);
				let dataRes = {
					status: 1,
					totalItems: total,
					totalPage: totalPage,
					currentPage: page,
					itemsPerPage: itemsPerPage,
					items: items,
					totalFilters: request.pre.totalFilters,
					userSaleActive: request.pre.userSaleActive
				};

				SCHelper.hpformatContact(dataRes.items).then(function(resp){
					dataRes.items = resp;
					return reply(dataRes);
				}).catch(function(err){
					return reply(err);
				});
			});
		}
	};
}

function findOne(){
	return {
		auth: 'jwt',
		pre: [
		{ method: getById, assign: 'saleContact' }
		],
		handler: function(request, reply) {
			let resp = {
				dup: [],
				contact: {}
			};
			/*Elastic Search*/
			SaleContactTmp.search({
				"bool": { 
					"should": [
					{'match_phrase': {'email': request.pre.saleContact.level_1.email}},
					{'match_phrase': {'phone': request.pre.saleContact.level_1.phone}},
					],
				}
			},{}, function(err, result){
				if(result){
					resp.dup = result.hits.hits;
					resp.contact = request.pre.saleContact;
				}
				return reply(resp);
			});
		}
	};
}

function create(){
	return {
		auth: 'jwt',
		pre: [
		{ method: getByEmailDup, assign: 'contactByEmail' },
		{ method: getByPhone, assign: 'contactByPhone' }
		],
		handler: function(request, reply) {
			var data = request.payload;

			/*Check có chấp nhận Duplicate contact hay không*/
			let checkDup = function(typeCheck){
				if(typeCheck == 'email'){
					var contact = request.pre.contactByEmail;
				}else if(typeCheck == 'phone'){
					var contact = request.pre.contactByPhone;
				}
				if(contact && !request.payload.acceptDup){
					if(contact._sale_usermember){
						return UserHelper.hpgetByUserId(contact._sale_usermember)
						.then(function(result){
							return reply({dup: true, saleman: result});
						})
						.catch(function(err){
							return reply({dup: true});
						});
					}else{
						return reply({dup: true});
					}
				}
			}
			if(request.pre.contactByEmail && request.payload.level_1.email){
				return checkDup('email');
			}else if(request.pre.contactByPhone && request.payload.level_1.phone){
				return checkDup('phone');
			}

			/*Lưu contact mới*/
			var saleContact = new SaleContact(data);

			let promise = saleContact.save();
			promise
			.then(function(resp) {
				reply(resp);
			})
			.catch(function(err) {
				reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
			});
		}
	};
}

function update(){
	return {
		auth: 'jwt',
		pre: [
		{ method: getById, assign: 'saleContact' }
		],
		handler: function(request, reply) {
			let data = request.pre.saleContact;
			data = _.extend(data, request.payload);
			let promise = data.save();
			promise.then(function(resp) {
				reply(resp);
			}).catch(function(err) {
				reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
			});
		}
	};
}

function destroy(){
	return {

	};
}

function findByEmail(){
	return {
		auth: 'jwt',
		handler: function(request, reply) {
			let filters = {};

			filters['level_1.email'] = {$eq: request.payload.email};

			SaleContact
			.find(filters)
			.sort({created_at: -1}).exec(function(err, resp){
				reply({items:resp});
			});
		}
	};
}

/******************************************************************
Middleware
*******************************************************************/
function getByEmail(request, reply) {
	let email = request.params.email || request.payload.level_1.email;
	let promise = SaleContact.findOne({ 'level_1.email': email });

	promise
	.then(function(resp) {
		return reply(resp);
	})
	.catch(function(err) {
		request.log(['error'], err);
		return reply.continue();
	});
}

function getByEmailDup(request, reply) {
	let email = request.params.email || request.payload.level_1.email;
	let promise = SaleContact.findOne({ 'level_1.email': email, 'is_finish': false });

	promise
	.then(function(resp) {
		return reply(resp);
	})
	.catch(function(err) {
		request.log(['error'], err);
		return reply.continue();
	});
}

function getByPhone(request, reply) {
	let phone = request.params.phone || request.payload.level_1.phone;
	let promise = SaleContact.findOne({ 'level_1.phone': phone });

	promise
	.then(function(resp) {
		return reply(resp);
	})
	.catch(function(err) {
		request.log(['error'], err);
		return reply.continue();
	});
}

function getById(request, reply) {
	let id = request.params.id || request.payload.id;
	let promise = SaleContact.findOne({ '_id': id });

	promise
	.then(function(resp) {
		return reply(resp);
	})
	.catch(function(err) {
		request.log(['error'], err);
		return reply.continue();
	});
}


function getTotalFilter() {
	return function (request, reply) {
		let options = {};
		let results = {};
		
		if(request.query.uid && request.query.uid.length > 0)
			options['_sale_usermember'] = Mongoose.Types.ObjectId(request.query.uid);

		/*Filter dup*/
		if (request.query.dup === 'true')
			options['dup'] = true;

		/*Filter eviction*/
		if (request.query.eviction === 'true')
			options['eviction'] = true;

		let listFilters = [
		{type: 'all', options: options},
		{type: 'day', options: options, filter: {'range':{'createdAt': {'gte': Moment().startOf('day'), 'lte': Moment().endOf('day')}}}},
		{type: 'isoWeek', options: options, filter: {'range':{'createdAt': {'gte': Moment().startOf('isoWeek'), 'lte': Moment().endOf('isoWeek')}}}},
		{type: 'month', options: options, filter: {'range':{'createdAt': {'gte': Moment().startOf('month'), 'lte': Moment().endOf('month')}}}},
		{type: 'is_finish', options: _.extend({}, options, {is_finish: new Boolean(true)})},
		{type: 'not_is_finish', options: _.extend({}, options, {is_finish: false})},
		{type: 'work', options: _.extend({}, options, {'level_2.type': 'work'})},
		{type: 'kid', options: _.extend({}, options, {'level_2.type': 'kid'})},
		{type: 'undefined', options: options, must_not: [{'match_phrase': {'level_2.type': 'work'}},{'match_phrase': {'level_2.type': 'kid'}}] },
		{type: 'is_recall_schedule', options: options, must_not: [{'match_phrase': {'call_info.is_recall_schedule': false}}]},
		{type: 'schedule_inteview', options: options, filter: { "exists": { "field": "level_3.schedule_inteview" }}},
		{type: 'call_level_new', options: options, must_not:[{"range" : {"call_info.call_level" : { "from" : 1, "to" : 8 }}}]},
		// {type: 'dup', options: _.extend({}, options, {dup: Boolean(1)})},

		{type: 'call_level_1', options: _.extend({}, options, {'call_info.call_level': 1})},
		{type: 'call_level_2', options: _.extend({}, options, {'call_info.call_level': 2})},
		{type: 'call_level_3', options: _.extend({}, options, {'call_info.call_level': 3})},
		{type: 'call_level_4', options: _.extend({}, options, {'call_info.call_level': 4})},
		{type: 'call_level_5', options: _.extend({}, options, {'call_info.call_level': 5})},
		{type: 'call_level_6', options: _.extend({}, options, {'call_info.call_level': 6})},
		{type: 'call_level_7', options: _.extend({}, options, {'call_info.call_level': 7})},
		{type: 'call_level_8', options: _.extend({}, options, {'call_info.call_level': 8})},
		];

		if(request.query.dup === 'false'){
			for (let k in listFilters) {
				if (listFilters.hasOwnProperty(k)) {
					if(typeof listFilters[k].must_not == 'undefined'){
						listFilters[k].must_not = [
						{'term': {'dup': true}}
						];
					}else{
						listFilters[k].must_not.push({'term': {'dup': true}});
					}
				}
			}
		}

		if(request.query.eviction === 'false'){
			for (let k in listFilters) {
				if (listFilters.hasOwnProperty(k)) {
					if(typeof listFilters[k].must_not == 'undefined'){
						listFilters[k].must_not = [
						{'term': {'eviction': true}}
						];
					}else{
						listFilters[k].must_not.push({'term': {'eviction': true}});
					}
				}
			}
		}

		if(!request.query.uid && request.query.newly === 'true'){
			async.parallel([
				function(callback){getFT(listFilters[0],function(){callback();});},
				function(callback){getFT(listFilters[1],function(){callback();});},
				function(callback){getFT(listFilters[2],function(){callback();});},
				function(callback){getFT(listFilters[3],function(){callback();});},
				],
				function(err, resultss) {
					// console.log('resultss',resultss, results);
					return reply(results);
				});
		}else{
			async.parallel([
				function(callback){getFT(listFilters[0],function(){callback();});},
				function(callback){getFT(listFilters[1],function(){callback();});},
				function(callback){getFT(listFilters[2],function(){callback();});},
				function(callback){getFT(listFilters[3],function(){callback();});},
				function(callback){getFT(listFilters[4],function(){callback();});},
				function(callback){getFT(listFilters[5],function(){callback();});},
				function(callback){getFT(listFilters[6],function(){callback();});},
				function(callback){getFT(listFilters[7],function(){callback();});},
				function(callback){getFT(listFilters[8],function(){callback();});},
				function(callback){getFT(listFilters[9],function(){callback();});},
				function(callback){getFT(listFilters[10],function(){callback();});},
				function(callback){getFT(listFilters[11],function(){callback();});},
				function(callback){getFT(listFilters[12],function(){callback();});},
				function(callback){getFT(listFilters[13],function(){callback();});},
				function(callback){getFT(listFilters[14],function(){callback();});},
				function(callback){getFT(listFilters[15],function(){callback();});},
				function(callback){getFT(listFilters[16],function(){callback();});},
				function(callback){getFT(listFilters[17],function(){callback();});},
				function(callback){getFT(listFilters[18],function(){callback();});},
				function(callback){getFT(listFilters[19],function(){callback();});},
				],
				function(err, resultss) {
					return reply(results);
				});
		}
		function getFT(filter, callback){
			/*convert muti match to single match*/
			let match = [];
			for (var item in filter.options) {
				let tmp1 = {};
				tmp1[item] = filter.options[item];
				let tmp = {'match_phrase': tmp1};
				match.push(tmp);
			}

			/*Elastic Search*/
			SaleContact.search({
				"bool": { 
					"must": match,
					"should": filter.should,
					"must_not": filter.must_not,
					"filter": filter.filter
				}
			},{}, function(err, resp){
				if(resp){
					results[filter.type] = resp.hits.total;
				}
				callback();
			});
		}
	};
}