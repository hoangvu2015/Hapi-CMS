'use strict';

const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
const mongoose = require('mongoose');
const ErrorHandler = require(BASE_PATH + '/app/utils/error.js');
const async = require("async");
const User = mongoose.model('User');
const Log = mongoose.model('Log');
const UserHelper = require(BASE_PATH + '/app/modules/api-user/util/user.js');
const SaleContactHelper = require(BASE_PATH + '/app/modules/admin-salecontact/util/salecontact.js');
const DEFINED = require(BASE_PATH + '/app/modules/api-sendmail/util/define.js');
const Bluebird = require("bluebird");

const SaleContact = mongoose.model('SaleContact');
const SaleContactTmp = mongoose.model('SaleContactTmp');

module.exports = {
	getSaleman			: getSaleman,
	getContactOptimized	: getContactOptimized,
	postAssignContact	: postAssignContact,
	destroyContact		: destroyContact,
	findSalemanAssign	: findSalemanAssign,
	assignToCMD			: assignToCMD
};

function getSaleman(){
	return {
		auth: 'jwt',
		pre: [
		{ method: getSaleKid, assign: 'salemanKid' },
		{ method: getSaleWork, assign: 'salemanWork' },
		],
		handler: function(request, reply) {
			let resp = {};
			resp.salemanKid = request.pre.salemanKid;
			resp.salemanWork = request.pre.salemanWork;
			
			return reply(resp);
		}
	};
}

function findSalemanAssign(){
	return {
		auth: 'jwt',
		handler: function(request, reply) {
			let filters = {};

			filters['status'] = new Boolean(true);
			filters['saleman.active'] = new Boolean(true);
			filters['deletedAt'] = null;

			User
			.find(filters, '_id name email saleman.types')
			.select({ _id:1, email:1 })
			.exec(function(err, items) {
				let dataRes = { status: 1, items: items };
				return reply(dataRes);
			});
		}
	};
}


function destroyContact(){
	return {
		auth: 'jwt',
		pre: [
		{ method: SaleContactHelper.getById, assign: 'salecontact' },
		],
		handler: function(request, reply) {
			let salecontact = request.pre.salecontact;
			if(salecontact){
				salecontact.remove()
				.then(function(doc){
					return reply({success:true});
				}).catch(function(err){
					request.log(['error', 'remove-contact', 'contact'], err);
					return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
				});
			}
		}
	};
}

function getContactOptimized(){
	return {
		auth: 'jwt',
		pre: [
		{ method: getContactFilterDate('work', 'email'), assign: 'contactsGroupEmailWork' },
		{ method: getContactFilterDate('work', 'phone'), assign: 'contactsGroupPhoneWork' },
		{ method: getContactFilterDate('kid', 'email'), assign: 'contactsGroupEmailKid' },
		{ method: getContactFilterDate('kid', 'phone'), assign: 'contactsGroupPhoneKid' },
		],
		handler: function(request, reply) {
			let resp = {
				groupWork: {
					emails: request.pre.contactsGroupEmailWork,
					phones: request.pre.contactsGroupPhoneWork,
				},
				groupKid: {
					emails: request.pre.contactsGroupEmailKid,
					phones: request.pre.contactsGroupPhoneKid,
				}
			};

			return reply(resp);
		}
	};
}

function proccessAssignContact(group){
	return function(request, reply) {
		// console.log('ggdddd');
		let type = request.payload.type;
		let listSaleman = request.payload.listSaleman;
		let groupContacts = request.payload.contacts[group];
		let userAuth = request.auth.credentials;

		let listAsync = [];
		for (let k in groupContacts.all) {
			if (groupContacts.all.hasOwnProperty(k)) {
				listAsync.push(function(callback){
					async.each(groupContacts.all[k].contacts, function(item, callback1){

						if(typeof groupContacts.all[k]._newSaleman == 'undefined')
							return callback1();
						if(!item.phone && !item.email)
							return callback1();

						/*Nếu cả email và phone khác null thì check trùng 'hoặc'*/
						if(item.phone != '' && item.email != ''){
							checkDup(item, {$or:[{'level_1.email': item.email}, {'level_1.phone': item.phone}]});
						}
						/*nếu chỉ có email thì chỉ check trùng email*/
						else if(item.email && item.email != ''){
							checkDup(item, {'level_1.email': item.email});
						}
						/*nếu chỉ có phone thì chỉ check trùng phone*/
						else if(item.phone && item.phone != ''){
							checkDup(item, {'level_1.phone': item.phone});
						}

						/*Nếu trùng thì update field dup contact và newly resgiter, nếu ko trùng thì tạo mới contact và update newly*/
						function checkDup(item, options){
							SaleContact.findOne(options)
							.then(function(result){
								if(result){
									/*Cập nhật status Dup*/
									result.dup = Boolean(1);
									result.save();
								}else{
									/*Tạo mới contact*/
									let data = {};
									data._sale_usermember = groupContacts.all[k]._newSaleman;
									data._sale_userconvert = userAuth.id;
									data.level_1 = {
										olduser_id: item.olduser_id,
										oldteacher_id: item.oldteacher_id,
										email: item.email,
										skype: item.skype,
										name: item.name,
										name_kid: item.name_kid,
										phone: item.phone,
										age: item.age,
										source_contact: item.source_contact,
										career: item.career,
										learn_info: item.learn_info,
									};
									data.level_2 = {
										type: item.type,
									};

									let promise = new SaleContact(data);
									promise = promise.save().then(function(result){});
								}

								/*Update newly*/
								saveReg({'_id': item._id});
							}).catch(function (err) {
								return callback1();
							});
						}

						function saveReg(options){
							SaleContactTmp.findOne(options)
							.then(function(result){
								if(result){
									result.newly = Boolean(0);
									result.save();
								}
							});
							return callback1();
						}
					},
					function(err){
						if( err ) console.log('A item failed to process new0');
						else console.log('All item have been processed successfully new0');
					});

					return callback();
				});
			}
		}

		async.parallel(listAsync,function(err, results) {
			return reply({success:true});
		});
	};
}

