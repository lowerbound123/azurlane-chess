import type {RuntimeImage} from '../shared/assets.ts';
export function prepareAssets(root?:string,options?:{abilityDemos?:boolean}):Promise<Record<string,RuntimeImage>>;
