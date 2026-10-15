export interface ArtifactRecord {fingerprint:string;files:Record<string,{bytes:number;sha256:string}>}
export function artifactRecord(dir:string,fingerprint:string):Promise<ArtifactRecord>;
export function isArtifactCurrent(dir:string,record:ArtifactRecord|undefined,fingerprint:string):Promise<boolean>;

export function sourceFingerprint(root:string):Promise<string>;
