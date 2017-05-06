const cssnano = require('gulp-cssnano');
const cssnext = require('postcss-cssnext');
const del = require('del');
const gulp = require('gulp');
const newer = require('gulp-newer');
const path = require('path');
const postcss = require('gulp-postcss');
const postcssAssets = require('postcss-assets');
const postcssImport = require('postcss-import');
const rev = require('gulp-rev');
const sourcemaps = require('gulp-sourcemaps');
const uncss = require('gulp-uncss');

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

gulp.task('static', () => {
  return gulp.src('static/**/*', { base: 'static' })
    .pipe(newer('public'))
    .pipe(gulp.dest('public'));
});

gulp.task('static:watch', () => {
  const dest = path.resolve('public');
  const src = path.resolve('static');

  const watcher = gulp.watch('static/**/*', ['static']);

  watcher.on('change', event => {
    if (event.type === 'deleted') {
      del(event.path.replace(src, dest));
    }
  });
});

gulp.task('build', [
  'css:build',
  'static',
]);

gulp.task('watch', [
  'css:watch',
  'static:watch',
]);
