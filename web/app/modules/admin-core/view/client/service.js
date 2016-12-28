(function(){
	'use strict';

	angular
	.module('bzApp')
	.service('bzUtilsSvc', bzUtilsSvc)
	.service('bzResourceSvc', bzResourceSvc)
    .factory('bzPreloadSvc', bzPreloadSvc)
    .service('authSvc', authSvc)
    .service('notiSvc', notiSvc)
    .factory('userApiFac', userApiFac);

    function userApiFac($window, bzResourceSvc){
        return bzResourceSvc.api(settingJs.configs.userApiUrl + '/user/:method/:id', {method:'@method', id: '@id'});
    }

    function notiSvc($q,bzResourceSvc){
        return {
            getDupContact: getDupContact,
        };

        function getDupContact(){
            var defer = $q.defer();
            bzResourceSvc.api(settingJs.configs.adminUrl + '/noti-dup-contact')
            .get({}, {} ,function(resp){
                defer.resolve(resp);
            }, function(err){
                defer.reject(err);
            });

            return defer.promise;
        }
    }

    function authSvc($uibModal, $q, $window, userApiFac, bzResourceSvc){
        $window.user = $window.user || {};

        return {
            /*Role*/
            isSuperAdmin: isSuperAdmin,
            isAdmin: isAdmin,
            isSale: isSale,
            isSaleManager: isSaleManager,
            exist: exist,
            /*Info*/
            getProfile: getProfile,
            setProfile: setProfile,
            isSignedIn: isSignedIn,
            siteLogin: siteLogin,
            siteLogout: siteLogout,
            popChangePass: popChangePass,
            postChangePass: postChangePass,
            // create    : create,
            // update    : update,
        };

        /*ROLES*/
        function isSuperAdmin(){
            if(_.intersection($window.user.scope, ['super-admin']).length === 0)
                return false;
            return true;
        }

        function isAdmin(){
            if(_.intersection($window.user.scope, ['admin']).length === 0)
                return false;
            return true;
        }

        function isSale(){
            $window.user.saleman = $window.user.saleman || {};
            if(_.intersection($window.user.scope, ['sale']).length !== 0 && $window.user.saleman.active === true)
                return true;
            return false;
        }

        function isSaleManager(){
            $window.user.saleman = $window.user.saleman || {};
            if(isSale() && $window.user.saleman.manager === true)
                return true;
            return false;
        }

        function exist(roles){
            return _.intersection($window.user.scope, roles).length > 0;
        }

        /*INFO*/
        function getProfile(){
            var profileData = $window.user;
            return profileData;
        }

        function setProfile(data){
            Storage.set(settingJs.appPrefix + 'bzp', data, settingJs.storageExpireTime);
            Storage.set(settingJs.appPrefix + 'bzl', true, settingJs.storageExpireTime);
            return data;
        }

        function isSignedIn(){
            var log = Storage.get(settingJs.appPrefix + 'bzl');
            return log ? true : false;
        }

        function siteLogin(data, successCb, errorCb){
            var defer = $q.defer();

            bzResourceSvc.api($window.settings.services.userApi + '/user/login')
            .save({}, data, function(resp){
                setProfile(resp);
                defer.resolve(resp);
                if(angular.isFunction(successCb)){
                    successCb(resp);
                }
            }, function(err){
                defer.reject(err);
                if(angular.isFunction(errorCb)){
                    errorCb(err);
                }
            });

            return defer.promise;
        }

        function siteLogout(callback){
            var profile = getProfile();

            bzResourceSvc.api($window.settings.services.userApi + '/user/logout')
            .save({}, {}, function(resp){
                setProfile(undefined);
                if(angular.isFunction(callback)){
                    callback(resp);
                }
                $window.location.href = '/admin/signin';
            });
        }

        function popChangePass(){
            var modalInstance = $uibModal.open({
                animation:true,
                templateUrl: 'modules/admin-user/view/client/popup/change-pass/view.html',
                controller: 'popChangePassCtrl',
                controllerAs: 'mvCPass',
            });
        }

        function postChangePass(data){
            var postChangePass = new userApiFac(data);

            return postChangePass.$save({method: 'change-password'});
        }

        // function create(data, id){
        //     var createData = new userFac(data);

        //     return createData.$save({method: 'user'});
        // }

        // function update(data, id){
        //     var createData = new userFac(data);

        //     return createData.$update({method: 'user', id: id});
        // }
    }

    function bzUtilsSvc($bzPopup){
        return {
            recusive: recusive,
            cropAvatar: cropAvatar,
        	findObject: findObject ,					// Tìm đối tượng trong mảng đối tượng
        };

        function findObject(field, value, array){
        	function findCherries(fruit) { 
        		return fruit[field] === value;
        	}

        	return array.find(findCherries);
        }

        function recusive(data, parentId, seperator){
        	var output;
        	var tmp = [];
        	seperator = seperator || '';
        	if(angular.isArray(data)){
        		var items = data.filter(function(item){ return item.parentId === parentId });
        		if(items.length){
        			for (var i = 0; i < items.length; i++) {
        				items[i].name = seperator + items[i].name;

        				tmp.push(items[i]);

        				var subs = recusive(data, items[i].id, seperator + "—");

        				for (var j = 0; j < subs.length; j++) {
        					tmp.push(subs[j]);
        				}
        			}
        		}
        		output = tmp;
        	} else {
        		output = data;
        	}
        	return output;
        }

        function cropAvatar(){
        	$bzPopup.open({
        		templateUrl: 'modules/popup/cropper/view.html',
        		closeOnBg: false,
        		data: {
        			ratio: 1,
        			width: 320,
        			height: 320,
        			type: 'image/jpeg',
        			event: 'bz:CropperAvatarSuccess',
        			image: 'images/demo.jpg',
        			props: {
        				btnOk: 'Lưu',
        				btnCancel: 'Huỷ bỏ',
	                	btnOkEvent: 'bz:CropperAvatarOk', // hoặc function(){}
	                	btnCancelEvent: 'bz:CroppperAvatarCancel' // hoặc function(){}
	                }
	            }
	        });
        }
    }

    function bzResourceSvc($resource){
    	return {
    		api: api
    	};

    	function api(apiName, params, methods){
    		methods = methods || {};
    		methods.get = angular.extend({}, methods.get);

    		methods.query = angular.extend({
    			isArray: true
    		}, methods.query);

    		methods.update = angular.extend({
    			method:'PUT'
    		}, methods.update);

    		methods.upload = angular.extend({
    			method: 'POST',
    			headers: { 'Content-Type': undefined },
    			transformRequest: angular.identity
    		}, methods.upload);

    		return $resource(apiName, params, methods);
    	}
    }

    function bzPreloadSvc($q){
    	return {
    		load: function(list){
    			var defer = $q.defer();
    			helperJs.preloader(list, function(){
    				defer.resolve();
    			});
    			return defer.promise;
    		}
    	};
    }
})();