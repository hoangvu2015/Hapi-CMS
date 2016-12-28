;(function(){
	'use strict';

	Application.registerRouter({
		state: 'user-sale',
		config: {
			url: '/user-sale?page&limit&sort&role&id&keyword',
			data: {
				title: 'User Sale',
				menuType: 'user'
			},
			params: {
				page: '1',
				sort: '-createdAt',
				limit: '10'
			},
			templateUrl: 'modules/admin-user/view/client/list-sale/view.html',
			controller: 'usersaleCtrl',
			controllerAs: 'vmUSale',
			resolve: usersaleCtrl.resolve
		}
	});
})();
