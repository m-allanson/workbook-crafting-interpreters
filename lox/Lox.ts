import { readLines } from "https://deno.land/std@0.151.0/io/mod.ts";

import { Expr } from "./Expr.ts";
import { print, printErr } from "./util.ts";
import Parser from "./Parser.ts";
import Scanner from "./Scanner.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";
import AstPrinter from "./AstPrinter.ts";

class Lox {
  static hadError = false;

  static main(args: string[]): void {
    if (args.length > 1) {
      console.log("Usage: tlox [script]");
      Deno.exit(64);
    } else if (args.length === 1) {
      Lox.runFile(args[0]);
    } else {
      Lox.runPrompt();
    }
  }

  private static runFile(path: string): void {
    const text = Deno.readTextFileSync(path);
    Lox.run(text);

    if (Lox.hadError) Deno.exit(65);
  }

  private static async runPrompt(): Promise<void> {
    for await (const line of readLines(Deno.stdin)) {
      print("> ");
      if (line === null) break;
      Lox.run(line);
      Lox.hadError = false;
    }
  }

  private static run(source: string): void {
    const scanner: Scanner = new Scanner(source);
    const tokens: Token[] = scanner.scanTokens();

    const parser: Parser = new Parser(tokens);
    const expression: Expr = parser.parse();

    if (this.hadError) return;

    console.log(new AstPrinter().print(expression));
  }

  private static report(line: number, where: string, message: string) {
    printErr(`[line ${line}] Error ${where}: ${message}`);
    Lox.hadError = true;
  }

  static error(line: number, message: string): void;
  static error(token: Token, message: string): void;
  static error(source: number | Token, message: string): void {
    // line error
    if (typeof source === "number") {
      const line = source;
      Lox.report(line, "", message);
      return;
    }

    // token error
    const token = source;
    if (token.type === TokenType.EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, ` at '${token.lexeme}'`, message);
    }
  }
}

export default Lox;
