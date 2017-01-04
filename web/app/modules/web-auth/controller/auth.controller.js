'use strict';

module.exports = {
    login: login
};

function login() {
    return {
        auth: {
            strategy: 'jwt',
            mode: 'try',
            scope: ['super-admin', 'admin', 'guest']
        },
        handler: function(request, reply) {
            let cookieOptions = request.server.configManager.get('web.cookieOptions');

            /*Xóa token khi bị sai token*/
            if (request.auth.error && request.auth.error.output.payload.message == 'Invalid credentials') {
                return reply.view('admin-auth/view/login', null, {layout: 'admin/layout-admin-login'}).header("Authorization", '').unstate('token', cookieOptions);
            }
            if (request.auth.isAuthenticated && request.auth.credentials.scope.includes('admin')) {
                return reply.redirect('/');
            }

            reply.view('admin-auth/view/login', null, {layout: 'admin/layout-admin-login'});
        }
    };
}
