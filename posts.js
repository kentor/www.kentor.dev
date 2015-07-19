const fm = require('front-matter');
const fs = require('fs');
const Immutable = require('immutable');
const marky = require('marky-markdown');
const moment = require('moment');
const path = require('path');

const postDir = './posts';

const filenames = fs.readdirSync(postDir).filter(filename =>
  !/^\./.test(filename)
);

const Post = Immutable.Record({
  createdOn: null,
  excerpt: '',
  href: '',
  html: '',
  slug: '',
  title: '',
});

const markyOptions = {
  prefixHeadingIds: false,
  sanitize: false,
};

const posts = Immutable.OrderedMap(filenames.map(filename => {
  const content = fs.readFileSync(path.join(postDir, filename), 'utf8');
  const matter = fm(content);
  const attributes = matter.attributes;
  const $ = marky(matter.body, markyOptions);
  const parts = filename.match(/^(\d+-\d+-\d+)-(.*?)\.md$/);

  const slug = parts[2];

  return [
    slug,
    new Post({
      createdOn: moment(parts[1] + 'T00:00:00-07:00'),
      excerpt: $.html($('p').first()),
      href: '/posts/' + slug + '/',
      html: $.html(),
      slug: slug,
      title: attributes.title,
    }),
  ];
})).reverse();

module.exports = posts;
