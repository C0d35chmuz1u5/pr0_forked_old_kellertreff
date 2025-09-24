export default function assertNever(v: never): never {
  // If this code gets called at runtime, v wont be "never", it will have a value
  throw new Error(`Expected never, but got ${v}`);
}
