'use strict';

const SaleContactController = require('./controller/salecontact.controller.js');

exports.register = function (server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];
    server.route({
        method: 'POST',
        path: '/api/salecontact',
        config: SaleContactController.create
    });

    next();
};

exports.register.attributes = {
    name: 'api-salecontact'
};
