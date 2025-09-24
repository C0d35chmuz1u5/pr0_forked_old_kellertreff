import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";

import type { StepProps } from "./common";

export type StepProgressProps = StepProps & {
	canNext?: boolean;
	canPrev?: boolean;
};

export default function StepProgress(props: StepProgressProps) {
	return (
		<MobileStepper
			variant="dots"
			steps={5}
			position="static"
			activeStep={props.currentStep}
			backButton={
				<Button size="small" onClick={props.prevStep} disabled={!props.canPrev}>
					Zurück
				</Button>
			}
			nextButton={
				<Button
					size="small"
					color="primary"
					onClick={props.nextStep}
					disabled={!props.canNext}
				>
					Weiter
				</Button>
			}
		/>
	);
}
