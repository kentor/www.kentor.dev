const ghpages = require('gh-pages');
const path = require('path');

ghpages.publish(path.resolve('public'), { branch: 'master' });
