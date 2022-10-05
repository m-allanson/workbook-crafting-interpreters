import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";
import { Value } from "./Types.ts";

class Return extends RuntimeError {
  readonly value: Value;

  constructor(value: Value) {
    super(null, "");
    this.value = value;
  }
}

export default Return;
