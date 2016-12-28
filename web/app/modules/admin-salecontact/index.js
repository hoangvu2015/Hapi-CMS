'use strict';

const SaleContactController = require('./controller/salecontact.controller.js');
const SaleContactTmpController = require('./controller/salecontacttmp.controller.js');
const AssignContactController = require('./controller/assigncontact.controller.js');
// const ApiSaleContactController = require(BASE_PATH + '/app/modules/api-salecontact/controller/salecontact.controller.js');

exports.register = function(server, options, next) {
    /*Dồng bộ contact cũ*/
    // server.route({
    //     method: 'POST',
    //     path: '/admin/api/salecontact',
    //     config: ApiSaleContactController.create
    // });

    server.route({
        method: 'GET',
        path: '/admin/sale-contact-tmp',
        config: SaleContactTmpController.find
    });

    server.route({
        method: 'POST',
        path: '/admin/sale-contact-tmp',
        config: SaleContactTmpController.create
    });

    server.route({
        method: 'GET',
        path: '/admin/sale-contact',
        config: SaleContactController.find
    });

    server.route({
        method: 'GET',
        path: '/admin/sale-contact/{id}',
        config: SaleContactController.findOne
    });

    server.route({
        method: 'POST',
        path: '/admin/sale-contact',
        config: SaleContactController.create
    });

    server.route({
        method: 'PUT',
        path: '/admin/sale-contact/{id}',
        config: SaleContactController.update
    });

    server.route({
        method: 'POST',
        path: '/admin/sale-contact/upload-file-test',
        config: SaleContactController.uploadFileTest
    });

    server.route({
        method: 'POST',
        path: '/admin/sale-contact-by-email',
        config: SaleContactController.findByEmail
    });

    /*Bàn giao  contacts cho salemans*/
    server.route({
        method: 'POST',
        path: '/admin/assign-for-salemans',
        config: SaleContactController.assignForSalemans
    });

    /*Thu hồi contacts*/
    server.route({
        method: 'POST',
        path: '/admin/sale-contact-evict',
        config: SaleContactController.evictContact
    });

    /*Route assign contact, assign saleman, assign CC vu.dev@antoree.com*/
    
    server.route({
        method: 'DELETE',
        path: '/admin/delete-contact/{_id}',
        config: AssignContactController.destroyContact
    });

    server.route({
        method: 'GET',
        path: '/admin/saleman-assign-contact',
        config: AssignContactController.getSaleman
    });

    server.route({
        method: 'POST',
        path: '/admin/assign-contact-optimized',
        config: AssignContactController.getContactOptimized
    });

    server.route({
        method: 'POST',
        path: '/admin/assign-contact-post',
        config: AssignContactController.postAssignContact
    });

    server.route({
        method: 'GET',
        path: '/admin/saleman-assign-user',
        config: AssignContactController.findSalemanAssign
    });
    
    server.route({
        method: 'POST',
        path: '/admin/assign-to-cmd',
        config: AssignContactController.assignToCMD
    });

    //End route assign contact vu.dev@antoree.com

    /**/
    

    next();
};

exports.register.attributes = {
    name: 'admin-salecontact'
};
