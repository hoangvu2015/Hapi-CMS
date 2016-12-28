;(function(){
	'use strict';

	angular
	.module('bzStatistic')
	// .service('saleContactSvc', saleContactSvc)
	.factory('statisticFac', statisticFac)
	.service('statisticSvc', statisticSvc);

	// function saleContactSvc(bzResourceSvc){
	// 	return bzResourceSvc.api('http://localhost:9000/sale-contact/:id', {id: '@id'});
	// }

	function statisticFac($resource){
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

	function statisticSvc(statisticFac){
		var $this = {};

		$this.getStatistic = function(data){
			var getStatistic = new statisticFac();
			data.method = 'statistic-get-saleman';

			return getStatistic.$get(data);
		}

		return $this;
	}
})();