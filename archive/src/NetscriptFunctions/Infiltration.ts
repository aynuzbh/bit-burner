import { Player as player } from "../Player";

import {
  Infiltration as IInfiltration,
  InfiltrationLocation,
  PossibleInfiltrationLocation,
} from "../ScriptEditor/NetscriptDefinitions";
import { Location } from "../Locations/Location";
import { Locations } from "../Locations/Locations";
import { calculateDifficulty, calculateReward } from "../Infiltration/formulas/game";
import {
  calculateInfiltratorsRepReward,
  calculateSellInformationCashReward,
  calculateTradeInformationRepReward,
} from "../Infiltration/formulas/victory";
import { FactionNames } from "../Faction/data/FactionNames";
import { Factions } from "../Faction/Factions";
import { InternalAPI, NetscriptContext } from "../Netscript/APIWrapper";
import { checkEnum } from "../utils/helpers/checkEnum";
import { LocationName } from "../Locations/data/LocationNames";
import { helpers } from "../Netscript/NetscriptHelpers";

export function NetscriptInfiltration(): InternalAPI<IInfiltration> {
  const getLocationsWithInfiltrations = Object.values(Locations).filter(
    (location: Location) => location.infiltrationData,
  );

  const calculateInfiltrationData = (ctx: NetscriptContext, locationName: string): InfiltrationLocation => {
    if (!checkEnum(LocationName, locationName)) throw new Error(`Location '${locationName}' does not exists.`);
    const location = Locations[locationName];
    if (location === undefined) throw helpers.makeRuntimeErrorMsg(ctx, `Location '${location}' does not exists.`);
    if (location.infiltrationData === undefined)
      throw helpers.makeRuntimeErrorMsg(ctx, `Location '${location}' does not provide infiltrations.`);
    const startingSecurityLevel = location.infiltrationData.startingSecurityLevel;
    const difficulty = calculateDifficulty(player, startingSecurityLevel);
    const reward = calculateReward(player, startingSecurityLevel);
    const maxLevel = location.infiltrationData.maxClearanceLevel;
    return {
      location: JSON.parse(JSON.stringify(location)),
      reward: {
        tradeRep: calculateTradeInformationRepReward(player, reward, maxLevel, startingSecurityLevel),
        sellCash: calculateSellInformationCashReward(player, reward, maxLevel, startingSecurityLevel),
        SoARep: calculateInfiltratorsRepReward(player, Factions[FactionNames.ShadowsOfAnarchy], startingSecurityLevel),
      },
      difficulty: difficulty,
    };
  };
  return {
    getPossibleLocations: () => (): PossibleInfiltrationLocation[] => {
      return getLocationsWithInfiltrations.map((l) => ({
        city: l.city ?? "",
        name: String(l.name),
      }));
    },
    getInfiltration:
      (ctx: NetscriptContext) =>
      (_location: unknown): InfiltrationLocation => {
        const location = helpers.string(ctx, "location", _location);
        return calculateInfiltrationData(ctx, location);
      },
  };
}
