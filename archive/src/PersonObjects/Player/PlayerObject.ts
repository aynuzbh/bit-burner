import * as augmentationMethods from "./PlayerObjectAugmentationMethods";
import * as bladeburnerMethods from "./PlayerObjectBladeburnerMethods";
import * as corporationMethods from "./PlayerObjectCorporationMethods";
import * as gangMethods from "./PlayerObjectGangMethods";
import * as generalMethods from "./PlayerObjectGeneralMethods";
import * as serverMethods from "./PlayerObjectServerMethods";
import * as workMethods from "./PlayerObjectWorkMethods";

import { IMap } from "../../types";
import { Sleeve } from "../Sleeve/Sleeve";
import { IPlayerOwnedSourceFile } from "../../SourceFile/PlayerOwnedSourceFile";
import { Exploit } from "../../Exploits/Exploit";
import { CompanyPosition } from "../../Company/CompanyPosition";
import { Server } from "../../Server/Server";
import { BaseServer } from "../../Server/BaseServer";
import { HacknetServer } from "../../Hacknet/HacknetServer";
import { Faction } from "../../Faction/Faction";
import { Company } from "../../Company/Company";
import { Augmentation } from "../../Augmentation/Augmentation";
import { ICodingContractReward } from "../../CodingContracts";

import { IPlayer } from "../IPlayer";
import { LocationName } from "../../Locations/data/LocationNames";
import { IPlayerOwnedAugmentation } from "../../Augmentation/PlayerOwnedAugmentation";
import { ICorporation } from "../../Corporation/ICorporation";
import { IGang } from "../../Gang/IGang";
import { IBladeburner } from "../../Bladeburner/IBladeburner";
import { HacknetNode } from "../../Hacknet/HacknetNode";

import { HashManager } from "../../Hacknet/HashManager";
import { CityName } from "../../Locations/data/CityNames";

import { MoneySourceTracker } from "../../utils/MoneySourceTracker";
import { Reviver, Generic_toJSON, Generic_fromJSON, IReviverValue } from "../../utils/JSONReviver";
import { ISkillProgress } from "../formulas/skill";
import { PlayerAchievement } from "../../Achievements/Achievements";
import { cyrb53 } from "../../utils/StringHelperFunctions";
import { getRandomInt } from "../../utils/helpers/getRandomInt";
import { ITaskTracker } from "../ITaskTracker";
import { CONSTANTS } from "../../Constants";
import { Work } from "src/Work/Work";
import { defaultMultipliers, Multipliers } from "../Multipliers";
import { HP } from "../HP";
import { Skills } from "../Skills";

export class PlayerObject implements IPlayer {
  // Class members
  augmentations: IPlayerOwnedAugmentation[];
  bitNodeN: number;
  city: CityName;
  corporation: ICorporation | null;
  gang: IGang | null;
  bladeburner: IBladeburner | null;
  currentServer: string;
  factions: string[];
  factionInvitations: string[];
  hacknetNodes: (HacknetNode | string)[]; // HacknetNode object or IP of Hacknet Server
  has4SData: boolean;
  has4SDataTixApi: boolean;
  hashManager: HashManager;
  hasTixApiAccess: boolean;
  hasWseAccount: boolean;
  jobs: IMap<string>;
  init: () => void;
  karma: number;
  numPeopleKilled: number;
  location: LocationName;
  money: number;
  moneySourceA: MoneySourceTracker;
  moneySourceB: MoneySourceTracker;
  playtimeSinceLastAug: number;
  playtimeSinceLastBitnode: number;
  purchasedServers: string[];
  queuedAugmentations: IPlayerOwnedAugmentation[];
  scriptProdSinceLastAug: number;
  sleeves: Sleeve[];
  sleevesFromCovenant: number;
  sourceFiles: IPlayerOwnedSourceFile[];
  exploits: Exploit[];
  achievements: PlayerAchievement[];
  terminalCommandHistory: string[];
  identifier: string;
  lastUpdate: number;
  lastSave: number;
  totalPlaytime: number;

  hp: HP;
  skills: Skills;
  exp: Skills;

  mults: Multipliers;

  currentWork: Work | null;
  focus: boolean;

  entropy: number;

