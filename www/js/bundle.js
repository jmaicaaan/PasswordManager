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
.directive('tapHold', require('./directive/tapHold'));
},{"./config":2,"./controller/detail":3,"./controller/main":4,"./directive/tapHold":5,"./service/localStorage":6,"./service/modal":7,"./service/popup":8}],2:[function(require,module,exports){
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

function detail($localStorageService, $timeout, $stateParams, $state, $popupService, $ionicPopup){
    var self = this;
    self.item = {};
    self.showPassword = showPassword;
    self.updatePassword = updatePassword;
    self.deletePassword = deletePassword;
    self.toggle = toggle;
    self.isTouched = false;
    
    init();

    function init(){
        var key = $stateParams.item;
        self.item = JSON.parse($localStorageService.getByKey(key));
    }

    function showPassword(){
        var password = self.item.password,
            alertMessage = ['Your password is:', '<b>', password, '</b>'].join(' ');
        $popupService.alertPopup(alertMessage);
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

    function toggle(){
        self.isTouched = !self.isTouched;
    }
}
},{}],4:[function(require,module,exports){
module.exports = main;

function main($scope, $ionicModal, $modalService, $localStorageService){
    var self = this;
    self.searchQuery = "";
    self.$localStorageService = $localStorageService;
    self.$modalService = $modalService;
    self.add = add;
    self.remove = remove;

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
            alert(error);
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
module.exports = tapHold;

function tapHold(){
    return {
        restrict: 'A',
        scope: {},
        link: linker
    };

    function linker(scope, elem, attrs){
        // console.log(elem, attrs);
        var maskedPassword = angular.element(document.querySelector("#password")),
            unmaskedPassword = angular.element(document.querySelector("#hidden_password")),
            eyeBtn = angular.element(document.querySelector("#showPasswordBtn"));

        eyeBtn.on('click', function(e){
            toggle();
        });

        function toggle(){
            if(unmaskedPassword.css('display') === 'none'){
                maskedPassword.css('display', 'none');
                unmaskedPassword.css('display', 'block');
            }else{
                maskedPassword.css('display', 'block');
                unmaskedPassword.css('display', 'none');
            }
        }
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
        if(!key || !value)
            throw "Title input is empty.";
        
        if(hasDuplicate(key)){
            throw "Title is already existing";
        }
        
        window.localStorage.setItem(key, value);
        populateServiceItems();
    }

    function getByKey(key){
        if(!key)
            throw "No specified title";
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
            throw "No specified title";
        
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
    $service.alertPopup = alertPopup;
    $service.confirmPopup = confirmPopup;

    function alertPopup(message, callback){
        $ionicPopup.alert({
            title: 'Password Manager',
            template: message
        }).then(callback);
    }

    function confirmPopup(message, callback){
        $ionicPopup.confirm({
            title: 'Password Manager',
            template: message
        }).then(callback);
    }
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvanMvYXBwLmpzIiwid3d3L2pzL2NvbmZpZy5qcyIsInd3dy9qcy9jb250cm9sbGVyL2RldGFpbC5qcyIsInd3dy9qcy9jb250cm9sbGVyL21haW4uanMiLCJ3d3cvanMvZGlyZWN0aXZlL3RhcEhvbGQuanMiLCJ3d3cvanMvc2VydmljZS9sb2NhbFN0b3JhZ2UuanMiLCJ3d3cvanMvc2VydmljZS9tb2RhbC5qcyIsInd3dy9qcy9zZXJ2aWNlL3BvcHVwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiYW5ndWxhci5tb2R1bGUoJ3B3ZG1hbmFnZXInLCBbJ2lvbmljJywgJ2lvbmljLW1hdGVyaWFsJ10pXG5cbi5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblxuICAgICAgLy8gRG9uJ3QgcmVtb3ZlIHRoaXMgbGluZSB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UgYXJlIGRvaW5nLiBJdCBzdG9wcyB0aGUgdmlld3BvcnRcbiAgICAgIC8vIGZyb20gc25hcHBpbmcgd2hlbiB0ZXh0IGlucHV0cyBhcmUgZm9jdXNlZC4gSW9uaWMgaGFuZGxlcyB0aGlzIGludGVybmFsbHkgZm9yXG4gICAgICAvLyBhIG11Y2ggbmljZXIga2V5Ym9hcmQgZXhwZXJpZW5jZS5cbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuICAgIH1cbiAgICBpZih3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pXG5cbi5jb25maWcocmVxdWlyZSgnLi9jb25maWcnKSlcbi5jb250cm9sbGVyKCdtYWluQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vY29udHJvbGxlci9tYWluJykpXG4uY29udHJvbGxlcignZGV0YWlsQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vY29udHJvbGxlci9kZXRhaWwnKSlcbi5zZXJ2aWNlKCckbG9jYWxTdG9yYWdlU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZS9sb2NhbFN0b3JhZ2UnKSlcbi5zZXJ2aWNlKCckcG9wdXBTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlL3BvcHVwJykpXG4uc2VydmljZSgnJG1vZGFsU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZS9tb2RhbCcpKVxuLmRpcmVjdGl2ZSgndGFwSG9sZCcsIHJlcXVpcmUoJy4vZGlyZWN0aXZlL3RhcEhvbGQnKSk7IiwibW9kdWxlLmV4cG9ydHMgPSBjb25maWc7XHJcblxyXG5mdW5jdGlvbiBjb25maWcoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcil7XHJcbiAgICBcclxuXHJcbiAgICAkdXJsUm91dGVyUHJvdmlkZXJcclxuICAgICAgICAub3RoZXJ3aXNlKCcvbWFpbicpO1xyXG5cclxuICAgICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAgICAgLnN0YXRlKCdtYWluJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvbWFpbicsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21haW4uaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdtYWluQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJ1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC5zdGF0ZSgnZGV0YWlsJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvZGV0YWlsP2l0ZW0nLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kZXRhaWwuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdkZXRhaWxDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgY29udHJvbGxlckFzOiAndm0nXHJcbiAgICAgICAgfSlcclxufSIsIm1vZHVsZS5leHBvcnRzID0gZGV0YWlsO1xyXG5cclxuZnVuY3Rpb24gZGV0YWlsKCRsb2NhbFN0b3JhZ2VTZXJ2aWNlLCAkdGltZW91dCwgJHN0YXRlUGFyYW1zLCAkc3RhdGUsICRwb3B1cFNlcnZpY2UsICRpb25pY1BvcHVwKXtcclxuICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgIHNlbGYuaXRlbSA9IHt9O1xyXG4gICAgc2VsZi5zaG93UGFzc3dvcmQgPSBzaG93UGFzc3dvcmQ7XHJcbiAgICBzZWxmLnVwZGF0ZVBhc3N3b3JkID0gdXBkYXRlUGFzc3dvcmQ7XHJcbiAgICBzZWxmLmRlbGV0ZVBhc3N3b3JkID0gZGVsZXRlUGFzc3dvcmQ7XHJcbiAgICBzZWxmLnRvZ2dsZSA9IHRvZ2dsZTtcclxuICAgIHNlbGYuaXNUb3VjaGVkID0gZmFsc2U7XHJcbiAgICBcclxuICAgIGluaXQoKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0KCl7XHJcbiAgICAgICAgdmFyIGtleSA9ICRzdGF0ZVBhcmFtcy5pdGVtO1xyXG4gICAgICAgIHNlbGYuaXRlbSA9IEpTT04ucGFyc2UoJGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0QnlLZXkoa2V5KSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd1Bhc3N3b3JkKCl7XHJcbiAgICAgICAgdmFyIHBhc3N3b3JkID0gc2VsZi5pdGVtLnBhc3N3b3JkLFxyXG4gICAgICAgICAgICBhbGVydE1lc3NhZ2UgPSBbJ1lvdXIgcGFzc3dvcmQgaXM6JywgJzxiPicsIHBhc3N3b3JkLCAnPC9iPiddLmpvaW4oJyAnKTtcclxuICAgICAgICAkcG9wdXBTZXJ2aWNlLmFsZXJ0UG9wdXAoYWxlcnRNZXNzYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVQYXNzd29yZCgpe1xyXG4gICAgICAgIHZhciBpdGVtID0gSlNPTi5zdHJpbmdpZnkoc2VsZi5pdGVtKSxcclxuICAgICAgICAgICAga2V5ID0gc2VsZi5pdGVtLnRpdGxlLFxyXG4gICAgICAgICAgICBhbGVydE1lc3NhZ2UgPSAnWW91ciBwYXNzd29yZCBoYXMgYmVlbiB1cGRhdGVkLic7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJGxvY2FsU3RvcmFnZVNlcnZpY2UudXBkYXRlKGtleSwgaXRlbSk7XHJcbiAgICAgICAgJHBvcHVwU2VydmljZS5hbGVydFBvcHVwKG1lc3NhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlbGV0ZVBhc3N3b3JkKCl7XHJcbiAgICAgICAgdmFyIGtleSA9IHNlbGYuaXRlbS50aXRsZSwgIFxyXG4gICAgICAgICAgICBjb25maXJtRGVsZXRlTWVzc2FnZSA9IFsnRGVsZXRlIDxiPicsIGtleSwgJzwvYj4gcGFzc3dvcmQ/J10uam9pbignICcpO1xyXG4gICAgICAgIFxyXG4gICAgICAgICRwb3B1cFNlcnZpY2UuY29uZmlybVBvcHVwKGNvbmZpcm1EZWxldGVNZXNzYWdlLCBmdW5jdGlvbihyZXNwb25zZSl7XHJcbiAgICAgICAgICAgIGlmKHJlc3BvbnNlKXtcclxuICAgICAgICAgICAgICAgIHZhciBhbGVydE1lc3NhZ2UgPSAnWW91IGhhdmUgZGVsZXRlZCB5b3VyIHBhc3N3b3JkLic7XHJcbiAgICAgICAgICAgICAgICAkbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoa2V5KTtcclxuICAgICAgICAgICAgICAgICRwb3B1cFNlcnZpY2UuYWxlcnRQb3B1cChhbGVydE1lc3NhZ2UsIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdtYWluJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRvZ2dsZSgpe1xyXG4gICAgICAgIHNlbGYuaXNUb3VjaGVkID0gIXNlbGYuaXNUb3VjaGVkO1xyXG4gICAgfVxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBtYWluO1xyXG5cclxuZnVuY3Rpb24gbWFpbigkc2NvcGUsICRpb25pY01vZGFsLCAkbW9kYWxTZXJ2aWNlLCAkbG9jYWxTdG9yYWdlU2VydmljZSl7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICBzZWxmLnNlYXJjaFF1ZXJ5ID0gXCJcIjtcclxuICAgIHNlbGYuJGxvY2FsU3RvcmFnZVNlcnZpY2UgPSAkbG9jYWxTdG9yYWdlU2VydmljZTtcclxuICAgIHNlbGYuJG1vZGFsU2VydmljZSA9ICRtb2RhbFNlcnZpY2U7XHJcbiAgICBzZWxmLmFkZCA9IGFkZDtcclxuICAgIHNlbGYucmVtb3ZlID0gcmVtb3ZlO1xyXG5cclxuICAgIGluaXQoKTtcclxuIFxyXG4gICAgZnVuY3Rpb24gaW5pdCgpe1xyXG4gICAgICAgIGluaXRpYWxpemVQYXNzd29yZE1vZGFsKCk7XHJcbiAgICAgICAgJGxvY2FsU3RvcmFnZVNlcnZpY2UucG9wdWxhdGVTZXJ2aWNlSXRlbXMoKTtcclxuICAgIH1cclxuIFxyXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZVBhc3N3b3JkTW9kYWwoKXtcclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSAnLi90ZW1wbGF0ZXMvcGFzc3dvcmRNb2RhbC5odG1sJztcclxuICAgICAgICAkbW9kYWxTZXJ2aWNlLmdldE1vZGFsSW5zdGFuY2UodGVtcGxhdGUsICRzY29wZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkKCl7XHJcbiAgICAgICAgdmFyIGl0ZW0gPSBKU09OLnN0cmluZ2lmeShzZWxmLnVzZXIpLFxyXG4gICAgICAgICAgICBrZXkgPSBzZWxmLnVzZXIudGl0bGU7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgJGxvY2FsU3RvcmFnZVNlcnZpY2UuYWRkKGtleSwgaXRlbSk7XHJcbiAgICAgICAgICAgICRtb2RhbFNlcnZpY2UuaGlkZU1vZGFsKCk7XHJcbiAgICAgICAgICAgIGVtcHR5VGhlRm9ybSgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGZ1bmN0aW9uIHJlbW92ZShrZXkpe1xyXG4gICAgICAgICRsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVtcHR5VGhlRm9ybSgpe1xyXG4gICAgICAgIHNlbGYudXNlciA9IHt9O1xyXG4gICAgfVxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSB0YXBIb2xkO1xyXG5cclxuZnVuY3Rpb24gdGFwSG9sZCgpe1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgIHNjb3BlOiB7fSxcclxuICAgICAgICBsaW5rOiBsaW5rZXJcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gbGlua2VyKHNjb3BlLCBlbGVtLCBhdHRycyl7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coZWxlbSwgYXR0cnMpO1xyXG4gICAgICAgIHZhciBtYXNrZWRQYXNzd29yZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Bhc3N3b3JkXCIpKSxcclxuICAgICAgICAgICAgdW5tYXNrZWRQYXNzd29yZCA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2hpZGRlbl9wYXNzd29yZFwiKSksXHJcbiAgICAgICAgICAgIGV5ZUJ0biA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3dQYXNzd29yZEJ0blwiKSk7XHJcblxyXG4gICAgICAgIGV5ZUJ0bi5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcclxuICAgICAgICAgICAgdG9nZ2xlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHRvZ2dsZSgpe1xyXG4gICAgICAgICAgICBpZih1bm1hc2tlZFBhc3N3b3JkLmNzcygnZGlzcGxheScpID09PSAnbm9uZScpe1xyXG4gICAgICAgICAgICAgICAgbWFza2VkUGFzc3dvcmQuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgICAgIHVubWFza2VkUGFzc3dvcmQuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgbWFza2VkUGFzc3dvcmQuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICAgICB1bm1hc2tlZFBhc3N3b3JkLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGxvY2FsU3RvcmFnZTtcclxuXHJcbmZ1bmN0aW9uIGxvY2FsU3RvcmFnZSgpe1xyXG4gICAgdmFyICRzZXJ2aWNlID0gdGhpcztcclxuICAgICRzZXJ2aWNlLml0ZW1zID0gW107XHJcbiAgICAkc2VydmljZS5hZGQgPSBhZGQ7XHJcbiAgICAkc2VydmljZS5wb3B1bGF0ZVNlcnZpY2VJdGVtcyA9IHBvcHVsYXRlU2VydmljZUl0ZW1zO1xyXG4gICAgJHNlcnZpY2UuZ2V0QnlLZXkgPSBnZXRCeUtleTtcclxuICAgICRzZXJ2aWNlLnJlbW92ZSA9IHJlbW92ZTsgLy9kZWxldGUga2V5d29yZCBpcyBhIHJlc2VydmVkIHdvcmQuXHJcbiAgICAkc2VydmljZS51cGRhdGUgPSB1cGRhdGU7XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkKGtleSwgdmFsdWUpe1xyXG4gICAgICAgIGlmKCFrZXkgfHwgIXZhbHVlKVxyXG4gICAgICAgICAgICB0aHJvdyBcIlRpdGxlIGlucHV0IGlzIGVtcHR5LlwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKGhhc0R1cGxpY2F0ZShrZXkpKXtcclxuICAgICAgICAgICAgdGhyb3cgXCJUaXRsZSBpcyBhbHJlYWR5IGV4aXN0aW5nXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcclxuICAgICAgICBwb3B1bGF0ZVNlcnZpY2VJdGVtcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEJ5S2V5KGtleSl7XHJcbiAgICAgICAgaWYoIWtleSlcclxuICAgICAgICAgICAgdGhyb3cgXCJObyBzcGVjaWZpZWQgdGl0bGVcIjtcclxuICAgICAgICB2YXIgaXRlbSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpID8gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkgOiBbXTtcclxuICAgICAgICByZXR1cm4gaXRlbSA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcG9wdWxhdGVTZXJ2aWNlSXRlbXMoKXtcclxuICAgICAgICB2YXIgc3RvcmFnZSA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UsXHJcbiAgICAgICAgICAgIGxlbiA9IE9iamVjdC5rZXlzKHN0b3JhZ2UpLmxlbmd0aCxcclxuICAgICAgICAgICAga2V5cyA9IE9iamVjdC5rZXlzKHN0b3JhZ2UpLFxyXG4gICAgICAgICAgICBpdGVtcyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDw9IGxlbiAtIDE7IGkrKyl7XHJcbiAgICAgICAgICAgIHZhciBpdGVtID0gSlNPTi5wYXJzZSgkc2VydmljZS5nZXRCeUtleShrZXlzW2ldKSk7XHJcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2VydmljZS5pdGVtcyA9IGl0ZW1zO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZShrZXkpe1xyXG4gICAgICAgIGlmKCFrZXkpXHJcbiAgICAgICAgICAgIHRocm93IFwiTm8gc3BlY2lmaWVkIHRpdGxlXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XHJcbiAgICAgICAgcG9wdWxhdGVTZXJ2aWNlSXRlbXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoa2V5LCB2YWx1ZSl7XHJcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhc0R1cGxpY2F0ZShrZXkpe1xyXG4gICAgICAgIHJldHVybiBnZXRCeUtleShrZXkpLmxlbmd0aCA+IDAgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9XHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IG1vZGFsO1xyXG5cclxuZnVuY3Rpb24gbW9kYWwoJGlvbmljTW9kYWwpe1xyXG4gICAgdmFyICRzZXJ2aWNlID0gdGhpcztcclxuICAgICRzZXJ2aWNlLm1vZGFsID0gbW9kYWw7XHJcbiAgICAkc2VydmljZS5nZXRNb2RhbEluc3RhbmNlID0gZ2V0TW9kYWxJbnN0YW5jZTtcclxuICAgICRzZXJ2aWNlLnNob3dNb2RhbCA9IHNob3dNb2RhbDtcclxuICAgICRzZXJ2aWNlLmhpZGVNb2RhbCA9IGhpZGVNb2RhbDtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRNb2RhbEluc3RhbmNlKHRlbXBsYXRlLCAkc2NvcGUpe1xyXG5cclxuICAgICAgICAkaW9uaWNNb2RhbC5mcm9tVGVtcGxhdGVVcmwodGVtcGxhdGUsIHtcclxuICAgICAgICAgICAgc2NvcGU6ICRzY29wZSxcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiAnc2xpZGUtaW4tdXAnXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihtb2RhbCl7XHJcbiAgICAgICAgICAgICRzZXJ2aWNlLm1vZGFsID0gbW9kYWw7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2hvd01vZGFsKGNvbnRyb2xsZXJJbnN0YW5jZSl7XHJcbiAgICAgICAgJHNlcnZpY2UubW9kYWwuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhpZGVNb2RhbChjb250cm9sbGVySW5zdGFuY2Upe1xyXG4gICAgICAgICRzZXJ2aWNlLm1vZGFsLmhpZGUoKTtcclxuICAgIH1cclxufSIsIm1vZHVsZS5leHBvcnRzID0gcG9wdXA7XHJcblxyXG5mdW5jdGlvbiBwb3B1cCgkaW9uaWNQb3B1cCl7XHJcbiAgICB2YXIgJHNlcnZpY2UgPSB0aGlzO1xyXG4gICAgJHNlcnZpY2UuYWxlcnRQb3B1cCA9IGFsZXJ0UG9wdXA7XHJcbiAgICAkc2VydmljZS5jb25maXJtUG9wdXAgPSBjb25maXJtUG9wdXA7XHJcblxyXG4gICAgZnVuY3Rpb24gYWxlcnRQb3B1cChtZXNzYWdlLCBjYWxsYmFjayl7XHJcbiAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xyXG4gICAgICAgICAgICB0aXRsZTogJ1Bhc3N3b3JkIE1hbmFnZXInLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxyXG4gICAgICAgIH0pLnRoZW4oY2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbmZpcm1Qb3B1cChtZXNzYWdlLCBjYWxsYmFjayl7XHJcbiAgICAgICAgJGlvbmljUG9wdXAuY29uZmlybSh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnUGFzc3dvcmQgTWFuYWdlcicsXHJcbiAgICAgICAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXHJcbiAgICAgICAgfSkudGhlbihjYWxsYmFjayk7XHJcbiAgICB9XHJcbn0iXX0=
