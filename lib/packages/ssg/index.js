const debounce = require('debounce-promise');
const debug = require('debug')('ssg');
const fs = require('fs-extra');
const path = require('path');
const { gray, green, red, yellow } = require('chalk');

function outFileFromUrl(url, dest) {
  return path.normalize(
    path.join(dest, url, url.endsWith('/') ? 'index.html' : '')
  );
}

function time(fn) {
  return async function() {
    const start = Date.now();
    const results = await fn.apply(this);
    const end = Date.now();
    console.log(gray(`built in ${((end - start) / 1000).toFixed(2)}s`));
    return results;
  };
}

class SSG {
  constructor(opts = {}) {
    this.buildCache = new Map();
    this.dest = opts.dest || path.resolve('public');
    this.genManifest = null;
    this.prevManifest = null;
  }

  manifest(cb) {
    this.genManifest = async () => {
      const rows = (await cb()).filter(row => {
        if (typeof row.url !== 'string' || typeof row.view !== 'function') {
          console.log(
            yellow('warn'),
            row,
            'should have shape',
            '{ url: string, view: () => Promise<string> | string }'
          );
          return false;
        }
        return true;
      });
      return new Map(rows.map(row =>
        [row.url, { ...row, outFile: outFileFromUrl(row.url, this.dest) }]
      ));
    };
  }

  async build() {
    const manifest = await this.genManifest();

    const writes = Array.from(manifest.values()).map(async row => {
      const data = await row.view(row.meta, row);

      if (this.buildCache.get(row.url) === data) {
        debug('cache hit for %s skipping write', row.url);
      } else {
        this.buildCache.set(row.url, data);
        await fs.outputFile(row.outFile, data);
        console.log(green('wrote'), row.url, data.length);
      }

      row.data = data;
      return row;
    });

    let deletes;
    if (this.prevManifest) {
      deletes = Array.from(this.prevManifest.values())
        .filter(row => !manifest.has(row.url))
        .map(async row => {
          await fs.remove(row.outFile);
          this.buildCache.delete(row.url);
          console.log(red('deleted'), row.url);

          row.deleted = true;
          return row;
        });
    } else {
      deletes = [];
    }

    this.prevManifest = manifest;

    return Promise.all([...writes, ...deletes]);
  }

  async dryRun() {
    const manifest = await this.genManifest();
    for (const row of manifest.values()) {
      console.log(row.url);
    }
  }
}

SSG.prototype.build = time(SSG.prototype.build);
SSG.prototype.build = debounce(SSG.prototype.build, 0);

module.exports = SSG;
