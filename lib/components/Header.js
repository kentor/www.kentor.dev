const cx = require('classnames');
const React = require('react');

module.exports = ({ active }) => (
  <header className="mv4 relative">
    <a className="logo" href="/" />
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
      <a className="no-underline" href="https://github.com/kentor/">
        Github
      </a>
    </nav>
  </header>
);
