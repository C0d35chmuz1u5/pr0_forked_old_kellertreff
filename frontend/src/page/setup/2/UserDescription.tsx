import type { Dispatch, SetStateAction } from "react";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import UserTextInput from "@/component/UserTextInput";
import { isUserText } from "@/shared/types";

import { AlignLeftIcon } from "@/icons";

import type { StepProps } from "../common";
import StepProgress from "../StepProgress";
import StageContent from "../StageContent";

export type UserDescriptionProps = StepProps & {
	text: string;
	setText: Dispatch<SetStateAction<string>>;
};

export default function UserDescription(props: UserDescriptionProps) {
	console.assert(props.hasPrevStep);
	console.assert(props.hasNextStep);

	const isValidUserText = isUserText(props.text);

	return (
		<>
			<StageContent>
				<Card>
					<CardContent>
						<Typography variant="h5" gutterBottom>
							<AlignLeftIcon size={20} /> Beschreibe Dich!
						</Typography>

						<Typography gutterBottom>
							...und/oder was/wen du suchst! Du kannst diesen Text später natürlich
							noch verändern.
						</Typography>

						<UserTextInput currentText={props.text} setCurrentText={props.setText} />
					</CardContent>
				</Card>
			</StageContent>
			<StepProgress {...props} canPrev canNext={isValidUserText} />
		</>
	);
}
