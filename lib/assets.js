let rev;

try {
  rev = require('../public/rev-manifest.json');
} catch (e) {
  rev = {};
}

exports.get = function get(path) {
  return path in rev ? rev[path] : path;
};
