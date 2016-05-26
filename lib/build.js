require('babel-register');

const About = require('./components/About');
const fs = require('fs');
const Index = require('./components/Index');
const path = require('path');
const postUtils = require('./post-utils');
const writeReactElement = require('./write-react-element');

const postsDir = path.resolve('posts');

module.exports = function build() {
  fs.readdir(postsDir, (err, files) => {
    if (err) throw err;
    Promise.all(files.map(filename => {
      return postUtils.parsePost(path.join(postsDir, filename));
    })).then(posts => {
      posts.forEach(post => postUtils.writePost(post));
      posts.sort((a, b) => {
        return -a.createdOn.localeCompare(b.createdOn);
      });
      writeReactElement(Index({ posts }), '/');
    });
  });
  writeReactElement(About(), 'about');
};

if (require.main === module) {
  module.exports();
}
