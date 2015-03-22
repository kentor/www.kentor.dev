---
layout: post
title: Immutable data structures are awesome
---
I was playing around with [React](http://facebook.github.io/react/), [Reflux](https://github.com/spoike/refluxjs) and facebook's [Immutable](http://facebook.github.io/immutable-js/) data collections library, and discovered one reason why immutable data structures are awesome.

In Reflux, Stores emit change events for React components to listen. Usually a component registers a callback with a Store to update its state with the Store's updated data so it can rerender its UI with the new data.

Consider this block of code where `NoteStore` has emitted hundreds of change events, thereby triggering the callback hundreds of times in succession:

```javascript
this.listenTo(NoteStore, function() {
  var notes = NoteStore.getAll();
  if (this.state.notes !== notes) {
    this.setState({ notes: notes });
  }
}.bind(this));
```

In React, `setState()` is the method that triggers the virtual dom diffing and updating of the UI. Here we test whether `notes` has changed before calling `setState()` because virtual dom diffing, even when the underlying data haven't changed, is not free, especially when it happens hundreds of times in succession. Performing hundreds of diffs will, in fact, introduce a noticeable freeze in the UI.

Here's the thing though, this block of code only makes sense if `notes` is an immutable list with immutable consituents. Consider the contrary: if notes pointed to a mutable list, how can we know for sure that no object has been added, removed, or changed from the list? Of course it's possible, but it's not trivial. If we don't do some manual book keeping, in the worst case we'd have to compare every property of every object in the list with its previous values.

This is where immutable data structures shine. If we start with an immutable object and perform a no-op change, then the change operation returns the identical object, otherwise it returns a different object. We can be _sure_ that two immutables haven't changed if they are `==`. We don't have to do any manual book keeping or deep comparisons which leaves us with very understandable, maintainable, and reasonable code.
