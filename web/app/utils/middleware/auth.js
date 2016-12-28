'use strict';
const _ = require('lodash');
const Boom = require('boom');

module.exports = {
    mdwSaleManager: mdwSaleManager
};

/******************************************************************
Middleware Auth
*******************************************************************/
function mdwSaleManager(){
    return function(request, reply){
        
        if(request.auth.credentials)
            if(_.intersection(request.auth.credentials.roles, ["super-admin"]).length === 0)
                return reply(true);
            if(request.auth.credentials.saleman.manager === true)
                return reply(true);
        // let config = request.server.configManager;
        // let permissionUrl = config.get('web.error.permission.url');
        // return reply.redirect(permissionUrl);
        return reply(Boom.forbidden('try again some time, not permission'));
    }
}
