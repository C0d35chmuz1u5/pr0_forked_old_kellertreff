export interface KTSession {
	// "X-CSRF-Token": string;
	token: string;
	readonly info: Readonly<{
		id: number;
		displayName: string;
	}>;
	logOut: () => void;
}

export interface LoggedInBaseProps {
	session: KTSession;
}
