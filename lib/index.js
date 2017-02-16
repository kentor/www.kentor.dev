const chokidar = require('chokidar');
const Module = require('module');
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

const watcher = chokidar.watch(process.cwd(), {
  ignored: [
    /\.lock$/,
    /\/\./,
    /node_modules/,
  ],
  ignoreInitial: true,
});

watcher.on('all', (event, absFilename) => {
  if (graph.hasNode(absFilename)) {
    graph.dependantsOf(absFilename).concat([absFilename]).forEach(module => {
      delete require.cache[module];
    });
  }

  try {
    require('./handler')(event, absFilename);
  } catch (err) {
    console.log(err);
  }
});
