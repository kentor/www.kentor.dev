const colors = require('colors/safe');
const fsp = require('fs-promise');
const path = require('path');
const RSS = require('rss');
const settings = require('./settings');

module.exports = function writeFeed(posts) {
  const feed = new RSS({
    'description': settings.description,
    'feed_url': `${settings.host}/posts/feed.xml`,
    'managingEditor': settings.author,
    'site_url': `${settings.host}/`,
    'title': 'kentor.me - Kenneth Chung',
    'webMaster': settings.author,
  });

  posts.forEach(post => {
    feed.item({
      author: settings.author,
      date: post.createdOn,
      description: post.excerpt,
      guid: post.slug,
      title: post.title,
      url: `${settings.host}${post.href}`,
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
