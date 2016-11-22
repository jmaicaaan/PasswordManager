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