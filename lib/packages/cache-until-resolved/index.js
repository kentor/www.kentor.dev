const cache = {};

module.exports = (key, promiseFn) => {
  return cache[key] || (cache[key] = (() => {
    const clearCache = () => delete cache[key];
    const promise = promiseFn();
    promise.then(clearCache, clearCache);
    return promise;
  })());
};
