var postEditCtrl = (function(){
	'use strict';

	angular
	.module('bzPost')
	.controller('postEditCtrl', postEditCtrl);

	function postEditCtrl($scope, $state, $stateParams, $bzPopup, bzResourceSvc){
		var postEdit = this;

		// Vars
		postEdit.queryParams = $stateParams;
		postEdit.editMode = postEdit.queryParams.id ? 'add' : 'edit';
		postEdit.categories = [
		{id:1, name: 'Danh mục 1'},
		{id:2, name: 'Danh mục 2'}
		];

		// Methods
		postEdit.save = save;

		// Init
		initFormData();

		function initFormData(){
			postEdit.lockForm = false;
			postEdit.submitted = false;
			postEdit.formData = {
				module: '',
				name: '',
				status: 0,
				image: '',
				gallery: '',
				attachment: '',
				tag: '',
				categoryId: '',
				publishDate: new Date(),
				intro: '',
				body: ''
			};
		}

		function save(isValid){
			postEdit.submitted = true;

			if(!postEdit.lockForm && isValid){
				postEdit.lockForm = true;

				if(postEdit.editMode === 'add'){
					var fd = new FormData();

					for (var key in postEdit.formData) {
						fd.append(key, postEdit.formData[key]);
					}

					fd.append('upload', postEdit.formData.image[0]);

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
							$state.go('post', {id: null});
						} else {
							postEdit.lockForm = false;
						}
					});
				}
				else if(postEdit.editMode === 'edit') {
					bzResourceSvc.api('post/:id', {id: '@id'})
					.update({id:postEdit.queryParams.id}, postEdit.formData, function(resp){
						$bzPopup.toastr({
							type: resp.status ? 'success' : 'error',
							data:{
								title: 'Cập nhật',
								message: resp.message
							}
						});

						if(resp.status){
							$state.go('post', {id: null});
						} else {
							postEdit.lockForm = false;
						}
					});
				}
			}
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