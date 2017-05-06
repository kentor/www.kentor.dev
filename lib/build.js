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
  const posts = fs.readdirSync(postsDir).map(filename => {
    const [, date, slug] = filename.match(/(\d{4}-\d{2}-\d{2})-(.*?)\.md$/);
    const url = `/posts/${slug}/`;
    const meta = {
      date,
      file: path.join(postsDir, filename),
      slug,
      url,
    };
    return { url, view: post, meta };
  });

  const postMetas = posts.map(p => p.meta);

  return [
    { url: '/', view: index, meta: { postMetas } },
    { url: '/404.html', view: () => render(NotFound()) },
    { url: '/about/', view: () => render(About()) },
    { url: '/cheese/', view: () => render(Cheese()) },
    { url: '/posts/feed.xml', view: feed, meta: { postMetas } },
    ...posts,
  ];
});

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
