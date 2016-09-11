const Assets = require('../assets');
const GoogleAnalytics = require('./GoogleAnalytics');
const Header = require('./Header');
const React = require('react');

module.exports = ({ active = '', children, title = 'Kenneth Chung' }) => (
  <html>
    <head>
      <title>{`${title} - kentor.me`}</title>
      <meta name="viewport" content="width=device-width" />
      <link rel="stylesheet" href={`/${Assets.get('app.css')}`} />
    </head>
    <body className="mv4">
      <div className="mw7 ph4 margin-auto">
        <Header active={active} />
        <hr />
        {children}
      </div>
      <GoogleAnalytics />
    </body>
  </html>
);
