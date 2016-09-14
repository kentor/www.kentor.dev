require('babel-register');

const fs = require('fs');
const Index = require('./components/Index');
const path = require('path');
const postUtils = require('./post-utils');
const staticPagesHandler = require('./static-pages-handler');
const writeFeed = require('./write-feed');
const writeReactElement = require('./write-react-element');

const postsDir = path.resolve('posts');

function build() {
  fs.readdir(postsDir, (err, files) => {
    if (err) throw err;
    Promise.all(files.map(filename => {
      return postUtils.parsePost(path.join(postsDir, filename));
    })).then(posts => {
      if (process.env.NODE_ENV === 'production') {
        posts = posts.filter(p => !p.draft);
      }
      posts.forEach(postUtils.writePost);
      posts.sort((a, b) => {
        return -a.createdOn.localeCompare(b.createdOn);
      });
      writeReactElement(Index({ posts }), '/');
      writeFeed(posts);
    });
  });
  staticPagesHandler();
}

module.exports = build;

if (require.main === module) {
  build();
}
