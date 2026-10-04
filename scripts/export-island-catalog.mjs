// Writes the exact runtime mesh library as portable data for Blender authoring.
import {writeFileSync} from 'node:fs';
import {ISLAND_FORMS,createIsland} from '../src/scene/islands.js';
const catalog=ISLAND_FORMS.map((form,index)=>{
 const root=createIsland(form.cells);root.updateMatrixWorld(true);
 const meshes=[];root.traverse(mesh=>{if(!mesh.isMesh)return;
  let geometry=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
  if(geometry.index){const indexed=geometry;geometry=indexed.toNonIndexed();indexed.dispose();}
  const position=Array.from(geometry.attributes.position.array),color=geometry.attributes.color?Array.from(geometry.attributes.color.array):null;
  meshes.push({position,color,baseColor:mesh.material.color.toArray()});geometry.dispose();
 });return {name:form.name,size:form.cells.length,cells:form.cells,meshes,index};
});
writeFileSync(process.argv[2]||'/tmp/azurlane-island-catalog.json',JSON.stringify(catalog));
console.log(`Exported ${catalog.length} island forms`);
