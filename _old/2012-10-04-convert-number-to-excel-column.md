---
layout: post
title: 'Convert number to excel columns'
---
This (interview) question is to create a function that maps integers to excel columns. For example:

    1 => A, 2 => B, ..., 26 => Z, 27 => AA, 28 => AB, ..., 52 => AZ, 53 => BA, ..., 703 => AAA

The problem is tricky because once you start thinking in terms of base 26, you're going to find out it doesn't do the mapping correctly (I've been there). You're tempted to think okay if I let

    0 => A, 1 => B, ..., 25 => Z

like in base 26, then I'd just have to subtract the input number by 1 and use this mapping to get the output. But that doesn't work for the input `27` since that would map to `BA (26 = 1*26 + 0)`. Indeed, you can't even get `AA` using this scheme in a sane manner. This is because the conversion isn't really base 26. Perhaps rewriting the input numbers makes it clearer:

     1            1     A
     2            2     B
    26           26     Z
    27    1*26 +  1    AA
    28    1*26 +  2    AB
    52    1*26 + 26    AZ

This should make it clear that the coefficient in front of the powers of 26 should be mapped to the letters. But take a look at `52`. Instead of `2*26 + 0` it's `1*26 + 26`. That's why it's not base 26. Once you see this pattern, the implementation should be straight forward. Here it is in ruby.

{% highlight ruby %}
class Integer
  def to_excel
    return if self <= 0

    q = self
    result = ""

    begin
      q, r = (q - 1) / 26, q % 26
      r = 26 if r == 0
      result << (r - 1 + "A".ord).chr # maps 1 => A ... 26 => Z
    end until q == 0

    result.reverse!
  end
end
{% endhighlight %}

I am pushing to the string then reversing because it is faster than adding letters to the beginning of the string. See my post on unshift vs push reverse.
