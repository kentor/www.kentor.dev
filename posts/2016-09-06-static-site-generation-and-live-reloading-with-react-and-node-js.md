---
title: Static site generation and live reloading with React and Node.js
---

<div style="margin: 1em 0">
<strong>Note:</strong> This is outdated. I now use my
<a href="https://github.com/kentor/tiny-ssg">tiny-ssg</a> library to generate my
blog. Read about tiny-ssg <a href="/posts/introducing-tiny-ssg/">here</a>.
</div>

This is a high level overview of how I've implemented the static site generator
with live reloading for this blog using React and Node.js APIs. It does not use
Webpack, Browserify, or any other bundling system which I think is overkill for
static site generation.

The heart of this static site generator is the `writeReactElement()` function.
In its entirety:

```js
const cache = require('./cache');
const colors = require('colors/safe');
const fs = require('fs-extra');
const path = require('path');
const ReactDOMServer = require('react-dom/server');

module.exports = function writeReactElement(element, url) {
  const html = `<!doctype html>${ReactDOMServer.renderToStaticMarkup(element)}`;

  if (html === cache[url]) {
    return Promise.resolve();
  }

  cache[url] = html;

  const outputDir = path.join(path.resolve('public'), url);

  return fs.mkdirp(outputDir).then(() => {
    const outputFile = path.join(outputDir, 'index.html');
    return fs.writeFile(outputFile, html);
  }).then(() => {
    console.log(colors.green('wrote'), url, html.length);
  });
};
```

The function takes two arguments, `element` which is a React Element, and `url`
which is the directory under the top level `public` directory with which an
`index.html` file will be written with the html string returned from calling
`ReactDOMServer.renderToStaticMarkup()`.

For example, `writeReactElement(<h1>Hello</h1>, '/hello/')` will write

```html
<!doctype html><h1>Hello</h1>
```

to `public/hello/index.html`.

There's some caching business going on in the implementation, but that's just
an optimization detail.

With this, the strategy for generating a static site for a blog is the
following:

1. Read every file under the top level `posts` directory with `fs.readdir()`.
   This returns (asynchronously) a list of filenames in the directory.

1. Given the filename of a post, read and parse the post. For me, my posts have
   the filename format `YYYY-MM-DD-slug.md`, and my posts are written in
   markdown with front matter. Therefore, I use the [marky-markdown][md] and
   [front-matter][fm] npm packages to parse my posts.

1. Create an object `post` representing all data needed to render the post, such
   as the title, slug, date created, html from markdown, etc., and write it out
   with

   ```js
   writeReactElement(<Post post={post} />, `posts/${post.slug}`);
   ```

1. Sort the posts by date, then write out the index page containing all posts
   and their excerpts with

   ```js
   writeReactElement(<Index posts={posts} />, `/`);
   ```

1. Finally, write out any other static pages, such as an about page, with
   something like

   ```js
   writeReactElement(<About />, '/about');
   ```

I use [babel-register][b] along with Babel's [React Preset][pr] in order to make
my Node.js program understand JSX. All of my React components are stateless
functional components. For example, the About page is something like this:

```js
const Layout = require('./Layout');
const React = require('react');

module.exports = () => (
  <Layout active="about" title="About">
    <section>
      <h1>About</h1>
      <article>
        Hi, this is the about page...
      </article>
    </section>
  </Layout>
);
```

Here is the entire build script that pretty much does the steps listed above. I
have this script run when running `npm run buid`:

```js
require('babel-register');

const fs = require('fs');
const Index = require('./components/Index');
const path = require('path');
const postUtils = require('./post-utils');
const staticPagesHandler = require('./static-pages-handler');
const writeReactElement = require('./write-react-element');

const postsDir = path.resolve('posts');

function build() {
  fs.readdir(postsDir, (err, files) => {
    if (err) throw err;
    Promise.all(files.map(filename => {
      return postUtils.parsePost(path.join(postsDir, filename));
    })).then(posts => {
      if (process.env.NODE_ENV === 'production') {
        posts = posts.filter(p => !p.draft);
      }
      posts.forEach(postUtils.writePost);
      posts.sort((a, b) => {
        return -a.createdOn.localeCompare(b.createdOn);
      });
      writeReactElement(Index({ posts }), '/');
    });
  });
  staticPagesHandler();
}

module.exports = build;

if (require.main === module) {
  build();
}
```

For the live reloading stuff, I use the technique described in my previous
article, [Node.js hot module reloading development][n]. My watch handler just
calls functions that ultimately calls `writeReactElement()` with the appropriate
component and props, based on file that was changed. For example, if the
filename matches a file under the `posts` directory, then run the
`post-changed-handler` which reparses the post and writes out the html.

I have [browser-sync][bs] set up to watch the `public` directory, so the page
automatically reloads when the compiled html files are updated.

And that's the high level overview of my static site generator for this blog.
The entire source code is available on [Github][g].

[b]: https://babeljs.io/docs/usage/require/
[bs]: https://www.browsersync.io/
[fm]: https://www.npmjs.com/package/front-matter
[g]: https://github.com/kentor/blog
[md]: https://www.npmjs.com/package/marky-markdown
[n]: /posts/node-js-hot-reloading-development/
[pr]: https://babeljs.io/docs/plugins/preset-react/
