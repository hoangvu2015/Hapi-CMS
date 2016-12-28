;(function(){
	'use strict';

	Application.registerModule('bzUser');

	angular
	.module('bzUser', [])
	.constant('salemanScopes', [
		{name:'Kid', value:'kid'},
		{name:'Work', value:'work'}
		])
	.run(run);

	function run(authSvc){
		
	}
})();