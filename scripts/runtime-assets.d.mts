import type {RuntimeAssetManifest} from '../shared/assets.ts';
export function validateRuntime(root:string,options?:{abilityDemos?:boolean}):Promise<RuntimeAssetManifest>;
export function safePath(name:unknown):boolean;
export function digest(data:Buffer):string;
export function loadAuthoringProfiles(root:string):Promise<{profiles:Record<string,import('../src/characters/config.ts').CharacterProfile>;generated?:import('../src/ship-art.ts').ShipArtManifest}>;
export function authoringState(root:string):Promise<{raster:string[];sources:Record<string,string>;spine:Record<string,unknown>;fingerprints:Record<string,string>}>;
