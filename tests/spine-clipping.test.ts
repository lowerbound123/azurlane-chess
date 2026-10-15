import {test,expect} from 'vitest';
import * as THREE from 'three';
import core38 from '../src/vendor/spine38/core.mjs';
import renderer38 from '../src/vendor/spine38/renderer.mjs';

for(const [version,core,renderer] of [['3.8',core38,renderer38]] as const) {
  for(const endState of ['fully-clipped','no-attachment',...(version==='3.8'?['inactive-bone']:[])]) {
    test(`${version} ends clipping at a ${endState} end slot before rendering the following head`,()=>{
      const data=new core.SkeletonData(),root=new core.BoneData(0,'root',null),bodyBone=new core.BoneData(1,'body',root);
      data.bones.push(root,bodyBone);
      data.slots.push(new core.SlotData(0,'clip',root),new core.SlotData(1,'body',bodyBone),new core.SlotData(2,'head',root));
      const texture=new THREE.Texture();
      const region=(name:string)=>{
        const attachment=new core.RegionAttachment(name);
        attachment.region={renderObject:{texture:{texture}}};
        attachment.offset.set([-5,-5,-5,5,5,5,5,-5]);
        return attachment;
      };
      const mesh=new renderer.SkeletonMesh(data);
      const indices=()=>mesh.batches.reduce((count:number,batch:THREE.Mesh)=>count+batch.geometry.drawRange.count,0);
      try {
        mesh.skeleton.slots[1].setAttachment(region('body'));
        mesh.skeleton.slots[2].setAttachment(region('head'));
        mesh.update(0);
        expect(indices()).toBe(12); // Two intact regions, six indices each.
        const clip=new core.ClippingAttachment('clip');
        clip.endSlot=data.slots[1];clip.worldVerticesLength=8;
        clip.vertices=new Float32Array([100,100,110,100,110,110,100,110]);
        mesh.skeleton.slots[0].setAttachment(clip);
        if(endState==='no-attachment')mesh.skeleton.slots[1].setAttachment(null);
        if(endState==='inactive-bone')mesh.skeleton.bones[1].active=false;
        mesh.update(0);
        // Body contributes nothing, but head is beyond the clipping scope.
        expect(indices()).toBe(6);
        const positions=mesh.batches.flatMap((batch:THREE.Mesh)=>{
          if(!batch.geometry.drawRange.count)return [];
          const p=batch.geometry.getAttribute('position');
          return Array.from({length:4},(_,i)=>[p.getX(i),p.getY(i)]);
        });
        expect(positions).toEqual([[-5,-5],[-5,5],[5,5],[5,-5]]);
      } finally {mesh.dispose();texture.dispose();}
    });
  }
}
