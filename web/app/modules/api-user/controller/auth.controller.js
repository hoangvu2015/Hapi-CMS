'use strict';

const cookie = require('cookie');
const Bcrypt = require('bcrypt');
const pagination = require('pagination');
const _ = require('lodash');
const Boom = require('boom');
const util = require('util');
const Joi = require('joi');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const ErrorHandler = require(BASE_PATH + '/app/utils/error.js');
const JWT = require('jsonwebtoken');
const Crypto = require('crypto');
const UserEmail = require('../util/user-email');
const mdwAuth = require(BASE_PATH + '/app/utils/middleware/auth.js');

module.exports = {
    find: find,
    findOne: findOne,
    create: create,
    update: update,
    destroy: destroy,
    changeStatus: changeStatus,
    login: login,
    logout: logout,
    verifyEmail: verifyEmail,
    active: active,
    facebookLogin: facebookLogin,
    googleLogin: googleLogin,
    fogotPassword: fogotPassword,
    resetPassword: resetPassword,
    changePassword: changePassword,
    profile: profile,
    getUserByEmail: getUserByEmail
};

function find(){
    return {
        auth: 'jwt',
        pre: [
        { method: mdwAuth.mdwSaleManager(), assign: 'auth' }
        ],
        handler: function(request, reply) {
            let config = request.server.configManager;
            let page = request.query.page || 1;
            let itemsPerPage = parseInt(request.query.limit) || config.get('web.paging.itemsPerPage');
            let numberVisiblePages = config.get('web.paging.numberVisiblePages');
            let filters = {};

            // Chọn user còn hoạt động
            filters.deletedAt = {$eq: undefined};

            // Loại bỏ user chỉ định
            if(request.query.uid){
                filters._id = {$ne: request.query.uid};
            }

            // Ngày tạo
            if(request.query.createdAt){
                filters.created_at = {$eq: request.query.createdat};
            }

            // Từ khóa
            if (request.query.keyword && request.query.keyword.length > 0) {
                let re = new RegExp(request.query.keyword, 'i');
                filters.$or = [
                { name: re},
                { email: re}
                ]
            }

            // Trạng thái kích hoạt
            if(request.query.status){
                filters.status = {$eq: request.query.status};
            }

            // Quyền
            if(request.query.role){
                filters.roles = {$in: [request.query.role]};
            }

            User
            .find(filters)
            .sort('-createdAt')
            .paginate(page, itemsPerPage, function(err, items, total) {
                if (err) {
                    request.log(['error', 'list', 'user'], err);
                    reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                }
                let totalPage = Math.ceil(total / itemsPerPage);
                let dataRes = { status: 1, totalItems: total, totalPage: totalPage, currentPage: page, itemsPerPage: itemsPerPage, numberVisiblePages: numberVisiblePages, items: items };
                reply(dataRes);
            });
        },
        tags: ['api'],
        description: 'Get all users'
    };
}

function findOne(){
    return {
        auth: 'jwt',
        tags: ['api'],
        description: 'Get user',
        pre: [
        { method: getById, assign: 'user' }
        ],
        handler: function(request, reply) {
            let user = request.pre.user;
            if (user) {
                return reply(user);
            } else {
                reply(Boom.notFound('User is not found'));
            }
        }
    };
}

