// // generated on 2016-07-13 using generator-webapp 2.1.0
const gulp = require('gulp');
const gulpsync = require('gulp-sync')(gulp);
const livereload = require('gulp-livereload');
// const webserver = require('gulp-webserver');
// const connect = require('gulp-connect');
var notify = require('gulp-notify');
const sass = require('gulp-sass');
const gulpLoadPlugins = require('gulp-load-plugins');
// const browserSync = require('browser-sync');
const del = require('del');
const wiredep = require('wiredep').stream;
const ngAnnotate = require('gulp-ng-annotate');
const nodemon = require('gulp-nodemon');
// const browserSync = require("browser-sync").create();
// const opn = require('opn');
const $ = gulpLoadPlugins();
// const reload = browserSync.reload;
const inject = require('gulp-inject');

var dir = require('require-dir')('./gulp');

// var paths = {
//  // sass: ['./scss/**/*.scss'],
//  javascript: [
//  './app/modules/admin-*/view/**/*.js',
//          // '!./www/js/app.js',
//          // '!./www/lib/**'
//          ],
//      // css: [
//      //     './www/**/*.css',
//      //     '!./www/css/ionic.app*.css',
//      //     '!./www/lib/**'
//      // ]
//    };


//    gulp.task('serve-admin', ['index', 'nodemon', 'adminstyles'], function() {
//     gulp.watch('app/**/*.scss', ['adminstyles']);
//   })

// /************************************
// Chức năng
// ************************************/
// gulp.task('nodemon', () => {
//   livereload.listen();
//   nodemon({
//     script: 'app.js',
//     ext: 'js html json',
//     delay: 5,
//     ignore: [
//     'public/',
//     'var/',
//     'node_modules/',
//     'app/modules/*/view/client/**'
//     ],
//     stdout: true,
//     readable: false,
//     env: {'NODE_ENV': 'development'}
//   });
// });

// gulp.task('index', function(){
//   return  gulp.src('./app/views/layouts/admin/partials/footer.html')
//   .pipe(inject(gulp.src(paths.javascript,{read: false}), {relative: true}))
//   .pipe(gulp.dest('./app'))
//   // .pipe(inject(gulp.src(paths.css,{read: false}), {relative: true}))
//   // .pipe(gulp.dest('./www'));
// });

// gulp.task('adminstyles', () => {

//   gulp.src('public/assets/admin/styles/main.scss')
//   .pipe(sass.sync({
//     outputStyle: 'expanded', // 'compressed'
//     precision: 10,
//     includePaths: ['.']
//   }).on('error', sass.logError))
//   .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
//   .pipe(gulp.dest('public/assets/admin/styles'))

//   gulp.src('app.js')
//   .pipe(livereload())
//   .pipe(notify('Reloading page, please wait...'));
// });



// gulp.task('styles', () => {
//   return gulp.src('app/styles/main.scss')
//   .pipe($.sass.sync({
//     outputStyle: 'expanded',
//     precision: 10,
//     includePaths: ['.']
//   }).on('error', $.sass.logError))
//   .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
//   .pipe(gulp.dest('public/assets/admin/styles'))
//   .pipe(reload({stream: true}));
// });

// gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// gulp.task('serve', ['styles'], () => {
//   nodemon({
//     script: 'app.js',
//     ext: 'js html json',
//     delay: 5,
//     ignore: [
//     'public/',
//     'var/',
//     'node_modules/',
//     'app/modules/*/view/client/**'
//     ],
//     stdout: true,
//     readable: false,
//     env: {'NODE_ENV': 'development'}
//   })

//   gulp.watch([
//     'app/*.html',
//     'app/images/**/*',
//     ]).on('change', reload);

//   gulp.watch('app/**/*.scss', ['styles']);
//   gulp.watch('bower.json', ['wiredep']);
// });

// gulp.task('wiredep', () => {
//   gulp.src('app/styles/*.scss')
//   .pipe(wiredep({
//     ignorePath: /^(\.\.\/)+/
//   }))
//   .pipe(gulp.dest('app/styles'));

//   gulp.src('app/views/layouts/**/*.html')
//   .pipe(wiredep({
//     ignorePath: /^(\.\.\/)*\.\./
//   }))
//   .pipe(gulp.dest('app/views/layouts'));
// });

// gulp.task('default', ['clean'], () => {
//   gulp.start('serve');
// });