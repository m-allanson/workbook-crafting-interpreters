import Interpreter from "./Interpreter.ts";
import { Value } from "./Types.ts";

export default interface LoxCallable {
  arity(): number;
  call(interpreter: Interpreter, callArguments: Value[]): Value;
  readonly isLoxCallable: true; // For runtime type checking
}
