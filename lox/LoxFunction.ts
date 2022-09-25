import Environment from "./Environment.ts";
import Interpreter from "./Interpreter.ts";
import LoxCallable from "./LoxCallable.ts";
import * as Stmt from "./Stmt.ts";
import { Value } from "./Types.ts";

export default class LoxFunction implements LoxCallable {
  private readonly declaration: Stmt.Function;
  readonly isLoxCallable: true = true;

  constructor(declaration: Stmt.Function) {
    this.declaration = declaration;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, callArguments: Value[]): Value {
    const environment: Environment = new Environment(interpreter.globals);

    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, callArguments[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);
    return null;
  }
}
