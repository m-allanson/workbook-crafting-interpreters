import Token from "./Token.ts";

class RuntimeError extends Error {
  readonly token: Token | null;

  constructor(token: Token | null, message: string) {
    super(message);
    this.token = token;
  }
}

export default RuntimeError;
