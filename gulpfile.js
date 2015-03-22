var csso = require('gulp-csso');
var gulp = require('gulp');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('css', function() {
  return gulp.src('src/css/site.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('css'))
});

gulp.task('watch-css', ['css'], function() {
  gulp.watch('src/css/**/*', ['css']);
});

gulp.task('build-css', function() {
  return gulp.src('src/css/site.less')
    .pipe(less())
    .pipe(csso())
    .pipe(gulp.dest('css'))
});

gulp.task('fonts', function() {
  return gulp.src('node_modules/octicons/octicons/octicons.+(eot|svg|ttf|woff)')
    .pipe(gulp.dest('fonts'));
});

gulp.task('build', [
  'build-css',
  'fonts',
]);

gulp.task('default', [
  'watch-css',
  'fonts',
]);
