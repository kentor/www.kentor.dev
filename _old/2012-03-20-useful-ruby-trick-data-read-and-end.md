---
layout: post
title: 'Useful Ruby Trick: DATA.read and __END__'
---
Ruby has the concept of storing data at the end of a ruby source code. When Ruby sees `__END__` in a file, it will tell the interpreter to stop at that line, so you can put anything after it. It's widely known that Sinatra uses the `__END__` construct for inline layouts. When `__END__` is used, the constant `DATA` is created which points to the source code file. You can call the `.read` method on `DATA`, which will return everything after the `__END__` as a string.

What's cool is that Ruby actually uses this technique in its [Set](https://github.com/ruby/ruby/blob/trunk/lib/set.rb) standard library. The source code has the lines

{% highlight ruby %}
if $0 == __FILE__
  eval DATA.read, nil, $0, __LINE__+4
end

__END__

require 'test/unit'
{% endhighlight %}

The global variable `$0` is the name of the file that is ran at the command line, and `__FILE__` is the name of the file of the source code, in this case `set.rb`. This piece of code says if you run `ruby set.rb` in the command line, it will evaluate everything after `__END__` as ruby code. Cleverly, everything after `__END__` is unit tests. So running `ruby set.rb` will actually test the Set class. This technique is very reminiscent of running the main method of some Java library class to test it.

What sucks is that everything after `__END__` has plain text (or comment) syntax highlighting in most editors, so it's not very pleasant to write ruby code.

Instead of using `eval`, you could just do this

{% highlight ruby %}
if $0 == __FILE__
  require 'test/unit'

  # test code
end
{% endhighlight %}

Then you would have syntax highlighting, but everything would be indented.