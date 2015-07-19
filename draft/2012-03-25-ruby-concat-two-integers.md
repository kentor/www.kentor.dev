---
layout: post
title: Ruby Concat Two Integers
---
Useless Benchmark.

I can think of two simple ways to concatenate two integers. One is to make a string out of the two numbers and convert it to an integer, and the other is to pad the first number with as many zeros as the number of digits of the second number, which requires using logs and exponentiations.

{% highlight ruby %}
require 'benchmark'

class Integer
  def string_concat(other)
    "#{self}#{other}".to_i
  end

  def digit_concat(other)
    self * 10 ** (Math.log10(other).floor + 1) + other
  end
end

n = 100_000

Benchmark.bmbm(15) do |x|
  x.report 'string_concat' do
    n.times { 123.string_concat(123) }
  end

  x.report 'digit_concat' do
    n.times { 123.digit_concat(123) }
  end
end

#                       user     system      total        real
# string_concat     0.070000   0.000000   0.070000 (  0.076194)
# digit_concat      0.100000   0.000000   0.100000 (  0.095069)
{% endhighlight %}

It seems that using the string method is faster.