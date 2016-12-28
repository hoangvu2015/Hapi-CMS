var saleContactTmpCtrl = (function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('saleContactTmpCtrl', saleContactTmpCtrl);

	function saleContactTmpCtrl($scope, $log, $state, $filter, $stateParams, $uibModalStack, $uibModal, $bzPopup, 
		authSvc, NgTableParams, ngTableEventsChannel, saleContactTmpSvc, saleContactSvc, assignContactSvc, bzResourceSvc){
		/* jshint validthis: true */
		var SCTMP = this;

		/*==============XÉT QUYỀN TRUY CẬP ROUTER==============*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSaleManager()) ){
			$state.go('error403');
		}
		/*============END XÉT QUYỀN TRUY CẬP ROUTER============*/

		/*===============VARS===============*/
		SCTMP.queryParams = $stateParams;
		SCTMP.loading = true;
		SCTMP.contacts = [];

		SCTMP.formData = {
			name: '',
			email: '',
			skype: '',
			phone: '',
			age:'',
			type: '',
		};


		/*===============METHOD===============*/
		SCTMP.filter = filter;
		SCTMP.filterReset = filterReset;
		SCTMP.save = save;

		/*==================INIT==================*/
		getData();

		ngTableEventsChannel.onPagesChanged(function() {
			$scope.SCTMP.queryParams.page = SCTMP.table.page();
			$state.go('.',$scope.SCTMP.queryParams);
		}, $scope, SCTMP.table);

		/*=================FUNCTION=================*/

		function getData(){
			saleContactTmpSvc.getContactTmp(SCTMP.queryParams).then(function(resp){
				SCTMP.contacts = resp.items;
				SCTMP.table = new NgTableParams({count: 20}, {
					counts:[],
					getData: function(params) {
						params.total(resp.totalItems);
						return SCTMP.contacts;
					}
				});
				SCTMP.table.page(SCTMP.queryParams.page);
				SCTMP.loading = false;
			});
		}

		function filter(params){
			SCTMP.queryParams.page = 1;
			$state.go('.', SCTMP.queryParams, {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filterReset(){
			SCTMP.queryParams.keyword 			= null;
			$state.go('.', SCTMP.queryParams, {notify:false})
			.then(function(){
				$state.reload();
			});
		}
		/*end filter*/

		function save(isValid){
			SCTMP.submitted = true;

			if(!SCTMP.lockForm && isValid){
				SCTMP.lockForm = true;
				console.log('kkk', SCTMP.formData);

				saleContactTmpSvc.createContactTmp(SCTMP.formData).then(function(resp){
					console.log('uuu', resp);
					/*Thêm Thành công*/
					$bzPopup.toastr({
						type: 'success',
						data:{
							title: 'Liên hệ',
							message: 'Thêm liên hệ thành công!'
						}
					});
					$state.reload();
				});
			}
		}

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