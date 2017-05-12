const algoliasearch = require('algoliasearch');
const chalk = require('chalk');
const path = require('path');

const { ALGOLIA_APP_ID, ALGOLIA_SECRET_KEY } = process.env;

(async () => {
  if (!ALGOLIA_APP_ID || !ALGOLIA_SECRET_KEY) {
    console.log(chalk.yellow('error'), 'algolia credentials not set');
    return;
  }

  let json;

  try {
    json = require(path.resolve('public/algolia.json'));
  } catch (err) {
    console.log(
      chalk.red('error'),
      'algolia.json file not found in public dir',
    );
    return;
  }

  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SECRET_KEY);
  const tempIndex = client.initIndex('kentor.me.temp');

  try {
    await tempIndex.addObjects(json);
  } catch (err) {
    console.error(err.message);
  }

  await client.moveIndex('kentor.me.temp', 'kentor.me');

  console.log(chalk.green('algolia indexing finished'));
})();
