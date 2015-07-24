const fm = require('front-matter');
const fs = require('fs');
const marky = require('marky-markdown');

const markyOptions = {
  prefixHeadingIds: false,
  sanitize: false,
};

module.exports = function postParser(absFilePath) {
  const content = fs.readFileSync(absFilePath, 'utf8');
  const matter = fm(content);
  const attributes = matter.attributes;
  const $ = marky(matter.body, markyOptions);
  const parts = absFilePath.match(/(\d{4}-\d{2}-\d{2})-(.*?)\.md$/);
  const slug = parts[2];

  return {
    createdOn: parts[1] + 'T00:00:00-07:00',
    excerpt: $.html($('p').first()),
    href: '/posts/' + slug + '/',
    html: $.html(),
    slug: slug,
    title: attributes.title,
  };
};
