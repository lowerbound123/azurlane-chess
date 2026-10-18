/** Public asset contracts. Storage credentials never enter the browser bundle. */
export type AssetProvider='local'|'s3'|'oss'|'cos';
export interface RuntimeAsset {path:string;sha256:string;bytes:number;contentType:string}
export interface RuntimeImage {src:string;preview:string;width:number;height:number;variants:{src:string;width:number;height:number;bytes:number}[]}
export interface RuntimeSpine {skeleton:string;atlas:string;pages:Record<string,string>}
export interface RuntimeAssetManifest {
 version:1;
 audio?:import('./audio.ts').RuntimeAudioCatalog;
 abilityDemos?:Record<string,import('./ability-demo.ts').AbilityDemoMedia>;
 files:Record<string,RuntimeAsset>;
 images:Record<string,RuntimeImage>;
 spinePreviews:Record<string,string>;
 spine:Record<string,RuntimeSpine>;
 models:{aircraft:string;mine:string;torpedo:string};
 sources:Record<string,string>;
 spineFingerprints:Record<string,string>;
}
export interface AssetResolution {url:string;expiresAt:number|null;source:'local'|'remote'}
export interface AssetResolveResponse {assets:Record<string,AssetResolution>}
