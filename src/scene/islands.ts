import type {Hex,XY} from '../../shared/game.ts';
import type {MapCell} from '../../shared/render.ts';
import * as THREE from 'three';
import { hexToXY, xyToHex, key, add } from '../engine.ts';

// Connected, reusable footprints; rotations and reflections are supported by the same builder.
const forms:[string,[number,number][]][] = [
  ['islet', [[0,0]]], ['pair', [[0,0],[1,0]]],
  ['ridge3', [[0,0],[1,0],[2,0]]], ['bend3', [[0,0],[1,0],[1,1]]], ['triangle3', [[0,0],[1,0],[0,1]]],
  ['ridge4', [[0,0],[1,0],[2,0],[3,0]]], ['hook4', [[0,0],[1,0],[2,0],[2,1]]],
  ['diamond4', [[0,0],[1,0],[0,1],[1,1]]], ['fork4', [[0,0],[1,0],[-1,1],[0,-1]]],
  ['ridge5', [[0,0],[1,0],[2,0],[3,0],[4,0]]], ['hook5', [[0,0],[1,0],[2,0],[2,1],[2,2]]],
  ['cove5', [[0,0],[1,0],[2,0],[0,1],[2,-1]]], ['crown5', [[0,0],[1,0],[0,1],[-1,1],[0,-1]]],
];
export const ISLAND_FORMS=forms.map(([name, coords]) => ({ name, cells: coords.map(([q,r])=>({q,r,known:true,visible:true,island:true})) }));
const stamp = (p: XY) => `${Math.round(p.x*1e5)},${Math.round(p.y*1e5)}`;
const noise = (x: number,y: number) => { const n=Math.sin(x*127.1+y*311.7)*43758.5453; return n-Math.floor(n); };
export function islandGroups<T extends Pick<MapCell,'q'|'r'|'known'|'island'>>(cells:T[]) {
  const left=new Map(cells.filter(c=>c.known&&c.island).map(c=>[key(c),c])), groups:T[][]=[];
  while(left.size){const first=left.values().next().value!, group=[first];left.delete(key(first));
    for(let i=0;i<group.length;i++)for(let d=0;d<6;d++){const k=key(add(group[i],d));if(left.has(k)){group.push(left.get(k)!);left.delete(k);}}
    groups.push(group);
  }return groups;
}
export function islandOutline(cells: Hex[]) {
  const edges=new Map<string,{a:XY;b:XY}>();
  for(const c of cells){const center=hexToXY(c);const corners=Array.from({length:6},(_,i)=>({x:center.x+Math.cos(Math.PI/6+i*Math.PI/3),y:center.y+Math.sin(Math.PI/6+i*Math.PI/3)}));
    for(let i=0;i<6;i++){const a=corners[i],b=corners[(i+1)%6],reverse=`${stamp(b)}:${stamp(a)}`,id=`${stamp(a)}:${stamp(b)}`;if(edges.has(reverse))edges.delete(reverse);else edges.set(id,{a,b});}}
  const starts=new Map([...edges.values()].map(e=>[stamp(e.a),e])), loops:XY[][]=[];
  while(starts.size){let edge=starts.values().next().value;const loop=[];while(edge){loop.push(edge.a);starts.delete(stamp(edge.a));edge=starts.get(stamp(edge.b));}loops.push(loop);}
  return loops;
}
function inset(loop: XY[], distance: number|((point:XY,index:number)=>number)) {
  return loop.map((p,i)=>{const before=loop[(i+loop.length-1)%loop.length],after=loop[(i+1)%loop.length];
    const a=new THREE.Vector2(p.x-before.x,p.y-before.y).normalize(),b=new THREE.Vector2(after.x-p.x,after.y-p.y).normalize();
    const normal=new THREE.Vector2(-a.y-b.y,a.x+b.x).normalize();const divisor=Math.max(.5,normal.dot(new THREE.Vector2(-b.y,b.x)));
    return {x:p.x+normal.x*(typeof distance === 'function' ? distance(p,i) : distance)/divisor,y:p.y+normal.y*(typeof distance === 'function' ? distance(p,i) : distance)/divisor};});
}
export function createIsland(cells: MapCell[]) {
  const group=new THREE.Group();group.name=`Island_${cells.length}`;group.userData.cells=cells.map(c=>({q:c.q,r:c.r}));
  const positions:number[]=[],colors:number[]=[];const known=new Map(cells.map(c=>[key(c),c]));
  const color=(hex: THREE.ColorRepresentation,p: number[])=>{const c=new THREE.Color(hex);const cell=known.get(key(xyToHex({x:p[0],y:p[2]})));if(cell&&!cell.visible)c.multiplyScalar(.42);return c;};
  const tri=(a: number[],b: number[],c: number[],hex: THREE.ColorRepresentation)=>{const tint=color(hex,[(a[0]+b[0]+c[0])/3,0,(a[2]+b[2]+c[2])/3]);for(const p of [a,b,c]){positions.push(...p);colors.push(tint.r,tint.g,tint.b);}};
  const coast:THREE.Vector3[]=[],tops:{grass:XY[];level:number[][];area:number}[]=[],ground:number[][][]=[];
  const relief=(x: number,z: number)=>.49+.08*Math.sin(x*1.7+z*.6)+.055*Math.cos(z*2.1-x*.4);
  const tintGrass=(x: number,z: number)=>[0xb6c445,0xc6cf51,0xa6b53e,0xd0d65c][Math.floor(noise(x,z)*4)];
  for(const boundary of islandOutline(cells)){
    const loop=boundary.flatMap((p,i)=>{
      const a=boundary[(i+boundary.length-1)%boundary.length],b=boundary[(i+1)%boundary.length];
      const cross=(p.x-a.x)*(b.y-p.y)-(p.y-a.y)*(b.x-p.x);
      if(cross<=0)return [p]; // Never cut across a concave, navigable bay.
      const cut=.16+.11*noise(p.x+2,p.y+5);
      return [{x:p.x+(a.x-p.x)*cut,y:p.y+(a.y-p.y)*cut},{x:p.x+(b.x-p.x)*cut,y:p.y+(b.y-p.y)*cut}];
    });
    // Subdivide before insetting: every coastal notch stays within the blocked hexes.
    const edge=loop.flatMap((p,i)=>{const next=loop[(i+1)%loop.length];return [0,.32,.68].map(t=>({x:p.x+(next.x-p.x)*t,y:p.y+(next.y-p.y)*t}));});
    const shore=inset(edge,p=>.055+.075*noise(p.x,p.y));
    const rock=inset(edge,p=>.17+.055*Math.sin(p.x*1.5+p.y*2));
    const ledge=inset(edge,p=>.23+.035*noise(p.x+4,p.y));
    const grass=inset(edge,p=>.30+.04*noise(p.x,p.y+7));
    const levels=[shore.map(p=>[p.x,.075,p.y]),rock.map(p=>[p.x,.12,p.y]),ledge.map(p=>[p.x,relief(p.x,p.y)*.64,p.y]),grass.map(p=>[p.x,relief(p.x,p.y),p.y])];
    for(let i=0;i<edge.length;i++){const j=(i+1)%edge.length;
      const sandBay=.5+.5*Math.sin(edge[i].x*1.4+edge[i].y*.9);
      for(let n=0;n<3;n++){
        const a=levels[n][i],b=levels[n][j],c=levels[n+1][j],d=levels[n+1][i];
        const palette=n===0?(sandBay>.38?[0xe9d9a0,0xf2e3b1,0xddcc96]:[0x655e4a,0x777058,0x514c3f]):n===1?[0x514c3f,0x635c49,0x77705a]:[0x625c43,0x847d48,0x49483a];
        tri(a,d,b,palette[i%3]);tri(b,d,c,palette[(i+1)%3]);
      }
      const a=shore[i],b=shore[j];coast.push(new THREE.Vector3(a.x,.082,a.y),new THREE.Vector3(b.x,.082,b.y));
    }
    tops.push({grass,level:levels[3],area:loop.reduce((sum,p,i)=>{const next=loop[(i+1)%loop.length];return sum+p.x*next.y-next.x*p.y;},0)});
  }
  const outer=tops.find(t=>t.area>0), holes=tops.filter(t=>t.area<0);
  if(outer){
    const points=[outer,...holes].flatMap(t=>t.level);
    const faces=THREE.ShapeUtils.triangulateShape(outer.grass.map(p=>new THREE.Vector2(p.x,p.y)),holes.map(t=>t.grass.map(p=>new THREE.Vector2(p.x,p.y))));
    for(const [a,b,c]of faces){
      const mid=[(points[a][0]+points[b][0]+points[c][0])/3,(points[a][1]+points[b][1]+points[c][1])/3,(points[a][2]+points[b][2]+points[c][2])/3];
      // Coplanar patches add grass variation without a repeated pyramid on every face.
      for(const [u,v]of [[a,b],[b,c],[c,a]]){tri(points[u],mid,points[v],tintGrass((points[u][0]+mid[0])/2,(points[v][2]+mid[2])/2));ground.push([points[u],mid,points[v]]);}
    }
  }
  const surface=(x: number,z: number)=>{
    for(const [a,b,c] of ground){const det=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(det)<1e-8)continue;
      const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/det,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/det;
      if(u>=0&&v>=0&&u+v<=1)return u*a[1]+v*b[1]+(1-u-v)*c[1];
    }return null;
  };
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  group.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:THREE.DoubleSide})));
  group.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(coast),new THREE.LineBasicMaterial({color:0xd4f7e8,transparent:true,opacity:.48})));
  for(const cell of cells){const center=hexToXY(cell);
    for(let cluster=0;cluster<2;cluster++){
      const cx=center.x+(noise(cell.q+cluster*7,cell.r)-.5)*.75,cz=center.y+(noise(cell.q+3,cell.r+cluster*5)-.5)*.75;
      for(let i=0;i<5;i++){
        const n=noise(cx+i,cz),x=cx+Math.cos(i*2.4)*.12,z=cz+Math.sin(i*2.4)*.10,y=surface(x,z);if(y===null)continue;
        const bush=new THREE.Mesh(new THREE.IcosahedronGeometry(.065+n*.045,1),new THREE.MeshStandardMaterial({color:cell.visible?[0x36552a,0x486b2e,0x5f7c32][i%3]:0x263c31,roughness:1,flatShading:true}));
        bush.scale.set(1.2,.8+n*.5,1);bush.position.set(x,y+.035,z);group.add(bush);
      }
    }
    const x=center.x+.37,z=center.y-.19,y=surface(x,z);
    if(y!==null){const stone=new THREE.Mesh(new THREE.IcosahedronGeometry(.09,0),new THREE.MeshStandardMaterial({color:cell.visible?0x7b7959:0x353b30,roughness:1,flatShading:true}));stone.scale.set(1.4,.65,.85);stone.position.set(x,y+.025,z);group.add(stone);}
  }
  return group;
}
