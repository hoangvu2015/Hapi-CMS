var userEditCtrl = (function(){
	'use strict';

	angular
	.module('bzUser')
	.controller('userEditCtrl', userEditCtrl);

	function userEditCtrl($scope, $window, $state, $stateParams, $bzPopup, userRoles, authSvc, userSvc, bzResourceSvc, salemanScopes){
		var userEdit = this;

		/*XÉT QUYỀN TRUY CẬP ROUTER*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSaleManager()) ){
			$state.go('error403');
		}
		/*END XÉT QUYỀN TRUY CẬP ROUTER*/


		// Vars
		userEdit.queryParams = $stateParams;
		userEdit.userRoles = userRoles;
		userEdit.salemanScopes = salemanScopes;
		userEdit.isEditMode = userEdit.queryParams.id !== undefined;

		// Methods
		userEdit.save = save;

		// Init
		getData();

		function initFormData(data){
			userEdit.lockForm = false;
			userEdit.submitted = false;

			/*init user chung*/
			userEdit.formData = {
				name: userEdit.isEditMode ? data.name : '',
				email: userEdit.isEditMode ? data.email : '',
				password: '',
				cfpassword: '',
				roles: userEdit.isEditMode ? data.roles : ['user'],
				status: userEdit.isEditMode ? data.status : false,
				saleman: {
					active: userEdit.isEditMode ? data.saleman.active : false,
					manager: userEdit.isEditMode ? data.saleman.manager : false,
					types: userEdit.isEditMode ? data.saleman.types : [],
				}
			};
			/*init user module sale*/
			if(userEdit.queryParams.module == 'sale'){
				userEdit.formData.roles = ['admin', 'user', 'sale'];
				userEdit.formData.status = userEdit.isEditMode ? data.status : true;
			}
			/*end init user module sale*/
		}

		function getData(){
			if(userEdit.isEditMode){
				bzResourceSvc.api($window.settings.services.userApi + '/user/:id', {id: '@id'})
				.get({id: userEdit.queryParams.id}, function(resp){
					delete resp.__v;
					delete resp.password_token;
					delete resp.created;
					delete resp.provider;
					delete resp.activeToken;

					initFormData(resp);
				});
			} else {
				initFormData();
			}
		}

		function save(isValid){
			userEdit.submitted = true;

			if(!userEdit.lockForm && isValid){
				userEdit.lockForm = true;

				/*Format Status Đúng định dạng true false*/
				if(userEdit.formData.status == 1)
					userEdit.formData.status = true;
				else if(userEdit.formData.status == 0)
					userEdit.formData.status = false;

				/*Thêm User*/
				if(!userEdit.isEditMode){
					
					// delete userEdit.formData.saleman;
					userEdit.formData.cfpassword = userEdit.formData.password;
					// console.log('testxx', userEdit.formData);
					// return;
					userSvc.create(userEdit.formData).then(function(resp){
						$bzPopup.toastr({
							type: 'success',
							data:{
								title: 'Thành viên',
								message: resp.message
							}
						});

						$state.go('user-sale', {id: null});
					},function(err){
						$bzPopup.toastr({
							type: 'error',
							data:{
								title: 'Thành viên',
								message: err.data.message
							}
						});
						userEdit.lockForm = false;
					});
				}

				/*Sửa User*/
				else if(userEdit.isEditMode) {

					/*Format Status Đúng định dạng true false*/
					if(userEdit.formData.status == 1)
						userEdit.formData.status = true;
					else if(userEdit.formData.status == 0)
						userEdit.formData.status = false;

					/*Xét password mới cho user*/
					userEdit.formData.password = userEdit.tmppassword;
					userEdit.formData.cfpassword = userEdit.tmppassword;

					// userEdit.formData.cfpassword = userEdit.tmpcfpassword;
					console.log('test', userEdit.formData);

					userSvc.update(userEdit.formData, userEdit.queryParams.id).then(function(resp){
						$bzPopup.toastr({
							type: 'success',
							data:{
								title: 'Thành viên',
								message: resp.message
							}
						});

						$state.go('user-sale', {id: null});
					},function(err){
						$bzPopup.toastr({
							type: 'error',
							data:{
								title: 'Thành viên',
								message: err.data.message
							}
						});
						userEdit.lockForm = false;
					});
				}
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