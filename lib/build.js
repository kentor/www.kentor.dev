const About = require('./components/About');
const Cheese = require('./components/Cheese');
const fs = require('fs');
const NotFound = require('./components/NotFound');
const path = require('path');
const render = require('./render');
const ssg = require('./ssg');
const views = require('./views');

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
    return { url, view: views.post, meta };
  });

  const postMetas = posts.map(p => p.meta);

  return [
    { url: '/', view: views.index, meta: { postMetas } },
    { url: '/404.html', view: () => render(NotFound()) },
    { url: '/about/', view: () => render(About()) },
    { url: '/cheese/', view: () => render(Cheese()) },
    { url: '/posts/feed.xml', view: views.feed, meta: { postMetas } },
    ...posts,
  ];
});

function build() {
  return ssg.build();
}

module.exports = build;
