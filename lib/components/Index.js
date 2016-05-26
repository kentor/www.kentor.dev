const Layout = require('./Layout');
const PostExcerpt = require('./PostExcerpt');
const React = require('react');

function *postsAndLinesGenerator(posts) {
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    yield (<PostExcerpt post={post} key={post.slug} />);

    if (i !== posts.length - 1) {
      yield (<hr key={i} />);
    }
  }
}

module.exports = ({ posts }) => (
  <Layout active="writing">
    <main>
      {Array.from(postsAndLinesGenerator(posts))}
    </main>
  </Layout>
);
