;(function(){
	'use strict';

	angular
	.module('bzSaleContact')
	// .service('assignContactTo', assignContactTo)
	.service('saleContactSvc', saleContactSvc)
	.factory('assignContactFac', assignContactFac)
	.service('assignContactSvc', assignContactSvc)
	.factory('logFac', logFac)
	.service('logSvc', logSvc)
	.factory('saleContactTmpFac', saleContactTmpFac)
	.service('saleContactTmpSvc', saleContactTmpSvc);

	function saleContactTmpFac($window, bzResourceSvc){
		return bzResourceSvc.api(settingJs.configs.adminUrl + '/:method/:id', {method:'@method', id: '@id'});
	}

	function saleContactTmpSvc(saleContactTmpFac){
		return {
			getContactTmp: getContactTmp,
			createContactTmp: createContactTmp,
		};

		function getContactTmp(data){
			var getContactTmp = new saleContactTmpFac();
			data.method = 'sale-contact-tmp';
			
			return getContactTmp.$get(data);
		}

		function createContactTmp(data){
			var createContactTmp = new saleContactTmpFac(data);
			return createContactTmp.$save({method: 'sale-contact-tmp'});
		}
	}

	function logFac($window, bzResourceSvc){
		return bzResourceSvc.api(settingJs.configs.logApiUrl + '/:method/:id', {method:'@method', id: '@id'});
	}

	function logSvc(logFac){
		return {
			getLogContact:getLogContact
		};

		/*========================================API========================================*/
		function getLogContact(id){
			var getLogContact = new logFac();
			var data = {
				method: 'contact-log',
				id: id
			};
			
			return getLogContact.$get(data);
		}
	}

	function saleContactSvc(bzResourceSvc){
		return bzResourceSvc.api(settingJs.configs.adminUrl + '/sale-contact/:id', {id: '@id'});
	}

	function assignContactFac($resource){
		return $resource(settingJs.configs.adminUrl + '/:method/:id', {method:'@method', id: '@id'},{
			query: {
				method: 'GET',
				isArray: false
			},
			update: {
				method:'PUT'
			},
			save: {
				method: 'POST'
			},
			get: {
				method: 'GET',
			}
		});
	}

	function assignContactSvc($uibModal, assignContactFac){
		return {
			getSaleman:getSaleman,
			getSalemanAssign:getSalemanAssign,
			deleteContact:deleteContact,
			postContactOptimized:postContactOptimized,
			postAssignContact:postAssignContact,
			formatContacts:formatContacts,
			assignSaleman: popupAssignToSaleman, /*click show popup bàn giao saleman*/
			postAssignCMD: postAssignCMD,	/*click post bàn giao contact*/
			assignCMD: popupAssignToCMD, /*click show popup bàn giao contact*/
			/*Sale Contact*/
			evictContact: evictContact,
			assignForSalemans: assignForSalemans,
		};

		/*========================================API========================================*/

		/*Thu hồi Contacts*/
		function evictContact(data){
			var evictContact = new assignContactFac(data);

			return evictContact.$save({method: 'sale-contact-evict'});
		}

		/*Bàn giao Contacts cho salemans*/
		function assignForSalemans(data){
			var assignForSalemans = new assignContactFac(data);

			return assignForSalemans.$save({method: 'assign-for-salemans'});
		}

		function getSaleman(){
			var getSaleman = new assignContactFac();

			return getSaleman.$query({method: 'saleman-assign-contact'});
		}

		function getSalemanAssign(){
			var getSalemanAssign = new assignContactFac();
			var data = {};
			data.method = 'saleman-assign-user';

			return getSalemanAssign.$get(data);
		}

		function deleteContact(id){
			var deleteContact = new assignContactFac();

			return deleteContact.$delete({method: 'delete-contact', id: id});
		}

		function postContactOptimized(data){
			var postContactOptimized = new assignContactFac(data);

			return postContactOptimized.$save({method: 'assign-contact-optimized'});
		}

		function postAssignContact(data){
			var postAssignContact = new assignContactFac(data);

			return postAssignContact.$save({method: 'assign-contact-post'});
		}

		function postAssignCMD(data){
			var postAssignContact = new assignContactFac(data);

			return postAssignContact.$save({method: 'assign-to-cmd'});
		}

		/*=====================================Xử lý=====================================*/

		function formatContacts(data){
			/*SET LAI _SALE_USERMEMBER*/
			for (var i = 0; i < data.listSaleman.length; i++) {
				//set new Saleman
				if(data.listSaleman[i].quantity > 0){
					var count = 0;

					for (var j = 0; j < data.contacts.emails.all.length; j++) {
						if(count < data.listSaleman[i].quantity) {
							if(!data.contacts.emails.all[j]._newSaleman){
								data.contacts.emails.all[j]._newSaleman = data.listSaleman[i]._id;
								++count;
							}
						}else{
							break;
						}
					}

					for (var j = 0; j < data.contacts.phones.all.length; j++) {
						if(count < data.listSaleman[i].quantity) {
							if(!data.contacts.phones.all[j]._newSaleman){
								data.contacts.phones.all[j]._newSaleman = data.listSaleman[i]._id;
								++count;
							}
						}else{
							break;
						}
					}
				}
			}
			return data;
		}

		/*Bàn giao cho saleman*/
		function popupAssignToSaleman(contact, type){
			// console.log('sdfsdf');
			// Storage.set('contactId', id);
			var modalInstance = $uibModal.open({
				animation:true,
				templateUrl: 'modules/admin-salecontact/view/client/popup/assign-saleman/view.html',
				controller: 'assignSalemanCtrl',
				controllerAs: 'vmASM',
				resolve: {
					contact: function () {
						return contact;
					},
					type: function () {
						return type;
					}
				}
			});
		}

		/*Bàn giao cho CC*/
		function popupAssignToCMD(contact, type){
			// Storage.set('contactId', id);
			var modalInstance = $uibModal.open({
				animation:true,
				templateUrl: 'modules/admin-salecontact/view/client/popup/assign-cc/view.html',
				controller: 'assignCcCtrl',
				controllerAs: 'vmACC',
				resolve: {
					contact: function () {
						return contact;
					},
					type: function () {
						return type;
					}
				}
			});
		}
	}
})();