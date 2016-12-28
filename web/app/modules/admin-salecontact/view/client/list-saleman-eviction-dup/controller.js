var contactSalemanEvictDupCtrl = (function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('contactSalemanEvictDupCtrl', contactSalemanEvictDupCtrl);

	function contactSalemanEvictDupCtrl($scope, $log, $state, $stateParams, $uibModal, $bzPopup, $filter, $element,
		authSvc, LEVEL_LIST, CARESTATUS_LIST, QUALITYCALL_LIST, NgTableParams, ngTableEventsChannel, 
		saleContactSvc, assignContactSvc, bzResourceSvc){
		/* jshint validthis: true */
		var mvCSMED = this;

		/*=========XÉT QUYỀN TRUY CẬP ROUTER=========*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSaleManager()) ){
			$state.go('error403');
		}
		/*=======END XÉT QUYỀN TRUY CẬP ROUTER=======*/


		/*=======VARS=======*/
		mvCSMED.loading = true;
		mvCSMED.queryParams = $stateParams;


		// if(authSvc.isSuperAdmin() || authSvc.isSaleManager())
		// 	mvCSMED.queryParams.uid = $stateParams.uid || authSvc.getProfile().uid;
		// else
		// 	mvCSMED.queryParams.uid = authSvc.getProfile().uid;

		mvCSMED.contacts = [];
		mvCSMED.userSaleActive = [];
		mvCSMED.totalFilters = {};
		mvCSMED.constLevel = LEVEL_LIST;
		mvCSMED.constCare = CARESTATUS_LIST;
		mvCSMED.checkboxes = {
			checked: false,
			items: {}
		};

		/*==================METHODS==================*/
		mvCSMED.changeSaleman = changeSaleman;
		mvCSMED.linkFilter = linkFilter;
		mvCSMED.filter = filter;
		mvCSMED.remove = remove;
		mvCSMED.filterReset = filterReset;
		mvCSMED.findObject = helperJs.findObject;
		mvCSMED.popupAssignToCMD = assignContactSvc.assignCMD;
		mvCSMED.popupAssignToSaleman = assignContactSvc.assignSaleman;

		/*==================INIT==================*/
		angular.element('#reservationtime').daterangepicker({
			startDate: $filter('date')(mvCSMED.queryParams.startDate, 'd/M/yyyy h:mm:ss a'),
        	endDate: $filter('date')(mvCSMED.queryParams.endDate, 'd/M/yyyy h:mm:ss a'),
			timePicker: true,
			timePickerIncrement: 30,
			locale: {
				format: 'DD/MM/YYYY h:mm A'
			}
		});

		angular.element('#reservationtime').on('apply.daterangepicker', function(ev, picker) {
			/*do something, like calling a function*/
			mvCSMED.queryParams.startDate = picker.startDate.toISOString();
			mvCSMED.queryParams.endDate = picker.endDate.toISOString();
			mvCSMED.linkFilter('filterDay','orther');
		});

		getData();

		ngTableEventsChannel.onPagesChanged(function() {
			$scope.mvCSMED.queryParams.page = mvCSMED.table.page();
			$state.go('.',$scope.mvCSMED.queryParams);
		}, $scope, mvCSMED.table);

		/*==================FUNTION==================*/

		function getData(){
			saleContactSvc.get(mvCSMED.queryParams, function(resp){
				mvCSMED.totalFilters = resp.totalFilters;
				mvCSMED.contacts = resp.items;
				mvCSMED.userSaleActive = resp.userSaleActive;
				mvCSMED.table = new NgTableParams({count: 10}, {
					counts:[],
					getData: function(params) {
						params.total(resp.totalItems);
						return mvCSMED.contacts;
					}
				});
				mvCSMED.table.page(mvCSMED.queryParams.page);
				mvCSMED.loading = false;
				initSelecteds(mvCSMED.contacts, mvCSMED.checkboxes, '_id');
			});
		}
		
		/*Thay đổi saleman hiển thị*/
		function changeSaleman(id){
			$state.go('.', mvCSMED.queryParams , {notify:false}).then(function(){
				$state.reload();
			});
		}

		function linkFilter(field, value){
			mvCSMED.queryParams.page = 1;
			mvCSMED.queryParams[field] = value;

			$state.go('.', mvCSMED.queryParams , {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filter(params){
			mvCSMED.queryParams.page = 1;
			$state.go('.', mvCSMED.queryParams, {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filterReset(){
			mvCSMED.queryParams.keyword 			= null;
			mvCSMED.queryParams.type 				= null;
			mvCSMED.queryParams.is_finish 		= null;
			mvCSMED.queryParams.call_status 		= null;
			mvCSMED.queryParams.care_status 		= null;
			mvCSMED.queryParams.call_level 		= null;
			mvCSMED.queryParams.is_recall_schedule = null;
			mvCSMED.queryParams.schedule_inteview = null;
			mvCSMED.queryParams.filterDay 		= null;
			mvCSMED.queryParams.startDate 		= null;
			mvCSMED.queryParams.endDate 			= null;

			$state.go('.', mvCSMED.queryParams, {notify:false})
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