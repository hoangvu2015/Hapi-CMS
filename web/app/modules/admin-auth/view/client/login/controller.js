;(function(){
	'use strict';

	angular
	.module('bzAuth')
	.controller('authCtrl', authCtrl);

	function authCtrl($scope, $state, $window, $bzPopup){
		var auth = this;

		// Methods
		auth.siteLogin = siteLogin;

		// Init
		initFormData();

		function initFormData(){
			auth.lockForm = false;
			auth.submitted = false;
			auth.formData = {
				email: '',
				password: ''
			};
		}

		function siteLogin(isValid){
			auth.submitted = true;

			if(!auth.lockForm && isValid){
				auth.lockForm = true;

				$scope.pageMethods.authSvc.siteLogin(auth.formData, function(resp){
					$window.location.href = '/admin';
					auth.lockForm = false;
				}, function(err){
					$bzPopup.toastr({
						type: 'error',
						data:{
							title: 'Login',
							message: err.data.message
						}
					});

					auth.lockForm = false;
				});
			}
		}
	}
})();