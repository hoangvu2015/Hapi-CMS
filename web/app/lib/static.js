'use strict'

const path = require('path');
// Declare internals
const internals = {};

exports.register = function(server, options, next) {

    /*WEB*/
    /*Truy cập folder public*/
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'public'
            }
        },
        config: {
            auth: false
        }
    });
    /* Trong app/module chỉ cho truy cập folder client */
    server.route({
        method: 'GET',
        path: '/modules/{module}/view/client/{pathFile*}',
        handler: function(request, reply) {
            let file = internals.helpers.getClientPath(request, reply);
            reply.file(file);
        },
        config: {
            auth: false
        }
    });
    /*END WEB*/

    /*ADMIN*/
    /*Truy cập folder public*/
    server.route({
        method: 'GET',
        path: '/admin/{param*}',
        handler: {
            directory: {
                path: 'public'
            }
        },
        config: {
            auth: false
        }
    });
    /* Trong app/module chỉ cho truy cập folder client */
    server.route({
        method: 'GET',
        path: '/admin/modules/{module}/view/client/{pathFile*}',
        handler: function(request, reply) {
            let file = internals.helpers.getClientPath(request, reply);
            reply.file(file);
        },
        config: {
            auth: false
        }
    });
    /*END ADMIN*/

    /*GENERAL*/

    /*Truy cập folder bower full*/
    // server.route({
    //     method: 'GET',
    //     path: '/public/bower_components/{param*}',
    //     handler: {
    //         directory: {
    //             path: 'public/bower_components'
    //         }
    //     },
    //     config: {
    //         auth: false
    //     }
    // });

    /*Truy cập folder node_modules full*/
    // server.route({
    //     method: 'GET',
    //     path: '/node_modules/{param*}',
    //     handler: {
    //         directory: {
    //             path: 'node_modules'
    //         }
    //     },
    //     config: {
    //         auth: false
    //     }
    // });
    /*END GENERAL*/

    return next();
}
exports.register.attributes = {
    name: 'app-static',
    dependencies: 'inert'
};

internals.helpers = {
    getFileExt: function(fileName) {
        var fileExt = fileName.split(".");
        if (fileExt.length === 1 || (fileExt[0] === "" && fileExt.length === 2)) {
            return "";
        }
        return fileExt.pop();
    },
    getClientPath: function(request, reply) {
        // let clients = {
        //     css : 'style',
        //     js  : 'js',
        //     html: 'template'
        // };
        // let file = request.params.file;
        // let fileExt = this.getFileExt(file);
        // let assetFolder = clients[fileExt];
        let filePath = path.join('app/modules', request.params.module, 'view', 'client', request.params.pathFile);

        return filePath;
    }
};
