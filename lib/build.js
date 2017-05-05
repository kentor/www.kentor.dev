const About = require('./components/About');
const Cheese = require('./components/Cheese');
const fs = require('fs');
const Index = require('./components/Index');
const NotFound = require('./components/NotFound');
const parse = require('./parse');
const path = require('path');
const Post = require('./components/Post');
const render = require('./render');
const RSS = require('rss');
const settings = require('./settings');
const ssg = require('./ssg');

const postsDir = path.resolve('posts');

ssg.manifest(() => {
  const ret = [
    { url: '/404.html', handler: () => render(NotFound()) },
    { url: '/about/', handler: () => render(About()) },
    { url: '/cheese/', handler: () => render(Cheese()) },
  ];

  const posts = fs.readdirSync(postsDir).map(filename => {
    const [, date, slug] = filename.match(/(\d{4}-\d{2}-\d{2})-(.*?)\.md$/);
    const url = `/posts/${slug}/`;
    return {
      url,
      handler: postHandler,
      meta: {
        date,
        file: path.join(postsDir, filename),
        slug,
        url,
      },
    };
  });

  const postMetas = posts.map(p => p.meta);

  ret.push({
    url: '/',
    handler: indexHandler,
    meta: {
      postMetas,
    },
  });

  ret.push({
    url: '/posts/feed.xml',
    handler: feedHandler,
    meta: {
      postMetas,
    },
  });

  return ret.concat(posts);
});

async function postHandler(meta) {
  const post = await parse(meta);
  return render(Post({ post }));
}

async function indexHandler({ postMetas }) {
  const posts = await Promise.all(postMetas.map(parse));
  posts.sort((a, b) => -a.createdOn.localeCompare(b.createdOn));
  return render(Index({ posts }));
}

async function feedHandler({ postMetas }) {
  const posts = await Promise.all(postMetas.map(parse));
  posts.sort((a, b) => -a.createdOn.localeCompare(b.createdOn));

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
      url: `${settings.host}${post.url}`,
    });
  });

  return feed.xml();
}

module.exports = () => {
  ssg.build();
};

if (require.main === module) {
  module.exports();
}
