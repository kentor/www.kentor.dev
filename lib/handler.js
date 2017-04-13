const minimatch = require('minimatch');

module.exports = (event, absFilename) => {
  const m = minimatch.bind(minimatch, absFilename);

  const module = (() => {
    if (m('**/posts/*.md')) return require('./post-changed-handler');
    if (m('**/lib/components/(About|Cheese|NotFound).js')) {
      return require('./static-pages-handler');
    }
    if (m('**/lib/**/*')) {
      return require('./build');
    }
    return null;
  })();

  if (module) {
    module(event, absFilename);
  }
};
