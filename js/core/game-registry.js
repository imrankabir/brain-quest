import {MemoryGame} from '../games/memory-game.js';
import {NumberGame} from '../games/number-game.js';
import {LogicGame} from '../games/logic-game.js';
import {PatternGame} from '../games/pattern-game.js';
/** Factory registry keeps island selection independent from screen rendering. */
export const GAME_REGISTRY=Object.freeze({memory:MemoryGame,numbers:NumberGame,logic:LogicGame,pattern:PatternGame});
export function createGame(islandId,level,options={}){const Module=GAME_REGISTRY[islandId];if(!Module)throw new RangeError(`Unknown game module: ${islandId}`);return new Module(level,options.random||Math.random)}
