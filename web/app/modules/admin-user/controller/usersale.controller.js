'use strict';
// const cookie = require('cookie');
// const Bcrypt = require('bcrypt');
// const pagination = require('pagination');
// const _ = require('lodash');
const Boom = require('boom');
// const util = require('util');
const Joi = require('joi');
// const mongoose = require('mongoose');
// const User = mongoose.model('User');
// const ErrorHandler = require(BASE_PATH + '/app/utils/error.js');
// const JWT = require('jsonwebtoken');
// const Crypto = require('crypto');
// const AuthController = require(BASE_PATH + '/app/modules/api-user/controller/auth.controller.js');
const UserHelper = require(BASE_PATH + '/app/modules/api-user/util/user.js');
const mdwAuth = require(BASE_PATH + '/app/utils/middleware/auth.js');

module.exports = {
	// login: login,
	create: create,
	update: update
};

// function login(){
// 	return {
// 		auth: {
// 			strategy: 'jwt',
// 			mode: 'try',
// 			scope: ['super-admin', 'admin']
// 		},
// 		handler: function(request, reply){
// 			if (request.auth.isAuthenticated) {
// 				return reply.redirect('/');
// 			}
// 			// console.log('testpppp',request.auth.isAuthenticated);
// 			reply.view('admin-user/view/signin', null, { layout: 'admin/layout-admin-login' });
// 		}
// 	};
// }

function create(){
	return {
		pre: [
		{ method: mdwAuth.mdwSaleManager(), assign: 'auth' },
		{ method: UserHelper.getUserByEmail, assign: 'userByEmail' }
		],
		handler: function(request, reply) {
			UserHelper.createUser(request.payload, request.pre.userByEmail, function(err,resp){
				if(err) 
					return reply(Boom.badRequest(err));
				return reply(resp);
			});
		},
		validate: {
			payload: {
				name: Joi.string().required().description('Name'),
				email: Joi.string().email().required().description('Email'),
				password: Joi.string().description('Password'),
				cfpassword: Joi.string(),
				status: Joi.boolean(),
				roles: Joi.any().description('Roles'),
				saleman: Joi.object()
			}
		},
		tags: ['api'],
		description: 'Create user111'
	};
}


function update(){
    return {
        auth: 'jwt',
        pre: [
        { method: mdwAuth.mdwSaleManager(), assign: 'auth' },
        { method: UserHelper.getById, assign: 'user' }
        ],
        handler: function(request, reply) {
            UserHelper.updateUser(request.payload, request.pre.user, function(err,resp){
				if(err) 
					return reply(Boom.badRequest(err));
				return reply(resp);
			});
        },
        validate: {
            payload: {
                _id: Joi.string().description('MongoID'),
                name: Joi.string().required().description('Name'),
                email: Joi.string().email().required().description('Email'),
                password: Joi.string().description('Password'),
                cfpassword: Joi.string(),
                status: Joi.boolean(),
                roles: Joi.any().description('Roles'),
                saleman: Joi.object()
            }
        }
    };
}