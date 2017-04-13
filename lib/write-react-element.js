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

  let dir;
  let filename;

  if (path.extname(url)) {
    const temp = url.split(path.sep);
    filename = temp.pop();
    dir = temp.join(path.sep);
  } else {
    dir = url;
    filename = 'index.html';
  }

  const outputDir = path.join(path.resolve('public'), dir);

  return fsp.mkdirs(outputDir).then(() => {
    const outputFile = path.join(outputDir, filename);
    return fsp.writeFile(outputFile, html);
  }).then(() => {
    console.log(colors.green('wrote'), url, html.length);
  });
};
