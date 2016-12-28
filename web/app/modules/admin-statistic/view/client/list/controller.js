
var statisticCtrl = (function(){
	'use strict';

	angular
	.module('bzStatistic')
	.controller('statisticCtrl', statisticCtrl);

	function statisticCtrl($scope, $state, $stateParams, $bzPopup, authSvc, NgTableParams, bzResourceSvc, statisticSvc){
		/* jshint validthis: true */
		var statistic = this;

		/*=========XÉT QUYỀN TRUY CẬP ROUTER=========*/
		if( !(authSvc.isSuperAdmin() || authSvc.isSaleManager()) ){
			$state.go('error403');
		}
		/*=======END XÉT QUYỀN TRUY CẬP ROUTER=======*/

		/*Vars*/
		statistic.loading = true;
		statistic.selectedItems = [];
		statistic.queryParams = $stateParams;
		statistic.queryParams.page = $stateParams.page || 1;
		statistic.queryParams.pageCount = 10;
		
		/*Methods*/
		statistic.filter = filter;
		statistic.filterReset = filterReset;
		statistic.filterDay = filterDay;
		statistic.convert = convert;
		statistic.exportExcel = exportExcel;

		/*Init*/
		getSaleman(); 

		/*Function*/
		function getSaleman () {
			statisticSvc.getStatistic(statistic.queryParams).then(function(resp){
				// console.log('test',$stateParams,resp);
				let totalRevenue = 0;
				let convertAvg = 0;
				let tmpTAvg = 0;
				for (var i = 0; i < resp.items.length; i++) {
					tmpTAvg += resp.items[i].totalFinish/resp.items[i].totalContact || 0;
					totalRevenue += resp.items[i].revenue;
				}
				convertAvg = parseFloat(tmpTAvg).toFixed(5);
				/*Tổng doanh thu và tỷ lệ convert trung bình*/
				statistic.totalRevenue = totalRevenue || 0;
				statistic.convertAvg = parseFloat(tmpTAvg/resp.items.length).toFixed(5) || 0;

				/*Phân trang*/
				getData(resp);
			});
		}

		function getData(data){
			statistic.statistics = data.items ? data.items : [];
			statistic.table = new NgTableParams({count: 10}, {
				counts: [],
				dataset: statistic.statistics
				// getData: function(params) {
				// 	params.total(statistic.statistics.length);
				// 	return statistic.statistics;
				// }
			});
			statistic.loading = false;
		}

		function exportExcel(){
			var data = [['Saleman','Doanh số','Tỉ lệ Convert']];
			var options = {
				type: 'xlsx',
				sheetName: 'SheetJS1',
				fileName: 'Thống kê',
			};
			
			for (var i = 0; i < statistic.statistics.length; i++) {
				let tmp = [
				statistic.statistics[i].email,
				statistic.statistics[i].revenue,
				parseFloat(convert(statistic.statistics[i]))
				];
				data.push(tmp);
			}
			ExcelJs.exportExcel(data, options);
		}

		function filter(sortField){
			$state.go('.', statistic.queryParams, {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filterDay(type){
			statistic.queryParams.filterDay = type;
			filter();
		}

		function filterReset(){
			statistic.queryParams.type 				= null;
			statistic.queryParams.filterDay 		= null;

			$state.go('.', statistic.queryParams, {notify:false})
			.then(function(){
				$state.reload();
			});
		}

		function convert(item){
			item.convert = item.totalFinish/item.totalContact || 0;
			return parseFloat(item.convert).toFixed(5);
		}
		/*END END*/
	}

	var resolve = {
		/* @ngInject */
		preload: function(bzPreloadSvc) {
			return bzPreloadSvc.load([]);
		}
	};

	return {
		resolve : resolve
	};
})();