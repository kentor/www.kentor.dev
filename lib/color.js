/**
 * input: string
 * output: css class for a color
 */
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

const cache = {};
let counter = 0;

module.exports = function color(input) {
  return cache[input] || (cache[input] = colors[(counter++) % colors.length]);
};
