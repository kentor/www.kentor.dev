const posts = require('./posts');

const routes = [
  '/',
  '/about/',
];
posts.forEach(post => routes.push(post.href));

module.exports = {
  posts: posts,
  routes: routes,
  title: 'kentor.me',
};