  // Methods
  startWork: (w: Work) => void;
  processWork: (cycles: number) => void;
  finishWork: (cancelled: boolean) => void;
  applyForAgentJob: (sing?: boolean) => boolean;
  applyForBusinessConsultantJob: (sing?: boolean) => boolean;
  applyForBusinessJob: (sing?: boolean) => boolean;
  applyForEmployeeJob: (sing?: boolean) => boolean;
  applyForItJob: (sing?: boolean) => boolean;
  applyForJob: (entryPosType: CompanyPosition, sing?: boolean) => boolean;
  applyForNetworkEngineerJob: (sing?: boolean) => boolean;
  applyForPartTimeEmployeeJob: (sing?: boolean) => boolean;
  applyForPartTimeWaiterJob: (sing?: boolean) => boolean;
  applyForSecurityEngineerJob: (sing?: boolean) => boolean;
  applyForSecurityJob: (sing?: boolean) => boolean;
  applyForSoftwareConsultantJob: (sing?: boolean) => boolean;
  applyForSoftwareJob: (sing?: boolean) => boolean;
  applyForWaiterJob: (sing?: boolean) => boolean;
  canAccessBladeburner: () => boolean;
  canAccessCorporation: () => boolean;
  canAccessGang: () => boolean;
  canAccessGrafting: () => boolean;
  canAfford: (cost: number) => boolean;
  gainHackingExp: (exp: number) => void;
  gainStrengthExp: (exp: number) => void;
  gainDefenseExp: (exp: number) => void;
  gainDexterityExp: (exp: number) => void;
  gainAgilityExp: (exp: number) => void;
  gainCharismaExp: (exp: number) => void;
  gainIntelligenceExp: (exp: number) => void;
  gainStats: (retValue: ITaskTracker) => void;
  gainMoney: (money: number, source: string) => void;
  getCurrentServer: () => BaseServer;
  getGangFaction: () => Faction;
  getGangName: () => string;
  getHomeComputer: () => Server;
  getNextCompanyPosition: (company: Company, entryPosType: CompanyPosition) => CompanyPosition | null;
  getUpgradeHomeRamCost: () => number;
  getUpgradeHomeCoresCost: () => number;
  gotoLocation: (to: LocationName) => boolean;
  hasAugmentation: (aug: string | Augmentation, installed?: boolean) => boolean;
  hasCorporation: () => boolean;
  hasGangWith: (facName: string) => boolean;
  hasTorRouter: () => boolean;
  hasProgram: (program: string) => boolean;
  inBladeburner: () => boolean;
  inGang: () => boolean;
  isAwareOfGang: () => boolean;
  isQualified: (company: Company, position: CompanyPosition) => boolean;
  loseMoney: (money: number, source: string) => void;
  reapplyAllAugmentations: (resetMultipliers?: boolean) => void;
  reapplyAllSourceFiles: () => void;
  regenerateHp: (amt: number) => void;
  recordMoneySource: (amt: number, source: string) => void;
  setMoney: (amt: number) => void;
  startBladeburner: () => void;
  startCorporation: (corpName: string, additionalShares?: number) => void;
  startFocusing: () => void;
  startGang: (facName: string, isHacking: boolean) => void;
  takeDamage: (amt: number) => boolean;
  travel: (to: CityName) => boolean;
  giveExploit: (exploit: Exploit) => void;
  giveAchievement: (achievementId: string) => void;
  queryStatFromString: (str: string) => number;
  getIntelligenceBonus: (weight: number) => number;
  getCasinoWinnings: () => number;
  quitJob: (company: string, sing?: boolean) => void;
  hasJob: () => boolean;
  createHacknetServer: () => HacknetServer;
  queueAugmentation: (augmentationName: string) => void;
  receiveInvite: (factionName: string) => void;
  updateSkillLevels: () => void;
  gainCodingContractReward: (reward: ICodingContractReward, difficulty?: number) => string;
  stopFocusing: () => void;
  resetMultipliers: () => void;
  prestigeAugmentation: () => void;
  prestigeSourceFile: () => void;
  calculateSkill: (exp: number, mult?: number) => number;
  calculateSkillProgress: (exp: number, mult?: number) => ISkillProgress;
  hospitalize: () => void;
  checkForFactionInvitations: () => Faction[];
  setBitNodeNumber: (n: number) => void;
  canAccessCotMG: () => boolean;
  sourceFileLvl: (n: number) => number;
  applyEntropy: (stacks?: number) => void;
  focusPenalty: () => number;

