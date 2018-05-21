var Encore = require('@symfony/webpack-encore');

Encore
    // the project directory where all compiled assets will be stored
    .setOutputPath('web/build/')

    // the public path used by the web server to access the previous directory
    .setPublicPath('/build')

    .createSharedEntry('vendor', [
        //JS
        'jquery',
        'jquery-validation',
        'bootstrap-sass',
        './web/assets/template/js/core/app',
        './web/assets/js/app.js',
        //Styles
        'bootstrap-sass/assets/stylesheets/_bootstrap.scss',
        './web/assets/css/app.less',
        './web/assets/template/js/plugins/forms/selects/select2.min',
        './web/assets/template/js/plugins/loaders/blockui.min.js',
        './web/assets/template/js/plugins/notifications/noty.min.js'
    ])

    // allow sass/scss files to be processed
    .enableLessLoader()

    .enableSassLoader()

    // allow legacy applications to use $/jQuery as a global variable
    .autoProvidejQuery()

    .enableSourceMaps(!Encore.isProduction())

    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()

    // show OS notifications when builds finish/fail
    .enableBuildNotifications()

    .autoProvidejQuery()

    .addEntry('settings', './web/assets/js/pages/settings.js')
;

// export the final configuration
module.exports = Encore.getWebpackConfig();