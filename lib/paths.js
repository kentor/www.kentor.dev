const fs = require('fs');
const reload = require('require-reload')(require);
const path = require('path');

const postsDir = path.join(__dirname, '..', 'posts');

module.exports = function paths() {
  const pathsOfPosts = fs.readdirSync(postsDir).map(function(filename) {
    const match = filename.match(/^\d{4}-\d{2}-\d{2}-(.*?)\.md$/);
    if (match) {
      return `/posts/${match[1]}/`;
    }
  }).filter(Boolean);

  const staticPaths = reload('./staticPaths');

  return staticPaths.concat(pathsOfPosts);
};
