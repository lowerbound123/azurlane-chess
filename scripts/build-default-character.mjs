// Original artwork: deterministic SVG pieces, natively authored Spine 3.8 JSON.
import sharp from 'sharp';
import {writeFile,mkdir,rm} from 'node:fs/promises';
const out=new URL('../public/characters/default/',import.meta.url);await mkdir(out,{recursive:true});
const ink='#213650',cream='#fff6df',mint='#7dd6c9',skin='#ffd8bb';
const pieces={
 boot:`<path d="M23 12h17v35h8q8 12-5 15H18q-6-8 0-14z" fill="${ink}"/><path d="M25 16h13v20H25z" fill="${cream}"/>`,
 body:`<path d="M15 12Q32 4 49 12l7 35-10 10H18L8 47z" fill="${cream}"/><path d="m17 12 15 19 15-19-5 24H22z" fill="${ink}"/><path d="m32 27-6 13 6 12 6-12z" fill="${mint}"/><path d="M15 47h34v11H15z" fill="${ink}"/><circle cx="43" cy="40" r="2" fill="#edbc5d"/>`,
 arm:`<path d="M24 12q9-6 17 3l-2 27H24z" fill="${cream}"/><path d="M24 32h16v8H24z" fill="${ink}"/><ellipse cx="31" cy="46" rx="9" ry="11" fill="${skin}"/>`,
 face:`<path d="M8 30Q6 2 32 3q28-1 25 34l-8 18H15z" fill="${ink}"/><ellipse cx="32" cy="33" rx="23" ry="24" fill="${skin}"/><path d="M9 29Q7 3 32 4q24-2 24 25L40 17l-6 13-9-14z" fill="${ink}"/><ellipse cx="23" cy="34" rx="3" ry="5" fill="${ink}"/><ellipse cx="42" cy="34" rx="3" ry="5" fill="${ink}"/><circle cx="24" cy="32" r="1" fill="white"/><circle cx="43" cy="32" r="1" fill="white"/><path d="M28 44q5 5 10-1" fill="none" stroke="${ink}" stroke-width="2"/><ellipse cx="16" cy="42" rx="5" ry="2" fill="#f3a4a0"/><ellipse cx="48" cy="42" rx="5" ry="2" fill="#f3a4a0"/>`,
 cap:`<path d="M6 28Q4 9 32 8q28 0 26 20L48 36H16z" fill="${cream}"/><path d="M9 26h46v9H9z" fill="${ink}"/><path d="M32 16v10m-5-5q0 9 10 0m-7-4h4" fill="none" stroke="${mint}" stroke-width="2.5"/><path d="m48 33 11 18-11-3-6-13" fill="${mint}"/>`,
 cannon:`<rect x="9" y="28" width="40" height="23" rx="8" fill="${ink}"/><path d="M28 29V13h8v16m3 0V13h8v17" fill="${mint}" stroke="${ink}" stroke-width="3"/><circle cx="21" cy="40" r="6" fill="${cream}"/>`,
 plane:`<path d="m32 7 5 20 21 10v7l-21-4-2 12 8 6H22l7-6-2-12-21 4v-7l21-10z" fill="${mint}" stroke="${ink}" stroke-width="2"/><circle cx="32" cy="30" r="4" fill="${cream}"/>`,
};
const names=Object.keys(pieces),svg=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="64">${names.map((n,i)=>`<g transform="translate(${i*64} 0)">${pieces[n]}</g>`).join('')}</svg>`;
await writeFile(new URL('sailor-parts.svg',out),svg);await sharp(Buffer.from(svg),{density:288}).webp({lossless:true}).toFile(new URL('sailor.webp',out).pathname);
await writeFile(new URL('sailor.atlas',out),`sailor.webp\nsize: 2048,256\nformat: RGBA8888\nfilter: Linear,Linear\nrepeat: none\n`+names.map((n,i)=>`${n}\n  rotate: false\n  xy: ${i*256}, 0\n  size: 256, 256\n  orig: 256, 256\n  offset: 0, 0\n  index: -1\n`).join(''));
const bones=[{name:'root'},{name:'hip',parent:'root',y:30},{name:'leftLeg',parent:'hip',x:-10,y:-13},{name:'rightLeg',parent:'hip',x:10,y:-13},{name:'body',parent:'hip',y:14},{name:'leftArm',parent:'body',x:-22,y:0},{name:'rightArm',parent:'body',x:22,y:0},{name:'head',parent:'body',y:31},{name:'cap',parent:'head',y:21},{name:'cannon',parent:'hip',x:31,y:2},{name:'plane',parent:'rightArm',x:0,y:23}];
const parts=[['leftLeg','boot',20,33],['rightLeg','boot',20,33],['body','body',48,49],['leftArm','arm',24,39],['rightArm','arm',24,39],['head','face',56,53],['cap','cap',59,38],['cannon','cannon',32,33],['plane','plane',26,26]];
const rotate=(...angles)=>angles.map((angle,i)=>({time:i*.2,angle}));const translate=(...points)=>points.map(([x,y],i)=>({time:i*.2,x,y}));
const animations={
 idle:{bones:{hip:{translate:translate([0,0],[0,1.8],[0,0],[0,-.6],[0,0])},head:{rotate:rotate(-2,0,2,0,-2)},leftArm:{rotate:rotate(-4,0,-4,0,-4)}}},
 move:{bones:{hip:{translate:translate([0,0],[0,4],[0,0],[0,4],[0,0])},leftLeg:{rotate:rotate(-24,0,24,0,-24)},rightLeg:{rotate:rotate(24,0,-24,0,24)},leftArm:{rotate:rotate(22,0,-22,0,22)},rightArm:{rotate:rotate(-22,0,22,0,-22)}}},
 fire:{bones:{cannon:{rotate:rotate(0,-28,-5,0),translate:translate([0,0],[0,-6],[0,1],[0,0])},hip:{translate:translate([0,0],[-5,0],[0,0],[0,0])},rightArm:{rotate:rotate(0,-55,-35,0)}}},
 torpedo:{bones:{body:{rotate:rotate(0,14,8,0)},leftArm:{rotate:rotate(0,70,90,0)},cannon:{rotate:rotate(0,75,85,0),translate:translate([0,0],[8,-9],[15,-9],[0,0])}}},
 hit:{bones:{hip:{rotate:rotate(0,-16,12,-7,0),translate:translate([0,0],[-7,-3],[5,0],[-2,0],[0,0])},head:{rotate:rotate(0,20,-15,8,0)},leftArm:{rotate:rotate(0,45,-15,12,0)}}},
 aircraft:{bones:{rightArm:{rotate:rotate(0,-80,-110,-30,0)},head:{rotate:rotate(0,12,15,5,0)},plane:{translate:translate([0,0],[0,8],[-15,22],[-30,32],[0,0]),rotate:rotate(0,-20,-50,-70,0)}}},
};
Object.assign(animations,{stand:animations.idle,attack:animations.fire,attack_left:animations.fire,yun:animations.hit,dance:animations.move,dead:{bones:{root:{rotate:[{time:0,angle:0},{time:.9,angle:-90}]}}}});
const data={skeleton:{hash:'original-harbor-sailor',spine:'3.8.99',x:-40,y:0,width:83,height:106,images:'./',audio:''},bones,slots:parts.map(([bone,path])=>({name:bone,bone,attachment:path})),skins:[{name:'default',attachments:Object.fromEntries(parts.map(([bone,path,width,height])=>[bone,{[path]:{type:'region',path,width,height}}]))}],animations};
await writeFile(new URL('sailor.json',out),JSON.stringify(data,null,2)+'\n');await rm(new URL('sailor.svg',out),{force:true});
