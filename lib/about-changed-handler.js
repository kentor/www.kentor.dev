const About = require('./components/About');
const writeReactElement = require('./write-react-element');

module.exports = () => {
  writeReactElement(About(), 'about');
};
