import type {RuntimeAssetManifest} from '../shared/assets.ts';
import type {AbilityDemoMedia} from '../shared/ability-demo.ts';
type Publisher=(id:string,name:string,data:Buffer,type:string)=>string;
export function readAbilityDemoOutputs(root:string):Promise<{clips:Record<string,any>}>;
export function validateAbilityDemoOutputs(root:string):Promise<{clips:Record<string,any>}>;
export function appendPublishedDemos(root:string,source:{clips:Record<string,any>},publish:Publisher):Promise<Record<string,AbilityDemoMedia>>;
export function addAbilityDemos(root:string,manifest:RuntimeAssetManifest,publish:Publisher):Promise<void>;
export function validatePublishedAbilityDemos(root:string,manifest:RuntimeAssetManifest):Promise<void>;
export function registerAbilityDemos(root:string):Promise<RuntimeAssetManifest>;
