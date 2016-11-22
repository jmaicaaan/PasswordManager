module.exports = config;

function config($stateProvider, $urlRouterProvider){
    

    $urlRouterProvider
        .otherwise('/main');

    $stateProvider
        .state('main', {
            url: '/main',
            templateUrl: 'templates/main.html',
            controller: 'mainController',
            controllerAs: 'vm'
        })

        .state('detail', {
            url: '/detail?item',
            templateUrl: 'templates/detail.html',
            controller: 'detailController',
            controllerAs: 'vm'
        })
}