;(function(){
	'use strict';

	angular
	.module('bzSaleContact')
	.controller('assignContactCtrl', assignContactCtrl);

	function assignContactCtrl($rootScope, $scope, $bzPopup, $timeout, $uibModalInstance, $state, assignContactSvc){
		var mvACT = this;
		/* Begin Desription: 
		resp: emailWork là những đăng ký của work mà có email, phoneWork là đăng ký work ko email mà có phone
		Lấy list saleman từ hàm getSaleman(), 
		Chọn date và lấy contact từ hàm applyDate(),  
		Phân chia contacts cũ của saleman trươc đó hàm oldContactSM() và setOldSalemanContact(), 
		Nhập số lượng chia cho từng saleman hàm changeQuantity(), 
		Bắt đầu chia hàm save() và trong khi chia có format lại allContacs cập nhập _sale_usermember 
		End Desription*/
		
		/*Vars*/
		mvACT.tab = 'work';
		mvACT.queryParams = {};
		mvACT.queryParams.date = {startDate: null, endDate: null};

		mvACT.totalWork = {
			all: 0,		/*Tổng contacts work*/
			assign: 0,	/*Tổng contacts assign cho work*/
			dup: 0,		/*Tổng contacts bị trùng work*/
		};
		mvACT.totalKid = {
			all: 0,		/*Tổng contacts kid*/
			assign: 0,	/*Tổng contacts assign cho kid*/
			dup: 0,		/*Tổng contacts bị trùng kid*/
		};
		
		/*Methods*/
		mvACT.save = save;
		mvACT.applyDate = applyDate;
		mvACT.changeQuantity = changeQuantity;

		/*Init*/
		getSaleman(); 

		$timeout(function(){
			angular.element('#reservationtime1').daterangepicker({
				timePicker: true,
				timePickerIncrement: 30,
				locale: {
					format: 'MM/DD/YYYY h:mm A'
				}
			});

			angular.element('#reservationtime1').on('apply.daterangepicker', function(ev, picker) {
				/*do something, like calling a function*/
				console.log(picker);
				var pickerDate = {startDate: picker.startDate, endDate: picker.endDate};
				mvACT.queryParams.date = pickerDate;
			});
		},500);
		

		/*Function*/
		function getSaleman () {
			assignContactSvc.getSaleman().then(function(resp){
				// console.log('sdf',resp);
				getData(resp);
			});
		}

		function getData(data){
			mvACT.salemans = {
				work: data.salemanWork,
				kid: data.salemanKid,
			};
			mvACT.salemansTmp = {
				work: data.salemanWork,
				kid: data.salemanKid,
			};
			// console.log('test',mvACT.salemans);
			mvACT.groupWork = {};
			mvACT.groupKid = {};
		}

		function applyDate(){
			if(mvACT.queryParams.date.startDate == null || mvACT.queryParams.date.endDate == null) return;
			mvACT.lockForm = true;

			assignContactSvc.postContactOptimized(mvACT.queryParams.date).then(function(resp){
				console.log('resp',resp);
				mvACT.groupWork = resp.groupWork;
				mvACT.groupKid = resp.groupKid;

				/*Set tổng contacts trùng work và kid*/
				mvACT.totalWork.all = mvACT.groupWork.emails.all.length + mvACT.groupWork.phones.all.length;
				mvACT.totalKid.all = mvACT.groupKid.emails.all.length + mvACT.groupKid.phones.all.length;
				mvACT.lockForm = false;
				
			});
		}

		function changeQuantity(type){
			var salesman;
			var totalAssign = 0;

			if(type == 'work')
				salesman = mvACT.salemansTmp.work;
			else
				salesman = mvACT.salemansTmp.kid;

			for (var i = 0; i < salesman.length; i++) {
				totalAssign += salesman[i].quantity || 0;
			}

			if(type == 'work')
				mvACT.totalWork.assign = totalAssign;
			else
				mvACT.totalKid.assign = totalAssign;
		}

		function save(isValid){
			mvACT.submitted = true;

			if(!mvACT.lockFormAssign && isValid){
				mvACT.lockFormAssign = true;
				if(mvACT.tab === 'work'){
					// chia contact work
					var data = {
						type: 'work',
						listSaleman: mvACT.salemansTmp.work,
						contacts: mvACT.groupWork
					};
				}
				else if(mvACT.tab === 'kid'){
					// chia contact kid
					var data = {
						type: 'kid',
						listSaleman: mvACT.salemansTmp.kid,
						contacts: mvACT.groupKid
					};
				}
				/*Map contacts mới với số lượng của từng saleman đc set trong list saleman*/
				data = assignContactSvc.formatContacts(data);
				assignContactSvc.postAssignContact(data).then(function(resp){
					$bzPopup.toastr({
						type: 'success',
						data:{
							title: 'Chia Contacts',
							message: 'Chia Contacts thành công!'
						}
					});
					$rootScope.$emit('angular-changeNoti');
					$uibModalInstance.close();
					mvACT.lockFormAssign = false;
				}).catch(function(err){
					$bzPopup.toastr({
						type: 'error',
						data:{
							title: 'Lỗi !',
							message: 'Chia Contacts lỗi!'
						}
					});
					$uibModalInstance.close();
					mvACT.lockFormAssign = false;
				});
			}
		}
	}
})();