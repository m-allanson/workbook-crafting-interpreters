class GenerateAst {
  static main(args: string[]) {
    if (args.length !== 1) {
      Deno.stderr.writeSync(
        new TextEncoder().encode("Usage: generate_ast <output directory>")
      );
      Deno.exit(64);
    }
    const outputDir: string = args[0];

    this.defineAst(
      outputDir,
      "Expr",
      [
        "Assign   - name: Token, value: Expr",
        "Binary   - left: Expr, operator: Token, right: Expr",
        "Grouping - expression: Expr",
        "Literal  - value: Value",
        "Logical  - left: Expr, operator: Token, right: Expr",
        "Unary    - operator: Token, right: Expr",
        "Variable - name: Token",
      ],
      [
        [`Token`, `./Token.ts`],
        [`{ Value }`, `./Types.ts`],
      ]
    );

    this.defineAst(
      outputDir,
      "Stmt",
      [
        "Block      - statements: Stmt[]",
        "Expression - expression: Expr",
        "If         - condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null",
        "Print      - expression: Expr",
        "Var        - name: Token, initializer: Expr | null",
      ],
      [
        [`Token`, `./Token.ts`],
        [`{ Expr }`, `./Expr.ts`],
      ]
    );
  }

  private static defineAst(
    outputDir: string,
    baseName: string,
    types: string[],
    imports: [identifiers: string, specifier: string][] = []
  ): void {
    const path: string = `${outputDir}/${baseName}.ts`;
    let content = "";
    for (const [identifiers, specifier] of imports) {
      content += `import ${identifiers} from "${specifier}";\n`;
    }
    content += "\n";
    content += `export abstract class ${baseName} {\n`;
    content += `  abstract accept<R>(visitor: Visitor<R>): R;\n`;
    content += `}\n\n`;

    content += this.defineVisitor(baseName, types);

    // The AST classes.
    for (const type of types) {
      const className: string = type.split("-")[0].trim();
      const fields = type.split("-")[1].trim();
      content += this.defineType(baseName, className, fields);
    }

    Deno.writeTextFileSync(path, content);
  }

  private static defineVisitor(baseName: string, types: string[]): string {
    let content = `export interface Visitor<R> {\n`;

    for (const type of types) {
      const typeName = type.split("-")[0].trim();
      content += `  visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): R;\n`;
    }

    content += `}\n`;
    return content;
  }

  private static defineType(
    baseName: string,
    className: string,
    fieldList: string
  ): string {
    const fields = fieldList.split(", ");

    let content = "\n";
    content += `export class ${className} extends ${baseName} {\n`;

    // Fields.
    for (const field of fields) {
      content += `  readonly ${field};\n`;
    }
    content += `\n`;

    // Constructor.
    content += `  constructor(${fieldList}) {\n`;
    content += `    super();\n`;

    for (const field of fields) {
      const name = field.split(":")[0].trim();
      content += `    this.${name} = ${name};\n`;
    }
    content += `  }\n\n`;

    content += `  accept<R>(visitor: Visitor<R>): R {\n`;
    content += `    return visitor.visit${className}${baseName}(this);\n`;
    content += `  }\n`;

    content += `}\n`;

    return content;
  }
}

GenerateAst.main(Deno.args);
