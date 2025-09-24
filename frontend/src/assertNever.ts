export default function assertNever(n: never): never {
	throw new Error(`Expected never, got ${n}`);
}
