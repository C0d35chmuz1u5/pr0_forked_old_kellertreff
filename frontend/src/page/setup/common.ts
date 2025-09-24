import { useEffect } from "react";
import type { LoggedInBaseProps } from "../../types";

export type ProfileSetupWizardProps = LoggedInBaseProps;

export interface StepProps extends ProfileSetupWizardProps {
	// TODO: Maybe encode this using discriminated unions
	hasPrevStep: boolean;
	hasNextStep: boolean;
	nextStep: () => void;
	prevStep: () => void;
	currentStep: number;
	lastStep: number;
	firstStep: number;
}

export function useBackgroundColor(cssColor: string): void {
	useEffect(() => {
		document.body.style.backgroundColor = cssColor;
		// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
		return () => void (document.body.style.backgroundColor = "");
	}, [cssColor]);
}
