export function skeletonVersion(bytes:Uint8Array):string;
export function parseAtlas(text:string,pageDimensions?:Record<string,{width:number;height:number}>):any;
export function parseSkeleton(source:Uint8Array|string|object,atlasText:string,pageDimensions?:Record<string,{width:number;height:number}>,format?:'binary'|'json'):{data:any;core:any;runtimeVersion:'3.8';version:string};
