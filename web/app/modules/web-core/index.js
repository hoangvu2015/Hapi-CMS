'use strict';

const CoreController = require('./controller/core.controller.js');

exports.register = function(server, options, next) {
    server.ext('onPostHandler', CoreController.createGuestToken);
    server.ext('onPostHandler', CoreController.getCredentials);
//     // server.ext('onPostHandler', CoreController.getPostCategories);
    server.ext('onPostHandler', CoreController.getMeta);
    server.ext('onPreResponse', CoreController.handleError);
//     server.ext('onPreResponse', function(request, reply) {
//
//         if (request.response.variety === 'view') {
//             request.response.source.context = request.response.source.context || {};
//
//
//             request.response.source.context.isDevelopment   = (process.env.NODE_ENV === 'development');
//         }
//
//         reply.continue();
//     });
//
    next();
};
exports.register.attributes = {
    name: 'web-core'
};
