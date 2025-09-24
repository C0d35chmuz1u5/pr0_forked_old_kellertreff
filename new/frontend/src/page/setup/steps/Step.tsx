export interface CommonStepProps {
  setStageData: React.Dispatch<React.SetStateAction<StageState>>;
}

import type { ApiPayload, ApiResponse } from "@/shared/src/api-types";

export enum SetupStep {
  INITIAL = -1,
  WELCOME = 0,
  LOOKING_FOR = 1,
  DATING_PROFILE = 2,
  FRIENDS_PROFILE = 3,
  FINISHED = 4,
}

//@ts-ignore
export type StageState =
  | InitialState
  | WelcomeState
  | LookingForState
  | DatingProfileFillStage
  | FriendsProfileFillStage
  | FinishedState;

export type InitialState = {
  stage: SetupStep.INITIAL;
  me: ApiResponse["get"]["/me"];
};

export type WelcomeState = {
  stage: SetupStep.WELCOME;
  me: ApiResponse["get"]["/me"];
};

export type LookingForState = {
  stage: SetupStep.LOOKING_FOR;

  me: ApiResponse["get"]["/me"];
  lookingForDates: boolean;
  lookingForFriends: boolean;
};

export type DatingProfileData = ApiPayload["post"]["/account/profile/dating"];
export type FriendsProfileData = ApiPayload["post"]["/account/profile/friends"];

export type DatingProfileFillStage = {
  stage: SetupStep.DATING_PROFILE;

  me: ApiResponse["get"]["/me"];
  lookingForDates: true;
  lookingForFriends: boolean;
  datingProfileData: DatingProfileData;
  friendsProfileData: undefined;
};

export type FriendsProfileFillStage = {
  stage: SetupStep.FRIENDS_PROFILE;

  me: ApiResponse["get"]["/me"];
  lookingForDates: boolean;
  lookingForFriends: true;
  datingProfileData: DatingProfileData | undefined;
  friendsProfileData: FriendsProfileData;
};

export type FinishedState = {
  stage: SetupStep.FINISHED;

  me: ApiResponse["get"]["/me"];
  lookingForDates: boolean;
  lookingForFriends: boolean;
  datingProfileData: DatingProfileData | undefined;
  friendsProfileData: FriendsProfileData | undefined;
};
