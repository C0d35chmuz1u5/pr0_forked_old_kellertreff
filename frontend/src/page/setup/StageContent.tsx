import styles from "./StageContent.module.scss";

export interface StageContentProps {
	children: React.ReactNode;
	className?: string;
}
export default function StageContent(props: StageContentProps) {
	const extraClasses = props.className ? " " + props.className : "";

	return <div className={styles.stage + extraClasses}>{props.children}</div>;
}
