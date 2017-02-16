const build = require('./build');
const postUtils = require('./post-utils');

module.exports = (event, absFilename) => {
  if (event === 'add' || event === 'change') {
    postUtils.parsePost(absFilename).then(post => {
      postUtils.writePost(post).then(build);
    });
  } else if (event === 'unlink') {
    postUtils.deletePost(absFilename).then(build);
  }
};
