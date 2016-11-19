---
title: Testing Promise.all side effects with async/await
---

I had to write a test that asserted some side effect of running the `then`
handler of a [`Promise.all`][p]. I could control the resolution timing of the
promises passed to `Promise.all` using [`Deferred`][d] objects, but since I
wasn't returning the `Promise.all` call, I had to dig deeper to figure out how
to force the callback of a `Promise.all` to run inside a test.

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

Of course, the test case will fail because the test is a synchronous. Promise
callbacks would be ran after the test case has run all of its statements. What
we want is a way to force the promise callbacks to run after calling the
deferreds' `resolve()` method, and before we call the test's assertions.

To figure out how to proceed, we need to understand how promise callbacks are
scheduled when they are resolved or rejected. Jake Archibald's article on
[Tasks, microtasks, queues and schedules][t] goes in depth on exactly that
topic, and I highly recommend reading it.

In summary: Promise callbacks are queued in the **microtask** queue and
callbacks of `setImmediate(fn)` and `setTimeout(fn)` are queued in the
**macrotask** queue. Callbacks sitting on the microtask queue are run right
after the stack empties out, and if a microtask schedules another microtask,
then they will continually be pulled off the queue before yielding to the
macrotask queue.

With this knowledge, we can use `setImmediate()` to force all promise callbacks
to run by the time it runs its own callback. We also need to use the `done`
pattern for async tests in jest/mocha. This would make the test pass:

```js
it('sets finished to true after all promises have resolved', (done) => {
  thing.run(deferreds.map(d => d.promise));
  expect(thing.finished).toBe(false);
  deferreds[1].resolve();
  setImmediate(() => {
    expect(thing.finished).toBe(false);
    deferreds[0].resolve();
    setImmediate(() => {
      expect(thing.finished).toBe(true);
      done();
    });
  });
});
```

But this is really ugly because every time we flush the microtask queue by using
`setImmediate()` we introduce a level of indentation. We can flatten the
indentation by using promises:

```js
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

it('sets finished to true after all promises have resolved', (done) => {
  thing.run(deferreds.map(d => d.promise));
  expect(thing.finished).toBe(false);
  deferreds[1].resolve();
  flushPromises().then(() => {
    expect(thing.finished).toBe(false);
    deferreds[0].resolve();
    return flushPromises();
  }).then(() => {
    expect(thing.finished).toBe(true);
    done();
  });
});
```

Still, this would require at least 1 level of indentation. To remove all levels
of indentation we could use [`async/await`][ja] in `jest` (and `mocha`)!

```js
function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

it('sets finished to true after all promises have resolved', async () => {
  thing.run(deferreds.map(d => d.promise));
  expect(thing.finished).toBe(false);
  deferreds[1].resolve();
  await flushPromises();
  expect(thing.finished).toBe(false);
  deferreds[0].resolve();
  await flushPromises();
  expect(thing.finished).toBe(true);
});
```

[d]: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred
[j]: https://facebook.github.io/jest/
[ja]: https://facebook.github.io/jest/docs/tutorial-async.html
[m]: https://mochajs.org/
[p]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
[t]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
