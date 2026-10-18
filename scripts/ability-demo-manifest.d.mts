export interface ArtifactRecord {fingerprint?:string;files:Record<string,{bytes:number;sha256:string}>}
export function artifactRecord(dir:string):Promise<ArtifactRecord>;
export function isArtifactCurrent(dir:string,record:ArtifactRecord|undefined):Promise<boolean>;
export function digest(bytes:Uint8Array):string;
