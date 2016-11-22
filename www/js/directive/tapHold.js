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