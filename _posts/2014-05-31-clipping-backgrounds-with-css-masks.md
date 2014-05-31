---
layout: post
title: Clipping backgrounds using css masks
---
This article shows a css technique for clipping the background of a block element to expose the background behind it. The result looks something like this:

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

I am using the ness logo (the one on top of the page) to cut out the semi-transparent white background to expose the striped gray background underneath.

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

I will elaborate a bit on how this works. CSS masks work by specifying an image to use for the mask. An opaque pixel in the mask image will tell the browser to render the corresponding pixel of the element; a transparent pixel in the mask will have the opposite effect. We can see this effect by using a transparent to opaque striped image as the mask to our ness logo:

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

As you can see, the opaque (red) pixels of mask told the browser to render the corresponding pixels of the image, and the transparent pixels left those pixels of the image unrendered.

So to achieve what we made in the beginning of the article where we have a semi-transparent white background with the ness image cut out, the mask image has to look like it's opaque everywhere except the transparent cut out of the ness image in the center. In other words the mask image has to look something like this:

<div style="
  -webkit-mask-composite: xor;
  -webkit-mask-image: url(/images/ness.gif), -webkit-linear-gradient(red, red);
  -webkit-mask-position: center center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 48px 48px, auto;
  background: #849900;
  height: 160px;
  margin: 20px;
"></div>


To achieve that with just the ness image that we have, we use multiple mask images and then compose them into one. In the stylesheet, we specified two images to use as the mask, the first is the ness image and the second is just an image that is white (could be any opaque color) everywhere (achieved by using a gradient with only white color stops). The browser composes the final mask image by operating on the specified images from right to left.

We start with the all white image since that's the last image specified in `-webkit-mask-image`. Then we compose the ness image on top of the white image. But when the browser is composing ness, we specified `-webkit-mask-composite: xor` which tells the browser that overlapping pixels between the ness image and the white image become fully transparent if they are both fully opaque. That is how the transparent cut out of ness in the all white image is achieved.
