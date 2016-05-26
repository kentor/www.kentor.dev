const colors = require('colors/safe');
const del = require('del');
const fm = require('front-matter');
const fsp = require('fs-promise');
const md = require('marky-markdown');
const path = require('path');
const Post = require('./components/Post');

const publicDir = path.resolve('public');
const writeReactElement = require('./write-react-element');

module.exports = {
  deletePost(filename) {
    const [, slug] = filename.match(/\d{4}-\d{2}-\d{2}-(.*?)\.md$/);
    del(path.join(publicDir, 'posts', slug)).then(() => {
      console.log(colors.red('removed'), slug);
    });
  },

  parsePost(filename) {
    const [, date, slug] = filename.match(/(\d{4}-\d{2}-\d{2})-(.*?)\.md$/);
    return fsp.readFile(path.resolve(filename), 'utf8').then(data => {
      const { attributes, body } = fm(data);
      const $ = md(body, { sanitize: false });
      return {
        createdOn: `${date}T00:00:00-07:00`,
        excerpt: $.html($('p').first()),
        href: `/posts/${slug}/`,
        html: $.html(),
        slug,
        title: attributes.title,
      };
    });
  },

  writePost(post) {
    writeReactElement(Post({ post }), `posts/${post.slug}`);
  },
};
