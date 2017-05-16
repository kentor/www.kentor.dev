const chokidar = require('chokidar');
const invalidate = require('invalidate-module');
const path = require('path');

async function build() {
  try {
    await require('./build')();
  } catch (err) {
    console.error(err);
  }
}

const watcher = chokidar.watch(['lib/**/*', 'posts/**/*'], {
  ignored: [/node_modules/],
  ignoreInitial: true,
});

build();

watcher.on('all', (event, filename) => {
  invalidate(path.resolve(filename));
  build();
});
