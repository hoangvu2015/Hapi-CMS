'use strict';

const StatisticController = require('./controller/statistic.controller.js');

exports.register = function(server, options, next) {
    var configManager = server.plugins['hapi-kea-config'];
    server.route({
        method: 'GET',
        path: '/admin/statistic',
        config: StatisticController.find
    });

    server.route({
        method: 'GET',
        path: '/admin/statistic-get-saleman',
        config: StatisticController.listSaleman
    });

    next();
};

exports.register.attributes = {
    name: 'admin-statistic'
};
