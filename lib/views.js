const Index = require('./components/Index');
const parse = require('./parse');
const Post = require('./components/Post');
const render = require('./render');
const RSS = require('rss');
const settings = require('./settings');

async function index({ postMetas }) {
  const posts = await Promise.all(postMetas.map(parse));
  posts.sort((a, b) => -a.createdOn.localeCompare(b.createdOn));
  return render(Index({ posts }));
}

async function post(meta) {
  const post = await parse(meta);
  return render(Post({ post }));
}

async function feed({ postMetas }) {
  const posts = await Promise.all(postMetas.map(parse));
  posts.sort((a, b) => -a.createdOn.localeCompare(b.createdOn));

  const feed = new RSS({
    description: settings.description,
    feed_url: `${settings.host}/posts/feed.xml`,
    managingEditor: settings.author,
    site_url: `${settings.host}/`,
    title: 'www.kentor.dev - Kenneth Chung',
    webMaster: settings.author,
  });

  posts.forEach(post => {
    feed.item({
      author: settings.author,
      date: post.createdOn,
      description: post.excerpt,
      guid: post.slug,
      title: post.title,
      url: `${settings.host}${post.url}`,
    });
  });

  return feed.xml();
}

async function algolia({ postMetas }) {
  const posts = await Promise.all(postMetas.map(parse));
  posts.sort((a, b) => -a.createdOn.localeCompare(b.createdOn));

  const json = [
    ...posts.map(post => ({
      data: post.data,
      id: post.slug,
      slug: post.slug,
      title: post.title,
      url: post.url,
    })),
  ];

  return JSON.stringify(json, null, 2);
}

exports.algolia = algolia;
exports.feed = feed;
exports.index = index;
exports.post = post;
