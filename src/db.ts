import Dexie, {type Table} from 'dexie';
import type {AppData} from './types';
class SoloLevelingDB extends Dexie { state!:Table<{id:string;data:AppData},string>; constructor(){super('solo-leveling-v1');this.version(1).stores({state:'id'});} }
export const db=new SoloLevelingDB();
export const DEFAULT_MODULES={workouts:[],study:[],revisions:[],career:[],food:[],water:[],sleep:[],selfControl:[],digital:[],governmentNotices:[]};
export const DEFAULT_DATA:AppData={schemaVersion:1,profile:{id:'local-player',displayName:'Player',createdAt:new Date().toISOString(),lifetimeXp:0,level:1},settings:{theme:'shadow',themeMode:'auto',sleepTargetHours:6,sleepMinimumHours:6,pinEnabled:false,quietHours:{enabled:true,start:'22:00',end:'07:00'},leaderboardEnabled:false},ranks:{fitness:{category:'fitness',tier:{rank:'Bronze',level:3},boundaryWins:0,successfulChallenges:0,failedChallenges:0},study:{category:'study',tier:{rank:'Bronze',level:3},boundaryWins:0,successfulChallenges:0,failedChallenges:0},career:{category:'career',tier:{rank:'Bronze',level:3},boundaryWins:0,successfulChallenges:0,failedChallenges:0},discipline:{category:'discipline',tier:{rank:'Bronze',level:3},boundaryWins:0,successfulChallenges:0,failedChallenges:0}},challenges:[],missions:[],inventory:[],achievements:[],modules:DEFAULT_MODULES};
export async function loadAppData():Promise<AppData>{const row=await db.state.get('main');if(!row){await db.state.put({id:'main',data:DEFAULT_DATA});return DEFAULT_DATA;}const data=row.data;let changed=false;data.modules={...DEFAULT_MODULES,...data.modules};if(data.settings.sleepTargetHours===7&&data.settings.sleepMinimumHours===6){data.settings.sleepTargetHours=6;changed=true;}if(changed||!row.data.modules)await db.state.put({id:'main',data});return data;}
export async function saveAppData(data:AppData){await db.state.put({id:'main',data});}


