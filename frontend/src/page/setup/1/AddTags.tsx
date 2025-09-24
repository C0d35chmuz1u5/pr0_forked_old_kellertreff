import type { Dispatch, SetStateAction } from "react";
import T from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

import type { UserTagSet } from "@/shared/typebox";
import { MAX_TAG_COUNT, MIN_TAG_COUNT } from "@/shared/constants";
import TagOrderEditor from "@/component/TagOrderEditor";

import { TagIcon } from "@/icons";

import type { StepProps } from "../common";
import StepProgress from "../StepProgress";
import StageContent from "../StageContent";

import styles from "./AddTags.module.scss";

export type AddTagsProps = StepProps & {
	tags: UserTagSet;
	setTags: Dispatch<SetStateAction<UserTagSet>>;
};

export default function AddTags(props: AddTagsProps) {
	console.assert(props.hasPrevStep);
	console.assert(props.hasNextStep);

	const tagsUsedUp = props.tags.length >= MAX_TAG_COUNT;
	const hasRequiredTags = props.tags.length >= MIN_TAG_COUNT;

	// <div className={styles.protip}><small>Protip: Tags lassen sich ordnen</small></div>

	return (
		<>
			<StageContent className={styles.stage}>
				<Card>
					<CardContent>
						<T variant="h5" component="h2" gutterBottom>
							<TagIcon size={20} /> Welche Tags beschreiben Dich?
						</T>

						<T gutterBottom>
							...oder was du suchst. Du kannst Deine Tags später jederzeit ändern.
						</T>

						<div
							style={{
								display: "flex",
								gap: "10px",
								flexDirection: "column",
							}}
						>
							<TagOrderEditor {...props} />
							{tagsUsedUp && (
								<T gutterBottom>Du kannst maximal {MAX_TAG_COUNT} Tags angeben.</T>
							)}
							{!hasRequiredTags && (
								<T gutterBottom>
									Du benötigst mindestens {MIN_TAG_COUNT} Tags, um fortzufahren.
								</T>
							)}
						</div>
					</CardContent>
				</Card>
			</StageContent>
			<StepProgress {...props} canPrev canNext={hasRequiredTags} />
		</>
	);
}
