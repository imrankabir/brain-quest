import assert from 'node:assert/strict';
import {shuffle,MemoryGame} from '../js/games/memory-game.js';
import {makeQuestion,NumberGame} from '../js/games/number-game.js';
const shuffled=shuffle([1,2,3,4],()=>0.5);assert.equal(shuffled.length,4);assert.deepEqual([...shuffled].sort(),[1,2,3,4]);
for(let level=1;level<=20;level++){const game=new MemoryGame(level);assert.equal(game.cards.length,game.pairs*2);assert.equal(new Set(game.cards.map(c=>c.id)).size,game.cards.length);for(const symbol of new Set(game.cards.map(c=>c.symbol)))assert.equal(game.cards.filter(c=>c.symbol===symbol).length,2)}
for(let level=1;level<=30;level++)for(let i=0;i<100;i++){const q=makeQuestion(level);assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(q.choices.includes(q.answer));assert(Number.isFinite(q.answer))}
const ng=new NumberGame(1);const result=ng.answer(ng.question.answer);assert.equal(result.correct,true);console.log('PASS: shuffle, memory pair construction (levels 1–20), arithmetic question generation (levels 1–30; 100 each), answer validation');
