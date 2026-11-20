import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEfficiency, calculateScore, starsForScore, validateSessionStats } from '../js/services/scoring.js';
import { defaultSkillProfile, updateSkillProfile, effectiveLevel, skillForIsland, SKILLS } from '../js/services/adaptive-difficulty.js';
import { ACHIEVEMENTS, eligibleAchievements } from '../js/services/achievements.js';
import { evaluateAchievements } from '../js/services/achievement-manager.js';
import { DB_VERSION, STORE_NAMES, upgradeSchema } from '../js/storage/database.js';
import { ProgressRepository, SkillRepository, AchievementRepository } from '../js/storage/repositories.js';
import { createGame } from '../js/core/game-registry.js';

class MemoryDB {
  constructor() { this.stores = new Map(['players','progress','results','skills','achievements','dailyActivity'].map(name => [name, new Map()])); this.fallback = true; }
  async all(store) { return [...this.stores.get(store).values()]; }
  async get(store,id) { return this.stores.get(store).get(id) || null; }
  async put(store,value) { this.stores.get(store).set(value.id, structuredClone(value)); return value; }
  async delete(store,id) { this.stores.get(store).delete(id); }
}
const high = { score: 100, accuracy: 100, mistakes: 0, hints: 0, complexity: 3, at: '2026-01-01T00:00:00.000Z' };

test('normalized score formula, component clamping and completion handling', () => {
  const perfect = calculateScore({ island:'numbers', stats:{accuracy:100,rounds:5,mistakes:0,hints:0}, completed:true });
  assert.equal(perfect.score,100); assert.equal(perfect.stars,3);
  assert.deepEqual([starsForScore(90),starsForScore(89),starsForScore(70),starsForScore(69),starsForScore(0),starsForScore(100,false)],[3,2,2,1,0,0]);
  assert.deepEqual(perfect.components,{accuracy:1,efficiency:1,independence:1});
  const incomplete = calculateScore({ island:'numbers', stats:{accuracy:100,rounds:5}, completed:false });
  assert.equal(incomplete.score,0); assert.equal(incomplete.stars,0);
  const bounded = calculateScore({ island:'pattern', stats:{accuracy:150,attempts:1,hints:-3}, completed:true });
  assert.equal(bounded.score,100);
});

test('challenge-specific efficiency calculations are bounded and correct', () => {
  assert.equal(calculateEfficiency('memory',{pairs:4,moves:8}),.5);
  assert.equal(calculateEfficiency('numbers',{rounds:5,mistakes:5}),.5);
  assert.equal(calculateEfficiency('logic',{optimalMoves:10,moves:20}),.5);
  assert.equal(calculateEfficiency('pattern',{attempts:4}),.25);
  assert.equal(calculateEfficiency('memory',{pairs:4,moves:0}),0);
  assert.equal(calculateEfficiency('unknown',{}),0);
});

test('session statistics validation rejects negative, non-finite and out-of-range values', () => {
  assert.equal(validateSessionStats({accuracy:100,mistakes:0,hints:0}),true);
  assert.equal(validateSessionStats({accuracy:101}),false);
  assert.equal(validateSessionStats({accuracy:80,hints:-1}),false);
  assert.equal(validateSessionStats({accuracy:NaN}),false);
  assert.equal(validateSessionStats(null),false);
});

test('adaptive profiles are independent, bounded and use a sustained-performance window', () => {
  assert.deepEqual(SKILLS,['memory','mathematics','logic','pattern']);
  let profile=defaultSkillProfile('child-a','memory');
  for(let i=0;i<5;i++) profile=updateSkillProfile(profile,{...high,at:`2026-01-0${i+1}T00:00:00.000Z`});
  assert.equal(profile.difficulty,4); // three high-average updates after the minimum sample
  assert.equal(profile.recent.length,5);
  const other=defaultSkillProfile('child-b','memory');
  assert.equal(other.difficulty,3); assert.notEqual(other.id,profile.id);
  let struggling=defaultSkillProfile('child-a','logic');
  for(let i=0;i<5;i++) struggling=updateSkillProfile(struggling,{score:0,accuracy:0,mistakes:5,hints:3});
  assert.equal(struggling.difficulty,2);
  assert.throws(()=>updateSkillProfile(profile,{score:101}),/normalized score/);
});

test('adaptive difficulty applies one-band offsets, clamps edges and maps each island skill', () => {
  assert.equal(effectiveLevel(10,20,3),10);
  assert.equal(effectiveLevel(10,20,5),12);
  assert.equal(effectiveLevel(1,20,1),1);
  assert.equal(effectiveLevel(30,30,5),30);
  assert.equal(skillForIsland('numbers'),'mathematics');
  assert.equal(skillForIsland('pattern'),'pattern');
  assert.equal(skillForIsland('other'),null);
});

test('achievement eligibility rules cover first completion, all islands, perfection and persistence', () => {
  const progressRows=['memory','numbers','logic','pattern'].map(island=>({island,completed:{1:2},crystals:15}));
  const result={score:100,completed:true,stats:{hints:0}};
  const ids=eligibleAchievements({result,results:Array(10).fill({}),progressRows});
  for(const id of ['first-step','four-worlds','perfect-focus','hint-free','ten-adventures','crystal-collector']) assert.ok(ids.includes(id));
  assert.equal(ACHIEVEMENTS.length,6);
});

