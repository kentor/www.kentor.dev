---
layout: post
title: 'Rubinius Hash Implementation'
---
I decided to have some fun with the Rubinius [implementation](https://github.com/rubinius/rubinius/blob/master/kernel/common/hash19.rb) of the Ruby 1.9 Hash table. The Ruby 1.9 Hash table maintains order of insertion by making each entry a node of a doubly linked list. By keeping the head and tail of the list and adding to the tail on insertions, the order of insertion is preserved. Very clever.

Digging in the Rubinius code, I found that the hash table starts out with 16 buckets, and once the load factor reaches 0.75, the number of buckets is doubled. Thus, the number of buckets is always a power of 2.

Now let's look at the compression function. To calculate the bucket from a hash code, Rubinius uses

{% highlight ruby %}
# Calculates the +@entries+ slot given a key_hash value.
def key_index(key_hash)
  key_hash & @mask
end
{% endhighlight %}

I expected a modulo operator in the compression function to map each hash code to a bucket in the range (0...num_buckets). So why a bitwise &? Well it turns out that `@mask` is defined as

{% highlight ruby %}
@mask = @capacity - 1
{% endhighlight %}

where `@capacity` starts out as 16 and doubles from there. Then it made sense. `@mask` is one less than a power of 2 number, so all of its bits are 1. Therefore, the following is equivalent

{% highlight ruby %}
key_hash & @mask == key_hash % @capacity
{% endhighlight %}

Of course, the bitwise & would be faster than the modulo operator.

Then I wondered, isn't this a bad compression function? If your application happens to have hash codes that are all even, then only half of the buckets would ever be used. In an elementary CS course, I was told that either the number of buckets should be a prime number, or the compression function need to have some prime number in there.

I believe the Ruby hash implementation uses a list of prime numbers for the bucket sizes. This information can be found in [st.c](https://github.com/ruby/ruby/blob/trunk/st.c). The number of buckets starts with 11, then 19, then it follows a table:

{% highlight c %}
static const unsigned int primes[] = {
  ST_DEFAULT_INIT_TABLE_SIZE,
  ST_DEFAULT_SECOND_TABLE_SIZE,
  32 + 5,
  64 + 3,
  128 + 3,
  256 + 27,
  512 + 9,
  1024 + 9,
  2048 + 5,
  4096 + 3,
  8192 + 27,
  16384 + 43,
  32768 + 3,
  65536 + 45,
  131072 + 29,
  262144 + 3,
  524288 + 21,
  1048576 + 7,
  2097152 + 17,
  4194304 + 15,
  8388608 + 9,
  16777216 + 43,
  33554432 + 35,
  67108864 + 15,
  134217728 + 29,
  268435456 + 3,
  536870912 + 11,
  1073741824 + 85,
  0
};
{% endhighlight %}

Perhaps in real applications the hash codes are fairly random which is a requirement for a good distribution of the keys. I'm not sure yet.
