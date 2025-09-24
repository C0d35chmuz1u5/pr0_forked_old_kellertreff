import { useEffect, useRef } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
// import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";

import type { MatchedVote } from "@/shared/api-types";
import { UserMessageLinkIcon, UserProfileLinkIcon } from "@/component/UserLink";
import { CustomTimeAgo } from "@/component/CustomTimeAgo";
import TagListView from "@/component/TagListView";
import UserTextView from "@/component/UserTextView";

import styles from "./MatchCard.module.scss";
import CardFooter from "./CardFooter";

// TODO: Create common KellerCard

export type MatchCardProps = {
	match: MatchedVote;
	showTooltips: boolean;
};
export default function MatchCard(props: MatchCardProps) {
	const { match } = props;

	const highlighted = document.location.hash === "#" + match.partnerName;

	// Hack to get around scrolling a location.hash into view
	// See: https://stackoverflow.com/questions/59725886
	const articleRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const element = articleRef.current;
		if (highlighted && element) {
			setTimeout(() => scrollToElementRespectingNavbar(element), 100);
		}
	}, [highlighted]);

	return (
		<Card
			className={styles.card + " " + (highlighted ? styles.highlighted : "")}
			id={match.partnerName}
			ref={articleRef}
		>
			<CardHeader
				title={match.partnerName}
				action={
					<>
						<UserMessageLinkIcon
							userName={match.partnerName}
							showTooltips={props.showTooltips}
						/>
						<UserProfileLinkIcon
							userName={match.partnerName}
							showTooltips={props.showTooltips}
						/>
					</>
				}
			/>

			<CardContent>
				<TagListView tags={match.partnerTags} />
				<UserTextView text={match.partnerText} />
			</CardContent>

			<CardFooter variant="flex-end">
				<CustomTimeAgo
					date={match.matchedAt}
					component={Typography}
					variant="overline"
					color="textSecondary"
					tooltip
				/>
			</CardFooter>
		</Card>
	);
}

function scrollToElementRespectingNavbar(element: HTMLElement) {
	const elementPosition = element.offsetTop;
	window.scrollTo({
		top: elementPosition - 60,
		behavior: "smooth",
	});
}
