---
layout: post
title: 'Ruby unshift vs push reverse!'
---
Stupid Benchmark

{% highlight ruby %}
require 'benchmark'

n = 100_000

Benchmark.bm(15) do |x|
  x.report 'unshift' do
    a = []
    n.times { |m| a.unshift(m) }
  end

  x.report 'push reverse!' do
    a = []
    n.times { |m| a << m }
    a.reverse!
  end
end

#                       user     system      total        real
# unshift           1.750000   0.000000   1.750000 (  1.752316)
# push reverse!     0.010000   0.000000   0.010000 (  0.011646)
{% endhighlight %}

`unshift` takes a lot longer because each unshift operation takes O(n) time, leading to an O(n^2) running time when done successively. `push` on the otherhand takes O(1) time each, followed by `reverse!` which takes O(n) time. To make this faster, Ruby could use a double ended dynamic array or an array deque.