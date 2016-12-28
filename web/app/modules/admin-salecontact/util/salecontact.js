'use strict';

const _ = require('lodash');
const Boom = require('boom');
const mongoose = require('mongoose');
const SaleContact = mongoose.model('SaleContact');
const ErrorHandler = require(BASE_PATH + '/app/utils/error.js');
const Promise = require("bluebird");
const async = require("async");

module.exports = {
    /*helper*/
    hpgetByContactId: hpgetByContactId,
    hpformatContact: hpformatContact,
    hpprocessContactOldIsSaleman: hpprocessContactOldIsSaleman,
    getById: getById,
};

/**********************************************************
MIDDLEWARE CONTACT
**********************************************************/
function getById(request, reply) {
    let _id = request.params._id || request.payload._id;
    let promise = SaleContact.findOne({ '_id': _id });

    promise
    .then(function(resp) {
        return reply(resp);
    })
    .catch(function(err) {
        request.log(['error'], err);
        return reply.continue();
    });
}

/**********************************************************
HELPER CONTACT
**********************************************************/

function hpgetByContactId(id) {
    id = mongoose.Types.ObjectId(id);

    return new Promise(function(resolve, reject){
        SaleContact
        .findOne({_id: id})
        .populate('_sale_usermember')
        .populate('_sale_userconvert')
        .exec(function(err, result){
            if(err) return reject(err);
            return resolve(result);
        });
    });
}

function hpformatContact(items) {
    return new Promise(function(resolve, reject){
        let tmp = [];
        /*Array to hold async tasks*/
        let asyncTasks = [];

        for (let key in items){
            if (items.hasOwnProperty(key)) {
                asyncTasks.push(function(callback){

                    let item = items[key].toObject();
                    item.format = {};
                    if(item.level_1.email){
                        SaleContact.find({
                            'level_1.email': item.level_1.email,
                            'is_finish': false
                        })
                        .exec(function(err, result){
                            if(result){
                                item.format.dupItems = result;
                            }
                            tmp.push(item);
                            callback();
                        });
                    }else if(item.level_1.phone){
                        SaleContact.find({
                            'level_1.phone': item.level_1.phone,
                            'is_finish': false
                        })
                        .exec(function(err, result){
                            if(result){
                                item.format.dupItems = result;
                            }
                            tmp.push(item);
                            callback();
                        });
                    } else{
                        tmp.push(item);
                        callback();
                    }
                });
            }
        }

        async.parallel(asyncTasks,function(err, resultss) {
            if(err) return reject(err);
            return resolve(tmp);
        });
    });
}

function hpprocessContactOldIsSaleman(contacts, type){

    return new Promise(function(resolve, reject){
        let result = {};
        result.oldContacts = [];
        result.contacts = [];

        /*Array to hold async tasks*/
        let asyncTasks = [];

        for (let key in contacts){
            if (contacts.hasOwnProperty(key)) {
                asyncTasks.push(function(callback){
                    let item = contacts[key];//.toObject();

                    SaleContact.findOne({'level_1.email': contacts[key]._id, type: type, _sale_usermember:{$ne : null} })
                    .then(function(contact) {
                        if(contact){
                            let tmp = {
                                email_contact: contact.level_1.email,
                                _sale_usermember: contact._sale_usermember,
                                type_contact: contact.type,
                            };
                            result.oldContacts.push(tmp);
                            item._oldSaleman = contact._sale_usermember;
                        }
                        result.contacts.push(item);

                        callback();
                    })
                    .catch(function(err) {
                        result.contacts.push(contacts[key]);
                        callback();
                    });
                });
            }
        }

        async.parallel(asyncTasks,function(err, resp) {
            console.log('hhhffgfg',err);
            if(err) return reject(err);
            console.log('sdfsdf');
            return resolve(result);
        });
    });
}


