var dashboardCtrl = (function(){
	'use strict';

	angular
	.module('bzDashboard')
	.controller('dashboardCtrl', dashboardCtrl);

	function dashboardCtrl($scope, $state, authSvc){
		var dashboard = this;
		$state.go('contactsaleman',{uid: authSvc.getProfile().uid});
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