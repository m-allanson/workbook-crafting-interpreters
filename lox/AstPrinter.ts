import { Visitor, Expr, Grouping, Binary, Literal, Unary } from "./Expr.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

class AstPrinter implements Visitor<string> {
  print(expr: Expr) {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  parenthesize(name: string, ...exprs: Expr[]) {
    let builder = ``;

    builder += `(${name}`;
    for (const expr of exprs) {
      builder += ` ${expr.accept(this)}`;
    }
    builder += `)`;
    return builder;
  }

  static main(args: string[]): void {
    const expression: Expr = new Binary(
      new Unary(
        new Token(TokenType.MINUS, "-", undefined, 1),
        new Literal(123)
      ),
      new Token(TokenType.STAR, "*", undefined, 1),
      new Grouping(new Literal(45.67))
    );

    console.log(new AstPrinter().print(expression));
  }
}

AstPrinter.main([""]);
