const About = require('./components/About');
const Cheese = require('./components/Cheese');
const writeReactElement = require('./write-react-element');

module.exports = () => {
  writeReactElement(About(), 'about');
  writeReactElement(Cheese(), 'cheese');
};
