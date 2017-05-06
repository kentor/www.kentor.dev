const chalk = require('chalk');
const del = require('del');
const fsp = require('fs-promise');
const path = require('path');

function outputInfoFromUrl(url, dest) {
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

  const outDir = path.join(dest, dir);
  const outFile = path.join(outDir, filename);

  return { outDir, outFile };
}

class SSG {
  constructor(opts = {}) {
    this.buildCache = [];
    this.dest = opts.dest || path.join(process.cwd(), 'public');
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
      const data = await row.view(row.meta, row);

      if (this.buildCache[row.url] !== data) {
        await fsp.mkdirp(row.outDir);
        await fsp.writeFile(row.outFile, data);
        console.log(chalk.green('wrote'), row.url, data.length);
      }

      row.data = data;
      this.buildCache[row.url] = data;

      return row;
    });

    let deletes = [];

    if (this.prevManifest) {
      deletes = Array.from(this.prevManifest.values())
        .filter(row => !manifest.has(row.url))
        .map(async row => {
          await del(row.outFile);
          delete this.buildCache[row.url];
          console.log(chalk.red('deleted'), row.url);
          row.deleted = true;
          return row;
        });
    }

    this.prevManifest = manifest;

    return Promise.all([...writes, ...deletes]);
  }
}

module.exports = SSG;
