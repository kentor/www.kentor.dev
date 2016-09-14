const colors = require('colors/safe');
const fsp = require('fs-promise');
const path = require('path');
const RSS = require('rss');

module.exports = function writeFeed(posts) {
  const feed = new RSS({
    'description': 'Writing on Web Development',
    'feed_url': 'https://kentor.me/posts/feed.xml',
    'managingEditor': 'Kenneth Chung',
    'site_url': 'https://kentor.me/',
    'title': 'kentor.me - Kenneth Chung',
    'webMaster': 'Kenneth Chung',
  });

  posts.forEach(post => {
    feed.item({
      author: 'Kenneth Chung',
      date: post.createdOn,
      description: post.excerpt,
      guid: post.slug,
      title: post.title,
      url: `https://kentor.me${post.href}`,
    });
  });

  const outputDir = path.join(path.resolve('public'), 'posts');
  const xml = feed.xml();

  return fsp.mkdirs(outputDir).then(() => {
    const outputFile = path.join(outputDir, 'feed.xml');
    return fsp.writeFile(outputFile, xml);
  }).then(() => {
    console.log(colors.green('wrote'), 'feed', xml.length);
  });
};
