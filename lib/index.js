require('babel-register');

const build = require('./build');
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

build();
