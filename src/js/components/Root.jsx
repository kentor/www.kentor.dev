import Footer from './Footer.jsx';
import GoogleAnalytics from './GoogleAnalytics.jsx';
import Header from './Header.jsx';
import React from 'react';
import { RouteHandler } from 'react-router';

export default class Root extends React.Component {
  render() {
    const { params, posts } = this.props;

    let post;
    if (params && params.slug) {
      post = posts[params.slug];
    }

    return (
      <html>
        <head>
          <title>{post ? post.title : this.props.title}</title>
          <meta name="viewport" content="width=device-width" />
          <link rel="stylesheet" href="/app.css" />
        </head>
        <body id="top">
          <div className="Flair" />
          <Header />
          <RouteHandler {...this.props} post={post} />
          <Footer />
          <GoogleAnalytics />
        </body>
      </html>
    );
  }
}
