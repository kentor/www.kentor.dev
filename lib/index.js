require('babel-register');

const build = require('./build');
const fs = require('fs');
const path = require('path');

fs.watch(process.cwd(), { recursive: true }, (event, filename) => {
  const cache = path.resolve('lib/cache.js');

  Object.keys(require.cache).forEach(module => {
    if (!module.match(/node_modules/) && module !== cache) {
      delete require.cache[module];
    }
  });

  try {
    require('./handler')(event, filename);
  } catch (err) {
    console.log(err);
  }
});

build();
