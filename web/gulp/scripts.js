/*Tasks về js*/
const gulp = require('gulp'),
wiredep = require('wiredep').stream,
ngAnnotate = require('gulp-ng-annotate'),
angularFilesort = require('gulp-angular-filesort'),
inject = require('gulp-inject');
// livereload  = require('gulp-livereload');

/**************************************************
SITE
**************************************************/

/*Load file js main vào footer*/
gulp.task('site-injectJS', () => {
	
});

/**************************************************
ADMIN
**************************************************/
/*Load file js main vào footer*/
gulp.task('admin-injectJS', () => {
	/*inject Global, Utils, Angular JS*/
	var srcAngular = gulp.src([
		'./app/modules/admin-*/view/client/**/router.js', 
		'./app/modules/admin-*/view/client/**/filter.js',
		'./app/modules/admin-*/view/client/**/directive.js',
		'./app/modules/admin-*/view/client/**/controller.js',
		'./app/modules/admin-*/view/client/**/service.js',
		'./app/modules/admin-*/view/client/**/define.js', 
		'./app/modules/admin-*/view/client/**/config.js', 
		'./app/modules/admin-*/view/client/**/bootstrap.js', 
		]).pipe(angularFilesort());

	var srcGlobalUtil = gulp.src([
		'./public/assets/admin/scripts/*.js', 
		'./public/assets/admin/scripts/utils/*.js', 
		], {read: false});

	return gulp.src('app/views/layouts/admin/**/footer.html')
	/*Inject bower*/
	.pipe(wiredep({
		directory: './public/assets/admin/bower_components',
		bowerJson: require('../public/assets/admin/bower.json'),
		ignorePath: '../../../../../public/'
	}))
	/*Inject Module Angular*/
	.pipe(inject(srcAngular,{
		name: 'AngularJs',
		addRootSlash : false,
		transform : function ( filePath, file, i, length ) {
			var newPath = filePath.replace( 'app/', '' );
			return '<script src="' + newPath  + '"></script>';
		}
	}))
	/*Inject Libs*/
	.pipe(inject(srcGlobalUtil, {
		name: 'Global, Utils',
		addRootSlash : false,
		transform : function ( filePath, file, i, length ) {
			var newPath = filePath.replace( 'public/', '' );
			return '<script src="' + newPath  + '"></script>';
		}
	}))
	.pipe(gulp.dest('app/views/layouts/admin'));
});
