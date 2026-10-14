import * as THREE from 'three';

// Continuous world-space water. Broad swells, broken ripples and reflected sky
// have different scales/drift, avoiding repeated, equally spaced white dashes.
export function oceanMaterial(clock: {value:number}, color: THREE.ColorRepresentation = 0x2986b4, strength: number = 1) {
  const tint = new THREE.Color(color);
  const material = new THREE.ShaderMaterial({
    uniforms: { time: clock, tint: { value: tint }, strength: { value: strength } },
    vertexShader: `varying vec2 sea;
      void main(){ vec4 world=modelMatrix*vec4(position,1.); sea=world.xz;
        gl_Position=projectionMatrix*viewMatrix*world; }`,
    fragmentShader: `uniform float time; uniform vec3 tint; uniform float strength; varying vec2 sea;
      float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float ripple(vec2 p){
        return .55*noise(p)+.27*noise(p*2.07+vec2(17.3,8.1))+.12*noise(p*4.13+vec2(3.1,29.4))+.06*noise(p*8.21);
      }
      void main(){
        float depth=smoothstep(-3.,25.,sea.y);
        vec2 drift=vec2(time*.023,-time*.075);
        float swell=noise(sea*vec2(.12,.55)+drift*.5);
        float warp=noise(sea*vec2(.34,.8)-drift)*.7;
        // Thin anisotropic wavelets: long along x, densely layered along z.
        vec2 p=sea*vec2(.65,10.)+drift*vec2(1.,5.);
        p.y+=warp*3.;p.x+=swell*.4;
        float fine=ripple(p);
        float middle=ripple(sea*vec2(.55,4.3)+vec2(warp,time*.11));
        float filterWidth=max(fwidth(fine),.014);
        // Density and brightness are separate: only the reflected strip has
        // closely spaced pale crests; the open sea retains isolated blue ripples.
        float band=exp(-pow((sea.x-13.+(swell-.5)*4.)/6.2,2.));
        float farFade=pow(1.-depth,2.1);
        float highlightZone=band*farFade;
        float threshold=mix(.70,.53,highlightZone);
        float crest=smoothstep(threshold-filterWidth,threshold+.19+filterWidth,fine);
        float trough=smoothstep(.28,.59,middle);
        // A wide, fragmented sky reflection, strongest toward the far water.
        float reflection=highlightZone*.95;
        vec3 farWater=vec3(.075,.39,.64),nearWater=vec3(.011,.065,.17);
        vec3 water=mix(farWater,nearWater,pow(depth,.7));
        water+=vec3(.014,.045,.068)*(swell-.5);
        water+=vec3(.045,.13,.20)*(trough-.43)*mix(.65,.12,depth);
        water+=vec3(.38,.51,.56)*crest*(.005+reflection*1.25);
        water+=vec3(.022,.037,.045)*reflection;
        // Fainter broad ribbons sit beneath the sharp reflected fragments.
        float ribbon=smoothstep(.51,.72,middle);
        water+=vec3(.018,.045,.065)*ribbon*(.12+.35*(1.-depth)+reflection);
        vec3 tintRatio=tint/vec3(.02217,.2384,.4564);
        water*=clamp(tintRatio,vec3(.35),vec3(1.9));
        gl_FragColor=vec4(mix(tint,water,strength),1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  return Object.assign(material,{color:tint});
}
