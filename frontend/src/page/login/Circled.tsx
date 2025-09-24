import Typography from "@mui/material/Typography";

import styles from "./Circled.module.scss";

export interface CircledProps {
	text: number | string;
}
export default function Circled(props: CircledProps) {
	return (
		<Typography variant="h5" component="h3" color="textPrimary" className={styles.circled}>
			{props.text}
		</Typography>
	);
}
