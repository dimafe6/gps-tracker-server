global.ajaxCount = 0;

$.validator.setDefaults({
    errorElement: "em",
    errorPlacement: function (error, element) {
        // Add the `help-block` class to the error element
        error.addClass("help-block");

        if (element.prop("type") === "checkbox") {
            error.insertAfter(element.parent("label"));
        } else {
            error.insertAfter(element);
        }
    },
    highlight: function (element, errorClass, validClass) {
        $(element).closest(".form-group").addClass("has-error").removeClass("has-success");
    },
    unhighlight: function (element, errorClass, validClass) {
        $(element).closest(".form-group").addClass("has-success").removeClass("has-error");
    }
});

global.overlay = function overlay(message) {
    message = message || '';
    $.blockUI({
        message: message + ' <i class="icon-spinner4 spinner"></i>',
        overlayCSS: {
            backgroundColor: '#1b2024',
            opacity: 0.8,
            zIndex: 2000,
            cursor: 'wait'
        },
        css: {
            border: 0,
            color: '#fff',
            padding: 0,
            zIndex: 2000,
            backgroundColor: 'transparent'
        }
    });
};

global.hideOverlay = function hideOverlay() {
    $.unblockUI();
};

global.notify = function notify(text, type) {
    noty({
        width: 200,
        text: text,
        type: type,
        dismissQueue: true,
        timeout: 4000,
    });
};

$.ajaxSetup({
    cache: true,
    complete: function (x, status, error) {
        ajaxCount--;

        if (x.getResponseHeader('X-Location')) {
            location.href = x.getResponseHeader('X-Location');
            return;
        }

        var type = x.status >= 200 && x.status < 300 ? 'success' : 'error';

        if (x.responseJSON && x.responseJSON.message) {
            notify(x.responseJSON.message, type);
        }

        if (ajaxCount <= 0) {
            hideOverlay();
        }
    },
    beforeSend: function (xhr, settings) {
        if (!settings.crossDomain) {
            overlay(settings.message);
        }

        ajaxCount++;
    }
});

global.submitFormHandler = function submitFormHandler(element, done, fail, message) {
    var form = $(element);

    var processor = function processError(error, fieldId, form) {
        if ($.isArray(error) || typeof error === 'object') {
            for (var key in error) {
                var nextFieldId = fieldId;
                // If next element is Array or Object then add error key to fieldId
                if ($.isArray(error[key]) || typeof error[key] === 'object') {
                    nextFieldId += '[' + key + ']';
                }
                processError(error[key], nextFieldId, form);
            }
        } else {
            //If error is error text
            var field = $($(form).find('[name*="' + fieldId + '"]:first'));
            var fieldContainer = field.closest('.form-group');

            //If field errors bloc is exist then add error to this block
            if (field.next('.text-danger').length > 0) {
                var fieldErrors = field.next('.text-danger');
                fieldErrors.append('<ul class="list-unstyled">' + error + '</ul>')
            } else {
                //If field errors bloc not exist then create this block
                field.after('<span class="text-danger" style="margin-top: 2px"><ul class="list-unstyled">' + error + '</ul></span>');
            }

            fieldContainer.addClass('has-error');
        }
    };

    $.ajax({
        type: form.attr('method'),
        url: form.attr('action'),
        data: form.serialize(),
        message: message,
        beforeSend: function (xhr, settings) {
            form.find("input[type='submit']").prop('disabled', 1);

            if (!settings.crossDomain) {
                overlay(settings.message);
            }

            ajaxCount++;
        }
    })
        .done(function (data) {
            form.find("input[type='submit']").prop('disabled', 0);

            if (done) {
                done(data);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (typeof jqXHR.responseJSON !== 'undefined') {
                if (jqXHR.status !== 200) {
                    $('span.text-danger').remove();
                    $('div.has-error').removeClass('has-error');

                    form.addClass('invalid');

                    var fieldId = '';
                    processor(jqXHR.responseJSON.errors, fieldId, form);
                }

                if (fail) {
                    fail(jqXHR.responseJSON)
                }
            }
        });
};