---
title: Imperative creep in React
---
[React](http://facebook.github.io/react/) is a declarative framework that allows us to describe how our components should look at any given point in time and will manage all the UI updates when the underlying data changes. If we follow [best practices](http://facebook.github.io/react/blog/2013/11/05/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state) for managing state, such as keeping around only the minimal set of state needed for the UI and computing everything else on demand, we generally write a lot less imperative code. Following this practice also has the benefit of eliminating an entire class of bugs related to inconsistent UI state. However, there are situations where properties of a component’s state can depend on each other in a way that one isn’t always computed from another, and intuitive attempts to keep state within these constraints can introduce dreaded imperative code. This article will demonstrate such a scenario and suggest a more declarative way of keeping state consistent.

### The Example

We want a component that renders a list of items. We can select an item to toggle its checked state. If any item is checked, the component will show a "Selected" tab that, when clicked, shows only checked items. We implement this with a component that has two `state` properties. The first is `checkedSet` which holds a set of the checked items, and the second is `onlyShowChecked`. When the latter property is `true` the component shows only checked item and the Selected tab is "active". Sounds simple, here's the code:

```javascript
var Selector = React.createClass({
  getInitialState() {
    return {
      checkedSet: Immutable.Set(this.props.init),
      onlyShowChecked: false,
    };
  },
  setShowChecked(bool) {
    this.setState({ onlyShowChecked: bool });
  },
  toggleChecked(o) {
    var checkedSet = this.state.checkedSet;
    checkedSet = checkedSet[checkedSet.contains(o) ? 'delete' : 'add'](o);
    this.setState({ checkedSet });
  },
  render() {
    var checkedSet = this.state.checkedSet;
    var onlyShowChecked = this.state.onlyShowChecked;
    var someChecked = checkedSet.size > 0;
    var items = this.props.items.toSeq();
    if (onlyShowChecked) {
      items = items.filter(o => checkedSet.contains(o));
    }
    return (
      <div>
        <ul className="nav nav-tabs">
          <li className={!onlyShowChecked && "active"}>
            <a onClick={this.setShowChecked.bind(this, false)}>All</a>
          </li>
          {someChecked &&
            <li className={onlyShowChecked && "active"}>
              <a onClick={this.setShowChecked.bind(this, true)}>Selected</a>
            </li>
          }
        </ul>
        <section>
          {this.props.title}
          {items.map((o, i) => (
            <label key={i}>
              <input type="checkbox" checked={checkedSet.contains(o)}
                     onChange={this.toggleChecked.bind(this, o)} />
              {o}
            </label>
          )).toArray()}
        </section>
      </div>
    );
  }
});

var items = Immutable.List(['Angular', 'Backbone', 'Ember', 'Knockout', 'React']);
React.render(
  <Selector title="My favorite frameworks" items={items} init={['React']} />,
  document.body);
```

<a class="jsbin-embed" href="http://jsbin.com/nomomi/2/edit?js,output">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>

Looks good, but there’s an undesirable state. When we’re in the Selected tab and uncheck all the items, our UI isn’t showing any items and there isn’t an active tab anymore. We’d probably want to fix this by automatically switching back to the show all tab whenever we uncheck the last item. The most obvious place to implement that behavior is of course in the action that got us into this state. That is, in `toggleChecked` we’d want to check whether we’ve just unchecked the last item and if so set `onlyShowChecked` to `false`. Our modified `toggleChecked` may look something like this:

```javascript
toggleChecked(o) {
  var checkedSet = this.state.checkedSet;
  checkedSet = checkedSet[checkedSet.contains(o) ? 'delete' : 'add'](o);

  var onlyShowChecked = this.state.onlyShowChecked;
  if (checkedSet.isEmpty()) onlyShowChecked = false;

  this.setState({ checkedSet, onlyShowChecked });
},
```

Sure enough, replay that scenario and it'll work as desired:

<a class="jsbin-embed" href="http://jsbin.com/nomomi/3/embed?js,output">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>

However, there are a couple things wrong with this approach. The `toggleChecked` function now has multiple responsibilities. In addition to toggling the checked state of an item, it now also sets the `onlyShowChecked` property. The next developer reading this code won't understand it at a glance compared to the previous version. They will have to think about why this check was introduced and will always need to keep this edge case in their head when modifying or adding features.

Now consider what can happen when we add a button to uncheck everything at once. This button calls the `uncheckAll` function which clears `checkedSet`:

<a class="jsbin-embed" href="http://jsbin.com/nomomi/4/embed?js,output">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>

Indeed it's again possible to get into that unwanted state since we can use this new button to uncheck all the items while in the Selected tab. At this point it's considered a bug and there are a couple of intuitive ways to fix this.

One obvious fix is to inline the same check that we introduced to `toggleChecked`, but again this would add to the responsibility of `uncheckAll` and duplicating logic is never good for maintainability.

Another way is to loop over the checked items and call `toggleChecked` on each one. This would work, but it would feel like we're doing much more work than we need to. And who can predict the rendering behavior when calling `setState` that many times in a function call? Also the only reason we would even _consider_ doing it this way is because we _know_ `toggleChecked` has the side effect that we want, and this would tightly couple the two functions together.

Either way, let's say a couple of months from now we want to introduce a third way of toggling items, say by adding a button that inverts the checked state of each item. This is effectively an uncheck all if all items are checked. At this point it's natural to forget that we've been adding code to prevent our component from getting into an undesirable state and reintroducing the bug is all too easy.

The fundamental problem is that there isn't an obvious way in React to declaratively describe the dependencies between our `state` properties. That is in our case, `onlyShowChecked` should never be `true` when `checkedSet` is empty. So, in order to maintain that invariant, we end up writing imperative state manipulations reminiscent of the imperative DOM manipulations that we used to write with jQuery, and this will inevitably lead to maintainability problems down the road. This is what I call imperative creep.

In Angular, or another framework that provides observables, we can just watch the `checkedSet` property in order to keep `showSelected` in the correct state. The best way we’ve found to manage dependent state in React is by mutating the state directly at the very top of the render function:

```javascript
render() {
  if (this.state.checkedSet.isEmpty() && this.state.onlyShowChecked) {
    this.state.onlyShowChecked = false;
  }
  // ...
}
```

Now we admit this looks like bad practice in any React application, but we didn’t come to this conclusion lightly. We’ve tried managing state in the [shouldComponentUpdate](http://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate) lifecycle method, but that introduced a bunch of incompatibilities such as when using a mixin that already provides `shouldComponentUpdate`, or when state is an `Immutable` object instead of a plain javascript object, or having `forceUpdate` completely bypass `shouldComponentUpdate`.

By managing dependent state at the top of a render function we don’t have to deal with these incompatibilities. The benefits are that we’ve eliminated the root cause of our UI bug and it encourages developers to keep all the rules for dependent state properties in one place.
