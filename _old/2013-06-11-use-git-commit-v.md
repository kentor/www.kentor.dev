---
layout: post
title: Use git commit -v
---
You should use `git commit -v`. The `-v` (verbose) flag shows the diff at the bottom of the commit message template. With the diff in the template, you can use your editor's autocompletion capabilities when referencing variables and filenames. Not only does this prevent spelling errors but this saves keystrokes as well!

With the git plugin for oh-my-zsh, `gc` is aliased to `git commit -v` by default.
