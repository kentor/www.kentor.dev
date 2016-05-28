---
title: Detecting clicks outside an element the right way
---
If you google for “how to detect clicks outside of an element,” you’ll find that
the [top result on stackoverflow][s] suggests binding a click handler on the
`html` element that should perform the desired action, and another click handler
on the element itself that calls `event.stopPropagation()`.

```javascript
$('html').click(function() {
  // code to execute when clicked outside of #container
});

$('#container').click(function(event) {
  event.stopPropagation();
});
```

This works because of _event bubbling_, where clicking on an element will call
its click handlers, and then its parent’s click handlers, and then its
grandparent’s click handlers, and so on until the root (`html`) element’s click
handlers are called, or until `event.stopPropagation()` is called in a click
handler on the way up, whichever occurs first. So, the idea is that clicking
anywhere outside of the element will eventually call the click handler on
`html`, and clicking anywhere inside of the element will eventually run into an
`event.stopProparagation()`.

The problem with this approach is that if other elements outside of `#container`
also have click handlers that call `stopPropagation()`, the `html` click handler
will never be called, and this is just a straight up bug.

A more robust way to detect clicks outside of an element is to register a click
handler on `document` for the _event capturing_ phase, and tell the handler to
perform an action only if the target (clicked) element is not a child of the
element for which you want to detect clicks outside.

The event capturing phase comes before the event bubbling phase and traverses
the DOM in reverse order. We start at the root element and go down the DOM
hierarchy until the target element is reached, triggering the click handlers
(that were specified to be triggered during the event capturing phase) on each
element on the way. This [blog post][b] by Sam Stephenson has some of the best
depictions of event bubbling and event capturing.

Adding an event handler that gets called in the event capturing case requires
plain ol' javascript. JQuery does not provide a way to do this, probably because
IE8 and below do not support event capturing. The code looks something like
this:

```javascript
document.addEventListener('click', function(e) {
  if (!document.getElementById('container').contains(e.target)) {
    // code to execute when clicked outside of #container
  }
}, true);
```

The third argument to `addEventListener` specifies whether the event handler
should be called during the event capturing phase. The guard conditional checks
whether `#container` is an ancestor of the clicked element, and do nothing if it
is. If it isn’t, then it means something was clicked outside of `#container` and
the code will execute.

[b]: http://37signals.com/svn/posts/3137-using-event-capturing-to-improve-basecamp-page-load-times
[s]: http://stackoverflow.com/questions/152975/how-to-detect-a-click-outside-an-element
