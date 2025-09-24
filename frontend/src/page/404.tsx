import { GenericError } from "@/component/Loading";

import styles from "./404.module.scss";

export default function NotFoundPage() {
	return (
		<div className={"container " + styles["not-found"]}>
			<h1>404</h1>
			<GenericError />
		</div>
	);
}
