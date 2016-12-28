var contactSalemanEvictCtrl = (function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('contactSalemanEvictCtrl', contactSalemanEvictCtrl);

	function contactSalemanEvictCtrl($scope, $log, $state, $stateParams, $uibModal, $bzPopup, $filter, $element,
		authSvc, LEVEL_LIST, CARESTATUS_LIST, QUALITYCALL_LIST, NgTableParams, ngTableEventsChannel, 
		saleContactSvc, assignContactSvc, bzResourceSvc){
		/* jshint validthis: true */
		var mvCSME = this;

		/*=========XÉT QUYỀN TRUY CẬP ROUTER=========*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSaleManager()) ){
			$state.go('error403');
		}
		/*=======END XÉT QUYỀN TRUY CẬP ROUTER=======*/


		/*=======VARS=======*/
		mvCSME.loading = true;
		mvCSME.queryParams = $stateParams;


		// if(authSvc.isSuperAdmin() || authSvc.isSaleManager())
		// 	mvCSME.queryParams.uid = $stateParams.uid || authSvc.getProfile().uid;
		// else
		// 	mvCSME.queryParams.uid = authSvc.getProfile().uid;

		mvCSME.contacts = [];
		mvCSME.userSaleActive = [];
		mvCSME.totalFilters = {};
		mvCSME.constLevel = LEVEL_LIST;
		mvCSME.constCare = CARESTATUS_LIST;
		mvCSME.checkboxes = {
			checked: false,
			items: {}
		};

		/*==================METHODS==================*/
		mvCSME.changeSaleman = changeSaleman;
		mvCSME.linkFilter = linkFilter;
		mvCSME.filter = filter;
		mvCSME.remove = remove;
		mvCSME.filterReset = filterReset;
		mvCSME.findObject = helperJs.findObject;
		mvCSME.popupAssignToCMD = assignContactSvc.assignCMD;
		mvCSME.popupAssignToSaleman = assignContactSvc.assignSaleman;

		/*==================INIT==================*/
		angular.element('#reservationtime').daterangepicker({
			startDate: $filter('date')(mvCSME.queryParams.startDate, 'd/M/yyyy h:mm:ss a'),
			endDate: $filter('date')(mvCSME.queryParams.endDate, 'd/M/yyyy h:mm:ss a'),
			timePicker: true,
			timePickerIncrement: 30,
			locale: {
				format: 'DD/MM/YYYY h:mm A'
			}
		});

		angular.element('#reservationtime').on('apply.daterangepicker', function(ev, picker) {
			/*do something, like calling a function*/
			mvCSME.queryParams.startDate = picker.startDate.toISOString();
			mvCSME.queryParams.endDate = picker.endDate.toISOString();
			mvCSME.linkFilter('filterDay','orther');
		});

		getData();

		ngTableEventsChannel.onPagesChanged(function() {
			$scope.mvCSME.queryParams.page = mvCSME.table.page();
			$state.go('.',$scope.mvCSME.queryParams);
		}, $scope, mvCSME.table);

		/*==================FUNTION==================*/

		function getData(){
			saleContactSvc.get(mvCSME.queryParams, function(resp){
				mvCSME.totalFilters = resp.totalFilters;
				mvCSME.contacts = resp.items;
				mvCSME.userSaleActive = resp.userSaleActive;
				mvCSME.table = new NgTableParams({count: 10}, {
					counts:[],
					getData: function(params) {
						params.total(resp.totalItems);
						return mvCSME.contacts;
					}
				});
				mvCSME.table.page(mvCSME.queryParams.page);
				mvCSME.loading = false;
				initSelecteds(mvCSME.contacts, mvCSME.checkboxes, '_id');
			});
		}
		
		/*Thay đổi saleman hiển thị*/
		function changeSaleman(id){
			$state.go('.', mvCSME.queryParams , {notify:false}).then(function(){
				$state.reload();
			});
		}

		function linkFilter(field, value){
			mvCSME.queryParams.page = 1;
			mvCSME.queryParams[field] = value;

			$state.go('.', mvCSME.queryParams , {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filter(params){
			mvCSME.queryParams.page = 1;
			$state.go('.', mvCSME.queryParams, {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filterReset(){
			mvCSME.queryParams.keyword 			= null;
			mvCSME.queryParams.type 				= null;
			mvCSME.queryParams.is_finish 		= null;
			mvCSME.queryParams.call_status 		= null;
			mvCSME.queryParams.care_status 		= null;
			mvCSME.queryParams.call_level 		= null;
			mvCSME.queryParams.is_recall_schedule = null;
			mvCSME.queryParams.schedule_inteview = null;
			mvCSME.queryParams.filterDay 		= null;
			mvCSME.queryParams.startDate 		= null;
			mvCSME.queryParams.endDate 			= null;

			$state.go('.', mvCSME.queryParams, {notify:false})
			.then(function(){
				$state.reload();
			});
		}

		function remove(id){
			$bzPopup.message({
				data:{
					title: 'Xóa',
					message: 'Bạn chắc chắn sẽ xóa dữ liệu này?',
					props: {
						btnOk: 'Đồng ý',
						btnOkEvent: function(){
							assignContactSvc.deleteContact(id)
							.then(function(resp){
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

		/*Khởi tạo Selecteds*/
		function initSelecteds(dataTable, checkboxes, field){
			/*watch for check all checkbox*/
			$scope.$watch(function() {
				return checkboxes.checked;
			}, function(value) {
				angular.forEach(dataTable, function(item) {
					checkboxes.items[item[field]] = value;
				});
			});

			/*watch for data checkboxes*/
			$scope.$watch(function() {
				return checkboxes.items;
			}, function(values) {
				var checked = 0, unchecked = 0,
				total = dataTable.length;
				angular.forEach(dataTable, function(item) {
					checked   +=  (checkboxes.items[item[field]]) || 0;
					unchecked += (!checkboxes.items[item[field]]) || 0;
				});
				if ((unchecked == 0) || (checked == 0)) {
					checkboxes.checked = (checked == total);
				}

				/*grayed checkbox*/
				angular.element($element[0].getElementsByClassName("select-all")).prop("indeterminate", (checked != 0 && unchecked != 0));
			}, true);
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