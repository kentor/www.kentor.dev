---
layout: post
title: Testing React and Flux applications with Karma and Webpack
---
This article is mainly for those looking for alternatives to using [Jest](https://facebook.github.io/jest/) to test their React and Flux applications. Jest is a testing framework from Facebook with a similar API to that of Jasmine, but with automatic mocking of CommonJS modules. Anyone who has used Jest for a non trivial React and Flux application knows that it is _really_ slow. For my test suite of about 60 test cases, it takes well over **10 seconds**!

Using [Karma](http://karma-runner.github.io/), [Webpack](http://webpack.github.io/), and [Jasmine](http://jasmine.github.io/), my test suite now takes under **200ms** to run in PhantomJS after the initial Webpack bundling. Of course, any other testing framework such as Mocha would work, but this article will use Jasmine in its examples.

As a prerequisite, the article titled [Testing ReactJS Components with Karma and Webpack](https://www.codementor.io/reactjs/tutorial/test-reactjs-components-karma-webpack) will get you started with, well, testing your React components with Karma and Webpack.

To summarize, the setup explained in that article uses `karma-webpack` to bundle all of your tests into a single file which Karma will load and run in the browser. The npm packages that you will need, excluding the ones for your application, are:

- karma
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

The problem with Flux stores is that stores are usually singletons with state, and [singletons with state](http://misko.hevery.com/code-reviewers-guide/flaw-brittle-global-state-singletons/) can quite possibly be one of the worst things to test because its state persists between tests. It becomes hard to predict the state of the store when many parts of your application interact with it throughout the test suite. You might be thinking that you could just implement some method to reset the state of the store, but doing this for every store is error prone and a maintainability nightmare.

Jest solves this problem by running every test case in its own environment. In otherwords, when we `require` a module in a test case or in a `beforeEach` block, the module imported is a fresh instance. This is exactly the behavior we want when testing stores!

With Webpack, we can do just that: clear the `require` cache before each test case. As an optimization, we wouldn't want to remove third party modules, such as `react`, from the `require` cache. Doing so would slow down our test suite significantly, and none of them should be singletons with state anyway. We can add cache busting before each test in the `tests.webpack.js` file like so:

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

I use [Reflux](https://github.com/spoike/refluxjs) as the Flux implementation for one of my projects, and Actions are pretty much the public API for Stores. Triggering an action is an async operation though, so we need a way to control this in our tests. This should be easy with any testing framework or library that provides facilities to mock out the built in `setTimeout` and `setInterval`, and to control timers. Here is an example of testing the Action/Store boundary with Jasmine:

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

  it('saves member when received', function() {
    MemberAction.memberReceived({ name: 'Baz Fu' });
    jasmine.clock().tick(); // Advance the clock to the next tick
    expect(MemberStore.getAll().first().get('name')).toBe('Baz Fu');
  });
});
```

### Mocking a Module's Dependencies
Say we want to test a module that has a dependency on another module that we want to mock. One example might be that we want to test our `api` module that depends on some http module like [axios](https://github.com/mzabriskie/axios). This is where Jest shines because they make it easy to specify mocks with `jest.setMock(moduleName, moduleExports)` or with their [automatic mocking](https://facebook.github.io/jest/docs/automatic-mocking.html) facilities.

Now I admit I haven't had to mock a module's dependencies yet, but I know there are a couple of options with Webpack. One of them is to use [rewire](https://github.com/jhnns/rewire) and its webpack version [rewire-webpack](https://github.com/jhnns/rewire-webpack). Rewire can be used to change private variables in a module. For example if we want to mock out the `axios` module within our `api.js` module, we can write something like this:

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

Another option is to abuse Webpack's `require` cache (again)!

```javascript
require('axios'); // Make sure the module is loaded and cached
require.cache[require.resolve('axios')].exports = mockAxios;
```

The benefit of this over rewire is that every call to `require('axios')` is mocked, not just in the module that we rewired.

### Closing
Using Karma and Webpack over Jest to test my React and Flux application, I saw around a 50x speed improvement in running my test suite. However, it takes a bit of effort to set up compared to Jest, and mocking a module's dependencies isn't as easy. Another problem is that when running Karma with `--no-single-run`, new test files won't automatically be added to the Webpack bundle, so restarting the Karma runner will be necessary. I haven't figured out a way fix that problem yet.

Jest is really nice since it's so easy to set up, but that it's so [slow](https://github.com/facebook/jest/issues/116) is a deal breaker for me, and I don't know if it'll ever be fixed. If it gets faster I might think about switching back for its benefits, but until then I am enjoying the sub 200ms run times that will allow me to TDD.
