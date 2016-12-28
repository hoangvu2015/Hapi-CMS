'use strict';

const LogController = require('./controller/log.controller.js');

exports.register = function(server, options, next) {
	server.route({
		method: 'GET',
		path: '/log',
		config: LogController.find
	});

	server.route({
		method: 'POST',
		path: '/api/log',
		config: LogController.create
	});

	server.route({
		method: 'GET',
		path: '/api/contact-log/{id}',
		config: LogController.getContactLogById
	});


	next();
};

exports.register.attributes = {
	name: 'admin-log'
};
