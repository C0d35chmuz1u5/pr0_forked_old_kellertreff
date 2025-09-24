import { Minus as MinusIcon, Plus as PlusIcon } from "@/icons";

import styles from "./VoteBar.module.scss";

export interface VoteBarProps {
	disabled: boolean;
	voteDown: (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
	voteUp: (e: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
}

export default function VoteBar(props: VoteBarProps) {
	return (
		<div className={styles.bar}>
			<button type="button" onClick={props.voteDown} disabled={props.disabled}>
				<MinusIcon />
			</button>
			<button type="button" onClick={props.voteUp} disabled={props.disabled}>
				<PlusIcon />
			</button>
		</div>
	);
}
