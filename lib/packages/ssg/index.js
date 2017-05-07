const chalk = require('chalk');
const debounce = require('debounce-promise');
const debug = require('debug')('ssg');
const del = require('del');
const fsp = require('fs-promise');
const path = require('path');

function outputInfoFromUrl(url, dest) {
  const [dir, filename] = url.endsWith('/')
    ? [url, 'index.html']
    : url.match(/(.*?)([^/]+)$/).slice(1);

  const outDir = path.join(dest, dir.replace(/\//g, path.sep));
  const outFile = path.join(outDir, filename);

  return { outDir, outFile };
}

class SSG {
  constructor(opts = {}) {
    this.buildCache = new Map();
    this.dest = opts.dest || path.resolve('public');
    this.genManifest = null;
    this.prevManifest = null;
  }

  manifest(cb) {
    this.genManifest = () => {
      const rows = cb().filter(row => {
        if (typeof row.url !== 'string' || typeof row.view !== 'function') {
          console.log(
            chalk.yellow('warn'),
            row,
            'should have shape',
            '{ url: string, view: () => Promise<string> | string }'
          );
          return false;
        }
        return true;
      });
      return new Map(rows.map(row => [
        row.url,
        {
          ...row,
          ...outputInfoFromUrl(row.url, this.dest),
        },
      ]));
    };
  }

  build() {
    const manifest = this.genManifest();

    const writes = Array.from(manifest.values()).map(async row => {
      // TODO: Remove Promise.resolve wrapper. This is added for bluebird.
      // see: https://goo.gl/dyHxTF
      const data = await Promise.resolve(row.view(row.meta, row));

      if (this.buildCache.get(row.url) === data) {
        debug('cache hit for %s skipping write', row.url);
      } else {
        this.buildCache.set(row.url, data);
        await fsp.mkdirp(row.outDir);
        await fsp.writeFile(row.outFile, data);
        console.log(chalk.green('wrote'), row.url, data.length);
      }

      row.data = data;
      return row;
    });

    let deletes;
    if (this.prevManifest) {
      deletes = Array.from(this.prevManifest.values())
        .filter(row => !manifest.has(row.url))
        .map(async row => {
          await del(row.outFile);
          this.buildCache.delete(row.url);
          console.log(chalk.red('deleted'), row.url);

          row.deleted = true;
          return row;
        });
    } else {
      deletes = [];
    }

    this.prevManifest = manifest;

    return Promise.all([...writes, ...deletes]);
  }
}

SSG.prototype.build = debounce(SSG.prototype.build, 0);

module.exports = SSG;
