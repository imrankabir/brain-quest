import test from 'node:test';
import assert from 'node:assert/strict';
import {shuffle,MemoryGame} from '../js/games/memory-game.js';
import {makeQuestion,NumberGame} from '../js/games/number-game.js';
import {generateMaze,aStar,manhattan,validateMaze} from '../js/algorithms/pathfinding.js';
import {LogicGame,LOGIC_LEVELS} from '../js/games/logic-game.js';
import {createPattern,validatePattern,PatternGame} from '../js/games/pattern-game.js';
import {createGame,GAME_REGISTRY} from '../js/core/game-registry.js';

function seeded(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
const direction=(a,b)=>a.x<b.x?'right':a.x>b.x?'left':a.y<b.y?'down':'up';

test('Fisher-Yates shuffle preserves every item and changes deterministic order',()=>{
 const input=[1,2,3,4,5,6],out=shuffle(input,seeded(42));assert.deepEqual([...out].sort(),input);assert.deepEqual(input,[1,2,3,4,5,6]);assert.notDeepEqual(out,input);
});
test('all 20 Memory Forest levels create valid unique matching pairs and complete',()=>{
 for(let level=1;level<=20;level++){const g=new MemoryGame(level);assert.equal(g.cards.length,g.pairs*2);assert.equal(new Set(g.cards.map(c=>c.id)).size,g.cards.length);for(const symbol of new Set(g.cards.map(c=>c.symbol)))assert.equal(g.cards.filter(c=>c.symbol===symbol).length,2);for(const symbol of new Set(g.cards.map(c=>c.symbol))){const pair=g.cards.filter(c=>c.symbol===symbol);assert.equal(g.choose(pair[0].id),true);assert.equal(g.choose(pair[1].id),true)}assert.equal(g.checkCompletion(),true);assert.equal(g.stats().accuracy,100)}
});
test('all 30 Number Kingdom levels generate valid answer choices and five-round games',()=>{
 for(let level=1;level<=30;level++){for(let i=0;i<100;i++){const q=makeQuestion(level,seeded(level*1000+i));assert.ok(q.question.length>0);assert.equal(q.choices.length,4);assert.equal(new Set(q.choices.map(String)).size,4);assert.ok(q.choices.some(v=>String(v)===String(q.answer)));assert.ok(Number.isFinite(Number(q.answer)));if(level<=11||level>=26)assert.ok(q.answer>=0)}const g=new NumberGame(level,seeded(level));for(let i=0;i<5;i++){const r=g.answer(g.question.answer);assert.equal(r.correct,true)}assert.equal(g.checkCompletion(),true);assert.equal(g.stats().accuracy,100)}
});
test('A* uses traversable cells, returns adjacent path and Manhattan heuristic',()=>{
 const grid=[[0,0,1],[1,0,0],[0,0,0]],path=aStar(grid,{x:0,y:0},{x:2,y:2});assert.ok(path);assert.deepEqual(path[0],{x:0,y:0});assert.deepEqual(path.at(-1),{x:2,y:2});for(let i=1;i<path.length;i++)assert.equal(manhattan(path[i-1],path[i]),1);assert.equal(aStar([[0,1],[1,0]],{x:0,y:0},{x:1,y:1}),null);
});
test('maze generator produces a solvable maze for every configured difficulty',()=>{
 for(const config of LOGIC_LEVELS){for(let seed=1;seed<=8;seed++){const maze=generateMaze(config.size,seeded(config.level*100+seed));assert.equal(maze.grid.length,config.size);assert.equal(validateMaze(maze),true);const path=aStar(maze.grid,maze.start,maze.goal);assert.ok(path);assert.deepEqual(path,maze.path);for(let i=1;i<path.length;i++)assert.equal(manhattan(path[i-1],path[i]),1)}}
});
test('all 20 Logic Mountain levels are completable with generated solution and collectibles',()=>{
 for(let level=1;level<=20;level++){const g=new LogicGame(level,seeded(level+10));let completed=false;g.onComplete=()=>{completed=true};const path=g.maze.path;for(let i=1;i<path.length;i++){assert.equal(g.addInstruction(direction(path[i-1],path[i])),true);if(g.instructions.length===g.config.moveAllowance)g.execute()}if(g.instructions.length)g.execute();assert.equal(g.position.x,g.maze.goal.x);assert.equal(g.position.y,g.maze.goal.y);assert.equal(g.collected.size,g.collectibles.length);assert.equal(g.checkCompletion(),true);assert.equal(completed,true)}
});
test('all 20 Pattern Ocean challenges validate, expose unique choices and accept every declared answer',()=>{
 for(let level=1;level<=20;level++){const p=createPattern(level);assert.equal(validatePattern(p),true);assert.equal(p.choices.length,4);assert.equal(new Set(p.choices.map(String)).size,4);const g=new PatternGame(level);for(const answer of p.answers){const fresh=new PatternGame(level);let completed=false;fresh.onComplete=()=>{completed=true};const result=fresh.answer(answer);assert.equal(result.correct,true);assert.equal(result.finished,true);assert.equal(fresh.checkCompletion(),true);assert.equal(completed,true)} }
 assert.deepEqual(createPattern(17).answers,[5,1]);
});
test('registry exposes four independent game modules and factory creates all 90 level instances',()=>{
 assert.deepEqual(Object.keys(GAME_REGISTRY).sort(),['logic','memory','numbers','pattern']);for(const [id,count] of [['memory',20],['numbers',30],['logic',20],['pattern',20]])for(let level=1;level<=count;level++){const game=createGame(id,level,{random:seeded(level)});assert.ok(game);assert.equal(typeof game.handleAction,'function');assert.equal(typeof game.checkCompletion,'function');assert.equal(typeof game.calculateScore,'function');assert.equal(typeof game.getHint,'function');assert.equal(typeof game.initialize,'function')}
 assert.throws(()=>createGame('unknown',1),RangeError);
});
test('game modules provide English and Urdu contextual hints',()=>{
 assert.equal(typeof new MemoryGame(1).getHint(1,'ur'),'string');assert.equal(typeof new NumberGame(1).getHint(2,'ur'),'string');assert.equal(typeof new LogicGame(1,seeded(3)).getHint(1,'ur'),'string');assert.equal(typeof new PatternGame(1).getHint(3,'ur'),'string');assert.match(new LogicGame(1,seeded(5)).getHint(3,'ur'),/[؀-ۿ]/);assert.match(new NumberGame(1).getHint(3,'ur'),/[؀-ۿ]/);
});
