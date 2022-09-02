import { print } from "./util.ts";
import * as Expr from "./Expr.ts";
import Token from "./Token.ts";
import TokenType from "./TokenType.ts";

class AstPrinter implements Expr.Visitor<string> {
  print(expr: Expr.Expr) {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Expr.Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Expr.Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Expr.Literal): string {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Expr.Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  parenthesize(name: string, ...exprs: Expr.Expr[]) {
    let builder = ``;

    builder += `(${name}`;
    for (const expr of exprs) {
      builder += ` ${expr.accept(this)}`;
    }
    builder += `)`;
    return builder;
  }

  static main(args: string[]): void {
    const expression: Expr.Expr = new Expr.Binary(
      new Expr.Unary(
        new Token(TokenType.MINUS, "-", null, 1),
        new Expr.Literal(123)
      ),
      new Token(TokenType.STAR, "*", null, 1),
      new Expr.Grouping(new Expr.Literal(45.67))
    );

    print(new AstPrinter().print(expression));
  }
}

export default AstPrinter;
