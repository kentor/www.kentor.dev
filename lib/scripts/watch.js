const chokidar = require('chokidar');
const invalidate = require('invalidate-module');
const path = require('path');

require('./build')();

const watcher = chokidar.watch(['lib/**/*', 'posts/**/*'], {
  ignored: [/node_modules/],
  ignoreInitial: true,
});

watcher.on('all', (event, filename) => {
  invalidate(path.resolve(filename));

  try {
    require('./build')();
  } catch (err) {
    console.error(err);
  }
});
