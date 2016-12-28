var contactRegisterCtrl = (function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('contactRegisterCtrl', contactRegisterCtrl);

	function contactRegisterCtrl($scope, $log, $state, $filter, $stateParams, $uibModalStack, $uibModal, $bzPopup,
	 authSvc, NgTableParams, ngTableEventsChannel, saleContactTmpSvc, saleContactSvc, assignContactSvc, bzResourceSvc){
		/* jshint validthis: true */
		var CR = this;

		// var modalInstance = $uibModal.open({
		// 	animation:true,
		// 	templateUrl: 'modules/global-popup/loading.html',
		// });
		/*==============XÉT QUYỀN TRUY CẬP ROUTER==============*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSaleManager()) ){
			$state.go('error403');
		}
		/*============END XÉT QUYỀN TRUY CẬP ROUTER============*/

		/*===============VARS===============*/
		CR.queryParams = $stateParams;
		CR.loading = true;
		CR.contacts = [];
		CR.totalFilters = {};

		/*===============METHOD===============*/
		CR.linkFilter = linkFilter;
		CR.filter = filter;
		CR.filterReset = filterReset;

		CR.remove = remove;
		CR.popupAssignContact = popupAssignContact;
		CR.popupAssignToSaleman = assignContactSvc.assignSaleman;

		/*==================INIT==================*/
		getData();
		
		angular.element('#reservationtime').daterangepicker({
			startDate: $filter('date')(CR.queryParams.startDate, 'd/M/yyyy h:mm:ss a'),
			endDate: $filter('date')(CR.queryParams.endDate, 'd/M/yyyy h:mm:ss a'),
			timePicker: true,
			timePickerIncrement: 30,
			locale: {
				format: 'DD/MM/YYYY h:mm A'
			}
		});

		angular.element('#reservationtime').on('apply.daterangepicker', function(ev, picker) {
			/*do something, like calling a function*/
			console.log(picker.startDate, picker.endDate);
			CR.queryParams.startDate = picker.startDate.toISOString();
			CR.queryParams.endDate = picker.endDate.toISOString();
			CR.linkFilter('filterDay','orther');
		});

		ngTableEventsChannel.onPagesChanged(function(){
			$scope.CR.queryParams.page = CR.table.page();
			$state.go('.',$scope.CR.queryParams);
		}, $scope, CR.table);

		/*=================FUNCTION=================*/

		function getData(){
			saleContactTmpSvc.getContactTmp(CR.queryParams).then(function(resp){
				CR.contacts = resp.items;
				CR.totalFilters = resp.totalFilters;
				CR.table = new NgTableParams({count: 20}, {
					counts:[],
					getData: function(params) {
						params.total(resp.totalItems);
						return CR.contacts;
					}
				});
				CR.table.page(CR.queryParams.page);
				CR.loading = false;
			});

			// saleContactSvc.get(CR.queryParams, function(resp){
			// 	// CR.queryParams.pageCount = resp.totalPage;
			// 	CR.contacts = resp.items;
			// 	CR.totalFilters = resp.totalFilters;
			// 	CR.table = new NgTableParams({count: 20}, {
			// 		counts:[],
			// 		getData: function(params) {
			// 			params.total(resp.totalItems);
			// 			return CR.contacts;
			// 		}
			// 	});
			// 	CR.table.page(CR.queryParams.page);
			// 	CR.loading = false;
			// 	// $uibModalStack.dismissAll();
				
			// });
		}

		/*filter*/
		function linkFilter(field, value){
			CR.queryParams.page = 1;
			CR.queryParams[field] = value;

			$state.go('.', CR.queryParams , {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filter(params){
			CR.queryParams.page = 1;
			$state.go('.', CR.queryParams, {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filterReset(){
			CR.queryParams.keyword 			= null;
			CR.queryParams.is_finish 		= null;
			CR.queryParams.filterDay 		= null;
			CR.queryParams.startDate 		= null;
			CR.queryParams.endDate 			= null;
			CR.queryParams.newly 			= null;

			$state.go('.', CR.queryParams, {notify:false})
			.then(function(){
				$state.reload();
			});
		}
		/*end filter*/

		function remove(id){
			$bzPopup.message({
				data:{
					title: 'Xóa',
					message: 'Bạn chắc chắn sẽ xóa dữ liệu này?',
					props: {
						btnOk: 'Đồng ý',
						btnOkEvent: function(){
							bzResourceSvc.api('saleContact/delete')
							.save({}, {ids: id}, function(resp){
								$bzPopup.toastr({
									type: 'success',
									data:{
										title: 'Xóa',
										message: 'Xóa bài viết thành công!'
									}
								});

								$state.reload();
							});
						},
						btnCancel: 'Hủy bỏ'
					}
				},
			});
		}

		function popupAssignContact(){
			var modalInstance = $uibModal.open({
				animation:true,
				templateUrl: 'modules/admin-salecontact/view/client/popup/assign-contact/view.html',
				controller: 'assignContactCtrl',
				controllerAs: 'mvACT',
			});

			modalInstance.result.then(function (resp) {
				$state.reload();
			}, function () {
				$log.info('Modal dismissed at: ' + new Date());
			});
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