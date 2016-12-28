'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Moment = require('moment');
const _ = require('lodash');
const ErrorHandler = require(BASE_PATH + '/app/utils/error.js');
const Mongoose = require('mongoose');
const Log = Mongoose.model('Log');

module.exports = {
	find: find,
	create: create,
	getContactLogById: getContactLogById
};

function find(){
	return {
		auth: 'jwt',
		handler: function(request, reply) {
			let filters = {};

			Log
			.find(filters)
			.exec(function(err, resp) {
				reply(resp);
			});
		}
	};
}

function create(){
	return {
		auth: 'jwt',
		handler: function(request, reply) {
			var data = request.payload;
			var log = new Log(data);
			let promise = log.save();

			promise
			.then(function(resp) {
				// console.log('xxx', resp);
				return reply(resp);
			})
			.catch(function(err) {
				reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
			});
		},
		validate: {
			payload: {
				_id_auth: Joi.string().description('MongoID'),
				module: {
					name: Joi.string().required(),
					type: Joi.string().required(),
					action: Joi.any().optional(),
					desc: Joi.any().optional(),
					url: Joi.any().optional(),
				},
				client: {
					ip: Joi.any().optional(),
					browser: Joi.any().optional(),
					os: Joi.any().optional(),
					device: Joi.any().optional(),
				},
				payload : Joi.object().required()
			}
		},
		tags: ['api'],
		description: 'Created log'
	};
}

function getContactLogById(){
	return {
		auth: 'jwt',
		handler: function(request, reply) {
			let id = request.params.id || request.payload.id;
			let filters = {};
				filters['content._id_contact'] = id;
				Log.find(filters)
				.populate({
					path: 'content._id_contact',
					model: 'SaleContact',
				})
				.populate({
					path: 'content._id_user_dest',
					model: 'User',
					select: '_id name email'
				})
				.populate({
					path: 'content._id_user_src',
					model: 'User',
					select: '_id name email'
				})
				.sort({'createdAt': -1})
				.exec(function(err, data){
					reply({items: data});
				});
			}
		};
	}