import { Value } from "./Types.ts";
import { print, printErr } from "./util.ts";
import * as Expr from "./Expr.ts";
import * as Stmt from "./Stmt.ts";
import Lox from "./Lox.ts";
import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";
import T from "./TokenType.ts";
import Environment from "./Environment.ts";
import LoxCallable from "./LoxCallable.ts";
import LoxFunction from "./LoxFunction.ts";
import Return from "./Return.ts";

class Interpreter implements Expr.Visitor<Value>, Stmt.Visitor<void> {
  readonly globals: Environment = new Environment();
  private environment: Environment = this.globals;
  private readonly locals = new Map<Expr.Expr, number>();

  constructor() {
    this.globals.define(
      "clock",
      new (class implements LoxCallable {
        arity(): number {
          return 0;
        }

        call(interpreter: Interpreter, callArguments: Value[]): Value {
          return <number>(Date.now() / 1000);
        }

        readonly isLoxCallable: true = true;

        toString(): string {
          return "<native fn>";
        }
      })()
    );
  }

  interpret(statements: Stmt.Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error: unknown) {
      if (error instanceof RuntimeError) {
        Lox.runtimeError(error);
      } else {
        throw error;
      }
    }
  }

  visitLiteralExpr(expr: Expr.Literal): Value {
    return expr.value;
  }

  visitLogicalExpr(expr: Expr.Logical): Value {
    const left: Value = this.evaluate(expr.left);

    if (expr.operator.type === T.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  visitUnaryExpr(expr: Expr.Unary): Value {
    const right: Value = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case T.BANG:
        return !this.isTruthy(right);
      case T.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -Number(right);
    }

    // Unreachable.
    return null;
  }

  visitVariableExpr(expr: Expr.Variable): Value {
    return this.lookupVariable(expr.name, expr);
  }

  private lookupVariable(name: Token, expr: Expr.Expr) {
    const distance: number | undefined = this.locals.get(expr);
    if (typeof distance !== "undefined") {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }

  private checkNumberOperand(operator: Token, operand: Value): void {
    if (typeof operand === "number" && !Number.isNaN(operand)) return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    left: Value,
    right: Value
  ): void {
    if (
      typeof left === "number" &&
      typeof right === "number" &&
      !Number.isNaN(left)
    ) {
      return;
    }

    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  private isTruthy(item: Value): boolean {
    if (item === null) return false;
    if (item === false) return false;
    return true;
  }

  private isEqual(a: Value, b: Value): boolean {
    if (a === null && b === null) return true;
    if (a === null) return false;

    // Special case to handle JS where `NaN === NaN` is false
    if (Number.isNaN(a) === true && Number.isNaN(b) === true) return true;

    return a === b;
  }

  private stringify(value: Value): string {
    if (value === null) return "nil";
    return value.toString();
  }

  visitGroupingExpr(expr: Expr.Grouping): Value {
    return this.evaluate(expr.expression);
  }

  private evaluate(expr: Expr.Expr): Value {
    return expr.accept(this);
  }

  private execute(stmt: Stmt.Stmt): void {
    stmt.accept(this);
  }

  resolve(expr: Expr.Expr, depth: number) {
    this.locals.set(expr, depth);
  }

  executeBlock(statements: Stmt.Stmt[], environment: Environment): void {
    const previous: Environment = this.environment;

    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  visitBlockStmt(stmt: Stmt.Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.evaluate(stmt.expression);
  }

  visitFunctionStmt(stmt: Stmt.Function): void {
    const func: LoxFunction = new LoxFunction(stmt, this.environment);
    this.environment.define(stmt.name.lexeme, func);
  }

  visitIfStmt(stmt: Stmt.If): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    const value: Value = this.evaluate(stmt.expression);
    print(this.stringify(value));
  }

  visitReturnStmt(stmt: Stmt.Return): void {
    let value: Value = null;
    if (stmt.value !== null) value = this.evaluate(stmt.value);

    throw new Return(value);
  }

  visitVarStmt(stmt: Stmt.Var): void {
    let value: Value = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitWhileStmt(stmt: Stmt.While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitAssignExpr(expr: Expr.Assign): Value {
    const value: Value = this.evaluate(expr.value);

    const distance: number | undefined = this.locals.get(expr);
    if (typeof distance !== "undefined") {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

    return value;
  }

  visitBinaryExpr(expr: Expr.Binary): Value {
    const left: Value = this.evaluate(expr.left);
    const right: Value = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case T.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case T.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case T.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case T.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case T.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case T.PLUS:
        if (
          // typeofs here allow TS to narrow the types to 'number'. isFinite() alone is not enough.
          typeof left === "number" &&
          typeof right === "number" &&
          Number.isFinite(left) &&
          Number.isFinite(right)
        ) {
          return left + right;
        }

        if (typeof left === "string" && typeof right === "string") {
          return `${left}${right}`;
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );
      case T.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case T.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
      case T.BANG_EQUAL:
        return !this.isEqual(left, right);
      case T.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }

    // Unreachable.
    return null;
  }

  visitCallExpr(expr: Expr.Call): Value {
    const callee: Value = this.evaluate(expr.callee);

    const callArguments: Value[] = [];
    for (const callArgument of expr.callArguments) {
      callArguments.push(this.evaluate(callArgument));
    }

    // TODO: revisit these type-narrowing error checks and the Value type in general?
    if (!callee) {
      throw new RuntimeError(expr.paren, "Cannot call missing callee.");
    }
    if (typeof callee !== "object" || !("isLoxCallable" in callee)) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes."
      );
    }

    const func: LoxCallable = <LoxCallable>callee;

    if (callArguments.length !== func.arity()) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${func.arity()} arguments but got ${callArguments.length}.`
      );
    }

    return func.call(this, callArguments);
  }
}

export default Interpreter;
