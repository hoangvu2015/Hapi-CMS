(function(){
	'use strict';

	angular
	.module('bzUser')
	// .service('authSvc', authSvc)
	.service('userSvc', userSvc)
	.service('userFac', userFac);

	function userFac($window, bzResourceSvc){
		return bzResourceSvc.api($window.settings.services.admin + '/:method/:id', {method:'@method', id: '@id'});
	}

	// function authSvc($window){
	// 	$window.user = $window.user || {};

	// 	return {
	// 		isSuperAdmin: isSuperAdmin,
	// 		isAdmin: isAdmin,
	// 		isSale: isSale,
	// 		isSaleManager: isSaleManager,
	// 		exist: exist
	// 	};

	// 	function isSuperAdmin(){
	// 		if(_.intersection($window.user.scope, ['super-admin']).length === 0)
	// 			return false;
	// 		return true;
	// 	}

	// 	function isAdmin(){
	// 		if(_.intersection($window.user.scope, ['admin']).length === 0)
	// 			return false;
	// 		return true;
	// 	}

	// 	function isSale(){
	// 		$window.user.saleman = $window.user.saleman || {};
	// 		if(_.intersection($window.user.scope, ['sale']).length !== 0 && $window.user.saleman.active === true)
	// 			return true;
	// 		return false;
	// 	}

	// 	function isSaleManager(){
	// 		$window.user.saleman = $window.user.saleman || {};
	// 		if(isSale() && $window.user.saleman.manager === true)
	// 			return true;
	// 		return false;
	// 	}

	// 	function exist(roles){
	// 		return _.intersection($window.user.scope, roles).length > 0;
	// 	}
	// }

	function userSvc($q, $window, bzResourceSvc, userFac){
		return {
			// getProfile: getProfile,
			// setProfile: setProfile,
			// isSignedIn: isSignedIn,
			// siteLogin: siteLogin,
			// siteLogout: siteLogout,
			create    : create,
			update    : update,
		};

		// function getProfile(){
		// 	var profileData = $window.user;//Storage.get(settingJs.appPrefix + 'bzp');
		// 	return profileData;
		// }

		// function setProfile(data){
		// 	Storage.set(settingJs.appPrefix + 'bzp', data, settingJs.storageExpireTime);
		// 	Storage.set(settingJs.appPrefix + 'bzl', true, settingJs.storageExpireTime);
		// 	return data;
		// }

		// function isSignedIn(){
		// 	var log = Storage.get(settingJs.appPrefix + 'bzl');
		// 	return log ? true : false;
		// }

		// function siteLogin(data, successCb, errorCb){
		// 	var defer = $q.defer();

		// 	bzResourceSvc.api($window.settings.services.userApi + '/user/login')
		// 	.save({}, data, function(resp){
		// 		console.log('resp',resp);
		// 		setProfile(resp);
		// 		defer.resolve(resp);
		// 		if(angular.isFunction(successCb)){
		// 			successCb(resp);
		// 		}
		// 	}, function(err){
		// 		defer.reject(err);
		// 		if(angular.isFunction(errorCb)){
		// 			errorCb(err);
		// 		}
		// 	});

		// 	return defer.promise;
		// }

		// function siteLogout(callback){
		// 	var profile = getProfile();

		// 	bzResourceSvc.api($window.settings.services.userApi + '/user/logout')
		// 	.save({}, {}, function(resp){
		// 		setProfile(undefined);
		// 		if(angular.isFunction(callback)){
		// 			callback(resp);
		// 		}
		// 		$window.location.href = '/admin/signin';
		// 	});
		// }

		function create(data, id){
			var createData = new userFac(data);

			return createData.$save({method: 'user'});
		}

		function update(data, id){
			var createData = new userFac(data);

			return createData.$update({method: 'user', id: id});
		}
	}
})();