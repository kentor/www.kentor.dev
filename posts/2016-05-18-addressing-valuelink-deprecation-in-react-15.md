---
title: Addressing valueLink deprecation in React 15
---
React 15 has deprecated [`valueLink`][t] which was a property on form elements
for expressing [two-way binding][t] between the value of the form element and a
state property of the component using the element. The recommended replacement
is to explicitly specify the `value` as a prop and to supply an `onChange`
handler instead.

It would be very tedious to write these `onChange` handlers for every form
element. For example:

```js
const Profile = React.createClass({
  getInitialState() {
    return {
      age: '',
      name: '',
      single: true,
    };
  },

  handleAgeChange(e) {
    this.setState({ age: e.target.value });
  },

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  },

  handleSingleChange(e) {
    this.setState({ single: e.target.checked });
  },

  render() {
    return (
      <div>
        <input value={this.state.age} onChange={this.handleAgeChange} />
        <input value={this.state.name} onChange={this.handleNameChange} />
        <input
          type="checkbox"
          value={this.state.single}
          onChange={this.handleSingleChange}
        />
      </div>
    );
  },
});
```

Instead of defining the handlers on the component, we can write a factory
function that generates these handlers and cache them on the component
instance:

```js
function createHandler(component, key) {
  return (e) => {
    const el = e.target;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    component.setState({ [key]: value });
  };
}

module.exports = function linkState(component, key) {
  const cache = component.__linkStateHandlers ||
    (component.__linkStateHandlers = {});

  return cache[key] || (cache[key] = createHandler(component, key));
}
```

Then we can remove all the handlers on the component and use `linkState`
instead:

```js
const linkState = require('./linkState');

const Profile = React.createClass({
  getInitialState() {
    return {
      age: '',
      name: '',
      single: true,
    };
  },

  render() {
    return (
      <div>
        <input value={this.state.age} onChange={linkState(this, 'age')} />
        <input value={this.state.name} onChange={linkState(this, 'name')} />
        <input
          type="checkbox"
          checked={this.state.single}
          onChange={linkState(this, 'single')}
        />
      </div>
    );
  },
});
```

You can adapt `linkState` to your application needs. I tend to use the
[Immutable][i] library in my projects, and I may want my handlers to support
setting a value deep inside an `Immutable.Map`. For example, if I have
`this.state.person` pointing to an `Immutable.Map` and I may want to set a value
at the `['name', 'last']` path using `setIn`. I may want `linkState` to look
like this when used:

```js
const linkState = require('./linkState');

const Form = React.createClass({
  getInitialState() {
    return {
      person: Immutable.Map(),
    };
  },

  render() {
    return (
      <div>
        <input
          value={this.state.person.getIn(['name', 'first'])}
          onChange={linkState(this, 'person', ['name', 'first'])}
        />
        <input
          value={this.state.person.getIn(['name', 'last'])}
          onChange={linkState(this, 'person', ['name', 'last'])}
        />
      </div>
    );
  },
})
```

Then I would just update `linkState` like so:

```js
function createHandler(component, key, path) {
  return (e) => {
    const el = e.target;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    component.setState({
      [key]: path ? component.state[key].setIn(path, value) : value,
    });
  };
}

module.exports = function linkState(component, key, path) {
  const cache = component.__linkStateHandlers ||
    (component.__linkStateHandlers = {});
  const cacheKey = path ? `${key}:${path.toString()}` : key;

  return cache[cacheKey] ||
    (cache[cacheKey] = createHandler(component, key, path));
}
```

This `createHandler` function doesn't take care of every use case. For example,
changes are needed to support a `<select multiple>` element. I hope you find
this technique useful and easy to adapt to your applications.

[i]: http://facebook.github.io/immutable-js/
[t]: https://facebook.github.io/react/docs/two-way-binding-helpers.html
