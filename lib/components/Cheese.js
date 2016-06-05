const Layout = require('./Layout');
const React = require('react');

module.exports = () => (
  <Layout title="Cheese">
    <div className="mv4 relative aspect-ratio--16x9">
      <iframe
        allowFullScreen
        className="absolute top-0"
        frameBorder="0"
        height="100%"
        src="https://www.youtube.com/embed/QvGumqsrEHY?rel=0"
        width="100%"
      />
    </div>
  </Layout>
);
