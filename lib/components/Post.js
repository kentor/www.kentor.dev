const color = require('../color');
const Layout = require('./Layout');
const moment = require('moment');
const React = require('react');

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
    </section>
  </Layout>
);
