let rev;

try {
  rev = require('../public/rev-manifest.json');
} catch (e) {
  rev = {};
}

function get(path) {
  return rev[path] || path;
}

exports.get = get;
