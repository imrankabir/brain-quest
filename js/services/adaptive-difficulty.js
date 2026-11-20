const SKILLS=Object.freeze(['memory','mathematics','logic','pattern']);
export const WINDOW_SIZE=10,MIN_SAMPLE=3;
export function defaultSkillProfile(playerId,skill){if(!SKILLS.includes(skill))throw new RangeError(`Unknown skill: ${skill}`);return{id:`${playerId}:${skill}`,playerId,skill,difficulty:3,recent:[],sessions:0,upwardStreak:0,downwardStreak:0,lastScore:null,updatedAt:null};}
export function updateSkillProfile(profile,result){
 if(!profile||!SKILLS.includes(profile.skill))throw new TypeError('A valid skill profile is required');
 if(!result||!Number.isFinite(result.score)||result.score<0||result.score>100)throw new TypeError('A valid normalized score (0–100) is required');
 const next={...profile,recent:[...(Array.isArray(profile.recent)?profile.recent:[]),{score:result.score,accuracy:result.accuracy??null,mistakes:result.mistakes??0,hints:result.hints??0,complexity:result.complexity??3,at:result.at||new Date().toISOString()}].slice(-WINDOW_SIZE),sessions:(profile.sessions||0)+1,lastScore:result.score,updatedAt:result.at||new Date().toISOString()};
 if(next.recent.length<MIN_SAMPLE)return next;
 const avg=next.recent.reduce((s,x)=>s+x.score,0)/next.recent.length;
 if(avg>=85){next.upwardStreak=(profile.upwardStreak||0)+1;next.downwardStreak=0;}else if(avg<=55){next.downwardStreak=(profile.downwardStreak||0)+1;next.upwardStreak=0;}else{next.upwardStreak=0;next.downwardStreak=0;}
 if(next.upwardStreak>=3&&next.difficulty<5){next.difficulty++;next.upwardStreak=0;}else if(next.downwardStreak>=3&&next.difficulty>1){next.difficulty--;next.downwardStreak=0;}
 next.averageRecentScore=Math.round(avg);return next;
}
export function effectiveLevel(baseLevel,maxLevel,difficulty=3){const band=Math.max(1,Math.min(5,Number(difficulty)||3));return Math.max(1,Math.min(maxLevel,Math.round(baseLevel)+band-3));}
export function skillForIsland(island){return({memory:'memory',numbers:'mathematics',logic:'logic',pattern:'pattern'})[island]||null;}
export {SKILLS};
