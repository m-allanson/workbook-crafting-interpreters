CHALLENGES

**The lexical grammars of Python and Haskell are not regular. What does that mean, and why aren’t they?**

I went down a bit of a rabbit hole here. It's a big topic and I only touched the surface. These videos were good https://www.youtube.com/watch?v=5KxKunC0Nx8.

For further reading see the [Chomsky hierarchy](https://en.wikipedia.org/wiki/Chomsky_hierarchy). A regular grammar is used to generate a regular language. This is a type 3 grammar in the Chomsky hierarchy. A regular language can be describe with a finite state machine. A finite state machine can recognise only one state at a time.

I assume the grammars for Python and Haskell are complex enough that they can not be described with a Type 3 (regular) grammar.

Aha. Here is a clear explanation from [the computer science Stack Exchange](https://cs.stackexchange.com/questions/77989/is-python-a-context-free-language):

> Context-free grammars cannot express the rules of INDENT/DEDENT and so Python (which we use today in practice with INDENTs/DEDENTs)is not pure CF. Parsers (or lexical analyzers or lexers) for these languages use additional techniques to handle those structures. For example keep track of indentation levels, or tokenizer (scanners) may count number whitespaces and store that info in a table for later use. 

Python's treatment of whitespace means it can only be described by a more complex grammar. If Python cannot be described with a context-free grammar, it also cannot be described with a regular grammar. Refer back to the Chomsky hierarchy for more details on that.

---

**Aside from separating tokens—distinguishing print foo from printfoo—spaces aren’t used for much in most languages. However, in a couple of dark corners, a space does affect how code is parsed in CoffeeScript, Ruby, and the C preprocessor. Where and what effect does it have in each of those languages?**

### Whitespace in CoffeeScript. 

Objects can be defined with indentation. e.g.

```
kids =
  brother:
    name: "Max"
    age:  11
  sister:
    name: "Ida"
    age:  9
```

Multi-line conditionals use indentation. e.g.

```
mood = greatlyImproved if singing

if happy and knowsIt
  clapsHands()
  chaChaCha()
else
  showIt()

date = if friday then sue else jill
```

_Literate CoffeeScript_ relys on code blocks having consistent indentation relative to each other.

### Whitespace in Ruby

Examples [where whitespace is significant](http://xahlee.info/comp/whitespace_in_programing_language.html).

```ruby
# -*- coding: utf-8 -*-
# whitespace issues in Ruby

aa = 3 +
4

bb = 3
+ 4

p aa # 7
p bb # 3
```

```ruby
# -*- coding: utf-8 -*-
# whitespace issues in Ruby

def f(x) x*2 end

p f(3+2)+1    # 11
p f (3+2)+1   # 12
```

## Whitespace in the C preprocessor

This could be from the _token pasting_ operator. This operator allows two tokens to be combined into a single token. However, if the two tokens do not create a valid single token, they will be left as two tokens. In this case the spacing between the two tokens is undefined behaviour. 

A [description of this operator](https://complete-concrete-concise.com/programming/c/preprocessor-the-token-pasting-operator/):

>The token pasting (##) operator simply eliminates any white space around it and concatenates (joins together) the non-whitespace characters together. It can only be used in a macro definition. It is used to create new tokens.

Aha. I also found [this SO answer](https://softwareengineering.stackexchange.com/questions/309389/what-is-the-origin-of-the-c-preprocessor). Which says the C preprocessor has:

> syntactically significant whitespace (end of line terminates a statement, gap after the macro determines the start of the replacement list)

---

**Our scanner here, like most, discards comments and whitespace since those aren’t needed by the parser. Why might you want to write a scanner that does not discard those? What would it be useful for?**

If you want to create a Concrete Syntax Tree, then you would want to retain whitespace and comments. This would be useful for tools that reformat code. e.g. prettier.

---


**Add support to Lox’s scanner for C-style `/* ... */` block comments. Make sure to handle newlines in them. Consider allowing them to nest. Is adding support for nesting more work than you expected? Why?**

It took me longer to figure out the specifics of the `scanningComment` flag than it did to add arbitrary depth handling. Nesting support was fine. I swapped the `scanningComment` bool to a `commentDepth` counter. 