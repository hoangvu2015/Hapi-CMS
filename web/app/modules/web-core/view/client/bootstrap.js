var Application = (function () {
    'use strict';

    var appName = 'bzApp';
    var appDependencies = [
    'ui.bootstrap',
    'ngSanitize',
    'ngAnimate',
    'ngMessages',
    'ngResource',
    'ui.router',
    'toastr',
    'ngPopup',
    'daterangepicker',
    'angularjs-datetime-picker',
    'ngFileUpload'
    ];

    angular
    .module(appName, appDependencies)
    .config(config)
    .run(run);

    angular.element(document).ready(function() {
        angular.bootstrap(document, [appName]);
    });

    function registerModule(name) {
        angular.module(appName).requires.push(name);
    }

    function config(
        $qProvider,
        $httpProvider,
        $locationProvider,
        $bzPopupProvider,
        toastrConfig,
        $interpolateProvider,
        $resourceProvider
        ){

        /*fix error (Possibly unhandled rejection) angular > 1.5.5*/
        $qProvider.errorOnUnhandledRejections(false);

        $bzPopupProvider.setMessageTemplate('assets/global/message/view.html');

        angular.extend(toastrConfig, {
            extendedTimeOut: 1000,
            timeOut: 1000,
            newestOnTop: true,
            positionClass: 'toast-bottom-right',
            preventDuplicates: false,
            preventOpenDuplicates: false,
            tapToDismiss: true,
            allowHtml: true,
            closeButton: true,
            target: 'body'
        });

        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');

        // Configs HTML5 API Pushstate
        $locationProvider.html5Mode(false).hashPrefix('!');

        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=UTF-8';

        // $resourceProvider.defaults.stripTrailingSlashes = false;
    }

    function run(
        $rootScope,
        $window,
        $document,
        $timeout,
        authSvc,
        notiSvc){

        angular.element('body').removeClass('hide');

        $rootScope._ = window._;
        // $rootScope.socket = io(settingJs.configs.socketUrl);

        // Global variables
        $rootScope.pageData = {};

        // Global methods
        $rootScope.pageMethods = {};
        $rootScope.pageMethods.authSvc = authSvc;
    }

    return {
        registerModule: registerModule
    };
})();
