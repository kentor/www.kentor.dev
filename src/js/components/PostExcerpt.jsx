import DateBadge from './DateBadge.jsx';
import React from 'react';

export default class PostExcerpt extends React.Component {
  render() {
    const { post } = this.props;

    return (
      <article className="Post">
        <header className="Post-header">
          <h2 className="Post-title">
            <span>
              <a href={post.href}>
                {post.title}
              </a>
            </span>
          </h2>
          <DateBadge date={post.createdOn} />
        </header>
        <section
          className="Post-content"
          dangerouslySetInnerHTML={{ __html: post.excerpt }}
        />
        <a href={post.href} className="Post-readMore">
          Read more →
        </a>
      </article>
    );
  }
}
