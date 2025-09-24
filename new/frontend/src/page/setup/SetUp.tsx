import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { ApiResponse } from "@/shared/src/api-types";
import assertNever from "@/types/assertNever";

import { SetupStep, type StageState } from "./steps/Step";
import Welcome from "./steps/0/Welcome";
import LookingFor from "./steps/1/LookingFor";
import DatingProfileFill from "./steps/2/DatingProfile";
import FriendsProfileFill from "./steps/3/FriendsProfile";
import Finished from "./steps/4/Finished";

export interface SetUpProps {
  me: ApiResponse["get"]["/me"];
}

export default function SetUp({ me }: SetUpProps) {
  const navigate = useNavigate();
  const [stageData, setStageData] = useState<StageState>({
    stage: SetupStep.INITIAL,
    me,
  });

  useEffect(() => {
    if (stageData.stage !== SetupStep.FINISHED) {
      return;
    }

    const promises = [];
    if (stageData.datingProfileData) {
      promises.push(
        fetch("/api/account/profile/dating", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stageData.datingProfileData),
        }),
      );
    }

    if (stageData.friendsProfileData) {
      promises.push(
        fetch("/api/account/profile/friends", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stageData.friendsProfileData),
        }),
      );
    }

    Promise.all(promises).then(() => {
      navigate("/");
    });
  }, [stageData, navigate]);

  switch (stageData.stage) {
    case SetupStep.INITIAL:
      return <Welcome prevStageData={stageData} setStageData={setStageData} />;
    case SetupStep.WELCOME:
      return <LookingFor prevStageData={stageData} setStageData={setStageData} />;
    case SetupStep.LOOKING_FOR:
      return stageData.lookingForDates ? (
        <DatingProfileFill prevStageData={stageData} setStageData={setStageData} />
      ) : (
        <FriendsProfileFill prevStageData={stageData} setStageData={setStageData} />
      );
    case SetupStep.DATING_PROFILE:
      return stageData.lookingForFriends ? (
        <FriendsProfileFill prevStageData={stageData} setStageData={setStageData} />
      ) : (
        <Finished prevStageData={stageData} setStageData={setStageData} />
      );
    case SetupStep.FRIENDS_PROFILE:
      return <Finished prevStageData={stageData} setStageData={setStageData} />;
    case SetupStep.FINISHED:
      return undefined;
    default:
      assertNever(stageData);
  }
}
