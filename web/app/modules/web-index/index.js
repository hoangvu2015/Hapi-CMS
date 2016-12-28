'use strict';

const IndexController = require('./controller/index.controller.js');

exports.register = function(server, options, next) {
    server.route({
        method: 'GET',
        path: '/',
        config: IndexController.index
    });

    next();
};

exports.register.attributes = {
    name: 'web-index'
};
