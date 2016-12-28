;(function(){
	'use strict';

	Application.registerRouter({
		state: 'contactregister',
		config: {
			url: '/contactregister?uid&page&limit&keyword&type&is_finish&filterDay&startDate&endDate&newly',
			data: {
				title: 'Saleman',
				menuType: 'contactregister'
			},
			params: {
				limit: '20',
				page: '1',
				newly: 'true'
			},
			templateUrl: 'modules/admin-salecontact/view/client/list/view.html',
			controller: 'contactRegisterCtrl',
			controllerAs: 'CR',
			resolve: contactRegisterCtrl.resolve
		}
	});
})();
