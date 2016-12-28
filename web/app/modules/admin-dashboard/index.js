'use strict';

const DashboardController = require('./controller/dashboard.controller.js');

exports.register = function(server, options, next) {
    server.route({
        method: 'GET',
        path: '/admin',
        config: DashboardController.index
    });

    server.route({
        method: 'GET',
        path: '/admin/noti-dup-contact',
        config: DashboardController.notiDupContact
    });

    next();
};

exports.register.attributes = {
    name: 'admin-dashboard'
};
