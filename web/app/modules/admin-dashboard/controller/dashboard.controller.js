'use strict';

const _ = require('lodash');
const async = require("async");
const Mongoose = require('mongoose');
const SaleContact = Mongoose.model('SaleContact');

module.exports = {
	index: index,
	notiDupContact: notiDupContact,
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

			return reply.view('admin-dashboard/view/default', {request:request}, {layout: 'admin/layout-admin'});
		}
	};
}

function notiDupContact(){
	return {
		auth: {
			strategy: 'jwt',
			scope: ['admin']
		},
		handler: function(request, reply) {
			let userAuth = request.auth.credentials;
			let _sale_usermember = request.query._sale_usermember || userAuth.id;

			let results = {
				dupTotal: 0,
				dupCSale: 0,
				dupCEviction: 0
			};
			let listAsync = [];
			let listFilters = [
			{type:'dupTotal', bool: {must: [{'match_phrase': {'dup': Boolean(1)}},{'match_phrase': {'_sale_usermember': _sale_usermember}}]}},
			{type:'dupCSale', bool: {must: [{'match_phrase': {'dup': Boolean(1)}},{'match_phrase': {'_sale_usermember': _sale_usermember}}], must_not:[{'term':{'eviction': true}}]}},
			{type:'dupCEviction', bool: {must: [{'match_phrase': {'eviction': Boolean(1)}},{'match_phrase': {'dup': Boolean(1)}},{'match_phrase': {'_sale_usermember': _sale_usermember}}]}},
			];

			async.parallel([
				function(callback){getFT(listFilters[0],function(){callback();});},
				function(callback){getFT(listFilters[1],function(){callback();});},
				function(callback){getFT(listFilters[2],function(){callback();});},
				],
				function(err, resultss) {
					return reply(results);
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
		}
	};
}