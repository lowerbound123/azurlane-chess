import manifest from '../../assets/runtime/manifest.json';
import type {RuntimeAssetManifest} from '../../shared/assets.ts';
import {AssetClient} from './client.ts';
export const runtimeAssets=manifest as RuntimeAssetManifest;
export const assetClient=new AssetClient(runtimeAssets,{baseUrl:import.meta.env.BASE_URL});
