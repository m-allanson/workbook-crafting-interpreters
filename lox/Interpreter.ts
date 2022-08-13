import { Grouping, Literal, Visitor, Expr, Unary, Binary } from "./Expr.ts";
import TokenType from "./TokenType.ts";
import { Literal as LiteralType } from "./Types.ts";

class Interpreter implements Visitor<LiteralType> {
  visitLiteralExpr(expr: Literal): LiteralType {
    return expr.value;
  }

  visitUnaryExpr(expr: Unary): LiteralType {
    const right: LiteralType = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -Number(right);
    }

    // Unreachable.
    return null;
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
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        return Number(left) >= Number(right);
      case TokenType.LESS:
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        return Number(left) <= Number(right);
      case TokenType.MINUS:
        return Number(left) - Number(right);
      case TokenType.PLUS:
        if (typeof left === "number" && left) {
        }
        if (
          // typeofs here allow TS to narrow the types correctly
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

        break;
      case TokenType.SLASH:
        return Number(left) / Number(right);
      case TokenType.STAR:
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
