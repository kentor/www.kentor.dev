---
layout: post
title: 'Ruby Integer#to_proc'
---
Bored...

{% highlight ruby %}
class Integer
  def to_proc
    m = to_s.chars.each_slice(3).map { |a| a.join.to_i.chr }.join
    proc { |obj| obj.send(m) }
  end
end

puts "hello world".instance_eval(&117112099097115101)

# => HELLO WORLD
{% endhighlight %}