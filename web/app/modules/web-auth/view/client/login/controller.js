;(function(){
	'use strict';

	angular
	.module('bzAuth')
	.controller('authCtrl', authCtrl);

	function authCtrl($scope, $state, $window, $bzPopup){
		var vmAuth = this;

		// Methods
		vmAuth.siteLogin = siteLogin;
		vmAuth.test = 'testtest';

		// Init
		initFormData();

		function initFormData(){
			vmAuth.lockForm = false;
			vmAuth.submitted = false;
			vmAuth.formData = {
				email: '',
				password: ''
			};
		}

		function siteLogin(isValid){
			vmAuth.submitted = true;

			if(!vmAuth.lockForm && isValid){
				vmAuth.lockForm = true;

				$scope.pageMethods.authSvc.siteLogin(vmAuth.formData, function(resp){
					$window.location.href = '/admin';
					vmAuth.lockForm = false;
				}, function(err){
					$bzPopup.toastr({
						type: 'error',
						data:{
							title: 'Login',
							message: err.data.message
						}
					});

					vmAuth.lockForm = false;
				});
			}
		}
	}
})();
