;(function(){
	'use strict';

	Application.registerRouter({
		state: 'post',
		config: {
			url: '/post?module&page&filter&limit&cateid&sortfield&sortdir&publish&id&keyword',
			data: {
				title: 'Bài viết',
				menuType: 'post'
			},
			params: {
				page: '1',
				sortfield: 'createdAt',
				sortdir: 'desc',
				limit: '10'
			},
			templateUrl: 'modules/admin-post/view/client/list/view.html',
			controller: 'postCtrl',
			controllerAs: 'post',
			resolve: postCtrl.resolve
		}
	});
})();
