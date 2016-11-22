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