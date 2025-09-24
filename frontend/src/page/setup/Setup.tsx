import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import lazyWithPreload from "react-lazy-with-preload";

import { apiFetch } from "../../api";

import type { ProfileSetupWizardProps } from "./common";
import Welcome from "./0/Welcome";

import styles from "./Setup.module.scss";

import { LoadingBar, LoadingSuspense } from "@/component/Loading";
import type { GeoLocation, UserTagSet } from "@/shared/typebox";
import { saveNotificationPreferences } from "@/page/settings/NotificationPreferences";
import assertNever from "@/assertNever";
import useApi from "@/hooks/useApi";

const AddTagsLazy = lazyWithPreload(() => import("./1/AddTags"));
const UserDescriptionLazy = lazyWithPreload(() => import("./2/UserDescription"));
const OptionalStuffLazy = lazyWithPreload(() => import("./3/OptionalStuff"));
const SetupFinishedLazy = lazyWithPreload(() => import("./4/SetupFinished"));

enum SetupStep {
	WELCOME = 0,
	ADD_TAGS = 1,
	ADD_TEXT = 2,
	OPTIONAL_STUFF = 3,
	FINISHED = 4,
}

const preloadMap: Record<SetupStep, ReturnType<typeof lazyWithPreload> | undefined> = {
	0: undefined, // AddTagsLazy is preloaded on page load
	1: UserDescriptionLazy,
	2: OptionalStuffLazy,
	3: SetupFinishedLazy,
	4: undefined,
};

const firstStep = SetupStep.WELCOME;
const lastStep = SetupStep.FINISHED;

export default function Setup(props: ProfileSetupWizardProps) {
	useEffect(() => void AddTagsLazy.preload(), []);

	const [currentStep, setCurrentStep] = useState(SetupStep.WELCOME);
	const [tagsState, setTags] = useState<UserTagSet>([] as unknown as UserTagSet);
	const [textState, setText] = useState<string | undefined>(undefined);
	const [extendedNotificationsState, setExtendedNotifications] = useState<boolean | undefined>(
		undefined,
	);
	const [currentLocationState, setCurrentLocationState] = useState<GeoLocation | null>(null);

	const profile = useApi("/account/profile", props.session);
	const settings = useApi("/account/settings", props.session);

	if (profile.error || settings.error) {
		// <ApiError error={res} />;}
		return <h1>1 Fehler :(</h1>;
	}
	if (!profile.data || !settings.data) {
		return <LoadingBar />;
	}

	const tags = tagsState.length > 0 ? tagsState : profile.data.tags;
	const text = textState ?? profile.data.currentText;
	const currentLocation = currentLocationState ?? profile.data.location;
	const extendedNotifications = extendedNotificationsState ?? settings.data.wantsNotifications;

	const hasPrevStep = currentStep > firstStep;
	const hasNextStep = currentStep < lastStep;
	const stepProps = {
		...props,
		hasPrevStep,
		hasNextStep,
		nextStep: () => {
			if (!hasNextStep) return;

			const nextStep = currentStep + 1;
			const componentToPreload = preloadMap[nextStep as SetupStep];
			if (typeof componentToPreload !== "undefined") {
				componentToPreload.preload();
			}

			setCurrentStep(nextStep);
		},
		prevStep: () => hasPrevStep && setCurrentStep(currentStep - 1),
		currentStep,
		lastStep,
		firstStep,
	};

	function getPage() {
		switch (currentStep) {
			case SetupStep.WELCOME:
				return <Welcome {...stepProps} />;
			case SetupStep.ADD_TAGS:
				return (
					<LoadingSuspense>
						<AddTagsLazy {...stepProps} tags={tags} setTags={setTags} />
					</LoadingSuspense>
				);
			case SetupStep.ADD_TEXT:
				return (
					<LoadingSuspense>
						<UserDescriptionLazy
							{...stepProps}
							text={text}
							setText={setText as Dispatch<SetStateAction<string>>}
						/>
					</LoadingSuspense>
				);
			case SetupStep.OPTIONAL_STUFF:
				return (
					<LoadingSuspense>
						<OptionalStuffLazy
							{...stepProps}
							extendedNotifications={extendedNotifications}
							setExtendedNotifications={setExtendedNotifications}
							currentLocation={currentLocation}
							setCurrentLocation={setCurrentLocationState}
						/>
					</LoadingSuspense>
				);
			case SetupStep.FINISHED:
				return (
					<LoadingSuspense>
						<SetupFinishedLazy {...stepProps} text={text} tags={tags} save={save} />
					</LoadingSuspense>
				);
			default:
				assertNever(currentStep);
		}
	}

	return <section className={styles.setup}>{getPage()}</section>;

	function save() {
		const updateProfile = apiFetch("/account/profile", props.session, {
			method: "PATCH",
			body: {
				currentText: text,
				currentTags: tags,
				location: currentLocation,
			},
		});

		const updateSettings = saveNotificationPreferences(props.session, extendedNotifications);

		return Promise.all([updateProfile, updateSettings]).then(
			// biome-ignore lint/suspicious/noAssignInExpressions: shrug
			() => void (window.location.href = "/"),
		); // TODO: Redirect properly
	}
}
