import type { ReactNode } from "react";

import styles from "./PageContent.module.scss";

export interface PageContentProps {
	children: ReactNode;
	variant?: "flex-start" | "flex-end" | "center" | "space-between";
	alignItems?: "flex-start" | "flex-end" | "center" | "baseline" | "auto" | "stretch";
	direction?: "row" | "column";
}

// TODO: Check if we want to make this a generic flex container

export default function PageContent(props: PageContentProps) {
	return (
		<div
			className={styles.page}
			style={{
				flexDirection: props.direction ?? "column",
				justifyContent: props.variant ?? "flex-start",
				alignItems: props.alignItems ?? "stretch",
			}}
		>
			{props.children}
		</div>
	);
}
