'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Moment = require('moment');
const async = require("async");
const _ = require('lodash');
const Mongoose = require('mongoose');
const SaleContact = Mongoose.model('SaleContact');
const SaleContactTmp = Mongoose.model('SaleContactTmp');
// const ErrorHandler = require(BASE_PATH + '/app/utils/error.js');
// const UserHelper = require(BASE_PATH + '/app/modules/api-user/util/user.js');
// const UploadFile = require(BASE_PATH + '/app/modules/api-upload/util/upload.js');
// const SCHelper = require(BASE_PATH + '/app/modules/admin-salecontact/util/salecontact.js');
// const mdwAuth = require(BASE_PATH + '/app/utils/middleware/auth.js');

module.exports = {
	find: find,
	create: create,
};


function find(){
	return {
		auth: 'jwt',
		pre: [
		{ method: getTotalFilter(), assign: 'totalFilters' },
		],
		handler: function(request, reply) {
			let config = request.server.configManager;
			let page = request.query.page || 1;
			let itemsPerPage = parseInt(request.query.limit) || config.get('web.paging.itemsPerPage');
			let filters = {};

			/*Keyword*/
			if (request.query.keyword && request.query.keyword.length > 0) {
				let re = new RegExp(request.query.keyword, 'i');
				filters.$or = [
				{ 'name': re},
				{ 'email': re},
				{ 'phone': re}
				]
			}

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

			/*Filter newly*/
			if (request.query.newly === 'true')
				filters['newly'] = true;

			/*List contact*/
			SaleContactTmp
			.find(filters)
			.sort({ createdAt: -1, 'email': -1})
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
					totalFilters: request.pre.totalFilters
				};
				return reply(dataRes);
			});
		}
	};
}

function create(){
	return {
		auth: 'jwt',
		pre: [
		],
		handler: function(request, reply) {
			var data = request.payload;

			/*Lưu contact mới*/
			var saleContactTmp = new SaleContactTmp(data);

			let promise = saleContactTmp.save();
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

function getTotalFilter() {
	return function (request, reply) {
		let options = {};
		let results = {};
		
		if(request.query.uid && request.query.uid.length > 0){
			options['_sale_usermember'] = Mongoose.Types.ObjectId(request.query.uid);
		}
		/*Filter newly*/
		if (request.query.newly === 'true')
			options['newly'] = true;

		let listFilters = [
		{type: 'all', options: options},
		{type: 'day', options: options, filter: {'range':{'createdAt': {'gte': Moment().startOf('day'), 'lte': Moment().endOf('day')}}}},
		{type: 'isoWeek', options: options, filter: {'range':{'createdAt': {'gte': Moment().startOf('isoWeek'), 'lte': Moment().endOf('isoWeek')}}}},
		{type: 'month', options: options, filter: {'range':{'createdAt': {'gte': Moment().startOf('month'), 'lte': Moment().endOf('month')}}}},
		];

		if(!request.query.uid){
			async.parallel([
				function(callback){getFT(listFilters[0],function(){callback();});},
				function(callback){getFT(listFilters[1],function(){callback();});},
				function(callback){getFT(listFilters[2],function(){callback();});},
				function(callback){getFT(listFilters[3],function(){callback();});},
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
			SaleContactTmp.search({
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
