require('babel-register');
const minimatch = require('minimatch');

module.exports = (event, filename) => {
  const m = minimatch.bind(minimatch, filename);

  const module = (() => {
    if (m('posts/*.md')) return require('./post-changed-handler');
    if (m('lib/components/About.js')) {
      return require('./about-changed-handler');
    }
    if (m('lib/components/*.js')) {
      return require('./build');
    }
    return null;
  })();

  if (module) {
    module(event, filename);
  }
};
