var postCtrl = (function(){
	'use strict';

	angular
	.module('bzPost')
	.controller('postCtrl', postCtrl);

	function postCtrl($scope, $state, $stateParams, $bzPopup, bzResourceSvc){
		/* jshint validthis: true */
		var post = this;
		// Vars
		post.selectedItems = [];
		post.queryParams = $stateParams;
		post.queryParams.pageCount = 10;
		post.categories = [
		{id:1, name: 'Danh mục 1'},
		{id:2, name: 'Danh mục 2'}
		];
		post.posts = [
		{id:1, name:'Tiêu đề 1', image:'assets/images/avatar.jpg', status:0, sort:1},
		{id:2, name:'Tiêu đề 2', image:'assets/images/avatar.jpg', status:0, sort:2},
		{id:3, name:'Tiêu đề 3', image:'assets/images/avatar.jpg', status:0, sort:3},
		{id:4, name:'Tiêu đề 4', image:'assets/images/avatar.jpg', status:1, sort:4},
		{id:5, name:'Tiêu đề 5', image:'assets/images/avatar.jpg', status:1, sort:5},
		{id:6, name:'Tiêu đề 6', image:'assets/images/avatar.jpg', status:1, sort:6},
		{id:7, name:'Tiêu đề 7', image:'assets/images/avatar.jpg', status:1, sort:7},
		{id:8, name:'Tiêu đề 8', image:'assets/images/avatar.jpg', status:1, sort:8},
		{id:9, name:'Tiêu đề 9', image:'assets/images/avatar.jpg', status:1, sort:9},
		{id:10, name:'Tiêu đề 10', image:'assets/images/avatar.jpg', status:1, sort:10},
		{id:11, name:'Tiêu đề 11', image:'assets/images/avatar.jpg', status:1, sort:11},
		{id:12, name:'Tiêu đề 12', image:'assets/images/avatar.jpg', status:1, sort:12},
		{id:13, name:'Tiêu đề 13', image:'assets/images/avatar.jpg', status:1, sort:13},
		{id:14, name:'Tiêu đề 14', image:'assets/images/avatar.jpg', status:1, sort:14},
		{id:15, name:'Tiêu đề 15', image:'assets/images/avatar.jpg', status:1, sort:15},
		{id:16, name:'Tiêu đề 16', image:'assets/images/avatar.jpg', status:1, sort:16},
		{id:17, name:'Tiêu đề 17', image:'assets/images/avatar.jpg', status:1, sort:17},
		{id:18, name:'Tiêu đề 18', image:'assets/images/avatar.jpg', status:1, sort:18},
		{id:19, name:'Tiêu đề 19', image:'assets/images/avatar.jpg', status:1, sort:19},
		{id:20, name:'Tiêu đề 20', image:'assets/images/avatar.jpg', status:1, sort:20}
		];

		// Methods
		post.selectItem = selectItem;
		post.filter = filter;
		post.filterReset = filterReset;
		post.save = save;
		post.publish = publish;
		post.sort = sort;
		post.remove = remove;

		// Init
		autoResetWhenParamsInvalid();

		function getSelectedIds(){
			var ids = [];

			post.selectedItems.map(function(item){
				ids.push(item.id);
			});

			return {
				ids: ids
			};
		}

		function selectItem(type) {
			switch(type){
				case 'multiple':
				post.selectedAll = !post.selectedAll;

				angular.forEach(post.posts, function (item) {
					item.selected = post.selectedAll;
				});
				break;
			}

			post.selectedItems = post.posts.filter(function(item){return item.selected === true});
		}

		function autoResetWhenParamsInvalid(){
			if(post.posts.length === 0 && post.queryParams.page > 1){
				$state.go('.', {action:'list', page: post.queryParams.pageCount});
			}
		}

		function filter(sortField){
			post.queryParams.sortdir = post.queryParams.sortdir === 'desc' ? 'asc' : 'desc';
			post.queryParams.sortfield = sortField || 'createdAt';

			$state.go('.', post.queryParams, {notify:false}).then(function(){
				$state.reload();
			});
		}

		function filterReset(){
			$state.go('.', {
				publish: null,
				cateid: null,
				keyword: null,
				limit: settingJs.admin.itemPerPage
			},
			{notify:false})
			.then(function(){
				$state.reload();
			});
		}

		function save(isValid){
			post.submitted = true;

			if(!post.lockForm && isValid){
				post.lockForm = true;

				if(post.queryParams.action === 'add'){
					var fd = new FormData();

					for (var key in post.formData) {
						fd.append(key, post.formData[key]);
					}

					fd.append('upload', post.formData.image[0]);

					bzResourceSvc.api('post')
					.upload({}, fd, function(resp){
						$bzPopup.toastr({
							type: resp.status ? 'success' : 'error',
							data:{
								title: 'Thêm bài viết',
								message: resp.message
							}
						});

						if(resp.status){
							$state.go('.', {action: 'list', id: null});
						} else {
							post.lockForm = false;
						}
					});
				} else if(post.queryParams.action === 'edit') {
					bzResourceSvc.api('post/:id', {id: '@id'})
					.update({id:post.queryParams.id}, post.formData, function(resp){
						$bzPopup.toastr({
							type: resp.status ? 'success' : 'error',
							data:{
								title: 'Cập nhật',
								message: resp.message
							}
						});

						if(resp.status){
							$state.go('.', {action: 'list', id: null});
						} else {
							post.lockForm = false;
						}
					});
				}
			}
		}

		function publish(id, value){
			$bzPopup.toastr({
				type: 'success',
				data:{
					title: 'Cập nhật',
					message: value === 1 ? 'Hiện bài viết thành công!' : 'Ẩn bài viết thành công!'
				}
			});
		}

		function sort(id, value){
			$bzPopup.toastr({
				type: 'success',
				data:{
					title: 'Cập nhật',
					message: 'Cập nhật thứ tự bài viết thành công!'
				}
			});
		}

		function remove(id){
			var selected = id ? {ids: [id]} : getSelectedIds();

			$bzPopup.message({
				data:{
					title: 'Xóa',
					message: 'Bạn chắc chắn sẽ xóa dữ liệu này?',
					props: {
						btnOk: 'Đồng ý',
						btnOkEvent: function(){
							bzResourceSvc.api('post/delete')
							.save({}, {ids: selected.ids}, function(resp){
								$bzPopup.toastr({
									type: 'success',
									data:{
										title: 'Xóa',
										message: 'Xóa bài viết thành công!'
									}
								});

								$state.reload();
							});
						},
						btnCancel: 'Hủy bỏ'
					}
				},
			});
		}
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