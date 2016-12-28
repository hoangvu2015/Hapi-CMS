;(function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('assignSalemanCtrl', assignSalemanCtrl);

	function assignSalemanCtrl($scope, $rootScope, $state, $window, $bzPopup, $uibModalInstance, $timeout,
		authSvc, contact, type,  assignContactSvc, saleContactSvc, bzResourceSvc){
		var vmASM = this;

		// Vars
		vmASM.queryParams = {};
		vmASM.contact = contact;
		vmASM.type = type;
		// console.log('ggg',contact);
		// Methods
		vmASM.submit = submit;

		// Init
		getSaleman();
		initFormData();

		function initFormData(){
			vmASM.submitted = false;
			vmASM.lockForm = false;


			vmASM.formData = {
				_user_src: authSvc.getProfile().uid,
				_user_dest: '',
				note: '',
				content: '',
				date_assign_saleman: new Date()
			};
		}

		function getSaleman(){
			assignContactSvc.getSalemanAssign().then(function(resp){
				vmASM.salemans = resp.items;
				// console.log('test',vmASM.salemans);
				for (let k in vmASM.salemans) {
					if (vmASM.salemans.hasOwnProperty(k)) {
						if(typeof vmASM.salemans[k].saleman != 'undefined'){
							if(vmASM.salemans[k].saleman.types){
								vmASM.salemans[k].typesText = ' (' + vmASM.salemans[k].saleman.types.toString() + ')';
							}
						}
					}
				}
			});
		}

		function submit(isValid){
			vmASM.submitted = true;

			if(!vmASM.lockForm && isValid){
				vmASM.lockForm = true;

				var emailDest = '';
				for (var i = 0; i < vmASM.salemans.length; i++) {
					if(vmASM.salemans[i]._id == vmASM.formData._user_dest){
						emailDest = vmASM.salemans[i].email;
					}
				}

				if(vmASM.type === 'multiple'){
					let data = {
						email_dest: emailDest,
						contacts: vmASM.contact,
						formData: vmASM.formData
					};
					assignContactSvc.assignForSalemans(data).then(function(resp){
						$rootScope.$emit('angular-changeNoti');
					});
				}else{
					// Cập nhật người nhận
					// saleContactSvc.update({id: vmASM.formData.payload._id_contact}, {
					// 	_sale_userconvert: authSvc.getProfile().uid,
					// 	_sale_usermember: vmASM.formData.payload.info_current_dest._id,
					// 	note_saleman: vmASM.formData.payload.note,
					// 	date_receive: new Date()
					// }, function(resp){
						// Lưu lịch sử
						// for (var i = 0; i < vmASM.salemans.length; i++) {
						// 	if(vmASM.salemans[i]._id == vmASM.formData.payload.info_current_dest._id ){
						// 		vmASM.formData.payload.info_current_dest._id = vmASM.salemans[i]._id;
						// 		vmASM.formData.payload.info_current_dest.name = vmASM.salemans[i].name;
						// 		vmASM.formData.payload.info_current_dest.email = vmASM.salemans[i].email;
						// 	}
						// }
						// bzResourceSvc.api(settingJs.configs.logApiUrl + '/log')
						// .save({}, vmASM.formData, function(resp){
						// });

						
					// });
				}
				$timeout(function(){
					$state.reload();
				},1000);
				$uibModalInstance.close();
				vmASM.lockForm = false;
			}
		}
	}
})();