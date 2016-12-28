'use strict';

const cookie = require('cookie');
const Bcrypt = require('bcrypt');
// const pagination = require('pagination');
const _ = require('lodash');
const Boom = require('boom');
// const util = require('util');
const Joi = require('joi');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const ErrorHandler = require(BASE_PATH + '/app/utils/error.js');
// const JWT = require('jsonwebtoken');
// const Crypto = require('crypto');
const UserEmail = require('../util/user-email');
const Promise = require("bluebird");

module.exports = {
    createUser: createUser,
    updateUser: updateUser,

    /*middleware*/
    getAuthUser:getAuthUser,
    getById: getById,
    getUserByEmail: getUserByEmail,
    getUserSaleActive: getUserSaleActive,
    
    /*helper*/
    hpgetByUserId: hpgetByUserId
};

function createUser(userData, userByEmail, callback){

    let resp = {
        userNew: {},
        errors : []
    };

    /*Check Nếu user đã bị deleted thì update và xóa field deleted ngược lại thì email bị trùng*/
    if (userByEmail) {
        if(userByEmail.deletedAt){
            delete userByEmail.deletedAt;
            return updateUser(userData, userByEmail, function(err, userResp){
                if(err)
                    return callback(err,null);
                /*unset trường deleteAt của user bị deleted*/
                return restoreUserDeleted(userResp._id).then(function(resp){
                    callback(null, resp);
                }).catch(function(err){
                    callback(err, null);
                });
            });
        }else{
            return callback('Email already exists.',null);
        }
    }

    /**/
    if (userData.password != userData.cfpassword) {
        return callback('Passwords did not match.',null);
    }
    delete userData.cfpassword;

    let user = new User(userData);

    user.provider = 'local';

    user.hashPassword(userData.password, function(err, hash) {
        user.password = hash;
        user.activeToken = '';

        const promise = user.save();

        promise.then(user => {
            user = user.toObject();
            delete user.password;

            /*@TODOsend email welcome here*/
            resp.userNew = user;
            return callback(null,user);
        }).catch(err => {
            return callback(err,null);
        });
    });
}

function updateUser(userData, userOld, callback){

    let user = userOld;

    /*Checks password có hay không khi push lên*/
    if(!userData.password)
        delete userData.password;
    else if(userData.password !== userData.cfpassword) 
        callback('Confirm new password does not match',null);
    delete userData.cfpassword;

    /*Mở rộng và save User*/
    user = _.extend(user, userData);
    let saveUser = function(user){
        let promise = user.save();
        promise.then(function(user) {
            callback(null, user);
        }).catch(function(err) {
            callback(ErrorHandler.getErrorMessage(err),null);
        });
    };

    if (userData.password) {
        user.hashPassword(userData.password, function(err, hash) {
            user.password = hash;
            saveUser(user);
        });
    }
    else {
        saveUser(user);
    }
}

/******************************************************************
Middleware User
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

function getUserSaleActive(request, reply) {
    User.find({roles: {$in:['sale']}, deletedAt: null, status: new Boolean(true), 'saleman.active': new Boolean(true)},'_id name email')
    .exec(function(err, users) {
        if (err) {
            request.log(['error'], err);
        }
        
        return reply(users);
    })
}

/**********************************************************
HELPER USER
**********************************************************/
/*Restore user đã bị deleted*/
function restoreUserDeleted(userId){
    return new Promise(function(resolve, reject){
        User.findOne({_id: userId}).exec(function(err, doc){
            if(err) return reject(err);
            doc.deletedAt = undefined;
            doc.save().then(function(doc1){
                return resolve(doc1);
            }).catch(function(err1){
                if(err) return reject(err);
            });
        });
    });
}

function hpgetByUserId(id) {
    id = mongoose.Types.ObjectId(id);

    return new Promise(function(resolve, reject){
        User.findOne({_id: id}, '_id name email')
        .exec(function(err, result){
            if(err) return reject(err);
            return resolve(result);
        });
    });
}


