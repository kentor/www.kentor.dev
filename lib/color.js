/**
 * input: string
 * output: hex code
 */
const hash = require('farmhash').hash32;

const colors = [
  '#268bd2',
  '#2aa198',
  '#859900',
  '#d33682',
  '#cb4b16',
  '#dc322f',
  '#6c71c4',
  '#b58900',
];

module.exports = function color(input) {
  return colors[hash(input) % colors.length];
};
