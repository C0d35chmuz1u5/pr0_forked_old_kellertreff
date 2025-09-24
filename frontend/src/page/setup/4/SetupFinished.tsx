import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import type { UserTagSet } from "@/shared/typebox";
import type { StepProps } from "../common";
import StageContent from "../StageContent";
import StepProgress from "../StepProgress";

import styles from "./SetupFinished.module.scss";

type SetupFinishedProps = StepProps & {
	readonly text: string;
	readonly tags: UserTagSet;
	save: () => void;
};

export default function SetupFinished(props: SetupFinishedProps) {
	console.assert(props.hasPrevStep);
	console.assert(!props.hasNextStep);

	// import { SaveIcon } from "@/icons";
	// startIcon={<SaveIcon/>}
	return (
		<>
			<StageContent className={styles.stage}>
				<Typography variant="h4" align="center">
					Das war's!
				</Typography>

				<div className={styles.message}>
					<Button
						size="large"
						variant="contained"
						color="primary"
						onClick={props.save}
						endIcon="🚀"
					>
						Speichern &amp; Loslegen
					</Button>
				</div>
			</StageContent>
			<StepProgress {...props} canPrev />
		</>
	);
}
