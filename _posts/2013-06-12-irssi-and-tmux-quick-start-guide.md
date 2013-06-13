---
layout: post
title: Irssi and tmux quick start guide
---
Irssi is an IRC program for the terminal. The advantage of running IRC in a terminal is that you can connect from another computer to the host running irssi. In other words, if you run irssi on a server, you will have access to your conversations wherever you go, as long as you have access to an SSH client. The program that allows you to connect to the screen that displays irssi is called tmux, so the combination of the two can be powerful.

On a Mac with homebrew, installing irssi and tmux should be trivial. If you're on linux, your package manager will probably have irssi and tmux as well. Obviously tmux is not for Windows, so if that's all you have buy a VPS box. The official site for irssi is http://irssi.org/ and for tmux it is http://tmux.sourceforge.net/. If you are like me and just want to get started before having to read the official manuals and man pages, then just follow this simple quick start guide for the essentials.

Now the focus of this guide is to get irssi to connect to QuakeNet with automatic user authenticating and channel joining, along with benefits of tmux. You’d first want to start tmux by typing

    tmux

Before you start irssi, if you are logged in as root you should really create a new user and then type `su username` to switch to the new user. If you don’t know how to create a new user google it. The reason for using a non-root user is that QuakeNet will automatically kick you if you connect to their server as root. Now type

    irssi

and irssi should start up. To set up automatic user authentication on QuakeNet, type

    /network add quakenet -autosendcmd "/msg q@cserve.quakenet.org auth username password"

Obviously replace `username` and `password` with the appropriate values. To add a channel for auto joining, type

    /channel add -auto #channel quakenet [<password>]

where the square brackets denote an optional field. To see the channels that you have added type

    /channel list

If you messed up and need to remove your entry type

    /channel remove #channel quakenet

Now if you did everything right, typing

    /server quakenet

should connect to the QuakeNet server, authenticate with Q, and join the channels that you have just added. After you have connected, you would probably want to switch between windows that show different channels. To do that press

    Alt+#

where `#` is the number that corresponds to the window.

Finally, you can see how tmux works by opening up a new shell or terminal on your machine and typing

    tmux att

You should see a replica of the irssi window, and whatever you type instantly shows up on your other instance of tmux. That's it for the basics.

Pro tip: if you have a smart phone with ssh, you can connect to your tmux and irssi session. If your ssh client doesn't have the Page Up and Page Down keys, use Alt+P and Alt+N instead.
