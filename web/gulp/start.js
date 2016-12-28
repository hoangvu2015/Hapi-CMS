/*Tasks start server*/
var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    livereload  = require('gulp-livereload');

gulp.task('start', function () {
    // Create LiveReload server
    livereload.listen();

    // Start nodemon
    nodemon({
        script: 'app.js',
        ext: 'js html json',
        delay: 5,
        ignore: [
            'public/**',
            'var/',
            'node_modules/**',
            'app/modules/*/view/client/**'
        ],
        stdout:   true,
        readable: false,
        env: {'NODE_ENV': 'development'}
    })
});
