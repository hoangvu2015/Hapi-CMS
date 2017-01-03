'use strict';

const _ = require('lodash');

module.exports = {
    index: index
};

function index() {
    return {
        auth: {
            strategy: 'jwt',
            mode: 'try'
            // scope: ['admin']
        },
        handler: function(request, reply) {
            return reply.view('web-index/view/home', {test:111}, {layout: 'web/layout'})
        }
    };
}
