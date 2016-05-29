const colors = require('colors/safe');
const fsp = require('fs-promise');
const path = require('path');
const ReactDOMServer = require('react-dom/server');

module.exports = function writeReactElement(element, url) {
  const outputDir = path.join(path.resolve('public'), url);
  let html;

  fsp.mkdirs(outputDir).then(() => {
    const outputFile = path.join(outputDir, 'index.html');
    html = `<!doctype html>${ReactDOMServer.renderToStaticMarkup(element)}`;
    return fsp.writeFile(outputFile, html);
  }).then(() => {
    console.log(colors.green('wrote'), url, html.length);
  });
};
