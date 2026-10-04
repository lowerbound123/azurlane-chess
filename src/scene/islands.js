import * as THREE from 'three';
import { hexToXY, xyToHex, key, add } from '../engine.js';

// Connected, reusable footprints; rotations and reflections are supported by the same builder.
export const ISLAND_FORMS = [
  ['islet', [[0,0]]], ['pair', [[0,0],[1,0]]],
  ['ridge3', [[0,0],[1,0],[2,0]]], ['bend3', [[0,0],[1,0],[1,1]]], ['triangle3', [[0,0],[1,0],[0,1]]],
  ['ridge4', [[0,0],[1,0],[2,0],[3,0]]], ['hook4', [[0,0],[1,0],[2,0],[2,1]]],
  ['diamond4', [[0,0],[1,0],[0,1],[1,1]]], ['fork4', [[0,0],[1,0],[-1,1],[0,-1]]],
  ['ridge5', [[0,0],[1,0],[2,0],[3,0],[4,0]]], ['hook5', [[0,0],[1,0],[2,0],[2,1],[2,2]]],
  ['cove5', [[0,0],[1,0],[2,0],[0,1],[2,-1]]], ['crown5', [[0,0],[1,0],[0,1],[-1,1],[0,-1]]],
].map(([name, coords]) => ({ name, cells: coords.map(([q,r])=>({q,r,known:true,visible:true,island:true})) }));
const stamp = p => `${Math.round(p.x*1e5)},${Math.round(p.y*1e5)}`;
const noise = (x,y) => { const n=Math.sin(x*127.1+y*311.7)*43758.5453; return n-Math.floor(n); };
export function islandGroups(cells) {
  const left=new Map(cells.filter(c=>c.known&&c.island).map(c=>[key(c),c])), groups=[];
  while(left.size){const first=left.values().next().value, group=[first];left.delete(key(first));
    for(let i=0;i<group.length;i++)for(let d=0;d<6;d++){const k=key(add(group[i],d));if(left.has(k)){group.push(left.get(k));left.delete(k);}}
    groups.push(group);
  }return groups;
}
export function islandOutline(cells) {
  const edges=new Map();
  for(const c of cells){const center=hexToXY(c);const corners=Array.from({length:6},(_,i)=>({x:center.x+Math.cos(Math.PI/6+i*Math.PI/3),y:center.y+Math.sin(Math.PI/6+i*Math.PI/3)}));
    for(let i=0;i<6;i++){const a=corners[i],b=corners[(i+1)%6],reverse=`${stamp(b)}:${stamp(a)}`,id=`${stamp(a)}:${stamp(b)}`;if(edges.has(reverse))edges.delete(reverse);else edges.set(id,{a,b});}}
  const starts=new Map([...edges.values()].map(e=>[stamp(e.a),e])), loops=[];
  while(starts.size){let edge=starts.values().next().value;const loop=[];while(edge){loop.push(edge.a);starts.delete(stamp(edge.a));edge=starts.get(stamp(edge.b));}loops.push(loop);}
  return loops;
}
function inset(loop, distance) {
  return loop.map((p,i)=>{const before=loop[(i+loop.length-1)%loop.length],after=loop[(i+1)%loop.length];
    const a=new THREE.Vector2(p.x-before.x,p.y-before.y).normalize(),b=new THREE.Vector2(after.x-p.x,after.y-p.y).normalize();
    const normal=new THREE.Vector2(-a.y-b.y,a.x+b.x).normalize();const divisor=Math.max(.5,normal.dot(new THREE.Vector2(-b.y,b.x)));
    return {x:p.x+normal.x*distance/divisor,y:p.y+normal.y*distance/divisor};});
}
export function createIsland(cells) {
  const group=new THREE.Group();group.name=`Island_${cells.length}`;group.userData.cells=cells.map(c=>({q:c.q,r:c.r}));
  const positions=[],colors=[];const known=new Map(cells.map(c=>[key(c),c]));
  const color=(hex,p)=>{const c=new THREE.Color(hex);const cell=known.get(key(xyToHex({x:p[0],y:p[2]})));if(cell&&!cell.visible)c.multiplyScalar(.42);return c;};
  const tri=(a,b,c,hex)=>{const tint=color(hex,[(a[0]+b[0]+c[0])/3,0,(a[2]+b[2]+c[2])/3]);for(const p of [a,b,c]){positions.push(...p);colors.push(tint.r,tint.g,tint.b);}};
  const coast=[], tops=[];
  for(const loop of islandOutline(cells)){
    // Three nested outlines remain inside the blocked footprint, including concave bays.
    const beach=inset(loop,.045),rock=inset(loop,.16),grass=inset(loop,.27);
    const levels=[beach.map(p=>[p.x,.10,p.y]),rock.map(p=>[p.x,.19,p.y]),grass.map(p=>[p.x,.42+noise(p.x,p.y)*.17,p.y])];
    for(let i=0;i<loop.length;i++){const j=(i+1)%loop.length;
      for(let n=0;n<2;n++){const a=levels[n][i],b=levels[n][j],c=levels[n+1][j],d=levels[n+1][i];const palette=n===0?[0xf2df99,0xe3ce8a]:[0x777563,0x555952];const tone=palette[i%2];tri(a,d,b,tone);tri(b,d,c,tone);}
      const a=beach[i],b=beach[j];coast.push(new THREE.Vector3(a.x,.105,a.y),new THREE.Vector3(b.x,.105,b.y));
    }
    tops.push({grass,level:levels[2],area:loop.reduce((sum,p,i)=>{const next=loop[(i+1)%loop.length];return sum+p.x*next.y-next.x*p.y;},0)});
  }
  const outer=tops.find(t=>t.area>0), holes=tops.filter(t=>t.area<0);
  if(outer){
    const points=[outer,...holes].flatMap(t=>t.level);
    const faces=THREE.ShapeUtils.triangulateShape(outer.grass.map(p=>new THREE.Vector2(p.x,p.y)),holes.map(t=>t.grass.map(p=>new THREE.Vector2(p.x,p.y))));
    for(const [a,b,c]of faces){const mid=[(points[a][0]+points[b][0]+points[c][0])/3,.61,(points[a][2]+points[b][2]+points[c][2])/3];
      mid[1]+=.09*noise(mid[0],mid[2]);for(const [u,v]of [[a,b],[b,c],[c,a]])tri(points[u],mid,points[v],[0xb8c742,0xa0b437,0xd1d357][(u+v)%3]);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  group.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide})));
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(coast),new THREE.LineBasicMaterial({color:0xd4f7e8,transparent:true,opacity:.75})));
  for(const cell of cells){const center=hexToXY(cell);for(let i=0;i<3;i++){const n=noise(cell.q+i,cell.r),m=noise(cell.q,cell.r+i+2);const bush=new THREE.Mesh(new THREE.IcosahedronGeometry(.12+n*.08,0),new THREE.MeshStandardMaterial({color:cell.visible?0x476a32:0x263c31,roughness:1,flatShading:true}));bush.position.set(center.x+(n-.5)*.62,.72,center.y+(m-.5)*.6);bush.scale.y=1.3;group.add(bush);}}
  return group;
}
