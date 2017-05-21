const cheerio = require('cheerio');
const fm = require('front-matter');
const fs = require('fs-extra');
const md = require('marky-markdown');
const objectPath = require('object-path');
const reusePromise = require('reuse-promise').default;

const cache = {};

parse = reusePromise(parse, { serializeArguments: ([meta]) => meta.url });
async function parse(meta) {
  let cachedPost;

  const stats = await fs.stat(meta.file);
  const mtime = stats.mtime.toISOString();

  cachedPost = objectPath.get(cache, [meta.slug, mtime]);

  if (!cachedPost) {
    const data = await fs.readFile(meta.file, 'utf8');
    const { attributes, body } = fm(data);
    const html = md(body, {
      enableHeadingLinkIcons: false,
      prefixHeadingIds: false,
      sanitize: false,
    });
    const $ = cheerio.load(html);

    cachedPost = {
      createdOn: `${meta.date}T00:00:00-07:00`,
      data: body,
      draft: attributes.draft,
      excerpt: $.html($('p').first()),
      html,
      slug: meta.slug,
      title: attributes.title,
      url: meta.url,
    };

    cache[meta.slug] = { [mtime]: cachedPost };
  }

  return cachedPost;
}

module.exports = parse;
