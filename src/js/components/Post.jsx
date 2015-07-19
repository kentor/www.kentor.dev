import React from 'react';

export default class PostExcerpt extends React.Component {
  render() {
    const { post } = this.props;

    return (
      <article className="Post">
        <header className="Post-header">
          <h2 className="Post-title">
            <span>
              {post.title}
            </span>
          </h2>
          <time className="TimeBadge">
            {post.createdOn.format('D MMM YYYY')}
          </time>
        </header>
        <section
          className="Post-content"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    );
  }
}
