import { IPlayer } from "../PersonObjects/IPlayer";
import { IReviverValue } from "../utils/JSONReviver";

export abstract class Work {
  type: WorkType;
  singularity: boolean;
  cyclesWorked: number;

  constructor(type: WorkType, singularity: boolean) {
    this.type = type;
    this.singularity = singularity;
    this.cyclesWorked = 0;
  }

  abstract process(player: IPlayer, cycles: number): boolean;
  abstract finish(player: IPlayer, cancelled: boolean): void;
  abstract APICopy(): Record<string, unknown>;
  abstract toJSON(): IReviverValue;
}

export enum WorkType {
  CRIME = "CRIME",
  CLASS = "CLASS",
  CREATE_PROGRAM = "CREATE_PROGRAM",
  GRAFTING = "GRAFTING",
  FACTION = "FACTION",
  COMPANY = "COMPANY",
}
