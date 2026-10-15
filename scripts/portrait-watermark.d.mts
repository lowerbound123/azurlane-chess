export const WATERMARK_TEXT:string;
export const WATERMARK_FINGERPRINT:string;
export function watermarkSvg(width:number,height:number):Buffer;
export function stampPortrait(bytes:Buffer,quality?:number):Promise<Buffer>;
