'use strict';

const _ = require('lodash');

module.exports = {
	index: index
};

function index(){
	return {
		auth: {
			strategy: 'jwt',
			mode: 'try',
			scope: ['admin']
		},
		handler: function(request, reply) {
			if (!request.auth.isAuthenticated) {
				return reply.redirect('/admin/signin');
			}
				return reply.redirect('/admin');
		}
	};
}