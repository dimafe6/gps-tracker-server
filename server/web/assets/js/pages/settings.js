$(document).ready(function () {
    $('.select-styled').select2({
        minimumResultsForSearch: -1
    });

    $("form[name='settings']").validate({
        rules: {
            "settings[gpsSearchTime]": {
                required: true,
                min: 5000,
                max: 60000
            },
            "settings[sleepTime]": {
                required: true,
                min: 2000,
                max: 600000
            },
            "settings[wifiConnectionTimeout]": {
                required: true,
                min: 100,
                max: 1000
            },
            "settings[wifiConnectionRetries]": {
                required: true,
                min: 40,
                max: 100
            },
            "settings[frequencyWaypoints]": {
                required: true,
                min: 50,
                max: 1000
            },
            "settings[sleepType]": {
                required: true
            }
        },
        submitHandler: function (form) {
            if ($(form).hasClass('invalid')) {
                return false;
            } else {
                submitFormHandler(form, function (data) {
                }, function (data) {
                    if (data.message) {
                        $('#error-block').text(data.message).show();
                        $("form[name='settings']").removeClass('invalid');
                    }
                });
            }
        },
    });
});