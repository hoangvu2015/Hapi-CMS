'use strict'

// const Boom = require('boom');
// const util = require('util');
// const Joi = require('joi');
// const HapiSwagger = require('hapi-swagger');
// const Path = require('path');
// const Pack = require(global.BASE_PATH + '/package');
// const Glob = require("glob");
const _ = require('lodash');
const async = require("async");
const Bluebird = require("bluebird");
const Mongoose = require('mongoose');
const SaleContact = Mongoose.model('SaleContact');

module.exports = function (io) {

    io.on("connection", function (socket) {  
        console.log("client incoming");
        socket.on('socket-postNoti', function(data){
            setTimeout(function(){
                getNoti(data).then(function(resp){
                    // console.log('tt',resp);
                    socket.emit('socket-getNoti', resp);
                });
            }, 1000);
        });
    });
}

/***************************************
FUNCITION
***************************************/
function getNoti(data){
    return new Bluebird(function(resolve, reject){
        let _sale_usermember = data._sale_usermember;

        let results = {
            dupTotal: 0,
            dupCSale: 0,
            dupCEviction: 0
        };
        let listAsync = [];
        let listFilters = [
        {type:'dupTotal', bool: {must: [{'match_phrase': {'dup': Boolean(1)}},{'match_phrase': {'_sale_usermember': _sale_usermember}}]}},
        {type:'dupCSale', bool: {must: [{'match_phrase': {'dup': Boolean(1)}},{'match_phrase': {'_sale_usermember': _sale_usermember}}], must_not:[{'match_phrase':{'eviction': Boolean(1)}}]}},
        {type:'dupCEviction', bool: {must: [{'match_phrase': {'eviction': Boolean(1)}},{'match_phrase': {'dup': Boolean(1)}}]}},
        ];

        async.parallel([
            function(callback){getFT(listFilters[0],function(){callback();});},
            function(callback){getFT(listFilters[1],function(){callback();});},
            function(callback){getFT(listFilters[2],function(){callback();});},
            ],
            function(err, resultss) {
                return resolve(results);
            });

        function getFT(filter, callback){
            /*Elastic Search*/
            SaleContact.search({
                "bool": filter.bool
            },{}, function(err, resp){
                if(resp){
                    results[filter.type] = resp.hits.total;
                }
                callback();
            });
        }
    });
}