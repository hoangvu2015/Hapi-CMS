'use strict';

const AuthController = require('./controller/auth.controller.js');

exports.register = function (server, options, next) {
    server.route({
        method: 'GET',
        path: '/admin/signin',
        config: AuthController.login
    });

    next();
};

exports.register.attributes = {
    name: 'admin-auth'
};
