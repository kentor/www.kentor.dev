const cssnano = require('cssnano');
const cssnext = require('postcss-cssnext');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const postcssAssets = require('postcss-assets');
const postcssImport = require('postcss-import');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('assets', function() {
  return gulp.src([
    'src/CNAME',
    'src/fonts/**/*',
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
    basePath: 'src/',
    loadPaths: ['images/'],
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
  const buildProcessors = processors.concat([
    cssnano({
      discardComments: {
        removeAll: true,
      },
    }),
  ]);

  return gulp.src('src/css/app.css')
    .pipe(postcss(buildProcessors))
    .pipe(gulp.dest('public'));
});

gulp.task('build', [
  'assets',
  'css:build',
]);

gulp.task('watch', [
  'assets',
  'css:watch',
]);
