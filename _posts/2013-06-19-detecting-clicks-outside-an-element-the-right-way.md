---
layout: post
title: Detecting clicks outside an element the right way
---
If you google on a method to detect clicks outside an element, the [top result on stackoverflow](http://stackoverflow.com/questions/152975/how-to-detect-a-click-outside-an-element) suggests binding a click handler on the `html` element that performs the desired action, and another click handler on the element itself that calls `event.stopPropagation()`.

```javascript
$('html').click(function() {
  // code to execute when clicked outside of #container
});

$('#container').click(function(event) {
  event.stopPropagation();
});
```

This works because of _event bubbling_, where clicking on an element calls its click handler, and then its parent's click handler, and then the parent's parent's click handler, and so on until the root (`html`) element's click handler is called, or until `event.stopPropagation()` is called anywhere in any click handlers on the way. So, the idea is that clicking anywhere outside of the element will eventually call `html`'s click handler, and clicking anywhere inside of the element will eventually run into an `event.stopProparagation()`.

Of course, the problem with this approach is that if other elements outside of `#container` also have click handlers that call `stopPropagation`, the `html` click handler will never be fired.

There is a better way. If you _do_ need to know that a click happened outside of the element under the above circumstance, the correct way to do this is to register a click handler on `document` in the _event capturing_ phase, and tell the handler to perform an action only if the target (clicked) element is not a child of the element for which you want to detects clicks outside.

The event capturing phase comes before the event bubbling phase and traverses the DOM in reverse order. We start at the root element and go down the DOM hierarchy until the target element is reached, triggering the event handlers (that were specified to be triggered during the event capturing phase) on each element on the way. This [blog post](http://37signals.com/svn/posts/3137-using-event-capturing-to-improve-basecamp-page-load-times) by Sam Stephenson has some of the best depictions of event bubbling and event capturing.

Adding an event handler that gets called in the event capturing case requires plain ol' javascript. JQuery does not provide a way to do this, probably because IE8 and below does not support event capturing. The code looks something like this:

```javascript
document.addEventListener('click', function(event) {
  if ($(event.target).closest('#container').length > 0) return;
  // code to execute when clicked outside of #container
}, true);
```

The third argument to `addEventListener` specifies whether the event handler should be called in the event capturing phase. The guard conditional checks whether `#container` is an ancestor of the clicked element, and do nothing if it is. If it isn't, then it must mean something was clicked outside of `#container` and the code will execute.
