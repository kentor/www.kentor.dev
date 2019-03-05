const cssnano = require('gulp-cssnano');
const cssnext = require('postcss-cssnext');
const gulp = require('gulp');
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
  return gulp
    .src('assets/css/app.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public'));
});

gulp.task('css:watch', ['css'], () => {
  gulp.watch('assets/css/**/*', ['css']);
});

gulp.task('css:build', () => {
  return gulp
    .src('assets/css/app.css')
    .pipe(postcss(processors))
    .pipe(
      uncss({
        html: ['public/**/*.html'],
      }),
    )
    .pipe(
      cssnano({
        discardComments: {
          removeAll: true,
        },
      }),
    )
    .pipe(gulp.dest('public'));
});

gulp.task('rev', () => {
  return gulp
    .src('public/**/*')
    .pipe(
      rev.revision({
        dontRenameFile: ['.html', '.json', '.xml'],
        dontUpdateReference: ['.html', '.json', '.xml'],
      }),
    )
    .pipe(gulp.dest('public'))
    .pipe(rev.manifestFile())
    .pipe(gulp.dest('public'));
});

gulp.task('build', ['css:build']);

gulp.task('watch', ['css:watch']);
