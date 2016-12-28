var saleContactEditCtrl = (function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('saleContactEditCtrl', saleContactEditCtrl);

	function saleContactEditCtrl($scope, $state, $filter, $stateParams, $uibModal, $bzPopup, 
		VIETNAM_MAP, SOURCE_LIST, CAREER_LIST, authSvc, saleContactSvc){
		var saleContactEdit = this;

		/*XÉT QUYỀN TRUY CẬP ROUTER*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSale()) ){
			$state.go('error403');
		}
		/*END XÉT QUYỀN TRUY CẬP ROUTER*/

		// Vars
		saleContactEdit.queryParams = $stateParams;
		saleContactEdit.isEditMode = saleContactEdit.queryParams.id !== undefined;
		saleContactEdit.contsSourceList = SOURCE_LIST;
		saleContactEdit.constCareer = CAREER_LIST;
		saleContactEdit.constMap = VIETNAM_MAP;
		// Methods
		saleContactEdit.save = save;

		// Init
		getData();

		function initFormData(data){
			saleContactEdit.lockForm = false;
			saleContactEdit.submitted = false;
			saleContactEdit.formData = {
				type: saleContactEdit.isEditMode ? data.type : '',
				level_1:{
					name: saleContactEdit.isEditMode ? data.level_1.name : '',
					email: saleContactEdit.isEditMode ? data.level_1.email : '',
					skype: saleContactEdit.isEditMode ? data.level_1.skype : '',
					phone: saleContactEdit.isEditMode ? data.level_1.phone : '',
					phone2: saleContactEdit.isEditMode ? data.level_1.phone2 : '',
					age: saleContactEdit.isEditMode ? data.level_1.age : '',
					dob: saleContactEdit.isEditMode ? data.level_1.dob : '',
					source_contact: saleContactEdit.isEditMode ? data.level_1.source_contact : '',
					career: saleContactEdit.isEditMode ? data.level_1.career : '',
					address: saleContactEdit.isEditMode ? data.level_1.address : '',
					province: saleContactEdit.isEditMode ? data.level_1.province : '',
					district: saleContactEdit.isEditMode ? data.level_1.district : '',
					learn_info: saleContactEdit.isEditMode ? data.level_1.learn_info : ''
				}
			};
		}

		function getData(){
			if(saleContactEdit.isEditMode){
				saleContactSvc.get({id: saleContactEdit.queryParams.id}, function(resp){
					initFormData(resp);
				});
			} else {
				initFormData();
			}
		}

		function save(isValid){
			saleContactEdit.submitted = true;

			if(!saleContactEdit.lockForm && isValid){
				saleContactEdit.lockForm = true;

				var promise;

				if(saleContactEdit.isEditMode){
					promise = saleContactSvc.update({id: saleContactEdit.queryParams.id}, saleContactEdit.formData).$promise;
					promise.then(function(resp){
						if(resp){
							$bzPopup.toastr({
								type: 'success',
								data:{
									title: 'Liên hệ',
									message: 'Cập nhật liên hệ thành công!'
								}
							});

							$state.go('salecontact', {module:'saleman', uid:authSvc.getProfile().uid});
						}
					}, function(err){
						$bzPopup.toastr({
							type: 'error',
							data:{
								title: 'Liên hệ',
								message: 'Không thể cập nhật liên hệ!'
							}
						});

						saleContactEdit.lockForm = false;
					});
				}
				else {
					// console.log('asd',authSvc.getProfile(),saleContactEdit.formData);
					if(saleContactEdit.queryParams._sale_usermember){
						saleContactEdit.formData._sale_usermember = saleContactEdit.queryParams._sale_usermember;
					}

					saleContactEdit.formData.date_receive = new Date();
					promise = saleContactSvc.save({}, saleContactEdit.formData).$promise;
					promise.then(function(resp){
						/*Check khi contact bị trùng*/
						if(resp.dup){
							var modalInstance = $uibModal.open({
								animation:true,
								templateUrl: 'modules/admin-salecontact/view/client/popup/confirm-dup-contact.html',
								controller: function($scope, $uibModalInstance){
									$scope.popTitle = "Trùng Contact";
									if(resp.saleman)
										$scope.message = "Contact này đã có trong hệ thống, và saleman "+ resp.saleman.name +" đang care!";
									else
										$scope.message = "Contact này đã có trong hệ thống!";

									// $scope.ok = function(){
									// 	saleContactEdit.formData.acceptDup = true;
									// 	save(true);
									// 	$uibModalInstance.close();
									// };
									// $scope.history = function(){
									// 	$state.go('salecontactcancel',{email: saleContactEdit.formData.level_1.email});
									// 	$uibModalInstance.close();
									// };
								}
							});
							saleContactEdit.lockForm = false;
							return;
						}
						/*Thêm Thành công*/
						if(resp){
							$bzPopup.toastr({
								type: 'success',
								data:{
									title: 'Liên hệ',
									message: 'Thêm liên hệ thành công!'
								}
							});
							if(saleContactEdit.queryParams._sale_usermember)
								$state.go('contactsaleman', {uid: authSvc.getProfile().uid});
							else
								$state.go('salecontact');
						}
					}, function(err){
						$bzPopup.toastr({
							type: 'error',
							data:{
								title: 'Liên hệ',
								message: 'Không thể thêm liên hệ!'
							}
						});

						saleContactEdit.lockForm = false;
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