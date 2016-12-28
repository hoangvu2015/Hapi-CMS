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
    'ngTable',
    'ngFileUpload'
    ];
    var routers = [];

    angular
    .module(appName, appDependencies)
    .provider('routerHelper', routerHelperProvider)
    .config(config)
    .run(run);

    angular.element(document).ready(function() {
        angular.bootstrap(document, [appName]);
    });

    function registerModule(name) {
        angular.module(appName).requires.push(name);
    }

    function registerRouter(router) {
        routers.push(router);
    }

    function routerHelperProvider($stateProvider, $urlRouterProvider) {
        this.$get = RouterHelper;

        function RouterHelper($state) {
            var hasOtherwise = false;

            return {
                configureStates: configureStates,
                getStates: getStates
            };

            function configureStates(states, otherwisePath) {
                states.forEach(function(state) {
                    state.config.params = state.config.params || {};
                    $stateProvider.state(state.state, state.config);
                });
                if (otherwisePath && !hasOtherwise) {
                    hasOtherwise = true;
                    $urlRouterProvider.otherwise(otherwisePath);
                }
            }

            function getStates() {
                return $state.get();
            }
        }
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
        routerHelper,
        $rootScope,
        $window,
        $document,
        $state,
        $timeout,
        authSvc,
        notiSvc){
        routerHelper.configureStates(routers, '/');

        angular.element('body').removeClass('hide');

        $rootScope._ = window._;
        $rootScope.socket = io(settingJs.configs.socketUrl);

        // Global variables
        $rootScope.pageData = {};
        $rootScope.noti = {
            dupTotal: 0,
            dupCSale: 0,
            dupCEviction: 0
        };
        
        // Global methods
        $rootScope.pageMethods = {};
        $rootScope.pageMethods.authSvc = authSvc;
        $rootScope.pageMethods.redirect = redirect;

        /*Sự kiện khi muốn update noti*/
        $rootScope.$on('angular-changeNoti', function(data){
            console.log('oopp');
            $rootScope.socket.emit('socket-postNoti',{_sale_usermember: authSvc.getProfile().id});
        });

        /*Khởi tạo socket noti*/
        $rootScope.socket.emit('socket-postNoti',{_sale_usermember: authSvc.getProfile().id});
        $rootScope.socket.on('socket-getNoti', function(data){
            $rootScope.noti = data;
            $rootScope.$apply();
            console.log('ppp',$rootScope.noti);
        });

        /*Sự kiện trạng thái state*/
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            $rootScope.pageData.title = toState.data.title;
            $rootScope.pageData.className = toState.name;
            $rootScope.pageData.menuType = toState.data.menuType;

            /*Update lại thông báo*/
            // $timeout(function(){
            //     notiSvc.getDupContact().then(function(resp){
            //         $rootScope.noti = resp;
            //     });
            // },2000);
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $window.scrollTop = $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;

            $rootScope.pageData.currentState = toState;
            $rootScope.pageData.currentParams = toParams;
        });

        function redirect(state, params, notify){
            $state.go(state, params, notify);
        }
    }

    return {
        registerModule: registerModule,
        registerRouter: registerRouter
    };
})();

