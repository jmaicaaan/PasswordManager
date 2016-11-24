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