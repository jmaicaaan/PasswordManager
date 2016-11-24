(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
angular.module('pwdmanager', ['ionic', 'ionic-material'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(require('./config'))
.controller('mainController', require('./controller/main'))
.controller('detailController', require('./controller/detail'))
.service('$localStorageService', require('./service/localStorage'))
.service('$popupService', require('./service/popup'))
.service('$modalService', require('./service/modal'))
.service('$fingerprintAuthService', require('./service/fingerprintAuth'));
},{"./config":2,"./controller/detail":3,"./controller/main":4,"./service/fingerprintAuth":5,"./service/localStorage":6,"./service/modal":7,"./service/popup":8}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
module.exports = detail;

function detail($localStorageService, $stateParams, $state, $popupService, $fingerprintAuthService){
    var self = this;
    self.item = {};
    self.showPassword = showPassword;
    self.updatePassword = updatePassword;
    self.deletePassword = deletePassword;
    
    init();

    function init(){
        var key = $stateParams.item;
        self.item = JSON.parse($localStorageService.getByKey(key));
    }

    function updatePassword(){
        var item = JSON.stringify(self.item),
            key = self.item.title,
            alertMessage = 'Your password has been updated.';
        
        $localStorageService.update(key, item);
        $popupService.alertPopup(message);
    }

    function deletePassword(){
        var key = self.item.title,  
            confirmDeleteMessage = ['Delete <b>', key, '</b> password?'].join(' ');
        
        $popupService.confirmPopup(confirmDeleteMessage, function(response){
            if(response){
                var alertMessage = 'You have deleted your password.';
                $localStorageService.remove(key);
                $popupService.alertPopup(alertMessage, function(){
                    $state.go('main');
                });
            }
        });
    }

    function showPassword(){
        try {
            $fingerprintAuthService.authenticate(function(result){
                var password = self.item.password,
                alertMessage = ['Your password is:', '<b>', password, '</b>'].join(' ');
                $popupService.alertPopup(alertMessage);
            });
        } catch (error) {
            $popupService.alertPopup(error);
        }
    }
}
},{}],4:[function(require,module,exports){
module.exports = main;

function main($scope, $modalService, $localStorageService, $popupService){
    var self = this;
    self.searchQuery = '';
    self.add = add;
    self.remove = remove;
    self.$localStorageService = $localStorageService;
    self.$modalService = $modalService;


    init();
 
    function init(){
        initializePasswordModal();
        $localStorageService.populateServiceItems();
    }
 
    function initializePasswordModal(){
        var template = './templates/passwordModal.html';
        $modalService.getModalInstance(template, $scope);
    }

    function add(){
        var item = JSON.stringify(self.user),
            key = self.user.title;
        try {
            $localStorageService.add(key, item);
            $modalService.hideModal();
            emptyTheForm();
        } catch (error) {
            $popupService.alertPopup(error);
        }
    }
    
    function remove(key){
        $localStorageService.remove(key);
    }

    function emptyTheForm(){
        self.user = {};
    }
}
},{}],5:[function(require,module,exports){
module.exports = fingerprintAuth;

function fingerprintAuth() {
    var client_id = 'passwordManager', //Used as an alias Key for the Android Key Store
        client_secret = ''; //Used as an encrypt token for authentication

    var $service = this;
    $service.authenticate = authenticate;

    function authenticate(callback) {

        isAvailable(function () {
            scanFingerprint(function (result) {
                callback(result);
            });
        });
    }



    function isAvailable(callback) {
        FingerprintAuth.isAvailable(function (result) {
            if (result.isAvailable)
                if (result.hasEnrolledFingerprints) {
                    callback();
                } else {
                    throw 'No fingerprint registered. Go to Settings -> Security -> Fingerprint';
                }
        }, function (message) {
            throw 'Cannot detect fingerprint device: ' + message;
        });
    }

    function scanFingerprint(successCallback) {
        FingerprintAuth.show({
            clientId: client_id,
            clientSecret: client_secret,
            maxAttempts: 5,
            dialogTitle: 'Password Manager Authentication',
            dialogMessage: 'Place your finger into the sensor'
        }, successCallback, function (message) {
            throw 'Fingerprint authentication not available: ' + message;
        });
    }
}
},{}],6:[function(require,module,exports){
module.exports = localStorage;

function localStorage(){
    var $service = this;
    $service.items = [];
    $service.add = add;
    $service.populateServiceItems = populateServiceItems;
    $service.getByKey = getByKey;
    $service.remove = remove; //delete keyword is a reserved word.
    $service.update = update;

    function add(key, value){
        if(!key)
            throw 'Title input is empty.';
        
        if(hasDuplicate(key)){
            throw 'Title is already existing';
        }
        
        window.localStorage.setItem(key, value);
        populateServiceItems();
    }

    function getByKey(key){
        if(!key)
            throw 'No specified title';
        var item = window.localStorage.getItem(key) ? window.localStorage.getItem(key) : [];
        return item ;
    }

    function populateServiceItems(){
        var storage = window.localStorage,
            len = Object.keys(storage).length,
            keys = Object.keys(storage),
            items = [];

        for(var i = 0; i <= len - 1; i++){
            var item = JSON.parse($service.getByKey(keys[i]));
            items.push(item);
        }

        $service.items = items;
    }

    function remove(key){
        if(!key)
            throw 'No specified title';
        
        window.localStorage.removeItem(key);
        populateServiceItems();
    }

    function update(key, value){
        window.localStorage.setItem(key, value);
    }

    function hasDuplicate(key){
        return getByKey(key).length > 0 ? true : false;
    }
}
},{}],7:[function(require,module,exports){
module.exports = modal;

function modal($ionicModal){
    var $service = this;
    $service.modal = modal;
    $service.getModalInstance = getModalInstance;
    $service.showModal = showModal;
    $service.hideModal = hideModal;

    function getModalInstance(template, $scope){

        $ionicModal.fromTemplateUrl(template, {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $service.modal = modal;
        });
    }

    function showModal(controllerInstance){
        $service.modal.show();
    }

    function hideModal(controllerInstance){
        $service.modal.hide();
    }
}
},{}],8:[function(require,module,exports){
module.exports = popup;

function popup($ionicPopup){
    var $service = this;
    $service.popup = '';
    $service.alertPopup = alertPopup;
    $service.confirmPopup = confirmPopup;
    $service.showPopup = showPopup;
    $service.closePopup = closePopup;

    function alertPopup(message, callback){
        $service.popup = $ionicPopup.alert({
            title: 'Password Manager',
            template: message
        }).then(callback);
    }

    function confirmPopup(message, callback){
        $service.popup = $ionicPopup.confirm({
            title: 'Password Manager',
            template: message
        }).then(callback);
    }

    function showPopup(message, callback){
        $service.popup = $ionicPopup.show({
            title: 'Password Manager',
            template: message
        }).then(callback);
    }

    function closePopup(){
        $service.popup.close();
    }
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvanMvYXBwLmpzIiwid3d3L2pzL2NvbmZpZy5qcyIsInd3dy9qcy9jb250cm9sbGVyL2RldGFpbC5qcyIsInd3dy9qcy9jb250cm9sbGVyL21haW4uanMiLCJ3d3cvanMvc2VydmljZS9maW5nZXJwcmludEF1dGguanMiLCJ3d3cvanMvc2VydmljZS9sb2NhbFN0b3JhZ2UuanMiLCJ3d3cvanMvc2VydmljZS9tb2RhbC5qcyIsInd3dy9qcy9zZXJ2aWNlL3BvcHVwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYW5ndWxhci5tb2R1bGUoJ3B3ZG1hbmFnZXInLCBbJ2lvbmljJywgJ2lvbmljLW1hdGVyaWFsJ10pXG5cbi5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblxuICAgICAgLy8gRG9uJ3QgcmVtb3ZlIHRoaXMgbGluZSB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UgYXJlIGRvaW5nLiBJdCBzdG9wcyB0aGUgdmlld3BvcnRcbiAgICAgIC8vIGZyb20gc25hcHBpbmcgd2hlbiB0ZXh0IGlucHV0cyBhcmUgZm9jdXNlZC4gSW9uaWMgaGFuZGxlcyB0aGlzIGludGVybmFsbHkgZm9yXG4gICAgICAvLyBhIG11Y2ggbmljZXIga2V5Ym9hcmQgZXhwZXJpZW5jZS5cbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuICAgIH1cbiAgICBpZih3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pXG5cbi5jb25maWcocmVxdWlyZSgnLi9jb25maWcnKSlcbi5jb250cm9sbGVyKCdtYWluQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vY29udHJvbGxlci9tYWluJykpXG4uY29udHJvbGxlcignZGV0YWlsQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vY29udHJvbGxlci9kZXRhaWwnKSlcbi5zZXJ2aWNlKCckbG9jYWxTdG9yYWdlU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZS9sb2NhbFN0b3JhZ2UnKSlcbi5zZXJ2aWNlKCckcG9wdXBTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlL3BvcHVwJykpXG4uc2VydmljZSgnJG1vZGFsU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZS9tb2RhbCcpKVxuLnNlcnZpY2UoJyRmaW5nZXJwcmludEF1dGhTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlL2ZpbmdlcnByaW50QXV0aCcpKTsiLCJtb2R1bGUuZXhwb3J0cyA9IGNvbmZpZztcclxuXHJcbmZ1bmN0aW9uIGNvbmZpZygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKXtcclxuICAgIFxyXG5cclxuICAgICR1cmxSb3V0ZXJQcm92aWRlclxyXG4gICAgICAgIC5vdGhlcndpc2UoJy9tYWluJyk7XHJcblxyXG4gICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAuc3RhdGUoJ21haW4nLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9tYWluJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWFpbi5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ21haW5Db250cm9sbGVyJyxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgLnN0YXRlKCdkZXRhaWwnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9kZXRhaWw/aXRlbScsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2RldGFpbC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ2RldGFpbENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyQXM6ICd2bSdcclxuICAgICAgICB9KVxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBkZXRhaWw7XHJcblxyXG5mdW5jdGlvbiBkZXRhaWwoJGxvY2FsU3RvcmFnZVNlcnZpY2UsICRzdGF0ZVBhcmFtcywgJHN0YXRlLCAkcG9wdXBTZXJ2aWNlLCAkZmluZ2VycHJpbnRBdXRoU2VydmljZSl7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLml0ZW0gPSB7fTtcclxuICAgIHNlbGYuc2hvd1Bhc3N3b3JkID0gc2hvd1Bhc3N3b3JkO1xyXG4gICAgc2VsZi51cGRhdGVQYXNzd29yZCA9IHVwZGF0ZVBhc3N3b3JkO1xyXG4gICAgc2VsZi5kZWxldGVQYXNzd29yZCA9IGRlbGV0ZVBhc3N3b3JkO1xyXG4gICAgXHJcbiAgICBpbml0KCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdCgpe1xyXG4gICAgICAgIHZhciBrZXkgPSAkc3RhdGVQYXJhbXMuaXRlbTtcclxuICAgICAgICBzZWxmLml0ZW0gPSBKU09OLnBhcnNlKCRsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldEJ5S2V5KGtleSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHVwZGF0ZVBhc3N3b3JkKCl7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSBKU09OLnN0cmluZ2lmeShzZWxmLml0ZW0pLFxyXG4gICAgICAgICAgICBrZXkgPSBzZWxmLml0ZW0udGl0bGUsXHJcbiAgICAgICAgICAgIGFsZXJ0TWVzc2FnZSA9ICdZb3VyIHBhc3N3b3JkIGhhcyBiZWVuIHVwZGF0ZWQuJztcclxuICAgICAgICBcclxuICAgICAgICAkbG9jYWxTdG9yYWdlU2VydmljZS51cGRhdGUoa2V5LCBpdGVtKTtcclxuICAgICAgICAkcG9wdXBTZXJ2aWNlLmFsZXJ0UG9wdXAobWVzc2FnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVsZXRlUGFzc3dvcmQoKXtcclxuICAgICAgICB2YXIga2V5ID0gc2VsZi5pdGVtLnRpdGxlLCAgXHJcbiAgICAgICAgICAgIGNvbmZpcm1EZWxldGVNZXNzYWdlID0gWydEZWxldGUgPGI+Jywga2V5LCAnPC9iPiBwYXNzd29yZD8nXS5qb2luKCcgJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJHBvcHVwU2VydmljZS5jb25maXJtUG9wdXAoY29uZmlybURlbGV0ZU1lc3NhZ2UsIGZ1bmN0aW9uKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgaWYocmVzcG9uc2Upe1xyXG4gICAgICAgICAgICAgICAgdmFyIGFsZXJ0TWVzc2FnZSA9ICdZb3UgaGF2ZSBkZWxldGVkIHlvdXIgcGFzc3dvcmQuJztcclxuICAgICAgICAgICAgICAgICRsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShrZXkpO1xyXG4gICAgICAgICAgICAgICAgJHBvcHVwU2VydmljZS5hbGVydFBvcHVwKGFsZXJ0TWVzc2FnZSwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ21haW4nKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd1Bhc3N3b3JkKCl7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgJGZpbmdlcnByaW50QXV0aFNlcnZpY2UuYXV0aGVudGljYXRlKGZ1bmN0aW9uKHJlc3VsdCl7XHJcbiAgICAgICAgICAgICAgICB2YXIgcGFzc3dvcmQgPSBzZWxmLml0ZW0ucGFzc3dvcmQsXHJcbiAgICAgICAgICAgICAgICBhbGVydE1lc3NhZ2UgPSBbJ1lvdXIgcGFzc3dvcmQgaXM6JywgJzxiPicsIHBhc3N3b3JkLCAnPC9iPiddLmpvaW4oJyAnKTtcclxuICAgICAgICAgICAgICAgICRwb3B1cFNlcnZpY2UuYWxlcnRQb3B1cChhbGVydE1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICAkcG9wdXBTZXJ2aWNlLmFsZXJ0UG9wdXAoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIm1vZHVsZS5leHBvcnRzID0gbWFpbjtcclxuXHJcbmZ1bmN0aW9uIG1haW4oJHNjb3BlLCAkbW9kYWxTZXJ2aWNlLCAkbG9jYWxTdG9yYWdlU2VydmljZSwgJHBvcHVwU2VydmljZSl7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLnNlYXJjaFF1ZXJ5ID0gJyc7XHJcbiAgICBzZWxmLmFkZCA9IGFkZDtcclxuICAgIHNlbGYucmVtb3ZlID0gcmVtb3ZlO1xyXG4gICAgc2VsZi4kbG9jYWxTdG9yYWdlU2VydmljZSA9ICRsb2NhbFN0b3JhZ2VTZXJ2aWNlO1xyXG4gICAgc2VsZi4kbW9kYWxTZXJ2aWNlID0gJG1vZGFsU2VydmljZTtcclxuXHJcblxyXG4gICAgaW5pdCgpO1xyXG4gXHJcbiAgICBmdW5jdGlvbiBpbml0KCl7XHJcbiAgICAgICAgaW5pdGlhbGl6ZVBhc3N3b3JkTW9kYWwoKTtcclxuICAgICAgICAkbG9jYWxTdG9yYWdlU2VydmljZS5wb3B1bGF0ZVNlcnZpY2VJdGVtcygpO1xyXG4gICAgfVxyXG4gXHJcbiAgICBmdW5jdGlvbiBpbml0aWFsaXplUGFzc3dvcmRNb2RhbCgpe1xyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9ICcuL3RlbXBsYXRlcy9wYXNzd29yZE1vZGFsLmh0bWwnO1xyXG4gICAgICAgICRtb2RhbFNlcnZpY2UuZ2V0TW9kYWxJbnN0YW5jZSh0ZW1wbGF0ZSwgJHNjb3BlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGQoKXtcclxuICAgICAgICB2YXIgaXRlbSA9IEpTT04uc3RyaW5naWZ5KHNlbGYudXNlciksXHJcbiAgICAgICAgICAgIGtleSA9IHNlbGYudXNlci50aXRsZTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAkbG9jYWxTdG9yYWdlU2VydmljZS5hZGQoa2V5LCBpdGVtKTtcclxuICAgICAgICAgICAgJG1vZGFsU2VydmljZS5oaWRlTW9kYWwoKTtcclxuICAgICAgICAgICAgZW1wdHlUaGVGb3JtKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgJHBvcHVwU2VydmljZS5hbGVydFBvcHVwKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHJlbW92ZShrZXkpe1xyXG4gICAgICAgICRsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVtcHR5VGhlRm9ybSgpe1xyXG4gICAgICAgIHNlbGYudXNlciA9IHt9O1xyXG4gICAgfVxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBmaW5nZXJwcmludEF1dGg7XHJcblxyXG5mdW5jdGlvbiBmaW5nZXJwcmludEF1dGgoKSB7XHJcbiAgICB2YXIgY2xpZW50X2lkID0gJ3Bhc3N3b3JkTWFuYWdlcicsIC8vVXNlZCBhcyBhbiBhbGlhcyBLZXkgZm9yIHRoZSBBbmRyb2lkIEtleSBTdG9yZVxyXG4gICAgICAgIGNsaWVudF9zZWNyZXQgPSAnJzsgLy9Vc2VkIGFzIGFuIGVuY3J5cHQgdG9rZW4gZm9yIGF1dGhlbnRpY2F0aW9uXHJcblxyXG4gICAgdmFyICRzZXJ2aWNlID0gdGhpcztcclxuICAgICRzZXJ2aWNlLmF1dGhlbnRpY2F0ZSA9IGF1dGhlbnRpY2F0ZTtcclxuXHJcbiAgICBmdW5jdGlvbiBhdXRoZW50aWNhdGUoY2FsbGJhY2spIHtcclxuXHJcbiAgICAgICAgaXNBdmFpbGFibGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzY2FuRmluZ2VycHJpbnQoZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2socmVzdWx0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBpc0F2YWlsYWJsZShjYWxsYmFjaykge1xyXG4gICAgICAgIEZpbmdlcnByaW50QXV0aC5pc0F2YWlsYWJsZShmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuaXNBdmFpbGFibGUpXHJcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmhhc0Vucm9sbGVkRmluZ2VycHJpbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ05vIGZpbmdlcnByaW50IHJlZ2lzdGVyZWQuIEdvIHRvIFNldHRpbmdzIC0+IFNlY3VyaXR5IC0+IEZpbmdlcnByaW50JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9LCBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICB0aHJvdyAnQ2Fubm90IGRldGVjdCBmaW5nZXJwcmludCBkZXZpY2U6ICcgKyBtZXNzYWdlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNjYW5GaW5nZXJwcmludChzdWNjZXNzQ2FsbGJhY2spIHtcclxuICAgICAgICBGaW5nZXJwcmludEF1dGguc2hvdyh7XHJcbiAgICAgICAgICAgIGNsaWVudElkOiBjbGllbnRfaWQsXHJcbiAgICAgICAgICAgIGNsaWVudFNlY3JldDogY2xpZW50X3NlY3JldCxcclxuICAgICAgICAgICAgbWF4QXR0ZW1wdHM6IDUsXHJcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiAnUGFzc3dvcmQgTWFuYWdlciBBdXRoZW50aWNhdGlvbicsXHJcbiAgICAgICAgICAgIGRpYWxvZ01lc3NhZ2U6ICdQbGFjZSB5b3VyIGZpbmdlciBpbnRvIHRoZSBzZW5zb3InXHJcbiAgICAgICAgfSwgc3VjY2Vzc0NhbGxiYWNrLCBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG4gICAgICAgICAgICB0aHJvdyAnRmluZ2VycHJpbnQgYXV0aGVudGljYXRpb24gbm90IGF2YWlsYWJsZTogJyArIG1lc3NhZ2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGxvY2FsU3RvcmFnZTtcclxuXHJcbmZ1bmN0aW9uIGxvY2FsU3RvcmFnZSgpe1xyXG4gICAgdmFyICRzZXJ2aWNlID0gdGhpcztcclxuICAgICRzZXJ2aWNlLml0ZW1zID0gW107XHJcbiAgICAkc2VydmljZS5hZGQgPSBhZGQ7XHJcbiAgICAkc2VydmljZS5wb3B1bGF0ZVNlcnZpY2VJdGVtcyA9IHBvcHVsYXRlU2VydmljZUl0ZW1zO1xyXG4gICAgJHNlcnZpY2UuZ2V0QnlLZXkgPSBnZXRCeUtleTtcclxuICAgICRzZXJ2aWNlLnJlbW92ZSA9IHJlbW92ZTsgLy9kZWxldGUga2V5d29yZCBpcyBhIHJlc2VydmVkIHdvcmQuXHJcbiAgICAkc2VydmljZS51cGRhdGUgPSB1cGRhdGU7XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkKGtleSwgdmFsdWUpe1xyXG4gICAgICAgIGlmKCFrZXkpXHJcbiAgICAgICAgICAgIHRocm93ICdUaXRsZSBpbnB1dCBpcyBlbXB0eS4nO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKGhhc0R1cGxpY2F0ZShrZXkpKXtcclxuICAgICAgICAgICAgdGhyb3cgJ1RpdGxlIGlzIGFscmVhZHkgZXhpc3RpbmcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgcG9wdWxhdGVTZXJ2aWNlSXRlbXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRCeUtleShrZXkpe1xyXG4gICAgICAgIGlmKCFrZXkpXHJcbiAgICAgICAgICAgIHRocm93ICdObyBzcGVjaWZpZWQgdGl0bGUnO1xyXG4gICAgICAgIHZhciBpdGVtID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkgPyB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSA6IFtdO1xyXG4gICAgICAgIHJldHVybiBpdGVtIDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwb3B1bGF0ZVNlcnZpY2VJdGVtcygpe1xyXG4gICAgICAgIHZhciBzdG9yYWdlID0gd2luZG93LmxvY2FsU3RvcmFnZSxcclxuICAgICAgICAgICAgbGVuID0gT2JqZWN0LmtleXMoc3RvcmFnZSkubGVuZ3RoLFxyXG4gICAgICAgICAgICBrZXlzID0gT2JqZWN0LmtleXMoc3RvcmFnZSksXHJcbiAgICAgICAgICAgIGl0ZW1zID0gW107XHJcblxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPD0gbGVuIC0gMTsgaSsrKXtcclxuICAgICAgICAgICAgdmFyIGl0ZW0gPSBKU09OLnBhcnNlKCRzZXJ2aWNlLmdldEJ5S2V5KGtleXNbaV0pKTtcclxuICAgICAgICAgICAgaXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzZXJ2aWNlLml0ZW1zID0gaXRlbXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlKGtleSl7XHJcbiAgICAgICAgaWYoIWtleSlcclxuICAgICAgICAgICAgdGhyb3cgJ05vIHNwZWNpZmllZCB0aXRsZSc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XHJcbiAgICAgICAgcG9wdWxhdGVTZXJ2aWNlSXRlbXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoa2V5LCB2YWx1ZSl7XHJcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhc0R1cGxpY2F0ZShrZXkpe1xyXG4gICAgICAgIHJldHVybiBnZXRCeUtleShrZXkpLmxlbmd0aCA+IDAgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9XHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IG1vZGFsO1xyXG5cclxuZnVuY3Rpb24gbW9kYWwoJGlvbmljTW9kYWwpe1xyXG4gICAgdmFyICRzZXJ2aWNlID0gdGhpcztcclxuICAgICRzZXJ2aWNlLm1vZGFsID0gbW9kYWw7XHJcbiAgICAkc2VydmljZS5nZXRNb2RhbEluc3RhbmNlID0gZ2V0TW9kYWxJbnN0YW5jZTtcclxuICAgICRzZXJ2aWNlLnNob3dNb2RhbCA9IHNob3dNb2RhbDtcclxuICAgICRzZXJ2aWNlLmhpZGVNb2RhbCA9IGhpZGVNb2RhbDtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRNb2RhbEluc3RhbmNlKHRlbXBsYXRlLCAkc2NvcGUpe1xyXG5cclxuICAgICAgICAkaW9uaWNNb2RhbC5mcm9tVGVtcGxhdGVVcmwodGVtcGxhdGUsIHtcclxuICAgICAgICAgICAgc2NvcGU6ICRzY29wZSxcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiAnc2xpZGUtaW4tdXAnXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihtb2RhbCl7XHJcbiAgICAgICAgICAgICRzZXJ2aWNlLm1vZGFsID0gbW9kYWw7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd01vZGFsKGNvbnRyb2xsZXJJbnN0YW5jZSl7XHJcbiAgICAgICAgJHNlcnZpY2UubW9kYWwuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhpZGVNb2RhbChjb250cm9sbGVySW5zdGFuY2Upe1xyXG4gICAgICAgICRzZXJ2aWNlLm1vZGFsLmhpZGUoKTtcclxuICAgIH1cclxufSIsIm1vZHVsZS5leHBvcnRzID0gcG9wdXA7XHJcblxyXG5mdW5jdGlvbiBwb3B1cCgkaW9uaWNQb3B1cCl7XHJcbiAgICB2YXIgJHNlcnZpY2UgPSB0aGlzO1xyXG4gICAgJHNlcnZpY2UucG9wdXAgPSAnJztcclxuICAgICRzZXJ2aWNlLmFsZXJ0UG9wdXAgPSBhbGVydFBvcHVwO1xyXG4gICAgJHNlcnZpY2UuY29uZmlybVBvcHVwID0gY29uZmlybVBvcHVwO1xyXG4gICAgJHNlcnZpY2Uuc2hvd1BvcHVwID0gc2hvd1BvcHVwO1xyXG4gICAgJHNlcnZpY2UuY2xvc2VQb3B1cCA9IGNsb3NlUG9wdXA7XHJcblxyXG4gICAgZnVuY3Rpb24gYWxlcnRQb3B1cChtZXNzYWdlLCBjYWxsYmFjayl7XHJcbiAgICAgICAgJHNlcnZpY2UucG9wdXAgPSAkaW9uaWNQb3B1cC5hbGVydCh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnUGFzc3dvcmQgTWFuYWdlcicsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXHJcbiAgICAgICAgfSkudGhlbihjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29uZmlybVBvcHVwKG1lc3NhZ2UsIGNhbGxiYWNrKXtcclxuICAgICAgICAkc2VydmljZS5wb3B1cCA9ICRpb25pY1BvcHVwLmNvbmZpcm0oe1xyXG4gICAgICAgICAgICB0aXRsZTogJ1Bhc3N3b3JkIE1hbmFnZXInLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxyXG4gICAgICAgIH0pLnRoZW4oY2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNob3dQb3B1cChtZXNzYWdlLCBjYWxsYmFjayl7XHJcbiAgICAgICAgJHNlcnZpY2UucG9wdXAgPSAkaW9uaWNQb3B1cC5zaG93KHtcclxuICAgICAgICAgICAgdGl0bGU6ICdQYXNzd29yZCBNYW5hZ2VyJyxcclxuICAgICAgICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcclxuICAgICAgICB9KS50aGVuKGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbG9zZVBvcHVwKCl7XHJcbiAgICAgICAgJHNlcnZpY2UucG9wdXAuY2xvc2UoKTtcclxuICAgIH1cclxufSJdfQ==
