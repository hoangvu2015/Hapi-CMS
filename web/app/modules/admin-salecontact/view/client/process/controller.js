var saleContactProcCtrl = (function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('saleContactProcCtrl', saleContactProcCtrl);

	function saleContactProcCtrl($scope, $state, $filter, $stateParams, $bzPopup, $timeout,
		VIETNAM_MAP, LEANRNER_LEVEL_LIST, CAREER_LIST, BANK_LIST, LEVEL_LIST, CARESTATUS_LIST, QUALITYCALL_LIST, SOURCE_LIST, 
		Upload, authSvc, saleContactSvc, assignContactSvc, bzResourceSvc, logSvc){
		var mvSCP = this;

		/*XÉT QUYỀN TRUY CẬP ROUTER*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSale()) ){
			$state.go('error403');
		}
		if(!$stateParams.id){
			$state.go('error404');
		}
		/*END XÉT QUYỀN TRUY CẬP ROUTER*/

		// Vars
		mvSCP.dateTimeOptions = {locale:{format: 'DD/MM/YYYY h:mm A'}, timePicker: true, timePickerIncrement: 5};

		mvSCP.userAuth = authSvc.getProfile();
		mvSCP.roleManager =  authSvc.isSuperAdmin() || authSvc.isSaleManager();
		mvSCP.queryParams = $stateParams;
		mvSCP.contact = {};
		mvSCP.contactAssign = {};
		mvSCP.regDup = [];
		mvSCP.constLearnerLevel = LEANRNER_LEVEL_LIST;
		mvSCP.constCareer = CAREER_LIST;
		mvSCP.constBank = BANK_LIST;
		mvSCP.constLevel = LEVEL_LIST;
		mvSCP.constCare = CARESTATUS_LIST;
		mvSCP.constQtyCall = QUALITYCALL_LIST;
		mvSCP.contsSourceList = SOURCE_LIST;
		mvSCP.constMap = VIETNAM_MAP;

		// Methods
		mvSCP.findObject = helperJs.findObject;
		mvSCP.submit = submit;
		mvSCP.popupAssignToSaleman = assignContactSvc.assignSaleman;
		mvSCP.popupAssignToCMD = assignContactSvc.assignCMD;
		mvSCP.uploadPDF = uploadPDF;
		mvSCP.addPay = addPay;
		mvSCP.editPay = editPay;

		// Init
		getData();
		getHistory();

		function initFormData(data){
			mvSCP.submittedCallInfo = false;
			mvSCP.lockFormCallInfo = false;

			mvSCP.submittedLevel1 = false;
			mvSCP.lockFormLevel1 = false;

			mvSCP.submittedLevel27 = false;
			mvSCP.lockFormLevel27 = false;

			mvSCP.submittedLevel8 = false;
			mvSCP.lockFormLevel8 = false;

			data.call_info = data.call_info || {};
			data.level_1 = data.level_1 || {};
			data.level_2 = data.level_2 || {};
			data.level_3 = data.level_3 || {};
			data.level_4 = data.level_4 || {};
			data.level_5 = data.level_5 || {};
			data.level_6 = data.level_6 || {};
			data.level_7 = data.level_7 || {};
			data.level_8 = data.level_8 || {};

			/*Form thông tin contact*/
			mvSCP.formData = {
				call_info: {
					call_level: data.call_info.call_level,
					call_status: data.call_info.call_status || '',
					call_quality: data.call_info.call_quality,
					call_note: data.call_info.call_note,
					recall_schedule: data.call_info.recall_schedule,
					is_recall_schedule: data.call_info.is_recall_schedule,
					care_status: data.call_info.care_status,
					history: data.call_info.history,
				},
				level_1:{
					name: data.level_1.name,
					name_kid: data.level_1.name_kid,
					email: data.level_1.email,
					skype: data.level_1.skype,
					phone: data.level_1.phone,
					phone2: data.level_1.phone2,
					age: data.level_1.age,
					dob: data.level_1.dob,
					source_contact: data.level_1.source_contact,
					career: data.level_1.career,
					address: data.level_1.address,
					province: data.level_1.province,
					district: data.level_1.district,
					learn_info: data.level_1.learn_info,
					learn_begin_at: data.level_1.learn_begin_at,
					teacher_request: data.level_1.teacher_request
				},
				level_2: {
					type: data.level_2.type,
					learner_demand: data.level_2.learner_demand,
					learner_level: data.level_2.learner_level
				},
				level_3: {
					accept_test: data.level_3.accept_test,
					schedule_inteview: data.level_3.schedule_inteview
				},
				level_4: {
					inteview_or_online: data.level_4.inteview_or_online,
				},
				level_5: {
					is_tested: data.level_5.is_tested,
					test_file: data.level_5.test_file,
				},
				level_6: {
					received_distance: data.level_6.received_distance,
				},
				level_7: {
					fee_partial: data.level_7.fee_partial,
				},
				level_8: {
					money_finish: data.level_8.money_finish,
					pay_type: data.level_8.pay_type,
					bank: data.level_8.bank,
					is_received_money: data.level_8.is_received_money,
					history: data.level_8.history || [],
				},
				dup: data.dup
			};

			/*Set biến tmp model của level 8*/
			if(data.level_8.history.length > 0){
				mvSCP.level8Btn = 'update';
				let lg =data.level_8.history.length;
				mvSCP.dataFormLevel_8 = {
					money_finish: data.level_8.history[lg-1].money_finish,
					pay_type: data.level_8.history[lg-1].pay_type,
					bank: data.level_8.history[lg-1].bank,
					is_received_money: data.level_8.history[lg-1].is_received_money,
				};
			}
			else{
				mvSCP.level8Btn = 'add';

				mvSCP.dataFormLevel_8 = {
					money_finish: data.level_8.money_finish,
					pay_type: data.level_8.pay_type,
					bank: data.level_8.bank,
					is_received_money: data.level_8.is_received_money,
				};
			}

			/*Dùng để kiểm tra giá trị hiện tại có khác với giá trị ban đầu ko*/
			mvSCP.checkHistory = {};
			mvSCP.checkHistory.call_info = angular.copy(mvSCP.formData.call_info);
		}

		function getData(){
			saleContactSvc.get({id: mvSCP.queryParams.id}, function(resp){
				/*hạn chế quyền truy cập cả saleman thường khi vào contact của saleman khác */
				if(!(authSvc.isSuperAdmin() || authSvc.isSaleManager())
					&&(resp.contact._sale_usermember != authSvc.getProfile().id))
				{
					$state.go('error404');
				}
				/*Xử lý dữ liệu*/
				mvSCP.contact = resp.contact;
				mvSCP.contactAssign[resp.contact._id] = true;
				mvSCP.regDup = resp.dup;
				initFormData(resp.contact);
			});
		}

		/*Lấy lịch sử thao tác*/
		function getHistory(){
			logSvc.getLogContact(mvSCP.queryParams.id)
			.then(function(resp){
				// console.log('his', resp);
				mvSCP.histories = resp.items;
			});
		}

		/*Action Khi click thêm lịch sử đóng tiền*/
		function addPay(){
			mvSCP.level8Btn = 'add';
			mvSCP.dataFormLevel_8 = {
				money_finish: 0,
				pay_type: '',
				bank: '',
				is_received_money: false
			};
		}

		/*Action Khi click sửa lịch sử đóng tiền*/
		function editPay(histr){
			mvSCP.level8Btn = 'edit-history';
			mvSCP.tmpHisL8 = angular.copy(histr);
			mvSCP.dataFormLevel_8 = {
				money_finish: 		mvSCP.tmpHisL8.money_finish,
				pay_type: 			mvSCP.tmpHisL8.pay_type,
				bank: 				mvSCP.tmpHisL8.bank,
				is_received_money: 	mvSCP.tmpHisL8.is_received_money,
			};
		}

		/*Action Khi click Cập Nhật lịch sử đóng tiền*/
		function submit(type, isValid){
			var msg = {
				title: 'Liên hệ',
				success: 'Cập nhật thành công.',
				error: 'Lỗi không thể cập nhật dữ liệu.'
			};
			var dataSend = {};

			switch(type){
				case 'callinfo':
				mvSCP.submittedCallInfo = true;

				msg.success = 'Cập nhật thông tin cuộc gọi thành công.';
				msg.error = 'Không thể cập nhật thông tin cuộc gọi.';

				if(!mvSCP.lockFormCallInfo && isValid){
					mvSCP.lockFormCallInfo = true;

					/*Nếu thông tin cuộc gọi có thay đổi thì lưu lịch sử*/
					if(!angular.equals(mvSCP.formData.call_info, mvSCP.checkHistory.call_info)){
						/*Set Level cho Contact*/
						if(mvSCP.formData.call_info.call_status)
							mvSCP.formData.call_info.call_level = mvSCP.formData.call_info.call_status.split("_")[0];
						else 
							mvSCP.formData.call_info.call_level = 0;

						/*push history vào call_info.history*/
						var hisCallInfo = angular.copy(mvSCP.formData.call_info);
						delete hisCallInfo.history;
						hisCallInfo.createdAt = new Date();
						mvSCP.formData.call_info.history.push(hisCallInfo);
						/*Xét lại biến check history để kiểm tra lần sau*/
						mvSCP.checkHistory.call_info = angular.copy(mvSCP.formData.call_info);
						/*Lưu lịch sử thì trạng thái trùng trở về false*/
						mvSCP.formData.dup = Boolean(0);
					}

					/*Format data and Save Contact*/
					var dataForm = angular.copy(mvSCP.formData);
					dataSend.call_info = dataForm.call_info;
					dataSend.dup = dataForm.dup;

					save(dataSend, msg, function(){
						mvSCP.lockFormCallInfo = false;
					}, function(){
						mvSCP.lockFormCallInfo = false;
					});
				}
				break;
				case 'level1':
				mvSCP.submittedLevel1 = true;

				if(!mvSCP.lockFormLevel1 && isValid){
					mvSCP.lockFormLevel1 = true;

					/*Format data and Save Contact*/
					var dataForm = angular.copy(mvSCP.formData);
					dataSend.level_1 = dataForm.level_1;
					save(dataSend, msg, function(){
						mvSCP.lockFormLevel1 = false;
					}, function(){
						mvSCP.lockFormLevel1 = false;
					});
				}
				break;
				case 'level27':
				mvSCP.submittedLevel27 = true;

				if(!mvSCP.lockFormLevel27 && isValid){
					mvSCP.lockFormLevel27 = true;

					/*Format data and Save Contact*/
					var dataForm = angular.copy(mvSCP.formData);
					dataSend.level_2 = dataForm.level_2;
					dataSend.level_3 = dataForm.level_3;
					dataSend.level_4 = dataForm.level_4;
					dataSend.level_5 = dataForm.level_5;
					dataSend.level_6 = dataForm.level_6;
					dataSend.level_7 = dataForm.level_7;
					save(dataSend, msg, function(){
						mvSCP.lockFormLevel27 = false;
					}, function(){
						mvSCP.lockFormLevel27 = false;
					});
				}
				break;
				case 'level8':
				mvSCP.submittedLevel8 = true;

				if(!mvSCP.lockFormLevel8 && isValid){
					mvSCP.lockFormLevel8 = true;

					/*Format data and Save Contact*/
					if(mvSCP.level8Btn == 'update'){
						/*Update lại history mới nhất*/
						let lg = mvSCP.formData.level_8.history.length;
						mvSCP.formData.level_8.history[lg-1].money_finish = mvSCP.dataFormLevel_8.money_finish;
						mvSCP.formData.level_8.history[lg-1].pay_type = mvSCP.dataFormLevel_8.pay_type;
						mvSCP.formData.level_8.history[lg-1].bank = mvSCP.dataFormLevel_8.bank;
						mvSCP.formData.level_8.history[lg-1].is_received_money = mvSCP.dataFormLevel_8.is_received_money;

						dataSend.level_8 = {};
						dataSend.level_8 = mvSCP.dataFormLevel_8;
						dataSend.level_8.history = mvSCP.formData.level_8.history;

					} else if(mvSCP.level8Btn == 'add'){
						/*Xử lý thêm lịch sử vào biến history*/
						var tmpHis8 = angular.copy(mvSCP.dataFormLevel_8);
						tmpHis8._sale_usermember = mvSCP.contact._sale_usermember;
						tmpHis8.type = mvSCP.contact.level_2.type || 'work';
						mvSCP.formData.level_8.history.push(tmpHis8);

						dataSend.level_8 = {};
						dataSend.level_8 = mvSCP.dataFormLevel_8;
						dataSend.level_8.history = mvSCP.formData.level_8.history;
					} else if(mvSCP.level8Btn == 'edit-history'){

						dataSend.level_8 = {};
						/*Nếu đang edit history mới nhất thì update lại*/
						if(mvSCP.formData.level_8.history[0]._id == mvSCP.tmpHisL8._id){
							dataSend.level_8 = mvSCP.dataFormLevel_8;
						}else{
							dataSend.level_8 = {
								money_finish: mvSCP.formData.level_8.money_finish,
								pay_type: mvSCP.formData.level_8.pay_type,
								bank: mvSCP.formData.level_8.bank,
								is_received_money: mvSCP.formData.level_8.is_received_money,
							};
						}
						/*Set lại history*/
						if(mvSCP.tmpHisL8){
							for ( var k in mvSCP.formData.level_8.history) {
								if (mvSCP.formData.level_8.history.hasOwnProperty(k)) {
									if(mvSCP.formData.level_8.history[k]._id == mvSCP.tmpHisL8._id){
										mvSCP.formData.level_8.history[k].money_finish = mvSCP.dataFormLevel_8.money_finish;
										mvSCP.formData.level_8.history[k].pay_type = mvSCP.dataFormLevel_8.pay_type;
										mvSCP.formData.level_8.history[k].bank = mvSCP.dataFormLevel_8.bank;
										mvSCP.formData.level_8.history[k].is_received_money = mvSCP.dataFormLevel_8.is_received_money;
									}
								}
							}
						}
						dataSend.level_8.history = mvSCP.formData.level_8.history;
					}

					save(dataSend, msg, function(){
						mvSCP.lockFormLevel8 = false;
					}, function(){
						mvSCP.lockFormLevel8 = false;
					});
				}
				break;
			}
		}

		function save(data, messages, successCb, errorCb){
			/*Save*/
			var promise = saleContactSvc.update({id: mvSCP.queryParams.id}, data).$promise;
			promise.then(function(resp){
				mvSCP.contact = resp;
				$bzPopup.toastr({
					type: 'success',
					data:{
						title: messages.title,
						message: messages.success
					}
				});

				if(angular.isFunction(successCb)){
					successCb();
				}
				$timeout(function(){$state.reload();},500);
			}, function(err){
				$bzPopup.toastr({
					type: 'error',
					data:{
						title: messages.title,
						message: messages.error
					}
				});

				if(angular.isFunction(errorCb)){
					errorCb();
				}
				$timeout(function(){$state.reload();},500);
			});
		}

		function uploadPDF(file){
			if(file == null) return;
			Upload.upload({
				url: settingJs.configs.adminUrl + '/sale-contact/upload-file-test',
				data: {
					file: file, 
					type:'pdf_test', 
					prefix: mvSCP.contact._id, 
					id: mvSCP.contact._id
				}
			}).then(function (resp) {
				setTimeout(function() {
					saleContactSvc.get({id: mvSCP.queryParams.id}, function(resp1){
						mvSCP.formData.level_5.test_file = resp1.contact.level_5.test_file;
						$bzPopup.toastr({
							type: 'Success',
							data:{
								title: 'Thành công!',
								message: 'Upload file thành công!'
							}
						});
					});
				}, 2000);
			}, function (err) {
				// console.log('Error status: ', err);
				$bzPopup.toastr({
					type: 'error',
					data:{
						title: 'Lỗi!',
						message: 'Upload file Lỗi!'
					}
				});
			}, function (evt) {
				$scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
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
