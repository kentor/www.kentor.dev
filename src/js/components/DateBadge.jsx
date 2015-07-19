import React from 'react';

export default class DateBadge extends React.Component {
  render() {
    const { date } = this.props;
    return (
      <time className="DateBadge" dateTime={date.toISOString()}>
        {date.format('D MMM YYYY')}
      </time>
    );
  }
}
