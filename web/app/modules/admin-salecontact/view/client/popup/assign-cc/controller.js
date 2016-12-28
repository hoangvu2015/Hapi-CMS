;(function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('assignCcCtrl', assignCcCtrl);

	function assignCcCtrl($scope, $state, $bzPopup, $uibModalInstance, 
		VIETNAM_MAP, authSvc, contact, type, assignContactSvc, bzResourceSvc){
		var vmACC = this;
		// Vars
		vmACC.queryParams = {};
		vmACC.contact = contact;
		vmACC.type = type;
		/*format huyện tỉnh*/
		vmACC.province = VIETNAM_MAP[0][vmACC.contact.level_1.province];
		if(vmACC.province) {
			vmACC.provinceName = vmACC.province.name;
			vmACC.district = vmACC.province['districts'][vmACC.contact.level_1.district];
		}

		// Methods
		vmACC.submit = submit;

		// Init
		initFormData();
		getData();

		function getData(data){

		}

		function initFormData(){
			vmACC.submitted = false;
			vmACC.lockForm = false;

			vmACC.formData = {
				action: 'Bàn giao cho CMD',
				type: 'salecontact',
				note_cmd: '',	//note CMD
				_dest_id: authSvc.getProfile().uid,
				_uid: authSvc.getProfile().uid,
				_id: contact._id 	//dùng gửi mail
			};

		}

		function submit(isValid){
			vmACC.submitted = true;

			if(!vmACC.lockForm && isValid){
				vmACC.lockForm = true;

				assignContactSvc.postAssignCMD(vmACC.formData)
				.then(function(resp){
					// console.log('CCokokok',resp);
					$state.go('contactsaleman',{uid:authSvc.getProfile().uid});

					$uibModalInstance.close(resp);
					// Lưu lịch sử
					/*bzResourceSvc.api(settingJs.configs.adminUrl + '/log')
					.save({}, vmACC.formData, function(resp){
						$bzPopup.close();
					});*/
				});
			}
		}
	}
})();