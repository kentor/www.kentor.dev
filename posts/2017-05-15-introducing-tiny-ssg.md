---
title: Introducing tiny-ssg
---

I have released [tiny-ssg][t], an unopinionated static site generator in Node.js
with a tiny API that is friendly with hot reloaded modules (e.g. with
[invalidate-module][i]).

The API is very small; these are its methods: `new SSG()`, `ssg.manifest()`,
`ssg.build()`, and `ssg.dryRun()`.

It is very unopinionated, in otherwords there are no conventions. I don't tell
you where you need to put your files or what file formats work with it. The only
responsibility of tiny-ssg is that it will write out the pages defined by
`manifest()` at the correct location on disk. Everything else, such as
transforming files (e.g. markdown to html) is done by you, the programmer. Used
with the plethora of tools on [npm][n], it truly is a bring-your-own-conventions
type of static site generator.

It works nicely with watchers like [chokidar][c] and [invalidate-module][i] in
that if `build()` is called again within the same process, it will automatically
remove files that are no longer returned from `manifest()` and rebuild the
entire site. With invalidate-module, one can use React components as the layout
engine and can iterate quickly without quitting the Node.js process.

I developed tiny-ssg because I really didn't like the way that I was generating
this blog previously, as written about in an [earlier blog post][s] of mine.
Looking back, I think that code was too imperative for my tastes. The build
process was something like, "first read the posts directory, then convert these
posts into html in memory, then build the post pages and the index, then build
the rest of the pages." There was no central location to see all the urls of the
final site.

With tiny-ssg, you can see all the urls in a central location in the callback of
`manifest()`. In a way, this is more declarative. It says, "here's a list of
pages at these urls, go build them."

Check out the source of this blog which is now built with tiny-ssg. I would
start with [`build.js`][b] which shows the `manifest()` call. The non-trivial
part is a call to `fs.readdir()` on the posts directory that will eventually be
used to generate each post, the index, and feed pages.

Please refer to the [README][t] of tiny-ssg for how to get started and for
examples involving markdown and React.

[b]: https://github.com/kentor/www.kentor.dev/blob/master/lib/scripts/build.js
[c]: https://github.com/paulmillr/chokidar
[i]: https://github.com/kentor/invalidate-module
[n]: https://www.npmjs.com/
[s]: https://www.kentor.dev/posts/static-site-generation-and-live-reloading-with-react-and-node-js/
[t]: https://github.com/kentor/tiny-ssg
