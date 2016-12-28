'use strict';

const Boom = require('boom');
const Joi = require('joi');
const mongoose = require('mongoose');
const Contact = mongoose.model('Contact');
const JWT = require('jsonwebtoken');
const aguid = require('aguid');

exports.index = {
    auth: false,
    handler: function (request, reply) {
        return reply({ status: true, msg: 'It works' });
    },
    description: 'Service status',
    tags: ['api']
}

exports.contact = {
    auth: false,
    handler: function (request, reply) {
        let contact = new Contact(request.payload);
        let promise = contact.save();
        
        promise.then(function (user) {
            //send email 
            let config = request.server.configManager;
            let emailData = {
                "from": config.get('web.email.from'),
                "to": config.get('web.email.to'),
                "subject": "Contact Form",
                "html": "Contact Form",
                "template": {
                    "name": "contact",
                    "context": request.payload
                },
                "text": ""
            };

            let pubsub = request.server.plugins['app-pubsub'].pubsub;
            pubsub.publish('api-sendmail', emailData, function () {
                console.log('message published');
            });
            reply({ status: true, msg: 'Handle Contact Form Submitted' });
        }).catch(function (err) {
            reply(Boom.badRequest(err.message));
        });
    },
    validate: {
        payload: {
            name: Joi.string().required().description('Name'),
            phone: Joi.string().optional().description('Phone'),
            email: Joi.string().email().required().description('Email'),
            message: Joi.string().required().description('Message'),

        }
    },
    description: 'Handle Contact Form Submitted',
    tags: ['api'],
    plugins: {
        'hapi-swagger': {
            responses: { '400': { 'description': 'Bad Request' } },
            payloadType: 'form'
        }
    },
}
