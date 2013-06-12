---
layout: post
title: 'jQuery toggleAttr() extension'
---
I wanted something similar to jQuery's `toggleClass()` function, but instead of toggling classes, it could be applied to a specified attribute. I was using Bootstrap's tooltip library and I needed to toggle the title attribute so that the tooltip message could change on each click. To do this, I extended jQuery and added a `toggleAttr()` function:

{% highlight javascript %}
$.fn.toggleAttr = function(attr, values) {
  return this.each(function () {
    var $this = $(this)
      , thisAttr = $this.attr(attr)

    if (thisAttr === values[0]) {
      $this.attr(attr, values[1])
    }
    else if (thisAttr === values[1]) {
      $this.attr(attr, values[0])
    }
  })
}
{% endhighlight %}

`toggleAttr()` expects a string for the `attr` parameter, and an array of two strings as `values`. If the attribute contains one of the two strings, the attribute will switch to the other one.

Going back to Bootstrap's tooltip, I had a link whose tooltip should toggle between 'show' and 'hide' when it is clicked, something like this:

{% highlight html %}
<a href="#" title="hide" class="toggle">toggle me</a>
{% endhighlight %}

I also wanted the tooltip to be updated with the new message after you click it, so here's how to do it:

{% highlight javascript %}
$('.toggle').click(function() {
  $(this).toggleAttr('data-original-title', ['hide', 'show']).tooltip('show')
})
{% endhighlight %}

Instead of the changing the `title` attribute, the `data-original-title` attribute must be changed since that's what Bootstrap's tooltip looks at. The `.tooltip('show')` is there to force the tooltip to display the updated information.
