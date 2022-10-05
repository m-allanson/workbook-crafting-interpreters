import Environment from "./Environment.ts";
import Interpreter from "./Interpreter.ts";
import LoxCallable from "./LoxCallable.ts";
import Return from "./Return.ts";
import * as Stmt from "./Stmt.ts";
import { Value } from "./Types.ts";

export default class LoxFunction implements LoxCallable {
  private readonly declaration: Stmt.Function;
  private readonly closure: Environment;
  readonly isLoxCallable: true = true;

  constructor(declaration: Stmt.Function, closure: Environment) {
    this.closure = closure;
    this.declaration = declaration;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  call(interpreter: Interpreter, callArguments: Value[]): Value {
    const environment: Environment = new Environment(this.closure);

    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, callArguments[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (errorOrReturn) {
      if (errorOrReturn instanceof Return) {
        return errorOrReturn.value;
      } else {
        throw errorOrReturn;
      }
    }
    return null;
  }
}
