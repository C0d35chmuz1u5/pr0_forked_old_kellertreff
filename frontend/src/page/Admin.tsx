import { CenteredLoadingBar } from "@/component/Loading";
import type { LoggedInBaseProps } from "../types";
import useApi from "@/hooks/useApi";

export type AdminProps = LoggedInBaseProps;

export default function AdminPage(props: AdminProps) {
	const res = useApi("/admin/info", props.session);

	if (res.error) {
		// <ApiError error={res} />;}
		return <h1>1 Fehler :(</h1>;
	}
	if (!res.data) {
		return <CenteredLoadingBar />;
	}

	const data = res.data;

	return (
		<>
			<h1>Administration</h1>
			<p>Banned Users: {data.bannedUsers}</p>
		</>
	);
}
