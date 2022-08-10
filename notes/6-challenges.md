[CHALLENGES](http://craftinginterpreters.com/parsing-expressions.html#challenges)

**Question**

In C, a block is a statement form that allows you to pack a series of statements where a single one is expected. The comma operator is an analogous syntax for expressions. A comma-separated series of expressions can be given where a single expression is expected (except inside a function call’s argument list). At runtime, the comma operator evaluates the left operand and discards the result. Then it evaluates and returns the right operand.

Add support for comma expressions. Give them the same precedence and associativity as in C. Write the grammar, and then implement the necessary parsing code.

**Answer**
The comma operator is a binary operator. 

>  It evaluates its first operand and discards the result, and then evaluates the second operand and returns this value. 

> A comma can only occur between two expressions – commas separate expressions.

It can not be used inside a function call's arguments list.

precedence in c: The comma operator has the lowest precedence of any C operator
associativity: left to right

Here is the whole language grammar with the comma operator added:

```
expression → literal
           | unary
           | binary
           | grouping ;

literal    → NUMBER | STRING | "true" | "false" | "nil" ;
grouping   → "(" expression ")" ;
unary      → ( "-" | "!" ) expression ;
binary     → expression operator expression ;
operator   → "," | "==" | "!=" | "<" | "<=" | ">" | ">="
           | "+"  | "-"  | "*" | "/" ;
```

---

**Question**

Likewise, add support for the C-style conditional or “ternary” operator ?:. What precedence level is allowed between the ? and :? Is the whole operator left-associative or right-associative?

**Answer**



---

**Question**

Add error productions to handle each binary operator appearing without a left-hand operand. In other words, detect a binary operator appearing at the beginning of an expression. Report that as an error, but also parse and discard a right-hand operand with the appropriate precedence.

**Answer**






