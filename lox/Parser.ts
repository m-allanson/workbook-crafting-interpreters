import * as Expr from "./Expr.ts";
import * as Stmt from "./Stmt.ts";
import Lox from "./Lox.ts";
import Token from "./Token.ts";
import T from "./TokenType.ts";

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
    return this.assignment();
  }

  private declaration(): Stmt.Stmt | null {
    try {
      if (this.match(T.VAR)) return this.varDeclaration();
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
    if (this.match(T.FOR)) return this.forStatement();
    if (this.match(T.IF)) return this.ifStatement();
    if (this.match(T.PRINT)) return this.printStatement();
    if (this.match(T.WHILE)) return this.whileStatement();
    if (this.match(T.LEFT_BRACE)) return new Stmt.Block(this.block());

    return this.expressionStatement();
  }

  private forStatement(): Stmt.Stmt {
    this.consume(T.LEFT_PAREN, "Expect '(' after 'for'.");

    let initializer: Stmt.Stmt | null;
    if (this.match(T.SEMICOLON)) {
      initializer = null;
    } else if (this.match(T.VAR)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition: Expr.Expr | null = null;
    if (!this.check(T.SEMICOLON)) {
      condition = this.expression();
    }
    this.consume(T.SEMICOLON, "Expect ';' after loop condition.");

    let increment: Expr.Expr | null = null;
    if (!this.check(T.RIGHT_PAREN)) {
      increment = this.expression();
    }
    this.consume(T.RIGHT_PAREN, "Expect ')' after for clauses.");
    let body: Stmt.Stmt = this.statement();

    if (increment !== null) {
      body = new Stmt.Block([body, new Stmt.Expression(increment)]);
    }

    if (condition === null) condition = new Expr.Literal(true);
    body = new Stmt.While(condition, body);

    if (initializer !== null) {
      body = new Stmt.Block([initializer, body]);
    }

    return body;
  }

  private ifStatement(): Stmt.Stmt {
    this.consume(T.LEFT_PAREN, "Expect '(' after 'if'.");
    const condition: Expr.Expr = this.expression();
    this.consume(T.RIGHT_PAREN, "Expect ')' after if condition.");

    const thenBranch = this.statement();
    let elseBranch = null;

    if (this.match(T.ELSE)) {
      elseBranch = this.statement();
    }

    return new Stmt.If(condition, thenBranch, elseBranch);
  }

  private printStatement(): Stmt.Stmt {
    let value: Expr.Expr = this.expression();
    this.consume(T.SEMICOLON, "Expect ';' after value.");
    return new Stmt.Print(value);
  }

  private varDeclaration(): Stmt.Stmt {
    const name: Token = this.consume(T.IDENTIFIER, "Expect variable name.");

    let initializer: Expr.Expr | null = null;
    if (this.match(T.EQUAL)) {
      initializer = this.expression();
    }

    this.consume(T.SEMICOLON, "Expect ';' after variable declaration.");
    return new Stmt.Var(name, initializer);
  }

  private whileStatement(): Stmt.Stmt {
    this.consume(T.LEFT_PAREN, "Expect '(' after 'while'.");
    const condition: Expr.Expr = this.expression();
    this.consume(T.RIGHT_PAREN, "Expect ')' after condition.");
    const body = this.statement();

    return new Stmt.While(condition, body);
  }

  private expressionStatement(): Stmt.Stmt {
    let expr: Expr.Expr = this.expression();
    this.consume(T.SEMICOLON, "Expect ';' after expression.");
    return new Stmt.Expression(expr);
  }

  private block(): Stmt.Stmt[] {
    const statements: Stmt.Stmt[] = [];

    while (!this.check(T.RIGHT_BRACE) && !this.isAtEnd()) {
      const decl = this.declaration();
      if (decl !== null) statements.push(decl);
    }

    this.consume(T.RIGHT_BRACE, `Expect '}' after block.`);
    return statements;
  }

  private assignment(): Expr.Expr {
    const expr: Expr.Expr = this.or();

    if (this.match(T.EQUAL)) {
      const equals: Token = this.previous();
      const value: Expr.Expr = this.assignment();

      if (expr instanceof Expr.Variable) {
        const name: Token = expr.name;
        return new Expr.Assign(name, value);
      }

      this.error(equals, "Invalid assignment target.");
    }

    return expr;
  }

  private or(): Expr.Expr {
    let expr: Expr.Expr = this.and();

    while (this.match(T.OR)) {
      const operator: Token = this.previous();
      const right = this.and();
      expr = new Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  private and(): Expr.Expr {
    const expr: Expr.Expr = this.equality();

    while (this.match(T.AND)) {
      const operator: Token = this.previous();
      let right = this.equality();
      right = new Expr.Logical(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expr.Expr {
    let expr: Expr.Expr = this.comparison();

    while (this.match(T.BANG_EQUAL, T.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr.Expr = this.comparison();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr.Expr {
    let expr: Expr.Expr = this.term();

    while (this.match(T.GREATER, T.GREATER_EQUAL, T.LESS, T.LESS_EQUAL)) {
      const operator = this.previous();
      const right: Expr.Expr = this.term();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr.Expr {
    let expr: Expr.Expr = this.factor();

    while (this.match(T.MINUS, T.PLUS)) {
      const operator: Token = this.previous();
      const right: Expr.Expr = this.factor();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr.Expr {
    let expr = this.unary();

    while (this.match(T.SLASH, T.STAR)) {
      const operator: Token = this.previous();
      const right: Expr.Expr = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr.Expr {
    if (this.match(T.BANG, T.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr.Expr = this.unary();
      return new Expr.Unary(operator, right);
    }

    return this.primary();
  }

  private primary(): Expr.Expr {
    if (this.match(T.FALSE)) return new Expr.Literal(false);
    if (this.match(T.TRUE)) return new Expr.Literal(true);
    if (this.match(T.NIL)) return new Expr.Literal(null);

    if (this.match(T.NUMBER, T.STRING)) {
      return new Expr.Literal(this.previous().literal);
    }

    if (this.match(T.IDENTIFIER)) {
      return new Expr.Variable(this.previous());
    }

    if (this.match(T.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(T.RIGHT_PAREN, "Expect ')' after expression.");
      return new Expr.Grouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  private match(...types: T[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: T, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  private check(type: T): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === T.EOF;
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
      if (this.previous().type === T.SEMICOLON) return;

      switch (this.peek().type) {
        case T.CLASS:
        case T.FUN:
        case T.VAR:
        case T.FOR:
        case T.IF:
        case T.WHILE:
        case T.PRINT:
        case T.RETURN:
          return;
      }

      this.advance();
    }
  }
}

class ParseError extends Error {}

export default Parser;
