import { Grouping, Literal, Visitor, Expr, Unary, Binary } from "./Expr.ts";
import { Literal as LiteralType } from "./Types.ts";
import RuntimeError from "./RuntimeError.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";
import Lox from "./Lox.ts";

class Interpreter implements Visitor<LiteralType> {
  interpret(expression: Expr): void {
    try {
      const value: LiteralType = this.evaluate(expression);
      console.log(this.stringify(value));
    } catch (error: unknown) {
      if (error instanceof RuntimeError) {
        Lox.runtimeError(error);
      } else {
        throw error;
      }
    }
  }

  visitLiteralExpr(expr: Literal): LiteralType {
    return expr.value;
  }

  visitUnaryExpr(expr: Unary): LiteralType {
    const right: LiteralType = this.evaluate(expr.right);

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

  private checkNumberOperand(operator: Token, operand: LiteralType): void {
    if (typeof operand === "number" && !Number.isNaN(operand)) return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    left: LiteralType,
    right: LiteralType
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

  private isTruthy(item: LiteralType): boolean {
    if (item === null) return false;
    if (item === false) return false;
    return true;
  }

  private isEqual(a: LiteralType, b: LiteralType): boolean {
    if (a === null && b === null) return true;
    if (a === null) return false;

    // Special case to handle JS where `NaN === NaN` is false
    if (Number.isNaN(a) === true && Number.isNaN(b) === true) return true;

    return a === b;
  }

  private stringify(value: LiteralType): string {
    if (value === null) return "nil";
    return JSON.stringify(value);
  }

  visitGroupingExpr(expr: Grouping): LiteralType {
    return this.evaluate(expr.expression);
  }

  private evaluate(expr: Expr): LiteralType {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary): LiteralType {
    const left: LiteralType = this.evaluate(expr.left);
    const right: LiteralType = this.evaluate(expr.right);

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
