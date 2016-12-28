'use strict'

const Boom = require('boom');
const util = require('util');
const Joi = require('joi');
const HapiSwagger = require('hapi-swagger');
const Path = require('path');
const Pack = require(global.BASE_PATH + '/package');
const Glob = require("glob");

module.exports = function (server) {

    server.register([
    {
        register: require('inert')
    },
    {
        register: require('vision')
    },
    {
        register: require('hapi-logger'),
        options: {
                //transport: 'console',
                logFilePath: BASE_PATH + '/var/bunyan-log.log'
            }
        },
        {
            register: HapiSwagger,
            options: {
                info: {
                    'title': 'Documentation',
                    'version': Pack.version,
                }
            }
        },
        {
            register: require('../lib/redis.js')
        },
        {
            register: require('../lib/mongo.js')
        },
        {
            register: require('../lib/auth.js')
        },
        {
            register: require('../lib/static.js')
        },
        {
            register: require('../lib/pubsub.js')
        },
        {
            register: require('../lib/elasticsearch.js')
        },
        {
            register: require('hapi-io'),
            options: {

            }
        }

        ], (err) => {

            if (err) {
                server.log(['error', 'server'], err);
            }
            const config = server.configManager;
            server.views({
                engines: {
                    html: require('handlebars')
                },
                relativeTo: global.BASE_PATH + '/app/modules',
                partialsPath: global.BASE_PATH + '/app/views/layouts',
                helpersPath: global.BASE_PATH + '/app/views/helpers',
                layoutPath: global.BASE_PATH + '/app/views/layouts',
                layout: function(){
                    return 'web/layout';
                }(),
                context: config.get('web.context')
            });

        //autoload models
        let models = Glob.sync(BASE_PATH + "/app/models/*.model.js", {});
        models.forEach((item) => {
            require(Path.resolve(item));
        });

        //autoload modules
        server.connections.forEach(function (connectionSetting) {

            let labels = connectionSetting.settings.labels;
            labels.forEach(name=>{
                let modules = [];
                let modulesName = Glob.sync(BASE_PATH + `/app/modules/${name}-*/index.js`, {});
                modulesName.forEach((item) => {
                    modules.push(require(Path.resolve(`${item}`)));
                });
                if(modules.length){
                    server.register(modules, { select: [name] }, (err) => {
                        if (err) {
                            server.log(['error', 'server'], err);
                        }
                    });
                }
            });
        })

        //Load socket-io
        var io = require("socket.io")(server.select('socket').listener);
        require(global.BASE_PATH +'/app/utils/socket.js')(io);
    });
}