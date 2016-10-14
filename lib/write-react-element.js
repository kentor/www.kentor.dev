const cache = require('./caches/output-cache');
const colors = require('colors/safe');
const fsp = require('fs-promise');
const path = require('path');
const ReactDOMServer = require('react-dom/server');

module.exports = function writeReactElement(element, url) {
  const html = `<!doctype html>${ReactDOMServer.renderToStaticMarkup(element)}`;

  if (html === cache[url]) {
    return Promise.resolve();
  }

  cache[url] = html;

  const outputDir = path.join(path.resolve('public'), url);

  return fsp.mkdirs(outputDir).then(() => {
    const outputFile = path.join(outputDir, 'index.html');
    return fsp.writeFile(outputFile, html);
  }).then(() => {
    console.log(colors.green('wrote'), url, html.length);
  });
};
