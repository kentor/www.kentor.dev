---
title: Testing Promise.all side effects with async/await
---

I had to write a test that asserted some side effect of running the `then`
handler of a [`Promise.all`][p]. I could control the resolution timing of the
promises passed to `Promise.all` using [`Deferred`][d] objects, but since I
didn't have control of the `Promise.all` call, I had dig deeper to figure out
how to write the test case.

Here's a minimal test case using [`jest`][j] (note: this would also work with
[`mocha`][m]) illustrating what I had to deal with:

```js
class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class Thing {
  constructor() {
    this.finished = false;
  }

  run(promises) {
    Promise.all(promises).then(() => {
      this.finished = true;
    });
  }
}

describe('run', () => {
  let deferreds;
  let thing;

  beforeEach(() => {
    deferreds = [new Deferred(), new Deferred()];
    thing = new Thing();
  });

  it('sets finished to true after all promises have resolved', () => {
    thing.run(deferreds.map(d => d.promise));
    expect(thing.finished).toBe(false);
    deferreds[1].resolve();
    expect(thing.finished).toBe(false);
    deferreds[0].resolve();
    expect(thing.finished).toBe(true);
  });
});
```

Of course, this won't work because the test is a synchronous. Promise handlers
would be ran after the test case has run all of its statements. However, we
could use [`async/await`][ja] in `jest` (and `mocha`) to deal with asynchrony in
the test with a synchronous api:

```js
it('sets finished to true after all promises have resolved', async () => {
  thing.run(deferreds.map(d => d.promise));
  expect(thing.finished).toBe(false);
  await deferreds[1].resolve();
  expect(thing.finished).toBe(false);
  await deferreds[0].resolve();
  expect(thing.finished).toBe(true);
});
```

But if you ran the above, the last assertion would still fail. It turns out
adding an extra `await <any>` after resolving the last would work:

```js
it('sets finished to true after all promises have resolved', () => {
  thing.run(deferreds.map(d => d.promise));
  expect(thing.finished).toBe(false);
  await deferreds[1].resolve();
  expect(thing.finished).toBe(false);
  await deferreds[0].resolve();
  await null; // could be anything: await 1, await undefined, etc.
  expect(thing.finished).toBe(true);
});
```

To understand why, we need to understand that promise callbacks, when ready, are
queued in the microtask queue (using `process.nextTick` in Node.js). For an
in-depth coverage of microtasks, I recommend reading Jake Archibald's article on
[Tasks, microtasks, queues and schedules][t].

So let's visualize what's on the microtask queue when we run the test. To make a
better illustration, let's assume that `Promise.all` is implemented like so:

```js
Promise.all = (promises) => (
  new Promise((resolve, reject) => {
    const results = [];
    let numResolved = 0;

    function handle(i, r) {
      results[i] = r;
      numResolved++;
      if (numResolved === promises.length) {
        resolve(results);
      }
    }

    promises.forEach((p, i) => {
      p.then(r => handle(i, r));
    });
  })
);
```

Then the promise that we're dealing with in the test looks like this:

```js
new Promise((resolve, reject) => {
  const results = [];
  let numResolved = 0;

  function handle(i, r) {
    results[i] = r;
    numResolved++;
    if (numResolved === promises.length) {
      resolve(results);
    }
  }

  deferred[0].promise.then(r => handle(0, r));
  deferred[1].promise.then(r => handle(1, r));
}).then(() => {
  thing.finished = true;
});
```

Let's also break up this statement:

```js
await deferreds[0].resolve();
```

into

```js
result = deferred[0].resolve();
await result;
```

With this, let's step through the test:

```js
it('sets finished to true after all promises have resolved', () => {
  // Microtask queue is currently empty
  thing.run(deferreds.map(d => d.promise));
  expect(thing.finished).toBe(false);
  result = deferreds[1].resolve();
  // Microtask queue has queued `handle(1, r)` because of resolve()
  await result;
  // Microtask queue has been flushed by `await`, ran `handle(1, r)`
  expect(thing.finished).toBe(false);
  results = deferreds[0].resolve();
  // Microtask queue has queued `handle(0, r)`
  await result;
  // Microtask queue has been flushed by `await`, ran `handle(0, r)`
  // Microtask queue has queued `thing.finished = true`
  await null;
  // Microtask queue has been flushed by `await`, ran `thing.finished = true`
  expect(thing.finished).toBe(true);
});
```

Hopefully that illustrates that the extra `await` is needed to flush the
callback of the `Promise.all` sitting in the microtask queue.

Note that everything mentioned in this article assumes that Promise callbacks
are scheduled with `process.nextTick`, and that `await` flushes the microtask
queue. Some browser polyfills of Promises use `setTimeout(fn, 0)` to schedule
callbacks instead, and that would probably not work with `await`, but that also
depends on how `await` is implemented.

[d]: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred
[j]: https://facebook.github.io/jest/
[ja]: https://facebook.github.io/jest/docs/tutorial-async.html
[m]: https://mochajs.org/
[p]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
[t]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
