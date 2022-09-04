import * as Expr from "./Expr.ts";
import * as Stmt from "./Stmt.ts";
import Lox from "./Lox.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

class Parser {
  private readonly tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Stmt.Stmt[] {
    let statements: Stmt.Stmt[] = [];

    while (!this.isAtEnd()) {
      const declaration = this.declaration();
      if (declaration) statements.push(declaration);
    }

    return statements;
  }

  private expression(): Expr.Expr {
    return this.equality();
  }

  private declaration(): Stmt.Stmt | null {
    try {
      if (this.match(TokenType.VAR)) return this.varDeclaration();
      return this.statement();
    } catch (error: unknown) {
      if (error instanceof ParseError) {
        this.synchronize();
        return null;
      } else {
        throw error;
      }
    }
  }

  private statement(): Stmt.Stmt {
    if (this.match(TokenType.PRINT)) return this.printStatement();

    return this.expressionStatement();
  }

  private printStatement(): Stmt.Stmt {
    let value: Expr.Expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
    return new Stmt.Print(value);
  }

  private varDeclaration(): Stmt.Stmt {
    const name: Token = this.consume(
      TokenType.IDENTIFIER,
      "Expect variable name."
    );

    let initializer: Expr.Expr | null = null;
    if (this.match(TokenType.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
    return new Stmt.Var(name, initializer);
  }

  private expressionStatement(): Stmt.Stmt {
    let expr: Expr.Expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new Stmt.Expression(expr);
  }

  private equality(): Expr.Expr {
    let expr: Expr.Expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr.Expr = this.comparison();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr.Expr {
    let expr: Expr.Expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right: Expr.Expr = this.term();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr.Expr {
    let expr: Expr.Expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator: Token = this.previous();
      const right: Expr.Expr = this.factor();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr.Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator: Token = this.previous();
      const right: Expr.Expr = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr.Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr.Expr = this.unary();
      return new Expr.Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr.Expr {
    if (this.match(TokenType.FALSE)) return new Expr.Literal(false);
    if (this.match(TokenType.TRUE)) return new Expr.Literal(true);
    if (this.match(TokenType.NIL)) return new Expr.Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Expr.Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Expr.Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private error(token: Token, message: string): ParseError {
    Lox.error(token, message);
    return new ParseError();
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }
}

class ParseError extends Error {}

export default Parser;
