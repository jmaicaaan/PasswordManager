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