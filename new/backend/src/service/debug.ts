import { CountryCode } from "@/shared/src/api-types.js";
import * as locationService from "@/service/location.js";
import * as userService from "@/service/user.js";
import * as datingProfileService from "@/service/datingProfile.js";
import config from "@/config.js";

export async function addDemoData() {
  if (!config.debug.enableDemoData) {
    return;
  }

  await userService.createDebugUser(1);
  await userService.createDebugUser(2);
  await userService.createDebugUser(3);
  await userService.createDebugUser(4);
  await locationService.addLocation(CountryCode.DE, "12345", 1, 2);
  await locationService.addLocation(CountryCode.DE, "12346", 3, 4);
  await locationService.addLocation(CountryCode.DE, "12347", 5, 6);
  await locationService.addLocation(CountryCode.AT, "0234", 7, 8);
  await locationService.addLocation(CountryCode.AT, "0235", 9, 10);
  await locationService.addLocation(CountryCode.CH, "0235", 11, 12);
  await locationService.addLocation(CountryCode.CH, "3235", 13, 14);
  await datingProfileService.addInterest("Hiking");
  await datingProfileService.addInterest("Cycling");
  await datingProfileService.addInterest("Swimming");
  await datingProfileService.addInterest("Running");
  await datingProfileService.addInterest("Gaming");
  await datingProfileService.addInterest("Reading");
  await datingProfileService.addInterest("Cooking");
  await datingProfileService.addInterest("Traveling");
}
