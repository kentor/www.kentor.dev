const color = require('../color');
const moment = require('moment');
const React = require('react');

module.exports = ({ post }) => (
  <section className="mv4">
    <time dateTime={post.createdOn} className="f6">
      {moment(post.createdOn).format('MMMM DD, YYYY')}
    </time>
    <h2 className="f3 fw5 mv3 lh-title" style={{ color: color(post.slug) }}>
      <a href={post.href} className="no-underline">{post.title}</a>
    </h2>
    <article
      className="PostContent f5 lh-copy serif"
      dangerouslySetInnerHTML={{ __html: post.excerpt }}
    />
  </section>
);
