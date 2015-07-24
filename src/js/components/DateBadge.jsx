import moment from 'moment';
import React from 'react';

export default class DateBadge extends React.Component {
  render() {
    const date = moment(this.props.date);

    return (
      <time className="DateBadge" dateTime={date.toISOString()}>
        {date.format('D MMM YYYY')}
      </time>
    );
  }
}
