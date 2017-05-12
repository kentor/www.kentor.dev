const cssnano = require('gulp-cssnano');
const cssnext = require('postcss-cssnext');
const fs = require('fs-extra');
const gulp = require('gulp');
const newer = require('gulp-newer');
const path = require('path');
const postcss = require('gulp-postcss');
const postcssImport = require('postcss-import');
const rev = require('gulp-rev-all');
const sourcemaps = require('gulp-sourcemaps');
const uncss = require('gulp-uncss');

const processors = [
  postcssImport,
  cssnext({
    browsers: ['last 1 version'],
  }),
];

gulp.task('css', () => {
  return gulp.src('assets/css/app.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public'));
});

gulp.task('css:watch', ['css'], () => {
  gulp.watch('assets/css/**/*', ['css']);
});

gulp.task('css:build', () => {
  return gulp.src('assets/css/app.css')
    .pipe(postcss(processors))
    .pipe(uncss({
      html: ['public/**/*.html'],
    }))
    .pipe(cssnano({
      discardComments: {
        removeAll: true,
      },
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('rev', () => {
  return gulp.src('public/**/*')
    .pipe(rev.revision({
      dontRenameFile: ['.html', '.json', '.xml'],
      dontUpdateReference: ['.html', '.json', '.xml'],
    }))
    .pipe(gulp.dest('public'))
    .pipe(rev.manifestFile())
    .pipe(gulp.dest('public'));
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
      fs.remove(event.path.replace(src, dest));
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
