require('dotenv').config();

const loudRejection = require('loud-rejection');
const program = require('commander');

loudRejection();

program
  .option('-w, --watch', 'build pages in watch mode')
  .parse(process.argv);

if (program.watch) {
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
} else {
  require('./build')();
}
