const posts = require('./posts');

const postHrefs = posts.toSeq().map(p => p.href).toArray();

module.exports = [
  '/',
  '/about/',
].concat(postHrefs);
