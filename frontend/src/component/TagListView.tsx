import type { HTMLAttributes } from "react";
import Chip from "@mui/material/Chip";

import type { LocationHintData } from "@/shared/api-types";
import type { UserTag, UserTagSet } from "@/shared/typebox";

import styles from "./TagListView.module.scss";

export type TagListViewProps = {
	tags: UserTagSet;
	locationHintData?: LocationHintData;
	style?: HTMLAttributes<unknown>["style"];
	// className?: HTMLAttributes<unknown>["className"];
};
export default function TagListView(props: TagListViewProps) {
	const locationData = props.locationHintData;
	return (
		<div className={styles.view} style={props.style}>
			{props.tags.map(tag => {
				const shouldHighlight = locationData && isLocationTag(locationData, tag as UserTag);
				// color={shouldHighlight ? "secondary" : undefined}
				// className={shouldHighlight ? styles.highlighted : undefined}
				return (
					<Chip
						key={tag}
						size="small"
						label={tag}
						variant={shouldHighlight ? "outlined" : "filled"}
					/>
				);
			})}
		</div>
	);
}

function isLocationTag(locationData: LocationHintData, tag: UserTag): boolean {
	const normalizedTag = tag.toLowerCase(); // No trimming necessary, this is ensured by the backend

	return (
		locationData.shorts.includes(normalizedTag) ||
		locationData.locations.some(location => normalizedTag.indexOf(location) >= 0)
	);
}
