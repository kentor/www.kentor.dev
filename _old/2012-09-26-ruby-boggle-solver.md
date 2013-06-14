---
layout: post
title: 'Ruby Boggle Solver'
---
I was looking up solutions to the boggle solver and found this [thread](http://stackoverflow.com/questions/746082/how-to-find-list-of-possible-words-from-a-letter-matrix-boggle-solver) on stackoverflow. Unsurprisingly, there were solutions in Perl, PHP, and Python, but not Ruby. So I've decided to write one up for Ruby.

A boggle solver should write out the words from a dictionary that can be formed from the boggle board. There are two approaches to this. The first is to loop through each cell of the boggle board and attempt to build up a word by hopping to adjacent cells. After all, you can imagine this is how a human would do it. What a human wouldn't do is grab a dictionary, go through each word in it, and see if that word is in the board.

However, I believe the latter approach is computationally faster and much easier to program since it doesn't involve using Tries and such. One thing that makes this approach fast is the rejection of words that can't possibly be in the board because the word contains a letter that the board does not. This filtering can be done quickly and easily with a regex match.

If a word *is* possibly in the board, then we do the search algorithm. The algorithm is simple: find a starting position on the board using the first letter of the word and mark that position as used. From there check if the board has the next letter that is one square away from the current letter and which hasn't been used. Then just recurse on the next letter. You fail when the next letter can't be found in an unused adjacent square, and you succeed when you get to the last letter.

Here is the implementation in Ruby:

{% highlight ruby %}
class Boggle
  require 'set'

  attr_reader :words

  def initialize(str, dict = '/usr/share/dict/words')
    @str = str.dup
    @dict = dict

    @side = Math.sqrt(@str.length).round

    raise 'Invalid Board' unless @side ** 2 == @str.length

    @positions = Hash.new { |h,k| h[k] = [] }
    @str.each_char.with_index do |c, i|
      @positions[c] << [i / @side, i % @side]
    end

    @possible = Regexp.new("^[#{@positions.keys.join}]{3,#{@str.length}}$")

    @seen ||= Set.new
  end

  def solve
    if !@words
      @words = []
      File.new(@dict, 'r').each_line do |word|
        word.chomp!
        @words << word if has_word?(word)
      end
    end

    self
  end

  private

  def has_word?(word)
    return false unless word =~ @possible

    @positions[word[0]].each do |x, y|
      return true if find(word, x, y)
    end

    false
  end

  def find(word, x, y, idx = 1, seen = @seen.clear)
    return true if idx == word.length

    seen << coord = x * @side + y

    @positions[word[idx]].each do |i, j|
      if (x-i).abs <= 1 && (y-j).abs <= 1 && !seen.include?(i * @side + j)
        return true if find(word, i, j, idx + 1, seen)
      end
    end

    seen.delete(coord)

    false
  end
end

require 'pp'
pp Boggle.new('fxieamloewbxastu').solve.words.group_by(&:length)
{% endhighlight %}

The last line prints out the words grouped by length.

This 4x4 grid runs under a second on a 512 linode:

    real    0m0.768s
    user    0m0.744s
    sys     0m0.016s
