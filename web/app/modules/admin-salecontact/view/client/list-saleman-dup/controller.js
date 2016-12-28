var contactSalemanDupCtrl = (function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('contactSalemanDupCtrl', contactSalemanDupCtrl);

	function contactSalemanDupCtrl($scope, $log, $state, $stateParams, $uibModal, $bzPopup, $filter, $element, $timeout,
		authSvc, LEVEL_LIST, CARESTATUS_LIST, QUALITYCALL_LIST, NgTableParams, ngTableEventsChannel, 
		saleContactSvc, assignContactSvc, bzResourceSvc){
		/* jshint validthis: true */
		var vmCSMD = this;

		/*=========XÉT QUYỀN TRUY CẬP ROUTER=========*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSale()) ){
			$state.go('error403');
		}
		/*=======END XÉT QUYỀN TRUY CẬP ROUTER=======*/


		/*=======VARS=======*/
		vmCSMD.loading = true;
		vmCSMD.queryParams = $stateParams;


		if(authSvc.isSuperAdmin() || authSvc.isSaleManager())
			vmCSMD.queryParams.uid = $stateParams.uid || authSvc.getProfile().uid;
		else
			vmCSMD.queryParams.uid = authSvc.getProfile().uid;

		vmCSMD.contacts = [];
		vmCSMD.userSaleActive = [];
		vmCSMD.totalFilters = {};
		vmCSMD.constLevel = LEVEL_LIST;
		vmCSMD.constCare = CARESTATUS_LIST;
		vmCSMD.checkboxes = {
			checked: false,
			items: {}
		};

		/*==================METHODS==================*/
		vmCSMD.changeSaleman = changeSaleman;
		vmCSMD.linkFilter = linkFilter;
		vmCSMD.filter = filter;
		vmCSMD.remove = remove;
		vmCSMD.filterReset = filterReset;
		vmCSMD.findObject = helperJs.findObject;
		vmCSMD.popupAssignToCMD = assignContactSvc.assignCMD;
		vmCSMD.evict = evict;

		/*==================INIT==================*/
		angular.element('#reservationtime').daterangepicker({
			startDate: $filter('date')(vmCSMD.queryParams.startDate, 'd/M/yyyy h:mm:ss a'),
			endDate: $filter('date')(vmCSMD.queryParams.endDate, 'd/M/yyyy h:mm:ss a'),
			timePicker: true,
			timePickerIncrement: 30,
			locale: {
				format: 'DD/MM/YYYY h:mm A'
			}
		});

		angular.element('#reservationtime').on('apply.daterangepicker', function(ev, picker) {
			/*do something, like calling a function*/
			vmCSMD.queryParams.startDate = picker.startDate.toISOString();
			vmCSMD.queryParams.endDate = picker.endDate.toISOString();
			vmCSMD.linkFilter('filterDay','orther');
		});

		getData();

		ngTableEventsChannel.onPagesChanged(function() {
			$scope.vmCSMD.queryParams.page = vmCSMD.table.page();
			$state.go('.',$scope.vmCSMD.queryParams);
		}, $scope, vmCSMD.table);

		/*==================FUNTION==================*/

		function getData(){
			saleContactSvc.get(vmCSMD.queryParams, function(resp){
				vmCSMD.totalFilters = resp.totalFilters;
				vmCSMD.contacts = resp.items;
				vmCSMD.userSaleActive = resp.userSaleActive;
				vmCSMD.table = new NgTableParams({count: 10}, {
					counts:[],
					getData: function(params) {
						params.total(resp.totalItems);
						return vmCSMD.contacts;
					}
				});
				vmCSMD.table.page(vmCSMD.queryParams.page);
				vmCSMD.loading = false;
				initSelecteds(vmCSMD.contacts, vmCSMD.checkboxes, '_id');
			});
		}
		
		/*Thay đổi saleman hiển thị*/
		function changeSaleman(id){
			$state.go('.', vmCSMD.queryParams , {notify:false}).then(function(){
				$state.reload();
			});
		}

		function linkFilter(field, value){
			vmCSMD.queryParams.page = 1;
			vmCSMD.queryParams[field] = value;

			$state.go('.', vmCSMD.queryParams , {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filter(params){
			vmCSMD.queryParams.page = 1;
			$state.go('.', vmCSMD.queryParams, {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filterReset(){
			vmCSMD.queryParams.keyword 			= null;
			vmCSMD.queryParams.type 				= null;
			vmCSMD.queryParams.is_finish 		= null;
			vmCSMD.queryParams.call_status 		= null;
			vmCSMD.queryParams.care_status 		= null;
			vmCSMD.queryParams.call_level 		= null;
			vmCSMD.queryParams.is_recall_schedule = null;
			vmCSMD.queryParams.schedule_inteview = null;
			vmCSMD.queryParams.filterDay 		= null;
			vmCSMD.queryParams.startDate 		= null;
			vmCSMD.queryParams.endDate 			= null;

			$state.go('.', vmCSMD.queryParams, {notify:false})
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

		/*Thu hồi contacts*/
		function evict(){
			var modalInstance = $uibModal.open({
				animation:true,
				templateUrl: 'assets/global/message/view.html',
				controller: function($rootScope, $scope, $uibModalInstance){
					$scope.popTitle = "Thu hồi Contacts";
					$scope.message = "Bạn có chắc muốn thu hồi những Contacts đã chọn";
					$scope.ok = function(){
						assignContactSvc.evictContact(vmCSMD.checkboxes).then(function(resp){
							
							var dataNoti = {
								_sale_usermember: authSvc.getProfile().id,
							};
							$rootScope.$emit('angular-changeNoti');
							$timeout(function(){
								$state.reload();
							},1000);
							$timeout(function(){
								$uibModalInstance.close();
							},300);

						});
					}
				}
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