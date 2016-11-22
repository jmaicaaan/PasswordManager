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