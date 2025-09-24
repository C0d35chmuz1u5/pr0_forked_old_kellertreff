import type { PropsWithChildren } from "react";

import styles from "./CardEnumeration.module.scss";

export default function CardEnumeration(props: PropsWithChildren) {
	return <div className={styles.grid}>{props.children}</div>;
}
