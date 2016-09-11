const cssnano = require('gulp-cssnano');
const cssnext = require('postcss-cssnext');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const postcssAssets = require('postcss-assets');
const postcssImport = require('postcss-import');
const rev = require('gulp-rev');
const sourcemaps = require('gulp-sourcemaps');
const uncss = require('gulp-uncss');

gulp.task('assets', function() {
  return gulp.src([
    'src/images/**/*',
  ], { base: 'src' })
    .pipe(gulp.dest('public'));
});

const processors = [
  postcssImport,
  cssnext({
    browsers: ['last 1 version'],
  }),
  postcssAssets({
    loadPaths: ['src'],
  }),
];

gulp.task('css', function() {
  return gulp.src('src/css/app.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public'));
});

gulp.task('css:watch', ['css'], function() {
  gulp.watch('src/css/**/*', ['css']);
});

gulp.task('css:build', function() {
  return gulp.src('src/css/app.css')
    .pipe(postcss(processors))
    .pipe(uncss({
      html: ['public/**/*.html'],
    }))
    .pipe(cssnano({
      discardComments: {
        removeAll: true,
      },
    }))
    .pipe(gulp.dest('public'))
    .pipe(rev())
    .pipe(gulp.dest('public'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('public'))
    ;
});

gulp.task('build', [
  'assets',
  'css:build',
]);

gulp.task('watch', [
  'assets',
  'css:watch',
]);
