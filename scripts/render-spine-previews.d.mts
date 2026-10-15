import type {CharacterProfile} from '../src/characters/config.ts';
export interface PreviewExportPlan {profiles:Record<string,CharacterProfile>;manifest:{profiles:Record<string,{image:string;fingerprint:string}>};fingerprints:Record<string,string>;pending:string[]}
export function previewExportPlan(root:string):Promise<PreviewExportPlan>;
export function renderSpinePreviews(root?:string):Promise<void>;
