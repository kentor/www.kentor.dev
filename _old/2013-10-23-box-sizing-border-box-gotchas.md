---
layout: post
title: "* { box-sizing: border-box } gotchas"
---
I like having `border-box` as the default `box-sizing` in my projects. If I want a box to be `200px` in width, then it better be `200px` after I add `5px` of border or `20px` of padding. If you like `border-box` as well, I want to share with you some of the gotchas I've come across.

#### Vertically centering an inline element using line-height
A common trick to vertically center a one line inline element is to specify its line-height to be that of its container's height, like so:

```html
<div style="border: 5px solid; height: 50px; box-sizing: content-box">
  <span style="line-height: 50px">This is vertically centered.</span>
</div>
```

This will produce:

<div style="border: 5px solid; height: 50px; box-sizing: content-box">
  <span style="line-height: 50px">This is vertically centered.</span>
</div>

However, this trick only works with `box-sizing: content-box`. With `box-sizing: border-box`, the height of the content of the box will be `40px` to accomodate the `10px` of border on top and bottom. This will throw off the vertical centering if we keep the line-height of the inline element at `50px`:

<div style="border: 5px solid; height: 50px; box-sizing: border-box">
  <span style="line-height: 50px">This is no longer vertically centered.</span>
</div>

Of course we can set line-height to `40px`, but doing so would be what we were trying to avoid in the first place with `border-box`. However, this may be the only viable solution sans specifying `content-box` for the specific element.
