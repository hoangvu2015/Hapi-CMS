'use strict';

let config = {};

config.web = {
    context: {
        settings: {
            services: {
                admin: 'http://localcrm.antoree.com',
                userApi: 'http://localcrm.antoree.com',
                contactApi: 'http://localcrm.antoree.com',
                socketApi: 'http://localcrm.antoree.com',
                uploadApi: 'http://localcrm.antoree.com',
                webUrl: 'http://localcrm.antoree.com'
            }
        }
    }
};

module.exports = config;