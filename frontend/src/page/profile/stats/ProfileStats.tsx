import { CenteredLoadingBar } from "@/component/Loading";
import type { LoggedInBaseProps } from "../../../types";
import useApi from "@/hooks/useApi";

export function ProfileStats({ session }: LoggedInBaseProps) {
	const res = useApi("/account/profile/stats", session);

	if (res.error) {
		// <ApiError error={res} />;}
		return <h1>1 Fehler :(</h1>;
	}
	if (!res.data) {
		return <CenteredLoadingBar />;
	}

	const d = res.data;

	return (
		<div className="container profile-stats">
			<h1>Deine Statistiken</h1>
			<p>Score: {d.score}</p>
		</div>
	);
}
