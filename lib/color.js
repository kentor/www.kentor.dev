const memoize = require('lodash/memoize');

const colors = [
  'blue',
  'cyan',
  'green',
  'magenta',
  'orange',
  'red',
  'violet',
  'yellow',
];

let counter = 0;

color = memoize(color);
function color() {
  return colors[(counter++) % colors.length];
}

module.exports = color;
