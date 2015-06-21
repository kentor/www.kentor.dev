---
layout: post
title: Testing React and Flux applications with Karma and Webpack
---
At my current employer, Rescale, we were using the [Jest](https://facebook.github.io/jest/) framework by Facebook to test our React and Flux application. Jest is a simple-to-get-started testing framework with an API similar to that of [Jasmine](http://jasmine.github.io/), but with automatic mocking of CommonJS modules baked in. However, like many developers have [noted](https://github.com/facebook/jest/issues/116), we've found Jest to be unbearably slow when running a non-trivial test suite. For our test suite of about 60 test cases, it takes well over 10 seconds to finish! This article explains how we've ditched Jest in favor of [Karma](http://karma-runner.github.io/), [Webpack](http://webpack.github.io/), and [Jasmine](http://jasmine.github.io/). The same test suite running under our new setup takes only a little under 200ms to execute in PhantomJS, after the initial Webpack bundling.

Our testing setup is based on the one explained in this article: [Testing ReactJS Components with Karma and Webpack](https://www.codementor.io/reactjs/tutorial/test-reactjs-components-karma-webpack). Read that if you are unfamiliar with Karma and Webpack. To sumarize, this setup uses karma-webpack to bundle all of our tests into a single file which Karma loads and runs in the browser. The npm packages needed for this are:

- karma
- karma-cli
- karma-jasmine
- karma-phantomjs-launcher
- karma-webpack
- jasmine
- webpack
- core-js (for ES5 shims)
- babel-loader (for ES6 to ES5 transpilation)

The Karma configuration file, `karma.conf.js` may look something like this:

```javascript
module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],
    files: [
      { pattern: 'tests.webpack.js', watched: false },
    ],
    frameworks: ['jasmine'],
    preprocessors: {
      'tests.webpack.js': ['webpack'],
    },
    reporters: ['dots'],
    singleRun: true,
    webpack: {
      module: {
        loaders: [
          { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
        ],
      },
      watch: true,
    },
    webpackServer: {
      noInfo: true,
    },
  });
};
```

And the entry point for the test suite Webpack bundle, `tests.webpack.js`, should look something like this:

```javascript
// ES5 shims for Function.prototype.bind, Object.prototype.keys, etc.
require('core-js/es5');
// Replace ./src/js with the directory of your application code and
// make sure the file name regexp matches your test files.
var context = require.context('./src/js', true, /-test\.js$/);
context.keys().forEach(context);
```

And here's a sample test, located at `./src/js/components/__tests__/MemberList-test.js` which tests the component `./src/js/components/MemberList.jsx`:

```javascript
var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var MemberList = require('../MemberList.jsx');

describe('MemberList', () => {
  it('renders', () => {
    var element = TestUtils.renderIntoDocument(<MemberList />);
    expect(element).toBeTruthy();
  });
});
```

That's all well and good for testing React components, but testing Flux applications, specifically Flux Stores, requires a little more setup.

### Testing Flux Stores

The problem with Flux stores is that stores are usually singletons with state, and [singletons with state](http://misko.hevery.com/code-reviewers-guide/flaw-brittle-global-state-singletons/) can quite possibly be one of the worst things to test because their state persists between tests. It becomes hard to predict the state of the store when many parts of your application interact with it throughout the test suite. You might be thinking that we could just implement some method to reset the state of the store before each test case, but doing this for every store is a maintainability nightmare and is very prone to errors.

Jest solves this problem by running every test case in its own environment. In otherwords, when we `require` a module in a test case, the module imported is a fresh instance. This is exactly the behavior we want when testing stores!

With Webpack, we can do just that: clear the `require` cache before each test case so that calls to `require` loads a fresh instance of a module. As an optimization, we wouldn't want to remove third party modules, such as `react`, from the `require` cache. Doing so would slow down our test suite significantly, and none of those third party modules should be singletons with state anyway. We can add cache busting before each test in the `tests.webpack.js` file like so:

```javascript
// Create a Webpack require context so we can dynamically require our
// project's modules. Exclude test files in this context.
var projectContext = require.context('./src/js', true, /^((?!__tests__).)*.jsx?$/);
// Extract the module ids that Webpack uses to track modules.
var projectModuleIds = projectContext.keys().map(module =>
  String(projectContext.resolve(module)));

beforeEach(() => {
  // Remove our modules from the require cache before each test case.
  projectModuleIds.forEach(id => delete require.cache[id]);
});
```

That's all there is to busting the `require` cache. Now modules are cached within each test case, but aren't in between. Stores, actions, and dispatchers are all isolated between tests.

### Testing the Actions/Stores Boundary

We use [Reflux](https://github.com/spoike/refluxjs) as the Flux implementation for one of our projects, and Actions are pretty much the public API for Stores. Triggering an action is an async operation though, so we need a way to control this in our tests. This should be easy with any testing framework or library that provides facilities to mock out the native `setTimeout` and `setInterval` functions and manually advance them. Here is an example of testing the Action/Store boundary with Jasmine:

```javascript
describe('MemberStore', () => {
  var MemberActions;
  var MemberStore;

  beforeEach(() => {
    jasmine.clock().install(); // Mock out the built in timers
    MemberActions = require('../../actions/MemberActions');
    MemberStore = require('../MemberStore');
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('saves member when received', () => {
    MemberAction.memberReceived({ name: 'Baz Fu' });
    jasmine.clock().tick(); // Advance the clock to the next tick
    expect(MemberStore.getAll().first().get('name')).toBe('Baz Fu');
  });
});
```

### Mocking a Module's Dependencies

Say we want to test a module that has a dependency on another module that we want to mock. One example could be that we want to test an api module that depends on some http module like [axios](https://github.com/mzabriskie/axios). This is where Jest shines because they make it easy to specify mocks with its `jest.setMock(moduleName, moduleExports)` API or with their [automatic mocking](https://facebook.github.io/jest/docs/automatic-mocking.html) facilities.

One way to achieve this outside of Jest is to use [rewire](https://github.com/jhnns/rewire) and its webpack version [rewire-webpack](https://github.com/jhnns/rewire-webpack). Rewire can be used to change private variables in a module. For example if we want to mock out the `axios` module within our `api.js` module, we can write something like this:

```javascript
// api.js
var axios = require('axios');

var API = {
  doSomething() {
    axios.get('http://someurl/');
  },
};

module.exports = API;

// In some test
var API = rewire('../api');
API.__set__('axios', mockAxios);
```

Now `API.doSomething()` will call the mocked axios' `get()`.

Another option is to, once again, manipulate Webpack's `require` cache:

```javascript
require('axios'); // Make sure the module is loaded and cached
require.cache[require.resolve('axios')].exports = mockAxios;
```

The benefit of this over rewire is that every call to `require('axios')` is mocked, not just in the module that we rewired.

**Note:** Mocking an http request library is probably a bad example. For that you should use something like [jasmine-ajax](https://github.com/jasmine/jasmine-ajax).

### Closing

We saw around a 50x speed improvment in the execution of our React and Flux application test suite using Karma and Webpack over Jest. However, it does take a bit more knowledge and effor to set up compared to Jest, and mocking a module's dependencies isn't as easy. Jest is really nice since it's easy to set up, but that it's so slow is a deal breaker for us, and we dont know if it'll ever be fixed. In the mean time, our current setup allows us to effectively TDD.

**Edit:** Sample repository demonstrating this technique, [react-flux-testing](https://github.com/kentor/react-flux-testing).
