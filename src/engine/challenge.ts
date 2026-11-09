import type {AppData,Category,Challenge,RankName,Tier} from '../types';

export const RANKS:RankName[]=['Bronze','Silver','Gold','Platinum','Diamond','Emerald'];
export const CATEGORY_MISSIONS:Record<Category,string[]>={fitness:['fitness'],study:['study','revision'],career:['career'],discipline:['self_control','sleep','digital']};

export function addDays(iso:string,n:number){const d=new Date(`${iso}T12:00:00`);d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function challengeEnd(startDate:string){return addDays(startDate,20);}
function challengeDates(challenge:Challenge){const result:string[]=[];for(let date=challenge.startDate;date<=challenge.endDate;date=addDays(date,1))result.push(date);return result;}

export function scoreCategory(data:AppData,challenge:Challenge,category:Category){
 const ids=CATEGORY_MISSIONS[category];let possible=0,earned=0;
 for(const date of challengeDates(challenge))for(const missionId of ids){
  const rows=data.missions.filter(m=>m.date===date&&m.missionId===missionId).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
  const row=rows.at(-1);
  // A missed or unlogged eligible mission remains possible but not earned. A used skip is excused, never a completion.
  if(row?.status==='skipped')continue;
  possible+=1;
  if(row?.status==='complete')earned+=1;
 }
 const percentage=possible?Math.round(earned/possible*100):0;
 return {earned,possible,percentage,passed:possible>0&&percentage>=80};
}

export function nextTier(tier:Tier):Tier{const ri=RANKS.indexOf(tier.rank);if(tier.level===3)return {rank:tier.rank,level:2};if(tier.level===2)return {rank:tier.rank,level:1};if(ri===RANKS.length-1)return tier;return {rank:RANKS[ri+1],level:3};}
export function previousTier(tier:Tier):Tier{const ri=RANKS.indexOf(tier.rank);if(tier.level===1)return {rank:tier.rank,level:2};if(tier.level===2)return {rank:tier.rank,level:3};if(ri===0)return tier;return {rank:RANKS[ri-1],level:1};}
export function requiredWins(tier:Tier){return tier.level===1&&tier.rank!=='Emerald'?2:1;}
export function applyCategoryResult(data:AppData,category:Category,passed:boolean){
 const p=data.ranks[category];
 if(passed){p.successfulChallenges++;if(requiredWins(p.tier)===2){p.boundaryWins++;if(p.boundaryWins>=2){p.tier=nextTier(p.tier);p.boundaryWins=0;}}else{p.tier=nextTier(p.tier);p.boundaryWins=0;}}
 else{p.failedChallenges++;p.tier=previousTier(p.tier);p.boundaryWins=0;}
 return p;
}

export function evaluateChallenge(data:AppData,challenge:Challenge){
 if(challenge.status!=='active'||data.challenges.some(c=>c.id===challenge.id))throw new Error('This challenge has already been evaluated.');
 const today=new Date();const todayLocal=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 if(challenge.endDate>todayLocal)throw new Error('This 21-day challenge is still in progress.');
 const results={} as NonNullable<Challenge['categoryResults']>;
 for(const category of ['fitness','study','career','discipline'] as Category[]){const result=scoreCategory(data,challenge,category);results[category]=result;applyCategoryResult(data,category,result.passed);}
 const possible=Object.values(results).reduce((sum,r)=>sum+r.possible,0);const earned=Object.values(results).reduce((sum,r)=>sum+r.earned,0);const overallPercentage=possible?Math.round(earned/possible*100):0;
 challenge.categoryResults=results;challenge.overallPercentage=overallPercentage;challenge.status=overallPercentage>=80?'passed':'failed';challenge.completedAt=new Date().toISOString();data.challenges.push(challenge);data.activeChallenge=undefined;
 if(challenge.status==='passed'&&data.challenges.filter(c=>c.status==='passed').length%2===0){const existing=data.inventory.find(i=>i.kind==='recovery_skip'&&i.target==='any');if(existing)existing.quantity++;else data.inventory.push({id:crypto.randomUUID(),kind:'recovery_skip',target:'any',label:'Recovery Skip',quantity:1,earnedAt:new Date().toISOString()});}
 return challenge;
}
