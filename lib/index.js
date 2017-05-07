require('dotenv').config();

const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));
const { watch } = argv;

if (watch) {
  const chokidar = require('chokidar');
  const moduleInvalidator = require('module-invalidator');
  const path = require('path');

  moduleInvalidator.install();

  require('./build')();

  const watcher = chokidar.watch(['lib/**/*', 'posts/**/*'], {
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
} else {
  require('./build')();
}

process.on('unhandledRejection', reason => {
  console.error(reason);
});
