const autoprefixer = require('autoprefixer-core');
const cssnano = require('cssnano');
const cssnext = require('cssnext');
const eslint = require('eslint');
const ghpages = require('gh-pages');
const gulp = require('gulp');
const liveServer = require('live-server');
const path = require('path');
const postcss = require('gulp-postcss');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

gulp.task('assets', () => {
  return gulp.src([
    'src/CNAME',
    'src/fonts/**/*',
    'src/images/**/*',
  ], { base: 'src' })
    .pipe(gulp.dest('public'));
});

gulp.task('build', [
  'assets',
  'css:build',
  'generate',
]);

gulp.task('css', () => {
  const processors = [
    postcssImport,
    postcssNested,
    cssnext(),
    autoprefixer,
  ];

  return gulp.src('src/css/app.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public'));
});

gulp.task('css:watch', ['css'], () => {
  gulp.watch('src/css/**/*', ['css']);
});

gulp.task('css:build', () => {
  const processors = [
    postcssImport,
    postcssNested,
    cssnext(),
    autoprefixer,
    cssnano,
  ];

  return gulp.src('src/css/app.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest('public'));
});

gulp.task('deploy', ['build'], done => {
  ghpages.publish(path.join(__dirname, 'public'), {
    branch: 'master',
  }, done);
});

gulp.task('generate', done => {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.log(err.stack);
    }
    done();
  });
});

gulp.task('generate:watch', ['generate'], () => {
  gulp.watch([
    'data.js',
    'posts.js',
    'src/js/**/*',
  ], ['generate']);
});

gulp.task('lint', done => {
  const cli = new eslint.CLIEngine();
  const formatter = cli.getFormatter();
  const report = cli.executeOnFiles(['.']);
  console.log(formatter(report.results));
  done();
});

gulp.task('lint:watch', ['lint'], () => {
  gulp.watch([
    '*.js',
    'src/js/**/*',
  ], ['lint']);
});

gulp.task('watch', [
  'assets',
  'css:watch',
  'generate:watch',
  'lint:watch',
], () => {
  liveServer.start({
    port: 4069,
    root: 'public',
  });
});
