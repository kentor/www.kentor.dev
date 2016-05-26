const minimatch = require('minimatch');

module.exports = (event, filename) => {
  const m = minimatch.bind(minimatch, filename);

  const mod = (() => {
    if (m('posts/*.md')) return require('./post-changed-handler');
    if (m('lib/components/About.js')) {
      return require('./about-changed-handler');
    }
    if (m('lib/components/*.js')) {
      return require('./build');
    }
    return null;
  })();

  if (mod) {
    mod(event, filename);
  }
};
