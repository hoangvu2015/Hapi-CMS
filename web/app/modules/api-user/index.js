'use strict';

const AuthController = require('./controller/auth.controller.js');

exports.register = function (server, options, next) {
    server.route({
        method: 'GET',
        path: '/api/user',
        config: AuthController.find
    });

    server.route({
        method: 'GET',
        path: '/api/user/{id}',
        config: AuthController.findOne
    });

    server.route({
        method: 'POST',
        path: '/api/user',
        config: AuthController.create
    });

    server.route({
        method: 'PUT',
        path: '/api/user/{id}',
        config: AuthController.update
    });

    server.route({
        method: 'DELETE',
        path: '/api/user/{id}',
        config: AuthController.destroy
    });

    server.route({
        method: 'POST',
        path: '/api/user/login',
        config: AuthController.login
    });

    server.route({
        method: ['GET', 'POST'],
        path: '/api/user/logout',
        config: AuthController.logout
    });

    server.route({
        method: 'POST',
        path: '/api/user/verify-email',
        config: AuthController.verifyEmail
    });

    server.route({
        method: 'POST',
        path: '/api/user/active',
        config: AuthController.active
    });

    server.route({
        method: 'POST',
        path: '/api/user/facebook-login',
        config: AuthController.facebookLogin
    });

    server.route({
        method: 'POST',
        path: '/api/user/google-login',
        config: AuthController.googleLogin
    });

    server.route({
        method: 'POST',
        path: '/api/user/forgot-password',
        config: AuthController.fogotPassword
    });

    server.route({
        method: 'POST',
        path: '/api/user/reset-password',
        config: AuthController.resetPassword
    });

    server.route({
        method: 'POST',
        path: '/api/user/change-password',
        config: AuthController.changePassword
    });

    server.route({
        method: ['GET'],
        path: '/api/user/profile/{id}',
        config: AuthController.profile
    });

    // Extend
    // server.route({
    //     method: 'GET',
    //     path: '/api/user/saleman',
    //     config: AuthController.findSaleman
    // });

    next();
};

exports.register.attributes = {
    name: 'api-auth'
};
