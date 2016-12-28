'use strict';

const CoreController = require('./controller/core.controller.js');

exports.register = function(server, options, next) {
    server.route({
        method: 'GET',
        path: '/error404',
        config: {
        },
        handler: function(request, reply){
            reply.view('admin-core/view/404', {
                meta: {
                    title: 'Page Not Found'
                }
            }, {
                layout: 'admin/layout-admin'
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/error403',
        config: {
        },
        handler: function(request, reply){
            reply.view('admin-core/view/403', {
                meta: {
                    title: 'Not Permission'
                }
            }, {
                layout: 'admin/layout-admin'
            });
        }
    });

    server.ext('onPostHandler', CoreController.getCredentials);

    next();
};

exports.register.attributes = {
    name: 'admin-core'
};