const autoprefixer = require('autoprefixer-core');
const cssnano = require('cssnano');
const cssnext = require('cssnext');
const del = require('del');
const eslint = require('eslint');
const ghpages = require('gh-pages');
const gulp = require('gulp');
const gutil = require('gulp-util');
const liveServer = require('live-server');
const PagesWriter = require('./lib/PagesWriter');
const path = require('path');
const paths = require('./lib/paths');
const postcss = require('gulp-postcss');
const postcssImport = require('postcss-import');
const postcssNested = require('postcss-nested');
const props = require('./lib/props');
const reload = require('require-reload')(require);
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

var pw;

gulp.task('generate', ['js'], function(done) {
  const renderer = reload('./public/bundle');
  pw = new PagesWriter();
  pw.setState({
    paths: paths(),
    props: props(),
    renderer: renderer,
  }).once('write', done);
});

gulp.task('paths:watch', ['generate'], function() {
  gulp.watch([
    'paths.js',
    'posts/**/*',
  ], function() {
    pw.setState({ paths: paths() });
  });
});

gulp.task('props:watch', ['generate'], function() {
  gulp.watch([
    'posts/**/*',
  ], function() {
    pw.setState({ props: props() });
  });
});

gulp.task('renderer:watch', ['generate'], function() {
  gulp.watch([
    'public/bundle.js',
  ], function() {
    const renderer = reload('./public/bundle');
    pw.setState({ renderer: renderer });
  });
});

gulp.task('assets', function() {
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

gulp.task('clean', function(done) {
  del('public', done);
});

gulp.task('css', function() {
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

gulp.task('css:watch', ['css'], function() {
  gulp.watch('src/css/**/*', ['css']);
});

gulp.task('css:build', function() {
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

gulp.task('deploy', ['build'], function(done) {
  ghpages.publish(path.join(__dirname, 'public'), {
    branch: 'master',
  }, done);
});

gulp.task('js', function(done) {
  var initialDone;
  webpack(webpackConfig).watch({}, function(err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack', err);
    }
    if (!initialDone) {
      done();
      initialDone = true;
    }
  });
});

const cli = new eslint.CLIEngine({
  extensions: ['.js', '.jsx'],
});
const formatter = cli.getFormatter();
gulp.task('lint', function(done) {
  const report = cli.executeOnFiles(['.']);
  console.log(formatter(report.results));
  done();
});

gulp.task('lint:watch', ['lint'], function() {
  gulp.watch([
    '*.js',
    '.eslintrc',
    'lib/**/*',
    'src/js/**/*',
  ], ['lint']);
});

function server() {
  liveServer.start({
    port: 4069,
    root: 'public',
    wait: 16,
  });
}

gulp.task('server', function() {
  server();
});

gulp.task('watch', [
  'assets',
  'css:watch',
  'generate',
  'lint:watch',
  'paths:watch',
  'props:watch',
  'renderer:watch',
], function() {
  server();
});
