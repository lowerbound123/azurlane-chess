import {DEFAULT_CHARACTER_PROFILE} from './default-profile.ts';
export {DEFAULT_CHARACTER_PROFILE} from './default-profile.ts';
import type {SkeletonData} from './types.ts';
import generated from './ships.generated.json' with {type:'json'};
export interface CharacterProfile {runtimeVersion?:'3.8';premultipliedAlpha?:boolean;skeleton:string;atlas:string;format:'json'|'binary';scale:number;offset:[number,number];skin?:string;labelHeight?:number;animations:Record<string,string>}
// Paths are relative to Vite BASE_URL (also works below a GitHub Pages subpath).
export const characterConfig:{runtimeVersion:string;defaultProfile:string;templates:Record<string,string>;profiles:Record<string,CharacterProfile>} = {
  runtimeVersion: '3.8',
  defaultProfile: 'sailor',
  templates: {...generated.templates}, // Example: dd: 'my-character' (use engine template IDs).
  profiles: {
    ...(generated.profiles as unknown as Record<string,CharacterProfile>),
    sailor: DEFAULT_CHARACTER_PROFILE,
  },
};
export function profileIdFor(identity:string,template?:string) {
  const catalog=generated.catalog as Record<string,string>;
  const id = catalog[identity] || (characterConfig.profiles[identity]?identity:undefined) || characterConfig.templates[template||identity] || characterConfig.defaultProfile;
  return characterConfig.profiles[id] ? id : characterConfig.defaultProfile;
}
export function profileFor(identity:string,template?:string) {
  return characterConfig.profiles[profileIdFor(identity,template)];
}
export function animationFor(data:Pick<SkeletonData,'findAnimation'|'animations'>, profile:Pick<CharacterProfile,'animations'>, action:string) {
  const binding:Record<string,string>={idle:'stand',fire:'attack',mainFire:'attack_left',torpedo:'attack',aircraft:'attack',sweep:'attack',hit:'yun',dead:'dead',dance:'dance',yun:'yun'};
  const names = [binding[action],profile.animations?.[action], 'stand',profile.animations?.idle, 'idle'];
  return names.find(name => name && data.findAnimation(name)) || data.animations[0]?.name || null;
}
