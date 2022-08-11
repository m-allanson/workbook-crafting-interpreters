export const print = (message: string) =>
  Deno.stdout.writeSync(new TextEncoder().encode(message));

export const printErr = (message: string) =>
  Deno.stderr.writeSync(new TextEncoder().encode(message));
