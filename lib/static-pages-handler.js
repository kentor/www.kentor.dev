const About = require('./components/About');
const Cheese = require('./components/Cheese');
const NotFound = require('./components/NotFound');
const writeReactElement = require('./write-react-element');

module.exports = () => {
  writeReactElement(About(), 'about');
  writeReactElement(Cheese(), 'cheese');
  writeReactElement(NotFound(), '404.html');
};
