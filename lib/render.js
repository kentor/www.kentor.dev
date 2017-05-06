const ReactDOMServer = require('react-dom/server');

function render(element) {
  return `<!doctype html>${ReactDOMServer.renderToStaticMarkup(element)}`;
}

module.exports = render;
