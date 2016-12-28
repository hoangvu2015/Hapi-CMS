var saleContactSearchCtrl = (function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('saleContactSearchCtrl', saleContactSearchCtrl);

	function saleContactSearchCtrl($scope, $state, $stateParams, authSvc, NgTableParams, ngTableEventsChannel, saleContactSvc){
		/* jshint validthis: true */
		var vmSCT = this;

		/*==============XÉT QUYỀN TRUY CẬP ROUTER==============*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSale()) ){
			$state.go('error403');
		}
		/*============END XÉT QUYỀN TRUY CẬP ROUTER============*/

		/*===============VARS===============*/
		vmSCT.loading = true;
		vmSCT.queryParams = $stateParams;
		vmSCT.contacts = [];

		/*===============METHOD===============*/
		vmSCT.filter = filter;
		vmSCT.filterReset = filterReset;

		/*==================INIT==================*/
		getData();

		ngTableEventsChannel.onPagesChanged(function() {
			$scope.vmSCT.queryParams.page = vmSCT.table.page();
			$state.go('.',$scope.vmSCT.queryParams);
		}, $scope, vmSCT.table);

		/*=================FUNCTION=================*/

		function getData(){
			saleContactSvc.get(vmSCT.queryParams, function(resp){
				vmSCT.contacts = resp.items;
				
				/*Nếu không có keywork thì page sẽ rỗng*/
				if(!vmSCT.queryParams.keyword){
					vmSCT.contacts = [];
					vmSCT.queryParams.page =1;
				}				

				vmSCT.table = new NgTableParams({count: 10}, {
					counts:[],
					getData: function(params) {
						params.total(resp.totalItems);
						return vmSCT.contacts;
					}
				});
				vmSCT.table.page(vmSCT.queryParams.page);
				vmSCT.loading = false;
			});
		}

		/*filter*/
		function filter(params){
			vmSCT.queryParams.page = 1;
			$state.go('.', vmSCT.queryParams, {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filterReset(){
			vmSCT.queryParams.keyword 			= null;

			$state.go('.', vmSCT.queryParams, {notify:false})
			.then(function(){
				$state.reload();
			});
		}
		/*end filter*/
	}

	var resolve = {
		/* @ngInject */
		preload: function(bzPreloadSvc) {
			return bzPreloadSvc.load([]);
		}
	};

	return {
		resolve : resolve
	};
})();