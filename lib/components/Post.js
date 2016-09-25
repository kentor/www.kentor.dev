const color = require('../color');
const Layout = require('./Layout');
const moment = require('moment');
const React = require('react');
const settings = require('../settings');

module.exports = ({ post }) => (
  <Layout active="writing" title={post.title}>
    <section className="mv4">
      <time dateTime={post.createdOn} className="f6">
        {moment(post.createdOn).format('MMMM DD, YYYY')}
      </time>
      <h1 className={`f2 fw5 mv3 lh-title ${color(post.slug)}`}>
        <span>{post.title}</span>
      </h1>
      <article
        className="PostContent f4 lh-copy serif justify"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
      <p className="lh-copy f4 serif i">
        Questions or Comments?
        {' '}
        <a href={`${settings.issues}${post.title}`}>Open an Issue</a>.
      </p>
    </section>
  </Layout>
);
