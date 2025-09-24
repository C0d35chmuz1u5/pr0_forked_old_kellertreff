import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { RightArrowIcon } from "@/icons";

import { type StepProps, useBackgroundColor } from "../common";
import StageContent from "../StageContent";

import styles from "./Welcome.module.scss";

export default function Welcome(props: StepProps) {
	console.assert(!props.hasPrevStep);
	console.assert(props.hasNextStep);

	useBackgroundColor("var(--content-alternative-background-color)");

	return (
		<StageContent className={styles.stage}>
			<div>
				<img src="/safari-pinned-tab.svg" alt="Kellertreff-Logo" className={styles.logo} />
			</div>

			<Typography variant="h3" component="h1" gutterBottom className={styles.greeting}>
				Hallo {props.session.info.displayName}!
			</Typography>
			<Typography gutterBottom className={styles.message}>
				Bevor Du mit Kellertreff loslegen kannst, benötigen wir noch ein paar Informationen
				von Dir.
			</Typography>
			<nav>
				<Button
					size="large"
					variant="contained"
					color="primary"
					onClick={props.nextStep}
					endIcon={<RightArrowIcon />}
				>
					Weiter
				</Button>
			</nav>
		</StageContent>
	);
}
