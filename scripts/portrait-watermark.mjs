import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';

// Noto Sans SC outlines are bundled under the accompanying SIL Open Font License.
// Paths avoid font lookup and missing CJK glyphs in headless Linux image processing.
const glyphBytes=readFileSync(new URL('./ship-assets/watermark-glyphs.json',import.meta.url));
const glyphs=JSON.parse(glyphBytes);
export const WATERMARK_TEXT='请支持官方碧蓝航线喵～';
export const WATERMARK_FINGERPRINT=createHash('sha256').update(glyphBytes).update(readFileSync(new URL(import.meta.url))).digest('hex');
if(glyphs.text!==WATERMARK_TEXT)throw Error('Watermark outline text mismatch');

export function watermarkSvg(width,height){
 const small=Math.min(width,height),fontSize=Math.max(12,Math.round(small*.039));
 const lineWidth=glyphs.advance/glyphs.unitsPerEm*fontSize;
 const outlines=glyphs.glyphs.map(g=>`<path transform="translate(${g.x} 0)" d="${g.d}"/>`).join('');
 const scale=fontSize/glyphs.unitsPerEm;
 const line=(x,y,opacity,rotate=0)=>`<g opacity="${opacity}" transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale} ${-scale})"><g fill="white" stroke="#15283c" stroke-width="${glyphs.unitsPerEm*.025}" stroke-linejoin="round" paint-order="stroke">${outlines}</g></g>`;
 // A quiet central mark remains visible after cropping; the footer is easy to read.
 const x=(width-lineWidth)/2;
 return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${WATERMARK_TEXT}</title>${line(x,height*.56,.18,-12)}${line(x,height-fontSize*.55,.8)}</svg>`);
}

export async function stampPortrait(bytes,quality=80){
 const {width,height}=await sharp(bytes).metadata();
 if(!width||!height)throw Error('无效立绘尺寸');
 return sharp(bytes).composite([{input:watermarkSvg(width,height)}]).webp({quality,alphaQuality:100,effort:5}).toBuffer();
}
