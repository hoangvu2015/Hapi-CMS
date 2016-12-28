'use strict';

let config = {};

config.web = {
	context: {
		settings: {
			services: {
                admin: 'http://test.antoree.com',
				userApi: 'http://test.antoree.com',
				contactApi: 'http://test.antoree.com',
				socketApi: 'http://test.antoree.com',
				uploadApi: 'http://test.antoree.com',
				webUrl: 'http://test.antoree.com'
			}
		}
	}
};

module.exports = config;