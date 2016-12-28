'use strict';

const Boom = require('boom');
const util = require('util');
const Joi = require('joi');
const _ = require('lodash');
const ErrorHandler = require(BASE_PATH + '/app/utils/error.js');
const Moment = require('moment');
// const async = require("async");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const SaleContact = mongoose.model('SaleContact');

module.exports = {
	find 			: find,
	listSaleman 	: listSaleman
};

function find(){
	return {
		auth: 'jwt',
		handler: function (request, reply){
			reply({});
		}
	};
}

function listSaleman(){
	return {
		pre: [
		{ method:getSaleman(), assign:'listSaleman'},
		{ method:getAllContact(), assign:'allContact'},
		],
		auth: 'jwt',
		handler: function (request, reply){
			let listSaleman = request.pre.listSaleman;
			listSaleman.contacts = request.pre.allContact;
			/*Xét ngày khi có filter theo ngày*/
			if(request.query.filterDay){
				var startDate 	= Moment().startOf(request.query.filterDay);
				var endDate 	= Moment().endOf(request.query.filterDay);
			}

			for (var i = 0; i < listSaleman.items.length; i++) {
				/*Xử lý cho từng saleman*/
				listSaleman.items[i] = listSaleman.items[i].toObject();
				listSaleman.items[i].revenue = 0;
				listSaleman.items[i].totalContact = 0;
				listSaleman.items[i].totalFinish = 0;

				for (var j = 0; j < listSaleman.contacts.length; j++) {
					/*Xử lý cho từng contact trước khi lặp history (Tính tổng contact của saleman)*/
					String(listSaleman.contacts[j]._sale_usermember) == String(listSaleman.items[i]._id)
					? listSaleman.items[i].totalContact += 1 : null;

					for (var z = 0; z < listSaleman.contacts[j].level_8.history.length; z++) {
						/*Xử lý cho từng history ở level_8 trong contact (tính doanh thu từng saleman)*/
						/**Khởi tạo biến điều kiện**/
						let need = String(listSaleman.contacts[j].level_8.history[z]._sale_usermember) == String(listSaleman.items[i]._id) 
						&& listSaleman.contacts[j].level_8.history[z].is_received_money == true;
						
						/**Xét điều kiện**/
						if (startDate && endDate){
							let needDate = (new Date(listSaleman.contacts[j].level_8.history[z].createdAt) > new Date(startDate)
								&& new Date(listSaleman.contacts[j].level_8.history[z].createdAt) < new Date(endDate));
							need = (startDate && endDate) ? (need && needDate) : need;
						}

						if(request.query.type){
							let needType = listSaleman.contacts[j].level_8.history[z].type == request.query.type;
							need = request.query.type ? (need && needType) : need;
						}
						/**Tính doanh thu và tỉ lệ convert**/
						need ? (listSaleman.items[i].revenue += parseInt(listSaleman.contacts[j].level_8.history[z].money_finish) || 0) : null;
						need ? listSaleman.items[i].totalFinish += 1 : null;
					}
				}
			}

			return reply(listSaleman);
		}
	};
}

/******************************************************************
Middleware
*******************************************************************/
function getSaleman(){
	return function(request, reply){
		
		let optionsUser = {
			deletedAt: null,
			roles: {$in: ['sale']},
			'saleman.active':new Boolean(true)
		};
		let optionsContact = {};

		/*Filter kid/work*/
		if(request.query.type){
			optionsUser['saleman.types'] = {$in:[new String(request.query.type)]};
		}

		User.find(optionsUser, '_id name email')
		.sort({created_at: -1})
		.exec(function(err, docs){
			if (err) {
				request.log(['error', 'list', 'user'], err);
				reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
			}

			let dataRes = { 
				items: docs 
			};

			return reply(dataRes);

		});
	}
}

function getAllContact(){
	return function(request, reply){
		SaleContact.find()
		.lean()
		.exec(function(err, contacts) {
			return reply(contacts);
		});
	}
}