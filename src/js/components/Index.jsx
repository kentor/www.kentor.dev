import PostExcerpt from './PostExcerpt.jsx';
import React from 'react';

export default class Index extends React.Component {
  render() {
    return (
      <main>
        {this.props.posts.toSeq().map(post => (
          <PostExcerpt key={post.slug} post={post} />
        )).toArray()}
      </main>
    );
  }
}
