import { useMedia } from "react-use";

/**
 * This hook is intended for conditional rendering of components based on the current layout (for example, an entirely different navbar).
 * Avoid using it for workarounds that could be solved with CSS.
 *
 * @returns true if the current layout is a phone layout
 */
export default function useIsPhoneLayout() {
	// TODO: Check if this media query suffices for our target devices (maybe feedback with UX)
	// Keep in sync with "@mixin mobile-width" _mixins.scss
	return useMedia("screen and (max-width: 600px)");
}