test('IndexedDB v1-to-v2 schema upgrade adds stores without replacing existing stores', () => {
  const names=new Set(['players','progress','results']);
  const fake={objectStoreNames:{contains:name=>names.has(name)},createObjectStore:(name,options)=>{names.add(name);return{name,options};}};
  upgradeSchema(fake);
  assert.equal(DB_VERSION,2);
  for(const name of STORE_NAMES) assert.ok(names.has(name));
  assert.equal(names.size,6);
});

test('progress replay preserves best score and does not award duplicate crystals', async () => {
  const db=new MemoryDB(),repo=new ProgressRepository(db);
  const first=await repo.complete('kid','memory',1,2,10,84);
  const replay=await repo.complete('kid','memory',1,3,15,95);
  const row=await repo.get('kid','memory');
  assert.equal(first.firstCompletion,true); assert.equal(replay.firstCompletion,false);
  assert.equal(row.crystals,10); assert.equal(row.completed[1],3); assert.equal(row.bestScores[1],95);
  assert.equal(row.stars,3);
});

test('skill and achievement repositories isolate profiles and unlock rewards once', async () => {
  const db=new MemoryDB(),skillRepo=new SkillRepository(db),achievementRepo=new AchievementRepository(db);
  const profile=await skillRepo.get('kid-a','memory'); profile.difficulty=4; await skillRepo.save(profile);
  assert.equal((await skillRepo.get('kid-a','memory')).difficulty,4);
  assert.equal((await skillRepo.get('kid-b','memory')).difficulty,3);
  const badge=ACHIEVEMENTS[0];
  assert.equal((await achievementRepo.unlock('kid-a',badge)).unlocked,true);
  assert.equal((await achievementRepo.unlock('kid-a',badge)).unlocked,false);
  assert.equal((await achievementRepo.forPlayer('kid-b')).length,0);
});

test('achievement manager persists newly earned awards and prevents replay duplicates', async () => {
  const db=new MemoryDB(),progress=new ProgressRepository(db),achievementRepo=new AchievementRepository(db);
  const resultRepo={all:()=>db.all('results')};
  const result={id:'r1',playerId:'kid',island:'memory',score:100,completed:true,stats:{hints:0},createdAt:'2026-02-01T00:00:00.000Z'};
  await db.put('results',result); await progress.complete('kid','memory',1,3,15,100);
  const args={playerId:'kid',result,resultRepository:resultRepo,progressRepository:progress,achievementRepository:achievementRepo};
  const first=await evaluateAchievements(args),second=await evaluateAchievements(args);
  assert.ok(first.some(a=>a.id==='first-step')); assert.ok(first.some(a=>a.id==='perfect-focus'));
  assert.equal(second.length,0);
});

test('all 90 registered levels remain constructible and score-safe after Phase 3 integration', () => {
  for(const [island,count] of [['memory',20],['numbers',30],['logic',20],['pattern',20]]) {
    for(let level=1;level<=count;level++) {
      const game=createGame(island,level,{random:()=>.37});
      assert.equal(typeof game.checkCompletion,'function');
      assert.equal(typeof game.stats,'function');
      assert.ok(game.level>=1 && game.level<=count);
    }
  }
});

test('adaptive hysteresis resets after mixed performance and retains only the latest ten sessions', () => {
  let profile=defaultSkillProfile('kid','pattern');
  for(let i=0;i<3;i++) profile=updateSkillProfile(profile,{score:100});
  assert.equal(profile.upwardStreak,1);
  profile=updateSkillProfile(profile,{score:0});
  assert.equal(profile.upwardStreak,0);
  assert.equal(profile.difficulty,3);
  for(let i=0;i<12;i++) profile=updateSkillProfile(profile,{score:70});
  assert.equal(profile.recent.length,10);
});

test('all four game modules expose validated score statistics and memory hints are counted', () => {
  const memory=createGame('memory',1); memory.getHint(1,'en');
  for(const symbol of new Set(memory.cards.map(card=>card.symbol))){const pair=memory.cards.filter(card=>card.symbol===symbol);memory.choose(pair[0].id);memory.choose(pair[1].id);}
  assert.equal(memory.stats().hints,1); assert.equal(validateSessionStats(memory.stats()),true);
  const numbers=createGame('numbers',1);for(let i=0;i<5;i++)numbers.answer(numbers.question.answer);
  assert.equal(validateSessionStats(numbers.stats()),true);
  const logic=createGame('logic',1,{random:()=>.31});
  const path=logic.maze.path;const direction=(a,b)=>a.x<b.x?'right':a.x>b.x?'left':a.y<b.y?'down':'up';
  for(let i=1;i<path.length;i++){logic.addInstruction(direction(path[i-1],path[i]));if(logic.instructions.length===logic.config.moveAllowance)logic.execute();}
  if(logic.instructions.length)logic.execute();
  assert.equal(validateSessionStats(logic.stats()),true);
  const pattern=createGame('pattern',1);pattern.answer(pattern.challenge.answers[0]);
  assert.equal(validateSessionStats(pattern.stats()),true);
});
