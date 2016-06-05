require('babel-register');

const fs = require('fs');
const Index = require('./components/Index');
const path = require('path');
const postUtils = require('./post-utils');
const staticPagesHandler = require('./static-pages-handler');
const writeReactElement = require('./write-react-element');

const postsDir = path.resolve('posts');

function build() {
  fs.readdir(postsDir, (err, files) => {
    if (err) throw err;
    Promise.all(files.map(filename => {
      return postUtils.parsePost(path.join(postsDir, filename));
    })).then(posts => {
      posts.forEach(postUtils.writePost);
      posts.sort((a, b) => {
        return -a.createdOn.localeCompare(b.createdOn);
      });
      writeReactElement(Index({ posts }), '/');
    });
  });
  staticPagesHandler();
}

module.exports = build;

if (require.main === module) {
  build();
}
