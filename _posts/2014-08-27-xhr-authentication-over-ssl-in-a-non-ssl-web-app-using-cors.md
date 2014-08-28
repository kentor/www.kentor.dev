---
layout: post
title: XHR authentication over SSL from a non SSL origin using CORS
---
You have a single page web app &mdash; built with Ember or whatever is hot these days &mdash; served over regular http but want your users to authenticate over https. You try an ajax post request to the authentication endpoint but is rejected by the browser's same-origin policy. A good way to get around this is by specifying the Cross-origin Resource Sharing (CORS) headers in the response of your auth endpoint. They will tell the browser to allow such a cross-origin request.

Let's say your web app is hosted on `http://example.com` and you want to do an ajax post to `https://example.com/auth`. The authentication endpoint has to specify that `http://example.com` is allowed to make that request by setting the value of the `Access-Control-Allow-Origin` header to either `http://example.com` or the wildcard `*`.

If you want to set cookies in the response, such as a remember me token, the endpoint also has to return a header named `Access-Control-Allow-Credentials` with the value `true`. However, this header will be ignored if the value of `Access-Control-Allow-Origin` is `*`. Not only that, the xhr request has to be made with the xhr flag `withCredentials: true`.

Putting it together, the code in a rails controller would look something like this:

```ruby
class SomeController < ApplicationController
  def auth
    response.headers['Access-Control-Allow-Origin'] = request.headers['Origin'] || ""
    response.headers['Access-Control-Allow-Credentials'] = 'true'

    ...
  end
end
```

and the xhr request using jQuery would look like this:

```javascript
$.ajax({
  url: 'https://example.com/auth',
  method: 'post',
  xhrFields: { withCredentials: true },
  dataType: 'json',
  data: {
    email: self.get('email'),
    password: self.get('password'),
    authenticity_token: $('meta[name=csrf-token]').attr('content')
  }
}).then(function(response) { ... });
```

Read more on CORS on the [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) website.
