'use strict';

const ContactController = require('./controller/contact.controller.js');

exports.register = function (server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];
    
    server.route({
        method: 'GET',
        path: '/api/contact',
        
        config: ContactController.index
    });
    server.route({
        method: 'POST',
        path: '/api/contact',
        config: ContactController.contact
    });
    
    next();
};

exports.register.attributes = {
    name: 'api-contact'
};
