;(function(){
	'use strict';

	Application.registerRouter({
		state: 'salecontacttmp',
		config: {
			url: '/salecontact-tmp?page&limit&keyword',
			data: {
				title: 'Saleman',
				menuType: 'salecontacttmp'
			},
			params: {
				limit: '20',
				page: '1'
			},
			templateUrl: 'modules/admin-salecontact/view/client/list-tmp/view.html',
			controller: 'saleContactTmpCtrl',
			controllerAs: 'SCTMP',
			resolve: saleContactTmpCtrl.resolve
		}
	});
})();