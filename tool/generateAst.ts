const types = [
  "Binary   - left: Expr, operator: Token, right: Expr",
  "Grouping - expression: Expr",
  "Literal  - value: string | number",
  "Unary    - operator: Token , right: Expr",
];

class GenerateAst {
  static main(args: string[]) {
    if (args.length !== 1) {
      Deno.stderr.writeSync(
        new TextEncoder().encode("Usage: generate_ast <output directory>")
      );
      Deno.exit(64);
    }
    const outputDir: string = args[0];

    this.defineAst(outputDir, "Expr", types);
  }

  private static defineAst(
    outputDir: string,
    baseName: string,
    types: string[]
  ): void {
    const path: string = `${outputDir}/${baseName}.ts`;
    let content = `import Token from "./Token.ts";\n\n`;
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
      content += `  readonly ${field}\n`;
    }
    content += `\n`;

    // Constructor.
    content += `  constructor(${fieldList}){\n`;
    content += `    super();\n`;

    for (const field of fields) {
      const name = field.split(":")[0].trim();
      content += `    this.${name} = ${name};\n`;
    }
    content += `  }\n\n`;

    content += `  accept<R>(visitor: Visitor<R>): R {\n`;
    content += `    return visitor.visit${className}${baseName}(this)\n`;
    content += `  }\n`;

    content += `}\n`;

    return content;
  }
}

GenerateAst.main(Deno.args);
