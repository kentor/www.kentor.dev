const { renderToStaticMarkup } = require('react-dom/server');

function render(element) {
  return `<!doctype html>${renderToStaticMarkup(element)}`;
}

module.exports = render;
