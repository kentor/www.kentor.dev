const fs = require('fs');
const Immutable = require('immutable');
const path = require('path');
const postParser = require('./postParser');

const postsDir = path.join(__dirname, '..', 'posts');

module.exports = function props() {
  const absPathsOfPosts = fs.readdirSync(postsDir).map(function(filename) {
    if (/^\d{4}-\d{2}-\d{2}-.*?\.md$/.test(filename)) {
      return path.join(postsDir, filename);
    }
  }).filter(Boolean);

  const posts = Immutable.OrderedMap(absPathsOfPosts.map(function(path) {
    const post = postParser(path);
    return [post.slug, post];
  })).reverse().toJS();

  return {
    posts: posts,
    title: 'kentor.me',
  };
};
