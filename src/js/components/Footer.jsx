import React from 'react';

export default class Footer extends React.Component {
  render() {
    return (
      <footer className="Site-footer">
        <a href="/about">
          About
        </a>
        •
        <a href="https://twitter.com/kentor">
          Twitter
        </a>
        •
        <a href="https://github.com/kentor">
          Github
        </a>
      </footer>
    );
  }
}