  constructor() {
    this.hp = { current: 10, max: 10 };
    this.skills = {
      hacking: 1,
      strength: 1,
      defense: 1,
      dexterity: 1,
      agility: 1,
      charisma: 1,
      intelligence: 0,
    };
    this.exp = {
      hacking: 0,
      strength: 0,
      defense: 0,
      dexterity: 0,
      agility: 0,
      charisma: 0,
      intelligence: 0,
    };

    this.mults = defaultMultipliers();

    //Money
    this.money = 1000 + CONSTANTS.Donations;

    //Location information
    this.city = CityName.Sector12;
    this.location = LocationName.TravelAgency;

    // Jobs that the player holds
    // Map of company name (key) -> name of company position (value. Just the name, not the CompanyPosition object)
    // The CompanyPosition name must match a key value in CompanyPositions
    this.jobs = {};

    // Servers
    this.currentServer = ""; //hostname of Server currently being accessed through termina;
    this.purchasedServers = []; //hostnames of purchased server;

    // Hacknet Nodes/Servers
    this.hacknetNodes = []; // Note= For Hacknet Servers, this array holds the hostnames of the server;
    this.hashManager = new HashManager();

    //Factions
    this.factions = []; //Names of all factions player has joine;
    this.factionInvitations = []; //Outstanding faction invitation;

    //Augmentations
    this.queuedAugmentations = [];
    this.augmentations = [];

    this.sourceFiles = [];

    //Crime statistics
    this.numPeopleKilled = 0;
    this.karma = 0;

    //Stock Market
    this.hasWseAccount = false;
    this.hasTixApiAccess = false;
    this.has4SData = false;
    this.has4SDataTixApi = false;

    //Gang
    this.gang = null;

    //Corporation
    this.corporation = null;

    //Bladeburner
    this.bladeburner = null;

    // Sleeves & Re-sleeving
    this.sleeves = [];
    this.sleevesFromCovenant = 0; // # of Duplicate sleeves purchased from the covenant
    //bitnode
    this.bitNodeN = 1;

    this.entropy = 0;

    //Used to store the last update time.
    this.lastUpdate = 0;
    this.lastSave = 0;
    this.totalPlaytime = 0;

    this.playtimeSinceLastAug = 0;
    this.playtimeSinceLastBitnode = 0;

    // Keep track of where money comes from
    this.moneySourceA = new MoneySourceTracker(); // Where money comes from since last-installed Augmentation
    this.moneySourceB = new MoneySourceTracker(); // Where money comes from for this entire BitNode run
    // Production since last Augmentation installation
    this.scriptProdSinceLastAug = 0;

    this.exploits = [];
    this.achievements = [];
    this.terminalCommandHistory = [];

    this.focus = false;
    this.currentWork = null;

    // Let's get a hash of some semi-random stuff so we have something unique.
    this.identifier = cyrb53(
      "I-" +
        new Date().getTime() +
        navigator.userAgent +
        window.innerWidth +
        window.innerHeight +
        getRandomInt(100, 999),
    );

    this.init = generalMethods.init;
    this.prestigeAugmentation = generalMethods.prestigeAugmentation;
    this.prestigeSourceFile = generalMethods.prestigeSourceFile;
    this.receiveInvite = generalMethods.receiveInvite;
    this.calculateSkill = generalMethods.calculateSkill;
    this.calculateSkillProgress = generalMethods.calculateSkillProgress;
    this.updateSkillLevels = generalMethods.updateSkillLevels;
    this.resetMultipliers = generalMethods.resetMultipliers;
    this.hasProgram = generalMethods.hasProgram;
    this.setMoney = generalMethods.setMoney;
    this.gainMoney = generalMethods.gainMoney;
    this.loseMoney = generalMethods.loseMoney;
    this.canAfford = generalMethods.canAfford;
    this.recordMoneySource = generalMethods.recordMoneySource;
    this.gainHackingExp = generalMethods.gainHackingExp;
    this.gainStrengthExp = generalMethods.gainStrengthExp;
    this.gainDefenseExp = generalMethods.gainDefenseExp;
    this.gainDexterityExp = generalMethods.gainDexterityExp;
    this.gainAgilityExp = generalMethods.gainAgilityExp;
    this.gainCharismaExp = generalMethods.gainCharismaExp;
    this.gainIntelligenceExp = generalMethods.gainIntelligenceExp;
    this.gainStats = generalMethods.gainStats;
    this.queryStatFromString = generalMethods.queryStatFromString;
    this.startWork = workMethods.start;
    this.processWork = workMethods.process;
    this.finishWork = workMethods.finish;
    this.startFocusing = generalMethods.startFocusing;
    this.stopFocusing = generalMethods.stopFocusing;
    this.takeDamage = generalMethods.takeDamage;
    this.regenerateHp = generalMethods.regenerateHp;
    this.hospitalize = generalMethods.hospitalize;
    this.applyForJob = generalMethods.applyForJob;
    this.getNextCompanyPosition = generalMethods.getNextCompanyPosition;
    this.quitJob = generalMethods.quitJob;
    this.hasJob = generalMethods.hasJob;
    this.applyForSoftwareJob = generalMethods.applyForSoftwareJob;
    this.applyForSoftwareConsultantJob = generalMethods.applyForSoftwareConsultantJob;
    this.applyForItJob = generalMethods.applyForItJob;
    this.applyForSecurityEngineerJob = generalMethods.applyForSecurityEngineerJob;
    this.applyForNetworkEngineerJob = generalMethods.applyForNetworkEngineerJob;
    this.applyForBusinessJob = generalMethods.applyForBusinessJob;
    this.applyForBusinessConsultantJob = generalMethods.applyForBusinessConsultantJob;
    this.applyForSecurityJob = generalMethods.applyForSecurityJob;
    this.applyForAgentJob = generalMethods.applyForAgentJob;
    this.applyForEmployeeJob = generalMethods.applyForEmployeeJob;
    this.applyForPartTimeEmployeeJob = generalMethods.applyForPartTimeEmployeeJob;
    this.applyForWaiterJob = generalMethods.applyForWaiterJob;
    this.applyForPartTimeWaiterJob = generalMethods.applyForPartTimeWaiterJob;
    this.isQualified = generalMethods.isQualified;
    this.reapplyAllAugmentations = generalMethods.reapplyAllAugmentations;
    this.reapplyAllSourceFiles = generalMethods.reapplyAllSourceFiles;
    this.checkForFactionInvitations = generalMethods.checkForFactionInvitations;
    this.setBitNodeNumber = generalMethods.setBitNodeNumber;
    this.queueAugmentation = generalMethods.queueAugmentation;
    this.gainCodingContractReward = generalMethods.gainCodingContractReward;
    this.travel = generalMethods.travel;
    this.gotoLocation = generalMethods.gotoLocation;
    this.canAccessGrafting = generalMethods.canAccessGrafting;
    this.giveExploit = generalMethods.giveExploit;
    this.giveAchievement = generalMethods.giveAchievement;
    this.getIntelligenceBonus = generalMethods.getIntelligenceBonus;
    this.getCasinoWinnings = generalMethods.getCasinoWinnings;
    this.hasAugmentation = augmentationMethods.hasAugmentation;
    this.canAccessBladeburner = bladeburnerMethods.canAccessBladeburner;
    this.inBladeburner = bladeburnerMethods.inBladeburner;
    this.startBladeburner = bladeburnerMethods.startBladeburner;
    this.canAccessCorporation = corporationMethods.canAccessCorporation;
    this.hasCorporation = corporationMethods.hasCorporation;
    this.startCorporation = corporationMethods.startCorporation;
    this.canAccessGang = gangMethods.canAccessGang;
    this.isAwareOfGang = gangMethods.isAwareOfGang;
    this.getGangFaction = gangMethods.getGangFaction;
    this.getGangName = gangMethods.getGangName;
    this.hasGangWith = gangMethods.hasGangWith;
    this.inGang = gangMethods.inGang;
    this.startGang = gangMethods.startGang;

    this.hasTorRouter = serverMethods.hasTorRouter;
    this.getCurrentServer = serverMethods.getCurrentServer;
    this.getHomeComputer = serverMethods.getHomeComputer;
    this.getUpgradeHomeRamCost = serverMethods.getUpgradeHomeRamCost;
    this.getUpgradeHomeCoresCost = serverMethods.getUpgradeHomeCoresCost;
    this.createHacknetServer = serverMethods.createHacknetServer;

    this.canAccessCotMG = generalMethods.canAccessCotMG;
    this.sourceFileLvl = generalMethods.sourceFileLvl;

    this.applyEntropy = augmentationMethods.applyEntropy;
    this.focusPenalty = generalMethods.focusPenalty;
  }

  whoAmI(): string {
    return "Player";
  }

  /**
   * Serialize the current object to a JSON save state.
   */
  toJSON(): IReviverValue {
    return Generic_toJSON("PlayerObject", this);
  }

  /**
   * Initiatizes a PlayerObject object from a JSON save state.
   */
  static fromJSON(value: IReviverValue): PlayerObject {
    return Generic_fromJSON(PlayerObject, value.data);
  }
}

Reviver.constructors.PlayerObject = PlayerObject;
