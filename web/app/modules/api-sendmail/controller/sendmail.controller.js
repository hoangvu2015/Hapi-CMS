'use strict';

const Boom = require('boom');
const Joi = require('joi');


exports.index = {
    auth: false,
    handler: function (request, reply) {
       return reply({ status: true, msg: 'It works'});
       
    },
    description: 'Service status',
    tags: ['api']
}

exports.sendmail = {
    handler: function (request, reply) {
        let emailData = request.payload;
        //sendMail
        let emailHelper = require('../util/mail')(request.server);
        emailHelper.sendMail(emailData, function (error, info) {
            if (error) {
                reply(Boom.badRequest(error));
            }
            reply({ status: true, msg: 'Send email success' });
        });
    },

    validate: {
        payload: {
            from: { name: Joi.string().required(), address: Joi.string().email().required() },
            to: Joi.array().items({ name: Joi.string(), address: Joi.string().email().required() }),
            cc: Joi.array().items({ name: Joi.string(), address: Joi.string().email() }),
            //bcc: [{ name: Joi.string().required(), address: Joi.string().email().required() }],
            //reply: [{ name: Joi.string().required(), address: Joi.string().email().required() }],
            subject: Joi.string().required(),
            html: Joi.any(),
            template: {name: Joi.any().optional(), context: Joi.any().optional()}  ,
            text: Joi.any().optional()
        }
    },
    description: 'Send email',
    tags: ['api'],
    plugins: {
        'hapi-swagger': {
            responses: { '400': { 'description': 'Bad Request' } },
        }
    },
};

