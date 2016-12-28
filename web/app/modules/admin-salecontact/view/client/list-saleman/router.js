;(function(){
	'use strict';

	Application.registerRouter({
		state: 'contactsaleman',
		config: {
			url: '/contact-saleman?uid&page&limit&keyword&type&is_finish&call_status&care_status&call_level&is_recall_schedule&schedule_inteview&filterDay&startDate&endDate&dup&eviction',
			data: {
				title: 'Contact Saleman',
				menuType: 'contactsaleman'
			},
			params: {
				limit: '10',
				page: '1',
				eviction: 'false',
				dup: 'false'
			},
			templateUrl: 'modules/admin-salecontact/view/client/list-saleman/view.html',
			controller: 'contactSalemanCtrl',
			controllerAs: 'vmCSM',
			resolve: contactSalemanCtrl.resolve
		}
	});
})();
