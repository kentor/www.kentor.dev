const ReactDOMServer = require('react-dom/server');

module.exports = function render(element) {
  return `<!doctype html>${ReactDOMServer.renderToStaticMarkup(element)}`;
};
