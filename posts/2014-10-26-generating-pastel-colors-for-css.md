---
title: Generating pastel colors for css
---
I was using David Merfield's [randomColor][r] library to generate pastel colors
with the call `randomColor({ luminosity: 'light' })`. The colors generated
weren't pastel enough for my taste; some of them were too intense, so I wanted
to figure out what exactly is it about pastels that gives us that characteristic
soft and soothing feeling, and how I would generate such colors.

The first stop is obviously Wikipedia's article on [Pastel (color)][p]. It's
very informative right off the bat:

> Pastels or pastel colors are the family of colors which, when described in the
> HSV color space, have high value and low to intermediate saturation.

Great, now we just have to review our knowledge of the HSV color space. We
consult Wikipedia with their article on [HSL and HSV][h]. The cylindrical graph
of the HSV color space is enough to give you an intuitive sense of why a high
value and a low to intermediate saturation would afford a pastel color.

Awesome, well why don't we just set S = 25% and V = 100% and then randomly pick
an H value between 0° and 360° to generate a random pastel. My first idea was to
generate this HSV triplet and then convert it to RGB for CSS to understand.
While this works, it requires a nontrivial algorithm. It turns out CSS supports
declaring colors with `hsl()`, and the conversion from HSV to HSL is a lot
simpler.

In fact, I will just tell you that in HSV if S = 25% and V = 100%, then in HSL S
= 100% and L = 87.5%. You can double check with a conversion tool. Now we can
use a combination of javascript and css to generate pastels:

```javascript
var hue = Math.floor(Math.random() * 360);
var pastel = 'hsl(' + hue + ', 100%, 87.5%)';
$('div').css('background-color', pastel);
```

Look at these randomly generated babies:

<div id="pastels" style="display: -webkit-flex; -webkit-justify-content: space-between;">
  <script>
    var hue, pastel, i;
    var pastels = document.getElementById('pastels');
    for (i = 1; i <= 6; i++) {
      hue = Math.floor(Math.random() * 360);
      pastel = 'hsl(' + hue + ', 100%, 87.5%)';
      (function(pastel) {
        var div = document.createElement('div');
        div.style.backgroundColor = pastel;
        div.style.height = '100px';
        div.style.width = 'calc(100% / 6 - 5px)';
        div.style.display = 'inline-block';
        pastels.appendChild(div);
      })(pastel);
    }
  </script>
</div>

[h]: http://en.wikipedia.org/wiki/HSL_and_HSV
[p]: http://en.wikipedia.org/wiki/Pastel_(color)
[r]: https://github.com/davidmerfield/randomColor
