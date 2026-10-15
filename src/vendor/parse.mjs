import core from './spine38/core.mjs';
export function skeletonVersion(bytes){let offset=0;const string=()=>{let size=0;for(let shift=0;;shift+=7){if(offset>=bytes.length||shift>28)throw new Error('Invalid skeleton header');const b=bytes[offset++];size|=(b&127)<<shift;if(!(b&128))break;}const length=Math.max(0,size-1);if(offset+length>bytes.length)throw new Error('Truncated skeleton header');const s=new TextDecoder().decode(bytes.subarray(offset,offset+length));offset+=length;return s;};string();return string();}
export function parseAtlas(atlasText,pageDimensions={}) {
 const sizes=Object.fromEntries([...atlasText.trimStart().matchAll(/(?:^|\n\s*\n)([^\n]+)\nsize:\s*(\d+)\s*,\s*(\d+)/g)].map(m=>[m[1].trim(),{width:+m[2],height:+m[3]}]));
 return new core.TextureAtlas(atlasText,name=>({getImage:()=>pageDimensions[name]||sizes[name]||{width:2048,height:2048},setFilters(){},setWraps(){},dispose(){}}));
}
export function parseSkeleton(bytes,atlasText,pageDimensions={},format='binary') {
 const source=format==='json'?(typeof bytes==='string'?JSON.parse(bytes):bytes instanceof Uint8Array?JSON.parse(new TextDecoder().decode(bytes)):bytes):bytes;
 const version=format==='json'?source.skeleton?.spine:skeletonVersion(bytes);
 if(!version?.startsWith('3.8.'))throw new Error(`Unsupported Spine version: ${version}`);
 const loader=new core.AtlasAttachmentLoader(parseAtlas(atlasText,pageDimensions));
 const data=format==='json'?new core.SkeletonJson(loader).readSkeletonData(source):new core.SkeletonBinary(loader).readSkeletonData(source);
 return {data,core,runtimeVersion:'3.8',version};
}
