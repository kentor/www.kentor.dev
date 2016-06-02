---
title: Node.js hot module reloading development
---
Imagine launching a Node.js process that watches the current working directory
for file changes, and have it call a function with the updated file’s filename
as an argument. Now imagine changing the implementation of that function and
have new file changes execute the new version without exiting the Node.js
process. Furthermore, imagine modules that were imported via `require()` were
reloaded when their implementation changes, so that when the function executes
again, it runs the new version of your modules.

I wanted a system like that when I was thinking about how I would write the
static site generator for this very blog. I wanted it so that whenever I saved a
markdown file in a specific directory, it would run a function to convert the
markdown into HTML and write it out to disk. And since I’ll be using React, I
wanted it so that whenever I update a layout component the system would rebuild
the entire site.

It’s actually pretty easy to implement such a system with only the built-in
Node.js modules. At a high level, the system works like this:

1. The entry script watches the current working directory via
   `fs.watch(process.cwd(), { recursive: true }, (event, filename) => { ... });`

2. The callback to `fs.watch()` clears local modules from the `require.cache` so
   that subsequent calls to `require()` will load the new implementation of the
   required module.

3. The callback then calls `require('./handler')` which is a module that exports
   a function, and the handler is passed the `event` and `filename` arguments.

In otherwords, we have a directory with `index.js` and `handler.js`:

```
.
├── handler.js
└── index.js
```

`index.js` looks like this:

```js
const fs = require('fs');

fs.watch(process.cwd(), { recursive: true }, (event, filename) => {
  Object.keys(require.cache).forEach(module => {
    if (!module.match(/node_modules/)) {
      delete require.cache[module];
    }
  });

  try {
    require('./handler')(event, filename);
  } catch (err) {
    console.log(err);
  }
});
```

and `handler.js` exports a function that takes `(event, filename)`:

```js
module.exports = (event, filename) => {
  // do something with event and filename
  console.log(event, filename);
};
```

In this example, saving a file anywhere in the process’ working directory will
delete the modules from the module cache if the module does not live in
`node_modules`. This makes the assumption that the implementation of the modules
in `node_modules` don’t change during the lifetime of the process. Now any
subsequent calls to `require()` for local modules will return the new
implementation. Then it executes the handler which just logs out its arguments.

What’s cool is this is that we can change the implementation of `handler.js` and
new file changes will execute the new version without exiting the Node.js
process.

### Module cache busting optimization

The above example should work for most cases, and what I’m about to show could
be considered premature optimization, so it’s fine to skip this part, but I just
wanted to share it anyway.

In the `fs.watch()` callback we looped through the entire module cache and
deleted from it the ones that don’t live in `node_modules`. This operation is
pretty fast on my machine, but not entirely optimal. What’s optimal is if we
deleted only the module that was updated, and all of that module’s dependants.

To achieve something like that we would need to have a dependency graph of our
modules during the lifetime of the process. For this I had to dig into how
Node.js implements its module system. For example have you ever wondered how
`require()` actually works? Frank K. Schott has an excellent [blog post][f] on
that very topic.

My idea was to hook into the `require()` calls and build the dependency graph
that way. This should be possible as long as we can get the module that called
`require()` and the resolved requested module. It turns out that the `require`
function that we see in a module is just a wrapper around the `module.require`
function. `module.require` is implemented on `Module.prototype.require`, so we
can monkey patch that to build the dependency graph.

Once we have the dependency graph, we can query it for the dependants of the
update module, and delete the affected modules from the module cache. With that,
I present to you the optimized cache busting code. It relies on the
[`dependency-graph`][d] library.

```js
const fs = require('fs');
const Module = require('module');
const path = require('path');
const { DepGraph } = require('dependency-graph');

const graph = new DepGraph();
const __require = Module.prototype.require;

Module.prototype.require = function(p) {
  const module = __require.call(this, p);
  const moduleName = Module._resolveFilename(p, this);
  graph.addNode(this.filename);
  graph.addNode(moduleName);
  graph.addDependency(this.filename, moduleName);
  return module;
};

fs.watch(process.cwd(), { recursive: true }, (event, filename) => {
  const absFilename = path.resolve(filename);

  if (graph.hasNode(absFilename)) {
    graph.dependantsOf(absFilename).concat([absFilename]).forEach(module => {
      delete require.cache[module];
    });
  }

  try {
    require('./handler')(event, filename);
  } catch (err) {
    console.log(err);
  }
});
```

### Caveats

`fs.watch()` is not 100% consistent across platforms, and the recursive option
is only supported on OS X and Windows. I’m only developing on a OS X so I
haven’t tested this out on other operating systems. See the documentation for
`fs.watch` [here][w].

The dependency graph in the optimized module cache busting will throw an error
if it detects a cycle. I haven’t bothered to handle that case yet.

### Closing

I've uploaded a boilerplate for the code explained in this article to
[Github][g].

Be creative with what you can do with such a system, and let me know what you
come up with! Like I said, I’m using it as a static site generator with React
and live reloading, and I’ll show how I do it in my next post.

[d]: https://www.npmjs.com/package/dependency-graph
[f]: http://fredkschott.com/post/2014/06/require-and-the-module-system/
[g]: https://github.com/kentor/node-hot-reloading-boilerplate
[w]: https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener
