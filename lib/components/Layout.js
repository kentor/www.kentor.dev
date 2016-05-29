const GoogleAnalytics = require('./GoogleAnalytics');
const Header = require('./Header');
const React = require('react');

module.exports = ({ active = '', children, title = '' }) => (
  <html>
    <head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width" />
      <link rel="stylesheet" href="/app.css" />
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
