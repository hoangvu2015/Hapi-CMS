'use strict'

const redis = require('redis');

exports.register = function (server, options, next) {
    var configManager = server.configManager;
    var settings = configManager.get('web.redisOptions');
    let client = redis.createClient(settings);

    server.expose(client);
    server.decorate('server', 'redis', client);
    server.decorate('request', 'redis', client);

    return next();
};

exports.register.attributes = {
    name: 'app-redis'
};