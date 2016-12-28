;(function(){
	'use strict';

	Application.registerRouter({
		state: 'salecontactsearch',
		config: {
			url: '/salecontact-search?page&limit&keyword',
			data: {
				title: 'Saleman Search',
				menuType: 'salecontactsearch'
			},
			params: {
				limit: '10',
				page: '1'
			},
			templateUrl: 'modules/admin-salecontact/view/client/list-search/view.html',
			controller: 'saleContactSearchCtrl',
			controllerAs: 'vmSCT',
			resolve: saleContactSearchCtrl.resolve
		}
	});
})();
