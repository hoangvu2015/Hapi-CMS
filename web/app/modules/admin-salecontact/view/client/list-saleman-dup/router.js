;(function(){
	'use strict';

	Application.registerRouter({
		state: 'contactsalemandup',
		config: {
			url: '/contact-saleman-dup?dup&eviction&uid&page&limit&keyword&type&is_finish&call_status&care_status&call_level&is_recall_schedule&schedule_inteview&filterDay&startDate&endDate',
			data: {
				title: 'Contact Saleman Duplicate',
				menuType: 'contactsalemandup'
			},
			params: {
				limit: '10',
				page: '1',
				dup: 'true',
				eviction: 'false'
			},
			templateUrl: 'modules/admin-salecontact/view/client/list-saleman-dup/view.html',
			controller: 'contactSalemanDupCtrl',
			controllerAs: 'vmCSMD',
			resolve: contactSalemanDupCtrl.resolve
		}
	});
})();
