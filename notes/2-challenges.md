CHALLENGES

**Pick an open source implementation of a language you like. Download the source code and poke around in it. Try to find the code that implements the scanner and parser. Are they hand-written, or generated using tools like Lex and Yacc? (.l or .y files usually imply the latter.)**

Hmm... What about CSS? I have read a bit about the work on Servo in Firefox. Digging in Firefox source I found the [ServoCSSParser.cpp](https://dxr.mozilla.org/mozilla-central/source/layout/style/ServoCSSParser.cpp) (and a matching .h file). Though there's not much in there.

---

**Just-in-time compilation tends to be the fastest way to implement a dynamically-typed language, but not all of them use it. What reasons are there to not JIT?**

JIT's are more complex than ahead of time (AOT) compilers. In this chapter they're described as "a challenging scramble best reserved for experts".

---

**Most Lisp implementations that compile to C also contain an interpreter that lets them execute Lisp code on the fly as well. Why?**

I don't know. I read a nice article about the history of Lisp. https://twobithistory.org/2018/10/14/lisp.html

If I were to guess (I'm going to guess) I'd say it's something to do with fast feedback cycles? or the self-modifying nature of lisps (are lisps self-modifying? is that what macros are all about?).

Something to do with macros? (what are macros?)

To read later - [The Roots of Lisp](http://languagelog.ldc.upenn.edu/myl/llog/jmc.pdf)
