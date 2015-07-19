import Icon from 'react-geomicons';
import React from 'react';

export default class Footer extends React.Component {
  render() {
    return (
      <footer className="Site-footer">
        <a href="/">
          <Icon name="home" />
        </a>
        <a href="#top">
          <Icon name="chevronUp" />
        </a>
        <a href="https://twitter.com/kentor">
          <Icon name="twitter" />
        </a>
        <a href="https://github.com/kentor">
          <Icon name="github" />
        </a>
      </footer>
    );
  }
}
