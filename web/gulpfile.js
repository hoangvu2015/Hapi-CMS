// generated on 2016-07-13 using generator-webapp 2.1.0
const dir = require('require-dir')('./gulp');

const gulp = require('gulp');
const del = require('del');

gulp.task('clean', del.bind(null, ['.tmp', 'tmp', 'dist', 'public/build', 'public/dist']));

gulp.task('serve', [
    'admin-serve', 'site-serve'
], () => {
    gulp.start('start');
    gulp.start('watch');
});

gulp.task('build', ['admin-minfile'], () => {});

gulp.task('default', () => {
    gulp.start('serve');
});
