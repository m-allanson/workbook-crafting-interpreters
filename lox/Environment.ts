import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";
import { Value } from "./Types.ts";

class Environment {
  readonly enclosing: Environment | null = null;
  private readonly values: Map<string, Value> = new Map();

  constructor(enclosing?: Environment) {
    if (enclosing) this.enclosing = enclosing;
  }

  define(name: string, value: Value): void {
    this.values.set(name, value);
  }

  ancestor(distance: number): Environment {
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      if (environment.enclosing) {
        environment = environment.enclosing;
      }
    }
    return environment;
  }

  getAt(distance: number, name: string): Value {
    const value = this.ancestor(distance).values.get(name);

    if (typeof value === "undefined") {
      throw new RuntimeError(
        null,
        `Could not find value in environment for variable ${name}.`
      );
    }

    return value;
  }

  assignAt(distance: number, name: Token, value: Value): void {
    this.ancestor(distance).values.set(name.lexeme, value);
  }

  get(name: Token): Value {
    if (this.values.has(name.lexeme)) {
      const value = this.values.get(name.lexeme);

      if (typeof value === "undefined") {
        throw new RuntimeError(name, `Failed to get value for ${name.lexeme}.`);
      }

      return value;
    }

    if (this.enclosing !== null) return this.enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
  }

  assign(name: Token, value: Value): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing !== null) return this.enclosing.assign(name, value);

    throw new RuntimeError(name, `Undefined variable "${name.lexeme}".`);
  }
}

export default Environment;
