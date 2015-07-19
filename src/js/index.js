import React from 'react';
import Router from 'react-router';
import Routes from './Routes.jsx';

export default function render(locals, callback) {
  Router.run(Routes, locals.path, (Handler, state) => {
    // Grab params and query from react router and pass down as props.
    locals.params = state.params;
    locals.query = state.query;

    const html = React.renderToStaticMarkup(
      React.createElement(Handler, locals)
    );
    callback(null, '<!DOCTYPE html>' + html);
  });
}
