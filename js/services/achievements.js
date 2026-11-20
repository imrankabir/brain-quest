export const ACHIEVEMENTS=Object.freeze([
{id:'first-step',title:{en:'First Steps',ur:'پہلا قدم'},description:{en:'Complete your first challenge.',ur:'اپنا پہلا چیلنج مکمل کریں۔'},crystals:5},
{id:'four-worlds',title:{en:'Four-World Explorer',ur:'چار دنیاؤں کا مسافر'},description:{en:'Complete at least one level on every island.',ur:'ہر جزیرے پر کم از کم ایک مرحلہ مکمل کریں۔'},crystals:10},
{id:'perfect-focus',title:{en:'Perfect Focus',ur:'مکمل توجہ'},description:{en:'Finish a challenge with 100% accuracy.',ur:'سو فیصد درستگی کے ساتھ چیلنج مکمل کریں۔'},crystals:5},
{id:'hint-free',title:{en:'Independent Thinker',ur:'خود سوچنے والا'},description:{en:'Complete a challenge without hints.',ur:'بغیر اشارے کے چیلنج مکمل کریں۔'},crystals:5},
{id:'ten-adventures',title:{en:'Ten Adventures',ur:'دس مہمات'},description:{en:'Complete ten challenge sessions.',ur:'دس چیلنج مکمل کریں۔'},crystals:10},
{id:'crystal-collector',title:{en:'Crystal Collector',ur:'کرسٹل جمع کرنے والا'},description:{en:'Earn 50 knowledge crystals.',ur:'پچاس علم کے کرسٹل حاصل کریں۔'},crystals:10}
]);
export function eligibleAchievements({result,results=[],progressRows=[]}){const ids=[];if(results.length>=1)ids.push('first-step');if(['memory','numbers','logic','pattern'].every(island=>progressRows.some(p=>p.island===island&&Object.keys(p.completed||{}).length)))ids.push('four-worlds');if(result?.score===100&&result?.completed)ids.push('perfect-focus');if(result?.completed&&Number(result?.stats?.hints||0)===0)ids.push('hint-free');if(results.length>=10)ids.push('ten-adventures');if(progressRows.reduce((s,p)=>s+(p.crystals||0),0)>=50)ids.push('crystal-collector');return ids;}
