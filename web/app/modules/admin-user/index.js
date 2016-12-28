'use strict';

const UserSaleController = require('./controller/usersale.controller.js');

exports.register = function (server, options, next) {
    // server.route({
    //     method: 'GET',
    //     path: '/admin/signin',
    //     config: UserSaleController.login
    // });

    server.route({
        method: 'POST',
        path: '/admin/user',
        config: UserSaleController.create
    });

    server.route({
        method: 'PUT',
        path: '/admin/user/{id}',
        config: UserSaleController.update
    });

    next();
};

exports.register.attributes = {
    name: 'admin-user'
};
