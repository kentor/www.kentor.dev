const posts = require('./posts');

const routes = [
  '/',
];
posts.forEach(post => routes.push(post.href));

module.exports = {
  posts: posts,
  routes: routes,
  title: 'kentor.me',
};
