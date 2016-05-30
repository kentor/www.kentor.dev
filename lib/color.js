/**
 * input: string
 * output: css class for a color
 */
const hash = require('farmhash').hash32;

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

module.exports = function color(input) {
  return colors[hash(input) % colors.length];
};
