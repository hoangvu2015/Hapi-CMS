;(function(){
	'use strict';

	Application.registerRouter({
		state: 'statistic',
		config: {
			url: '/statistic?type&filterDay',
			data: {
				title: 'Thống kê',
				menuType: 'statistic'
			},
			params: {
				limit:100,
				page:1
			},
			templateUrl: 'modules/admin-statistic/view/client/list/view.html',
			controller: 'statisticCtrl',
			controllerAs: 'statistic',
			resolve: statisticCtrl.resolve
		}
	});
})();
