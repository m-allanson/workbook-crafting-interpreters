package com.tekniskt.lox;

// This is the answer to Challenge 3 in Chapter 5.
// output should be: "1 2 + 4 3 - *"

class ReversePolishPrinter implements Expr.Visitor<String> {
    String print(Expr expr) {
        return expr.accept(this);
    }

    @Override
    public String visitBinaryExpr(Expr.Binary expr) {
        return parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    @Override
    public String visitGroupingExpr(Expr.Grouping expr) {
        return parenthesize("", expr.expression);
    }

    @Override
    public String visitLiteralExpr(Expr.Literal expr)  {
        if (expr.value == null) return "nil";
        return expr.value.toString();
    }

    @Override
    public String visitUnaryExpr(Expr.Unary expr) {
        return parenthesize(expr.operator.lexeme, expr.right);
    }

    private String parenthesize(String name, Expr... exprs) {
        StringBuilder builder = new StringBuilder();

        for (Expr expr : exprs) {
            builder.append(expr.accept(this));
            if (name != "") builder.append(" ");
        }
        builder.append(name);

        return builder.toString();
    }

    public static void main(String[] args) {
        // (1 + 2) * (4 - 3)
        Expr expression = new Expr.Binary(
                new Expr.Grouping(
                        new Expr.Binary(
                                new Expr.Literal(1),
                                new Token(TokenType.PLUS, "+", null, 1 ),
                                new Expr.Literal(2)
                        )
                ),
                new Token(
                        TokenType.STAR, "*", null, 1
                ),
                new Expr.Grouping(
                        new Expr.Binary(
                                new Expr.Literal(4),
                                new Token(TokenType.MINUS, "-", null, 1 ),
                                new Expr.Literal(3)
                        )
                )
        );

        System.out.println(new ReversePolishPrinter().print(expression));
    }
}