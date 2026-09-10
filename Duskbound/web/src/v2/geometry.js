export const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function segmentCircle(a,b,c,r){const dx=b.x-a.x,dy=b.y-a.y,ox=a.x-c.x,oy=a.y-c.y,A=dx*dx+dy*dy,C=ox*ox+oy*oy-r*r;if(C<=0)return 0;if(A===0)return null;const B=2*(ox*dx+oy*dy),d=B*B-4*A*C;if(d<0)return null;const t=(-B-Math.sqrt(d))/(2*A);return t>=0&&t<=1?t:null;}
export function segmentBox(a,b,rect,r=0){let enter=0,exit=1;for(const axis of ['x','y']){const lo=rect[axis]-r,hi=rect[axis]+(axis==='x'?rect.w:rect.h)+r,d=b[axis]-a[axis];if(Math.abs(d)<1e-9){if(a[axis]<lo||a[axis]>hi)return null;}else{const u=(lo-a[axis])/d,v=(hi-a[axis])/d;enter=Math.max(enter,Math.min(u,v));exit=Math.min(exit,Math.max(u,v));if(enter>exit)return null;}}return enter;}
export function firstWall(a,b,walls,r=0){let best=null;for(const wall of walls){const t=segmentBox(a,b,wall,r);if(t!==null&&(best===null||t<best))best=t;}return best;}
export const visible=(a,b,walls,r=0)=>firstWall(a,b,walls,r)===null;
// A small visibility graph makes the sample enemies navigate both sides of cover.
export function nextWaypoint(start,goal,walls,r=7){
 const escape=p=>{for(const w of walls){const left=w.x-r-.5,right=w.x+w.w+r+.5,top=w.y-r-.5,bottom=w.y+w.h+r+.5;if(p.x>left&&p.x<right&&p.y>top&&p.y<bottom){return [{x:left,y:p.y},{x:right,y:p.y},{x:p.x,y:top},{x:p.x,y:bottom}].sort((a,b)=>distance(a,p)-distance(b,p))[0];}}return p;};
 const origin=escape(start);if(origin!==start)return origin;
 goal=escape(goal);
 if(visible(start,goal,walls,r))return goal;
 const nodes=[start,goal];for(const w of walls)for(const x of [w.x-r-2,w.x+w.w+r+2])for(const y of [w.y-r-2,w.y+w.h+r+2])nodes.push({x,y});
 const cost=nodes.map(()=>Infinity),previous=nodes.map(()=>-1),visited=new Set();cost[0]=0;
 for(let step=0;step<nodes.length;step++){let u=-1;for(let i=0;i<nodes.length;i++)if(!visited.has(i)&&(u<0||cost[i]<cost[u]))u=i;if(u<0||cost[u]===Infinity)break;if(u===1){let next=1;while(previous[next]>0)next=previous[next];return nodes[next];}visited.add(u);for(let v=0;v<nodes.length;v++){if(visited.has(v)||!visible(nodes[u],nodes[v],walls,r))continue;const c=cost[u]+distance(nodes[u],nodes[v]);if(c<cost[v]){cost[v]=c;previous[v]=u;}}}
 return goal;
}
export function inSector(origin,target,direction,range,arc,r=0){const d=distance(origin,target);return d<=range+r+2&&(d<=r||Math.abs(angleDiff(Math.atan2(target.y-origin.y,target.x-origin.x),direction))<=arc/2+Math.asin(Math.min(1,(r+2)/Math.max(1,d))));}
export function moveCircle(entity,dx,dy,walls,bounds,r=7){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/3));
 const valid=(x,y)=>walls.every(w=>{const nx=clamp(x,w.x,w.x+w.w),ny=clamp(y,w.y,w.y+w.h);return Math.hypot(x-nx,y-ny)>=r-.001;});
 for(let i=0;i<steps;i++){const x=clamp(entity.x+dx/steps,bounds.x+r,bounds.x+bounds.w-r);if(valid(x,entity.y))entity.x=x;const y=clamp(entity.y+dy/steps,bounds.y+r,bounds.y+bounds.h-r);if(valid(entity.x,y))entity.y=y;}
}
