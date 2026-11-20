/** Grid pathfinding utilities. Grid cells: 0=open, 1=wall. */
export const manhattan=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const key=p=>`${p.x},${p.y}`;
export function aStar(grid,start,goal){
  const h=grid.length,w=grid[0]?.length||0;
  const inside=p=>p.x>=0&&p.y>=0&&p.x<w&&p.y<h;
  if(!inside(start)||!inside(goal)||grid[start.y][start.x]||grid[goal.y][goal.x])return null;
  const open=[{...start,g:0,f:manhattan(start,goal)}],came=new Map(),gScore=new Map([[key(start),0]]),closed=new Set();
  const dirs=[{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
  while(open.length){open.sort((a,b)=>a.f-b.f||a.g-b.g);const cur=open.shift(),ck=key(cur);if(closed.has(ck))continue;if(cur.x===goal.x&&cur.y===goal.y){const path=[{x:cur.x,y:cur.y}];let k=ck;while(came.has(k)){const prev=came.get(k);path.unshift(prev);k=key(prev)}return path}
    closed.add(ck);for(const d of dirs){const n={x:cur.x+d.x,y:cur.y+d.y},nk=key(n);if(!inside(n)||grid[n.y][n.x]||closed.has(nk))continue;const tentative=cur.g+1;if(tentative<(gScore.get(nk)??Infinity)){came.set(nk,{x:cur.x,y:cur.y});gScore.set(nk,tentative);open.push({...n,g:tentative,f:tentative+manhattan(n,goal)})}}
  }return null;
}
export function generateMaze(size=7,random=Math.random){
  size=Math.max(5,Math.min(15,size|0));if(size%2===0)size++;
  const grid=Array.from({length:size},()=>Array(size).fill(1)),start={x:1,y:1};grid[1][1]=0;
  const stack=[start],dirs=[[0,-2],[2,0],[0,2],[-2,0]];
  while(stack.length){const cur=stack[stack.length-1],choices=dirs.map(([dx,dy])=>({x:cur.x+dx,y:cur.y+dy,dx,dy})).filter(n=>n.x>0&&n.y>0&&n.x<size-1&&n.y<size-1&&grid[n.y][n.x]===1);if(!choices.length){stack.pop();continue}const n=choices[Math.floor(random()*choices.length)];grid[cur.y+n.dy/2][cur.x+n.dx/2]=0;grid[n.y][n.x]=0;stack.push({x:n.x,y:n.y})}
  const goal={x:size-2,y:size-2};grid[goal.y][goal.x]=0;const path=aStar(grid,start,goal);if(!path)throw new Error('Maze generator produced an unsolvable maze');return{grid,start,goal,path};
}
export function validateMaze(maze){return !!maze&&Array.isArray(maze.grid)&&Array.isArray(aStar(maze.grid,maze.start,maze.goal));}
