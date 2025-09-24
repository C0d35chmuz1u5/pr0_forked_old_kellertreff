import T from "@mui/material/Typography";

import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

const allowedElements = [
	"p",
	"hr",
	"b",
	"i",
	"strong",
	"strike", // Not supported, but we list it anyway
	"em",
	"ul",
	"ol",
	"li",
	"blockquote",
	"br",
	// consider by adding support via plugin (or enabling):
	// - strikethrough
	// - spoiler (like discord's ||)
	// - code
];
const remarkPlugins = [remarkBreaks];

export interface UserTextViewProps {
	/** Actually UserText */
	text: string;
}

/**
 * Consider memo()ing this component, as markdown parsing + rendering takes a while.
 */
export default function UserTextView({ text }: UserTextViewProps) {
	// Can be used for debugging to see which HTML elements need to be allowed:
	// allowElement={(e) => {console.log(e); return true}}
	return (
		<T component="div">
			<ReactMarkdown allowedElements={allowedElements} remarkPlugins={remarkPlugins}>
				{text}
			</ReactMarkdown>
		</T>
	);
}
