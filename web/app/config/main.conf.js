'use strict';
// const Bluebird = require('bluebird');

let config = {};

config.web = {

    port: process.env.FRONT_PORT || 9006,
    sessionKey: '6ketaq3cgrggdfgdfgdfgdfgo315rk9',
    cookieOptions: {
        ttl: 365 * 24 * 60 * 60 * 1000, // expires a year from today
        encoding: 'none',    // we already used JWT to encode
        path: '/',
        //isSecure: true,      // warm & fuzzy feelings
        isHttpOnly: false,    // prevent client alteration
        clearInvalid: true, // remove invalid cookies
        strictHeader: true   // don't allow violations of RFC 6265
    },
    paging: {
        defaultPageSize: 25,
        numberVisiblePages: 10,
        itemsPerPage: 5
    },
    db: {
        uri: 'mongodb://localhost/db_antoree',
        options: {
            user: '',
            pass: ''
        }
    },
    elasticsearch: {
        ES_Sync: false,
        config: {
            hosts: [
            {
                protocol: 'http',
                host: 'localhost',
                port: 9200,
            },
            ],
            /*log: 'trace',*/
        }
    },
    mailer: {
        options: {
            pool: true,
            service: 'Gmail',
            auth: {
                // user: 'chung.gkh@gmail.com',
                user: 'dev.antoree@gmail.com',
                pass: 'antore@2016'
                // pass: 'iii3studi1'
            },
            logger: false, // log to console
            debug: false // include SMTP traffic in the logs
        },
        defaults: {
            from: 'info <sender@gmail.com>'
        }
    },
    email: {
        from: {
            "name": "info",
            "address": "vu.dev@antoree.com"
        },
        to: [{ //for admin
            "name": "vuvu",
            "address": "vu.dev@antoree.com"
            // "address": "mr.minhtien.it@gmail.com"
        },{ //for admin
            "name": "minhtien",
            "address": "mr.minhtien.it@gmail.com"
        }],
        cc: [],
        bcc: []

    },
    upload: {
        path: process.cwd() + '/public/files',
        bannerPath: process.cwd() + '/public/files/banner/',
        postPath: process.cwd() + '/public/files/post/',
        productPath: process.cwd() + '/public/files/product/'
    },
    connections: [
    {
        port: 9010,
        labels: ['web'],
        routes: {
            cors: {
                origin: ['*'],
                credentials: true
            }
        }
    },
    {
        port: 9011,
        labels: ['admin'],
        routes: {
            cors: {
                origin: ['*'],
                credentials: true
            },
            auth: {
                scope: ['admin']
            }
        }
    },
    {
        port: 9012,
        labels: 'api',
        routes: {
            cors: {
                origin: ['*'],
                credentials: true
            }
        }
    },
    {
        port: 9013,
        labels: 'socket',
        routes: {
            cors: {
                origin: ['*'],
                credentials: true
            }
        }
    }
    ],
    allRoles: ['user', 'super-admin', 'admin', 'sale'],
    jwt: {
        secret: process.env.JWT_SECRET_CMS || 'jKErFlFEktfafasfaKLfghLoPrlafasflsdf0werr'
    },

    error: {
        notfound: {
            url: '/error404' //404 URL
        },
        permission: {
            url: '/error403' //403 URL
        },
        user: {
            login: '/login' // Login URL
        }
    },
    facebook: {
        clientID: process.env.FACEBOOK_ID || '427079307489462',
        clientSecret: process.env.FACEBOOK_SECRET || 'd78875d70774594c0b93d646c07cb6ab',
        callbackURL: '/auth/facebook/callback'
    },
    twitter: {
        clientID: process.env.TWITTER_KEY || 'yXwFK6ff3fOc8dvessqKvd9Z8',
        clientSecret: process.env.TWITTER_SECRET || 'k0w9heOObYwlwchdRBQ6tmHiPQN5O26nwz5XDzxPWPtby6llNx',
        callbackURL: '/auth/twitter/callback'
    },
    google: {
        clientID: process.env.GOOGLE_ID || '941481178075-mrmusgvq3asuq1relija3smn7psmogkh.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_SECRET || 'sSIpuxYkac8r8LgXtVJ9pM6W',
        callbackURL: '/auth/google/callback'
    },

    context: {
        app: {
            title: 'Web',
            description: '',
            keywords: ''
        },
        settings: {
            services: {
                admin: 'http://localhost:9002',
                userApi: 'http://localhost:9001',
                contactApi: 'http://localhost:9001',
                socketApi: 'http://localhost:9001',
                uploadApi: 'http://localhost:9001',
                webUrl: 'http://localhost:9006'
            }

        },
        assets: {
            js: [
            ],
            css: [
            ]
        },
        adminassets: {
            js: [
            ],
            css: [
            ]
        }
    }
};

module.exports = config;