import TokenType from "./TokenType.ts";
import { Literal } from "./Types.ts";

class Token {
  readonly type: TokenType;
  readonly lexeme: String;
  readonly literal: Literal;
  readonly line: number;

  constructor(type: TokenType, lexeme: string, literal: Literal, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  public toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}

export default Token;
