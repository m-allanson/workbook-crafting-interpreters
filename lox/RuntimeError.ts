import Token from "./Token.ts";

class RuntimeError extends Error {
  readonly token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.token = token;
  }
}

export default RuntimeError;
