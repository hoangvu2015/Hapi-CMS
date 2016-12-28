'use strict';

const Boom = require('boom');
const Joi = require('joi');
const mongoose = require('mongoose');
const SaleContactTmp = mongoose.model('SaleContactTmp');
const SaleContact = mongoose.model('SaleContact');
const _ = require('lodash');

module.exports = {
    create: create
};

function create(){
    return {
        // cors: {
        //     origin: ['https://dev.antoree.com']   
        // },
        handler: function(request, reply) {
            let regContact = request.payload;

            if(!request.payload.phone && !request.payload.email)
                return reply(Boom.badRequest('Lỗi không có cả email và phone'));

            /*Nếu cả email và phone khác null thì check trùng 'hoặc'*/
            if(request.payload.phone != '' && request.payload.email != ''){
                checkDup({$or:[{'level_1.email': request.payload.email}, {'level_1.phone': request.payload.phone}]});
            }
            /*nếu chỉ có email thì chỉ check trùng email*/
            else if(request.payload.email && request.payload.email != ''){
                checkDup({'level_1.email': request.payload.email});
            }
            /*nếu chỉ có phone thì chỉ check trùng phone*/
            else if(request.payload.phone && request.payload.phone != ''){
                checkDup({'level_1.phone': request.payload.phone});
            }

            function checkDup(options){
                SaleContact.findOne(options)
                .then(function(result){
                    if(result){
                        result.dup = Boolean(1);
                        result.save();
                        regContact.newly = Boolean(0);
                    }
                    saveReg();
                }).catch(function (err) {
                    return reply(Boom.badRequest(err.message));
                });
            }

            function saveReg(){
                let reg = new SaleContactTmp(regContact);
                let promise = reg.save();

                promise.then(function (result) {
                    return reply({ success: true, data: result, msg: 'Handle SaleContactTmp Form Submitted' });
                }).catch(function (err) {
                    return reply(Boom.badRequest(err.message));
                });
            }
        },
        validate: {
            payload: {
                name: Joi.any().optional().description('Name'),
                email: Joi.string().optional().email().description('Email'),
                phone: Joi.any().optional().description('Phone'),
                skype: Joi.any().optional().description('skype'),
                name_kid: Joi.any().optional().description('name_kid'),
                age: Joi.any().optional().description('age'),
                career: Joi.any().optional().description('career'),
                source_contact: Joi.any().optional().description('source_contact'),
                learn_info: Joi.any().optional().description('learn_info'),
                teacher_request: Joi.any().optional().description('teacher_request'),
                
                olduser_id: Joi.any().optional().description('olduser_id'),
                oldteacher_id: Joi.any().optional().description('oldteacher_id'),
                type: Joi.any().optional().description('type'),
                utm_code: {
                    utm_source: Joi.any().optional().description('utm_source'),
                    utm_campaign: Joi.any().optional().description('utm_campaign'),
                    refererhostname: Joi.any().optional().description('refererhostname'),
                },
                info_client: {
                    ip: Joi.any().optional().description('ip'),
                    browser: Joi.any().optional().description('browser'),
                    device: Joi.any().optional().description('device'),
                },
                createdAt: Joi.any().optional().description('createdAt'),
                updatedAt: Joi.any().optional().description('updatedAt'),
            }
        },
        description: 'Handle Create SaleContactTmp Form Submitted',
        tags: ['api'],
        plugins: {
            'hapi-swagger': {
                responses: { '400': { 'description': 'Bad Request' } },
                payloadType: 'form'
            }
        }
    };
}

