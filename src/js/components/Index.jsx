import PostExcerpt from './PostExcerpt.jsx';
import React from 'react';

export default class Index extends React.Component {
  render() {
    const slugs = Object.keys(this.props.posts);

    return (
      <main>
        {slugs.map(slug => {
          const post = this.props.posts[slug];
          return <PostExcerpt key={slug} post={post} />;
        })}
      </main>
    );
  }
}
