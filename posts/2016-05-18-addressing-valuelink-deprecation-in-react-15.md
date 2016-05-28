---
title: Addressing valueLink deprecation in React 15
---
React version 15 has deprecated [`valueLink`][t] which was a property on form
elements for expressing [two-way binding][t] between the value of the form
element and a state property of the component using the element. The recommended
replacement is to explicitly specify the `value` as a prop and to supply an
`onChange` handler instead.

At Rescale, we use `valueLink` a lot. When creating components for modifying
business objects—our business objects are usually immutable [`Record`][r]
instances of the [Immutable][i] library—we use the pattern of passing the
business object to the component via `props`, and then initializing a state
property on the component to said object via `getInitialState`. Here’s
pseudocode for illustration:

```js
// Our immutable business object
const company = new Company({
  budget: '1000',
  name: 'Cool Company',
});

// The UI for modifying the company
<CompanySettings company={company} />

// The component definition
const LinkedStateMixin = require('react-addons-linked-state-mixin');

const CompanySettings = React.createClass({
  mixins: [
    LinkedStateMixin,
  ],

  getInitialState() {
    company: this.props.company,
    showAdvancedOptions: false,
  },

  handleNameChange(name) {
    this.setState({
      company: this.state.company.set('name', name);
    });
  },

  handleBudgetChange(budget) {
    this.setState({
      company: this.state.company.set('budget', budget);
    });
  },

  save() {
    // Save logic
  },

  render() {
    return (
      <div>
        <input
          type="text"
          valueLink={{
            requestChange: this.handleNameChange,
            value: this.state.company.get('name'),
          }}
        />
        {this.state.showAdvancedOptions &&
          <input
            type="number"
            valueLink={{
              requestChange: this.handleBudgetChange,
              value: this.state.company.get('budget'),
            }}
          />
        }
        <input
          type="checkbox"
          valueLink={this.linkState('showAdvancedOptions')}
        />
        <button type="button" onClick={this.save}>Submit</button>
      </div>
    );
  },
});
```

What’s good about this pattern is that since our business objects are immutable,
the company passed into the component (`this.props.company`) will be guaranteed
not to change in the course of modifying the company within this component, but
the company referenced by `state` (`this.state.company`) may change when
`handleNameChange` gets called. With this pattern, the state of the component
can be thought of as a "staging" area for changes to the model. We can do stuff
like compare the company referenced by `state` with the company referenced by
`props` to determine whether any changes were made, and we can easily revert
changes or abandon changes.

As you can see though, it gets a bit tedious creating handlers for every field
of the model that can be modified by the form. In our example we needed handlers
for changes to `name` and changes to `budget`. But, it’s not too hard to create
a function that will generate an object with an appropriate `{ requestChange,
value }` pair and then feed that object to `valueLink`. Indeed that’s what
[react-addons-linked-state-mixin][l] and [reactlink-immutable][rl] is used for.

However, in React 15, we are to use `value` and `onChange` instead of
`valueLink`. Switching over to use `value` isn’t that big of a deal, we just
write it out like in the example above. The only caveat is that for checkboxes
we need to use `checked` instead of `value`.

Creating a factory that generates handlers for `onChange` is something we
decided to implement ourselves since we use a mix of simple component states
(states with simple string or boolean values) and states that reference
Immutable objects. Here’s such a factory for generating `onChange` handlers
(named `linkState`, not to be confused with the `this.linkState` given by
react-addons-linked-state-mixin):

```js
function createHandler(component, key, path) {
  return e => {
    const el = e.target;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    component.setState({
      [key]: path ? component.state[key].setIn(path, value) : value,
    });
  };
}

module.exports = function linkState(component, key, path) {
  if (path) {
    return createHandler(component, key, path);
  }

  const cache = component.__linkStateHandlers ||
    (component.__linkStateHandlers = {});

  return cache[key] || (cache[key] = createHandler(component, key));
};
```

We can use this to replace the `valueLink`s in the above example:

```js
const CompanySettings = React.createClass({
  getInitialState() {
    company: this.props.company,
    showAdvancedOptions: false,
  },

  save() {
    // Handle save
  },

  render() {
    return (
      <div>
        <input
          onChange={linkState(this, 'company', ['name'])}
          type="text"
          value={this.state.company.get('name')},
        />
        {this.state.showAdvancedOptions &&
          <input
            onChange={linkState(this, 'company', ['budget'])}
            type="number"
            value={this.state.company.get('budget')}
          />
        }
        <input
          checked={this.state.showAdvancedOptions} // checked, not value!
          onChange={linkState(this, 'showAdvancedOptions')}
          type="checkbox"
        />
        <button type="button" onClick={this.save}>Submit</button>
      </div>
    );
  },
});
```

What’s nice about our implementation is that we don’t need to use mixins which
may be deprecated in the future, and we’re using the same factory function for
creating handlers that deal with simple states as well as for deep modifications
of immutable objects. This means we can remove the
`react-addons-linked-state-mixin` and `reactlink-immutable` dependencies in our
projects.

[i]: http://facebook.github.io/immutable-js/
[l]: https://www.npmjs.com/package/react-addons-linked-state-mixin
[r]: https://facebook.github.io/immutable-js/docs/#/Record
[rl]: https://www.npmjs.com/package/reactlink-immutable
[t]: https://facebook.github.io/react/docs/two-way-binding-helpers.html
