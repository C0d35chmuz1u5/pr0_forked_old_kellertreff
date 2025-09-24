import { Button } from "@mui/material";

import { SetupStep, type CommonStepProps, type LookingForState } from "../Step";
import { Gender, RelationshipSearchType } from "@/shared/src/api-types";
import useApi from "@/api/useApi";

export interface StepProps extends CommonStepProps {
  prevStageData: LookingForState;
}

export default function Step({ prevStageData, setStageData }: StepProps) {
  const interestsRes = useApi("/dating/interests");

  if (interestsRes.error) {
    throw interestsRes.error;
  }

  if (!interestsRes.data) {
    return <main>Lade...</main>;
  }

  const interests = interestsRes.data;

  return (
    <main>
      <h1>Dating</h1>
      <ul>
        {interests.map(interest => (
          <li key={interest.id}>{interest.name}</li>
        ))}
      </ul>
      <Button
        onClick={() => {
          setStageData({
            ...prevStageData,
            lookingForDates: true,
            datingProfileData: {
              enabled: true,
              birthday: "2000-01-01",
              gender: Gender.Other,
              bio: "bio",
              currentLocation: 0,
              lookingFor: RelationshipSearchType.CasualDating,

              jobTitle: null,
              education: null,
              heightCm: null,

              alcoholConsumption: null,
              smokingHabits: null,

              discordId: null,

              interests: [],
            },
            friendsProfileData: undefined,
            stage: SetupStep.DATING_PROFILE,
          });
        }}
      >
        Weiter
      </Button>
    </main>
  );
}
