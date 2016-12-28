'use strict'
/***************************************************
PLUGIN USER IN CONTROLLER, ROUTE
***************************************************/
const _ = require('lodash');
const elasticsearch = require('elasticsearch');
const Bluebird = require('bluebird');

exports.register = function (server, options, next) {
	const config = server.plugins['hapi-kea-config'];
	/*Set Global ES_CONFIG*/
	global.ES_SYNC =config.get('web.elasticsearch.ES_Sync');
	global.ES_CONFIG =config.get('web.elasticsearch.config');

	let defaultSetting = {
		defer: function () {
			return Bluebird.defer();
		}
	};
	let settings = _.merge({}, defaultSetting, global.ES_CONFIG);

	let client = new elasticsearch.Client(settings);

	server.expose('elasticsearch', client);
	next();
};

exports.register.attributes = {
	name: 'app-elasticsearch'
};