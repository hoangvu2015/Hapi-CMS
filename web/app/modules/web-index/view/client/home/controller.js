var homeCtrl = (function(){
	'use strict';

	angular
	.module('bzHome')
	.controller('homeCtrl', homeCtrl);

	function homeCtrl($scope){
		var vmHome = this;
    console.log('okokokokok Home');
	}

	// var resolve = {
	// 	/* @ngInject */
	// 	preload: function(bzPreloadSvc) {
	// 		return bzPreloadSvc.load([]);
	// 	}
	// };
  //
	// return {
	// 	resolve : resolve
	// };
})();
