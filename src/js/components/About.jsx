import Immutable from 'immutable';
import React from 'react';

const tech = Immutable.OrderedMap({
  'Babel': 'https://babeljs.io/',
  'Gulp': 'http://gulpjs.com/',
  'PostCSS': 'https://github.com/postcss/postcss',
  'React Router': 'https://github.com/rackt/react-router',
  'React': 'https://facebook.github.io/react/',
  'Webpack': 'http://webpack.github.io/',
});

export default class About extends React.Component {
  render() {
    return (
      <article className="Post">
        <header>
          <h2 className="Post-title">
            <span>About this site</span>
          </h2>
        </header>
        <section className="Post-content">
          <p>
            This blog is a statically generated site built with React and
            Node.js.
          </p>
          <p>
            A partial list of technologies used:
          </p>
          <ul>
            {tech.toSeq().map((href, name) => (
              <li key={name}>
                <a href={href} target="_blank">{name}</a>
              </li>
            )).toArray()}
          </ul>
          <p>
            As you can probably tell, I'm a big fan of Javascript, Node, React,
            and <a href="http://ethanschoonover.com/solarized">Solarized</a>.
          </p>
        </section>
      </article>
    );
  }
}
