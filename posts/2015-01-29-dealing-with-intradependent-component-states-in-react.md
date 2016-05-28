---
title: Dealing with intradependent component states in React
---
This article addresses issues that crop up when a React component’s `state`
properties depend on each other.

React encourages declarative programming: at any given time given some `state`
and `props`, we declare how the DOM should look. This frees us from the dreadful
days of imperative jQuery DOM manipulations. However, when `state` properties of
a component depend on each other, intuitive attemps at keeping the component in
a good state can introduce hard-to-maintain imperative code.

Take for example a component that shows a list of selectable items and a tabbed
navigation that in one tab shows all the items and in the second tab, shows only
the selected items. The tab that shows only selected items should be shown only
when at least one item is selected.

We implement this component with two `state` properties. The first is
`checkedSet` which is the set of the checked items, and the second is
`onlyShowChecked`. The list of all items is passed in as `props.items`. When the
`onlyShowChecked` property is `true` the component shows only checked items and
the "Selected" tab is active.

Here’s the code:

```js
const Selector = React.createClass({
  getInitialState() {
    return {
      checkedSet: Immutable.Set(),
      onlyShowChecked: false,
    };
  },
  setShowChecked(bool) {
    this.setState({ onlyShowChecked: bool });
  },
  toggleChecked(o) {
    const checkedSet = this.state.checkedSet;
    checkedSet = checkedSet[checkedSet.contains(o) ? 'delete' : 'add'](o);
    this.setState({ checkedSet });
  },
  render() {
    const checkedSet = this.state.checkedSet;
    const onlyShowChecked = this.state.onlyShowChecked;
    const someChecked = checkedSet.size > 0;
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
          {items.map((o, i) =>
            <label key={i}>
              <input
                checked={checkedSet.contains(o)}
                onChange={this.toggleChecked.bind(this, o)}
                type="checkbox"
              />
              {o}
            </label>
          ).toArray()}
        </section>
      </div>
    );
  }
});

const items = Immutable.List(['Angular', 'Backbone', 'Ember', 'Knockout', 'React']);

ReactDOM.render(
  <Selector title="My favorite frameworks" items={items} />,
  document.body
);
```

<a class="jsbin-embed" href="http://jsbin.com/nomomi/2/edit?js,output">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>

Looks good, but there’s an undesirable state. When we’re in the Selected tab and
uncheck all the items, our UI isn’t showing any items and there isn’t an active
tab anymore because we hid the Selected tab. We should fix this by automatically
switching back to the show all tab whenever we uncheck the last item. The most
obvious place to implement that behavior is in the action that got us into this
state. That is, in `toggleChecked` we’d want to check whether we’ve just
unchecked the last item and if so set `onlyShowChecked` to `false`. Our modified
`toggleChecked` may look something like this:

```javascript
toggleChecked(o) {
  var checkedSet = this.state.checkedSet;
  checkedSet = checkedSet[checkedSet.contains(o) ? 'delete' : 'add'](o);

  var onlyShowChecked = this.state.onlyShowChecked;
  if (checkedSet.isEmpty()) onlyShowChecked = false;

  this.setState({ checkedSet, onlyShowChecked });
},
```

Sure enough, replay that scenario and it’ll work as desired:

<a class="jsbin-embed" href="http://jsbin.com/nomomi/3/embed?js,output">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>

However, there are a couple things wrong with this approach. The `toggleChecked`
function now has multiple responsibilities. In addition to toggling the checked
state of an item, it now also sets the `onlyShowChecked` property. The next
developer reading this code will have to think about why this check was
introduced and will always need to keep this edge case in their head when
updating the code.

Now consider what can happen when we add a button to uncheck everything at once.
This button calls the `uncheckAll` function which clears `checkedSet`:

<a class="jsbin-embed" href="http://jsbin.com/nomomi/4/embed?js,output">JS Bin</a><script src="http://static.jsbin.com/js/embed.js"></script>

Unfortunately, it’s again possible to get into that unwanted state if we click
the uncheck all button from the Selected tab. The issue is that the `uncheckAll`
function doesn’t set `onlyShowChecked` to `false` like it does in
`toggleChecked`. At this point it’s considered a bug and there are a couple of
intuitive ways to fix this.

One bad fix is to inline the same check that we introduced to `toggleChecked`,
but again this would add to the responsibility of `uncheckAll` and duplicating
logic is never good for maintainability.

Another way is to loop over the checked items and call `toggleChecked` on each
one. This would work, but it would feel like we’re doing much more work than we
need to. And who can predict the rendering behavior when calling `setState` that
many times in a function call? Also the only reason we would even _consider_
doing it this way is because we _know_ `toggleChecked` has the side effect that
we want, and this would tightly couple the two functions together.

Either way, let’s say a couple of months from now we want to introduce a third
way of toggling items, say by adding a button that inverts the checked state of
each item. This is effectively an uncheck all if all items are checked. At this
point it’s natural to forget that we’ve been adding code to prevent our
component from getting into an undesirable state and reintroducing the bug is
all too easy.

The fundamental problem is that there isn’t an obvious way in React to
declaratively describe the dependencies between our `state` properties. That is
in our case, `onlyShowChecked` should never be `true` when `checkedSet` is
empty. So, in order to maintain that invariant, we end up writing imperative
state manipulations, and this will inevitably lead to maintainability problems
down the road. This is what I call imperative creep.

In Angular, or another framework that provides observables, we can just watch
the `checkedSet` property in order to keep `showSelected` in the correct state.
The best way I found to manage intradependent state in a component is by
mutating the state directly at the very top of the render function:

```javascript
render() {
  if (this.state.checkedSet.isEmpty() && this.state.onlyShowChecked) {
    this.state.onlyShowChecked = false;
  }
  // ...
}
```

Now I admit this looks like bad practice in any React application, but I didn’t
come to this conclusion lightly. I’ve tried managing state in the
[shouldComponentUpdate][s] lifecycle method, but that introduced a bunch of
other problems such as using mixins that already implement
`shouldComponentUpdate`, or having `forceUpdate` completely bypass
`shouldComponentUpdate`.

By managing intradependent state at the top of a render function we don’t have
to deal with these incompatibilities. The benefits are that we’ve eliminated the
root cause of the UI bug and it encourages other developers to keep all the code
for handling intradependent state properties in one place.

[b]: http://facebook.github.io/react/blog/2013/11/05/thinking-in-react.html#step-3-identify-the-minimal-but-complete-representation-of-ui-state
[r]: http://facebook.github.io/react/
[s]: http://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate
