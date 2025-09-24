import { type PropsWithChildren, Suspense, useMemo } from "react";
import { Navigate } from "react-router-dom";
import T from "@mui/material/Typography";
import { CircularProgress } from "@mui/material";

import type { ErrorResponse } from "../api";

// import KellerLoader from "./KellerLoader";
import styles from "./Loading.module.scss";

//#region loading

export function LoadingBar() {
	return <CircularProgress />;
}

export function CenteredLoadingBar() {
	return (
		<div className={styles["centered-page-status"]}>
			<LoadingBar />
		</div>
	);
}

export function LoadingSuspense(props: PropsWithChildren) {
	return <Suspense fallback={<CenteredLoadingBar />} {...props} />;
}

//#endregion

function LosMemos() {
	const memeCount = 2;
	const meme = useMemo(() => (Math.random() * memeCount) | 0, []);
	return meme === 0 ? (
		<img style={{ margin: "40px", width: "300px" }} alt="Excuse me wtf" src="/memes/wtf.png" />
	) : (
		// biome-ignore lint/a11y/useMediaCaption: it's a meme.
		<video
			style={{ margin: "40px", width: "350px" }}
			src="/memes/wat.mp4"
			autoPlay
			loop
			playsInline
		/>
	);
}

export function GenericError() {
	return (
		<div className={styles["centered-page-status"]}>
			<T variant="h4" component="h4" className={styles.failed}>
				IRGENDWAS DOOFES IST PASSIERT :/
			</T>
			<T variant="subtitle1">Versuch' es später noch ein­mal.</T>
			<LosMemos />
			<T>Hochtrainierte Programmier-Schmuser sind bereits dran, um das Problem zu lösen.</T>
		</div>
	);
}

type ApiErrorProps = {
	error: ErrorResponse;
};
export function ApiError(props: ApiErrorProps) {
	return props.error.name === "mustCompleteProfile" ? (
		<Navigate replace to="/setup" />
	) : (
		<GenericError />
	);
}
