var usersaleCtrl = (function(){
	'use strict';

	angular
	.module('bzUser')
	.controller('usersaleCtrl', usersaleCtrl);

	function usersaleCtrl($scope, $window, $state, $stateParams, $bzPopup, $uibModal, userRoles, authSvc, NgTableParams, ngTableEventsChannel, bzResourceSvc){
		/* jshint validthis: true */
		var vmUSale = this;

		/*XÉT QUYỀN TRUY CẬP ROUTER*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSaleManager()) ){
			$state.go('error403');
		}
		/*END XÉT QUYỀN TRUY CẬP ROUTER*/

		// Vars
		vmUSale.loading = true;
		vmUSale.selectedItems = [];
		vmUSale.queryParams = $stateParams;

		vmUSale.userRoles = userRoles;
		// console.log('test', userRoles);
		vmUSale.users = [];

		// Methods
		vmUSale.filter = filter;
		vmUSale.filterReset = filterReset;
		vmUSale.active = active;
		vmUSale.sort = sort;
		vmUSale.remove = remove;

		// Init
		getData();

		ngTableEventsChannel.onPagesChanged(function() {
			$scope.vmUSale.queryParams.page = vmUSale.table.page();
			$state.go('.',$scope.vmUSale.queryParams);
		}, $scope, vmUSale.table);

		function getData(){
			bzResourceSvc.api($window.settings.services.userApi + '/user')
			.get(vmUSale.queryParams, function(resp){
				vmUSale.queryParams.pageCount = resp.totalPage;
				vmUSale.users = resp.items;
				console.log('test',vmUSale.users);

				vmUSale.table = new NgTableParams({count: 10}, {
					counts: [],
					getData: function(params) {
						params.total(resp.totalItems);
						return vmUSale.users;
					}
				});
				vmUSale.table.page(vmUSale.queryParams.page);
				vmUSale.loading = false;
			});
		}

		function filter(params){
			$state.go('.', angular.extend(params, saleContact.queryParams),
				{notify:false})
			.then(function(){
				$state.reload();
			});
		}

		function filterReset(){
			$state.go('.', {
				publish: null,
				cateid: null,
				keyword: null,
				limit: settingJs.admin.itemPerPage
			}, {notify:false})
			.then(function(){
				$state.reload();
			});
		}

		function active(id, value){
			bzResourceSvc.api($window.settings.services.userApi + '/user/:id', {id:'@id'})
			.update({_id: id}, {status: value}, function(resp){
				$bzPopup.toastr({
					type: 'success',
					data:{
						title: 'User',
						message: value === 1 ? 'Kích hoạt tài khoản thành công!' : 'Vô hiệu hóa tài khoản thành công!'
					}
				});

				$state.reload();
			});
		}

		function sort(id, value){
			$bzPopup.toastr({
				type: 'success',
				data:{
					title: 'Cập nhật',
					message: 'Cập nhật thứ tự bài viết thành công!'
				}
			});
		}

		function remove(id){
			var selected = {ids: [id]}; //id ? {ids: [id]} : getSelectedIds();
			console.log('asd',id);

			var modalInstance = $uibModal.open({
				animation:true,
				templateUrl: 'assets/global/message/view.html',
				controller: function($scope, $uibModalInstance){
					$scope.popTitle = 'Xóa'; 
					$scope.message = 'Bạn chắc chắn sẽ xóa dữ liệu này?'; 
					$scope.ok = function(){
						bzResourceSvc.api($window.settings.services.userApi + '/user/:id', {id: '@id'})
						.delete({id: selected.ids}, function(resp){
							$bzPopup.toastr({
								type: 'success',
								data:{
									title: 'Xóa',
									message: 'Xóa bài viết thành công!'
								}
							});
							$state.reload();
							$uibModalInstance.close();
						});
					};
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