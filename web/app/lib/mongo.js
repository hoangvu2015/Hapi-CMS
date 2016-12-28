'use strict'
const mongoose = require('mongoose');

exports.register = function (server, options, next) {
    const config = server.plugins['hapi-kea-config'];
    mongoose.connect(config.get('web.db.uri'), config.get('web.db.options'));
    mongoose.Promise = Promise;
    require('mongoose-pagination');

    next();
};

exports.register.attributes = {
    name: 'app-mongo'
};
