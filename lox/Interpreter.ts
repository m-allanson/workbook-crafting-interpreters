import { Value } from "./Types.ts";
import { print, printErr } from "./util.ts";
import * as Expr from "./Expr.ts";
import * as Stmt from "./Stmt.ts";
import Lox from "./Lox.ts";
import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

class Interpreter implements Expr.Visitor<Value>, Stmt.Visitor<void> {
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

  visitUnaryExpr(expr: Expr.Unary): Value {
    const right: Value = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -Number(right);
    }

    // Unreachable.
    return null;
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
    return JSON.stringify(value);
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

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    const value: Value = this.evaluate(stmt.expression);
    print(this.stringify(value));
  }

  visitBinaryExpr(expr: Expr.Binary): Value {
    const left: Value = this.evaluate(expr.left);
    const right: Value = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.PLUS:
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
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }

    // Unreachable.
    return null;
  }
}

export default Interpreter;
