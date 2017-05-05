const chokidar = require('chokidar');
const moduleInvalidator = require('module-invalidator');
const path = require('path');

moduleInvalidator.install();

require('./build')();

const watcher = chokidar.watch(['config/**/*', 'lib/**/*', 'posts/**/*'], {
  ignored: [/node_modules/],
  ignoreInitial: true,
});

watcher.on('all', (event, filename) => {
  moduleInvalidator.invalidate(path.resolve(filename));

  try {
    require('./build')();
  } catch (err) {
    console.error(err);
  }
});

process.on('unhandledRejection', reason => {
  console.error(reason);
});