function create(){
    return {
        pre: [
        { method: getUserByEmail, assign: 'userByEmail' }
        ],
        handler: function(request, reply) {
            if (request.pre.userByEmail) {
                return reply(Boom.badRequest('Email already exists.'));
            }
            if (request.payload.password != request.payload.cfpassword) {
                return reply(Boom.badRequest('Passwords did not match.'));
            }
            delete request.payload.cfpassword;

            let user = new User(request.payload);

            user.provider = 'local';

            user.hashPassword(request.payload.password, function(err, hash) {
                user.password = hash;
                user.activeToken = '';

                const promise = user.save();

                promise.then(user => {
                    user = user.toObject();
                    delete user.password;

                    //@TODOsend email welcome here
                    return reply(user);
                }).catch(err => {
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });
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
        description: 'Create user'
    };
}

function update(){
    return {
        auth: 'jwt',
        pre: [
        { method: getById, assign: 'user' }
        ],
        handler: function(request, reply) {
            let user = request.pre.user;
            if(!request.payload.password){
                delete request.payload.password;
            }else if(request.payload.password !== request.payload.cfpassword) {
                return reply(Boom.badRequest('Confirm new password does not match'));
            }
            delete request.payload.cfpassword;

            user = _.extend(user, request.payload);

            let saveUser = function(user){
                let promise = user.save();
                promise.then(function(user) {
                    reply(user);
                }).catch(function(err) {
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });
            };

            if (request.payload.password) {
                user.hashPassword(request.payload.password, function(err, hash) {
                    user.password = hash;
                    saveUser(user);
                });
            }
            else {
                saveUser(user);
            }
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

function destroy(){
    return {
        auth: 'jwt',
        handler: function(request, reply) {
            User.findOne({_id: request.params.id}).exec(function(err, doc){
                if(err) return reply(Boom.forbidden("403"));
                doc.deletedAt = new Date();
                doc.save().then(function(doc1){
                    return reply({success:true});
                }).catch(function(err1){
                    if(err) return reply(Boom.forbidden("403"));
                });
            });
        }
    };
}

function changeStatus(){
    return {
        handler: function(request, reply) {
            User.findOne({_id: request.params.id}).exec(function(err, doc){
                if(err) return reply(Boom.forbidden("403"));
                doc.status = request.params.status;
                doc.save().then(function(doc1){
                    return reply({success:true});
                }).catch(function(err1){
                    if(err) return reply(Boom.forbidden("403"));
                });
            });
        }
    };
}

function login(){
    return {
        handler: function (request, reply) {
            let cookieOptions = request.server.configManager.get('web.cookieOptions');
            let {email, password} = request.payload;
            let role = request.server.configManager.get('web.allRoles');
            let promise = User.findOne({email: email, deletedAt: null}).exec();
            
            //role la tac ca cac role co dc cua he thong.
            promise.then(user => {
                if (!user || (user && user.status !== true)) {
                    return reply(Boom.unauthorized('Incorrect email or email not exits or email not active'));
                }

                if (role && _.intersection(user.roles, role).length === 0) {
                    return reply(Boom.unauthorized('Incorrect role'));
                }

                user.compare(password, function (err, result) {
                    if (err || !result) {
                        request.log(['error', 'login'], err);
                        return reply(Boom.unauthorized('Incorrect password'));
                    }

                    if (result) {
                        var session = {
                            valid: true,
                            uid : user._id.toString(),
                            id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            scope: user.roles,
                            exp: new Date().getTime() + 30 * 60 * 1000,
                            // Extend
                            saleman: user.saleman
                        };

                        const redisClient = request.server.redis;
                        const secret = request.server.configManager.get('web.jwt.secret');
                        redisClient.set(session.id, JSON.stringify(session));
                        var token = JWT.sign(session, secret);
                        console.log(token,cookieOptions);
                        reply({ token: token })
                        .header('Authorization', token)
                        .state('token', token, cookieOptions);
                    }
                });
            })
            .catch(err => {
                return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
            });
        },
        validate: {
            payload: {
                email: Joi.string().email().required().description('Email'),
                password: Joi.string().required().description('Password'),
                role: Joi.any().description('Scope')
            }
        },
        tags: ['api'],
        description: 'User Login'
    };
}

function logout(){
    return {
        auth: 'jwt',
        handler: function (request, reply) {
            const redisClient = request.server.redis;
            const sessionId = request.auth.credentials.id;
            redisClient.get(sessionId, function (err, result) {
                if (err) {
                    request.log(['error', 'redis', 'lgout'], err);
                }

                let session = result ? JSON.parse(result) : {};
                if(session.id){
                    session.valid = false;
                    session.ended = new Date().getTime();
                    redisClient.set(session.id, JSON.stringify(session));
                }

            });
            let cookieOptions = request.server.configManager.get('web.cookieOptions');
            reply({ status: true })
            .header("Authorization", '')
            .unstate('token', cookieOptions);
        }
    };
}

function verifyEmail(){
    return {
        pre: [
        { method: getUserByEmail, assign: 'userByEmail' }
        ],
        validate: {
            payload: {
                email: Joi.string().email().required().description('Email')
            }
        },
        handler: function (request, reply) {
            if (request.pre.userByEmail) {
                return reply({ status: 0, message: 'Email is exist' });
            }
            reply({ status: 1, message: 'Email is not exist' });
        },
        tags: ['api'],
        description: 'Verify Email Exist',
        plugins: {
            'hapi-swagger': {
                responses: { '400': { 'description': 'Bad Request' } },
                payloadType: 'form'
            }
        }
    };
}

function active(){
    return {
        validate: {
            query: {
                token: Joi.string().required().description('Token'),
            }
        },
        handler: function (request, reply) {
            let token = request.query.token;
            let promise = User.findOne({ activeToken: token }).exec();
            promise.then(user => {
                if (!user) {
                    return reply(Boom.badRequest('Invalid Token'));
                }
                user.activeToken = '';
                user.status = 1;
                user.save().then(user => {
                    reply({ status: 1 });
                }).catch(err => {
                    request.log(['error', 'active'], err);
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });
            }).catch(err => {
                request.log(['error', 'active'], err);
                return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
            });
        },
        tags: ['api'],
        description: 'Active User',
        plugins: {
            'hapi-swagger': {
                responses: { '400': { 'description': 'Bad Request' } },
                payloadType: 'form'
            }
        }
    };
}

function facebookLogin(){
    return {
        handler: function (request, reply) {
            reply();
        }
    };
}

function googleLogin(){
    return {
        handler: function (request, reply) {
            reply();
        }
    };
}

function fogotPassword(){
    return {
        handler: function (request, reply) {
            const email = request.payload.email;
            const promise = User.findOne({ email: email }, '-password').exec();
            promise.then(user => {
                if (!user) {
                    return reply(Boom.notFound('Email is not exist'));
                }
                const token = Crypto.randomBytes(20).toString('hex');
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 48 * 3600000; // 48 hours
                let promise = user.save();
                promise.then(user => {
                    //@TODO send email to user
                    //send welcome and activation email to user
                    UserEmail.sendForgotPasswordEmail(request, {name: user.name, address: user.email}, user);
                    return reply({ status: 1 });
                }).catch(err => {
                    return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                });

                //send email

            }).catch(err => {
                return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
            });
        },
        validate: {
            payload: {
                email: Joi.string().email().required().description('Email')
            }
        },
        tags: ['api'],
        description: 'Forgot Password',
        plugins: {
            'hapi-swagger': {
                responses: { '400': { 'description': 'Bad Request' } },
                payloadType: 'form'
            }
        }
    };
}

function resetPassword(){
    return {
        handler: function (request, reply) {
            let {newPassword, confirmNewPassword} = request.payload;
            if (newPassword != confirmNewPassword) {
                return reply(Boom.badRequest('Confirm new password does not match'));
            }
            let token = request.query.token;
            if (!token) {
                return reply(Boom.badRequest('Token is empty'));
            }
            let promise = User.findOne({ resetPasswordToken: token }).exec();
            promise.then(user => {
                if (!user) {
                    reply(Boom.badRequest('Token is incorrect'));
                }
                user.resetPasswordToken = '';
                user.resetPasswordExpires = null;
                user.hashPassword(newPassword, function (err, hash) {
                    user.password = hash;
                    //save changed information's user
                    user.save().then(user => {
                        if (user) {
                            reply({ status: 1, message: 'Password changed successful.' });
                        }
                    }).catch(err => {
                        request.log(['error', 'reset'], err);
                        return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                    });
                });
            }).catch(err => {
                return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
            });

        },
        description: 'Reset Password',
        tags: ['api'],
        plugins: {
            'hapi-swagger': {
                responses: { '400': { 'description': 'Bad Request' } },
                payloadType: 'form'
            }
        },
        validate: {
            payload: {
                newPassword: Joi.string().required().description('New Password'),
                confirmNewPassword: Joi.string().required().description('Confirm Password')
            },
            query: {
                token: Joi.string().required().description('Token'),
            }
        }
    };
}

function changePassword(){
    return {
        auth: 'jwt',
        pre: [
        { method: getAuthUser, assign: 'user' }
        ],
        handler: function (request, reply) {
            let user = request.pre.user;
            if (!user) {
                return reply(Boom.notFound('User is not found'));
            }
            let {currentPassword, newPassword, confirmNewPassword} = request.payload;
            //validate new password and confirm password
            console.log(request.payload,user);
            if (newPassword != confirmNewPassword) {
                return reply(Boom.badRequest('Confirm new password does not match'));
            }
            //validate current passwordauthenticate
            user.compare(currentPassword, function (err, result) {
                if (err) {
                    request.log(['error', 'changepassword'], err);
                }
                if (!result) {
                    return reply(Boom.badRequest('Incorrect Password'));
                }
                user.hashPassword(newPassword, function (err, hash) {
                    user.password = hash;
                    //save changed information's user
                    user.save().then(user => {
                        if (user) {
                            reply({ status: 1, message: 'Password changed successful.' });
                        }
                    }).catch(err => {
                        request.log(['error', 'changepassword'], err);
                        return reply(Boom.badRequest(ErrorHandler.getErrorMessage(err)));
                    });
                });
            });
        },
        description: 'Change Password',
        tags: ['api'],
        plugins: {
            'hapi-swagger': {
                responses: { '400': { 'description': 'Bad Request' } },
                payloadType: 'form'
            }
        },
        validate: {
            payload: {
                currentPassword: Joi.string().required().description('Current Password'),
                newPassword: Joi.string().required().description('New Password'),
                confirmNewPassword: Joi.string().required().description('Confirm Password')
            }
        }
    };
}

function profile(){
    return {
        pre: [
        { method: getAuthUser, assign: 'user' }
        ],
        auth: 'jwt',
        handler: function (request, reply) {
            const user = request.pre.user;
            if (user) {
                reply(user);
            }
            reply(Boom.unauthorized('User is not found'));
        }
    };
}
/******************************************************************
Middleware
*******************************************************************/
function getAuthUser(request, reply) {
    let id = request.auth.credentials.id;

    User.findOne({ _id: id }, function (err, user) {
        if (err) {
            request.log(['error'], err);
        }
        return reply(user);
    });
}

function getById(request, reply) {
    const id = request.params.id || request.payload.id;
    let promise = User.findOne({ '_id': id });

    promise.then(function(user) {
        return reply(user);
    }).catch(function(err) {
        request.log(['error'], err);
        return reply.continue();
    })
}

function getUserByEmail(request, reply) {
    const email = request.payload.email;

    User.findOne({email: email}, function(err, user) {
        if (err) {
            request.log(['error'], err);
        }
        return reply(user);
    });
}