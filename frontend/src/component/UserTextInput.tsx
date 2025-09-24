import { useState } from "react";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { MAX_USER_TEXT_LENGTH } from "@/shared/constants";
import { ImageIcon, EditIcon } from "@/icons";

import { TEXT_PLACEHOLDERS } from "../client-constants";
import { randomArrayEntry } from "../util";

import UserTextView from "./UserTextView";

import styles from "./UserTextInput.module.scss";

export type UserTextInputProps = {
	id?: string;
	autoFocus?: boolean;
	autoCorrect?: string;

	currentText: string;
	setCurrentText: (t: string) => void;
};

export default function UserTextInput(props: UserTextInputProps) {
	const [randomPlaceholder, setRandomPlaceholder] = useState(() =>
		randomArrayEntry(TEXT_PLACEHOLDERS),
	);
	const [currentTab, setCurrentTab] = useState(0);

	// const linesInText = countLines(props.currentText);
	// const autoSizedRowForEditing = Math.max(linesInText + 2, 4);

	const showMaxCharsHint = props.currentText.length >= ((MAX_USER_TEXT_LENGTH * 0.9) | 0);

	return (
		<>
			{showMaxCharsHint && (
				<div className={styles["max-chars-hint"]}>
					<small>
						{props.currentText.length} von {MAX_USER_TEXT_LENGTH} Zeichen verbleibend
					</small>
				</div>
			)}

			{currentTab === 0 && (
				<TextField
					id={props.id}
					variant="outlined"
					multiline
					fullWidth
					minRows={2}
					placeholder={randomPlaceholder}
					value={props.currentText}
					autoFocus={props.autoFocus}
					autoCorrect={props.autoCorrect}
					onChange={e => updateCurrentText(e.target.value)}
					className={styles.input}
				/>
			)}

			{currentTab === 1 && (
				<PreviewFrame className={styles.input}>
					<UserTextView text={props.currentText} />
				</PreviewFrame>
			)}

			<Tabs
				value={currentTab}
				indicatorColor="primary"
				textColor="primary"
				onChange={(_, v) => setCurrentTab(v)}
				className={styles.tabs}
			>
				{/* Ref: https://github.com/mui-org/material-ui/issues/11653#issuecomment-571892544 */}
				<Tab
					label={
						<div>
							<EditIcon size={20} style={{ verticalAlign: "middle" }} /> Bearbeiten
						</div>
					}
				/>
				<Tab
					label={
						<div>
							<ImageIcon size={20} style={{ verticalAlign: "middle" }} /> Vorschau
						</div>
					}
				/>
			</Tabs>
		</>
	);

	function updateCurrentText(textCandidate: string) {
		if (textCandidate.length <= MAX_USER_TEXT_LENGTH) props.setCurrentText(textCandidate);

		if (textCandidate === "") setRandomPlaceholder(randomArrayEntry(TEXT_PLACEHOLDERS));
	}
}

function PreviewFrame(props: { children: React.ReactNode; className: string }) {
	return <div className={styles.preview + " " + props.className}>{props.children}</div>;
}
