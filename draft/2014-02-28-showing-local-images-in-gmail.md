---
title: Showing local images in Gmail
---
Gmail has been serving images through their secure proxy servers as a way to
enhance the end user’s experience ([blog][b]). No longer is the end user
required to click the "display images below" link again.

However, this change has made it harder for developers to test the emails that
they’re sending out because Gmail’s proxy server wouldn’t be able to reach their
local network, so local images won’t show up in emails anymore. Thankfully,
Gmail has left the original image source url in the url of the proxied image, so
a script can be used to replace all proxied image sources to the original.
Here’s such a script in the form of a bookmarklet:

```javascript
javascript:(function(){[].forEach.call(document.querySelectorAll('img[src*="googleusercontent.com/proxy"]'),function(img){img.src=img.src.replace(/^.*?#/,'')})}())
```

This script takes all `<img>` tags whose `src` attribute contains
`googleusercontent.com/proxy` and removes everything before the `#` symbol in
the src which leaves the image pointing to the original image.

[b]: http://gmailblog.blogspot.com/2013/12/images-now-showing.html
