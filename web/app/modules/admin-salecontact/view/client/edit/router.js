;(function(){
	'use strict';

	Application.registerRouter({
		state: 'salecontact-edit',
		config: {
			url: '/salecontact-edit?_sale_usermember&id',
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
			templateUrl: 'modules/admin-salecontact/view/client/edit/view.html',
			controller: 'saleContactEditCtrl',
			controllerAs: 'saleContactEdit',
			resolve: saleContactEditCtrl.resolve
		}
	});
})();
