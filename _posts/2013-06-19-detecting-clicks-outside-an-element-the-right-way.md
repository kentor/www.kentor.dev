---
layout: post
title: Detecting clicks outside an element the right way
---
If you google how to detect clicks outside an element, the [top result on stackoverflow](http://stackoverflow.com/questions/152975/how-to-detect-a-click-outside-an-element) suggests binding a click handler on the `html` element and another click handler on the element itself where it calls `event.stopPropagation()`.

```javascript
$('html').click(function() {
  // code to execute when clicked outside of #container
});

$('#container').click(function(event) {
  event.stopPropagation();
});
```

This works because of _event bubbling_, where clicking on an element will call its click handler, and then its parent's click handlers, and so on until we reach the root element (`<html>`) or until `stopPropagation` is called.

The problem with this approach is that if other elements outside of `#container` also have click handlers that call `stopPropagation`, the `html` click handler will never be fired.

If you _do_ need to know that a click happened outside of the element under the above circumstance, the correct way to do this is to register a click handler on the document in the _event capturing_ phase.

The event capturing phase comes before the event bubbling phase and traverses the DOM in reverse order. We start at the root element and go down the DOM hierarchy until the target element is reached, triggering the event handler on each element on the way. This [blog post](http://37signals.com/svn/posts/3137-using-event-capturing-to-improve-basecamp-page-load-times) by Sam Stephenson has some of the best depictions of event bubbling and event capturing.

Because IE8 and below does not support event capturing, jQuery chose not to support it as well, so we have to use plain old javascript for registering the event handler:

```javascript
document.addEventListener('click', function(event) {
  if ($(event.target).closest('#container').length > 0) return;
  // code to execute when clicked outside of #container
}, true);
```

The third argument to `addEventListener` tells the browser to fire this event in the event capturing phase. The guard clause checks whether `#container` is an ancestor of the clicked element, and do nothing if it is. If it isn't, then that must mean the click happened somewhere outside of `#container`.