function postAssignContact(){
	return {
		auth: 'jwt',
		payload: {
			maxBytes: 10000048576,
			// parse: true,
			// allow: 'multipart/form-data',
			// output: 'stream'
		},
		pre: [
		{ method: proccessAssignContact('emails'), assign: 'resultEmail' },
		{ method: proccessAssignContact('phones'), assign: 'resultPhone' },
		],
		handler: function(request, reply) {
			
			return reply({success:true});
		}
	};
}

function assignToCMD(){
	return {
		auth: 'jwt',
		pre: [
		{ method: SaleContactHelper.getById, assign: 'salecontact' },
		],
		handler: function(request, reply){

			let config = request.server.configManager;
			let pubsub = request.server.plugins['app-pubsub'].pubsub;
			UserHelper.hpgetByUserId(request.pre.salecontact._sale_usermember)
			.then(function(user){
				let context = request.pre.salecontact;

				/* format Tỉnh*/
				if(context.level_1.province){
					let province = DEFINED.getMapVietnam()[context.level_1.province];
					if(province) context.level_1.province = province.name;
				}
				context.note_cmd = request.payload.note_cmd;

				let emailData = {
					"from": {name: user.name || 'Antoree', address: user.email || 'hello@antoree.com'},//config.get('web.email.from'),
					"to": config.get('web.email.to'),//[{name: 'Hoang Vu',address:'hoangvu53th@gmail.com'}],//config.get('web.email.to'),
					"subject": "Bàn giao học viên từ "+user.name,
					"html": "Contact Form",
					"template": {
						"name": "assignCMD",
						"context": context
					},
					"text": ""
				};
				// Gửi email
				pubsub.publish('api-sendmail', emailData, function () {
					let data = request.pre.salecontact;
					let newData = {is_finish: true, date_assign_cmd: new Date(), note_cmd: request.payload.note_cmd}
					data = _.extend(data, newData);
					let promise = data.save();
					promise.then(function(resp) {
						return reply({success:true});
					}).catch(function(err) {
						return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
					});
				});
			})
			.catch(function(err){
				return reply(err);
			});
		}
	};
}

/******************************************************************
Middleware
*******************************************************************/

function getTotalContactDup(type){
	return function(request, reply) {
		let filters = {};
		if(request.query.email){
			filters['level_1.email'] = request.query.email;
		}

		if(request.query.phone){
			filters['level_1.phone'] = request.query.phone;
		}

		if(request.query._sale_usermember){
			filters['_sale_usermember'] = mongoose.Types.ObjectId(request.query._sale_usermember);
		}

		if(request.query._id){
			filters['_id'] = {$ne: mongoose.Types.ObjectId(request.query._id)};
		}

		if(type == 'totalDup'){
			filters['is_finish'] = {$in: [false,null]};
			SaleContact.find(filters)
			.exec(function(err, contacts) {
				if(err){
					request.log(['error'], err);
					return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
				}

				return reply(contacts.length);
			});
		}
		if(type == 'totalIs'){
			filters['is_finish'] = new Boolean(true);
			SaleContact.find(filters)
			.exec(function(err, contacts) {
				if(err){
					request.log(['error'], err);
					return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
				}
				return reply(contacts.length);
			});
		}
		
	};
}

function getSaleKid(request, reply) {
	User.find({},'_id email')
	.where({roles : { $in : ["sale"] },'saleman.types': {$in: ["kid"]}, 'saleman.active': 1, deletedAt: null})
	.then(function(usersKid) {
		return reply(usersKid);
	})
	.catch(function(err) {
		request.log(['error'], err);
		return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
	});
}

function getSaleWork(request, reply) {
	User.find({},'_id email')
	.where({roles : { $in : ["sale"] },'saleman.types': {$in: ["work"]}, 'saleman.active': 1, deletedAt: null})
	.then(function(usersWork) {
		return reply(usersWork);
	})
	.catch(function(err) {
		request.log(['error'], err);
		return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
	});
}

function getContactFilterDate(type, field){
	return function (request, reply) {
		let startDate = new Date(request.payload.startDate);
		let endDate = new Date(request.payload.endDate);
		let options = {};
		let groups = {};

		/*Khởi tạo option chung*/
		if(type == 'work') {
			options = {createdAt :{ $gt: startDate, $lt: endDate }, type: { $in: ["work", null, ""] }, newly: true };
		} else if(type == 'kid') {
			options = {createdAt :{ $gt: startDate, $lt: endDate }, type: "kid", newly: true };
		}

		/*Khởi tạo resp trả về*/
		let resp = {
			all: []
		};
		let asyncTasks = [];

		/*Check loại đăng ký và trường hợp khong có email nhưng có phone*/
		if(field == 'email'){
			options['email'] = {$nin : ["",null]};
			groups = { _id : "$email", contacts: { $push: "$$ROOT" }, total: { $sum: 1 } };
		}
		else if(field == 'phone'){
			options['email'] = {$in : ["",null]};
			options['phone'] = {$nin : ["",null]};
			groups = { _id : "$phone", contacts: { '$push': "$$ROOT" }, total: { '$sum': 1 } };
		}

		SaleContactTmp.aggregate([
			{$match:  options},
			{$group : groups }
			])
		.allowDiskUse(true)
		.then(function(results){
			resp.all = results;
			return reply(resp);
		})
		.catch(function(err){
			return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
		});
	}
}
