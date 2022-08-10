import { readLines } from "https://deno.land/std@0.151.0/io/mod.ts";
import Token from "./Token.ts";
import Scanner from "./Scanner.ts";

const print = (message: string) =>
  Deno.stdout.writeSync(new TextEncoder().encode(message));

const printErr = (message: string) =>
  Deno.stderr.writeSync(new TextEncoder().encode(message));

class Lox {
  static hadError = false;

  public static main(args: string[]): void {
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
      if (line == null) break;
      Lox.run(line);
      Lox.hadError = false;
    }
  }

  private static run(source: string): void {
    const scanner: Scanner = new Scanner(source);
    const tokens: Token[] = scanner.scanTokens();

    for (const token of tokens) {
      print(`${JSON.stringify(token, null, 2)}\n`);
    }
  }

  public static error(line: number, message: string): void {
    Lox.report(line, "", message);
  }

  private static report(line: number, where: string, message: string) {
    printErr(`[line ${line}] Error ${where}: ${message}`);
    Lox.hadError = true;
  }
}

export default Lox;
