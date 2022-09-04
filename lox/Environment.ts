import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";
import { Value } from "./Types.ts";

class Environment {
  private readonly values: Map<string, Value> = new Map();

  define(name: string, value: Value): void {
    this.values.set(name, value);
  }

  get(name: Token): Value {
    if (this.values.has(name.lexeme)) {
      const value = this.values.get(name.lexeme);

      if (typeof value === "undefined") {
        throw new RuntimeError(name, `Failed to get value for ${name.lexeme}.`);
      }

      return value;
    }

    throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
  }
}

export default Environment;
