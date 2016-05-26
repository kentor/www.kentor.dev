const fileExists = require('./file-exists');
const postUtils = require('./post-utils');

module.exports = (event, filename) => {
  if (event === 'change' || fileExists(filename)) {
    postUtils.parsePost(filename).then(post => {
      postUtils.writePost(post);
    });
  } else {
    postUtils.deletePost(filename);
  }
};
