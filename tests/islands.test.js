import test from 'node:test';
import assert from 'node:assert/strict';
import {ISLAND_FORMS,islandGroups,islandOutline,createIsland} from '../src/scene/islands.js';
import {xyToHex,key} from '../src/engine.js';
import {disposeTree} from '../src/scene/resources.js';

test('island library covers connected one to five hex footprints without terrain spilling into water',()=>{
  assert.deepEqual([...new Set(ISLAND_FORMS.map(f=>f.cells.length))],[1,2,3,4,5]);
  for(const form of ISLAND_FORMS){
    assert.equal(islandGroups(form.cells).length,1,form.name);
    const outline=islandOutline(form.cells);assert.equal(outline.length,1,form.name);
    const group=createIsland(form.cells),allowed=new Set(form.cells.map(key));
    const positions=group.children[0].geometry.attributes.position;
    assert(positions.count>0);
    for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);assert([x,y,z].every(Number.isFinite));assert(allowed.has(key(xyToHex({x,y:z}))),`${form.name}: ${x},${z}`);}
    disposeTree(group);
  }
});
test('unknown island cells never contribute geometry or reveal a connected extension',()=>{
 const cells=[{q:0,r:0,known:true,island:true},{q:1,r:0,known:false,island:true},{q:0,r:1,known:true,island:false}];
 const groups=islandGroups(cells);assert.equal(groups.length,1);assert.equal(groups[0].length,1);
 assert.deepEqual(islandOutline(groups[0]),islandOutline([cells[0]]));
});
test('a larger existing island ring preserves its navigable water hole',()=>{
 const cells=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]].map(([q,r])=>({q,r,known:true,visible:true,island:true}));
 assert.equal(islandOutline(cells).length,2);
 const group=createIsland(cells),positions=group.children[0].geometry.attributes.position;
 for(let i=0;i<positions.count;i+=3){const x=(positions.getX(i)+positions.getX(i+1)+positions.getX(i+2))/3,z=(positions.getZ(i)+positions.getZ(i+1)+positions.getZ(i+2))/3;assert.notEqual(key(xyToHex({x,y:z})),'0,0');}
 disposeTree(group);
});
