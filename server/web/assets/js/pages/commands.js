$(document).ready(function () {

    $("form[name='start_new_track_command']").validate({
        submitHandler: function (form) {
            WSSession.call("commands/start_new_track", {"trackName": $('#start_new_track_command_trackName').val()}).then(
                function (result) {
                    var resultJson = JSON.parse(result);

                    if (resultJson.status === 200) {
                        notify('Command has been added', 'success');
                    }
                },
                function (error, desc) {
                    notify(error, 'error');
                }
            );
        },
    });
});