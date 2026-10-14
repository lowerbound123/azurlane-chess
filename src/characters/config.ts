import type {SkeletonData} from '@esotericsoftware/spine-threejs';
export interface CharacterProfile {skeleton:string;atlas:string;format:'json'|'binary';scale:number;offset:[number,number];skin?:string;labelHeight?:number;animations:Record<string,string>}
// Paths are relative to Vite BASE_URL (also works below a GitHub Pages subpath).
export const characterConfig:{runtimeVersion:string;defaultProfile:string;templates:Record<string,string>;profiles:Record<string,CharacterProfile>} = {
  runtimeVersion: '4.2',
  defaultProfile: 'sailor',
  templates: {}, // Example: dd: 'my-character' (use engine template IDs).
  profiles: {
    sailor: {
      skeleton: 'characters/default/sailor.json', atlas: 'characters/default/sailor.atlas',
      format: 'json', scale: .014, offset: [0, 0], skin: 'default',
      animations: { idle: 'idle', move: 'move', torpedo: 'torpedo', fire: 'fire', hit: 'hit', aircraft: 'aircraft', sweep: 'fire' },
    },
  },
};
export function profileIdFor(template:string) {
  const id = characterConfig.templates[template] || characterConfig.defaultProfile;
  return characterConfig.profiles[id] ? id : characterConfig.defaultProfile;
}
export function profileFor(template:string) {
  return characterConfig.profiles[profileIdFor(template)];
}
export function animationFor(data:Pick<SkeletonData,'findAnimation'|'animations'>, profile:Pick<CharacterProfile,'animations'>, action:string) {
  const names = [profile.animations?.[action], profile.animations?.idle, 'idle'];
  return names.find(name => name && data.findAnimation(name)) || data.animations[0]?.name || null;
}
