import type React from "react";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import Chip from "@mui/material/Chip";
import { makeStyles } from "tss-react/mui";
import TextField from "@mui/material/TextField";

import type { TagList, UserTag, UserTagSet } from "@/shared/typebox";
import { getTagsFromTagList } from "@/shared/types";
import { MAX_TAG_COUNT } from "@/shared/constants";
import { randomArrayEntry } from "../util";
import { TAG_PLACEHOLDERS } from "../client-constants";

/*
import { DeleteTagIcon } from "@/icons";
*/

const useStyles = makeStyles()(theme => ({
	root: {
		display: "flex",
		justifyContent: "start",
		flexWrap: "wrap",
		gap: theme.spacing(1),
		padding: theme.spacing(0.5),
		margin: 0,
	},
}));

export type TagOrderEditorProps = {
	tags: UserTagSet;
	setTags: Dispatch<SetStateAction<UserTagSet>>;
};

// TODO: Drag&Drop
function TagListEditor(props: TagOrderEditorProps) {
	const classes = useStyles().classes;

	const handleDelete = (tagToDelete: UserTag) => () => {
		props.setTags(props.tags.filter(t => t !== tagToDelete) as UserTagSet);
	};

	return (
		<div className={classes.root}>
			{props.tags.map(t => (
				<Chip key={t} label={t} size="small" onDelete={handleDelete(t as UserTag)} />
			))}
		</div>
	);
}

export default function TagOrderEditor(props: TagOrderEditorProps) {
	const [randomPlaceholder, setRandomPlaceholder] = useState(createPlaceholder);
	const [currentText, setCurrentText] = useState("");

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			add(currentText);
		}
	}

	// TODO: Suggestion based on usage
	return (
		<>
			<TagListEditor {...props} />
			<TextField
				value={currentText}
				onKeyDown={handleKeyDown}
				onChange={e => setCurrentText(e.target.value)}
				placeholder={randomPlaceholder}
				disabled={props.tags.length >= MAX_TAG_COUNT}
				variant="outlined"
				style={{ width: "100%" }}
			/>
		</>
	);

	function add(toAdd: string) {
		const tagsToAdd = getNewTags(toAdd, props.tags);
		if (!tagsToAdd) return;

		setRandomPlaceholder(createPlaceholder());
		props.setTags([...props.tags, ...tagsToAdd] as UserTagSet);
		setCurrentText("");
	}

	function createPlaceholder(): string {
		return [
			...new Set([
				randomArrayEntry(TAG_PLACEHOLDERS),
				randomArrayEntry(TAG_PLACEHOLDERS),
				randomArrayEntry(TAG_PLACEHOLDERS),
			]),
		].join(", ") as typeof randomPlaceholder;
	}
}

function parseTags(potentiallyCommaSeparatedTags: string): UserTagSet | undefined {
	if (!potentiallyCommaSeparatedTags) return undefined;

	const input = potentiallyCommaSeparatedTags.trim() as TagList;

	const res = getTagsFromTagList(input, false);

	return res.length === 0 ? undefined : res;
}

function getNewTags(
	potentiallyCommaSeparatedTags: string,
	existingTags: UserTagSet,
): UserTagSet | undefined {
	const addedTags = parseTags(potentiallyCommaSeparatedTags);

	if (!addedTags) return undefined;

	const newTags = addedTags.filter(t => !existingTags.includes(t));
	return newTags.length === 0 ? undefined : (newTags as UserTagSet);
}
