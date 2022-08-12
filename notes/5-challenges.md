CHALLENGES

**Question**

Earlier, I said that the |, *, and + forms we added to our grammar metasyntax were just syntactic sugar. Given this grammar:

```
expr → expr ( "(" ( expr ( "," expr )* )? ")" | "." IDENTIFIER )*
     | IDENTIFIER
     | NUMBER
```

Produce a grammar that matches the same language but does not use any of that notational sugar.

Bonus: What kind of expression does this bit of grammar encode?

**Answer**

Here's my attempt at this.

```
expr  -> expr
expr  -> expr fnArgsOrProp
expr  -> IDENTIFIER
expr  -> NUMBER

fnArgsOrProp -> fnArgs
fnArgsOrProp -> property
fnArgsOrProp -> fnArgs fnArgsOrProp
fnArgsOrProp -> property fnArgsOrProp

fnArgs -> "(" ")"
fnArgs -> "(" expr ")"
fnArgs -> "(" expr commaExpr ")"

commaExpr -> "," expr
commaExpr -> "," expr commaExpr

property ->  "." IDENTIFIER
```

The following lines can be described by this grammar:

```
expr(expr)
expr(expr)(expr)
expr(expr)(expr).IDENTIFIER
expr(expr, expr, expr)(expr).IDENTIFIER
expr(expr).IDENTIFIER
expr.IDENTIFIER
expr.IDENTIFIER.IDENTIFIER
IDENTIFIER
NUMBER
```

I'm not sure what this is describing. Half looks like function parameters, and half looks like object properties. Maybe it's related to classes?

---

**Question**

The Visitor pattern lets you emulate the functional style in an object-oriented language. Devise a corresponding pattern in a functional language. It should let you bundle all of the operations on one type together and let you define new types easily.

(SML or Haskell would be ideal for this exercise, but Scheme or another Lisp works as well.)

**Answer**

TODO: come back to this challenge

---

**Question**

In Reverse Polish Notation (RPN), the operands to an arithmetic operator are both placed before the operator, so 1 + 2 becomes 1 2 +. Evaluation proceeds from left to right. Numbers are pushed onto an implicit stack. An arithmetic operator pops the top two numbers, performs the operation, and pushes the result. Thus, this:

(1 + 2) * (4 - 3)
in RPN becomes:

1 2 + 4 3 - *
Define a visitor class for our syntax tree classes that takes an expression, converts it to RPN, and returns the resulting string.

**Answer**

[See ReversePolishPrinter.java](com/tekniskt/lox/ReversePolishPrinter.java). This is a copied and modified version of `AstPrinter`.

This feels a bit hacky but it works (tm). How it works:

- `visitGroupingExpr` now passes an empty name `""` to parenthesize, as we don't want to show any string for groups.
- the `for` loop in parenthesize has a check to skip spaces after our (now blank) grouping strings: `if (name != "") builder.append(" ");`

That's it!
