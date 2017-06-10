---
title: Node.js hot module reloading development
---

Imagine running a Node.js process that watches the current working directory and
runs a callback every time a file is updated. Furthermore, imagine if any
modules required by the callback is reloaded if they have been modified. That
process would look something like this:

<div class="tc" style="height: 559px">
<script type="text/javascript" src="https://asciinema.org/a/74tj8uryqil4cweedz4g72gsv.js" id="asciicast-74tj8uryqil4cweedz4g72gsv" async></script>
</div>

That would be a lot faster than starting a new Node.js process to re-run the
script because it would bypass the overhead of starting a new Node.js process
and requiring/parsing modules that have not been modified.

I was thinking about how I would implement such a system when rewriting the
static site generator for this blog. I wanted a program that rebuilds the site
on changes to any markdown file in the posts directory, or on changes to React
components that were used for generating the layout markup.

It's actually possible to achieve this with very few npm modules. Basically we
need these parts:

- The entry script that launches a watcher over certain files in our current
working directory. I recommend the [chokidar][c] library for this purpose which
works well across different platforms.

- Since Node.js caches modules after they are first required, we need a way to
invalidate stale modules from the require cache. For this, I use my library
[invalidate-module][i].

- A build script to run when watched files are modified.

Here's a basic watch script that serves as the entry point to this system:

```js
const chokidar = require('chokidar');
const invalidate = require('invalidate-module');
const path = require('path');

function build() {
  try {
    require('./build')();
  } catch (err) {
    console.error(err);
  }
}

const watcher = chokidar.watch('*.js', {
  ignoreInitial: true,
});

build();

watcher.on('all', (event, filename) => {
  invalidate(path.resolve(filename));
  build();
});
```

Now `build.js` could be anything you're working on. For me it is a script that
parses markdown files and combines that with React components to generate a
static site. I will go into more detail about this in a later blog post.

### invalidate-module details

A Node.js process caches calls to `require(module)`. In other words:

```js
require('./my-module') === require('./my-module'); // true
```

Re-running a build script on module file changes only makes sense if we can
force `require()` to return the newer version of that module.

The [invalidate-module][i] library removes a module and all of its dependents
from the process' require cache.

Removing all of a module's dependents from the require cache is important.

If we had a module called `Layout.js` that requires `Head.js` and we update
`Head.js`, then not only is `Head.js` stale, but also its dependent `Layout.js`.
Next time we require `Layout.js` we better get the newer version that requires
the new `Head.js`.

Removing a single module from the require cache is pretty simple. A required
module's exports is stored in `require.cache` keyed by the absolute path to the
module. So we just need to delete that entry from the cache:

```js
delete require.cache[require.resolve('./my-module')];
```

However, removing a module and all of its dependents from `require.cache` is not
as simple. What [invalidate-module][i] does is it monkey patches the `require()`
function so that it can keep track of which module required another in a
dependency graph. Once we have this graph we can then query for the dependents
of a particular module and then delete all of them from `require.cache`.

### Boilerplate

I released a boilerplate that contains pretty much the example in this post
[here][b].

### Conclusion

To be honest I don't know how useful this is outside of my static site generator
with React use case. Let me know if you have more interesting use cases!

[b]: https://github.com/kentor/node-hot-reloading-boilerplate
[c]: https://github.com/paulmillr/chokidar
[i]: https://github.com/kentor/invalidate-module
[w]: https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener
