;(function(){
	'use strict';

	Application.registerRouter({
		state: 'post-edit',
		config: {
			url: '/post-edit?module&page&filter&limit&cateid&sortfield&sortdir&publish&id&keyword',
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
			templateUrl: 'modules/admin-post/view/client/edit/view.html',
			controller: 'postEditCtrl',
			controllerAs: 'postEdit',
			resolve: postEditCtrl.resolve
		}
	});
})();
