// PromptToInstallProvider.tsx
import {
	useState,
	createContext,
	useEffect,
	useContext,
	useCallback,
	type PropsWithChildren,
} from "react";

// Ref: https://gist.github.com/rikukissa/cb291a4a82caa670d2e0547c520eae53#gistcomment-3418878

const PromptToInstall = createContext<PromptCtx>({ deferredEvt: null });

export function PromptToInstallProvider(props: PropsWithChildren) {
	const [deferredEvt, setDeferredEvt] = useState<IBeforeInstallPromptEvent | null>(null);

	const hidePrompt = useCallback(() => void setDeferredEvt(null), []);

	useEffect(() => {
		const ready = (e: IBeforeInstallPromptEvent) => {
			e.preventDefault();
			setDeferredEvt(e);
		};

		window.addEventListener("beforeinstallprompt", ready as EventListener);

		return () => void window.removeEventListener("beforeinstallprompt", ready as EventListener);
	}, []);

	return (
		<PromptToInstall.Provider value={{ deferredEvt, hidePrompt }}>
			{props.children}
		</PromptToInstall.Provider>
	);
}

export function usePromptToInstall() {
	const ctx = useContext(PromptToInstall);
	if (!ctx) {
		throw new Error("Cannot use usePromptToInstall() outside <PromptToInstallProvider />");
	}
	return ctx;
}

export interface IBeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
	prompt(): Promise<void>;
}

interface PromptCtx {
	deferredEvt: IBeforeInstallPromptEvent | null;
	hidePrompt?: () => void;
}
