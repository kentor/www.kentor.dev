---
title: Clipping backgrounds using css masks
---
This article shows a css technique for clipping the background of a block
element to expose the background underneath it. The result looks something like
this:

<style>
#container {
  background-image: repeating-linear-gradient(45deg, #aaa, #aaa 15px, #999 15px, #999 30px);
  height: 200px;
  padding: 20px;
}
#box {
  border: 1px solid #666;
  height: 100%;
  position: relative;
}
#box:before {
  -webkit-mask-composite: xor;
  -webkit-mask-image: url(/images/ness.gif), -webkit-linear-gradient(white, white);
  -webkit-mask-position: center center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 48px 48px, auto;
  background: rgba(255,255,255,0.90);
  bottom: 0;
  content: '';
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}
</style>

<div id="container">
  <div id="box">
  </div>
</div>

As you can see, I used the ness image (the little guy on top of the page) to cut
out the semi-transparent white background to expose the striped gray background
underneath.

The source for that is the following:

```html
<style>
#container {
  background-image: repeating-linear-gradient(45deg, #aaa, #aaa 25px, #999 25px, #999 50px);
  height: 200px;
  padding: 20px;
}
#box {
  border: 1px solid #666;
  height: 100%;
  position: relative;
}
#box:before {
  -webkit-mask-composite: xor;
  -webkit-mask-image: url(/images/ness.gif), -webkit-linear-gradient(white, white);
  -webkit-mask-position: center center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 48px 48px, auto;
  background: rgba(255,255,255,0.90);
  bottom: 0;
  content: '';
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}
</style>

<div id="container">
  <div id="box">
  </div>
</div>
```

Evidently, this effect is achieved by CSS masks which I shall elaborate. CSS
masks are specified by multiple css properties starting with `-webkit-mask-`,
the most important of which is the mask image specified by `-webkit-mask-image`.
An opaque pixel in the mask image tells the browser to render the corresponding
pixel of the element; a transparent pixel in the mask image has the opposite
effect. We can see this by using a transparent-to-opaque striped image as the
mask of our element with the ness image:

<div style="text-align: center">
  Image: <div style="display: inline-block; border: 1px solid black; vertical-align: middle;">
    <img src="/images/ness.gif" style="display: block">
  </div>
  Mask: <div style="display: inline-block; border: 1px solid black; vertical-align: middle;">
    <div style="display: block; width: 48px; height: 48px; background: repeating-linear-gradient(45deg, transparent, transparent 5px, red 5px, red 10px);"></div>
  </div>
  Result: <div style="display: inline-block; border: 1px solid black; vertical-align: middle;">
    <img src="/images/ness.gif" style="-webkit-mask-image: repeating-linear-gradient(45deg, transparent, transparent 5px, red 5px, red 10px); display: block;">
  </div>
</div>

As you can see, the pixels of the ness image are rendered only where the
corresponding pixel in the mask image is opaque (red).

So to achieve what we made in the beginning of the article, the mask image has
to look like it's opaque everywhere except the transparent cut out of the ness
image in the center. In other words the mask image has to look something like
this:

<div style="
  -webkit-mask-composite: xor;
  -webkit-mask-image: url(/images/ness.gif), -webkit-linear-gradient(red, red);
  -webkit-mask-position: center center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 48px 48px, auto;
  background: #dc322f;
  height: 160px;
  margin: 20px;
"></div>

Since we only have the single ness image to work with, which by itself isn't
enough to recreate the mask image above, we use multiple images and compose them
into one mask image. In the stylesheet, we specifiy two images to use as the
mask. The first is the ness image, and the second is an image that is opaque
everywhere (achieved by using a gradient with only red color stops).

The browser composes the final mask image by operating on those images right to
left. We start with the all red image since that's the rightmost image specified
in the `-webkit-mask-image` property. We then compose the ness image on top of
this red image, following the composition directive `xor` specified in the
`-webkit-mask-composite` property. The `xor` composition directive tells the
browser that overlapping pixels between the source (ness) image and the
destination (red) image become fully transparent if they are both fully opaque.
The browser will carve out the ness image from the red image, leaving us with
the desired image mask.
