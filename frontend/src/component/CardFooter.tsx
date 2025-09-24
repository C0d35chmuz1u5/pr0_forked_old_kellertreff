import type { ReactNode } from "react";

import styles from "./CardFooter.module.scss";

export interface CardFooterProps {
	children: ReactNode;
	variant?: "flex-start" | "flex-end" | "center" | "space-between";
	disableSpacing?: boolean;
}

export default function CardFooter(props: CardFooterProps) {
	const spacing = !props.disableSpacing ? styles.spacing : "";

	return (
		<div
			className={`${styles.footer} ${spacing}`}
			style={{
				justifyContent: props.variant ?? "flex-start",
			}}
		>
			{props.children}
		</div>
	);
}
