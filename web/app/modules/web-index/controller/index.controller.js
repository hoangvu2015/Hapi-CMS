'use strict';

const _ = require('lodash');

module.exports = {
    index: index
};

function index() {
    return {
        // auth: {
        //     strategy: 'jwt',
        //     mode: 'try',
        //     scope: ['admin']
        // },
        handler: function(request, reply) {
          console.log('okok');
            return reply.view('web-index/view/client/home/view', {test:999}, {layout: 'web/layout'})
        }
    };
}
