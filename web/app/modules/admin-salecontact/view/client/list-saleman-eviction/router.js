;(function(){
	'use strict';

	Application.registerRouter({
		state: 'contactsalemaneviction',
		config: {
			url: '/contact-saleman-evict?dup&uid&page&limit&keyword&type&is_finish&call_status&care_status&call_level&is_recall_schedule&schedule_inteview&filterDay&startDate&endDate&eviction',
			data: {
				title: 'Contact Saleman Eviction',
				menuType: 'contactsalemaneviction'
			},
			params: {
				limit: '10',
				page: '1',
				eviction: 'true',
				dup: 'false',
			},
			templateUrl: 'modules/admin-salecontact/view/client/list-saleman-eviction/view.html',
			controller: 'contactSalemanEvictCtrl',
			controllerAs: 'mvCSME',
			resolve: contactSalemanEvictCtrl.resolve
		}
	});
})();
