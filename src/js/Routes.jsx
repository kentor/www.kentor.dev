import About from './components/About.jsx';
import Index from './components/Index.jsx';
import Post from './components/Post.jsx';
import React from 'react';
import Root from './components/Root.jsx';
import { Route, DefaultRoute } from 'react-router';

export default (
  <Route handler={Root} path="/">
    <DefaultRoute handler={Index} />
    <Route path="/about/?" handler={About} />
    <Route path="/posts/:slug/?" handler={Post} />
  </Route>
);
