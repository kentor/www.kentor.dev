---
layout: post
title: 'Ruby Class Hierarchy'
---
I was reading about Ruby's object model from [article][1], but I wanted a picture with the BasicObject class, and I was also suspicious of the correctness of the class pointers.

I've modified the C extension provided on that page so that it would work in Ruby 1.9. In addition, I've made it so that `#real_super` and `#real_class` may take an integer argument so that it can follow the super and class pointers successively.

To use the C extension, make a file called `real.c` with this code:


{% highlight cpp %}
#include "ruby.h"

static VALUE
real_super(int argc, VALUE *argv, VALUE klass)
{
    VALUE nv;
    long n;

    if (argc == 0)
        return RCLASS_SUPER(klass);

    rb_scan_args(argc, argv, "01", &nv);
    n = NUM2LONG(nv);

    if (n <= 0)
        return klass;

    while (n--) {
        klass = RCLASS_SUPER(klass);

        if (!RTEST(klass))
            return Qfalse;
    }

    return klass;
}

static VALUE
real_class(int argc, VALUE *argv, VALUE klass)
{
    VALUE nv;
    long n;

    if (argc == 0)
        return RBASIC(klass)->klass;

    rb_scan_args(argc, argv, "01", &nv);
    n = NUM2LONG(nv);

    if (n <= 0)
        return klass;

    while (n--) {
        klass = RBASIC(klass)->klass;

        if (!RTEST(klass))
            return Qfalse;
    }

    return klass;
}

void
Init_real()
{
    rb_define_method(rb_mKernel, "real_super", real_super, -1);
    rb_define_method(rb_mKernel, "real_class", real_class, -1);
    rb_define_method(rb_cBasicObject, "real_class", real_class, -1);
}
{% endhighlight %}

Then make a file called `extconf.rb` with

{% highlight ruby %}
require 'mkmf'
extension_name = 'real'
dir_config(extension_name)
create_makefile(extension_name)
{% endhighlight %}

Run `ruby extconf.rb`, then run `make`. This should compile the C code. To test this out, run `irb` and `require './real'` while in the same directory. Let's play with it:

{% highlight ruby %}
>> require './real'
=> true
>> Object.real_class
=> #<Class:Object>
>> Object.real_super
=> #<Kernel:0x9119bf4>
>> Object.real_super.real_class
=> Kernel
{% endhighlight %}

So it seems like Object's super pointer points to an include class of Kernel. The include class' class points to the real Kernel module.

Let's see how many metaclasses there are when we run a ruby process:

{% highlight ruby %}
>> Object.real_class
=> #<Class:Object>
>> Object.real_class(2)
=> #<Class:#<Class:Object>>
>> Object.real_class(3)
=> #<Class:#<Class:#<Class:Object>>>
>> Object.real_class(4)
=> #<Class:#<Class:#<Class:Class>>>
>> _.real_class
=> #<Class:#<Class:#<Class:Class>>>
{% endhighlight %}

Okay for some reason Object has meta^3 classes. The last meta class' class pointer points to meta^3 class of Class. In fact, BasicObject, Module, and Class all have meta^3 classes before their class pointers point back to `#<Class:#<Class:#<Class:Class>>>`, and then its class pointer points to itself. If you play with this, you'll find out that successively calling `#real_class` on any class will land you in `#<Class:#<Class:#<Class:Class>>>`.

{% highlight ruby %}
>> BasicObject.real_class(1337)
=> #<Class:#<Class:#<Class:Class>>>
{% endhighlight %}

Let's look at super pointers:

{% highlight ruby %}
>> Class.real_class
=> #<Class:Class>
>> _.real_super
=> #<Class:Module>
>> _.real_super
=> #<Class:Object>
>> _.real_super
=> #<Class:BasicObject>
>> _.real_super
=> Class
>> _.real_super
=> Module
>> _.real_super
=> Object
>> _.real_super
=> #<Kernel:0x9119bf4>
>> _.real_super
=> BasicObject
>> _.real_super
=> false
{% endhighlight %}

From this we see that BasicObject indeed has no super class. We can also see that the superclass of the metaclass of BasicObject is Class. This suggests that the superclass of the meta^(n) class of BasicObject is the meta^(n-1) class of Class. Indeed that's true:

{% highlight ruby %}
>> BasicObject.real_class(1).real_super == Class.real_class(0)
=> true
>> BasicObject.real_class(2).real_super == Class.real_class(1)
=> true
>> BasicObject.real_class(3).real_super == Class.real_class(2)
=> true
{% endhighlight %}

This ensures that we always end up in BasicObject when we look at super pointers, no matter what. Check this out

{% highlight ruby %}
>> Class.real_class(3).real_super(16)
=> BasicObject
{% endhighlight %}

The Kernel module is interesting as well:

{% highlight ruby %}
>> Kernel.real_super
=> false
>> Kernel.real_class
=> #<Class:Kernel>
>> Kernel.real_class.real_super
=> Module
>> Kernel.real_class(2)
=> #<Class:Module>
{% endhighlight %}

Kernel's super pointer points to nothing. Kernel has its metaclass of course. But this metaclass super pointer points to Module, and its class pointer points to the metaclass of Module.

I am too lazy to draw a diagram of this...

[1]: http://www.hokstad.com/ruby-object-model.html
