import React from 'react';
import Router from 'react-router';
import Routes from './Routes.jsx';

export default function render(path, props) {
  return new Promise((resolve, reject) => {
    Router.run(Routes, path, (Handler, state) => {
      // Grab params and query from react router and pass down as props.
      const html = React.renderToStaticMarkup(
        <Handler {...props} {...state} />
      );
      resolve('<!DOCTYPE html>' + html);
    });
  });
}
