---
title: Testing promise side effects with async/await
---

You might have run into situations where you're calling asynchronous code inside
of a callback of some framework, and you need to test their side effects. For
example, you might be making API calls inside of a React component's
`componentDidMount()` callback that will in turn call `setState()` when the
request has completed, and you might want to assert that the component is in a
certain state. This article shows techniques for testing these types of
scenarios.

Take a simplified example. We have a class called
`PromisesHaveFinishedIndicator`. The constructor takes in a list of promises.
When all of the promises have resolved, the instance's `finished` property is
set to `true`:

```js
class PromisesHaveFinishedIndicator {
  constructor(promises) {
    this.finished = false;

    Promise.all(promises).then(() => {
      this.finished = true;
    });
  }
}
```

A good test case would involve calling the constructor with multiple promises
whose resolution timing we can control, and writing expectations of the value of
`this.finished` as each promise is resolved.

In order to control resolution timings of promises in tests, we use `Deferred`
objects which expose the `resolve` and `reject` methods:

```js
class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
```

With this, we can set up a test for `PromisesHaveFinishedIndicator`. We use the
[Jest][j] testing framework in this example, but the technique can be applied to
other testing frameworks as well:

```js
test('sets finished to true after all promises have resolved', () => {
  const d1 = new Deferred();
  const d2 = new Deferred();

  const indicator = new PromisesHaveFinishedIndicator([d1.promise, d2.promise]);

  expect(indicator.finished).toBe(false);

  d2.resolve();
  expect(indicator.finished).toBe(false);

  d1.resolve();
  expect(indicator.finished).toBe(true);
});
```

If you tried running this test it will actually fail because promise callbacks
are asynchronous. In other words, the promise's `onFulfilled` callback, the one
setting `this.finished = true`, will be queued and ran after the last statement
of this test due to [run to completion][r] semantics.

Jest (and other testing frameworks) provides a way to deal with asynchrony by
preventing the test from exiting after the last statement. We would have to call
the provided `done` function in order to tell the runner that the test has
finished. Now you may think something like this would work:

```js
test('sets finished to true after all promises have resolved', (done) => {
  const d1 = new Deferred();
  const d2 = new Deferred();

  const indicator = new PromisesHaveFinishedIndicator([d1.promise, d2.promise]);

  expect(indicator.finished).toBe(false);

  d2.resolve();
  d2.then(() => {
    expect(indicator.finished).toBe(false);

    d1.resolve();
    d1.then(() => {
      expect(indicator.finished).toBe(true);
      done();
    });
  });
});
```

However this will also fail. The reason lies in the implementation of
`Promise.all` which can be thought of to look something like this:

```js
Promise.all = (promises) => {
  const numPromises = promises.length;
  const results = [];
  let numFulfilled = 0;

  return new Promise((resolve, reject) => {
    promises.forEach((promise, i) => {
      promise.then(result => {
        results[i] = result;
        numFulfilled += 1;
        if (numFulfilled === numPromises) {
          resolve(results);
        }
      }, err => {
        reject(err);
      });
    });
  });
};
```

When `resolve` is called on `d1` (and `d2` as well), the
implementation of `Promise.all` schedules an `onFulfilled` callback that checks
whether all promises have resolved. If this check returns true, it will resolve
the promise returned from the `Promise.all` call which would then enqueue the  `() => {
this.finished = true; }` callback. This callback is still sitting in the queue
by the time `done` is called!

Now the question is how do we make the callback that sets `this.finished` to
`true` to run before calling `done`? To answer this we need to understand how
promise callbacks are scheduled when promises are resolved or rejected. Jake
Archibald's article on [Tasks, microtasks, queues and schedules][t] goes in
depth on exactly that topic, and I highly recommend reading it.

In summary: Promise callbacks are queued onto the microtask queue and
callbacks of APIs such as `setTimeout(fn)` and `setInterval(fn)` are queued
onto the macrotask queue. Callbacks sitting on the microtask queue are run right
after the stack empties out, and if a microtask schedules another microtask,
then they will continually be pulled off the queue before yielding to the
macrotask queue.

With this knowledge, we can make this test pass by using `setTimeout` instead of
`then()`:

```js
test('sets finished to true after all promises have resolved', done => {
  const d1 = new Deferred();
  const d2 = new Deferred();

  const indicator = new PromisesHaveFinishedIndicator([d1.promise, d2.promise]);

  expect(indicator.finished).toBe(false);

  d2.resolve();
  setTimeout(() => {
    expect(indicator.finished).toBe(false);

    d1.resolve();
    setTimeout(() => {
      expect(indicator.finished).toBe(true);
      done();
    }, 0);
  }, 0);
});
```

The reason this works is because by the time second `setTimeout` callback runs,
we know that these promise callbacks have run:

- The callbacks attached to `d1.then` and `d2.then` by the implementation of
  `Promise.all`.
- The callback that sets `this.finished = true`.

Having a bunch of `setTimeout(fn, 0)` in our code is unsightly to say the least.
We can clean this up with the new [`async/await`][a] syntax:

```js
function flushPromises() {
  return new Promise((resolve, reject) => setTimeout(resolve, 0));
}

test('sets finished to true after all promises have resolved', async () => {
  const d1 = new Deferred();
  const d2 = new Deferred();

  const indicator = new PromisesHaveFinishedIndicator([d1.promise, d2.promise]);

  expect(indicator.finished).toBe(false);

  d2.resolve();
  await flushPromises();
  expect(indicator.finished).toBe(false);

  d1.resolve();
  await flushPromises();
  expect(indicator.finished).toBe(true);
});
```

If you want to be extra fancy, you can use `setImmediate` instead of
`setTimeout` in some environments (Node.js). It is faster than `setTimeout` but
still runs after microtasks:

```js
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
```

I have published the `flushPromises` function as the [`flush-promises`][f]
package on npm.

When writing tests involving promises and asynchrony, it is beneficial to
understand how callbacks are scheduled and the roles that different queues play
on the event loop. Having this knowledge allows us to reason with asynchrounous
the code that we write.

[a]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[f]: https://github.com/kentor/flush-promises
[j]: https://facebook.github.io/jest/
[r]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop#Run-to-completion
[t]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
