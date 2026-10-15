import {test,expect,vi} from 'vitest';
import * as THREE from 'three';
import {PoseParticles} from '../src/characters/pose-particles.ts';
test('particles use only drawn final-pose triangles, preserve atlas UVs, and release owned GPU resources',()=>{
 const texture=new THREE.Texture(),dispose=vi.fn();texture.addEventListener('dispose',dispose);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([2,3,0,4,3,0,2,5,0,900,900,0],3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));geometry.setIndex([0,1,2,1,2,3]);geometry.setDrawRange(0,3);
 const mesh=new THREE.Mesh(geometry,new THREE.ShaderMaterial({uniforms:{map:{value:texture}}})),root=new THREE.Group();root.position.set(3,4,0);root.scale.setScalar(.01);root.add(mesh);
 const particles=new PoseParticles(root),again=new PoseParticles(root),points=particles.root.children[0] as THREE.Points;
 expect(points).toBeInstanceOf(THREE.Points);const p=points.geometry.getAttribute('position'),uv=points.geometry.getAttribute('sourceUV');expect(p.count).toBeGreaterThan(500);
 for(let i=0;i<p.count;i++){expect(p.getX(i)).toBeGreaterThanOrEqual(2);expect(p.getY(i)).toBeGreaterThanOrEqual(3);expect((p.getX(i)-2)+(p.getY(i)-3)).toBeLessThanOrEqual(2.00001);expect(uv.getX(i)).toBeCloseTo((p.getX(i)-2)/2,5);}
 expect(Array.from((again.root.children[0] as THREE.Points).geometry.getAttribute('position').array)).toEqual(Array.from(p.array));expect(particles.root.scale.x).toBe(.01);expect(particles.root.position.x).toBe(3);
 const release=vi.fn();points.geometry.addEventListener('dispose',release);particles.seek(1);expect(particles.root.visible).toBe(false);particles.dispose();again.dispose();expect(release).toHaveBeenCalledOnce();expect(dispose).not.toHaveBeenCalled();expect(geometry.drawRange.count).toBe(3);
});
