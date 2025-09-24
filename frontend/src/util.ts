export function vibrationHint(): void {
	if ("vibrate" in navigator) {
		navigator.vibrate(5);
	}
}

export function randomArrayEntry<T>(arr: readonly T[]): T {
	if (!arr || arr.length === 0) throw new Error("wut");
	return arr[(Math.random() * arr.length) | 0];
}

export function countLines(value: string): number {
	let res = 0;
	for (let i = 0; i < value.length; ++i) {
		if (value[i] === "\n") ++res;
	}
	return res;
}

const formatter = new Intl.NumberFormat("de");
export function formatNumber(n: number): string {
	return formatter.format(n);
}
