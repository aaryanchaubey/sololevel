export type Category = 'fitness'|'study'|'career'|'discipline';
export type RankName = 'Bronze'|'Silver'|'Gold'|'Platinum'|'Diamond'|'Emerald';
export type Tier = {rank:RankName;level:3|2|1};
export type MissionId = 'self_control'|'fitness'|'career'|'sleep'|'study'|'revision'|'digital';
export type MissionStatus = 'complete'|'missed'|'skipped'|'pending';
export interface MissionLog {id:string;date:string;missionId:MissionId;status:MissionStatus;xp:number;note?:string;createdAt:string}
export interface Challenge {id:string;startDate:string;endDate:string;status:'active'|'passed'|'failed';categoryResults?:Record<Category,{earned:number;possible:number;percentage:number;passed:boolean}>;overallPercentage?:number;createdAt:string;completedAt?:string}
export interface RankProgress {category:Category;tier:Tier;boundaryWins:number;successfulChallenges:number;failedChallenges:number}
export interface InventoryItem {id:string;kind:'recovery_skip'|'booster';target:Category|'any';label:string;quantity:number;earnedAt:string;expiresAt?:string}
export interface AppSettings {theme:string;themeMode?:'auto'|'manual';sleepTargetHours:number;sleepMinimumHours:number;backupFolderHandle?:FileSystemDirectoryHandle;lastWeeklyBackupAt?:string;pinEnabled:boolean;quietHours:{enabled:boolean;start:string;end:string};leaderboardEnabled:boolean}
export interface AppProfile {id:'local-player';displayName:string;createdAt:string;lifetimeXp:number;level:number}
export interface AppData {schemaVersion:number;profile:AppProfile;settings:AppSettings;ranks:Record<Category,RankProgress>;activeChallenge?:Challenge;challenges:Challenge[];missions:MissionLog[];inventory:InventoryItem[];achievements:string[]}
