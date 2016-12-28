'use strict';

const Boom = require('boom');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const JWT = require('jsonwebtoken');
const mkdirp = require('mkdirp');
const UploadFile = require(BASE_PATH + '/app/modules/api-upload/util/upload.js');

module.exports = {
    index: index,
    uploadFile: uploadFile,
};

function index(){
    return {
        auth: false,
        handler: function (request, reply) {
            return reply({ status: true, msg: 'It works' });
        },
        description: 'Service status',
        tags: ['api']
    };
}

function uploadFile(){
    return {
        auth: false,
        handler: function (request, reply) {
            UploadFile.uploadFile(request).then(function(resp){
                return reply(resp);
            }).catch(function(err){
                return reply(err);
            });
        },
        validate: {
            payload: {
                file: Joi.any().required().meta({ swaggerType: 'file' }).description('File'),
                type: Joi.string().description('Type'),
                prefix: Joi.string().description('prefix')
            }
        },
        payload: {
            maxBytes: 10048576,
            parse: true,
            allow: ['application/json', 'image/jpeg', 'multipart/form-data','application/pdf'],
            output: 'stream'
        },
        description: 'Handle Upload File',
        tags: ['api'],
        plugins: {
            'hapi-swagger': {
                responses: { '400': { 'description': 'Bad Request' } },
                payloadType: 'form'
            }
        },
    };
}
