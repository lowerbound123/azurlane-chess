import * as THREE from 'three';

// All tiles sample world coordinates, so wave highlights cross hex edges continuously.
export function oceanMaterial(clock, color = 0x2986b4, strength = 1) {
  const tint = new THREE.Color(color);
  const material = new THREE.ShaderMaterial({
    uniforms: { time: clock, tint: { value: tint }, strength: { value: strength } },
    vertexShader: `varying vec2 sea;
      void main(){ vec4 world=modelMatrix*vec4(position,1.); sea=world.xz;
        gl_Position=projectionMatrix*viewMatrix*world; }`,
    fragmentShader: `uniform float time; uniform vec3 tint; uniform float strength; varying vec2 sea;
      void main(){
        float depth=smoothstep(-2.,24.,sea.y);
        vec3 water=tint*mix(1.32,.64,depth);
        float drift=sea.y*7.5+sin(sea.x*1.5+time*.32)*.65+time*.6;
        float small=sin(drift+sin(sea.x*3.2-sea.y*.4)*.4);
        float breaks=smoothstep(-.05,.65,sin(sea.x*2.1+sea.y*.67+time*.15));
        float glint=pow(max(0.,small),28.)*breaks;
        float swell=sin(sea.y*2.7+sin(sea.x*.6)+time*.22)*.035;
        water+=strength*(vec3(.17,.31,.34)*glint+vec3(swell));
        gl_FragColor=vec4(max(water,vec3(0.)),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  material.color = tint;
  return material;
}
