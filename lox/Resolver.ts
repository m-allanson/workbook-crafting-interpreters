import * as Expr from "./Expr.ts";
import * as Stmt from "./Stmt.ts";
import Interpreter from "./Interpreter.ts";
import Lox from "./Lox.ts";
import Token from "./Token.ts";

type Scope = Map<string, boolean>;

class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
  readonly #interpreter: Interpreter;
  readonly #scopes: Scope[] = [];

  constructor(interpreter: Interpreter) {
    this.#interpreter = interpreter;
  }

  #resolveStmts(statements: Stmt.Stmt[]): void {
    for (const statement of statements) {
      this.#resolveStmt(statement);
    }
  }

  #resolveStmt(statement: Stmt.Stmt): void {
    statement.accept(this);
  }

  #resolveExpr(expression: Expr.Expr): void {
    expression.accept(this);
  }

  #resolveFunction(func: Stmt.Function) {
    this.#beginScope();
    for (const param of func.params) {
      this.#declare(param);
      this.#define(param);
    }
    this.#resolveStmts(func.body);
    this.#endScope();
  }

  #beginScope(): void {
    this.#scopes.push(new Map<string, boolean>());
  }

  #endScope(): void {
    this.#scopes.pop();
  }

  #peekScope(): Scope {
    const scopesLength = this.#scopes.length;
    return this.#scopes[scopesLength - 1];
  }

  #declare(name: Token): void {
    if (this.#scopes.length < 1) return;
    const scope: Scope = this.#peekScope();
    scope.set(name.lexeme, false);
  }

  #define(name: Token): void {
    if (this.#scopes.length < 1) return;
    this.#peekScope().set(name.lexeme, true);
  }

  #resolveLocal(expr: Expr.Expr, name: Token): void {
    for (let i = this.#scopes.length - 1; i >= 0; i--) {
      if (this.#scopes[i].has(name.lexeme)) {
        this.#interpreter.resolve(expr, this.#scopes.length - 1 - i);
        return;
      }
    }
  }

  visitBlockStmt(stmt: Stmt.Block): void {
    this.#beginScope();
    this.#resolveStmts(stmt.statements);
    this.#endScope();
  }

  visitVarStmt(stmt: Stmt.Var): void {
    this.#declare(stmt.name);
    if (stmt.initializer !== null) {
      this.#resolveExpr(stmt.initializer);
    }
    this.#define(stmt.name);
  }

  visitVariableExpr(expr: Expr.Variable): void {
    if (
      this.#scopes.length > 0 &&
      this.#peekScope().get(expr.name.lexeme) === false
    ) {
      Lox.error(expr.name, "Can't read local variable in its own initializer.");
    }

    this.#resolveLocal(expr, expr.name);
  }

  visitAssignExpr(expr: Expr.Assign): void {
    this.#resolveExpr(expr.value);
    this.#resolveLocal(expr, expr.name);
  }

  visitFunctionStmt(stmt: Stmt.Function): void {
    this.#declare(stmt.name);
    this.#define(stmt.name);

    this.#resolveFunction(stmt);
  }

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.#resolveExpr(stmt.expression);
  }

  visitIfStmt(stmt: Stmt.If): void {
    this.#resolveExpr(stmt.condition);
    this.#resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch !== null) this.#resolveStmt(stmt.elseBranch);
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    this.#resolveExpr(stmt.expression);
  }

  visitReturnStmt(stmt: Stmt.Return): void {
    if (stmt.value !== null) {
      this.#resolveExpr(stmt.value);
    }
  }

  visitWhileStmt(stmt: Stmt.While): void {
    this.#resolveExpr(stmt.condition);
    this.#resolveStmt(stmt.body);
  }

  visitBinaryExpr(expr: Expr.Binary): void {
    this.#resolveExpr(expr.left);
    this.#resolveExpr(expr.right);
  }

  visitCallExpr(expr: Expr.Call): void {
    this.#resolveExpr(expr.callee);

    for (const callArgument of expr.callArguments) {
      this.#resolveExpr(callArgument);
    }
  }

  visitGroupingExpr(expr: Expr.Grouping): void {
    this.#resolveExpr(expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal): void {}

  visitLogicalExpr(expr: Expr.Logical): void {
    this.#resolveExpr(expr.left);
    this.#resolveExpr(expr.right);
  }

  visitUnaryExpr(expr: Expr.Unary): void {
    this.#resolveExpr(expr.right);
  }
}

export default Resolver;
