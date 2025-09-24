import styles from "./KellerLoader.module.scss";

export default function KellerLoader() {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: lol
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" className={styles.spinner}>
			<path className={styles.door + " " + styles.upper} d="M 15,100 v -90 h 60 v 90" />
			<path className={styles.stairs} d="M 100,100 h 65 v 50 h 70 v 50 h 70 v 50 h 70 v 50" />
			<path
				className={styles.stairs + " " + styles.foreground}
				d="M 100,100 h 65 v 50 h 70 v 50 h 70 v 50 h 70 v 50"
			/>
			<path className={styles.door + " " + styles.lower} d="M 415,300 v -90 h 60 v 90" />
		</svg>
	);
}
