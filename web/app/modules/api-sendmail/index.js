'use strict';

const SendmailController = require('./controller/sendmail.controller.js');

const internals = {
};

exports.register = function (server, options, next) {
    var config = server.plugins['hapi-kea-config'];
    let pubsub = server.plugins['app-pubsub'].pubsub;
    let emailHelper = require('./util/mail')(server, options);
    
    server.expose('sendMail', emailHelper.sendMail);

    server.route({
        method: 'GET',
        path: '/api/sendmail',

        config: SendmailController.index
    });

    server.route({
        method: 'POST',
        path: '/api/sendmail',
        config: SendmailController.sendmail
    });
    
    pubsub.subscribe('api-sendmail', function () {
        console.log('receive message');
        console.log(arguments);
        let emailData = arguments[1];
        emailHelper.sendMail(emailData);

    });

    next();
};

exports.register.attributes = {
    name: 'api-sendmail'
};
