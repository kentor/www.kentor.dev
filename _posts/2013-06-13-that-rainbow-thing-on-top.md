---
layout: post
title: That rainbow thing on top
---
If you haven't noticed already, I'm a big fan of Ethan Schoonover's [solarized](http://ethanschoonover.com/solarized). To make this blog look a _little_ less boring, I wanted the eight solarized accent colors on top of the page. The accent colors being the ones at the bottom of this picture:

<p class="center">
  <img src="http://ethanschoonover.com/solarized/img/solarized-palette.png">
</p>

At first I used a div with eight child divs. The child divs were floated left with a width of 12.5% each. Each div had a background of one of the eight accent colors. It looked like this:

<div style="height: 4px;margin: 1.5em 0;">
  <div style="background: #b58900;float: left;height: 4px;width: 12.5%;"></div>
  <div style="background: #cb4b16;float: left;height: 4px;width: 12.5%;"></div>
  <div style="background: #dc322f;float: left;height: 4px;width: 12.5%;"></div>
  <div style="background: #d33682;float: left;height: 4px;width: 12.5%;"></div>
  <div style="background: #6c71c4;float: left;height: 4px;width: 12.5%;"></div>
  <div style="background: #268bd2;float: left;height: 4px;width: 12.5%;"></div>
  <div style="background: #2aa198;float: left;height: 4px;width: 12.5%;"></div>
  <div style="background: #859900;float: left;height: 4px;width: 12.5%;"></div>
</div>

I thought this was too much markup, so I figured I can achieve the same thing by setting the background image to an `8x1` bitmap with each color as one pixel, and forgo the eight child divs. The bitmap itself looks liked this:

<p class="center">
  <img src="data:image/bmp;base64,Qk1OAAAAAAAAADYAAAAoAAAACAAAAAEAAAABABgAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAIm1FkvLLzLcgjbTxHFs0oommKEqAJmF">
</p>

Now stretch it to fill the box:

<div style="background-image: url(data:image/bmp;base64,Qk1OAAAAAAAAADYAAAAoAAAACAAAAAEAAAABABgAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAIm1FkvLLzLcgjbTxHFs0oommKEqAJmF);background-size: 100% 4px;height: 4px;margin: 1.5em 0;"></div>

Wait what? It looks a bit different from the one above. Indeed the browser seems to have smoothed the transitions between each color stop. What's bizarre is that this effect only happens when the background height is greater than or equal to the box height. In otherwords if you have these rules:

{% highlight css %}
.colors {
  background-size: 100% 4px;
  height: 4px;
}
{% endhighlight %}

If the background height is less than the box height, i.e. `3px`:

{% highlight css %}
.colors {
  background-size: 100% 3px;
  height: 4px;
}
{% endhighlight %}

You get what you expect:

<div style="background-image: url(data:image/bmp;base64,Qk1OAAAAAAAAADYAAAAoAAAACAAAAAEAAAABABgAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAIm1FkvLLzLcgjbTxHFs0oommKEqAJmF);background-size: 100% 3px;height: 4px;margin: 1.5em 0;"></div>

Perhaps using a `2x1` white and black bitmap will show the effect more clearly. The Left is when the background height is equal to the box height, and the right is when the background height is less:

<div style="background-image: url(data:image/bmp;base64,Qk0+AAAAAAAAADYAAAAoAAAAAgAAAAEAAAABABgAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAAAA=);background-size: 100% 50px;height: 50px;display: inline-block;margin: 1.5em 0;width: 49%;"></div>
<div style="background-image: url(data:image/bmp;base64,Qk0+AAAAAAAAADYAAAAoAAAAAgAAAAEAAAABABgAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAAAA=);background-size: 100% 2px;height: 50px;display: inline-block;margin: 1.5em 0;width: 49%;float: right;"></div>

The question is why does this happen? And to that, I don't know. But I like it.

Note: apparently on iOS, all of the images shown look smoothed out. Oh well.
