import TokenType from "./TokenType.ts";
import { Value } from "./Types.ts";

class Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly literal: Value;
  readonly line: number;

  constructor(type: TokenType, lexeme: string, literal: Value, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}

export default Token;
