var Promise = require('bluebird');

const assign = require('object-assign');
const colors = require('colors');
const debounce = require('debounce');
const EventEmitter = require('eventemitter3');
const hash = require('farmhash').hash32;
const mkdirp = Promise.promisify(require('mkdirp'));
const writeFile = Promise.promisify(require('fs').writeFile);

function PagesWriter() {
  this.config = {};
  this.fingerprints = {};
  this.skip = Symbol();

  /* Optimization: debounce writes to 16ms */
  this.debouncedWrite = debounce(this.write.bind(this), 16);
}

PagesWriter.prototype = Object.create(EventEmitter.prototype);
PagesWriter.prototype.constructor = PagesWriter;

PagesWriter.prototype.setState = function(config) {
  this.config = assign({}, this.config, config);
  this.debouncedWrite();
  return this;
};

PagesWriter.prototype.write = function() {
  /* Destructuring, pls! */
  const fingerprints = this.fingerprints;
  const paths = this.config.paths;
  const props = this.config.props;
  const render = this.config.renderer;
  const skip = this.skip;

  const promises = paths.map(function(path) {
    var html;
    var outFile;

    return render(path, props).then(function(_html) {
      html = _html;

      /* Optimization: only write when contents have changed */
      const fingerprint = hash(_html);
      if (fingerprints[path] === fingerprint) {
        throw skip;
      }
      fingerprints[path] = fingerprint;

      return mkdirp(`public${path}`);
    }).then(function() {
      outFile = `public${path}index.html`;
      return writeFile(outFile, html);
    }).then(function() {
      console.log(colors.green(`Wrote to ${outFile}`));
    }).catch(function(err) {
      if (err === skip) return;
      console.error(err);
    });
  });

  Promise.all(promises).then(function() {
    this.emit('write');
  }.bind(this));
};

module.exports = PagesWriter;
