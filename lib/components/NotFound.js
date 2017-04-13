const Layout = require('./Layout');
const React = require('react');

module.exports = () => (
  <Layout title="404 Not Found">
    <section>
      <h1 className="fw5 mv4 lh-solid red">404</h1>
      <article className="f4 lh-copy serif justify">
        <p>
          Not found. <a href="/">Go home</a>.
        </p>
      </article>
    </section>
  </Layout>
);
