# About

My notes and code from working through [Crafting Interpreters](http://craftinginterpreters.com).

Browse the original book and source code at https://github.com/munificent/craftinginterpreters.

My notes and answers to the challenges for each chapter are in the `notes` directory.

This branch implements Lox with Typescript / Deno. My previous attempt (on branch `java`) worked through a few chapters of a Java implementation.

## Requirements

- [Deno](https://deno.land)

## Getting started

- Run REPL: `deno task repl`
- Run file: `deno task lox [path to file]`

Examine `tasks` in `./deno.json.`, or run `deno task` to discover all available commands.

### Tools

There's a script in the tools dir which generates the repetitive code in `lox/Expr.ts`.

Run it with:

```
deno task gen-ast
```

### Create a binary

You can create a lox binary with:

```
deno task compile
```

Then run `dist/lox`.
