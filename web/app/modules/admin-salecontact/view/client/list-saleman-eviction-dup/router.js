;(function(){
	'use strict';

	Application.registerRouter({
		state: 'contactsalemanevictiondup',
		config: {
			url: '/contact-saleman-evict-dup?dup&uid&page&limit&keyword&type&is_finish&call_status&care_status&call_level&is_recall_schedule&schedule_inteview&filterDay&startDate&endDate&eviction',
			data: {
				title: 'Contact Saleman Eviction Duplicate',
				menuType: 'contactsalemanevictiondup'
			},
			params: {
				limit: '10',
				page: '1',
				dup: 'true',
				eviction: 'true',
			},
			templateUrl: 'modules/admin-salecontact/view/client/list-saleman-eviction-dup/view.html',
			controller: 'contactSalemanEvictDupCtrl',
			controllerAs: 'mvCSMED',
			resolve: contactSalemanEvictDupCtrl.resolve
		}
	});
})();
