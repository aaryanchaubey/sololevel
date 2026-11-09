import type {AppData,MissionId} from '../types';

export const ACHIEVEMENT_LABELS:Record<string,string>={first_mission:'First Mission',perfect_day:'Seven for Seven',ten_workouts:'Ten Training Sessions',hundred_study_hours:'100 Focused Study Hours',fifty_career_actions:'50 Career Actions',first_challenge:'First 21-Day Challenge',first_gold:'Reached Gold'};
const missions:MissionId[]=['self_control','fitness','career','sleep','study','revision','digital'];

export function syncAchievements(data:AppData):AppData{
 const earned=new Set(data.achievements);
 if(data.missions.some(m=>m.status==='complete'))earned.add('first_mission');
 const days=new Map<string,Set<string>>();for(const row of data.missions)if(row.status==='complete'){const set=days.get(row.date)??new Set<string>();set.add(row.missionId);days.set(row.date,set);}
 if([...days.values()].some(set=>missions.every(m=>set.has(m))))earned.add('perfect_day');
 if((data.modules?.workouts.length??0)>=10)earned.add('ten_workouts');
 if((data.modules?.study.reduce((sum,row)=>sum+row.minutes,0)??0)>=6000)earned.add('hundred_study_hours');
 if((data.modules?.career.length??0)>=50)earned.add('fifty_career_actions');
 if(data.challenges.some(challenge=>challenge.status==='passed'))earned.add('first_challenge');
 const order=['Bronze','Silver','Gold','Platinum','Diamond','Emerald'];
 if(Object.values(data.ranks).some(progress=>order.indexOf(progress.tier.rank)>=2))earned.add('first_gold');
 return {...data,achievements:[...earned]};
}
