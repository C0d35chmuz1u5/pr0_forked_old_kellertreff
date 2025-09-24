import { useMemo } from "react";
import type { ElementType } from "react";
import TimeAgo from "react-timeago";

import germanStrings from "react-timeago/lib/language-strings/de";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";

import type { TooltipProps } from "@mui/material/Tooltip";

const tooltipFormatter = new Intl.DateTimeFormat(["de", "en"], {
	dateStyle: "full",
	timeStyle: "medium",
});

const formatter = buildFormatter(germanStrings);

export type Props = {
	tooltip?: boolean;
	tooltipPlacement?: TooltipProps["placement"];
	component?: ElementType;

	/**
	 * Should be a date string in the form of "2021-07-25T19:08:25.000Z" where the trailing Z indicates that the time is in Zulu (UTC) time
	 */
	date: string | number | Date;
} & Record<string, unknown>;

export function CustomTimeAgo({
	date,
	tooltip,
	tooltipPlacement,
	component,
	...passedProps
}: Props) {
	const parsedDate = new Date(date);

	const formattedTitle = useMemo(
		() => (tooltip ? tooltipFormatter.format(new Date(date)) : undefined),
		[tooltip, date],
	);

	const element = (
		<TimeAgo
			{...passedProps}
			date={parsedDate}
			// biome-ignore lint/suspicious/noExplicitAny: :shrug:
			component={(component as any) ?? "span"}
			formatter={formatter}
			title={formattedTitle}
		/>
	);
	return element;

	// TODO: Proper tooltips (got some issues with ref forwarding)
	/*
	return props.tooltip
		? (
			<Tooltip title={tooltipFormatter.format(parsedDate)} placement={tooltipPlacement ?? "top"} arrow>
				{element}
			</Tooltip>
		)
		: element;
	*/
}
