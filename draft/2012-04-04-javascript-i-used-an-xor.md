---
layout: post
title: 'Javascript I used an xor'
---
I had some code that told me whether some content was visible and whether the little eye icon associated with it was opened or closed. I wanted the feature that if the content was visible and the eye icon was opened, then clicking on the little eye should hide the content. On the otherhand if the content was invisible and the eye icon was closed, then clicking on the little eye should make the content visible. My first attempt to do this was something like this

{% highlight javascript %}
var $this = $(this)
  , content = $('#note-content-' + $this.attr('data-note'))
  , visible = content.is(':visible')
  , eyeOpened = $this.find('i').attr('class').match(/open$/)

if ((visible && eyeOpened) || (!visible && !eyeOpened)) {
  content.toggle('fast')
}
{% endhighlight %}

But this felt clunky and I knew there was a more elegant way to handle this. And there was, using xor:

{% highlight javascript %}
var $this = $(this)
  , content = $('#note-content-' + $this.attr('data-note'))
  , eyeOpened = $this.find('i').attr('class').match(/open$/)

if (content.is(':visible') ^ !eyeOpened) {
  content.toggle('fast')
}
{% endhighlight %}

**Warning:** the `^` operator does some type coercion as demonstrated:

{% highlight javascript %}
> false ^ "true"
0
> "true" ^ null
0
{% endhighlight %}

This is because `false` is converted to the string `'false'`, and now we're xoring two truthy values, giving `0` as a result. In my case I am dealing with a boolean (the `content.is(':visible')`), and something not a boolean (the `eyeOpened`). However, since I have a `!` in front of `eyeOpened`, I am guaranteed to be xoring two booleans. If I had done something like this instead:

 {% highlight javascript %}
var $this = $(this)
  , content = $('#note-content-' + $this.attr('data-note'))
  , eyeClosed = $this.find('i').attr('class').match(/close$/)

if (content.is(':visible') ^ eyeClosed) {
  content.toggle('fast')
}
{% endhighlight %}

well something bad's going to happen.
