;(function(){
	'use strict';

	Application.registerRouter({
		state: 'salecontact-process',
		config: {
			url: '/salecontact-process?module&page&filter&limit&cateid&sortfield&sortdir&publish&id&keyword',
			data: {
				title: 'Bài viết',
				menuType: 'salecontact'
			},
			params: {
				page: '1',
				sortfield: 'createdAt',
				sortdir: 'desc',
				limit: '10'
			},
			templateUrl: 'modules/admin-salecontact/view/client/process/view.html',
			controller: 'saleContactProcCtrl',
			controllerAs: 'mvSCP',
			resolve: saleContactProcCtrl.resolve
		}
	});
})();
