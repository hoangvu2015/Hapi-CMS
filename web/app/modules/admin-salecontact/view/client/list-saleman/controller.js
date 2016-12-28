var contactSalemanCtrl = (function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('contactSalemanCtrl', contactSalemanCtrl);

	function contactSalemanCtrl($scope, $log, $state, $stateParams, $uibModal, $bzPopup, $filter, $element, $timeout,
		authSvc, LEVEL_LIST, CARESTATUS_LIST, QUALITYCALL_LIST, NgTableParams, ngTableEventsChannel, 
		saleContactSvc, assignContactSvc, bzResourceSvc){
		/* jshint validthis: true */
		var vmCSM = this;

		/*=========XÉT QUYỀN TRUY CẬP ROUTER=========*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSale()) ){
			$state.go('error403');
		}
		/*=======END XÉT QUYỀN TRUY CẬP ROUTER=======*/


		/*=======VARS=======*/
		vmCSM.loading = true;
		vmCSM.queryParams = $stateParams;


		if(authSvc.isSuperAdmin() || authSvc.isSaleManager())
			vmCSM.queryParams.uid = $stateParams.uid || authSvc.getProfile().uid;
		else
			vmCSM.queryParams.uid = authSvc.getProfile().uid;

		vmCSM.contacts = [];
		vmCSM.userSaleActive = [];
		vmCSM.totalFilters = {};
		vmCSM.constLevel = LEVEL_LIST;
		vmCSM.constCare = CARESTATUS_LIST;
		vmCSM.checkboxes = {
			checked: false,
			items: {}
		};

		/*==================METHODS==================*/
		vmCSM.changeSaleman = changeSaleman;
		vmCSM.linkFilter = linkFilter;
		vmCSM.filter = filter;
		vmCSM.remove = remove;
		vmCSM.filterReset = filterReset;
		vmCSM.findObject = helperJs.findObject;
		vmCSM.popupAssignToCMD = assignContactSvc.assignCMD;
		vmCSM.evict = evict;

		/*==================INIT==================*/
		angular.element('#reservationtime').daterangepicker({
			startDate: $filter('date')(vmCSM.queryParams.startDate, 'd/M/yyyy h:mm:ss a'),
			endDate: $filter('date')(vmCSM.queryParams.endDate, 'd/M/yyyy h:mm:ss a'),
			timePicker: true,
			timePickerIncrement: 30,
			locale: {
				format: 'DD/MM/YYYY h:mm A'
			}
		});

		angular.element('#reservationtime').on('apply.daterangepicker', function(ev, picker) {
			/*do something, like calling a function*/
			vmCSM.queryParams.startDate = picker.startDate.toISOString();
			vmCSM.queryParams.endDate = picker.endDate.toISOString();
			vmCSM.linkFilter('filterDay','orther');
		});

		getData();

		ngTableEventsChannel.onPagesChanged(function() {
			$scope.vmCSM.queryParams.page = vmCSM.table.page();
			$state.go('.',$scope.vmCSM.queryParams);
		}, $scope, vmCSM.table);

		/*==================FUNTION==================*/

		function getData(){
			saleContactSvc.get(vmCSM.queryParams, function(resp){
				vmCSM.totalFilters = resp.totalFilters;
				vmCSM.contacts = resp.items;
				vmCSM.userSaleActive = resp.userSaleActive;
				vmCSM.table = new NgTableParams({count: 10}, {
					counts:[],
					getData: function(params) {
						params.total(resp.totalItems);
						return vmCSM.contacts;
					}
				});
				vmCSM.table.page(vmCSM.queryParams.page);
				vmCSM.loading = false;
				initSelecteds(vmCSM.contacts, vmCSM.checkboxes, '_id');
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

		/*Thay đổi saleman hiển thị*/
		function changeSaleman(id){
			$state.go('.', vmCSM.queryParams , {notify:false}).then(function(){
				$state.reload();
			});
		}

		function linkFilter(field, value){
			vmCSM.queryParams.page = 1;
			vmCSM.queryParams[field] = value;

			$state.go('.', vmCSM.queryParams , {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filter(params){
			vmCSM.queryParams.page = 1;
			$state.go('.', vmCSM.queryParams, {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filterReset(){
			vmCSM.queryParams.keyword 			= null;
			vmCSM.queryParams.type 				= null;
			vmCSM.queryParams.is_finish 		= null;
			vmCSM.queryParams.call_status 		= null;
			vmCSM.queryParams.care_status 		= null;
			vmCSM.queryParams.call_level 		= null;
			vmCSM.queryParams.is_recall_schedule = null;
			vmCSM.queryParams.schedule_inteview = null;
			vmCSM.queryParams.filterDay 		= null;
			vmCSM.queryParams.startDate 		= null;
			vmCSM.queryParams.endDate 			= null;
			vmCSM.queryParams.dup 				= null;

			$state.go('.', vmCSM.queryParams, {notify:false})
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
			console.log('test',vmCSM.checkboxes.items);
			var modalInstance = $uibModal.open({
				animation:true,
				templateUrl: 'assets/global/message/view.html',
				controller: function($scope, $uibModalInstance){
					$scope.popTitle = "Thu hồi Contacts";
					$scope.message = "Bạn có chắc muốn thu hồi những Contacts đã chọn";
					$scope.ok = function(){
						assignContactSvc.evictContact(vmCSM.checkboxes).then(function(resp){
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