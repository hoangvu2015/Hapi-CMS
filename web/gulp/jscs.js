/*Tasks build js,css*/
var gulp = require('gulp'),
notify = require('gulp-notify'),
useref = require('gulp-useref'),
gulpif = require('gulp-if'),
uglify = require('gulp-uglify'),
babel = require('gulp-babel'),
minifyCss = require('gulp-csso'),
ngAnnotate = require('gulp-ng-annotate'),
mainBowerFiles = require('main-bower-files'),
gulpLoadPlugins = require('gulp-load-plugins'),
$ = gulpLoadPlugins();

/**************************************************
SITE
**************************************************/

/*min file trong folder build đến folder dist*/
gulp.task('site-minfile', ['site-useref'], () => {
	/*Min file css (vendor.min.css, main.min.css)*/
});

/*Gộp file*/
gulp.task('site-useref', ['clean', 'site-injectJS', 'site-injectCSS'],() => {

});

/**************************************************
ADMIN
**************************************************/
/*min file trong folder build đến folder dist*/
gulp.task('admin-minfile', ['admin-useref'], () => {
	/*Min file css (vendor.min.css, main.min.css)*/
	gulp.src('public/build/admin/vendor.min.css')
	.pipe(notify('Start min CSS......'))
	.pipe(minifyCss())
	.pipe(gulp.dest('public/dist/admin/styles'));

	gulp.src('public/build/admin/main.min.css')
	.pipe(minifyCss())
	.pipe(gulp.dest('public/dist/admin/styles'))
	.pipe(notify('End min CSS......'));

	/*Min file js (vendor.min.js, main.min.js)*/
	gulp.src('public/build/admin/vendor.min.js')
	.pipe(notify('Start min JS......'))
	.pipe(ngAnnotate())
	.pipe(gulpif('*.js', uglify({compress:true})))
	.pipe(gulp.dest('public/dist/admin/scripts'));

	gulp.src('public/build/admin/main.min.js')
	.pipe(babel({compact: false,presets: ['es2015']}))
	.pipe(ngAnnotate())
	.pipe(gulpif('*.js', uglify({compress:true})))
	.pipe(gulp.dest('public/dist/admin/scripts'))
	.pipe(notify('End min JS......'));

	/*copy font và image*/
	gulp.start('admin-fonts');
	gulp.start('img-adminlte');
});

/*Gộp file*/
gulp.task('admin-useref', ['clean', 'admin-injectJS', 'admin-injectCSS'],() => {
	return gulp.src(['app/views/layouts/admin/**/footer.html', 'app/views/layouts/admin/**/header.html'])
	.pipe(useref({ searchPath: ['public','app'] }))
	.pipe(gulpif('/\.js$/', uglify()))
	.pipe(gulpif('/\.css$/b', minifyCss()))
	.pipe(gulp.dest('public/build/admin'));
});

/*Add font bootstrap*/
gulp.task('admin-fonts', function () {
	return gulp.src(mainBowerFiles({
		paths: {
			bowerDirectory: './public/assets/admin/bower_components',
			bowerrc: './public/assets/admin/.bowerrc',
			bowerJson: './public/assets/admin/bower.json'
		}
	}))
	.pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
	.pipe($.flatten())
	.pipe(gulp.dest('public/dist/admin/fonts/'));
});

/*Add image plugin AdminLte*/
gulp.task('img-adminlte', function () {
	return gulp.src([
		'public/assets/admin/bower_components/AdminLTE/plugins/iCheck/square/green.png',
		'public/assets/admin/bower_components/AdminLTE/plugins/iCheck/square/green@2x.png',
		'public/assets/admin/bower_components/AdminLTE/plugins/iCheck/square/blue.png',
		'public/assets/admin/bower_components/AdminLTE/plugins/iCheck/square/blue@2x.png',
		'public/assets/admin/bower_components/AdminLTE/plugins/iCheck/minimal/green.png',
		'public/assets/admin/bower_components/AdminLTE/plugins/iCheck/minimal/green@2x.png',
		'public/assets/admin/bower_components/AdminLTE/plugins/iCheck/minimal/blue.png',
		'public/assets/admin/bower_components/AdminLTE/plugins/iCheck/minimal/blue@2x.png',
		]).pipe(gulp.dest('public/dist/admin/styles/'));
});