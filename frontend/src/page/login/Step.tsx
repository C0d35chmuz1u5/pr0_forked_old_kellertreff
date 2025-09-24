import { Typography } from "@mui/material";

import Circled from "./Circled";

import styles from "./Step.module.scss";

export interface StepProps {
	number: number | string;
	heading: string;
	children: React.ReactNode;
	showLine?: boolean;
}
export default function Step(props: StepProps) {
	return (
		<div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "16px",
				}}
			>
				<Circled text={props.number} />
				<Typography variant="h5" component="h3">
					{props.heading}
				</Typography>
			</div>

			<Typography
				variant="body2"
				color="textSecondary"
				align="left"
				style={{
					marginLeft: "calc(8px * 7)",
				}}
				className={props.showLine ? styles.line : undefined}
			>
				{props.children}
			</Typography>
		</div>
	);
}
