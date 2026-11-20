const clamp01 = value => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));
const positive = value => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0);
export function calculateEfficiency(island, stats = {}) {
  switch (island) {
    case 'memory': { const pairs=positive(stats.pairs), moves=positive(stats.moves); return pairs ? (moves ? clamp01(pairs/moves) : 0) : 0; }
    case 'numbers': { const rounds=positive(stats.rounds || 5), mistakes=positive(stats.mistakes); return clamp01(rounds/(rounds+mistakes)); }
    case 'logic': { const optimal=positive(stats.optimalMoves), moves=positive(stats.moves); return optimal ? (moves ? clamp01(optimal/moves) : 0) : 0; }
    case 'pattern': { const attempts=positive(stats.attempts); return attempts ? clamp01(1/attempts) : 0; }
    default: return 0;
  }
}
export function starsForScore(score, completed = true) {
  if (!completed) return 0;
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  return value >= 90 ? 3 : value >= 70 ? 2 : value > 0 ? 1 : 0;
}
export function calculateScore({ island, stats = {}, durationSeconds = 0, completed = false } = {}) {
  const safe=stats && typeof stats==='object'?stats:{};
  const accuracy=clamp01(positive(safe.accuracy)/100), efficiency=calculateEfficiency(island,safe);
  const independence=clamp01(1-positive(safe.hints)/3);
  const score=completed?Math.round(100*(.60*accuracy+.20*efficiency+.20*independence)):0;
  const stars=starsForScore(score,completed);
  return {score,stars,completed:Boolean(completed),components:{accuracy:+accuracy.toFixed(3),efficiency:+efficiency.toFixed(3),independence:+independence.toFixed(3)},durationSeconds:Math.round(positive(durationSeconds))};
}
export function validateSessionStats(stats) {
  if(!stats||typeof stats!=='object')return false;
  for(const key of ['accuracy','mistakes','hints','moves','rounds','pairs','attempts','optimalMoves']) if(stats[key]!==undefined&&(!Number.isFinite(Number(stats[key]))||Number(stats[key])<0))return false;
  return stats.accuracy===undefined||Number(stats.accuracy)<=100;
}
