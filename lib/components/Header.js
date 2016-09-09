const cx = require('classnames');
const Ness = require('./Ness');
const NessPeace = require('./NessPeace');
const React = require('react');

module.exports = ({ active }) => (
  <header className="mv4 relative lh-solid">
    <a className="logo" href="/">
      <Ness />
      <NessPeace />
    </a>
    <nav className="absolute right-0 bottom-0 f6 fw5 ttu">
      <a
        className={cx(
          'no-underline mr3',
          active === 'writing' && 'red'
        )}
        href="/"
      >
        Writing
      </a>
      <a
        className={cx(
          'no-underline mr3',
          active === 'about' && 'red'
        )}
        href="/about/"
      >
        About
      </a>
      <a className="no-underline mr3" href="https://twitter.com/kentor/">
        Twitter
      </a>
      <a className="no-underline" href="https://github.com/kentor/">
        Github
      </a>
    </nav>
  </header>
);
