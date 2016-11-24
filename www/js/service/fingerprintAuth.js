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