const cache = require('./caches/posts-cache');
const colors = require('colors/safe');
const del = require('del');
const fm = require('front-matter');
const fsp = require('fs-promise');
const md = require('marky-markdown');
const objectPath = require('object-path');
const path = require('path');
const Post = require('./components/Post');
const writeReactElement = require('./write-react-element');

const publicDir = path.resolve('public');

module.exports = {
  deletePost(filename) {
    const [, slug] = filename.match(/\d{4}-\d{2}-\d{2}-(.*?)\.md$/);

    delete cache[slug];

    return del(path.join(publicDir, 'posts', slug)).then(() => {
      console.log(colors.red('removed'), slug);
    });
  },

  parsePost(filename) {
    const [, date, slug] = filename.match(/(\d{4}-\d{2}-\d{2})-(.*?)\.md$/);
    const absFilePath = path.resolve(filename);

    let mtime;
    let cachedPost;

    return fsp.stat(absFilePath).then(stats => {
      mtime = stats.mtime.toISOString()
      cachedPost = objectPath.get(cache, [slug, mtime]);

      if (cachedPost) {
        return;
      }

      return fsp.readFile(absFilePath, 'utf8');
    }).then(data => {
      if (!cachedPost) {
        const { attributes, body } = fm(data);
        const $ = md(body, { prefixHeadingIds: false, sanitize: false });

        cachedPost = {
          createdOn: `${date}T00:00:00-07:00`,
          draft: attributes.draft,
          excerpt: $.html($('p').first()),
          href: `/posts/${slug}/`,
          html: $.html(),
          slug,
          title: attributes.title,
        };

        cache[slug] = { [mtime]: cachedPost };
      }

      return cachedPost;
    });
  },

  writePost(post) {
    return writeReactElement(Post({ post }), `posts/${post.slug}`);
  },
};
