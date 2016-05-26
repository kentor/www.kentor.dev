const fs = require('fs');
const path = require('path');

module.exports = function fileExists(filename) {
  try {
    return !!fs.statSync(path.resolve(filename));
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    throw e;
  }
};
