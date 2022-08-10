# About

My notes and code from working through [Crafting Interpreters](http://craftinginterpreters.com).

Browse the original book and source code at https://github.com/munificent/craftinginterpreters.

My notes and answers to the challenges for each chapter are in the `notes` directory.

This branch implements Lox with Typescript / Deno. My previous attempt (on branch `java`) worked through a few chapters of a Java implementation.

## Requirements

- [Deno](https://deno.land)

## Getting started

- Run REPL: `deno run main.ts`
- Run file: `deno run --allow-read main.ts [path to file]`

### Create a binary

You can create a lox binary with:

```
deno compile --allow-read --output dist/lox main.ts
```

Then run `dist/lox`.
