const debug = require('debug')('module-invalidator');
const Module = require('module');
const { DepGraph } = require('dependency-graph');

const graph = new DepGraph();
const __require = Module.prototype.require;

function install() {
  Module.prototype.require = function(path) {
    const requiredModule = __require.call(this, path);
    const requiredModuleFilename = Module._resolveFilename(path, this);
    graph.addNode(this.filename);
    graph.addNode(requiredModuleFilename);
    graph.addDependency(this.filename, requiredModuleFilename);
    return requiredModule;
  };
}

function invalidate(absPathToModule) {
  if (graph.hasNode(absPathToModule)) {
    graph.dependantsOf(absPathToModule).concat([absPathToModule]).forEach(m => {
      delete require.cache[m];
      graph.removeNode(m);
      debug('deleted module from cache %s', m);
    });
  }
}

function uninstall() {
  Module.prototype.require = __require;
}

exports.install = install;
exports.invalidate = invalidate;
exports.uninstall = uninstall;
