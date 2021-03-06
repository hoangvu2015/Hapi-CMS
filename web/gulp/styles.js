/*Tasks về css*/
const gulp = require('gulp');
const inject = require('gulp-inject'),
gulpLoadPlugins = require('gulp-load-plugins'),
browserSync = require('browser-sync'),
wiredep = require('wiredep').stream,
// livereload  = require('gulp-livereload'),

$ = gulpLoadPlugins(),
reload = browserSync.reload;

/**************************************************
SITE
**************************************************/

/*Inject link module scss vào file main.scss, inject bower*/
gulp.task('site-injectCSS', ['site-styles'], () => {
  /*inject bower css*/
});

/*Build scss sang css vào file main.css*/
gulp.task('site-styles', ['site-injectSCSS'], () => {

});

/*Inject link module scss vào file main.scss*/
gulp.task('site-injectSCSS', () => {
  /*inject Module scss*/
});

/**************************************************
ADMIN
**************************************************/

/*Inject link module scss vào file main.scss, inject bower*/
gulp.task('admin-injectCSS', ['admin-styles'], () => {
  /*inject bower css*/
  return gulp.src('app/views/layouts/admin/**/header.html')
  .pipe(wiredep({
    directory: './public/assets/admin/bower_components',
    bowerJson: require('../public/assets/admin/bower.json'),
    ignorePath: '../../../../../public/'
  }))
  .pipe(inject(gulp.src(['public/tmp/admin/styles/main.css'], {read: false}), {
    name: 'Main',
    addRootSlash : false,
    transform : function ( filePath, file, i, length ) {
      var newPath = filePath.replace( 'public/', '' );
      return '<link rel="stylesheet" href="' + newPath  + '">';
    }
  }))
  .pipe(gulp.dest('app/views/layouts/admin'));
});

/*Build scss sang css vào file main.css*/
gulp.task('admin-styles', ['admin-injectSCSS'], () => {
  return gulp.src('public/assets/admin/styles/main.scss')
  .pipe($.sass.sync({
    outputStyle: 'expanded',
    precision: 10,
    includePaths: ['.']
  }).on('error', $.sass.logError))
  .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
  .pipe(gulp.dest('public/tmp/admin/styles'));
  // .pipe(reload({stream: true}));
});

/*Inject link module scss vào file main.scss*/
gulp.task('admin-injectSCSS', () => {
  /*inject Module scss*/
  var sources = gulp.src(['./app/modules/admin-*/view/client/**/*.scss']);
  var target = gulp.src('public/assets/admin/styles/main.scss');

  return target.pipe(inject(sources, {
    starttag: '/*inject-module:{{ext}}*/',
    endtag: '/*endinject*/',
    transform: function (filepath) {
      return '@import "' + '../../../..' +filepath + '";';
    }
  }))
  .pipe(gulp.dest('./public/assets/admin/styles/'));
});