var Promise = require('bluebird');

const assign = require('object-assign');
const colors = require('colors');
const debounce = require('debounce');
const hash = require('farmhash').hash32;
const mkdirp = Promise.promisify(require('mkdirp'));
const writeFile = Promise.promisify(require('fs').writeFile);

function PagesWriter(config) {
  this.fingerprints = {};
  this.skip = Symbol();

  /* Optimization: debounce writes to 16ms */
  this.debouncedWrite = debounce(this.write.bind(this), 16);

  this.setState(config);
}

PagesWriter.prototype.write = function() {
  /* Destructuring, pls! */
  const fingerprints = this.fingerprints;
  const paths = this.config.paths;
  const props = this.config.props;
  const renderer = this.config.renderer;
  const skip = this.skip;

  paths.forEach(function(path) {
    var html;
    var outFile;

    renderer(path, props).then(function(_html) {
      html = _html;

      /* Optimization: only write when contents have changed */
      const fingerprint = hash(_html);
      if (fingerprints[path] === fingerprint) {
        throw skip;
      }
      fingerprints[path] = fingerprint;

      return mkdirp('public' + path);
    }).then(function() {
      outFile = 'public' + path + 'index.html';
      return writeFile(outFile, html);
    }).then(function() {
      console.log(colors.green('Wrote to ' + outFile));
    }).catch(function(err) {
      if (err === skip) return;
      console.error(err);
    });
  });
};

PagesWriter.prototype.setState = function(config) {
  this.config = assign({}, this.config, config);
  this.debouncedWrite();
};

module.exports = PagesWriter;
