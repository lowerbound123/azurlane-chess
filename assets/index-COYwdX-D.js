(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();/**
* @vue/shared v3.5.43
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Xn(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const yt={},jr=[],Tn=()=>{},Yo=()=>!1,vo=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),jc=t=>t.startsWith("onUpdate:"),_t=Object.assign,dp=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},Ty=Object.prototype.hasOwnProperty,Lt=(t,e)=>Ty.call(t,e),Ue=Array.isArray,Tr=t=>ga(t)==="[object Map]",Ss=t=>ga(t)==="[object Set]",Gm=t=>ga(t)==="[object Date]",wy=t=>ga(t)==="[object RegExp]",it=t=>typeof t=="function",Qe=t=>typeof t=="string",$n=t=>typeof t=="symbol",Pt=t=>t!==null&&typeof t=="object",pp=t=>(Pt(t)||it(t))&&it(t.then)&&it(t.catch),o_=Object.prototype.toString,ga=t=>o_.call(t),Cy=t=>ga(t).slice(8,-1),Qc=t=>ga(t)==="[object Object]",ef=t=>Qe(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,Ys=Xn(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Ry=Xn("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"),tf=t=>{const e=Object.create(null);return(n=>e[n]||(e[n]=t(n)))},Fy=/-\w/g,Vt=tf(t=>t.replace(Fy,e=>e.slice(1).toUpperCase())),Dy=/\B([A-Z])/g,Jn=tf(t=>t.replace(Dy,"-$1").toLowerCase()),xo=tf(t=>t.charAt(0).toUpperCase()+t.slice(1)),Zo=tf(t=>t?`on${xo(t)}`:""),An=(t,e)=>!Object.is(t,e),Jo=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},ra=(t,e,n,i=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:i,value:n})},nf=t=>{const e=parseFloat(t);return isNaN(e)?t:e},rc=t=>{const e=Qe(t)?Number(t):NaN;return isNaN(e)?t:e};let Wm;const no=()=>Wm||(Wm=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Py(t,e){return t+JSON.stringify(e,(n,i)=>typeof i=="function"?i.toString():i)}const Iy="Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol",Ly=Xn(Iy);function _a(t){if(Ue(t)){const e={};for(let n=0;n<t.length;n++){const i=t[n],s=Qe(i)?a_(i):_a(i);if(s)for(const r in s)e[r]=s[r]}return e}else if(Qe(t)||Pt(t))return t}const Ny=/;(?![^(]*\))/g,By=/:([^]+)/,Uy=/"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;function a_(t){const e={};return t.replace(Uy,n=>n.startsWith("/*")?"":n).split(Ny).forEach(n=>{if(n){const i=n.split(By);i.length>1&&(e[i[0].trim()]=i[1].trim())}}),e}function Oy(t){if(!t)return"";if(Qe(t))return t;let e="";for(const n in t){const i=t[n];if(Qe(i)||typeof i=="number"){const s=n.startsWith("--")?n:Jn(n);e+=`${s}:${i};`}}return e}function va(t){let e="";if(Qe(t))e=t;else if(Ue(t))for(let n=0;n<t.length;n++){const i=va(t[n]);i&&(e+=i+" ")}else if(Pt(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}function ky(t){if(!t)return null;let{class:e,style:n}=t;return e&&!Qe(e)&&(t.class=va(e)),n&&(t.style=_a(n)),t}const zy="html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot",Vy="svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view",Hy="annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics",Gy="area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr",Wy=Xn(zy),$y=Xn(Vy),Xy=Xn(Hy),qy=Xn(Gy),l_="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Yy=Xn(l_),$m=Xn(l_+",async,autofocus,autoplay,controls,default,defer,disabled,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected");function sf(t){return!!t||t===""}const Ky=Xn("accept,accept-charset,accesskey,action,align,allow,alt,async,autocapitalize,autocomplete,autofocus,autoplay,background,bgcolor,border,buffered,capture,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,crossorigin,csp,data,datetime,decoding,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,enterkeyhint,for,form,formaction,formenctype,formmethod,formnovalidate,formtarget,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,importance,inert,integrity,ismap,itemprop,keytype,kind,label,lang,language,loading,list,loop,low,manifest,max,maxlength,minlength,media,min,multiple,muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,radiogroup,readonly,referrerpolicy,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,selected,shape,size,sizes,slot,span,spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,target,title,translate,type,usemap,value,width,wrap"),Zy=Xn("xmlns,accent-height,accumulate,additive,alignment-baseline,alphabetic,amplitude,arabic-form,ascent,attributeName,attributeType,azimuth,baseFrequency,baseline-shift,baseProfile,bbox,begin,bias,by,calcMode,cap-height,class,clip,clipPathUnits,clip-path,clip-rule,color,color-interpolation,color-interpolation-filters,color-profile,color-rendering,contentScriptType,contentStyleType,crossorigin,cursor,cx,cy,d,decelerate,descent,diffuseConstant,direction,display,divisor,dominant-baseline,dur,dx,dy,edgeMode,elevation,enable-background,end,exponent,fill,fill-opacity,fill-rule,filter,filterRes,filterUnits,flood-color,flood-opacity,font-family,font-size,font-size-adjust,font-stretch,font-style,font-variant,font-weight,format,from,fr,fx,fy,g1,g2,glyph-name,glyph-orientation-horizontal,glyph-orientation-vertical,glyphRef,gradientTransform,gradientUnits,hanging,height,href,hreflang,horiz-adv-x,horiz-origin-x,id,ideographic,image-rendering,in,in2,intercept,k,k1,k2,k3,k4,kernelMatrix,kernelUnitLength,kerning,keyPoints,keySplines,keyTimes,lang,lengthAdjust,letter-spacing,lighting-color,limitingConeAngle,local,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mask,maskContentUnits,maskUnits,mathematical,max,media,method,min,mode,name,numOctaves,offset,opacity,operator,order,orient,orientation,origin,overflow,overline-position,overline-thickness,panose-1,paint-order,path,pathLength,patternContentUnits,patternTransform,patternUnits,ping,pointer-events,points,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,preserveAspectRatio,primitiveUnits,r,radius,referrerPolicy,refX,refY,rel,rendering-intent,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,result,rotate,rx,ry,scale,seed,shape-rendering,slope,spacing,specularConstant,specularExponent,speed,spreadMethod,startOffset,stdDeviation,stemh,stemv,stitchTiles,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,string,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,style,surfaceScale,systemLanguage,tabindex,tableValues,target,targetX,targetY,text-anchor,text-decoration,text-rendering,textLength,to,transform,transform-origin,type,u1,u2,underline-position,underline-thickness,unicode,unicode-bidi,unicode-range,units-per-em,v-alphabetic,v-hanging,v-ideographic,v-mathematical,values,vector-effect,version,vert-adv-y,vert-origin-x,vert-origin-y,viewBox,viewTarget,visibility,width,widths,word-spacing,writing-mode,x,x-height,x1,x2,xChannelSelector,xlink:actuate,xlink:arcrole,xlink:href,xlink:role,xlink:show,xlink:title,xlink:type,xmlns:xlink,xml:base,xml:lang,xml:space,y,y1,y2,yChannelSelector,z,zoomAndPan");function u_(t){if(t==null)return!1;const e=typeof t;return e==="string"||e==="number"||e==="boolean"}const Jy=/[ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g;function jy(t,e){return t.replace(Jy,n=>`\\${n}`)}function Qy(t,e,n){if(t.length!==e.length)return!1;let i=!0;for(let s=0;i&&s<t.length;s++)i=Ui(t[s],e[s],n);return i}function Xm(t,e,n){if(t.size!==e.size)return!1;const i=Array.from(e),s=new Uint8Array(i.length);for(const r of t){let o=-1;for(let a=0;a<i.length;a++)if(!s[a]&&Ui(r,i[a],n)){o=a;break}if(o<0)return!1;s[o]=1}return!0}function eE(t,e,n){let i=Tr(t),s=Tr(e);if(i||s||(i=Ss(t),s=Ss(e),i||s))return i&&s?Xm(t,e,n):!1;const r=Object.keys(t).length,o=Object.keys(e).length;if(r!==o)return!1;for(const a in t){const l=t.hasOwnProperty(a),u=e.hasOwnProperty(a);if(l&&!u||!l&&u||!Ui(t[a],e[a],n))return!1}return String(t)===String(e)}function qm(t,e,n,i){n||(n=[new Map,new Map]);const[s,r]=n;if(s.has(t)||r.has(e))return s.get(t)===e&&r.get(e)===t;s.set(t,e),r.set(e,t);const o=i(t,e,n);return s.delete(t),r.delete(e),o}function Ui(t,e,n){if(t===e)return!0;let i=Gm(t),s=Gm(e);return i||s?i&&s?t.getTime()===e.getTime():!1:(i=$n(t),s=$n(e),i||s?t===e:(i=Ue(t),s=Ue(e),i||s?i&&s?qm(t,e,n,Qy):!1:(i=Pt(t),s=Pt(e),i||s?!i||!s?!1:qm(t,e,n,eE):String(t)===String(e))))}function rf(t,e){return t.findIndex(n=>Ui(n,e))}const c_=t=>!!(t&&t.__v_isRef===!0),f_=t=>Qe(t)?t:t==null?"":Ue(t)||Pt(t)&&(t.toString===o_||!it(t.toString))?c_(t)?f_(t.value):JSON.stringify(t,h_,2):String(t),h_=(t,e)=>c_(e)?h_(t,e.value):Tr(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[i,s],r)=>(n[Gf(i,r)+" =>"]=s,n),{})}:Ss(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>Gf(n))}:$n(e)?Gf(e):Pt(e)&&!Ue(e)&&!Qc(e)?String(e):e,Gf=(t,e="")=>{var n;return $n(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};function d_(t){return t==null?"initial":typeof t=="string"?t===""?" ":t:String(t)}/**
* @vue/reactivity v3.5.43
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let dn;class mp{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this._warnOnRun=!0,this.__v_skip=!0,!e&&dn&&(dn.active?(this.parent=dn,this.index=(dn.scopes||(dn.scopes=[])).push(this)-1):(this._active=!1,this._warnOnRun=!1))}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes){const i=this.scopes.slice();for(e=0,n=i.length;e<n;e++)i[e].pause()}for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes){const s=this.scopes.slice();for(e=0,n=s.length;e<n;e++)s[e].resume()}const i=this.effects.slice();for(e=0,n=i.length;e<n;e++)i[e].resume()}}run(e){if(this._active){const n=dn;try{return dn=this,e()}finally{dn=n}}}on(){++this._on===1&&(this.prevScope=dn,dn=this)}off(){if(this._on>0&&--this._on===0){if(dn===this)dn=this.prevScope;else{let e=dn;for(;e;){if(e.prevScope===this){e.prevScope=this.prevScope;break}e=e.prevScope}}this.prevScope=void 0}}stop(e){if(this._active){this._active=!1;let n,i;for(n=0,i=this.effects.length;n<i;n++)this.effects[n].stop();for(this.effects.length=0,n=0,i=this.cleanups.length;n<i;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){const s=this.scopes.slice();for(n=0,i=s.length;n<i;n++)s[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function tE(t){return new mp(t)}function p_(){return dn}function nE(t,e=!1){dn&&dn.cleanups.push(t)}let Xt;const Wf=new WeakSet;class cl{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,dn&&(dn.active?dn.effects.push(this):this.flags&=-2)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Wf.has(this)&&(Wf.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||g_(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Ym(this),__(this);const e=Xt,n=Ji;Xt=this,Ji=!0;try{return this.fn()}finally{v_(this),Xt=e,Ji=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)vp(e);this.deps=this.depsTail=void 0,Ym(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Wf.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){$h(this)&&this.run()}get dirty(){return $h(this)}}let m_=0,Qa,el;function g_(t,e=!1){if(t.flags|=8,e){t.next=el,el=t;return}t.next=Qa,Qa=t}function gp(){m_++}function _p(){if(--m_>0)return;if(el){let e=el;for(el=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;Qa;){let e=Qa;for(Qa=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(i){t||(t=i)}e=n}}if(t)throw t}function __(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function v_(t){let e,n=t.depsTail,i=n;for(;i;){const s=i.prevDep;i.version===-1?(i===n&&(n=s),vp(i),iE(i)):e=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=s}t.deps=e,t.depsTail=n}function $h(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(x_(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function x_(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===fl)||(t.globalVersion=fl,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!$h(t))))return;t.flags|=2;const e=t.dep,n=Xt,i=Ji;Xt=t,Ji=!0;try{__(t);const s=t.fn(t._value);(e.version===0||An(s,t._value))&&(t.flags|=128,t._value=s,e.version++)}catch(s){throw e.version++,s}finally{Xt=n,Ji=i,v_(t),t.flags&=-3}}function vp(t,e=!1){const{dep:n,prevSub:i,nextSub:s}=t;if(i&&(i.nextSub=s,t.prevSub=void 0),s&&(s.prevSub=i,t.nextSub=void 0),n.subs===t&&(n.subs=i,!i&&n.computed)){n.computed.flags&=-5;for(let r=n.computed.deps;r;r=r.nextDep)vp(r,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function iE(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}function sE(t,e){t.effect instanceof cl&&(t=t.effect.fn);const n=new cl(t);e&&_t(n,e);try{n.run()}catch(s){throw n.stop(),s}const i=n.run.bind(n);return i.effect=n,i}function rE(t){t.effect.stop()}let Ji=!0;const y_=[];function bs(){y_.push(Ji),Ji=!1}function Ms(){const t=y_.pop();Ji=t===void 0?!0:t}function Ym(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=Xt;Xt=void 0;try{e()}finally{Xt=n}}}let fl=0;class oE{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class of{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!Xt||!Ji||Xt===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==Xt)n=this.activeLink=new oE(Xt,this),Xt.deps?(n.prevDep=Xt.depsTail,Xt.depsTail.nextDep=n,Xt.depsTail=n):Xt.deps=Xt.depsTail=n,E_(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const i=n.nextDep;i.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=i),n.prevDep=Xt.depsTail,n.nextDep=void 0,Xt.depsTail.nextDep=n,Xt.depsTail=n,Xt.deps===n&&(Xt.deps=i)}return n}trigger(e){this.version++,fl++,this.notify(e)}notify(e){gp();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{_p()}}}function E_(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let i=e.deps;i;i=i.nextDep)E_(i)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const oc=new WeakMap,io=Symbol(""),Xh=Symbol(""),hl=Symbol("");function zn(t,e,n){if(Ji&&Xt){let i=oc.get(t);i||oc.set(t,i=new Map);let s=i.get(n);s||(i.set(n,s=new of),s.map=i,s.key=n),s.track()}}function Hs(t,e,n,i,s,r){const o=oc.get(t);if(!o){fl++;return}const a=l=>{l&&l.trigger()};if(gp(),e==="clear")o.forEach(a);else{const l=Ue(t),u=l&&ef(n);if(l&&n==="length"){const c=Number(i);o.forEach((f,h)=>{(h==="length"||h===hl||!$n(h)&&h>=c)&&a(f)})}else switch((n!==void 0||o.has(void 0))&&a(o.get(n)),u&&a(o.get(hl)),e){case"add":l?u&&a(o.get("length")):(a(o.get(io)),Tr(t)&&a(o.get(Xh)));break;case"delete":l||(a(o.get(io)),Tr(t)&&a(o.get(Xh)));break;case"set":Tr(t)&&a(o.get(io));break}}_p()}function aE(t,e){const n=oc.get(t);return n&&n.get(e)}function wo(t){const e=nt(t);return e===t||(zn(e,"iterate",hl),hi(t))?e:ts(t)?xs(t)?e.map(n=>Dr(Oi(n))):e.map(Dr):e.map(Oi)}function af(t){return zn(t=nt(t),"iterate",hl),t}function hs(t,e){return ts(t)?Dr(xs(t)?Oi(e):e):Oi(e)}const lE={__proto__:null,[Symbol.iterator](){return $f(this,Symbol.iterator,t=>hs(this,t))},concat(...t){return wo(this).concat(...t.map(e=>Ue(e)?wo(e):e))},entries(){return $f(this,"entries",t=>(t[1]=hs(this,t[1]),t))},every(t,e){return Ds(this,"every",t,e,void 0,arguments)},filter(t,e){return Ds(this,"filter",t,e,n=>n.map(i=>hs(this,i)),arguments)},find(t,e){return Ds(this,"find",t,e,n=>hs(this,n),arguments)},findIndex(t,e){return Ds(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return Ds(this,"findLast",t,e,n=>hs(this,n),arguments)},findLastIndex(t,e){return Ds(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return Ds(this,"forEach",t,e,void 0,arguments)},includes(...t){return Xf(this,"includes",t)},indexOf(...t){return Xf(this,"indexOf",t)},join(t){return wo(this).join(t)},lastIndexOf(...t){return Xf(this,"lastIndexOf",t)},map(t,e){return Ds(this,"map",t,e,void 0,arguments)},pop(){return Ra(this,"pop")},push(...t){return Ra(this,"push",t)},reduce(t,...e){return Km(this,"reduce",t,e)},reduceRight(t,...e){return Km(this,"reduceRight",t,e)},shift(){return Ra(this,"shift")},some(t,e){return Ds(this,"some",t,e,void 0,arguments)},splice(...t){return Ra(this,"splice",t)},toReversed(){return wo(this).toReversed()},toSorted(t){return wo(this).toSorted(t)},toSpliced(...t){return wo(this).toSpliced(...t)},unshift(...t){return Ra(this,"unshift",t)},values(){return $f(this,"values",t=>hs(this,t))}};function $f(t,e,n){const i=af(t),s=i[e]();return i!==t&&!hi(t)&&(s._next=s.next,s.next=()=>{const r=s._next();return r.done||(r.value=n(r.value)),r}),s}const uE=Array.prototype;function Ds(t,e,n,i,s,r){const o=af(t),a=o!==t&&!hi(t),l=o[e];if(l!==uE[e]){const f=l.apply(t,r);return a?Oi(f):f}let u=n;o!==t&&(a?u=function(f,h){return n.call(this,hs(t,f),h,t)}:n.length>2&&(u=function(f,h){return n.call(this,f,h,t)}));const c=l.call(o,u,i);return a&&s?s(c):c}function Km(t,e,n,i){const s=af(t),r=s!==t&&!hi(t);let o=n,a=!1;s!==t&&(r?(a=i.length===0,o=function(u,c,f){return a&&(a=!1,u=hs(t,u)),n.call(this,u,hs(t,c),f,t)}):n.length>3&&(o=function(u,c,f){return n.call(this,u,c,f,t)}));const l=s[e](o,...i);return a?hs(t,l):l}function Xf(t,e,n){const i=nt(t);zn(i,"iterate",hl);const s=i[e](...n);return(s===-1||s===!1)&&Ul(n[0])?(n[0]=nt(n[0]),i[e](...n)):s}function Ra(t,e,n=[]){bs(),gp();const i=nt(t)[e].apply(t,n);return _p(),Ms(),i}const cE=Xn("__proto__,__v_isRef,__isVue"),S_=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter($n));function fE(t){$n(t)||(t=String(t));const e=nt(this);return zn(e,"has",t),e.hasOwnProperty(t)}class b_{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,i){if(n==="__v_skip")return e.__v_skip;const s=this._isReadonly,r=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return r;if(n==="__v_raw")return i===(s?r?R_:C_:r?w_:T_).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(i)?e:void 0;const o=Ue(e);if(!s){let l;if(o&&(l=lE[n]))return l;if(n==="hasOwnProperty")return fE}const a=Reflect.get(e,n,an(e)?e:i);if(($n(n)?S_.has(n):cE(n))||(s||zn(e,"get",n),r))return a;if(an(a)){const l=o&&ef(n)?a:a.value;return s&&Pt(l)?ac(l):l}return Pt(a)?s?ac(a):uf(a):a}}class M_ extends b_{constructor(e=!1){super(!1,e)}set(e,n,i,s){let r=e[n];const o=Ue(e)&&ef(n);if(!this._isShallow){const u=ts(r);if(!hi(i)&&!ts(i)&&(r=nt(r),i=nt(i)),!o&&an(r)&&!an(i))return u||(r.value=i),!0}const a=o?Number(n)<e.length:Lt(e,n),l=Reflect.set(e,n,i,an(e)?e:s);return e===nt(s)&&l&&(a?An(i,r)&&Hs(e,"set",n,i):Hs(e,"add",n,i)),l}deleteProperty(e,n){const i=Lt(e,n);e[n];const s=Reflect.deleteProperty(e,n);return s&&i&&Hs(e,"delete",n,void 0),s}has(e,n){const i=Reflect.has(e,n);return(!$n(n)||!S_.has(n))&&zn(e,"has",n),i}ownKeys(e){return zn(e,"iterate",Ue(e)?"length":io),Reflect.ownKeys(e)}}class A_ extends b_{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const hE=new M_,dE=new A_,pE=new M_(!0),mE=new A_(!0),qh=t=>t,iu=t=>Reflect.getPrototypeOf(t);function gE(t,e,n){return function(...i){const s=this.__v_raw,r=nt(s),o=Tr(r),a=t==="entries"||t===Symbol.iterator&&o,l=t==="keys"&&o,u=s[t](...i),c=n?qh:e?Dr:Oi;return!e&&zn(r,"iterate",l?Xh:io),_t(Object.create(u),{next(){const{value:f,done:h}=u.next();return h?{value:f,done:h}:{value:a?[c(f[0]),c(f[1])]:c(f),done:h}}})}}function su(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function _E(t,e){const n={get(s){const r=this.__v_raw,o=nt(r),a=nt(s);t||(An(s,a)&&zn(o,"get",s),zn(o,"get",a));const{has:l}=iu(o),u=e?qh:t?Dr:Oi;if(l.call(o,s))return u(r.get(s));if(l.call(o,a))return u(r.get(a));r!==o&&r.get(s)},get size(){const s=this.__v_raw;return!t&&zn(nt(s),"iterate",io),s.size},has(s){const r=this.__v_raw,o=nt(r),a=nt(s);return t||(An(s,a)&&zn(o,"has",s),zn(o,"has",a)),s===a?r.has(s):r.has(s)||r.has(a)},forEach(s,r){const o=this,a=o.__v_raw,l=nt(a),u=e?qh:t?Dr:Oi;return!t&&zn(l,"iterate",io),a.forEach((c,f)=>s.call(r,u(c),u(f),o))}};return _t(n,t?{add:su("add"),set:su("set"),delete:su("delete"),clear:su("clear")}:{add(s){const r=nt(this),o=iu(r),a=nt(s),l=!e&&!hi(s)&&!ts(s)?a:s;return o.has.call(r,l)||An(s,l)&&o.has.call(r,s)||An(a,l)&&o.has.call(r,a)||(r.add(l),Hs(r,"add",l,l)),this},set(s,r){!e&&!hi(r)&&!ts(r)&&(r=nt(r));const o=nt(this),{has:a,get:l}=iu(o);let u=a.call(o,s);u||(s=nt(s),u=a.call(o,s));const c=l.call(o,s);return o.set(s,r),u?An(r,c)&&Hs(o,"set",s,r):Hs(o,"add",s,r),this},delete(s){const r=nt(this),{has:o,get:a}=iu(r);let l=o.call(r,s);l||(s=nt(s),l=o.call(r,s)),a&&a.call(r,s);const u=r.delete(s);return l&&Hs(r,"delete",s,void 0),u},clear(){const s=nt(this),r=s.size!==0,o=s.clear();return r&&Hs(s,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=gE(s,t,e)}),n}function lf(t,e){const n=_E(t,e);return(i,s,r)=>s==="__v_isReactive"?!t:s==="__v_isReadonly"?t:s==="__v_raw"?i:Reflect.get(Lt(n,s)&&s in i?n:i,s,r)}const vE={get:lf(!1,!1)},xE={get:lf(!1,!0)},yE={get:lf(!0,!1)},EE={get:lf(!0,!0)},T_=new WeakMap,w_=new WeakMap,C_=new WeakMap,R_=new WeakMap;function SE(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function uf(t){return ts(t)?t:cf(t,!1,hE,vE,T_)}function F_(t){return cf(t,!1,pE,xE,w_)}function ac(t){return cf(t,!0,dE,yE,C_)}function bE(t){return cf(t,!0,mE,EE,R_)}function cf(t,e,n,i,s){if(!Pt(t)||t.__v_raw&&!(e&&t.__v_isReactive)||t.__v_skip||!Object.isExtensible(t))return t;const r=s.get(t);if(r)return r;const o=SE(Cy(t));if(o===0)return t;const a=new Proxy(t,o===2?i:n);return s.set(t,a),a}function xs(t){return ts(t)?xs(t.__v_raw):!!(t&&t.__v_isReactive)}function ts(t){return!!(t&&t.__v_isReadonly)}function hi(t){return!!(t&&t.__v_isShallow)}function Ul(t){return t?!!t.__v_raw:!1}function nt(t){const e=t&&t.__v_raw;return e?nt(e):t}function D_(t){return!Lt(t,"__v_skip")&&Object.isExtensible(t)&&ra(t,"__v_skip",!0),t}const Oi=t=>Pt(t)?uf(t):t,Dr=t=>Pt(t)?ac(t):t;function an(t){return t?t.__v_isRef===!0:!1}function st(t){return I_(t,!1)}function P_(t){return I_(t,!0)}function I_(t,e){return an(t)?t:new ME(t,e)}class ME{constructor(e,n){this.dep=new of,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:nt(e),this._value=n?e:Oi(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,i=this.__v_isShallow||hi(e)||ts(e);e=i?e:nt(e),An(e,n)&&(this._rawValue=e,this._value=i?e:Oi(e),this.dep.trigger())}}function AE(t){t.dep&&t.dep.trigger()}function Ol(t){return an(t)?t.value:t}function TE(t){return it(t)?t():Ol(t)}const wE={get:(t,e,n)=>e==="__v_raw"?t:Ol(Reflect.get(t,e,n)),set:(t,e,n,i)=>{const s=t[e];return an(s)&&!an(n)?(s.value=n,!0):Reflect.set(t,e,n,i)}};function xp(t){return xs(t)?t:new Proxy(t,wE)}class CE{constructor(e){this.__v_isRef=!0,this._value=void 0;const n=this.dep=new of,{get:i,set:s}=e(n.track.bind(n),n.trigger.bind(n));this._get=i,this._set=s}get value(){return this._value=this._get()}set value(e){this._set(e)}}function L_(t){return new CE(t)}function RE(t){const e=Ue(t)?new Array(t.length):{};for(const n in t)e[n]=N_(t,n);return e}class FE{constructor(e,n,i){this._object=e,this._defaultValue=i,this.__v_isRef=!0,this._value=void 0,this._key=$n(n)?n:String(n),this._raw=nt(e);let s=!0,r=e;if(!Ue(e)||$n(this._key)||!ef(this._key))do s=!Ul(r)||hi(r);while(s&&(r=r.__v_raw));this._shallow=s}get value(){let e=this._object[this._key];return this._shallow&&(e=Ol(e)),this._value=e===void 0?this._defaultValue:e}set value(e){if(this._shallow&&an(this._raw[this._key])){const n=this._object[this._key];if(an(n)){n.value=e;return}}this._object[this._key]=e}get dep(){return aE(this._raw,this._key)}}class DE{constructor(e){this._getter=e,this.__v_isRef=!0,this.__v_isReadonly=!0,this._value=void 0}get value(){return this._value=this._getter()}}function PE(t,e,n){return an(t)?t:it(t)?new DE(t):Pt(t)&&arguments.length>1?N_(t,e,n):st(t)}function N_(t,e,n){return new FE(t,e,n)}class IE{constructor(e,n,i){this.fn=e,this.setter=n,this._value=void 0,this.dep=new of(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=fl-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&Xt!==this)return g_(this,!0),!0}get value(){const e=this.dep.track();return x_(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function LE(t,e,n=!1){let i,s;return it(t)?i=t:(i=t.get,s=t.set),new IE(i,s,n)}const NE={GET:"get",HAS:"has",ITERATE:"iterate"},BE={SET:"set",ADD:"add",DELETE:"delete",CLEAR:"clear"},ru={},lc=new WeakMap;let yr;function UE(){return yr}function B_(t,e=!1,n=yr){if(n){let i=lc.get(n);i||lc.set(n,i=[]),i.push(t)}}function OE(t,e,n=yt){const{immediate:i,deep:s,once:r,scheduler:o,augmentJob:a,call:l}=n,u=g=>s?g:hi(g)||s===!1||s===0?Gs(g,1):Gs(g);let c,f,h,d,m=!1,x=!1;if(an(t)?(f=()=>t.value,m=hi(t)):xs(t)?(f=()=>u(t),m=!0):Ue(t)?(x=!0,m=t.some(g=>xs(g)||hi(g)),f=()=>t.map(g=>{if(an(g))return g.value;if(xs(g))return u(g);if(it(g))return l?l(g,2):g()})):it(t)?e?f=l?()=>l(t,2):t:f=()=>{if(h){bs();try{h()}finally{Ms()}}const g=yr;yr=c;try{return l?l(t,3,[d]):t(d)}finally{yr=g}}:f=Tn,e&&s){const g=f,E=s===!0?1/0:s;f=()=>Gs(g(),E)}const _=p_(),p=()=>{c.stop(),_&&_.active&&dp(_.effects,c)};if(r&&e){const g=e;e=(...E)=>{const T=g(...E);return p(),T}}let b=x?new Array(t.length).fill(ru):ru;const y=g=>{if(!(!(c.flags&1)||!c.dirty&&!g))if(e){const E=c.run();if(g||s||m||(x?E.some((T,C)=>An(T,b[C])):An(E,b))){h&&h();const T=yr;yr=c;try{const C=[E,b===ru?void 0:x&&b[0]===ru?[]:b,d];b=E,l?l(e,3,C):e(...C)}finally{yr=T}}}else c.run()};return a&&a(y),c=new cl(f),c.scheduler=o?()=>o(y,!1):y,d=g=>B_(g,!1,c),h=c.onStop=()=>{const g=lc.get(c);if(g){if(l)l(g,4);else for(const E of g)E();lc.delete(c)}},e?i?y(!0):b=c.run():o?o(y.bind(null,!0),!0):c.run(),p.pause=c.pause.bind(c),p.resume=c.resume.bind(c),p.stop=p,p}function Gs(t,e=1/0,n){if(e<=0||!Pt(t)||t.__v_skip||(n=n||new Map,(n.get(t)||0)>=e))return t;if(n.set(t,e),e--,an(t))Gs(t.value,e,n);else if(Ue(t))for(let i=0;i<t.length;i++)Gs(t[i],e,n);else if(Ss(t)||Tr(t))t.forEach(i=>{Gs(i,e,n)});else if(Qc(t)){for(const i in t)Gs(t[i],e,n);for(const i of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,i)&&Gs(t[i],e,n)}return t}/**
* @vue/runtime-core v3.5.43
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/const so=[];function kE(t){so.push(t)}function zE(){so.pop()}let qf=!1;function _r(t,...e){if(qf)return;qf=!0,bs();const n=so.length?so[so.length-1].component:null,i=n&&n.appContext.config.warnHandler,s=VE();if(i)yo(i,n,11,[t+e.map(r=>{var o,a;return(a=(o=r.toString)==null?void 0:o.call(r))!=null?a:JSON.stringify(r)}).join(""),n&&n.proxy,s.map(({vnode:r})=>`at <${Hv(n,r.type)}>`).join(`
`),s]);else{const r=[`[Vue warn]: ${t}`,...e];s.length&&r.push(`
`,...HE(s)),console.warn(...r)}Ms(),qf=!1}function VE(){let t=so[so.length-1];if(!t)return[];const e=[];for(;t;){const n=e[0];n&&n.vnode===t?n.recurseCount++:e.push({vnode:t,recurseCount:0});const i=t.component&&t.component.parent;t=i&&i.vnode}return e}function HE(t){const e=[];return t.forEach((n,i)=>{e.push(...i===0?[]:[`
`],...GE(n))}),e}function GE({vnode:t,recurseCount:e}){const n=e>0?`... (${e} recursive calls)`:"",i=t.component?t.component.parent==null:!1,s=` at <${Hv(t.component,t.type,i)}`,r=">"+n;return t.props?[s,...WE(t.props),r]:[s+r]}function WE(t){const e=[],n=Object.keys(t);return n.slice(0,3).forEach(i=>{e.push(...U_(i,t[i]))}),n.length>3&&e.push(" ..."),e}function U_(t,e,n){return Qe(e)?(e=JSON.stringify(e),n?e:[`${t}=${e}`]):typeof e=="number"||typeof e=="boolean"||e==null?n?e:[`${t}=${e}`]:an(e)?(e=U_(t,nt(e.value),!0),n?e:[`${t}=Ref<`,e,">"]):it(e)?[`${t}=fn${e.name?`<${e.name}>`:""}`]:(e=nt(e),n?e:[`${t}=`,e])}function $E(t,e){}const XE={SETUP_FUNCTION:0,0:"SETUP_FUNCTION",RENDER_FUNCTION:1,1:"RENDER_FUNCTION",NATIVE_EVENT_HANDLER:5,5:"NATIVE_EVENT_HANDLER",COMPONENT_EVENT_HANDLER:6,6:"COMPONENT_EVENT_HANDLER",VNODE_HOOK:7,7:"VNODE_HOOK",DIRECTIVE_HOOK:8,8:"DIRECTIVE_HOOK",TRANSITION_HOOK:9,9:"TRANSITION_HOOK",APP_ERROR_HANDLER:10,10:"APP_ERROR_HANDLER",APP_WARN_HANDLER:11,11:"APP_WARN_HANDLER",FUNCTION_REF:12,12:"FUNCTION_REF",ASYNC_COMPONENT_LOADER:13,13:"ASYNC_COMPONENT_LOADER",SCHEDULER:14,14:"SCHEDULER",COMPONENT_UPDATE:15,15:"COMPONENT_UPDATE",APP_UNMOUNT_CLEANUP:16,16:"APP_UNMOUNT_CLEANUP"},qE={sp:"serverPrefetch hook",bc:"beforeCreate hook",c:"created hook",bm:"beforeMount hook",m:"mounted hook",bu:"beforeUpdate hook",u:"updated",bum:"beforeUnmount hook",um:"unmounted hook",a:"activated hook",da:"deactivated hook",ec:"errorCaptured hook",rtc:"renderTracked hook",rtg:"renderTriggered hook",0:"setup function",1:"render function",2:"watcher getter",3:"watcher callback",4:"watcher cleanup function",5:"native event handler",6:"component event handler",7:"vnode hook",8:"directive hook",9:"transition hook",10:"app errorHandler",11:"app warnHandler",12:"ref function",13:"async component loader",14:"scheduler flush",15:"component update",16:"app unmount cleanup function"};function yo(t,e,n,i){try{return i?t(...i):t()}catch(s){Eo(s,e,n)}}function Si(t,e,n,i){if(it(t)){const s=yo(t,e,n,i);return s&&pp(s)&&s.catch(r=>{Eo(r,e,n)}),s}if(Ue(t)){const s=[];for(let r=0;r<t.length;r++)s.push(Si(t[r],e,n,i));return s}}function Eo(t,e,n,i=!0){const s=e?e.vnode:null,{errorHandler:r,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||yt;if(e){let a=e.parent;const l=e.proxy,u=`https://vuejs.org/error-reference/#runtime-${n}`;for(;a;){const c=a.ec;if(c){for(let f=0;f<c.length;f++)if(c[f](t,l,u)===!1)return}a=a.parent}if(r){bs(),yo(r,null,10,[t,l,u]),Ms();return}}YE(t,n,s,i,o)}function YE(t,e,n,i=!0,s=!1){if(s)throw t;console.error(t)}const Zn=[];let us=-1;const jo=[];let Er=null,Xo=0;const O_=Promise.resolve();let uc=null;function ff(t){const e=uc||O_;return t?e.then(this?t.bind(this):t):e}function KE(t){let e=us+1,n=Zn.length;for(;e<n;){const i=e+n>>>1,s=Zn[i],r=pl(s);r<t||r===t&&s.flags&2?e=i+1:n=i}return e}function yp(t){if(!(t.flags&1)){const e=pl(t),n=Zn[Zn.length-1];!n||!(t.flags&2)&&e>=pl(n)?Zn.push(t):Zn.splice(KE(e),0,t),t.flags|=1,k_()}}function k_(){uc||(uc=O_.then(z_))}function dl(t){if(!Ue(t))Er&&t.id===-1?Er.splice(Xo+1,0,t):t.flags&1||(jo.push(t),t.flags|=1);else for(let e=0;e<t.length;e++)jo.push(t[e]);k_()}function Zm(t,e,n=us+1){for(;n<Zn.length;n++){const i=Zn[n];if(i&&i.flags&2){if(t&&i.id!==t.uid)continue;Zn.splice(n,1),n--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function cc(t){if(jo.length){const e=[...new Set(jo)].sort((n,i)=>pl(n)-pl(i));if(jo.length=0,Er){for(let n=0;n<e.length;n++)Er.push(e[n]);return}for(Er=e,Xo=0;Xo<Er.length;Xo++){const n=Er[Xo];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}Er=null,Xo=0}}const pl=t=>t.id==null?t.flags&2?-1:1/0:t.id;function z_(t){try{for(us=0;us<Zn.length;us++){const e=Zn[us];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),yo(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;us<Zn.length;us++){const e=Zn[us];e&&(e.flags&=-2)}us=-1,Zn.length=0,cc(),uc=null,(Zn.length||jo.length)&&z_()}}let $i,Wa=[],Yh=!1;function hf(t,...e){$i?$i.emit(t,...e):Yh||Wa.push({event:t,args:e})}function Ep(t,e){var n,i;$i=t,$i?($i.enabled=!0,Wa.forEach(({event:s,args:r})=>$i.emit(s,...r)),Wa=[]):typeof window<"u"&&window.HTMLElement&&!((i=(n=window.navigator)==null?void 0:n.userAgent)!=null&&i.includes("jsdom"))?((e.__VUE_DEVTOOLS_HOOK_REPLAY__=e.__VUE_DEVTOOLS_HOOK_REPLAY__||[]).push(r=>{Ep(r,e)}),setTimeout(()=>{$i||(e.__VUE_DEVTOOLS_HOOK_REPLAY__=null,Yh=!0,Wa=[])},3e3)):(Yh=!0,Wa=[])}function ZE(t,e){hf("app:init",t,e,{Fragment:pn,Text:Zs,Comment:nn,Static:Js})}function JE(t){hf("app:unmount",t)}const Kh=Sp("component:added"),V_=Sp("component:updated"),jE=Sp("component:removed"),QE=t=>{$i&&typeof $i.cleanupBuffer=="function"&&!$i.cleanupBuffer(t)&&jE(t)};function Sp(t){return e=>{hf(t,e.appContext.app,e.uid,e.parent?e.parent.uid:void 0,e)}}function eS(t,e,n){hf("component:emit",t.appContext.app,t,e,n)}let Fn=null,df=null;function ml(t){const e=Fn;return Fn=t,df=t&&t.type.__scopeId||null,e}function tS(t){df=t}function nS(){df=null}const iS=t=>bp;function bp(t,e=Fn,n){if(!e||t._n)return t;const i=(...s)=>{i._d&&xl(-1);const r=ml(e),o=js.length;let a;try{a=t(...s)}finally{for(let l=js.length;l>o;l--)Ef();ml(r),i._d&&xl(1)}return __VUE_PROD_DEVTOOLS__&&V_(e),a};return i._n=!0,i._c=!0,i._d=!0,i}function sS(t,e){if(Fn===null)return t;const n=Hl(Fn),i=t.dirs||(t.dirs=[]);for(let s=0;s<e.length;s++){let[r,o,a,l=yt]=e[s];r&&(it(r)&&(r={mounted:r,updated:r}),r.deep&&Gs(o),i.push({dir:r,instance:n,value:o,oldValue:void 0,arg:a,modifiers:l}))}return t}function cs(t,e,n,i){const s=t.dirs,r=e&&e.dirs;for(let o=0;o<s.length;o++){const a=s[o];r&&(a.oldValue=r[o].value);let l=a.dir[i];l&&(bs(),Si(l,n,8,[t.el,a,t,e]),Ms())}}function H_(t,e){if(Rn){let n=Rn.provides;const i=Rn.parent&&Rn.parent.provides;i===n&&(n=Rn.provides=Object.create(i)),n[t]=e}}function tl(t,e,n=!1){const i=Qn();if(i||oo){let s=oo?oo._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(s&&t in s)return s[t];if(arguments.length>1)return n&&it(e)?e.call(i&&i.proxy):e}}function rS(){return!!(Qn()||oo)}const G_=Symbol.for("v-scx"),W_=()=>tl(G_);function oS(t,e){return kl(t,null,e)}function aS(t,e){return kl(t,null,{flush:"post"})}function $_(t,e){return kl(t,null,{flush:"sync"})}function ro(t,e,n){return kl(t,e,n)}function kl(t,e,n=yt){const{immediate:i,deep:s,flush:r,once:o}=n,a=_t({},n),l=e&&i||!e&&r!=="post";let u;if(fo){if(r==="sync"){const d=W_();u=d.__watcherHandles||(d.__watcherHandles=[])}else if(!l){const d=()=>{};return d.stop=Tn,d.resume=Tn,d.pause=Tn,d}}const c=Rn;a.call=(d,m,x)=>Si(d,c,m,x);let f=!1;r==="post"?a.scheduler=d=>{un(d,c&&c.suspense)}:r!=="sync"&&(f=!0,a.scheduler=(d,m)=>{m?d():yp(d)}),a.augmentJob=d=>{e&&(d.flags|=4),f&&(d.flags|=2,c&&(d.id=c.uid,d.i=c))};const h=OE(t,e,a);return fo&&(u?u.push(h):l&&h()),h}function lS(t,e,n){const i=this.proxy,s=Qe(t)?t.includes(".")?X_(i,t):()=>i[t]:t.bind(i,i);let r;it(e)?r=e:(r=e.handler,n=e);const o=ya(this),a=kl(s,r.bind(i),n);return o(),a}function X_(t,e){const n=e.split(".");return()=>{let i=t;for(let s=0;s<n.length&&i;s++)i=i[n[s]];return i}}const vr=new WeakMap,q_=Symbol("_vte"),pf=t=>t.__isTeleport,Zr=t=>t&&(t.disabled||t.disabled===""),uS=t=>t&&(t.defer||t.defer===""),Jm=t=>typeof SVGElement<"u"&&t instanceof SVGElement,jm=t=>typeof MathMLElement=="function"&&t instanceof MathMLElement,Zh=(t,e)=>{const n=t&&t.to;return Qe(n)?e?e(n):null:n},cS={name:"Teleport",__isTeleport:!0,process(t,e,n,i,s,r,o,a,l,u){const{mc:c,pc:f,pbc:h,o:{insert:d,querySelector:m,createText:x,createComment:_,parentNode:p}}=u,b=Zr(e.props);let{dynamicChildren:y}=e;const g=(C,v,A)=>{C.shapeFlag&16&&c(C.children,v,A,s,r,o,a,l)},E=(C=e)=>{const v=Zr(C.props),A=C.target=Zh(C.props,m),R=Jh(A,C,x,d);A&&(o!=="svg"&&Jm(A)?o="svg":o!=="mathml"&&jm(A)&&(o="mathml"),s&&s.isCE&&(s.ce._teleportTargets||(s.ce._teleportTargets=new Set)).add(A),v||(g(C,A,R),$a(C,!1)))},T=C=>{const v=()=>{if(vr.get(C)===v){if(vr.delete(C),Zr(C.props)){const A=p(C.el)||n;g(C,A,C.anchor),$a(C,!0)}E(C)}};vr.set(C,v),un(v,r)};if(t==null){const C=e.el=x(""),v=e.anchor=x("");if(d(C,n,i),d(v,n,i),uS(e.props)||r&&r.pendingBranch){T(e);return}b&&(g(e,n,v),$a(e,!0)),E()}else{e.el=t.el;const C=e.anchor=t.anchor,v=vr.get(t);if(v){v.flags|=8,vr.delete(t),T(e);return}e.targetStart=t.targetStart;const A=e.target=t.target,R=e.targetAnchor=t.targetAnchor,L=Zr(t.props),M=L?n:A,I=L?C:R;if(o==="svg"||Jm(A)?o="svg":(o==="mathml"||jm(A))&&(o="mathml"),y?(h(t.dynamicChildren,y,M,s,r,o,a),Np(t,e,!0)):l||f(t,e,M,I,s,r,o,a,!1),b)L?e.props&&t.props&&e.props.to!==t.props.to&&(e.props.to=t.props.to):ou(e,n,C,u,1);else if((e.props&&e.props.to)!==(t.props&&t.props.to)){const F=Zh(e.props,m);F&&(e.target=F,ou(e,F,null,u,0))}else L&&ou(e,A,R,u,1);$a(e,b)}},remove(t,e,n,{um:i,o:{remove:s}},r){const{shapeFlag:o,children:a,anchor:l,targetStart:u,targetAnchor:c,target:f,props:h}=t,d=Zr(h),m=r||!d,x=vr.get(t);if(x&&(x.flags|=8,vr.delete(t)),f&&(s(u),s(c)),r&&s(l),!x&&(d||f)&&o&16)for(let _=0;_<a.length;_++){const p=a[_];i(p,e,n,m,!!p.dynamicChildren)}},move:ou,hydrate:fS};function ou(t,e,n,{o:{insert:i},m:s},r=2){r===0&&i(t.targetAnchor,e,n);const{el:o,anchor:a,shapeFlag:l,children:u,props:c}=t,f=r===2;if(f&&i(o,e,n),!vr.has(t)&&(!f||Zr(c))&&l&16)for(let h=0;h<u.length;h++)s(u[h],e,n,2);f&&i(a,e,n)}function fS(t,e,n,i,s,r,{o:{nextSibling:o,parentNode:a,querySelector:l,insert:u,createText:c}},f){function h(_,p){let b=p;for(;b;){if(b&&b.nodeType===8){if(b.data==="teleport start anchor")e.targetStart=b;else if(b.data==="teleport anchor"){e.targetAnchor=b,_._lpa=e.targetAnchor&&o(e.targetAnchor);break}}b=o(b)}}function d(_,p){p.anchor=f(o(_),p,a(_),n,i,s,r)}const m=e.target=Zh(e.props,l),x=Zr(e.props);if(m){const _=m._lpa||m.firstChild;e.shapeFlag&16&&(x?(d(t,e),h(m,_),e.targetAnchor||Jh(m,e,c,u,a(t)===m?t:null)):(e.anchor=o(t),h(m,_),e.targetAnchor||Jh(m,e,c,u),f(_&&o(_),e,m,n,i,s,r))),$a(e,x)}else x&&e.shapeFlag&16&&(d(t,e),e.targetStart=t,e.targetAnchor=o(t));return e.anchor&&o(e.anchor)}const hS=cS;function $a(t,e){const n=t.ctx;if(n&&n.ut){let i,s;for(e?(i=t.el,s=t.anchor):(i=t.targetStart,s=t.targetAnchor);i&&i!==s;)i.nodeType===1&&i.setAttribute("data-v-owner",n.uid),i=i.nextSibling;n.ut()}}function Jh(t,e,n,i,s=null){const r=e.targetStart=n(""),o=e.targetAnchor=n("");return r[q_]=o,t&&(i(r,t,s),i(o,t,s)),o}const Fi=Symbol("_leaveCb"),Fa=Symbol("_enterCb");function Mp(){const t={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return So(()=>{t.isMounted=!0}),Vl(()=>{t.isUnmounting=!0}),t}const wi=[Function,Array],Ap={mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:wi,onEnter:wi,onAfterEnter:wi,onEnterCancelled:wi,onBeforeLeave:wi,onLeave:wi,onAfterLeave:wi,onLeaveCancelled:wi,onBeforeAppear:wi,onAppear:wi,onAfterAppear:wi,onAppearCancelled:wi},Y_=t=>{const e=t.subTree;return e.component?Y_(e.component):e},dS={name:"BaseTransition",props:Ap,setup(t,{slots:e}){const n=Qn(),i=Mp();return()=>{const s=e.default&&mf(e.default(),!0),r=s&&s.length?K_(s):n.subTree?Lv():void 0;if(!r)return;const o=nt(t),{mode:a}=o;if(i.isLeaving)return Yf(r);const l=fc(r);if(!l)return Yf(r);let u=oa(l,o,i,n,f=>u=f);l.type!==nn&&ir(l,u);let c=n.subTree&&fc(n.subTree);if(c&&c.type!==nn&&!Xi(c,l)&&Y_(n).type!==nn){let f=oa(c,o,i,n);if(ir(c,f),a==="out-in"&&l.type!==nn)return i.isLeaving=!0,f.afterLeave=()=>{i.isLeaving=!1,n.job.flags&8||n.update(),delete f.afterLeave,c=void 0},Yf(r);a==="in-out"&&l.type!==nn?f.delayLeave=(h,d,m)=>{const x=J_(i,c);x[String(c.key)]=c,h[Fi]=()=>{d(),h[Fi]=void 0,delete u.delayedLeave,c=void 0},u.delayedLeave=()=>{m(),delete u.delayedLeave,c=void 0}}:c=void 0}else c&&(c=void 0);return r}}};function K_(t){let e=t[0];if(t.length>1){for(const n of t)if(n.type!==nn){e=n;break}}return e}const Z_=dS;function J_(t,e){const{leavingVNodes:n}=t;let i=n.get(e.type);return i||(i=Object.create(null),n.set(e.type,i)),i}function oa(t,e,n,i,s){const{appear:r,mode:o,persisted:a=!1,onBeforeEnter:l,onEnter:u,onAfterEnter:c,onEnterCancelled:f,onBeforeLeave:h,onLeave:d,onAfterLeave:m,onLeaveCancelled:x,onBeforeAppear:_,onAppear:p,onAfterAppear:b,onAppearCancelled:y}=e,g=String(t.key),E=J_(n,t),T=(A,R)=>{A&&Si(A,i,9,R)},C=(A,R)=>{const L=R[1];T(A,R),Ue(A)?A.every(M=>M.length<=1)&&L():A.length<=1&&L()},v={mode:o,persisted:a,beforeEnter(A){let R=l;if(!n.isMounted)if(r)R=_||l;else return;A[Fi]&&A[Fi](!0);const L=E[g];L&&Xi(t,L)&&L.el[Fi]&&L.el[Fi](),T(R,[A])},enter(A){if(E[g]===t)return;let R=u,L=c,M=f;if(!n.isMounted)if(r)R=p||u,L=b||c,M=y||f;else return;let I=!1;A[Fa]=B=>{I||(I=!0,B?T(M,[A]):T(L,[A]),v.delayedLeave&&v.delayedLeave(),A[Fa]=void 0)};const F=A[Fa].bind(null,!1);R?C(R,[A,F]):F()},leave(A,R){const L=String(t.key);if(A[Fa]&&A[Fa](!0),n.isUnmounting)return R();T(h,[A]);let M=!1;A[Fi]=F=>{M||(M=!0,R(),F?T(x,[A]):T(m,[A]),A[Fi]=void 0,E[L]===t&&delete E[L])};const I=A[Fi].bind(null,!1);E[L]=t,d?C(d,[A,I]):I()},clone(A){const R=oa(A,e,n,i,s);return s&&s(R),R}};return v}function Yf(t){if(zl(t))return t=As(t),t.children=null,t}function fc(t){if(!zl(t))return pf(t.type)&&t.children?K_(t.children):t;if(t.component)return t.component.subTree;const{shapeFlag:e,children:n}=t;if(n){if(e&16)return n[0];if(e&32&&it(n.default))return n.default()}}function ir(t,e){if(t.shapeFlag&6&&t.component){t.transition=e;const n=t.component.subTree;ir(pf(n.type)&&fc(n)||n,e)}else t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}function mf(t,e=!1,n){let i=[],s=0;for(let r=0;r<t.length;r++){let o=t[r];const a=n==null?o.key:String(n)+String(o.key!=null?o.key:r);o.type===pn?(o.patchFlag&128&&s++,i=i.concat(mf(o.children,e,a))):(e||o.type!==nn)&&i.push(a!=null?As(o,{key:a}):o)}if(s>1)for(let r=0;r<i.length;r++)i[r].patchFlag=-2;return i}function gf(t,e){return it(t)?_t({name:t.name},e,{setup:t}):t}function pS(){const t=Qn();return t?(t.appContext.config.idPrefix||"v")+"-"+t.ids[0]+t.ids[1]++:""}function Tp(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function mS(t){const e=Qn(),n=P_(null);if(e){const s=e.refs===yt?e.refs={}:e.refs;Object.defineProperty(s,t,{enumerable:!0,get:()=>n.value,set:r=>n.value=r})}return n}function Qm(t,e){let n;return!!((n=Object.getOwnPropertyDescriptor(t,e))&&!n.configurable)}const hc=new WeakMap;function Qo(t,e,n,i,s=!1){if(Ue(t)){t.forEach((x,_)=>Qo(x,e&&(Ue(e)?e[_]:e),n,i,s));return}if(Ks(i)&&!s){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&Qo(t,e,n,i.component.subTree);return}const r=i.shapeFlag&4?Hl(i.component):i.el,o=s?null:r,{i:a,r:l}=t,u=e&&e.r,c=a.refs===yt?a.refs={}:a.refs,f=a.setupState,h=nt(f),d=f===yt?Yo:x=>Qm(c,x)?!1:Lt(h,x),m=(x,_)=>!(_&&Qm(c,_));if(u!=null&&u!==l){if(e0(e),Qe(u))c[u]=null,d(u)&&(f[u]=null);else if(an(u)){const x=e;m(u,x.k)&&(u.value=null),x.k&&(c[x.k]=null)}}if(it(l))yo(l,a,12,[o,c]);else{const x=Qe(l),_=an(l);if(x||_){const p=()=>{if(t.f){const b=x?d(l)?f[l]:c[l]:m()||!t.k?l.value:c[t.k];if(s)Ue(b)&&dp(b,r);else if(Ue(b))b.includes(r)||b.push(r);else if(x)c[l]=[r],d(l)&&(f[l]=c[l]);else{const y=[r];m(l,t.k)&&(l.value=y),t.k&&(c[t.k]=y)}}else x?(c[l]=o,d(l)&&(f[l]=o)):_&&(m(l,t.k)&&(l.value=o),t.k&&(c[t.k]=o))};if(o){const b=()=>{p(),hc.delete(t)};b.id=-1,hc.set(t,b),un(b,n)}else e0(t),p()}}}function e0(t){const e=hc.get(t);e&&(e.flags|=8,hc.delete(t))}let t0=!1;const zr=()=>{t0||(console.error("Hydration completed but contains mismatches."),t0=!0)},gS=t=>t.namespaceURI.includes("svg")&&t.tagName!=="foreignObject",_S=t=>t.namespaceURI.includes("MathML"),au=t=>{if(t.nodeType===1){if(gS(t))return"svg";if(_S(t))return"mathml"}},Jr=t=>t.nodeType===8;function vS(t){const{mt:e,p:n,o:{patchProp:i,createText:s,nextSibling:r,parentNode:o,remove:a,insert:l,createComment:u}}=t,c=(y,g)=>{if(!g.hasChildNodes()){__VUE_PROD_HYDRATION_MISMATCH_DETAILS__&&_r("Attempting to hydrate existing markup but container is empty. Performing full mount instead."),n(null,y,g),cc(),g._vnode=y;return}f(g.firstChild,y,null,null,null),cc(),g._vnode=y},f=(y,g,E,T,C,v=!1)=>{v=v||!!g.dynamicChildren;const A=Jr(y)&&y.data==="[",R=()=>x(y,g,E,T,C,A),{type:L,ref:M,shapeFlag:I,patchFlag:F}=g;let B=y.nodeType;g.el=y,__VUE_PROD_DEVTOOLS__&&(ra(y,"__vnode",g,!0),ra(y,"__vueParentComponent",E,!0)),F===-2&&(v=!1,g.dynamicChildren=null);let O=null;switch(L){case Zs:B!==3?g.children===""?(l(g.el=s(""),o(y),y),O=y):O=R():(y.data!==g.children&&(__VUE_PROD_HYDRATION_MISMATCH_DETAILS__&&_r("Hydration text mismatch in",y.parentNode,`
  - rendered on server: ${JSON.stringify(y.data)}
  - expected on client: ${JSON.stringify(g.children)}`),zr(),y.data=g.children),O=r(y));break;case nn:b(y)?(O=r(y),p(g.el=y.content.firstChild,y,E)):B!==8||A?O=R():O=r(y);break;case Js:if(A&&(y=r(y),B=y.nodeType),B===1||B===3){O=y;const z=!g.children.length;for(let H=0;H<g.staticCount;H++)z&&(g.children+=O.nodeType===1?O.outerHTML:O.data),H===g.staticCount-1&&(g.anchor=O),O=r(O);return A?r(O):O}else R();break;case pn:A?O=m(y,g,E,T,C,v):O=R();break;default:if(I&1)(B!==1||g.type.toLowerCase()!==y.tagName.toLowerCase())&&!b(y)?O=R():O=h(y,g,E,T,C,v);else if(I&6){g.slotScopeIds=C;const z=o(y);if(A?O=_(y):Jr(y)&&y.data==="teleport start"?O=_(y,y.data,"teleport end"):O=r(y),e(g,z,null,E,T,au(z),v),(Ks(g)||g.component.asyncDep)&&!g.component.subTree){let H;A?(H=jt(Js),H.anchor=O?O.previousSibling:z.lastChild):H=y.nodeType===3?Up(""):jt(y.nodeType===8?nn:"div"),H.el=y,g.component.subTree=H}}else I&64?B!==8?O=R():O=g.type.hydrate(y,g,E,T,C,v,t,d):I&128?O=g.type.hydrate(y,g,E,T,au(o(y)),C,v,t,f):__VUE_PROD_HYDRATION_MISMATCH_DETAILS__&&_r("Invalid HostVNode type:",L,`(${typeof L})`)}return M!=null&&Qo(M,null,T,g),O},h=(y,g,E,T,C,v)=>{v=v||!!g.dynamicChildren;const{type:A,dynamicProps:R,props:L,patchFlag:M,shapeFlag:I,dirs:F,transition:B}=g,O=A==="input"||A==="option",z=!!R;if(O||z||M!==-1){F&&cs(g,null,E,"created");let H=!1;if(b(y)){H=Tv(null,B)&&E&&E.vnode.props&&E.vnode.props.appear;const Q=y.content.firstChild;if(H){const se=Q.getAttribute("class");se&&(Q.$cls=se),B.beforeEnter(Q)}p(Q,y,E),g.el=y=Q}if(I&16&&!(L&&(L.innerHTML||L.textContent))){let Q=d(y.firstChild,g,y,E,T,C,v);for(Q&&!nl(y,1)&&(__VUE_PROD_HYDRATION_MISMATCH_DETAILS__&&_r("Hydration children mismatch on",y,`
Server rendered element contains more child nodes than client vdom.`),zr());Q;){const se=Q;Q=Q.nextSibling,a(se)}}else if(I&8){let Q=g.children;Q[0]===`
`&&(y.tagName==="PRE"||y.tagName==="TEXTAREA")&&(Q=Q.slice(1));const{textContent:se}=y;se!==Q&&se!==Q.replace(/\r\n|\r/g,`
`)&&(nl(y,0)||(__VUE_PROD_HYDRATION_MISMATCH_DETAILS__&&_r("Hydration text content mismatch on",y,`
  - rendered on server: ${se}
  - expected on client: ${Q}`),zr()),y.textContent=g.children)}if(L){if(__VUE_PROD_HYDRATION_MISMATCH_DETAILS__||O||z||!v||M&48){const Q=y.tagName.includes("-"),se=y.namespaceURI.includes("svg")?"svg":y.namespaceURI.includes("MathML")?"mathml":void 0;for(const q in L)if(__VUE_PROD_HYDRATION_MISMATCH_DETAILS__&&!(F&&F.some(he=>he.dir.created))&&ES(y,q,L[q],g,E)&&zr(),O&&(q.endsWith("value")||q==="indeterminate")||vo(q)&&!Ys(q)||q[0]==="."||Q&&!Ys(q)||R&&R.includes(q)){if(yS(y,q,L[q]))continue;i(y,q,null,L[q],se,E)}}else if(L.onClick)i(y,"onClick",null,L.onClick,void 0,E);else if(M&4&&xs(L.style))for(const Q in L.style)L.style[Q]}let Y;(Y=L&&L.onVnodeBeforeMount)&&li(Y,E,g),F&&cs(g,null,E,"beforeMount"),((Y=L&&L.onVnodeMounted)||F||H)&&Fv(()=>{Y&&li(Y,E,g),H&&B.enter(y),F&&cs(g,null,E,"mounted")},T)}return y.nextSibling},d=(y,g,E,T,C,v,A)=>{A=A||!!g.dynamicChildren;const R=g.children,L=R.length;let M=!1;for(let I=0;I<L;I++){const F=A?R[I]:R[I]=ci(R[I]),B=F.type===Zs;y?(B&&!A&&I+1<L&&ci(R[I+1]).type===Zs&&(l(s(y.data.slice(F.children.length)),E,r(y)),y.data=F.children),y=f(y,F,T,C,v,A)):B&&!F.children?l(F.el=s(""),E):(M||(M=!0,nl(E,1)||(__VUE_PROD_HYDRATION_MISMATCH_DETAILS__&&_r("Hydration children mismatch on",E,`
Server rendered element contains fewer child nodes than client vdom.`),zr())),n(null,F,E,null,T,C,au(E),v))}return y},m=(y,g,E,T,C,v)=>{const{slotScopeIds:A}=g;A&&(C=C?C.concat(A):A);const R=o(y),L=d(r(y),g,R,E,T,C,v);return L&&Jr(L)&&L.data==="]"?r(g.anchor=L):(zr(),l(g.anchor=u("]"),R,L),L)},x=(y,g,E,T,C,v)=>{if(MS(y,g)||(__VUE_PROD_HYDRATION_MISMATCH_DETAILS__&&_r(`Hydration node mismatch:
- rendered on server:`,y,y.nodeType===3?"(text)":Jr(y)&&y.data==="["?"(start of fragment)":"",`
- expected on client:`,g.type),zr()),g.el=null,v){const L=_(y);for(;;){const M=r(y);if(M&&M!==L)a(M);else break}}const A=r(y),R=o(y);return a(y),n(null,g,R,A,E,T,au(R),C),E&&(E.vnode.el=g.el,yf(E,g.el)),A},_=(y,g="[",E="]")=>{let T=0;for(;y;)if(y=r(y),y&&Jr(y)&&(y.data===g&&T++,y.data===E)){if(T===0)return r(y);T--}return y},p=(y,g,E)=>{const T=g.parentNode;T&&T.replaceChild(y,g);let C=E;for(;C;)C.vnode.el===g&&(C.vnode.el=C.subTree.el=y),C=C.parent},b=y=>y.nodeType===1&&y.tagName==="TEMPLATE";return[c,f]}const xS=new Set(["src","srcset","href","poster"]);function yS(t,e,n){return xS.has(e)?t.getAttribute(e)===(n==null?null:`${n}`):!1}function ES(t,e,n,i,s){let r,o,a,l;if(e==="class")t.$cls?(a=t.$cls,delete t.$cls):a=t.getAttribute("class"),l=va(n),SS(i0(a||""),i0(l))||(r=2,o="class");else if(e==="style"){a=t.getAttribute("style")||"",l=Qe(n)?n:Oy(_a(n));const u=s0(a),c=s0(l);if(i.dirs)for(const{dir:f,value:h}of i.dirs)f.name==="show"&&!h&&c.set("display","none");s&&j_(s,i,c),bS(u,c)||(r=3,o="style")}else(t instanceof SVGElement&&Zy(e)||t instanceof HTMLElement&&($m(e)||Ky(e)))&&(e==="hidden"?(a=n0(t.getAttribute(e)),l=n0(n)):$m(e)?(a=t.hasAttribute(e),l=sf(n)):n==null?(a=t.hasAttribute(e),l=!1):(t.hasAttribute(e)?a=t.getAttribute(e):e==="value"&&t.tagName==="TEXTAREA"?a=t.value:a=!1,l=u_(n)?String(n):!1),a!==l&&(r=4,o=e));if(r!=null&&!nl(t,r)){const u=h=>h===!1?"(not rendered)":`${o}="${h}"`,c=`Hydration ${Q_[r]} mismatch on`,f=`
  - rendered on server: ${u(a)}
  - expected on client: ${u(l)}
  Note: this mismatch is check-only. The DOM will not be rectified in production due to performance overhead.
  You should fix the source of the mismatch.`;return _r(c,t,f),!0}return!1}function n0(t){return u_(t)?Qe(t)?t.toLowerCase()==="until-found"?"until-found":"":sf(t)?"":!1:!1}function i0(t){return new Set(t.trim().split(/\s+/))}function SS(t,e){if(t.size!==e.size)return!1;for(const n of t)if(!e.has(n))return!1;return!0}function s0(t){const e=new Map;for(const n of t.split(";")){let[i,s]=n.split(":");i=i.trim(),s=s&&s.trim(),i&&s&&e.set(i,s)}return e}function bS(t,e){if(t.size!==e.size)return!1;for(const[n,i]of t)if(i!==e.get(n))return!1;return!0}function j_(t,e,n){const i=t.subTree;if(t.getCssVars&&(e===i||i&&i.type===pn&&i.children.includes(e))){const s=t.getCssVars();for(const r in s){const o=d_(s[r]);n.set(`--${jy(r)}`,o)}}e===i&&t.parent&&j_(t.parent,t.vnode,n)}const dc="data-allow-mismatch",Q_={0:"text",1:"children",2:"class",3:"style",4:"attribute"};function nl(t,e){if(e===0||e===1)for(;t&&!t.hasAttribute(dc);)t=t.parentElement;return wp(t&&t.getAttribute(dc),e)}function wp(t,e){if(t==null)return!1;if(t==="")return!0;{const n=t.split(",");return e===0&&n.includes("children")?!0:n.includes(Q_[e])}}function MS(t,e){return nl(t.parentElement,1)||AS(t)||TS(e)}function AS(t){return t.nodeType===1&&wp(t.getAttribute(dc),1)}function TS({props:t}){const e=t&&t[dc];return typeof e=="string"&&wp(e,1)}const wS=no().requestIdleCallback||(t=>setTimeout(t,1)),CS=no().cancelIdleCallback||(t=>clearTimeout(t)),RS=(t=1e4)=>e=>{const n=wS(e,{timeout:t});return()=>CS(n)};function FS(t){const{top:e,left:n,bottom:i,right:s}=t.getBoundingClientRect(),{innerHeight:r,innerWidth:o}=window;return(e>0&&e<r||i>0&&i<r)&&(n>0&&n<o||s>0&&s<o)}const DS=t=>(e,n)=>{const i=new IntersectionObserver(s=>{for(const r of s)if(r.isIntersecting){i.disconnect(),e();break}},t);return n(s=>{if(s instanceof Element){if(FS(s))return e(),i.disconnect(),!1;i.observe(s)}}),()=>i.disconnect()},PS=t=>e=>{if(t){const n=matchMedia(t);if(n.matches)e();else return n.addEventListener("change",e,{once:!0}),()=>n.removeEventListener("change",e)}},IS=(t=[])=>(e,n)=>{Qe(t)&&(t=[t]);let i=!1;const s=o=>{i||(i=!0,r(),e(),o.target.dispatchEvent(new o.constructor(o.type,o)))},r=()=>{n(o=>{for(const a of t)o.removeEventListener(a,s)})};return n(o=>{for(const a of t)o.addEventListener(a,s,{once:!0})}),r};function LS(t,e){if(Jr(t)&&t.data==="["){let n=1,i=t.nextSibling;for(;i;){if(i.nodeType===1){if(e(i)===!1)break}else if(Jr(i))if(i.data==="]"){if(--n===0)break}else i.data==="["&&n++;i=i.nextSibling}}else e(t)}const Ks=t=>!!t.type.__asyncLoader;function NS(t){it(t)&&(t={loader:t});const{loader:e,loadingComponent:n,errorComponent:i,delay:s=200,hydrate:r,timeout:o,suspensible:a=!0,onError:l}=t;let u=null,c,f=0;const h=()=>(f++,u=null,d()),d=()=>{let m;return u||(m=u=e().catch(x=>{if(x=x instanceof Error?x:new Error(String(x)),l)return new Promise((_,p)=>{l(x,()=>_(h()),()=>p(x),f+1)});throw x}).then(x=>m!==u&&u?u:(x&&(x.__esModule||x[Symbol.toStringTag]==="Module")&&(x=x.default),c=x,x)))};return gf({name:"AsyncComponentWrapper",__asyncLoader:d,__asyncHydrate(m,x,_){const p=m.isConnected;let b=!1;(x.bu||(x.bu=[])).push(()=>b=!0);const y=()=>{b||!m.parentNode||p&&!m.isConnected||_()},g=r?()=>{const E=r(y,T=>LS(m,T));E&&(x.bum||(x.bum=[])).push(E)}:y;c?g():d().then(()=>!x.isUnmounted&&g())},get __asyncResolved(){return c},setup(){const m=Rn;if(Tp(m),c)return()=>lu(c,m);const x=E=>{u=null,Eo(E,m,13,!i)};if(a&&m.suspense||fo)return d().then(E=>()=>lu(E,m)).catch(E=>(x(E),()=>i?jt(i,{error:E}):null));const _=st(!1),p=st(),b=st(!!s);let y,g;return xa(()=>{y!=null&&clearTimeout(y),g!=null&&clearTimeout(g)}),s&&(g=setTimeout(()=>{m.isUnmounted||(b.value=!1)},s)),o!=null&&(y=setTimeout(()=>{if(!m.isUnmounted&&!_.value&&!p.value){const E=new Error(`Async component timed out after ${o}ms.`);x(E),p.value=E}},o)),d().then(()=>{m.isUnmounted||(_.value=!0,m.parent&&zl(m.parent.vnode)&&m.parent.update())}).catch(E=>{if(m.isUnmounted){u=null;return}x(E),p.value=E}),()=>{if(_.value&&c)return lu(c,m);if(p.value&&i)return jt(i,{error:p.value});if(n&&!b.value)return lu(n,m)}}})}function lu(t,e){const{ref:n,props:i,children:s,ce:r}=e.vnode,o=jt(t,i,s);return o.ref=n,o.ce=r,delete e.vnode.ce,o}const zl=t=>t.type.__isKeepAlive,BS={name:"KeepAlive",__isKeepAlive:!0,props:{include:[String,RegExp,Array],exclude:[String,RegExp,Array],max:[String,Number]},setup(t,{slots:e}){const n=Qn(),i=n.ctx;if(!i.renderer)return()=>{const b=e.default&&e.default();return b&&b.length===1?b[0]:b};const s=new Map,r=new Set;let o=null;__VUE_PROD_DEVTOOLS__&&(n.__v_cache=s);const a=n.suspense,{renderer:{p:l,m:u,um:c,o:{createElement:f}}}=i,h=f("div");i.activate=(b,y,g,E,T)=>{const C=b.component;u(b,y,g,0,a),l(C.vnode,b,y,g,C,a,E,b.slotScopeIds,T),un(()=>{C.isDeactivated=!1,C.a&&Jo(C.a);const v=b.props&&b.props.onVnodeMounted;v&&li(v,C.parent,b)},a),__VUE_PROD_DEVTOOLS__&&Kh(C)},i.deactivate=b=>{const y=b.component;mc(y.m),mc(y.a),u(b,h,null,1,a),un(()=>{y.da&&Jo(y.da);const g=b.props&&b.props.onVnodeUnmounted;g&&li(g,y.parent,b),y.isDeactivated=!0},a),__VUE_PROD_DEVTOOLS__&&Kh(y)};function d(b){Kf(b),c(b,n,a,!0)}function m(b){s.forEach((y,g)=>{const E=Ec(Ks(y)?y.type.__asyncResolved||{}:y.type);E&&!b(E)&&x(g)})}function x(b){const y=s.get(b);y&&(!o||!Xi(y,o))?d(y):o&&Kf(o),s.delete(b),r.delete(b)}ro(()=>[t.include,t.exclude],([b,y])=>{b&&m(g=>Xa(b,g)),y&&m(g=>!Xa(y,g))},{flush:"post",deep:!0});let _=null;const p=()=>{_!=null&&(gc(n.subTree.type)?un(()=>{const b=uu(n.subTree);b.component&&s.set(_,b)},n.subTree.suspense):s.set(_,uu(n.subTree)))};return So(p),vf(p),Vl(()=>{s.forEach(b=>{const{subTree:y,suspense:g}=n,E=uu(y);if(b.type===E.type&&b.key===E.key){Kf(E);const T=E.component.da;T&&un(T,g);return}d(b)})}),()=>{if(_=null,!e.default)return o=null;const b=e.default(),y=b[0];if(b.length>1)return o=null,b;if(!sr(y)||!(y.shapeFlag&4)&&!(y.shapeFlag&128))return o=null,y;let g=uu(y);if(g.type===nn)return o=null,g;const E=g.type,T=Ec(Ks(g)?g.type.__asyncResolved||{}:E),{include:C,exclude:v,max:A}=t;if(C&&(!T||!Xa(C,T))||v&&T&&Xa(v,T))return g.shapeFlag&=-257,o=g,y;const R=g.key==null?E:g.key,L=s.get(R);return g.el&&(g=As(g),y.shapeFlag&128&&(y.ssContent=g)),_=R,L?(g.el=L.el,g.component=L.component,g.transition&&ir(g,g.transition),g.shapeFlag|=512,r.delete(R),r.add(R)):(r.add(R),A&&r.size>parseInt(A,10)&&x(r.values().next().value)),g.shapeFlag|=256,o=g,gc(y.type)?y:g}}},US=BS;function Xa(t,e){return Ue(t)?t.some(n=>Xa(n,e)):Qe(t)?t.split(",").includes(e):wy(t)?(t.lastIndex=0,t.test(e)):!1}function ev(t,e){nv(t,"a",e)}function tv(t,e){nv(t,"da",e)}function nv(t,e,n=Rn){const i=t.__wdc||(t.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return t()});if(_f(e,i,n),n){let s=n.parent;for(;s&&s.parent;)zl(s.parent.vnode)&&OS(i,e,n,s),s=s.parent}}function OS(t,e,n,i){const s=_f(e,t,i,!0);xa(()=>{dp(i[e],s)},n)}function Kf(t){t.shapeFlag&=-257,t.shapeFlag&=-513}function uu(t){return t.shapeFlag&128?t.ssContent:t}function _f(t,e,n=Rn,i=!1){if(n){const s=n[t]||(n[t]=[]),r=e.__weh||(e.__weh=(...o)=>{bs();const a=ya(n),l=Si(e,n,t,o);return a(),Ms(),l});return i?s.unshift(r):s.push(r),r}}const ar=t=>(e,n=Rn)=>{(!fo||t==="sp")&&_f(t,(...i)=>e(...i),n)},iv=ar("bm"),So=ar("m"),Cp=ar("bu"),vf=ar("u"),Vl=ar("bum"),xa=ar("um"),sv=ar("sp"),rv=ar("rtg"),ov=ar("rtc");function av(t,e=Rn){_f("ec",t,e)}const Rp="components",kS="directives";function zS(t,e){return Fp(Rp,t,!0,e)||t}const lv=Symbol.for("v-ndc");function VS(t){return Qe(t)?Fp(Rp,t,!1)||t:t||lv}function HS(t){return Fp(kS,t)}function Fp(t,e,n=!0,i=!1){const s=Fn||Rn;if(s){const r=s.type;if(t===Rp){const a=Ec(r,!1);if(a&&(a===e||a===Vt(e)||a===xo(Vt(e))))return r}const o=r0(s[t]||r[t],e)||r0(s.appContext[t],e);return!o&&i?r:o}}function r0(t,e){return t&&(t[e]||t[Vt(e)]||t[xo(Vt(e))])}function GS(t,e,n,i){let s;const r=n&&n[i],o=Ue(t);if(o||Qe(t)){const a=o&&xs(t);let l=!1,u=!1;a&&(l=!hi(t),u=ts(t),t=af(t)),s=new Array(t.length);for(let c=0,f=t.length;c<f;c++)s[c]=e(l?u?Dr(Oi(t[c])):Oi(t[c]):t[c],c,void 0,r&&r[c])}else if(typeof t=="number"){s=new Array(t);for(let a=0;a<t;a++)s[a]=e(a+1,a,void 0,r&&r[a])}else if(Pt(t))if(t[Symbol.iterator])s=Array.from(t,(a,l)=>e(a,l,void 0,r&&r[l]));else{const a=Object.keys(t);s=new Array(a.length);for(let l=0,u=a.length;l<u;l++){const c=a[l];s[l]=e(t[c],c,l,r&&r[l])}}else s=[];return n&&(n[i]=s),s}function WS(t,e){for(let n=0;n<e.length;n++){const i=e[n];if(Ue(i))for(let s=0;s<i.length;s++)t[i[s].name]=i[s].fn;else i&&(t[i.name]=i.key?(...s)=>{const r=i.fn(...s);return r&&(r.key=i.key),r}:i.fn)}return t}function $S(t,e,n,i,s,r){if(n==null&&(n={}),Fn.ce||Fn.parent&&Ks(Fn.parent)&&Fn.parent.ce){const u=r!=null&&n.key==null?_t({},n,{key:r}):n,c=Object.keys(u).length>0;return e!=="default"&&(u.name=e),vl(),_c(pn,null,[jt("slot",u,i&&i())],c?-2:64)}let o=t[e];o&&o._c&&(o._d=!1);const a=js.length;vl();let l;try{const u=o&&Dp(o(n)),c=n.key||r||u&&u.key;l=_c(pn,{key:(c&&!$n(c)?c:`_${e}`)+(!u&&i?"_fb":"")},u||(i?i():[]),u&&t._===1?64:-2)}catch(u){for(let c=js.length;c>a;c--)Ef();throw u}finally{o&&o._c&&(o._d=!0)}return!s&&l.scopeId&&(l.slotScopeIds=[l.scopeId+"-s"]),l}function Dp(t){return t.some(e=>sr(e)?!(e.type===nn||e.type===pn&&!Dp(e.children)):!0)?t:null}function XS(t,e){const n={};for(const i in t)n[e&&/[A-Z]/.test(i)?`on:${i}`:Zo(i)]=t[i];return n}const jh=t=>t?Uv(t)?Hl(t):jh(t.parent):null,il=_t(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>jh(t.parent),$root:t=>jh(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>__VUE_OPTIONS_API__?Pp(t):t.type,$forceUpdate:t=>t.f||(t.f=()=>{yp(t.update)}),$nextTick:t=>t.n||(t.n=ff.bind(t.proxy)),$watch:t=>__VUE_OPTIONS_API__?lS.bind(t):Tn}),Zf=(t,e)=>t!==yt&&!t.__isScriptSetup&&Lt(t,e),Qh={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:i,data:s,props:r,accessCache:o,type:a,appContext:l}=t;if(e[0]!=="$"){const h=o[e];if(h!==void 0)switch(h){case 1:return i[e];case 2:return s[e];case 4:return n[e];case 3:return r[e]}else{if(Zf(i,e))return o[e]=1,i[e];if(__VUE_OPTIONS_API__&&s!==yt&&Lt(s,e))return o[e]=2,s[e];if(Lt(r,e))return o[e]=3,r[e];if(n!==yt&&Lt(n,e))return o[e]=4,n[e];(!__VUE_OPTIONS_API__||ed)&&(o[e]=0)}}const u=il[e];let c,f;if(u)return e==="$attrs"&&zn(t.attrs,"get",""),u(t);if((c=a.__cssModules)&&(c=c[e]))return c;if(n!==yt&&Lt(n,e))return o[e]=4,n[e];if(f=l.config.globalProperties,Lt(f,e))return f[e]},set({_:t},e,n){const{data:i,setupState:s,ctx:r}=t;return Zf(s,e)?(s[e]=n,!0):__VUE_OPTIONS_API__&&i!==yt&&Lt(i,e)?(i[e]=n,!0):Lt(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(r[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:i,appContext:s,props:r,type:o}},a){let l;return!!(n[a]||__VUE_OPTIONS_API__&&t!==yt&&a[0]!=="$"&&Lt(t,a)||Zf(e,a)||Lt(r,a)||Lt(i,a)||Lt(il,a)||Lt(s.config.globalProperties,a)||(l=o.__cssModules)&&l[a])},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:Lt(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}},qS=_t({},Qh,{get(t,e){if(e!==Symbol.unscopables)return Qh.get(t,e,t)},has(t,e){return e[0]!=="_"&&!Ly(e)}});function YS(){return null}function KS(){return null}function ZS(t){}function JS(t){}function jS(){return null}function QS(){}function eb(t,e){return null}function tb(){return uv().slots}function nb(){return uv().attrs}function uv(t){const e=Qn();return e.setupContext||(e.setupContext=Vv(e))}function gl(t){return Ue(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}function ib(t,e){const n=gl(t);for(const i in e){if(i.startsWith("__skip"))continue;let s=n[i];s?Ue(s)||it(s)?s=n[i]={type:s,default:e[i]}:s.default=e[i]:s===null&&(s=n[i]={default:e[i]}),s&&e[`__skip_${i}`]&&(s.skipFactory=!0)}return n}function sb(t,e){return!t||!e?t||e:Ue(t)&&Ue(e)?t.concat(e):_t({},gl(t),gl(e))}function rb(t,e){const n={};for(const i in t)e.includes(i)||Object.defineProperty(n,i,{enumerable:!0,get:()=>t[i]});return n}function ob(t){const e=Qn(),n=fo;let i=t();yl(),n&&wr(!1);const s=()=>{ya(e),n&&wr(!0)},r=()=>{Qn()!==e&&e.scope.off(),yl(),n&&wr(!1)};return pp(i)&&(i=i.catch(o=>{throw s(),Promise.resolve().then(()=>Promise.resolve().then(r)),o})),[i,()=>{s(),Promise.resolve().then(r)}]}let ed=!0;function ab(t){const e=Pp(t),n=t.proxy,i=t.ctx;ed=!1,e.beforeCreate&&o0(e.beforeCreate,t,"bc");const{data:s,computed:r,methods:o,watch:a,provide:l,inject:u,created:c,beforeMount:f,mounted:h,beforeUpdate:d,updated:m,activated:x,deactivated:_,beforeDestroy:p,beforeUnmount:b,destroyed:y,unmounted:g,render:E,renderTracked:T,renderTriggered:C,errorCaptured:v,serverPrefetch:A,expose:R,inheritAttrs:L,components:M,directives:I,filters:F}=e;if(u&&lb(u,i,null),o)for(const z in o){const H=o[z];it(H)&&(i[z]=H.bind(n))}if(s){const z=s.call(n,n);Pt(z)&&(t.data=uf(z))}if(ed=!0,r)for(const z in r){const H=r[z],Y=it(H)?H.bind(n,n):it(H.get)?H.get.bind(n,n):Tn,Q=!it(H)&&it(H.set)?H.set.bind(n):Tn,se=ht({get:Y,set:Q});Object.defineProperty(i,z,{enumerable:!0,configurable:!0,get:()=>se.value,set:q=>se.value=q})}if(a)for(const z in a)cv(a[z],i,n,z);if(l){const z=it(l)?l.call(n):l;Reflect.ownKeys(z).forEach(H=>{H_(H,z[H])})}c&&o0(c,t,"c");function O(z,H){Ue(H)?H.forEach(Y=>z(Y.bind(n))):H&&z(H.bind(n))}if(O(iv,f),O(So,h),O(Cp,d),O(vf,m),O(ev,x),O(tv,_),O(av,v),O(ov,T),O(rv,C),O(Vl,b),O(xa,g),O(sv,A),Ue(R))if(R.length){const z=t.exposed||(t.exposed={});R.forEach(H=>{Object.defineProperty(z,H,{get:()=>n[H],set:Y=>n[H]=Y,enumerable:!0})})}else t.exposed||(t.exposed={});E&&t.render===Tn&&(t.render=E),L!=null&&(t.inheritAttrs=L),M&&(t.components=M),I&&(t.directives=I),A&&Tp(t)}function lb(t,e,n=Tn){Ue(t)&&(t=td(t));for(const i in t){const s=t[i];let r;Pt(s)?"default"in s?r=tl(s.from||i,s.default,!0):r=tl(s.from||i):r=tl(s),an(r)?Object.defineProperty(e,i,{enumerable:!0,configurable:!0,get:()=>r.value,set:o=>r.value=o}):e[i]=r}}function o0(t,e,n){Si(Ue(t)?t.map(i=>i.bind(e.proxy)):t.bind(e.proxy),e,n)}function cv(t,e,n,i){let s=i.includes(".")?X_(n,i):()=>n[i];if(Qe(t)){const r=e[t];it(r)&&ro(s,r)}else if(it(t))ro(s,t.bind(n));else if(Pt(t))if(Ue(t))t.forEach(r=>cv(r,e,n,i));else{const r=it(t.handler)?t.handler.bind(n):e[t.handler];it(r)&&ro(s,r,t)}}function Pp(t){const e=t.type,{mixins:n,extends:i}=e,{mixins:s,optionsCache:r,config:{optionMergeStrategies:o}}=t.appContext,a=r.get(e);let l;return a?l=a:!s.length&&!n&&!i?l=e:(l={},s.length&&s.forEach(u=>pc(l,u,o,!0)),pc(l,e,o)),Pt(e)&&r.set(e,l),l}function pc(t,e,n,i=!1){const{mixins:s,extends:r}=e;r&&pc(t,r,n,!0),s&&s.forEach(o=>pc(t,o,n,!0));for(const o in e)if(!(i&&o==="expose")){const a=ub[o]||n&&n[o];t[o]=a?a(t[o],e[o]):e[o]}return t}const ub={data:a0,props:l0,emits:l0,methods:qa,computed:qa,beforeCreate:Yn,created:Yn,beforeMount:Yn,mounted:Yn,beforeUpdate:Yn,updated:Yn,beforeDestroy:Yn,beforeUnmount:Yn,destroyed:Yn,unmounted:Yn,activated:Yn,deactivated:Yn,errorCaptured:Yn,serverPrefetch:Yn,components:qa,directives:qa,watch:fb,provide:a0,inject:cb};function a0(t,e){return e?t?function(){return _t(it(t)?t.call(this,this):t,it(e)?e.call(this,this):e)}:e:t}function cb(t,e){return qa(td(t),td(e))}function td(t){if(Ue(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function Yn(t,e){return t?[...new Set([].concat(t,e))]:e}function qa(t,e){return t?_t(Object.create(null),t,e):e}function l0(t,e){return t?Ue(t)&&Ue(e)?[...new Set([...t,...e])]:_t(Object.create(null),gl(t),gl(e??{})):e}function fb(t,e){if(!t)return e;if(!e)return t;const n=_t(Object.create(null),t);for(const i in e)n[i]=Yn(t[i],e[i]);return n}function fv(){return{app:null,config:{isNativeTag:Yo,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let hb=0;function db(t,e){return function(i,s=null){it(i)||(i=_t({},i)),s!=null&&!Pt(s)&&(s=null);const r=fv(),o=new WeakSet,a=[];let l=!1;const u=r.app={_uid:hb++,_component:i,_props:s,_container:null,_context:r,_instance:null,version:od,get config(){return r.config},set config(c){},use(c,...f){return o.has(c)||(c&&it(c.install)?(o.add(c),c.install(u,...f)):it(c)&&(o.add(c),c(u,...f))),u},mixin(c){return __VUE_OPTIONS_API__&&(r.mixins.includes(c)||r.mixins.push(c)),u},component(c,f){return f?(r.components[c]=f,u):r.components[c]},directive(c,f){return f?(r.directives[c]=f,u):r.directives[c]},mount(c,f,h){if(!l){const d=u._ceVNode||jt(i,s);return d.appContext=r,h===!0?h="svg":h===!1&&(h=void 0),f&&e?e(d,c):t(d,c,h),l=!0,u._container=c,c.__vue_app__=u,__VUE_PROD_DEVTOOLS__&&(u._instance=d.component,ZE(u,od)),Hl(d.component)}},onUnmount(c){a.push(c)},unmount(){l&&(Si(a,u._instance,16),t(null,u._container),__VUE_PROD_DEVTOOLS__&&(u._instance=null,JE(u)),delete u._container.__vue_app__)},provide(c,f){return r.provides[c]=f,u},runWithContext(c){const f=oo;oo=u;try{return c()}finally{oo=f}}};return u}}let oo=null;function pb(t,e,n=yt){const i=Qn(),s=Vt(e),r=Jn(e),o=hv(t,s),a=L_((l,u)=>{let c,f=yt,h;return $_(()=>{const d=t[s];An(c,d)&&(c=d,u())}),{get(){return l(),n.get?n.get(c):c},set(d){const m=n.set?n.set(d):d;if(!An(m,c)&&!(f!==yt&&An(d,f)))return;const x=i.vnode.props,_=!!(x&&(e in x||s in x||r in x)&&(`onUpdate:${e}`in x||`onUpdate:${s}`in x||`onUpdate:${r}`in x));_||(c=d,u()),i.emit(`update:${e}`,m),An(d,f)&&(An(d,m)&&!An(m,h)||_&&f!==yt&&!An(m,c))&&u(),f=d,h=m}}});return a[Symbol.iterator]=()=>{let l=0;return{next(){return l<2?{value:l++?o||yt:a,done:!1}:{done:!0}}}},a}const hv=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${Vt(e)}Modifiers`]||t[`${Jn(e)}Modifiers`];function mb(t,e,...n){if(t.isUnmounted)return;const i=t.vnode.props||yt;let s=n;const r=e.startsWith("update:"),o=r&&hv(i,e.slice(7));o&&(o.trim&&(s=n.map(c=>Qe(c)?c.trim():c)),o.number&&(s=s.map(nf))),__VUE_PROD_DEVTOOLS__&&eS(t,e,s);let a,l=i[a=Zo(e)]||i[a=Zo(Vt(e))];!l&&r&&(l=i[a=Zo(Jn(e))]),l&&Si(l,t,6,s);const u=i[a+"Once"];if(u){if(!t.emitted)t.emitted={};else if(t.emitted[a])return;t.emitted[a]=!0,Si(u,t,6,s)}}const gb=new WeakMap;function dv(t,e,n=!1){const i=__VUE_OPTIONS_API__&&n?gb:e.emitsCache,s=i.get(t);if(s!==void 0)return s;const r=t.emits;let o={},a=!1;if(__VUE_OPTIONS_API__&&!it(t)){const l=u=>{const c=dv(u,e,!0);c&&(a=!0,_t(o,c))};!n&&e.mixins.length&&e.mixins.forEach(l),t.extends&&l(t.extends),t.mixins&&t.mixins.forEach(l)}return!r&&!a?(Pt(t)&&i.set(t,null),null):(Ue(r)?r.forEach(l=>o[l]=null):_t(o,r),Pt(t)&&i.set(t,o),o)}function xf(t,e){return!t||!vo(e)?!1:(e=e.slice(2),e=e==="Once"?e:e.replace(/Once$/,""),Lt(t,e[0].toLowerCase()+e.slice(1))||Lt(t,Jn(e))||Lt(t,e))}function Xu(t){const{type:e,vnode:n,proxy:i,withProxy:s,propsOptions:[r],slots:o,attrs:a,emit:l,render:u,renderCache:c,props:f,data:h,setupState:d,ctx:m,inheritAttrs:x}=t,_=ml(t);let p,b;try{if(n.shapeFlag&4){const g=s||i,E=g;p=ci(u.call(E,g,c,f,d,h,m)),b=a}else{const g=e;p=ci(g.length>1?g(f,{attrs:a,slots:o,emit:l}):g(f,null)),b=e.props?a:vb(a)}}catch(g){js.length=0,Eo(g,t,1),p=jt(nn)}let y=p;if(b&&x!==!1){const g=Object.keys(b),{shapeFlag:E}=y;g.length&&E&7&&(r&&g.some(jc)&&(b=xb(b,r)),y=As(y,b,!1,!0))}if(n.dirs&&(y=As(y,null,!1,!0),y.dirs=y.dirs?y.dirs.concat(n.dirs):n.dirs),n.transition){const g=pf(y.type)&&fc(y)||y;ir(g,n.transition)}return p=y,ml(_),p}function _b(t,e=!0){let n;for(let i=0;i<t.length;i++){const s=t[i];if(sr(s)){if(s.type!==nn||s.children==="v-if"){if(n)return;n=s}}else return}return n}const vb=t=>{let e;for(const n in t)(n==="class"||n==="style"||vo(n))&&((e||(e={}))[n]=t[n]);return e},xb=(t,e)=>{const n={};for(const i in t)(!jc(i)||!(i.slice(9)in e))&&(n[i]=t[i]);return n};function yb(t,e,n){const{props:i,children:s,component:r}=t,{props:o,children:a,patchFlag:l}=e,u=r.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&l>=0){if(l&1024)return!0;if(l&16)return i?u0(i,o,u):!!o;if(l&8){const c=e.dynamicProps;for(let f=0;f<c.length;f++){const h=c[f];if(pv(o,i,h)&&!xf(u,h))return!0}}}else return(s||a)&&(!a||!a.$stable)?!0:i===o?!1:i?o?u0(i,o,u):!0:!!o;return!1}function u0(t,e,n){const i=Object.keys(e);if(i.length!==Object.keys(t).length)return!0;for(let s=0;s<i.length;s++){const r=i[s];if(pv(e,t,r)&&!xf(n,r))return!0}return!1}function pv(t,e,n){const i=t[n],s=e[n];return n==="style"&&Pt(i)&&Pt(s)?!Ui(i,s):i!==s}function yf({vnode:t,parent:e,suspense:n},i){for(;e;){const s=e.subTree;if(s.suspense&&s.suspense.activeBranch===t&&(s.suspense.vnode.el=s.el=i,t=s),s===t)(t=e.vnode).el=i,e=e.parent;else break}n&&n.activeBranch===t&&(n.vnode.el=i)}const mv={},gv=()=>Object.create(mv),_v=t=>Object.getPrototypeOf(t)===mv;function Eb(t,e,n,i=!1){const s={},r=gv();t.propsDefaults=Object.create(null),vv(t,e,s,r);for(const o in t.propsOptions[0])o in s||(s[o]=void 0);n?t.props=i?s:F_(s):t.type.props?t.props=s:t.props=r,t.attrs=r}function Sb(t,e,n,i){const{props:s,attrs:r,vnode:{patchFlag:o}}=t,a=nt(s),[l]=t.propsOptions;let u=!1;if((i||o>0)&&!(o&16)){if(o&8){const c=t.vnode.dynamicProps;for(let f=0;f<c.length;f++){let h=c[f];if(xf(t.emitsOptions,h))continue;const d=e[h];if(l)if(Lt(r,h))d!==r[h]&&(r[h]=d,u=!0);else{const m=Vt(h);s[m]=nd(l,a,m,d,t,!1)}else d!==r[h]&&(r[h]=d,u=!0)}}}else{vv(t,e,s,r)&&(u=!0);let c;for(const f in a)(!e||!Lt(e,f)&&((c=Jn(f))===f||!Lt(e,c)))&&(l?n&&(n[f]!==void 0||n[c]!==void 0)&&(s[f]=nd(l,a,f,void 0,t,!0)):delete s[f]);if(r!==a)for(const f in r)(!e||!Lt(e,f))&&(delete r[f],u=!0)}u&&Hs(t.attrs,"set","")}function vv(t,e,n,i){const[s,r]=t.propsOptions;let o=!1,a;if(e)for(let l in e){if(Ys(l))continue;const u=e[l];let c;s&&Lt(s,c=Vt(l))?!r||!r.includes(c)?n[c]=u:(a||(a={}))[c]=u:xf(t.emitsOptions,l)||(!(l in i)||u!==i[l])&&(i[l]=u,o=!0)}if(r){const l=nt(n),u=a||yt;for(let c=0;c<r.length;c++){const f=r[c];n[f]=nd(s,l,f,u[f],t,!Lt(u,f))}}return o}function nd(t,e,n,i,s,r){const o=t[n];if(o!=null){const a=Lt(o,"default");if(a&&i===void 0){const l=o.default;if(o.type!==Function&&!o.skipFactory&&it(l)){const{propsDefaults:u}=s;if(n in u)i=u[n];else{const c=ya(s);i=u[n]=l.call(null,e),c()}}else i=l;s.ce&&s.ce._setProp(n,i)}o[0]&&(r&&!a?i=!1:o[1]&&(i===""||i===Jn(n))&&(i=!0))}return i}const bb=new WeakMap;function xv(t,e,n=!1){const i=__VUE_OPTIONS_API__&&n?bb:e.propsCache,s=i.get(t);if(s)return s;const r=t.props,o={},a=[];let l=!1;if(__VUE_OPTIONS_API__&&!it(t)){const c=f=>{l=!0;const[h,d]=xv(f,e,!0);_t(o,h),d&&a.push(...d)};!n&&e.mixins.length&&e.mixins.forEach(c),t.extends&&c(t.extends),t.mixins&&t.mixins.forEach(c)}if(!r&&!l)return Pt(t)&&i.set(t,jr),jr;if(Ue(r))for(let c=0;c<r.length;c++){const f=Vt(r[c]);c0(f)&&(o[f]=yt)}else if(r)for(const c in r){const f=Vt(c);if(c0(f)){const h=r[c],d=o[f]=Ue(h)||it(h)?{type:h}:_t({},h),m=d.type;let x=!1,_=!0;if(Ue(m))for(let p=0;p<m.length;++p){const b=m[p],y=it(b)&&b.name;if(y==="Boolean"){x=!0;break}else y==="String"&&(_=!1)}else x=it(m)&&m.name==="Boolean";d[0]=x,d[1]=_,(x||Lt(d,"default"))&&a.push(f)}}const u=[o,a];return Pt(t)&&i.set(t,u),u}function c0(t){return t[0]!=="$"&&!Ys(t)}const Ip=t=>t==="_"||t==="_ctx"||t==="$stable",Lp=t=>Ue(t)?t.map(ci):[ci(t)],Mb=(t,e,n)=>{if(e._n)return e;const i=bp((...s)=>Lp(e(...s)),n);return i._c=!1,i},yv=(t,e,n)=>{const i=t._ctx;for(const s in t){if(Ip(s))continue;const r=t[s];if(it(r))e[s]=Mb(s,r,i);else if(r!=null){const o=Lp(r);e[s]=()=>o}}},Ev=(t,e)=>{const n=Lp(e);t.slots.default=()=>n},Sv=(t,e,n)=>{for(const i in e)(n||!Ip(i))&&(t[i]=e[i])},Ab=(t,e,n)=>{const i=t.slots=gv();if(t.vnode.shapeFlag&32){const s=e._;s?(Sv(i,e,n),n&&ra(i,"_",s,!0)):yv(e,i)}else e&&Ev(t,e)},Tb=(t,e,n)=>{const{vnode:i,slots:s}=t;let r=!0,o=yt;if(i.shapeFlag&32){const a=e._;a?n&&a===1?r=!1:Sv(s,e,n):(r=!e.$stable,yv(e,s)),o=e}else e&&(Ev(t,e),o={default:1});if(r)for(const a in s)!Ip(a)&&o[a]==null&&delete s[a]};function wb(){typeof __VUE_OPTIONS_API__!="boolean"&&(no().__VUE_OPTIONS_API__=!0),typeof __VUE_PROD_DEVTOOLS__!="boolean"&&(no().__VUE_PROD_DEVTOOLS__=!1),typeof __VUE_PROD_HYDRATION_MISMATCH_DETAILS__!="boolean"&&(no().__VUE_PROD_HYDRATION_MISMATCH_DETAILS__=!1)}const un=Fv;function bv(t){return Av(t)}function Mv(t){return Av(t,vS)}function Av(t,e){wb();const n=no();n.__VUE__=!0,__VUE_PROD_DEVTOOLS__&&Ep(n.__VUE_DEVTOOLS_GLOBAL_HOOK__,n);const{insert:i,remove:s,patchProp:r,createElement:o,createText:a,createComment:l,setText:u,setElementText:c,parentNode:f,nextSibling:h,setScopeId:d=Tn,insertStaticContent:m}=t,x=(N,k,ee,ce=null,oe=null,ue=null,xe=void 0,ye=null,pe=!!k.dynamicChildren)=>{if(N===k)return;N&&!Xi(N,k)&&(ce=K(N),q(N,oe,ue,!0),N=null),k.patchFlag===-2&&(pe=!1,k.dynamicChildren=null),k.dynamicChildren&&N&&N.dynamicChildren&&N.dynamicChildren.hasOnce&&(k.dynamicChildren===jr&&(k.dynamicChildren=[]),k.dynamicChildren.hasOnce=!0);const{type:J,ref:U,shapeFlag:Te}=k;switch(J){case Zs:_(N,k,ee,ce);break;case nn:p(N,k,ee,ce);break;case Js:N==null&&b(k,ee,ce,xe);break;case pn:M(N,k,ee,ce,oe,ue,xe,ye,pe);break;default:Te&1?E(N,k,ee,ce,oe,ue,xe,ye,pe):Te&6?I(N,k,ee,ce,oe,ue,xe,ye,pe):(Te&64||Te&128)&&J.process(N,k,ee,ce,oe,ue,xe,ye,pe,Fe)}U!=null&&oe?Qo(U,N&&N.ref,ue,k||N,!k):U==null&&N&&N.ref!=null&&Qo(N.ref,null,ue,N,!0)},_=(N,k,ee,ce)=>{if(N==null)i(k.el=a(k.children),ee,ce);else{const oe=k.el=N.el;k.children!==N.children&&u(oe,k.children)}},p=(N,k,ee,ce)=>{N==null?i(k.el=l(k.children||""),ee,ce):k.el=N.el},b=(N,k,ee,ce)=>{[N.el,N.anchor]=m(N.children,k,ee,ce,N.el,N.anchor)},y=({el:N,anchor:k},ee,ce)=>{let oe;for(;N&&N!==k;)oe=h(N),i(N,ee,ce),N=oe;i(k,ee,ce)},g=({el:N,anchor:k})=>{let ee;for(;N&&N!==k;)ee=h(N),s(N),N=ee;s(k)},E=(N,k,ee,ce,oe,ue,xe,ye,pe)=>{if(k.type==="svg"?xe="svg":k.type==="math"&&(xe="mathml"),N==null)T(k,ee,ce,oe,ue,xe,ye,pe);else{const J=N.el&&N.el._isVueCE?N.el:null;try{J&&J._beginPatch(),A(N,k,oe,ue,xe,ye,pe)}finally{J&&J._endPatch()}}},T=(N,k,ee,ce,oe,ue,xe,ye)=>{let pe,J;const{props:U,shapeFlag:Te,transition:Ae,dirs:D}=N;if(pe=N.el=o(N.type,ue,U&&U.is,U),Te&8?c(pe,N.children):Te&16&&v(N.children,pe,null,ce,oe,Jf(N,ue),xe,ye),D&&cs(N,null,ce,"created"),C(pe,N,N.scopeId,xe,ce),U){for(const G in U)G!=="value"&&!Ys(G)&&r(pe,G,null,U[G],ue,ce);"value"in U&&r(pe,"value",null,U.value,ue),(J=U.onVnodeBeforeMount)&&li(J,ce,N)}__VUE_PROD_DEVTOOLS__&&(ra(pe,"__vnode",N,!0),ra(pe,"__vueParentComponent",ce,!0)),D&&cs(N,null,ce,"beforeMount");const S=Tv(oe,Ae);S&&Ae.beforeEnter(pe),i(pe,k,ee),((J=U&&U.onVnodeMounted)||S||D)&&un(()=>{try{J&&li(J,ce,N),S&&Ae.enter(pe),D&&cs(N,null,ce,"mounted")}finally{}},oe)},C=(N,k,ee,ce,oe)=>{if(ee&&d(N,ee),ce)for(let ue=0;ue<ce.length;ue++)d(N,ce[ue]);if(oe){let ue=oe.subTree;if(k===ue||gc(ue.type)&&(ue.ssContent===k||ue.ssFallback===k)){const xe=oe.vnode;C(N,xe,xe.scopeId,xe.slotScopeIds,oe.parent)}}},v=(N,k,ee,ce,oe,ue,xe,ye,pe=0)=>{for(let J=pe;J<N.length;J++){const U=N[J]=ye?Vs(N[J]):ci(N[J]);x(null,U,k,ee,ce,oe,ue,xe,ye)}},A=(N,k,ee,ce,oe,ue,xe)=>{const ye=k.el=N.el;__VUE_PROD_DEVTOOLS__&&(ye.__vnode=k);let{patchFlag:pe,dynamicChildren:J,dirs:U}=k;pe|=N.patchFlag&16;const Te=N.props||yt,Ae=k.props||yt;let D;if(ee&&Vr(ee,!1),(D=Ae.onVnodeBeforeUpdate)&&li(D,ee,k,N),U&&cs(k,N,ee,"beforeUpdate"),ee&&Vr(ee,!0),J&&(!N.dynamicChildren||N.dynamicChildren.length!==J.length)&&(pe=0,xe=!1,J=null),(Te.innerHTML&&Ae.innerHTML==null||Te.textContent&&Ae.textContent==null)&&c(ye,""),J?R(N.dynamicChildren,J,ye,ee,ce,Jf(k,oe),ue):xe||H(N,k,ye,null,ee,ce,Jf(k,oe),ue,!1),pe>0){if(pe&16)L(ye,Te,Ae,ee,oe);else if(pe&2&&Te.class!==Ae.class&&r(ye,"class",null,Ae.class,oe),pe&4&&r(ye,"style",Te.style,Ae.style,oe),pe&8){const S=k.dynamicProps;for(let G=0;G<S.length;G++){const Z=S[G],ie=Te[Z],me=Ae[Z];(me!==ie||Z==="value")&&r(ye,Z,ie,me,oe,ee)}}pe&1&&N.children!==k.children&&c(ye,k.children)}else!xe&&J==null&&L(ye,Te,Ae,ee,oe);((D=Ae.onVnodeUpdated)||U)&&un(()=>{D&&li(D,ee,k,N),U&&cs(k,N,ee,"updated")},ce)},R=(N,k,ee,ce,oe,ue,xe)=>{for(let ye=0;ye<k.length;ye++){const pe=N[ye],J=k[ye],U=pe.el&&(pe.type===pn||!Xi(pe,J)||pe.shapeFlag&198)?f(pe.el):ee;x(pe,J,U,null,ce,oe,ue,xe,!0)}},L=(N,k,ee,ce,oe)=>{if(k!==ee){if(k!==yt)for(const ue in k)!Ys(ue)&&!(ue in ee)&&r(N,ue,k[ue],null,oe,ce);for(const ue in ee){if(Ys(ue))continue;const xe=ee[ue],ye=k[ue];xe!==ye&&ue!=="value"&&r(N,ue,ye,xe,oe,ce)}"value"in ee&&r(N,"value",k.value,ee.value,oe)}},M=(N,k,ee,ce,oe,ue,xe,ye,pe)=>{const J=k.el=N?N.el:a(""),U=k.anchor=N?N.anchor:a("");let{patchFlag:Te,dynamicChildren:Ae,slotScopeIds:D}=k;D&&(ye=ye?ye.concat(D):D),N==null?(i(J,ee,ce),i(U,ee,ce),v(k.children||[],ee,U,oe,ue,xe,ye,pe)):Te>0&&Te&64&&Ae&&N.dynamicChildren&&N.dynamicChildren.length===Ae.length?(R(N.dynamicChildren,Ae,ee,oe,ue,xe,ye),(k.key!=null||oe&&k===oe.subTree)&&Np(N,k,!0)):H(N,k,ee,U,oe,ue,xe,ye,pe)},I=(N,k,ee,ce,oe,ue,xe,ye,pe)=>{k.slotScopeIds=ye,N==null?k.shapeFlag&512?oe.ctx.activate(k,ee,ce,xe,pe):F(k,ee,ce,oe,ue,xe,pe):B(N,k,pe)},F=(N,k,ee,ce,oe,ue,xe)=>{const ye=N.component=Bv(N,ce,oe);if(zl(N)&&(ye.ctx.renderer=Fe),Ov(ye,!1,xe),ye.asyncDep){if(oe&&oe.registerDep(ye,O,xe),!N.el){const pe=ye.subTree=jt(nn);p(null,pe,k,ee),N.placeholder=pe.el}}else O(ye,N,k,ee,oe,ue,xe)},B=(N,k,ee)=>{const ce=k.component=N.component;if(yb(N,k,ee))if(ce.asyncDep&&!ce.asyncResolved){k.el=N.el,z(ce,k,ee);return}else ce.next=k,ce.update();else k.el=N.el,ce.vnode=k},O=(N,k,ee,ce,oe,ue,xe)=>{const ye=()=>{if(N.isMounted){let{next:Te,bu:Ae,u:D,parent:S,vnode:G}=N;{const ae=wv(N);if(ae){Te&&(Te.el=G.el,z(N,Te,xe)),ae.asyncDep.then(()=>{un(()=>{N.isUnmounted||J()},oe)});return}}let Z=Te,ie;Vr(N,!1),Te?(Te.el=G.el,z(N,Te,xe)):Te=G,Ae&&Jo(Ae),(ie=Te.props&&Te.props.onVnodeBeforeUpdate)&&li(ie,S,Te,G),Vr(N,!0);const me=Xu(N),we=N.subTree;N.subTree=me,x(we,me,f(we.el),K(we),N,oe,ue),Te.el=me.el,Z===null&&yf(N,me.el),D&&un(D,oe),(ie=Te.props&&Te.props.onVnodeUpdated)&&un(()=>li(ie,S,Te,G),oe),__VUE_PROD_DEVTOOLS__&&V_(N)}else{let Te;const{el:Ae,props:D}=k,{bm:S,m:G,parent:Z,root:ie,type:me}=N,we=Ks(k);if(Vr(N,!1),S&&Jo(S),!we&&(Te=D&&D.onVnodeBeforeMount)&&li(Te,Z,k),Vr(N,!0),Ae&&Ze){const ae=()=>{N.subTree=Xu(N),Ze(Ae,N.subTree,N,oe,null)};we&&me.__asyncHydrate?me.__asyncHydrate(Ae,N,ae):ae()}else{ie.ce&&ie.ce._hasShadowRoot()&&ie.ce._injectChildStyle(me,N.parent?N.parent.type:void 0);const ae=N.subTree=Xu(N);x(null,ae,ee,ce,N,oe,ue),k.el=ae.el}if(G&&un(G,oe),!we&&(Te=D&&D.onVnodeMounted)){const ae=k;un(()=>li(Te,Z,ae),oe)}(k.shapeFlag&256||Z&&Ks(Z.vnode)&&Z.vnode.shapeFlag&256)&&N.a&&un(N.a,oe),N.isMounted=!0,__VUE_PROD_DEVTOOLS__&&Kh(N),k=ee=ce=null}};N.scope.on();const pe=N.effect=new cl(ye);N.scope.off();const J=N.update=pe.run.bind(pe),U=N.job=pe.runIfDirty.bind(pe);U.i=N,U.id=N.uid,pe.scheduler=()=>yp(U),Vr(N,!0),J()},z=(N,k,ee)=>{k.component=N;const ce=N.vnode.props;N.vnode=k,N.next=null,Sb(N,k.props,ce,ee),Tb(N,k.children,ee),bs(),Zm(N),Ms()},H=(N,k,ee,ce,oe,ue,xe,ye,pe=!1)=>{const J=N&&N.children,U=N?N.shapeFlag:0,Te=k.children,{patchFlag:Ae,shapeFlag:D}=k;if(Ae>0){if(Ae&128){Q(J,Te,ee,ce,oe,ue,xe,ye,pe);return}else if(Ae&256){Y(J,Te,ee,ce,oe,ue,xe,ye,pe);return}}D&8?(U&16&&de(J,oe,ue),Te!==J&&c(ee,Te)):U&16?D&16?Q(J,Te,ee,ce,oe,ue,xe,ye,pe):de(J,oe,ue,!0):(U&8&&c(ee,""),D&16&&v(Te,ee,ce,oe,ue,xe,ye,pe))},Y=(N,k,ee,ce,oe,ue,xe,ye,pe)=>{N=N||jr,k=k||jr;const J=N.length,U=k.length,Te=Math.min(J,U);let Ae;for(Ae=0;Ae<Te;Ae++){const D=k[Ae]=pe?Vs(k[Ae]):ci(k[Ae]);x(N[Ae],D,ee,null,oe,ue,xe,ye,pe)}J>U?de(N,oe,ue,!0,!1,Te):v(k,ee,ce,oe,ue,xe,ye,pe,Te)},Q=(N,k,ee,ce,oe,ue,xe,ye,pe)=>{let J=0;const U=k.length;let Te=N.length-1,Ae=U-1;for(;J<=Te&&J<=Ae;){const D=N[J],S=k[J]=pe?Vs(k[J]):ci(k[J]);if(Xi(D,S))x(D,S,ee,null,oe,ue,xe,ye,pe);else break;J++}for(;J<=Te&&J<=Ae;){const D=N[Te],S=k[Ae]=pe?Vs(k[Ae]):ci(k[Ae]);if(Xi(D,S))x(D,S,ee,null,oe,ue,xe,ye,pe);else break;Te--,Ae--}if(J>Te){if(J<=Ae){const D=Ae+1,S=D<U?k[D].el:ce;for(;J<=Ae;)x(null,k[J]=pe?Vs(k[J]):ci(k[J]),ee,S,oe,ue,xe,ye,pe),J++}}else if(J>Ae)for(;J<=Te;)q(N[J],oe,ue,!0),J++;else{const D=J,S=J,G=new Map;for(J=S;J<=Ae;J++){const Ne=k[J]=pe?Vs(k[J]):ci(k[J]);Ne.key!=null&&G.set(Ne.key,J)}let Z,ie=0;const me=Ae-S+1;let we=!1,ae=0;const le=new Array(me);for(J=0;J<me;J++)le[J]=0;for(J=D;J<=Te;J++){const Ne=N[J];if(ie>=me){q(Ne,oe,ue,!0);continue}let Ee;if(Ne.key!=null)Ee=G.get(Ne.key);else for(Z=S;Z<=Ae;Z++)if(le[Z-S]===0&&Xi(Ne,k[Z])){Ee=Z;break}Ee===void 0?q(Ne,oe,ue,!0):(le[Ee-S]=J+1,Ee>=ae?ae=Ee:we=!0,x(Ne,k[Ee],ee,null,oe,ue,xe,ye,pe),ie++)}const Re=we?Cb(le):jr;for(Z=Re.length-1,J=me-1;J>=0;J--){const Ne=S+J,Ee=k[Ne],Me=k[Ne+1],Ge=Ne+1<U?Me.el||Cv(Me):ce;le[J]===0?x(null,Ee,ee,Ge,oe,ue,xe,ye,pe):we&&(Z<0||J!==Re[Z]?se(Ee,ee,Ge,2):Z--)}}},se=(N,k,ee,ce,oe=null)=>{const{el:ue,type:xe,transition:ye,children:pe,shapeFlag:J}=N;if(J&6){se(N.component.subTree,k,ee,ce);return}if(J&128){N.suspense.move(k,ee,ce);return}if(J&64){xe.move(N,k,ee,Fe);return}if(xe===pn){i(ue,k,ee);for(let Te=0;Te<pe.length;Te++)se(pe[Te],k,ee,ce);i(N.anchor,k,ee);return}if(xe===Js){y(N,k,ee);return}if(ce!==2&&J&1&&ye)if(ce===0)ye.persisted&&!ue[Fi]?i(ue,k,ee):(ye.beforeEnter(ue),i(ue,k,ee),un(()=>ye.enter(ue),oe));else{const{leave:Te,delayLeave:Ae,afterLeave:D}=ye,S=()=>{N.ctx.isUnmounted?s(ue):i(ue,k,ee)},G=()=>{const Z=ue._isLeaving||!!ue[Fi];ue._isLeaving&&ue[Fi](!0),ye.persisted&&!Z?S():Te(ue,()=>{S(),D&&D()})};Ae?Ae(ue,S,G):G()}else i(ue,k,ee)},q=(N,k,ee,ce=!1,oe=!1)=>{const{type:ue,props:xe,ref:ye,children:pe,dynamicChildren:J,shapeFlag:U,patchFlag:Te,dirs:Ae,cacheIndex:D,memo:S}=N;if((Te===-2||J&&J.hasOnce)&&(oe=!1),ye!=null&&(bs(),Qo(ye,null,ee,N,!0),Ms()),D!=null&&(!N.ctx||N.ctx===k)&&(k.renderCache[D]=void 0),U&256){k.ctx.deactivate(N);return}const G=U&1&&Ae,Z=!Ks(N);let ie;if(Z&&(ie=xe&&xe.onVnodeBeforeUnmount)&&li(ie,k,N),U&6)We(N.component,ee,ce);else{if(U&128){N.suspense.unmount(ee,ce);return}G&&cs(N,null,k,"beforeUnmount"),U&64?N.type.remove(N,k,ee,Fe,ce):J&&!J.hasOnce&&(ue!==pn||Te>0&&Te&64)?de(J,k,ee,!1,!0):(ue===pn&&Te&384||!oe&&U&16)&&de(pe,k,ee),ce&&he(N)}const me=S!=null&&D==null;(Z&&(ie=xe&&xe.onVnodeUnmounted)||G||me)&&un(()=>{ie&&li(ie,k,N),G&&cs(N,null,k,"unmounted"),me&&(N.el=null)},ee)},he=N=>{const{type:k,el:ee,anchor:ce,transition:oe}=N;if(k===pn){et(ee,ce);return}if(k===Js){g(N),oe&&!oe.persisted&&oe.afterLeave&&oe.afterLeave();return}const ue=()=>{s(ee),oe&&!oe.persisted&&oe.afterLeave&&oe.afterLeave()};if(N.shapeFlag&1&&oe&&!oe.persisted){const{leave:xe,delayLeave:ye}=oe,pe=()=>xe(ee,ue);ye?ye(N.el,ue,pe):pe()}else ue()},et=(N,k)=>{let ee;for(;N!==k;)ee=h(N),s(N),N=ee;s(k)},We=(N,k,ee)=>{const{bum:ce,scope:oe,job:ue,subTree:xe,um:ye,m:pe,a:J}=N;mc(pe),mc(J),ce&&Jo(ce),oe.stop(),ue?(ue.flags|=8,q(xe,N,k,ee)):N.vnode.el&&xe&&(xe.transition=N.vnode.transition,q(xe,N,k,ee)),ye&&un(ye,k),un(()=>{N.isUnmounted=!0},k),__VUE_PROD_DEVTOOLS__&&QE(N)},de=(N,k,ee,ce=!1,oe=!1,ue=0)=>{for(let xe=ue;xe<N.length;xe++)q(N[xe],k,ee,ce,oe)},K=N=>{if(N.shapeFlag&6)return K(N.component.subTree);if(N.shapeFlag&128)return N.suspense.next();const k=h(N.anchor||N.el),ee=k&&k[q_];return ee?h(ee):k};let j=!1;const _e=(N,k,ee)=>{let ce;N==null?k._vnode&&(q(k._vnode,null,null,!0),ce=k._vnode.component):x(k._vnode||null,N,k,null,null,null,ee),k._vnode=N,j||(j=!0,Zm(ce),cc(),j=!1)},Fe={p:x,um:q,m:se,r:he,mt:F,mc:v,pc:H,pbc:R,n:K,o:t};let Ce,Ze;return e&&([Ce,Ze]=e(Fe)),{render:_e,hydrate:Ce,createApp:db(_e,Ce)}}function Jf({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function Vr({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function Tv(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function Np(t,e,n=!1){const i=t.children,s=e.children;if(Ue(i)&&Ue(s))for(let r=0;r<i.length;r++){const o=i[r];let a=s[r];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=s[r]=Vs(s[r]),a.el=o.el),!n&&a.patchFlag!==-2&&Np(o,a)),a.type===Zs&&(a.patchFlag===-1&&(a=s[r]=Vs(a)),a.el=o.el),a.type===nn&&!a.el&&(a.el=o.el)}}function Cb(t){const e=t.slice(),n=[0];let i,s,r,o,a;const l=t.length;for(i=0;i<l;i++){const u=t[i];if(u!==0){if(s=n[n.length-1],t[s]<u){e[i]=s,n.push(i);continue}for(r=0,o=n.length-1;r<o;)a=r+o>>1,t[n[a]]<u?r=a+1:o=a;u<t[n[r]]&&(r>0&&(e[i]=n[r-1]),n[r]=i)}}for(r=n.length,o=n[r-1];r-- >0;)n[r]=o,o=e[o];return n}function wv(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:wv(e)}function mc(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}function Cv(t){if(t.placeholder)return t.placeholder;const e=t.component;return e?Cv(e.subTree):null}const gc=t=>t.__isSuspense;let id=0;const Rb={name:"Suspense",__isSuspense:!0,process(t,e,n,i,s,r,o,a,l,u){if(t==null)Db(e,n,i,s,r,o,a,l,u);else{if(r&&r.deps>0&&!t.suspense.isInFallback&&!r.isHydrating){e.suspense=t.suspense,e.suspense.vnode=e,e.el=t.el;return}Pb(t,e,n,i,s,o,a,l,u)}},hydrate:Ib,normalize:Lb},Fb=Rb;function _l(t,e){const n=t.props&&t.props[e];it(n)&&n()}function Db(t,e,n,i,s,r,o,a,l){const{p:u,o:{createElement:c}}=l,f=c("div"),h=t.suspense=Rv(t,s,i,e,f,n,r,o,a,l);u(null,h.pendingBranch=t.ssContent,f,null,i,h,r,o),h.deps>0?(_l(t,"onPending"),_l(t,"onFallback"),u(null,t.ssFallback,e,n,i,null,r,o),ea(h,t.ssFallback)):h.resolve(!1,!0)}function Pb(t,e,n,i,s,r,o,a,{p:l,um:u,o:{createElement:c}}){const f=e.suspense=t.suspense;f.vnode=e,e.el=t.el;const h=e.ssContent,d=e.ssFallback,{activeBranch:m,pendingBranch:x,isInFallback:_,isHydrating:p}=f;if(x)f.pendingBranch=h,Xi(x,h)?(f.deps++,l(x,h,p?n:f.hiddenContainer,null,s,f,r,o,a),f.deps--,f.deps<=0?f.resolve():_&&!p&&!f.isFallbackMountPending&&(l(m,d,n,i,s,null,r,o,a),ea(f,d))):(f.pendingId=id++,p?(f.isHydrating=!1,f.activeBranch=x):u(x,s,f),f.deps=0,f.effects.length=0,f.hiddenContainer=c("div"),_?(l(null,h,f.hiddenContainer,null,s,f,r,o,a),f.deps<=0?f.resolve():f.isFallbackMountPending||(l(m,d,n,i,s,null,r,o,a),ea(f,d))):m&&Xi(m,h)?(l(m,h,n,i,s,f,r,o,a),f.resolve(!0)):(l(null,h,f.hiddenContainer,null,s,f,r,o,a),f.deps<=0&&f.resolve()));else if(m&&Xi(m,h))l(m,h,n,i,s,f,r,o,a),ea(f,h);else if(_l(e,"onPending"),f.pendingBranch=h,h.shapeFlag&512?f.pendingId=h.component.suspenseId:f.pendingId=id++,l(null,h,f.hiddenContainer,null,s,f,r,o,a),f.deps<=0)f.resolve();else{const{timeout:b,pendingId:y}=f;b>0?setTimeout(()=>{f.pendingId===y&&f.fallback(d)},b):b===0&&f.fallback(d)}}function Rv(t,e,n,i,s,r,o,a,l,u,c=!1){const{p:f,m:h,um:d,n:m,o:{parentNode:x,remove:_}}=u;let p;const b=Nb(t);b&&e&&e.pendingBranch&&(p=e.pendingId,e.deps++);const y=t.props?rc(t.props.timeout):void 0,g=r,E={vnode:t,parent:e,parentComponent:n,namespace:o,container:i,hiddenContainer:s,deps:0,pendingId:id++,timeout:typeof y=="number"?y:-1,activeBranch:null,isFallbackMountPending:!1,pendingBranch:null,isInFallback:!c,isHydrating:c,isUnmounted:!1,effects:[],resolve(T=!1,C=!1){const{vnode:v,activeBranch:A,pendingBranch:R,pendingId:L,effects:M,parentComponent:I,container:F,isInFallback:B}=E;let O=!1;if(E.isHydrating)E.isHydrating=!1;else if(!T){O=A&&R.transition&&R.transition.mode==="out-in";let Y=!1;O&&(A.transition.afterLeave=()=>{L===E.pendingId&&(h(R,F,r===g&&!Y?m(A):r,0),dl(M),B&&v.ssFallback&&(v.ssFallback.el=null))}),A&&!E.isFallbackMountPending&&(x(A.el)===F&&(r=m(A),Y=!0),d(A,I,E,!0),!O&&B&&v.ssFallback&&un(()=>v.ssFallback.el=null,E)),O||h(R,F,r,0)}E.isFallbackMountPending=!1,ea(E,R),E.pendingBranch=null,E.isInFallback=!1;let z=E.parent,H=!1;for(;z;){if(z.pendingBranch){for(let Y=0;Y<M.length;Y++)z.effects.push(M[Y]);H=!0;break}z=z.parent}!H&&!O&&dl(M),E.effects=[],b&&e&&e.pendingBranch&&p===e.pendingId&&(p=void 0,e.deps--,e.deps===0&&!C&&e.resolve()),_l(v,"onResolve")},fallback(T){if(!E.pendingBranch)return;const{vnode:C,activeBranch:v,parentComponent:A,container:R,namespace:L}=E;_l(C,"onFallback");const M=m(v),I=()=>{if(E.isFallbackMountPending=!1,!E.isInFallback)return;const B=E.vnode.ssFallback;f(null,B,R,M,A,null,L,a,l),ea(E,B)},F=T.transition&&T.transition.mode==="out-in";F&&(E.isFallbackMountPending=!0,v.transition.afterLeave=I),E.isInFallback=!0,d(v,A,null,!0),F||I()},move(T,C,v){E.activeBranch&&h(E.activeBranch,T,C,v),E.container=T},next(){return E.activeBranch&&m(E.activeBranch)},registerDep(T,C,v){const A=!!E.pendingBranch;A&&E.deps++;const R=T.vnode.el;T.asyncDep.catch(L=>{Eo(L,T,0)}).then(L=>{if(T.isUnmounted||E.isUnmounted||E.pendingId!==T.suspenseId)return;if(yl(),R&&!T.scope.active){A&&--E.deps===0&&E.resolve();return}T.asyncResolved=!0;const{vnode:M}=T;sd(T,L,!1),R&&(M.el=R);const I=!R&&T.subTree.el;C(T,M,x(R||T.subTree.el),R?null:m(T.subTree),E,o,v),I&&(M.placeholder=null,_(I)),yf(T,M.el),A&&--E.deps===0&&E.resolve()})},unmount(T,C){E.isUnmounted=!0,E.activeBranch&&d(E.activeBranch,n,T,C),E.pendingBranch&&d(E.pendingBranch,n,T,C)}};return E}function Ib(t,e,n,i,s,r,o,a,l){const u=e.suspense=Rv(e,i,n,t.parentNode,document.createElement("div"),null,s,r,o,a,!0),c=l(t,u.pendingBranch=e.ssContent,n,u,r,o);return u.deps===0&&u.resolve(!1,!0),c}function Lb(t){const{shapeFlag:e,children:n}=t,i=e&32;t.ssContent=f0(i?n.default:n),t.ssFallback=i?f0(n.fallback):jt(nn)}function f0(t){let e;if(it(t)){const n=co&&t._c;n&&(t._d=!1,vl()),t=t(),n&&(t._d=!0,e=Vn,Ef())}return Ue(t)&&(t=_b(t)),t=ci(t),e&&!t.dynamicChildren&&(t.dynamicChildren=e.filter(n=>n!==t)),t}function Fv(t,e){e&&e.pendingBranch?Ue(t)?e.effects.push(...t):e.effects.push(t):dl(t)}function ea(t,e){t.activeBranch=e;const{vnode:n,parentComponent:i}=t;let s=e.el;for(;!s&&e.component;)e=e.component.subTree,s=e.el;n.el=s,i&&i.subTree===n&&(i.vnode.el=s,yf(i,s))}function Nb(t){const e=t.props&&t.props.suspensible;return e!=null&&e!==!1}const pn=Symbol.for("v-fgt"),Zs=Symbol.for("v-txt"),nn=Symbol.for("v-cmt"),Js=Symbol.for("v-stc"),js=[];let Vn=null;function vl(t=!1){js.push(Vn=t?null:[])}function Ef(){js.pop(),Vn=js[js.length-1]||null}let co=1;function xl(t,e=!1){co+=t,t<0&&Vn&&e&&(Vn.hasOnce=!0)}function Dv(t){return t.dynamicChildren=co>0?Vn||jr:null,Ef(),co>0&&Vn&&Vn.push(t),t}function Bb(t,e,n,i,s,r){return Dv(Bp(t,e,n,i,s,r,!0))}function _c(t,e,n,i,s){return Dv(jt(t,e,n,i,s,!0))}function sr(t){return t?t.__v_isVNode===!0:!1}function Xi(t,e){return t.type===e.type&&t.key===e.key}function Ub(t){}const Pv=({key:t})=>t??null,qu=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?Qe(t)||an(t)||it(t)?{i:Fn,r:t,k:e,f:!!n}:t:null);function Bp(t,e=null,n=null,i=0,s=null,r=t===pn?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&Pv(e),ref:e&&qu(e),scopeId:df,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:i,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Fn};return a?(vc(l,n),r&128&&t.normalize(l)):n&&(l.shapeFlag|=Qe(n)?8:16),co>0&&!o&&Vn&&(l.patchFlag>0||r&6)&&l.patchFlag!==32&&Vn.push(l),l}const jt=Ob;function Ob(t,e=null,n=null,i=0,s=null,r=!1){if((!t||t===lv)&&(t=nn),sr(t)){const a=As(t,e,!0);return n&&vc(a,n),co>0&&!r&&Vn&&(a.shapeFlag&6?Vn[Vn.indexOf(t)]=a:Vn.push(a)),a.patchFlag=-2,a}if(qb(t)&&(t=t.__vccOpts),e){e=Iv(e);let{class:a,style:l}=e;a&&!Qe(a)&&(e.class=va(a)),Pt(l)&&(Ul(l)&&!Ue(l)&&(l=_t({},l)),e.style=_a(l))}const o=Qe(t)?1:gc(t)?128:pf(t)?64:Pt(t)?4:it(t)?2:0;return Bp(t,e,n,i,s,o,r,!0)}function Iv(t){return t?Ul(t)||_v(t)?_t({},t):t:null}function As(t,e,n=!1,i=!1){const{props:s,ref:r,patchFlag:o,children:a,transition:l}=t,u=e?Nv(s||{},e):s,c={__v_isVNode:!0,__v_skip:!0,type:t.type,props:u,key:u&&Pv(u),ref:e&&e.ref?n&&r?Ue(r)?r.concat(qu(e)):[r,qu(e)]:qu(e):r,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:a,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==pn?o===-1?16:o|16:o,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:l,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&As(t.ssContent),ssFallback:t.ssFallback&&As(t.ssFallback),placeholder:t.placeholder,el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce,cacheIndex:t.cacheIndex};return l&&i&&ir(c,l.clone(c)),c}function Up(t=" ",e=0){return jt(Zs,null,t,e)}function kb(t,e){const n=jt(Js,null,t);return n.staticCount=e,n}function Lv(t="",e=!1){return e?(vl(),_c(nn,null,t)):jt(nn,null,t)}function ci(t){return t==null||typeof t=="boolean"?jt(nn):Ue(t)?jt(pn,null,t.slice()):sr(t)?Vs(t):jt(Zs,null,String(t))}function Vs(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:As(t)}function vc(t,e){let n=0;const{shapeFlag:i}=t;if(e==null)e=null;else if(Ue(e))n=16;else if(typeof e=="object")if(i&65){const s=e.default;s&&(s._c&&(s._d=!1),vc(t,s()),s._c&&(s._d=!0));return}else{n=32;const s=e._;!s&&!_v(e)?e._ctx=Fn:s===3&&Fn&&(Fn.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else if(it(e)){if(i&65){vc(t,{default:e});return}e={default:e,_ctx:Fn},n=32}else e=String(e),i&64?(n=16,e=[Up(e)]):n=8;t.children=e,t.shapeFlag|=n}function Nv(...t){const e={};for(let n=0;n<t.length;n++){const i=t[n];for(const s in i)if(s==="class")e.class!==i.class&&(e.class=va([e.class,i.class]));else if(s==="style")e.style=_a([e.style,i.style]);else if(vo(s)){const r=e[s],o=i[s];o&&r!==o&&!(Ue(r)&&r.includes(o))?e[s]=r?[].concat(r,o):o:o==null&&r==null&&!jc(s)&&(e[s]=o)}else s!==""&&(e[s]=i[s])}return e}function li(t,e,n,i=null){Si(t,e,7,[n,i])}const zb=fv();let Vb=0;function Bv(t,e,n){const i=t.type,s=(e?e.appContext:t.appContext)||zb,r={uid:Vb++,vnode:t,type:i,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new mp(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:xv(i,s),emitsOptions:dv(i,s),emit:null,emitted:null,propsDefaults:yt,inheritAttrs:i.inheritAttrs,ctx:yt,data:yt,props:yt,attrs:yt,slots:yt,refs:yt,setupState:yt,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=e?e.root:r,r.emit=mb.bind(null,r),t.ce&&t.ce(r),r}let Rn=null;const Qn=()=>Rn||Fn;let xc,wr;{const t=no(),e=(n,i)=>{let s;return(s=t[n])||(s=t[n]=[]),s.push(i),r=>{s.length>1?s.forEach(o=>o(r)):s[0](r)}};xc=e("__VUE_INSTANCE_SETTERS__",n=>Rn=n),wr=e("__VUE_SSR_SETTERS__",n=>fo=n)}const ya=t=>{const e=Rn;return xc(t),t.scope.on(),()=>{t.scope.off(),xc(e)}},yl=()=>{Rn&&Rn.scope.off(),xc(null)};function Uv(t){return t.vnode.shapeFlag&4}let fo=!1;function Ov(t,e=!1,n=!1){e&&wr(e);const{props:i,children:s}=t.vnode,r=Uv(t);Eb(t,i,r,e),Ab(t,s,n||e);const o=r?Hb(t,e):void 0;return e&&wr(!1),o}function Hb(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,Qh);const{setup:i}=n;if(i){bs();const s=t.setupContext=i.length>1?Vv(t):null,r=ya(t),o=yo(i,t,0,[t.props,s]),a=pp(o);if(Ms(),r(),(a||t.sp)&&!Ks(t)&&Tp(t),a){if(o.then(yl,yl),e)return o.then(l=>{wr(!0);try{sd(t,l,e)}finally{wr(!1)}}).catch(l=>{Eo(l,t,0)});t.asyncDep=o}else sd(t,o,e)}else zv(t,e)}function sd(t,e,n){it(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:Pt(e)&&(__VUE_PROD_DEVTOOLS__&&(t.devtoolsRawSetupState=e),t.setupState=xp(e)),zv(t,n)}let yc,rd;function kv(t){yc=t,rd=e=>{e.render._rc&&(e.withProxy=new Proxy(e.ctx,qS))}}const Gb=()=>!yc;function zv(t,e,n){const i=t.type;if(!t.render){if(!e&&yc&&!i.render){const s=i.template||__VUE_OPTIONS_API__&&Pp(t).template;if(s){const{isCustomElement:r,compilerOptions:o}=t.appContext.config,{delimiters:a,compilerOptions:l}=i,u=_t(_t({isCustomElement:r,delimiters:a},o),l);i.render=yc(s,u)}}t.render=i.render||Tn,rd&&rd(t)}if(__VUE_OPTIONS_API__){const s=ya(t);bs();try{ab(t)}finally{Ms(),s()}}}const Wb={get(t,e){return zn(t,"get",""),t[e]}};function Vv(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,Wb),slots:t.slots,emit:t.emit,expose:e}}function Hl(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(xp(D_(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in il)return il[n](t)},has(e,n){return n in e||n in il}})):t.proxy}const $b=/(?:^|[-_])\w/g,Xb=t=>t.replace($b,e=>e.toUpperCase()).replace(/[-_]/g,"");function Ec(t,e=!0){return it(t)?t.displayName||t.name:t.name||e&&t.__name}function Hv(t,e,n=!1){let i=Ec(e);if(!i&&e.__file){const s=e.__file.match(/([^/\\]+)\.\w+$/);s&&(i=s[1])}if(!i&&t){const s=r=>{for(const o in r)if(r[o]===e)return o};i=s(t.components)||t.parent&&s(t.parent.type.components)||s(t.appContext.components)}return i?Xb(i):n?"App":"Anonymous"}function qb(t){return it(t)&&"__vccOpts"in t}const ht=(t,e)=>LE(t,e,fo);function Sr(t,e,n){try{xl(-1);const i=arguments.length;return i===2?Pt(e)&&!Ue(e)?sr(e)?jt(t,null,[e]):jt(t,e):jt(t,null,e):(i>3?n=Array.prototype.slice.call(arguments,2):i===3&&sr(n)&&(n=[n]),jt(t,e,n))}finally{xl(1)}}function Yb(){}function Kb(t,e,n,i){const s=n[i];if(s&&Gv(s,t))return s;const r=e();return r.memo=t.slice(),r.cacheIndex=i,n[i]=r}function Gv(t,e){const n=t.memo;if(n.length!=e.length)return!1;for(let i=0;i<n.length;i++)if(An(n[i],e[i]))return!1;return co>0&&Vn&&Vn.push(t),!0}const od="3.5.43",Zb=Tn,Jb=qE,jb=$i,Qb=Ep,eM={createComponentInstance:Bv,setupComponent:Ov,renderComponentRoot:Xu,setCurrentRenderingInstance:ml,isVNode:sr,normalizeVNode:ci,getComponentPublicInstance:Hl,ensureValidVNode:Dp,pushWarningContext:kE,popWarningContext:zE},tM=eM,nM=null,iM=null,sM=null;/**
* @vue/runtime-dom v3.5.43
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let ad;const h0=typeof window<"u"&&window.trustedTypes;if(h0)try{ad=h0.createPolicy("vue",{createHTML:t=>t})}catch{}const Wv=ad?t=>ad.createHTML(t):t=>t,rM="http://www.w3.org/2000/svg",oM="http://www.w3.org/1998/Math/MathML",zs=typeof document<"u"?document:null,d0=zs&&zs.createElement("template"),$v={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,i)=>{const s=e==="svg"?zs.createElementNS(rM,t):e==="mathml"?zs.createElementNS(oM,t):n?zs.createElement(t,{is:n}):zs.createElement(t);return t==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:t=>zs.createTextNode(t),createComment:t=>zs.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>zs.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,i,s,r){const o=n?n.previousSibling:e.lastChild;if(s&&(s===r||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===r||!(s=s.nextSibling)););else{d0.innerHTML=Wv(i==="svg"?`<svg>${t}</svg>`:i==="mathml"?`<math>${t}</math>`:t);const a=d0.content;if(i==="svg"||i==="mathml"){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}e.insertBefore(a,n)}return[o?o.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},ur="transition",Da="animation",aa=Symbol("_vtc"),Xv={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String},qv=_t({},Ap,Xv),aM=t=>(t.displayName="Transition",t.props=qv,t),lM=aM((t,{slots:e})=>Sr(Z_,Yv(t),e)),Hr=(t,e=[])=>{Ue(t)?t.forEach(n=>n(...e)):t&&t(...e)},p0=t=>t?Ue(t)?t.some(e=>e.length>1):t.length>1:!1;function Yv(t){const e={};for(const M in t)M in Xv||(e[M]=t[M]);if(t.css===!1)return e;const{name:n="v",type:i,duration:s,enterFromClass:r=`${n}-enter-from`,enterActiveClass:o=`${n}-enter-active`,enterToClass:a=`${n}-enter-to`,appearFromClass:l=r,appearActiveClass:u=o,appearToClass:c=a,leaveFromClass:f=`${n}-leave-from`,leaveActiveClass:h=`${n}-leave-active`,leaveToClass:d=`${n}-leave-to`}=t,m=uM(s),x=m&&m[0],_=m&&m[1],{onBeforeEnter:p,onEnter:b,onEnterCancelled:y,onLeave:g,onLeaveCancelled:E,onBeforeAppear:T=p,onAppear:C=b,onAppearCancelled:v=y}=e,A=(M,I,F,B)=>{M._enterCancelled=B,xr(M,I?c:a),xr(M,I?u:o),F&&F()},R=(M,I)=>{M._isLeaving=!1,xr(M,f),xr(M,d),xr(M,h),I&&I()},L=M=>(I,F)=>{const B=M?C:b,O=()=>A(I,M,F);Hr(B,[I,O]),m0(()=>{xr(I,M?l:r),ls(I,M?c:a),p0(B)||g0(I,i,x,O)})};return _t(e,{onBeforeEnter(M){Hr(p,[M]),ls(M,r),ls(M,o)},onBeforeAppear(M){Hr(T,[M]),ls(M,l),ls(M,u)},onEnter:L(!1),onAppear:L(!0),onLeave(M,I){M._isLeaving=!0;const F=()=>R(M,I);ls(M,f),M._enterCancelled?(ls(M,h),ld(M)):(ld(M),ls(M,h)),m0(()=>{M._isLeaving&&(xr(M,f),ls(M,d),p0(g)||g0(M,i,_,F))}),Hr(g,[M,F])},onEnterCancelled(M){A(M,!1,void 0,!0),Hr(y,[M])},onAppearCancelled(M){A(M,!0,void 0,!0),Hr(v,[M])},onLeaveCancelled(M){R(M),Hr(E,[M])}})}function uM(t){if(t==null)return null;if(Pt(t))return[jf(t.enter),jf(t.leave)];{const e=jf(t);return[e,e]}}function jf(t){return rc(t)}function ls(t,e){e.split(/\s+/).forEach(n=>n&&t.classList.add(n)),(t[aa]||(t[aa]=new Set)).add(e)}function xr(t,e){e.split(/\s+/).forEach(i=>i&&t.classList.remove(i));const n=t[aa];n&&(n.delete(e),n.size||(t[aa]=void 0))}function m0(t){requestAnimationFrame(()=>{requestAnimationFrame(t)})}let cM=0;function g0(t,e,n,i){const s=t._endId=++cM,r=()=>{s===t._endId&&i()};if(n!=null)return setTimeout(r,n);const{type:o,timeout:a,propCount:l}=Kv(t,e);if(!o)return i();const u=o+"end";let c=0;const f=()=>{t.removeEventListener(u,h),r()},h=d=>{d.target===t&&++c>=l&&f()};setTimeout(()=>{c<l&&f()},a+1),t.addEventListener(u,h)}function Kv(t,e){const n=window.getComputedStyle(t),i=m=>(n[m]||"").split(", "),s=i(`${ur}Delay`),r=i(`${ur}Duration`),o=_0(s,r),a=i(`${Da}Delay`),l=i(`${Da}Duration`),u=_0(a,l);let c=null,f=0,h=0;e===ur?o>0&&(c=ur,f=o,h=r.length):e===Da?u>0&&(c=Da,f=u,h=l.length):(f=Math.max(o,u),c=f>0?o>u?ur:Da:null,h=c?c===ur?r.length:l.length:0);const d=c===ur&&/\b(?:transform|all)(?:,|$)/.test(i(`${ur}Property`).toString());return{type:c,timeout:f,propCount:h,hasTransform:d}}function _0(t,e){for(;t.length<e.length;)t=t.concat(t);return Math.max(...e.map((n,i)=>v0(n)+v0(t[i])))}function v0(t){return t==="auto"?0:Number(t.slice(0,-1).replace(",","."))*1e3}function ld(t){return(t?t.ownerDocument:document).body.offsetHeight}function fM(t,e,n){const i=t[aa];i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const Sc=Symbol("_vod"),Op=Symbol("_vsh"),Zv={name:"show",beforeMount(t,{value:e},{transition:n}){t[Sc]=t.style.display==="none"?"":t.style.display,n&&e?n.beforeEnter(t):Pa(t,e)},mounted(t,{value:e},{transition:n}){n&&e&&n.enter(t)},updated(t,{value:e,oldValue:n},{transition:i}){!e!=!n&&(i?e?(i.beforeEnter(t),Pa(t,!0),i.enter(t)):i.leave(t,()=>{Pa(t,!1)}):Pa(t,e))},beforeUnmount(t,{value:e}){Pa(t,e)}};function Pa(t,e){t.style.display=e?t[Sc]:"none",t[Op]=!e}function hM(){Zv.getSSRProps=({value:t})=>{if(!t)return{style:{display:"none"}}}}const Jv=Symbol("");function dM(t){const e=Qn();if(!e)return;const n=e.ut=(s=t(e.proxy))=>{Array.from(document.querySelectorAll(`[data-v-owner="${e.uid}"]`)).forEach(r=>bc(r,s))},i=()=>{const s=t(e.proxy);e.ce?bc(e.ce,s):ud(e.subTree,s),n(s)};Cp(()=>{dl(i)}),So(()=>{ro(i,Tn,{flush:"post"});const s=new MutationObserver(i);s.observe(e.subTree.el.parentNode,{childList:!0}),xa(()=>s.disconnect())})}function ud(t,e){if(t.shapeFlag&128){const n=t.suspense;t=n.activeBranch,n.pendingBranch&&!n.isHydrating&&n.effects.push(()=>{ud(n.activeBranch,e)})}for(;t.component;)t=t.component.subTree;if(t.shapeFlag&1&&t.el)bc(t.el,e);else if(t.type===pn)t.children.forEach(n=>ud(n,e));else if(t.type===Js){let{el:n,anchor:i}=t;for(;n&&(bc(n,e),n!==i);)n=n.nextSibling}}function bc(t,e){if(t.nodeType===1){const n=t.style;let i="";for(const s in e){const r=d_(e[s]);n.setProperty(`--${s}`,r),i+=`--${s}: ${r};`}n[Jv]=i}}const pM=/(?:^|;)\s*display\s*:/;function mM(t,e,n){const i=t.style,s=Qe(n);let r=!1;if(n&&!s){if(e)if(Qe(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();n[a]==null&&Ya(i,a,"")}else for(const o in e)n[o]==null&&Ya(i,o,"");for(const o in n){o==="display"&&(r=!0);const a=n[o];a!=null?_M(t,o,!Qe(e)&&e?e[o]:void 0,a)||Ya(i,o,a):Ya(i,o,"")}}else if(s){if(e!==n){const o=i[Jv];o&&(n+=";"+o),i.cssText=n,r=pM.test(n)}}else e&&t.removeAttribute("style");Sc in t&&(t[Sc]=r?i.display:"",t[Op]&&(i.display="none"))}const cu=/\s*!important$/;function Ya(t,e,n){if(Ue(n))n.forEach(i=>Ya(t,e,i));else if(n==null&&(n=""),e.startsWith("--"))cu.test(n)?t.setProperty(e,n.replace(cu,""),"important"):t.setProperty(e,n);else{const i=gM(t,e);cu.test(n)?t.setProperty(Jn(i),n.replace(cu,""),"important"):t[i]=n}}const x0=["Webkit","Moz","ms"],Qf={};function gM(t,e){const n=Qf[e];if(n)return n;let i=Vt(e);if(i!=="filter"&&i in t)return Qf[e]=i;i=xo(i);for(let s=0;s<x0.length;s++){const r=x0[s]+i;if(r in t)return Qf[e]=r}return e}function _M(t,e,n,i){return t.tagName==="TEXTAREA"&&(e==="width"||e==="height")&&Qe(i)&&n===i}const y0="http://www.w3.org/1999/xlink";function E0(t,e,n,i,s,r=Yy(e)){i&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(y0,e.slice(6,e.length)):t.setAttributeNS(y0,e,n):n==null||r&&!sf(n)?t.removeAttribute(e):t.setAttribute(e,r?"":$n(n)?String(n):n)}function S0(t,e,n,i,s){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?Wv(n):n);return}const r=t.tagName;if(e==="value"&&r!=="PROGRESS"&&!r.includes("-")){const a=r==="OPTION"?t.getAttribute("value")||"":t.value,l=n==null?t.type==="checkbox"?"on":"":String(n);(a!==l||!("_value"in t))&&(t.value=l),n==null&&t.removeAttribute(e),t._value=n;return}let o=!1;if(n===""||n==null){const a=typeof t[e];a==="boolean"?n=sf(n):n==null&&a==="string"?(n="",o=!0):a==="number"&&(n=0,o=!0)}try{t[e]=n}catch{}o&&t.removeAttribute(s||e)}function Ws(t,e,n,i){t.addEventListener(e,n,i)}function vM(t,e,n,i){t.removeEventListener(e,n,i)}const b0=Symbol("_vei");function xM(t,e,n,i,s=null){const r=t[b0]||(t[b0]={}),o=r[e];if(i&&o)o.value=i;else{const[a,l]=SM(e);if(i){const u=r[e]=AM(i,s);Ws(t,a,u,l)}else o&&(vM(t,a,o,l),r[e]=void 0)}}const yM=/(Once|Passive|Capture)$/,EM=/^on:?(?:Once|Passive|Capture)$/;function SM(t){let e,n;for(;(n=t.match(yM))&&!EM.test(t);)e||(e={}),t=t.slice(0,t.length-n[1].length),e[n[1].toLowerCase()]=!0;return[t[2]===":"?t.slice(3):Jn(t.slice(2)),e]}let eh=0;const bM=Promise.resolve(),MM=()=>eh||(bM.then(()=>eh=0),eh=Date.now());function AM(t,e){const n=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=n.attached)return;const s=n.value;if(Ue(s)){const r=i.stopImmediatePropagation;i.stopImmediatePropagation=()=>{r.call(i),i._stopped=!0};const o=s.slice(),a=[i];for(let l=0;l<o.length&&!i._stopped;l++){const u=o[l];u&&Si(u,e,5,a)}}else Si(s,e,5,[i])};return n.value=t,n.attached=MM(),n}const M0=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,jv=(t,e,n,i,s,r)=>{const o=s==="svg";e==="class"?fM(t,i,o):e==="style"?mM(t,n,i):vo(e)?jc(e)||xM(t,e,n,i,r):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):TM(t,e,i,o))?(S0(t,e,i),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&E0(t,e,i,o,r,e!=="value")):t._isVueCE&&(wM(t,e)||t._def.__asyncLoader&&(/[A-Z]/.test(e)||!Qe(i)))?S0(t,Vt(e),i,r,e):(e==="true-value"?t._trueValue=i:e==="false-value"&&(t._falseValue=i),E0(t,e,i,o))};function TM(t,e,n,i){if(i)return!!(e==="innerHTML"||e==="textContent"||e in t&&M0(e)&&it(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&t.tagName==="IFRAME"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return M0(e)&&Qe(n)?!1:e in t}function wM(t,e){const n=t._def.props;if(!n)return!1;const i=Vt(e);return Array.isArray(n)?n.some(s=>Vt(s)===i):Object.keys(n).some(s=>Vt(s)===i)}const A0={};function Qv(t,e,n){let i=gf(t,e);Qc(i)&&(i=_t({},i,e));class s extends Sf{constructor(o){super(i,o,n)}}return s.def=i,s}const CM=((t,e)=>Qv(t,e,hx)),RM=typeof HTMLElement<"u"?HTMLElement:class{};class Sf extends RM{constructor(e,n={},i=Tc){super(),this._def=e,this._props=n,this._createApp=i,this._isVueCE=!0,this._instance=null,this._app=null,this._nonce=this._def.nonce,this._connected=!1,this._resolved=!1,this._patching=!1,this._dirty=!1,this._numberProps=null,this._styleChildren=new WeakSet,this._styleAnchors=new WeakMap,this._ob=null,this.shadowRoot&&i!==Tc?this._root=this.shadowRoot:e.shadowRoot!==!1?(this.attachShadow(_t({},e.shadowRootOptions,{mode:"open"})),this._root=this.shadowRoot):this._root=this}connectedCallback(){if(!this.isConnected)return;!this.shadowRoot&&!this._resolved&&this._parseSlots(),this._connected=!0;let e=this;for(;e=e&&(e.assignedSlot||e.parentNode||e.host);)if(e instanceof Sf){this._parent=e;break}this._instance||(this._resolved?this._mount(this._def):e&&e._pendingResolve?this._pendingResolve=e._pendingResolve.then(()=>{if(this._pendingResolve=void 0,this.isConnected)return this._resolveDef()}):this._resolveDef())}_setParent(e=this._parent){e&&(this._instance.parent=e._instance,this._inheritParentContext(e))}_inheritParentContext(e=this._parent){e&&this._app&&Object.setPrototypeOf(this._app._context.provides,e._instance.provides)}disconnectedCallback(){this._connected=!1,ff(()=>{this._connected||(this._ob&&(this._ob.disconnect(),this._ob=null),this._app&&this._app.unmount(),this._instance&&(this._instance.ce=void 0),this._app=this._instance=null,this._teleportTargets&&(this._teleportTargets.clear(),this._teleportTargets=void 0))})}_processMutations(e){for(const n of e)this._setAttr(n.attributeName)}_resolveDef(){if(this._pendingResolve)return this._pendingResolve;for(let i=0;i<this.attributes.length;i++)this._setAttr(this.attributes[i].name);this._ob=new MutationObserver(this._processMutations.bind(this)),this._ob.observe(this,{attributes:!0});const e=(i,s=!1)=>{this._resolved=!0,this._pendingResolve=void 0;const{props:r,styles:o}=i;let a;if(r&&!Ue(r))for(const l in r){const u=r[l];(u===Number||u&&u.type===Number)&&(l in this._props&&(this._props[l]=rc(this._props[l])),(a||(a=Object.create(null)))[Vt(l)]=!0)}this._numberProps=a,this._resolveProps(i),this.shadowRoot&&this._applyStyles(o),this._mount(i)},n=this._def.__asyncLoader;if(n)return this._pendingResolve=n().then(i=>{i.configureApp=this._def.configureApp,e(this._def=i,!0)}),this._pendingResolve;e(this._def)}_mount(e){__VUE_PROD_DEVTOOLS__&&!e.name&&(e.name="VueElement"),this._app=this._createApp(e),this._inheritParentContext(),e.configureApp&&e.configureApp(this._app),this._app._ceVNode=this._createVNode(),this._app.mount(this._root);const n=this._instance&&this._instance.exposed;if(n)for(const i in n)Lt(this,i)||Object.defineProperty(this,i,{get:()=>Ol(n[i])})}_resolveProps(e){const{props:n}=e,i=Ue(n)?n:Object.keys(n||{});for(const s of Object.keys(this))s[0]!=="_"&&i.includes(s)&&this._setProp(s,this[s]);for(const s of i.map(Vt))Object.defineProperty(this,s,{get(){return this._getProp(s)},set(r){this._setProp(s,r,!0,!this._patching)}})}_setAttr(e){if(e.startsWith("data-v-"))return;const n=this.hasAttribute(e);let i=n?this.getAttribute(e):A0;const s=Vt(e);n&&this._numberProps&&this._numberProps[s]&&(i=rc(i)),this._setProp(s,i,!1,!0)}_getProp(e){return this._props[e]}_setProp(e,n,i=!0,s=!1){if(n!==this._props[e]&&(this._dirty=!0,n===A0?delete this._props[e]:(this._props[e]=n,e==="key"&&this._app&&(this._app._ceVNode.key=n)),s&&this._instance&&this._update(),i)){const r=this._ob;r&&(this._processMutations(r.takeRecords()),r.disconnect()),n===!0?this.setAttribute(Jn(e),""):typeof n=="string"||typeof n=="number"?this.setAttribute(Jn(e),n+""):n||this.removeAttribute(Jn(e)),r&&r.observe(this,{attributes:!0})}}_update(){const e=this._createVNode();this._app&&(e.appContext=this._app._context),fx(e,this._root)}_createVNode(){const e={};this.shadowRoot||(e.onVnodeMounted=e.onVnodeUpdated=this._renderSlots.bind(this));const n=jt(this._def,_t(e,this._props));return this._instance||(n.ce=i=>{this._instance=i,i.ce=this,i.isCE=!0;const s=(r,o)=>{this.dispatchEvent(new CustomEvent(r,Qc(o[0])?_t({detail:o},o[0]):{detail:o}))};i.emit=(r,...o)=>{s(r,o),Jn(r)!==r&&s(Jn(r),o)},this._setParent()}),n}_applyStyles(e,n,i){if(!e)return;if(n){if(n===this._def||this._styleChildren.has(n))return;this._styleChildren.add(n)}const s=this._nonce,r=this.shadowRoot,o=i?this._getStyleAnchor(i)||this._getStyleAnchor(this._def):this._getRootStyleInsertionAnchor(r);let a=null;for(let l=e.length-1;l>=0;l--){const u=document.createElement("style");s&&u.setAttribute("nonce",s),u.textContent=e[l],r.insertBefore(u,a||o),a=u,l===0&&(i||this._styleAnchors.set(this._def,u),n&&this._styleAnchors.set(n,u))}}_getStyleAnchor(e){if(!e)return null;const n=this._styleAnchors.get(e);return n&&n.parentNode===this.shadowRoot?n:(n&&this._styleAnchors.delete(e),null)}_getRootStyleInsertionAnchor(e){for(let n=0;n<e.childNodes.length;n++){const i=e.childNodes[n];if(!(i instanceof HTMLStyleElement))return i}return null}_parseSlots(){const e=this._slots={};let n;for(;n=this.firstChild;){const i=n.nodeType===1&&n.getAttribute("slot")||"default";(e[i]||(e[i]=[])).push(n),this.removeChild(n)}}_renderSlots(){const e=this._getSlots(),n=this._instance.type.__scopeId;for(let i=0;i<e.length;i++){const s=e[i],r=s.getAttribute("name")||"default",o=this._slots[r],a=s.parentNode;if(o)for(const l of o){if(n&&l.nodeType===1){const u=n+"-s",c=document.createTreeWalker(l,1);l.setAttribute(u,"");let f;for(;f=c.nextNode();)f.setAttribute(u,"")}a.insertBefore(l,s)}else for(;s.firstChild;)a.insertBefore(s.firstChild,s);a.removeChild(s)}}_getSlots(){const e=[this];this._teleportTargets&&e.push(...this._teleportTargets);const n=new Set;for(const i of e){const s=i.querySelectorAll("slot");for(let r=0;r<s.length;r++)n.add(s[r])}return Array.from(n)}_injectChildStyle(e,n){this._applyStyles(e.styles,e,n)}_beginPatch(){this._patching=!0,this._dirty=!1}_endPatch(){this._patching=!1,this._dirty&&this._instance&&this._update()}_hasShadowRoot(){return this._def.shadowRoot!==!1}_removeChildStyle(e){}}function ex(t){const e=Qn(),n=e&&e.ce;return n||null}function FM(){const t=ex();return t&&t.shadowRoot}function DM(t="$style"){{const e=Qn();if(!e)return yt;const n=e.type.__cssModules;if(!n)return yt;const i=n[t];return i||yt}}const tx=new WeakMap,nx=new WeakMap,Mc=Symbol("_moveCb"),T0=Symbol("_enterCb"),PM=t=>(delete t.props.mode,t),IM=PM({name:"TransitionGroup",props:_t({},qv,{tag:String,moveClass:String}),setup(t,{slots:e}){const n=Qn(),i=Mp();let s,r;return vf(()=>{if(!s.length)return;const o=t.moveClass||`${t.name||"v"}-move`;if(!OM(s[0].el,n.vnode.el,o)){s=[];return}s.forEach(NM),s.forEach(BM);const a=s.filter(UM);ld(n.vnode.el),a.forEach(l=>{const u=l.el,c=u.style;ls(u,o),c.transform=c.webkitTransform=c.transitionDuration="";const f=u[Mc]=h=>{h&&h.target!==u||(!h||h.propertyName.endsWith("transform"))&&(u.removeEventListener("transitionend",f),u[Mc]=null,xr(u,o))};u.addEventListener("transitionend",f)}),s=[]}),()=>{const o=nt(t),a=Yv(o);let l=o.tag||pn;if(s=[],r)for(let u=0;u<r.length;u++){const c=r[u];c.el&&c.el instanceof Element&&!c.el[Op]&&(s.push(c),ir(c,oa(c,a,i,n)),tx.set(c,ix(c.el)))}r=e.default?mf(e.default()):[];for(let u=0;u<r.length;u++){const c=r[u];c.key!=null&&ir(c,oa(c,a,i,n))}return jt(l,null,r)}}}),LM=IM;function NM(t){const e=t.el;e[Mc]&&e[Mc](),e[T0]&&e[T0]()}function BM(t){nx.set(t,ix(t.el))}function UM(t){const e=tx.get(t),n=nx.get(t),i=e.left-n.left,s=e.top-n.top;if(i||s){const r=t.el,o=r.style,a=r.getBoundingClientRect();let l=1,u=1;return r.offsetWidth&&(l=a.width/r.offsetWidth),r.offsetHeight&&(u=a.height/r.offsetHeight),(!Number.isFinite(l)||l===0)&&(l=1),(!Number.isFinite(u)||u===0)&&(u=1),Math.abs(l-1)<.01&&(l=1),Math.abs(u-1)<.01&&(u=1),o.transform=o.webkitTransform=`translate(${i/l}px,${s/u}px)`,o.transitionDuration="0s",t}}function ix(t){const e=t.getBoundingClientRect();return{left:e.left,top:e.top}}function OM(t,e,n){const i=t.cloneNode(),s=t[aa];s&&s.forEach(a=>{a.split(/\s+/).forEach(l=>l&&i.classList.remove(l))}),n.split(/\s+/).forEach(a=>a&&i.classList.add(a)),i.style.display="none";const r=e.nodeType===1?e:e.parentNode;r.appendChild(i);const{hasTransform:o}=Kv(i);return r.removeChild(i),o}const Pr=t=>{const e=t.props["onUpdate:modelValue"]||!1;return Ue(e)?n=>Jo(e,n):e};function kM(t){t.target.composing=!0}function w0(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const yi=Symbol("_assign"),fu=Symbol("_initialValue");function th(t,e,n){return e&&(t=t.trim()),n&&(t=nf(t)),t}const Ac={created(t,{modifiers:{lazy:e,trim:n,number:i}},s){t.parentNode&&(t.type==="text"?t[fu]=t.defaultValue.replace(/[\r\n]/g,""):t.type==="textarea"&&(t[fu]=t.defaultValue.replace(/\r\n?/g,`
`))),t[yi]=Pr(s);const r=i||s.props&&s.props.type==="number";Ws(t,e?"change":"input",o=>{o.target.composing||t[yi](th(t.value,n,r))}),(n||r)&&Ws(t,"change",()=>{t.value=th(t.value,n,r)}),e||(Ws(t,"compositionstart",kM),Ws(t,"compositionend",w0),Ws(t,"change",w0))},mounted(t,{value:e,modifiers:{trim:n,number:i}}){const s=e??"",r=t[fu];delete t[fu],r!==void 0&&(t.type==="text"||t.type==="textarea")&&t.value!==r?t[yi](th(t.value,n,i)):t.value=s},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:i,trim:s,number:r}},o){if(t[yi]=Pr(o),t.composing)return;const a=(r||t.type==="number")&&!/^0\d/.test(t.value)?nf(t.value):t.value,l=e??"";if(a===l)return;const u=t.getRootNode();(u instanceof Document||u instanceof ShadowRoot)&&u.activeElement===t&&t.type!=="range"&&(i&&e===n||s&&t.value.trim()===l)||(t.value=l)}},kp={deep:!0,created(t,e,n){t[yi]=Pr(n),Ws(t,"change",()=>{const i=t._modelValue,s=la(t),r=t.checked,o=t[yi];if(Ue(i)){const a=rf(i,s),l=a!==-1;if(r&&!l)o(i.concat(s));else if(!r&&l){const u=[...i];u.splice(a,1),o(u)}}else if(Ss(i)){const a=new Set(i);r?a.add(s):a.delete(s),o(a)}else o(rx(t,r))})},mounted:C0,beforeUpdate(t,e,n){t[yi]=Pr(n),C0(t,e,n)}};function C0(t,{value:e,oldValue:n},i){t._modelValue=e;let s;if(Ue(e))s=rf(e,i.props.value)>-1;else if(Ss(e))s=e.has(i.props.value);else{if(e===n)return;s=Ui(e,rx(t,!0))}t.checked!==s&&(t.checked=s)}const zp={created(t,{value:e},n){t.checked=Ui(e,n.props.value),t[yi]=Pr(n),Ws(t,"change",()=>{t[yi](la(t))})},beforeUpdate(t,{value:e,oldValue:n},i){t[yi]=Pr(i),e!==n&&(t.checked=Ui(e,i.props.value))}},sx={deep:!0,created(t,{value:e,modifiers:{number:n}},i){t._modelValue=e,Ws(t,"change",()=>{const s=Array.prototype.filter.call(t.options,l=>l.selected).map(l=>n?nf(la(l)):la(l)),r=t.multiple,o=r?Ss(t._modelValue)?new Set(s):s:s[0],a=t._pendingValue=[r,r?Ue(o)?s.slice():s:o];try{t[yi](o)}finally{ff(()=>{t._pendingValue===a&&(t._pendingValue=void 0)})}}),t[yi]=Pr(i)},mounted(t,{value:e}){R0(t,e)},beforeUpdate(t,{value:e},n){t._modelValue=e,t[yi]=Pr(n)},updated(t,{value:e}){const n=t._pendingValue;t._pendingValue=void 0,(!n||n[0]!==t.multiple||!zM(e,n[1],n[0]))&&R0(t,e)}};function zM(t,e,n){if(!n||Ue(t))return Ui(t,e);if(Ss(t)){if(t.size!==e.length)return!1;for(const i of e)if(!t.has(i))return!1;return!0}return!1}function R0(t,e){const n=t.multiple,i=Ue(e);if(!(n&&!i&&!Ss(e))){for(let s=0,r=t.options.length;s<r;s++){const o=t.options[s],a=la(o);if(n)if(i){const l=typeof a;l==="string"||l==="number"?o.selected=e.some(u=>String(u)===String(a)):o.selected=rf(e,a)>-1}else o.selected=e.has(a);else if(Ui(la(o),e)){t.selectedIndex!==s&&(t.selectedIndex=s);return}}!n&&t.selectedIndex!==-1&&(t.selectedIndex=-1)}}function la(t){return"_value"in t?t._value:t.value}function rx(t,e){const n=e?"_trueValue":"_falseValue";return n in t?t[n]:e}const ox={created(t,e,n){hu(t,e,n,null,"created")},mounted(t,e,n){hu(t,e,n,null,"mounted")},beforeUpdate(t,e,n,i){hu(t,e,n,i,"beforeUpdate")},updated(t,e,n,i){hu(t,e,n,i,"updated")}};function ax(t,e){switch(t){case"SELECT":return sx;case"TEXTAREA":return Ac;default:switch(e){case"checkbox":return kp;case"radio":return zp;default:return Ac}}}function hu(t,e,n,i,s){const o=ax(t.tagName,n.props&&n.props.type)[s];o&&o(t,e,n,i)}function VM(){Ac.getSSRProps=({value:t})=>({value:t}),zp.getSSRProps=({value:t},e)=>{if(e.props&&Ui(e.props.value,t))return{checked:!0}},kp.getSSRProps=({value:t},e)=>{if(Ue(t)){if(e.props&&rf(t,e.props.value)>-1)return{checked:!0}}else if(Ss(t)){if(e.props&&t.has(e.props.value))return{checked:!0}}else if(t)return{checked:!0}},ox.getSSRProps=(t,e)=>{if(typeof e.type!="string")return;const n=ax(e.type.toUpperCase(),e.props&&e.props.type);if(n.getSSRProps)return n.getSSRProps(t,e)}}const HM=["ctrl","shift","alt","meta"],GM={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>HM.some(n=>t[`${n}Key`]&&!e.includes(n))},WM=(t,e)=>{if(!t)return t;const n=t._withMods||(t._withMods={}),i=e.join(".");return n[i]||(n[i]=((s,...r)=>{for(let o=0;o<e.length;o++){const a=GM[e[o]];if(a&&a(s,e))return}return t(s,...r)}))},$M={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},XM=(t,e)=>{const n=t._withKeys||(t._withKeys={}),i=e.join(".");return n[i]||(n[i]=(s=>{if(!("key"in s))return;const r=Jn(s.key);if(e.some(o=>o===r||$M[o]===r))return t(s)}))},lx=_t({patchProp:jv},$v);let sl,F0=!1;function ux(){return sl||(sl=bv(lx))}function cx(){return sl=F0?sl:Mv(lx),F0=!0,sl}const fx=((...t)=>{ux().render(...t)}),qM=((...t)=>{cx().hydrate(...t)}),Tc=((...t)=>{const e=ux().createApp(...t),{mount:n}=e;return e.mount=i=>{const s=px(i);if(!s)return;const r=e._component;!it(r)&&!r.render&&!r.template&&(r.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const o=n(s,!1,dx(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e}),hx=((...t)=>{const e=cx().createApp(...t),{mount:n}=e;return e.mount=i=>{const s=px(i);if(s)return n(s,!0,dx(s))},e});function dx(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function px(t){return Qe(t)?document.querySelector(t):t}let D0=!1;const YM=()=>{D0||(D0=!0,VM(),hM())},KM=Object.freeze(Object.defineProperty({__proto__:null,BaseTransition:Z_,BaseTransitionPropsValidators:Ap,Comment:nn,DeprecationTypes:sM,EffectScope:mp,ErrorCodes:XE,ErrorTypeStrings:Jb,Fragment:pn,KeepAlive:US,ReactiveEffect:cl,Static:Js,Suspense:Fb,Teleport:hS,Text:Zs,TrackOpTypes:NE,Transition:lM,TransitionGroup:LM,TriggerOpTypes:BE,VueElement:Sf,assertNumber:$E,callWithAsyncErrorHandling:Si,callWithErrorHandling:yo,camelize:Vt,capitalize:xo,cloneVNode:As,compatUtils:iM,computed:ht,createApp:Tc,createBlock:_c,createCommentVNode:Lv,createElementBlock:Bb,createElementVNode:Bp,createHydrationRenderer:Mv,createPropsRestProxy:rb,createRenderer:bv,createSSRApp:hx,createSlots:WS,createStaticVNode:kb,createTextVNode:Up,createVNode:jt,customRef:L_,defineAsyncComponent:NS,defineComponent:gf,defineCustomElement:Qv,defineEmits:KS,defineExpose:ZS,defineModel:QS,defineOptions:JS,defineProps:YS,defineSSRCustomElement:CM,defineSlots:jS,devtools:jb,effect:sE,effectScope:tE,getCurrentInstance:Qn,getCurrentScope:p_,getCurrentWatcher:UE,getTransitionRawChildren:mf,guardReactiveProps:Iv,h:Sr,handleError:Eo,hasInjectionContext:rS,hydrate:qM,hydrateOnIdle:RS,hydrateOnInteraction:IS,hydrateOnMediaQuery:PS,hydrateOnVisible:DS,initCustomFormatter:Yb,initDirectivesForSSR:YM,inject:tl,isMemoSame:Gv,isProxy:Ul,isReactive:xs,isReadonly:ts,isRef:an,isRuntimeOnly:Gb,isShallow:hi,isVNode:sr,markRaw:D_,mergeDefaults:ib,mergeModels:sb,mergeProps:Nv,nextTick:ff,nodeOps:$v,normalizeClass:va,normalizeProps:ky,normalizeStyle:_a,onActivated:ev,onBeforeMount:iv,onBeforeUnmount:Vl,onBeforeUpdate:Cp,onDeactivated:tv,onErrorCaptured:av,onMounted:So,onRenderTracked:ov,onRenderTriggered:rv,onScopeDispose:nE,onServerPrefetch:sv,onUnmounted:xa,onUpdated:vf,onWatcherCleanup:B_,openBlock:vl,patchProp:jv,popScopeId:nS,provide:H_,proxyRefs:xp,pushScopeId:tS,queuePostFlushCb:dl,reactive:uf,readonly:ac,ref:st,registerRuntimeCompiler:kv,render:fx,renderList:GS,renderSlot:$S,resolveComponent:zS,resolveDirective:HS,resolveDynamicComponent:VS,resolveFilter:nM,resolveTransitionHooks:oa,setBlockTracking:xl,setDevtoolsHook:Qb,setTransitionHooks:ir,shallowReactive:F_,shallowReadonly:bE,shallowRef:P_,ssrContextKey:G_,ssrUtils:tM,stop:rE,toDisplayString:f_,toHandlerKey:Zo,toHandlers:XS,toRaw:nt,toRef:PE,toRefs:RE,toValue:TE,transformVNodeArgs:Ub,triggerRef:AE,unref:Ol,useAttrs:nb,useCssModule:DM,useCssVars:dM,useHost:ex,useId:pS,useModel:pb,useSSRContext:W_,useShadowRoot:FM,useSlots:tb,useTemplateRef:mS,useTransitionState:Mp,vModelCheckbox:kp,vModelDynamic:ox,vModelRadio:zp,vModelSelect:sx,vModelText:Ac,vShow:Zv,version:od,warn:Zb,watch:ro,watchEffect:oS,watchPostEffect:aS,watchSyncEffect:$_,withAsyncContext:ob,withCtx:bp,withDefaults:eb,withDirectives:sS,withKeys:XM,withMemo:Kb,withModifiers:WM,withScopeId:iS},Symbol.toStringTag,{value:"Module"}));/**
* @vue/compiler-core v3.5.43
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/const El=Symbol(""),rl=Symbol(""),Vp=Symbol(""),wc=Symbol(""),mx=Symbol(""),ho=Symbol(""),gx=Symbol(""),_x=Symbol(""),Hp=Symbol(""),Gp=Symbol(""),Gl=Symbol(""),Wp=Symbol(""),vx=Symbol(""),$p=Symbol(""),Xp=Symbol(""),qp=Symbol(""),Yp=Symbol(""),Kp=Symbol(""),Zp=Symbol(""),xx=Symbol(""),yx=Symbol(""),bf=Symbol(""),Cc=Symbol(""),Jp=Symbol(""),jp=Symbol(""),Sl=Symbol(""),Wl=Symbol(""),Qp=Symbol(""),cd=Symbol(""),ZM=Symbol(""),fd=Symbol(""),Rc=Symbol(""),JM=Symbol(""),jM=Symbol(""),em=Symbol(""),QM=Symbol(""),e2=Symbol(""),tm=Symbol(""),Ex=Symbol(""),ua={[El]:"Fragment",[rl]:"Teleport",[Vp]:"Suspense",[wc]:"KeepAlive",[mx]:"BaseTransition",[ho]:"openBlock",[gx]:"createBlock",[_x]:"createElementBlock",[Hp]:"createVNode",[Gp]:"createElementVNode",[Gl]:"createCommentVNode",[Wp]:"createTextVNode",[vx]:"createStaticVNode",[$p]:"resolveComponent",[Xp]:"resolveDynamicComponent",[qp]:"resolveDirective",[Yp]:"resolveFilter",[Kp]:"withDirectives",[Zp]:"renderList",[xx]:"renderSlot",[yx]:"createSlots",[bf]:"toDisplayString",[Cc]:"mergeProps",[Jp]:"normalizeClass",[jp]:"normalizeStyle",[Sl]:"normalizeProps",[Wl]:"guardReactiveProps",[Qp]:"toHandlers",[cd]:"camelize",[ZM]:"capitalize",[fd]:"toHandlerKey",[Rc]:"setBlockTracking",[JM]:"pushScopeId",[jM]:"popScopeId",[em]:"withCtx",[QM]:"unref",[e2]:"isRef",[tm]:"withMemo",[Ex]:"isMemoSame"};function t2(t){Object.getOwnPropertySymbols(t).forEach(e=>{ua[e]=t[e]})}const bi={start:{line:1,column:1,offset:0},end:{line:1,column:1,offset:0},source:""};function n2(t,e=""){return{type:0,source:e,children:t,helpers:new Set,components:[],directives:[],hoists:[],imports:[],cached:[],temps:0,codegenNode:void 0,loc:bi}}function bl(t,e,n,i,s,r,o,a=!1,l=!1,u=!1,c=bi){return t&&(a?(t.helper(ho),t.helper(ha(t.inSSR,u))):t.helper(fa(t.inSSR,u)),o&&t.helper(Kp)),{type:13,tag:e,props:n,children:i,patchFlag:s,dynamicProps:r,directives:o,isBlock:a,disableTracking:l,isComponent:u,loc:c}}function ao(t,e=bi){return{type:17,loc:e,elements:t}}function Li(t,e=bi){return{type:15,loc:e,properties:t}}function fn(t,e){return{type:16,loc:bi,key:Qe(t)?pt(t,!0):t,value:e}}function pt(t,e=!1,n=bi,i=0){return{type:4,loc:n,content:t,isStatic:e,constType:e?3:i}}function ji(t,e=bi){return{type:8,loc:e,children:t}}function mn(t,e=[],n=bi){return{type:14,loc:n,callee:t,arguments:e}}function ca(t,e=void 0,n=!1,i=!1,s=bi){return{type:18,params:t,returns:e,newline:n,isSlot:i,loc:s}}function hd(t,e,n,i=!0){return{type:19,test:t,consequent:e,alternate:n,newline:i,loc:bi}}function i2(t,e,n=!1,i=!1){return{type:20,index:t,value:e,needPauseTracking:n,inVOnce:i,needArraySpread:!1,loc:bi}}function s2(t){return{type:21,body:t,loc:bi}}function fa(t,e){return t||e?Hp:Gp}function ha(t,e){return t||e?gx:_x}function nm(t,{helper:e,removeHelper:n,inSSR:i}){t.isBlock||(t.isBlock=!0,n(fa(i,t.isComponent)),e(ho),e(ha(i,t.isComponent)))}const P0=new Uint8Array([123,123]),I0=new Uint8Array([125,125]);function L0(t){return t>=97&&t<=122||t>=65&&t<=90}function vi(t){return t===32||t===10||t===9||t===12||t===13}function cr(t){return t===47||t===62||vi(t)}function Fc(t){const e=new Uint8Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.charCodeAt(n);return e}const Ln={Cdata:new Uint8Array([67,68,65,84,65,91]),CdataEnd:new Uint8Array([93,93,62]),CommentEnd:new Uint8Array([45,45,62]),ScriptEnd:new Uint8Array([60,47,115,99,114,105,112,116]),StyleEnd:new Uint8Array([60,47,115,116,121,108,101]),TitleEnd:new Uint8Array([60,47,116,105,116,108,101]),TextareaEnd:new Uint8Array([60,47,116,101,120,116,97,114,101,97])};class r2{constructor(e,n){this.stack=e,this.cbs=n,this.state=1,this.buffer="",this.sectionStart=0,this.index=0,this.entityStart=0,this.baseState=1,this.inRCDATA=!1,this.inXML=!1,this.inVPre=!1,this.newlines=[],this.mode=0,this.delimiterOpen=P0,this.delimiterClose=I0,this.delimiterIndex=-1,this.currentSequence=void 0,this.sequenceIndex=0}get inSFCRoot(){return this.mode===2&&this.stack.length===0}reset(){this.state=1,this.mode=0,this.buffer="",this.sectionStart=0,this.index=0,this.baseState=1,this.inRCDATA=!1,this.currentSequence=void 0,this.newlines.length=0,this.delimiterOpen=P0,this.delimiterClose=I0}getPos(e){let n=1,i=e+1;const s=this.newlines.length;let r=-1;if(s>100){let o=-1,a=s;for(;o+1<a;){const l=o+a>>>1;this.newlines[l]<e?o=l:a=l}r=o}else for(let o=s-1;o>=0;o--)if(e>this.newlines[o]){r=o;break}return r>=0&&(n=r+2,i=e-this.newlines[r]),{column:i,line:n,offset:e}}peek(){return this.buffer.charCodeAt(this.index+1)}stateText(e){e===60?(this.index>this.sectionStart&&this.cbs.ontext(this.sectionStart,this.index),this.state=5,this.sectionStart=this.index):!this.inVPre&&e===this.delimiterOpen[0]&&(this.state=2,this.delimiterIndex=0,this.stateInterpolationOpen(e))}stateInterpolationOpen(e){if(e===this.delimiterOpen[this.delimiterIndex])if(this.delimiterIndex===this.delimiterOpen.length-1){const n=this.index+1-this.delimiterOpen.length;n>this.sectionStart&&this.cbs.ontext(this.sectionStart,n),this.state=3,this.sectionStart=n}else this.delimiterIndex++;else this.inRCDATA?(this.state=32,this.stateInRCDATA(e)):(this.state=1,this.stateText(e))}stateInterpolation(e){e===this.delimiterClose[0]&&(this.state=4,this.delimiterIndex=0,this.stateInterpolationClose(e))}stateInterpolationClose(e){e===this.delimiterClose[this.delimiterIndex]?this.delimiterIndex===this.delimiterClose.length-1?(this.cbs.oninterpolation(this.sectionStart,this.index+1),this.inRCDATA?this.state=32:this.state=1,this.sectionStart=this.index+1):this.delimiterIndex++:(this.state=3,this.stateInterpolation(e))}stateSpecialStartSequence(e){const n=this.sequenceIndex===this.currentSequence.length;if(!(n?cr(e):(e|32)===this.currentSequence[this.sequenceIndex]))this.inRCDATA=!1;else if(!n){this.sequenceIndex++;return}this.sequenceIndex=0,this.state=6,this.stateInTagName(e)}stateInRCDATA(e){if(this.sequenceIndex===this.currentSequence.length){if(e===62||vi(e)){const n=this.index-this.currentSequence.length;if(this.sectionStart<n){const i=this.index;this.index=n,this.cbs.ontext(this.sectionStart,n),this.index=i}this.sectionStart=n+2,this.stateInClosingTagName(e),this.inRCDATA=!1;return}this.sequenceIndex=0}(e|32)===this.currentSequence[this.sequenceIndex]?this.sequenceIndex+=1:this.sequenceIndex===0?this.currentSequence===Ln.TitleEnd||this.currentSequence===Ln.TextareaEnd&&!this.inSFCRoot?!this.inVPre&&e===this.delimiterOpen[0]&&(this.state=2,this.delimiterIndex=0,this.stateInterpolationOpen(e)):this.fastForwardTo(60)&&(this.sequenceIndex=1):this.sequenceIndex=+(e===60)}stateCDATASequence(e){e===Ln.Cdata[this.sequenceIndex]?++this.sequenceIndex===Ln.Cdata.length&&(this.state=28,this.currentSequence=Ln.CdataEnd,this.sequenceIndex=0,this.sectionStart=this.index+1):(this.sequenceIndex=0,this.state=23,this.stateInDeclaration(e))}fastForwardTo(e){for(;++this.index<this.buffer.length;){const n=this.buffer.charCodeAt(this.index);if(n===10&&this.newlines.push(this.index),n===e)return!0}return this.index=this.buffer.length-1,!1}stateInCommentLike(e){e===this.currentSequence[this.sequenceIndex]?++this.sequenceIndex===this.currentSequence.length&&(this.currentSequence===Ln.CdataEnd?this.cbs.oncdata(this.sectionStart,this.index-2):this.cbs.oncomment(this.sectionStart,this.index-2),this.sequenceIndex=0,this.sectionStart=this.index+1,this.state=1):this.sequenceIndex===0?this.fastForwardTo(this.currentSequence[0])&&(this.sequenceIndex=1):e!==this.currentSequence[this.sequenceIndex-1]&&(this.sequenceIndex=0)}startSpecial(e,n){this.enterRCDATA(e,n),this.state=31}enterRCDATA(e,n){this.inRCDATA=!0,this.currentSequence=e,this.sequenceIndex=n}stateBeforeTagName(e){e===33?(this.state=22,this.sectionStart=this.index+1):e===63?(this.state=24,this.sectionStart=this.index+1):L0(e)?(this.sectionStart=this.index,this.mode===0?this.state=6:this.inSFCRoot?this.state=34:this.inXML?this.state=6:e===116?this.state=30:this.state=e===115?29:6):e===47?this.state=8:(this.state=1,this.stateText(e))}stateInTagName(e){cr(e)&&this.handleTagName(e)}stateInSFCRootTagName(e){if(cr(e)){const n=this.buffer.slice(this.sectionStart,this.index);n!=="template"&&this.enterRCDATA(Fc("</"+n),0),this.handleTagName(e)}}handleTagName(e){this.cbs.onopentagname(this.sectionStart,this.index),this.sectionStart=-1,this.state=11,this.stateBeforeAttrName(e)}stateBeforeClosingTagName(e){vi(e)||(e===62?(this.state=1,this.sectionStart=this.index+1):(this.state=L0(e)?9:27,this.sectionStart=this.index))}stateInClosingTagName(e){(e===62||vi(e))&&(this.cbs.onclosetag(this.sectionStart,this.index),this.sectionStart=-1,this.state=10,this.stateAfterClosingTagName(e))}stateAfterClosingTagName(e){e===62&&(this.state=1,this.sectionStart=this.index+1)}stateBeforeAttrName(e){e===62?(this.cbs.onopentagend(this.index),this.inRCDATA?this.state=32:this.state=1,this.sectionStart=this.index+1):e===47?this.state=7:e===60&&this.peek()===47?(this.cbs.onopentagend(this.index),this.state=5,this.sectionStart=this.index):vi(e)||this.handleAttrStart(e)}handleAttrStart(e){e===118&&this.peek()===45?(this.state=13,this.sectionStart=this.index):e===46||e===58||e===64||e===35?(this.cbs.ondirname(this.index,this.index+1),this.state=14,this.sectionStart=this.index+1):(this.state=12,this.sectionStart=this.index)}stateInSelfClosingTag(e){e===62?(this.cbs.onselfclosingtag(this.index),this.state=1,this.sectionStart=this.index+1,this.inRCDATA=!1):vi(e)||(this.state=11,this.stateBeforeAttrName(e))}stateInAttrName(e){(e===61||cr(e))&&(this.cbs.onattribname(this.sectionStart,this.index),this.handleAttrNameEnd(e))}stateInDirName(e){e===61||cr(e)?(this.cbs.ondirname(this.sectionStart,this.index),this.handleAttrNameEnd(e)):e===58?(this.cbs.ondirname(this.sectionStart,this.index),this.state=14,this.sectionStart=this.index+1):e===46&&(this.cbs.ondirname(this.sectionStart,this.index),this.state=16,this.sectionStart=this.index+1)}stateInDirArg(e){e===61||cr(e)?(this.cbs.ondirarg(this.sectionStart,this.index),this.handleAttrNameEnd(e)):e===91?this.state=15:e===46&&(this.cbs.ondirarg(this.sectionStart,this.index),this.state=16,this.sectionStart=this.index+1)}stateInDynamicDirArg(e){e===93?this.state=14:(e===61||cr(e))&&(this.cbs.ondirarg(this.sectionStart,this.index+1),this.handleAttrNameEnd(e))}stateInDirModifier(e){e===61||cr(e)?(this.cbs.ondirmodifier(this.sectionStart,this.index),this.handleAttrNameEnd(e)):e===46&&(this.cbs.ondirmodifier(this.sectionStart,this.index),this.sectionStart=this.index+1)}handleAttrNameEnd(e){this.sectionStart=this.index,this.state=17,this.cbs.onattribnameend(this.index),this.stateAfterAttrName(e)}stateAfterAttrName(e){e===61?this.state=18:e===47||e===62?(this.cbs.onattribend(0,this.sectionStart),this.sectionStart=-1,this.state=11,this.stateBeforeAttrName(e)):vi(e)||(this.cbs.onattribend(0,this.sectionStart),this.handleAttrStart(e))}stateBeforeAttrValue(e){e===34?(this.state=19,this.sectionStart=this.index+1):e===39?(this.state=20,this.sectionStart=this.index+1):vi(e)||(this.sectionStart=this.index,this.state=21,this.stateInAttrValueNoQuotes(e))}handleInAttrValue(e,n){(e===n||this.fastForwardTo(n))&&(this.cbs.onattribdata(this.sectionStart,this.index),this.sectionStart=-1,this.cbs.onattribend(n===34?3:2,this.index+1),this.state=11)}stateInAttrValueDoubleQuotes(e){this.handleInAttrValue(e,34)}stateInAttrValueSingleQuotes(e){this.handleInAttrValue(e,39)}stateInAttrValueNoQuotes(e){vi(e)||e===62?(this.cbs.onattribdata(this.sectionStart,this.index),this.sectionStart=-1,this.cbs.onattribend(1,this.index),this.state=11,this.stateBeforeAttrName(e)):(e===39||e===60||e===61||e===96)&&this.cbs.onerr(18,this.index)}stateBeforeDeclaration(e){e===91?(this.state=26,this.sequenceIndex=0):this.state=e===45?25:23}stateInDeclaration(e){(e===62||this.fastForwardTo(62))&&(this.state=1,this.sectionStart=this.index+1)}stateInProcessingInstruction(e){(e===62||this.fastForwardTo(62))&&(this.cbs.onprocessinginstruction(this.sectionStart,this.index),this.state=1,this.sectionStart=this.index+1)}stateBeforeComment(e){e===45?(this.state=28,this.currentSequence=Ln.CommentEnd,this.sequenceIndex=2,this.sectionStart=this.index+1):this.state=23}stateInSpecialComment(e){(e===62||this.fastForwardTo(62))&&(this.cbs.oncomment(this.sectionStart,this.index),this.state=1,this.sectionStart=this.index+1)}stateBeforeSpecialS(e){e===Ln.ScriptEnd[3]?this.startSpecial(Ln.ScriptEnd,4):e===Ln.StyleEnd[3]?this.startSpecial(Ln.StyleEnd,4):(this.state=6,this.stateInTagName(e))}stateBeforeSpecialT(e){e===Ln.TitleEnd[3]?this.startSpecial(Ln.TitleEnd,4):e===Ln.TextareaEnd[3]?this.startSpecial(Ln.TextareaEnd,4):(this.state=6,this.stateInTagName(e))}startEntity(){}stateInEntity(){}parse(e){for(this.buffer=e;this.index<this.buffer.length;){const n=this.buffer.charCodeAt(this.index);switch(n===10&&this.state!==33&&this.newlines.push(this.index),this.state){case 1:{this.stateText(n);break}case 2:{this.stateInterpolationOpen(n);break}case 3:{this.stateInterpolation(n);break}case 4:{this.stateInterpolationClose(n);break}case 31:{this.stateSpecialStartSequence(n);break}case 32:{this.stateInRCDATA(n);break}case 26:{this.stateCDATASequence(n);break}case 19:{this.stateInAttrValueDoubleQuotes(n);break}case 12:{this.stateInAttrName(n);break}case 13:{this.stateInDirName(n);break}case 14:{this.stateInDirArg(n);break}case 15:{this.stateInDynamicDirArg(n);break}case 16:{this.stateInDirModifier(n);break}case 28:{this.stateInCommentLike(n);break}case 27:{this.stateInSpecialComment(n);break}case 11:{this.stateBeforeAttrName(n);break}case 6:{this.stateInTagName(n);break}case 34:{this.stateInSFCRootTagName(n);break}case 9:{this.stateInClosingTagName(n);break}case 5:{this.stateBeforeTagName(n);break}case 17:{this.stateAfterAttrName(n);break}case 20:{this.stateInAttrValueSingleQuotes(n);break}case 18:{this.stateBeforeAttrValue(n);break}case 8:{this.stateBeforeClosingTagName(n);break}case 10:{this.stateAfterClosingTagName(n);break}case 29:{this.stateBeforeSpecialS(n);break}case 30:{this.stateBeforeSpecialT(n);break}case 21:{this.stateInAttrValueNoQuotes(n);break}case 7:{this.stateInSelfClosingTag(n);break}case 23:{this.stateInDeclaration(n);break}case 22:{this.stateBeforeDeclaration(n);break}case 25:{this.stateBeforeComment(n);break}case 24:{this.stateInProcessingInstruction(n);break}case 33:{this.stateInEntity();break}}this.index++}this.cleanup(),this.finish()}cleanup(){this.sectionStart!==this.index&&(this.state===1||this.state===32&&this.sequenceIndex===0?(this.cbs.ontext(this.sectionStart,this.index),this.sectionStart=this.index):(this.state===19||this.state===20||this.state===21)&&(this.cbs.onattribdata(this.sectionStart,this.index),this.sectionStart=this.index))}finish(){this.handleTrailingData(),this.cbs.onend()}handleTrailingData(){const e=this.buffer.length;this.sectionStart>=e||(this.state===28?this.currentSequence===Ln.CdataEnd?this.cbs.oncdata(this.sectionStart,e):this.cbs.oncomment(this.sectionStart,e):this.state===6||this.state===11||this.state===18||this.state===17||this.state===12||this.state===13||this.state===14||this.state===15||this.state===16||this.state===20||this.state===19||this.state===21||this.state===9||this.cbs.ontext(this.sectionStart,e))}emitCodePoint(e,n){}}function N0(t,{compatConfig:e}){const n=e&&e[t];return t==="MODE"?n||3:n}function lo(t,e){const n=N0("MODE",e),i=N0(t,e);return n===3?i===!0:i!==!1}function Ml(t,e,n,...i){return lo(t,e)}function im(t){throw t}function Sx(t){}function Kt(t,e,n,i){const s=`https://vuejs.org/error-reference/#compiler-${t}`,r=new SyntaxError(String(s));return r.code=t,r.loc=e,r}const jn=t=>t.type===4&&t.isStatic;function bx(t){switch(t){case"Teleport":case"teleport":return rl;case"Suspense":case"suspense":return Vp;case"KeepAlive":case"keep-alive":return wc;case"BaseTransition":case"base-transition":return mx}}const o2=/^$|^\d|[^\$\w\xA0-\uFFFF]/,sm=t=>!o2.test(t),Mx=/[A-Za-z_$\xA0-\uFFFF]/,a2=/[\.\?\w$\xA0-\uFFFF]/,l2=/\s+[.[]\s*|\s*[.[]\s+/g,Ax=t=>t.type===4?t.content:t.loc.source,u2=t=>{const e=Ax(t).trim().replace(l2,a=>a.trim());let n=0,i=[],s=0,r=0,o=null;for(let a=0;a<e.length;a++){const l=e.charAt(a);switch(n){case 0:if(l==="[")i.push(n),n=1,s++;else if(l==="(")i.push(n),n=2,r++;else if(!(a===0?Mx:a2).test(l))return!1;break;case 1:l==="'"||l==='"'||l==="`"?(i.push(n),n=3,o=l):l==="["?s++:l==="]"&&(--s||(n=i.pop()));break;case 2:if(l==="'"||l==='"'||l==="`")i.push(n),n=3,o=l;else if(l==="(")r++;else if(l===")"){if(a===e.length-1)return!1;--r||(n=i.pop())}break;case 3:l===o&&(n=i.pop(),o=null);break}}return!s&&!r},Tx=u2,c2=/^\s*(?:async\s*)?(?:\([^)]*?\)|[\w$_]+)\s*(?::[^=]+)?=>|^\s*(?:async\s+)?function(?:\s+[\w$]+)?\s*\(/,f2=t=>c2.test(Ax(t)),h2=f2;function Di(t,e,n=!1){for(let i=0;i<t.props.length;i++){const s=t.props[i];if(s.type===7&&(n||s.exp)&&(Qe(e)?s.name===e:e.test(s.name)))return s}}function Mf(t,e,n=!1,i=!1){for(let s=0;s<t.props.length;s++){const r=t.props[s];if(r.type===6){if(n)continue;if(r.name===e&&(r.value||i))return r}else if(r.name==="bind"&&(r.exp||i)&&ta(r.arg,e))return r}}function ta(t,e){return!!(t&&jn(t)&&t.content===e)}function d2(t){return t.props.some(e=>e.type===7&&e.name==="bind"&&(!e.arg||e.arg.type!==4||!e.arg.isStatic))}function nh(t){return t.type===5||t.type===2}function B0(t){return t.type===7&&t.name==="pre"}function p2(t){return t.type===7&&t.name==="slot"}function Dc(t){return t.type===1&&t.tagType===3}function Pc(t){return t.type===1&&t.tagType===2}const m2=new Set([Sl,Wl]);function rm(t,e=[]){if(t&&!Qe(t)&&t.type===14){const n=t.callee;if(!Qe(n)&&m2.has(n))return rm(t.arguments[0],e.concat(t))}return[t,e]}function Ic(t,e,n){if(t.type!==13&&g2(t,e))return;let i,s=t.type===13?t.props:t.arguments[2],r=[],o;if(s&&!Qe(s)&&s.type===14){const a=rm(s);s=a[0],r=a[1],o=r[r.length-1]}if(s==null||Qe(s))i=Li([e]);else if(s.type===14){const a=s.arguments[0];!Qe(a)&&a.type===15?dd(e,a)||a.properties.unshift(e):s.callee===Qp?i=mn(n.helper(Cc),[Li([e]),s]):s.arguments.unshift(Li([e])),!i&&(i=s)}else s.type===15?(dd(e,s)||s.properties.unshift(e),i=s):(i=mn(n.helper(Cc),[Li([e]),s]),o&&o.callee===Wl&&(o=r[r.length-2]));t.type===13?o?o.arguments[0]=i:t.props=i:o?o.arguments[0]=i:t.arguments[2]=i}function g2(t,e){var n,i,s;if(e.key.type!==4||e.key.content!=="key")return!1;const r=t.arguments[2];if(r&&!Qe(r)){const[o]=rm(r);if(o&&!Qe(o)&&o.type===15&&dd(e,o))return!0}return(n=t.arguments)[2]||(n[2]="{}"),(i=t.arguments)[3]||(i[3]="undefined"),(s=t.arguments)[4]||(s[4]="undefined"),t.arguments[5]=e.value,!0}function dd(t,e){let n=!1;if(t.key.type===4){const i=t.key.content;n=e.properties.some(s=>s.key.type===4&&s.key.content===i)}return n}function Al(t,e){return`_${e}_${t.replace(/[^\w]/g,(n,i)=>n==="-"?"_":t.charCodeAt(i).toString())}`}function _2(t){return t.type===14&&t.callee===tm?t.arguments[1].returns:t}const v2=/([\s\S]*?)\s+(?:in|of)\s+(\S[\s\S]*)/;function wx(t){for(let e=0;e<t.length;e++)if(!vi(t.charCodeAt(e)))return!1;return!0}function om(t){return t.type===2&&wx(t.content)||t.type===12&&om(t.content)}function Cx(t){return t.type===3||om(t)}const Rx={parseMode:"base",ns:0,delimiters:["{{","}}"],getNamespace:()=>0,isVoidTag:Yo,isPreTag:Yo,isIgnoreNewlineTag:Yo,isCustomElement:Yo,onError:im,onWarn:Sx,comments:!1,prefixIdentifiers:!1};let Dt=Rx,Tl=null,Qs="",kn=null,Et=null,ai="",Os=-1,Kr=-1,am=0,br=!1,pd=null;const qt=[],rn=new r2(qt,{onerr:Ps,ontext(t,e){du(Cn(t,e),t,e)},ontextentity(t,e,n){du(t,e,n)},oninterpolation(t,e){if(br)return du(Cn(t,e),t,e);let n=t+rn.delimiterOpen.length,i=e-rn.delimiterClose.length;for(;vi(Qs.charCodeAt(n));)n++;for(;vi(Qs.charCodeAt(i-1));)i--;let s=Cn(n,i);s.includes("&")&&(s=Dt.decodeEntities(s,!1)),md({type:5,content:Ku(s,!1,on(n,i)),loc:on(t,e)})},onopentagname(t,e){const n=Cn(t,e);kn={type:1,tag:n,ns:Dt.getNamespace(n,qt[0],Dt.ns),tagType:0,props:[],children:[],loc:on(t-1,e),codegenNode:void 0}},onopentagend(t){O0(t)},onclosetag(t,e){const n=Cn(t,e);if(!Dt.isVoidTag(n)){let i=!1;for(let s=0;s<qt.length;s++)if(qt[s].tag.toLowerCase()===n.toLowerCase()){i=!0,s>0&&Ps(24,qt[0].loc.start.offset);for(let o=0;o<=s;o++){const a=qt.shift();Yu(a,e,o<s)}break}i||Ps(23,Fx(t,60))}},onselfclosingtag(t){const e=kn.tag;kn.isSelfClosing=!0,O0(t),qt[0]&&qt[0].tag===e&&Yu(qt.shift(),t)},onattribname(t,e){Et={type:6,name:Cn(t,e),nameLoc:on(t,e),value:void 0,loc:on(t)}},ondirname(t,e){const n=Cn(t,e),i=n==="."||n===":"?"bind":n==="@"?"on":n==="#"?"slot":n.slice(2);if(!br&&i===""&&Ps(26,t),br||i==="")Et={type:6,name:n,nameLoc:on(t,e),value:void 0,loc:on(t)};else if(Et={type:7,name:i,rawName:n,exp:void 0,arg:void 0,modifiers:n==="."?[pt("prop")]:[],loc:on(t)},i==="pre"){br=rn.inVPre=!0,pd=kn;const s=kn.props;for(let r=0;r<s.length;r++)s[r].type===7&&(s[r]=C2(s[r]))}},ondirarg(t,e){if(t===e)return;const n=Cn(t,e);if(br&&!B0(Et))Et.name+=n,Qr(Et.nameLoc,e);else{const i=n[0]!=="[";Et.arg=Ku(i?n:n.slice(1,-1),i,on(t,e),i?3:0)}},ondirmodifier(t,e){const n=Cn(t,e);if(br&&!B0(Et))Et.name+="."+n,Qr(Et.nameLoc,e);else if(Et.name==="slot"){const i=Et.arg;i&&(i.content+="."+n,Qr(i.loc,e))}else{const i=pt(n,!0,on(t,e));Et.modifiers.push(i)}},onattribdata(t,e){ai+=Cn(t,e),Os<0&&(Os=t),Kr=e},onattribentity(t,e,n){ai+=t,Os<0&&(Os=e),Kr=n},onattribnameend(t){const e=Et.loc.start.offset,n=Cn(e,t);Et.type===7&&(Et.rawName=n),kn.props.some(i=>(i.type===7?i.rawName:i.name)===n)&&Ps(2,e)},onattribend(t,e){if(kn&&Et){if(Qr(Et.loc,e),t!==0)if(ai.includes("&")&&(ai=Dt.decodeEntities(ai,!0)),Et.type===6)Et.name==="class"&&(ai=Px(ai).trim()),t===1&&!ai&&Ps(13,e),Et.value={type:2,content:ai,loc:t===1?on(Os,Kr):on(Os-1,Kr+1)},rn.inSFCRoot&&kn.tag==="template"&&Et.name==="lang"&&ai&&ai!=="html"&&rn.enterRCDATA(Fc("</template"),0);else{let n=0;Et.exp=Ku(ai,!1,on(Os,Kr),0,n),Et.name==="for"&&(Et.forParseResult=y2(Et.exp));let i=-1;Et.name==="bind"&&(i=Et.modifiers.findIndex(s=>s.content==="sync"))>-1&&Ml("COMPILER_V_BIND_SYNC",Dt,Et.loc,Et.arg.loc.source)&&(Et.name="model",Et.modifiers.splice(i,1))}(Et.type!==7||Et.name!=="pre")&&kn.props.push(Et)}ai="",Os=Kr=-1},oncomment(t,e){Dt.comments&&md({type:3,content:Cn(t,e),loc:on(t-4,e+3)})},onend(){const t=Qs.length;for(let e=0;e<qt.length;e++)Yu(qt[e],t-1),Ps(24,qt[e].loc.start.offset)},oncdata(t,e){(qt[0]?qt[0].ns:Dt.ns)!==0?du(Cn(t,e),t,e):Ps(1,t-9)},onprocessinginstruction(t){(qt[0]?qt[0].ns:Dt.ns)===0&&Ps(21,t-1)}}),U0=/,([^,\}\]]*)(?:,([^,\}\]]*))?$/,x2=/^\(|\)$/g;function y2(t){const e=t.loc,n=t.content,i=n.match(v2);if(!i)return;const[,s,r]=i,o=(f,h,d=!1)=>{const m=e.start.offset+h,x=m+f.length;return Ku(f,!1,on(m,x),0,d?1:0)},a={source:o(r.trim(),n.indexOf(r,s.length)),value:void 0,key:void 0,index:void 0,finalized:!1};let l=s.trim().replace(x2,"").trim();const u=s.indexOf(l),c=l.match(U0);if(c){l=l.replace(U0,"").trim();const f=c[1].trim();let h;if(f&&(h=n.indexOf(f,u+l.length),a.key=o(f,h,!0)),c[2]){const d=c[2].trim();d&&(a.index=o(d,n.indexOf(d,a.key?h+f.length:u+l.length),!0))}}return l&&(a.value=o(l,u,!0)),a}function Cn(t,e){return Qs.slice(t,e)}function O0(t){rn.inSFCRoot&&(kn.innerLoc=on(t+1,t+1)),md(kn);const{tag:e,ns:n}=kn;n===0&&Dt.isPreTag(e)&&am++,Dt.isVoidTag(e)?Yu(kn,t):(qt.unshift(kn),(n===1||n===2)&&(rn.inXML=!0)),kn=null}function du(t,e,n){{const r=qt[0]&&qt[0].tag;r!=="script"&&r!=="style"&&t.includes("&")&&(t=Dt.decodeEntities(t,!1))}const i=qt[0]||Tl,s=i.children[i.children.length-1];s&&s.type===2?(s.content+=t,Qr(s.loc,n)):i.children.push({type:2,content:t,loc:on(e,n)})}function Yu(t,e,n=!1){n?Qr(t.loc,Fx(e,60)):Qr(t.loc,E2(e,62)+1),rn.inSFCRoot&&(t.children.length?t.innerLoc.end=_t({},t.children[t.children.length-1].loc.end):t.innerLoc.end=_t({},t.innerLoc.start),t.innerLoc.source=Cn(t.innerLoc.start.offset,t.innerLoc.end.offset));const{tag:i,ns:s,children:r}=t;if(br||(i==="slot"?t.tagType=2:k0(t)?t.tagType=3:b2(t)&&(t.tagType=1)),rn.inRCDATA||(t.children=Dx(r)),s===0&&Dt.isIgnoreNewlineTag(i)){const o=r[0];o&&o.type===2&&(o.content=o.content.replace(/^\r?\n/,""))}s===0&&Dt.isPreTag(i)&&am--,pd===t&&(br=rn.inVPre=!1,pd=null),rn.inXML&&(qt[0]?qt[0].ns:Dt.ns)===0&&(rn.inXML=!1);{const o=t.props;if(!rn.inSFCRoot&&lo("COMPILER_NATIVE_TEMPLATE",Dt)&&t.tag==="template"&&!k0(t)){const l=qt[0]||Tl,u=l.children.indexOf(t);l.children.splice(u,1,...t.children)}const a=o.find(l=>l.type===6&&l.name==="inline-template");a&&Ml("COMPILER_INLINE_TEMPLATE",Dt,a.loc)&&t.children.length&&(a.value={type:2,content:Cn(t.children[0].loc.start.offset,t.children[t.children.length-1].loc.end.offset),loc:a.loc})}}function E2(t,e){let n=t;for(;Qs.charCodeAt(n)!==e&&n<Qs.length-1;)n++;return n}function Fx(t,e){let n=t;for(;Qs.charCodeAt(n)!==e&&n>=0;)n--;return n}const S2=new Set(["if","else","else-if","for","slot"]);function k0({tag:t,props:e}){if(t==="template"){for(let n=0;n<e.length;n++)if(e[n].type===7&&S2.has(e[n].name))return!0}return!1}function b2({tag:t,props:e}){if(Dt.isCustomElement(t))return!1;if(t==="component"||M2(t.charCodeAt(0))||bx(t)||Dt.isBuiltInComponent&&Dt.isBuiltInComponent(t)||Dt.isNativeTag&&!Dt.isNativeTag(t))return!0;for(let n=0;n<e.length;n++){const i=e[n];if(i.type===6){if(i.name==="is"&&i.value){if(i.value.content.startsWith("vue:"))return!0;if(Ml("COMPILER_IS_ON_ELEMENT",Dt,i.loc))return!0}}else if(i.name==="bind"&&ta(i.arg,"is")&&Ml("COMPILER_IS_ON_ELEMENT",Dt,i.loc))return!0}return!1}function M2(t){return t>64&&t<91}const A2=/\r\n/g;function Dx(t){const e=Dt.whitespace!=="preserve";let n=!1;for(let i=0;i<t.length;i++){const s=t[i];if(s.type===2)if(am)s.content=s.content.replace(A2,`
`);else if(wx(s.content)){const r=t[i-1]&&t[i-1].type,o=t[i+1]&&t[i+1].type;!r||!o||e&&(r===3&&(o===3||o===1)||r===1&&(o===3||o===1&&T2(s.content)))?(n=!0,t[i]=null):s.content=" "}else e&&(s.content=Px(s.content))}return n?t.filter(Boolean):t}function T2(t){for(let e=0;e<t.length;e++){const n=t.charCodeAt(e);if(n===10||n===13)return!0}return!1}function Px(t){let e="",n=!1;for(let i=0;i<t.length;i++)vi(t.charCodeAt(i))?n||(e+=" ",n=!0):(e+=t[i],n=!1);return e}function md(t){(qt[0]||Tl).children.push(t)}function on(t,e){return{start:rn.getPos(t),end:e==null?e:rn.getPos(e),source:e==null?e:Cn(t,e)}}function w2(t){return on(t.start.offset,t.end.offset)}function Qr(t,e){t.end=rn.getPos(e),t.source=Cn(t.start.offset,e)}function C2(t){const e={type:6,name:t.rawName,nameLoc:on(t.loc.start.offset,t.loc.start.offset+t.rawName.length),value:void 0,loc:t.loc};if(t.exp){const n=t.exp.loc;n.end.offset<t.loc.end.offset&&(n.start.offset--,n.start.column--,n.end.offset++,n.end.column++),e.value={type:2,content:t.exp.content,loc:n}}return e}function Ku(t,e=!1,n,i=0,s=0){return pt(t,e,n,i)}function Ps(t,e,n){Dt.onError(Kt(t,on(e,e)))}function R2(){rn.reset(),kn=null,Et=null,ai="",Os=-1,Kr=-1,qt.length=0}function F2(t,e){if(R2(),Qs=t,Dt=_t({},Rx),e){let s;for(s in e)e[s]!=null&&(Dt[s]=e[s])}rn.mode=Dt.parseMode==="html"?1:Dt.parseMode==="sfc"?2:0,rn.inXML=Dt.ns===1||Dt.ns===2;const n=e&&e.delimiters;n&&(rn.delimiterOpen=Fc(n[0]),rn.delimiterClose=Fc(n[1]));const i=Tl=n2([],t);return rn.parse(Qs),i.loc=on(0,t.length),i.children=Dx(i.children),Tl=null,i}function D2(t,e){Zu(t,void 0,e,!!Ix(t))}function Ix(t){const e=t.children.filter(n=>n.type!==3);return e.length===1&&e[0].type===1&&!Pc(e[0])?e[0]:null}function Zu(t,e,n,i=!1,s=!1){const{children:r}=t,o=[];for(let c=0;c<r.length;c++){const f=r[c];if(f.type===1&&f.tagType===0){const h=i?0:Ei(f,n);if(h>0){if(h>=2){f.codegenNode.patchFlag=-1,o.push(f);continue}}else{const d=f.codegenNode;if(d.type===13){const m=d.patchFlag;if((m===void 0||m===512||m===1)&&Nx(f,n)>=2){const x=Bx(f);x&&(d.props=n.hoist(x))}d.dynamicProps&&(d.dynamicProps=n.hoist(d.dynamicProps))}}}else if(f.type===12&&(i?0:Ei(f,n))>=2){f.codegenNode.type===14&&f.codegenNode.arguments.length>0&&f.codegenNode.arguments.push("-1"),o.push(f);continue}if(f.type===1){const h=f.tagType===1;h&&n.scopes.vSlot++,Zu(f,t,n,!1,s),h&&n.scopes.vSlot--}else if(f.type===11)Zu(f,t,n,f.children.length===1,!0);else if(f.type===9)for(let h=0;h<f.branches.length;h++)Zu(f.branches[h],t,n,f.branches[h].children.length===1,s)}let a=!1;if(o.length===r.length&&t.type===1){if(t.tagType===0&&t.codegenNode&&t.codegenNode.type===13&&Ue(t.codegenNode.children))t.codegenNode.children=l(ao(t.codegenNode.children)),a=!0;else if(t.tagType===1&&t.codegenNode&&t.codegenNode.type===13&&t.codegenNode.children&&!Ue(t.codegenNode.children)&&t.codegenNode.children.type===15){const c=u(t.codegenNode,"default");c&&(c.returns=l(ao(c.returns)),a=!0)}else if(t.tagType===3&&e&&e.type===1&&e.tagType===1&&e.codegenNode&&e.codegenNode.type===13&&e.codegenNode.children&&!Ue(e.codegenNode.children)&&e.codegenNode.children.type===15){const c=Di(t,"slot",!0),f=c&&c.arg&&u(e.codegenNode,c.arg);f&&(f.returns=l(ao(f.returns)),a=!0)}}if(!a)for(const c of o)c.codegenNode=n.cache(c.codegenNode);function l(c){const f=n.cache(c);return f.needArraySpread=!0,f}function u(c,f){if(c.children&&!Ue(c.children)&&c.children.type===15){const h=c.children.properties.find(d=>d.key===f||d.key.content===f);return h&&h.value}}o.length&&n.transformHoist&&n.transformHoist(r,n,t)}function Ei(t,e){const{constantCache:n}=e;switch(t.type){case 1:if(t.tagType!==0)return 0;const i=n.get(t);if(i!==void 0)return i;const s=t.codegenNode;if(s.type!==13||s.isBlock&&t.tag!=="svg"&&t.tag!=="foreignObject"&&t.tag!=="math")return 0;if(s.patchFlag===void 0){let o=3;const a=Nx(t,e);if(a===0)return n.set(t,0),0;a<o&&(o=a);for(let l=0;l<t.children.length;l++){const u=Ei(t.children[l],e);if(u===0)return n.set(t,0),0;u<o&&(o=u)}if(o>1)for(let l=0;l<t.props.length;l++){const u=t.props[l];if(u.type===7&&u.name==="bind"&&u.exp){const c=Ei(u.exp,e);if(c===0)return n.set(t,0),0;c<o&&(o=c)}}if(s.isBlock){for(let l=0;l<t.props.length;l++)if(t.props[l].type===7)return n.set(t,0),0;e.removeHelper(ho),e.removeHelper(ha(e.inSSR,s.isComponent)),s.isBlock=!1,e.helper(fa(e.inSSR,s.isComponent))}return n.set(t,o),o}else return n.set(t,0),0;case 2:case 3:return 3;case 9:case 11:case 10:return 0;case 5:case 12:return Ei(t.content,e);case 4:return t.constType;case 8:let r=3;for(let o=0;o<t.children.length;o++){const a=t.children[o];if(Qe(a)||$n(a))continue;const l=Ei(a,e);if(l===0)return 0;l<r&&(r=l)}return r;case 20:return 2;default:return 0}}const P2=new Set([Jp,jp,Sl,Wl]);function Lx(t,e){if(t.type===14&&!Qe(t.callee)&&P2.has(t.callee)){const n=t.arguments[0];if(n.type===4)return Ei(n,e);if(n.type===14)return Lx(n,e)}return 0}function Nx(t,e){let n=3;const i=Bx(t);if(i&&i.type===15){const{properties:s}=i;for(let r=0;r<s.length;r++){const{key:o,value:a}=s[r],l=Ei(o,e);if(l===0)return l;l<n&&(n=l);let u;if(a.type===4?u=Ei(a,e):a.type===14?u=Lx(a,e):u=0,u===0)return u;u<n&&(n=u)}}return n}function Bx(t){const e=t.codegenNode;if(e.type===13)return e.props}function I2(t,{filename:e="",prefixIdentifiers:n=!1,hoistStatic:i=!1,hmr:s=!1,cacheHandlers:r=!1,nodeTransforms:o=[],directiveTransforms:a={},transformHoist:l=null,isBuiltInComponent:u=Tn,isCustomElement:c=Tn,expressionPlugins:f=[],scopeId:h=null,slotted:d=!0,ssr:m=!1,inSSR:x=!1,ssrCssVars:_="",bindingMetadata:p=yt,inline:b=!1,isTS:y=!1,onError:g=im,onWarn:E=Sx,compatConfig:T}){const C=e.replace(/\?.*$/,"").match(/([^/\\]+)\.\w+$/),v={filename:e,selfName:C&&xo(Vt(C[1])),prefixIdentifiers:n,hoistStatic:i,hmr:s,cacheHandlers:r,nodeTransforms:o,directiveTransforms:a,transformHoist:l,isBuiltInComponent:u,isCustomElement:c,expressionPlugins:f,scopeId:h,slotted:d,ssr:m,inSSR:x,ssrCssVars:_,bindingMetadata:p,inline:b,isTS:y,onError:g,onWarn:E,compatConfig:T,root:t,helpers:new Map,components:new Set,directives:new Set,hoists:[],imports:[],cached:[],constantCache:new WeakMap,vForMemoKeyedNodes:new WeakSet,temps:0,identifiers:Object.create(null),scopes:{vFor:0,vSlot:0,vPre:0,vOnce:0},parent:null,grandParent:null,currentNode:t,childIndex:0,inVOnce:!1,helper(A){const R=v.helpers.get(A)||0;return v.helpers.set(A,R+1),A},removeHelper(A){const R=v.helpers.get(A);if(R){const L=R-1;L?v.helpers.set(A,L):v.helpers.delete(A)}},helperString(A){return`_${ua[v.helper(A)]}`},replaceNode(A){v.parent.children[v.childIndex]=v.currentNode=A},removeNode(A){const R=v.parent.children,L=A?R.indexOf(A):v.currentNode?v.childIndex:-1;!A||A===v.currentNode?(v.currentNode=null,v.onNodeRemoved()):v.childIndex>L&&(v.childIndex--,v.onNodeRemoved()),v.parent.children.splice(L,1)},onNodeRemoved:Tn,addIdentifiers(A){},removeIdentifiers(A){},hoist(A){Qe(A)&&(A=pt(A)),v.hoists.push(A);const R=pt(`_hoisted_${v.hoists.length}`,!1,A.loc,2);return R.hoisted=A,R},cache(A,R=!1,L=!1){const M=i2(v.cached.length,A,R,L);return v.cached.push(M),M}};return v.filters=new Set,v}function L2(t,e){const n=I2(t,e);Af(t,n),e.hoistStatic&&D2(t,n),e.ssr||N2(t,n),t.helpers=new Set([...n.helpers.keys()]),t.components=[...n.components],t.directives=[...n.directives],t.imports=n.imports,t.hoists=n.hoists,t.temps=n.temps,t.cached=n.cached,t.transformed=!0,t.filters=[...n.filters]}function N2(t,e){const{helper:n}=e,{children:i}=t;if(i.length===1){const s=Ix(t);if(s&&s.codegenNode){const r=s.codegenNode;r.type===13&&nm(r,e),t.codegenNode=r}else t.codegenNode=i[0]}else if(i.length>1){let s=64;t.codegenNode=bl(e,n(El),void 0,t.children,s,void 0,void 0,!0,void 0,!1)}}function B2(t,e){let n=0;const i=()=>{n--};for(;n<t.children.length;n++){const s=t.children[n];Qe(s)||(e.grandParent=e.parent,e.parent=t,e.childIndex=n,e.onNodeRemoved=i,Af(s,e))}}function Af(t,e){e.currentNode=t;const{nodeTransforms:n}=e,i=[];for(let r=0;r<n.length;r++){const o=n[r](t,e);if(o&&(Ue(o)?i.push(...o):i.push(o)),e.currentNode)t=e.currentNode;else return}switch(t.type){case 3:e.ssr||e.helper(Gl);break;case 5:e.ssr||e.helper(bf);break;case 9:for(let r=0;r<t.branches.length;r++)Af(t.branches[r],e);break;case 10:case 11:case 1:case 0:B2(t,e);break}e.currentNode=t;let s=i.length;for(;s--;)i[s]()}function Ux(t,e){const n=Qe(t)?i=>i===t:i=>t.test(i);return(i,s)=>{if(i.type===1){const{props:r}=i;if(i.tagType===3&&r.some(p2))return;const o=[];for(let a=0;a<r.length;a++){const l=r[a];if(l.type===7&&n(l.name)){r.splice(a,1),a--;const u=e(i,l,s);u&&o.push(u)}}return o}}}const Tf="/*@__PURE__*/",Ox=t=>`${ua[t]}: _${ua[t]}`;function U2(t,{mode:e="function",prefixIdentifiers:n=e==="module",sourceMap:i=!1,filename:s="template.vue.html",scopeId:r=null,optimizeImports:o=!1,runtimeGlobalName:a="Vue",runtimeModuleName:l="vue",ssrRuntimeModuleName:u="vue/server-renderer",ssr:c=!1,isTS:f=!1,inSSR:h=!1}){const d={mode:e,prefixIdentifiers:n,sourceMap:i,filename:s,scopeId:r,optimizeImports:o,runtimeGlobalName:a,runtimeModuleName:l,ssrRuntimeModuleName:u,ssr:c,isTS:f,inSSR:h,source:t.source,code:"",column:1,line:1,offset:0,indentLevel:0,pure:!1,map:void 0,helper(x){return`_${ua[x]}`},push(x,_=-2,p){d.code+=x},indent(){m(++d.indentLevel)},deindent(x=!1){x?--d.indentLevel:m(--d.indentLevel)},newline(){m(d.indentLevel)}};function m(x){d.push(`
`+"  ".repeat(x),0)}return d}function O2(t,e={}){const n=U2(t,e);e.onContextCreated&&e.onContextCreated(n);const{mode:i,push:s,prefixIdentifiers:r,indent:o,deindent:a,newline:l,scopeId:u,ssr:c}=n,f=Array.from(t.helpers),h=f.length>0,d=!r&&i!=="module";k2(t,n);const x=c?"ssrRender":"render",p=(c?["_ctx","_push","_parent","_attrs"]:["_ctx","_cache"]).join(", ");if(s(`function ${x}(${p}) {`),o(),d&&(s("with (_ctx) {"),o(),h&&(s(`const { ${f.map(Ox).join(", ")} } = _Vue
`,-1),l())),t.components.length&&(ih(t.components,"component",n),(t.directives.length||t.temps>0)&&l()),t.directives.length&&(ih(t.directives,"directive",n),t.temps>0&&l()),t.filters&&t.filters.length&&(l(),ih(t.filters,"filter",n),l()),t.temps>0){s("let ");for(let b=0;b<t.temps;b++)s(`${b>0?", ":""}_temp${b}`)}return(t.components.length||t.directives.length||t.temps)&&(s(`
`,0),l()),c||s("return "),t.codegenNode?Gn(t.codegenNode,n):s("null"),d&&(a(),s("}")),a(),s("}"),{ast:t,code:n.code,preamble:"",map:n.map?n.map.toJSON():void 0}}function k2(t,e){const{ssr:n,prefixIdentifiers:i,push:s,newline:r,runtimeModuleName:o,runtimeGlobalName:a,ssrRuntimeModuleName:l}=e,u=a,c=Array.from(t.helpers);if(c.length>0&&(s(`const _Vue = ${u}
`,-1),t.hoists.length)){const f=[Hp,Gp,Gl,Wp,vx].filter(h=>c.includes(h)).map(Ox).join(", ");s(`const { ${f} } = _Vue
`,-1)}z2(t.hoists,e),r(),s("return ")}function ih(t,e,{helper:n,push:i,newline:s,isTS:r}){const o=n(e==="filter"?Yp:e==="component"?$p:qp);for(let a=0;a<t.length;a++){let l=t[a];const u=l.endsWith("__self");u&&(l=l.slice(0,-6)),i(`const ${Al(l,e)} = ${o}(${JSON.stringify(l)}${u?", true":""})${r?"!":""}`),a<t.length-1&&s()}}function z2(t,e){if(!t.length)return;e.pure=!0;const{push:n,newline:i}=e;i();for(let s=0;s<t.length;s++){const r=t[s];r&&(n(`const _hoisted_${s+1} = `),Gn(r,e),i())}e.pure=!1}function lm(t,e){const n=t.length>3||!1;e.push("["),n&&e.indent(),$l(t,e,n),n&&e.deindent(),e.push("]")}function $l(t,e,n=!1,i=!0){const{push:s,newline:r}=e;for(let o=0;o<t.length;o++){const a=t[o];Qe(a)?s(a,-3):Ue(a)?lm(a,e):Gn(a,e),o<t.length-1&&(n?(i&&s(","),r()):i&&s(", "))}}function Gn(t,e){if(Qe(t)){e.push(t,-3);return}if($n(t)){e.push(e.helper(t));return}switch(t.type){case 1:case 9:case 11:Gn(t.codegenNode,e);break;case 2:V2(t,e);break;case 4:kx(t,e);break;case 5:H2(t,e);break;case 12:Gn(t.codegenNode,e);break;case 8:zx(t,e);break;case 3:W2(t,e);break;case 13:$2(t,e);break;case 14:q2(t,e);break;case 15:Y2(t,e);break;case 17:K2(t,e);break;case 18:Z2(t,e);break;case 19:J2(t,e);break;case 20:j2(t,e);break;case 21:$l(t.body,e,!0,!1);break}}function V2(t,e){e.push(JSON.stringify(t.content),-3,t)}function kx(t,e){const{content:n,isStatic:i}=t;e.push(i?JSON.stringify(n):n,-3,t)}function H2(t,e){const{push:n,helper:i,pure:s}=e;s&&n(Tf),n(`${i(bf)}(`),Gn(t.content,e),n(")")}function zx(t,e){for(let n=0;n<t.children.length;n++){const i=t.children[n];Qe(i)?e.push(i,-3):Gn(i,e)}}function G2(t,e){const{push:n}=e;if(t.type===8)n("["),zx(t,e),n("]");else if(t.isStatic){const i=sm(t.content)?t.content:JSON.stringify(t.content);n(i,-2,t)}else n(`[${t.content}]`,-3,t)}function W2(t,e){const{push:n,helper:i,pure:s}=e;s&&n(Tf),n(`${i(Gl)}(${JSON.stringify(t.content)})`,-3,t)}function $2(t,e){const{push:n,helper:i,pure:s}=e,{tag:r,props:o,children:a,patchFlag:l,dynamicProps:u,directives:c,isBlock:f,disableTracking:h,isComponent:d}=t;let m;l&&(m=String(l)),c&&n(i(Kp)+"("),f&&n(`(${i(ho)}(${h?"true":""}), `),s&&n(Tf);const x=f?ha(e.inSSR,d):fa(e.inSSR,d);n(i(x)+"(",-2,t),$l(X2([r,o,a,m,u]),e),n(")"),f&&n(")"),c&&(n(", "),Gn(c,e),n(")"))}function X2(t){let e=t.length;for(;e--&&t[e]==null;);return t.slice(0,e+1).map(n=>n||"null")}function q2(t,e){const{push:n,helper:i,pure:s}=e,r=Qe(t.callee)?t.callee:i(t.callee);s&&n(Tf),n(r+"(",-2,t),$l(t.arguments,e),n(")")}function Y2(t,e){const{push:n,indent:i,deindent:s,newline:r}=e,{properties:o}=t;if(!o.length){n("{}",-2,t);return}const a=o.length>1||!1;n(a?"{":"{ "),a&&i();for(let l=0;l<o.length;l++){const{key:u,value:c}=o[l];G2(u,e),n(": "),Gn(c,e),l<o.length-1&&(n(","),r())}a&&s(),n(a?"}":" }")}function K2(t,e){lm(t.elements,e)}function Z2(t,e){const{push:n,indent:i,deindent:s}=e,{params:r,returns:o,body:a,newline:l,isSlot:u}=t;u&&n(`_${ua[em]}(`),n("(",-2,t),Ue(r)?$l(r,e):r&&Gn(r,e),n(") => "),(l||a)&&(n("{"),i()),o?(l&&n("return "),Ue(o)?lm(o,e):Gn(o,e)):a&&Gn(a,e),(l||a)&&(s(),n("}")),u&&(t.isNonScopedSlot&&n(", undefined, true"),n(")"))}function J2(t,e){const{test:n,consequent:i,alternate:s,newline:r}=t,{push:o,indent:a,deindent:l,newline:u}=e;if(n.type===4){const f=!sm(n.content);f&&o("("),kx(n,e),f&&o(")")}else o("("),Gn(n,e),o(")");r&&a(),e.indentLevel++,r||o(" "),o("? "),Gn(i,e),e.indentLevel--,r&&u(),r||o(" "),o(": ");const c=s.type===19;c||e.indentLevel++,Gn(s,e),c||e.indentLevel--,r&&l(!0)}function j2(t,e){const{push:n,helper:i,indent:s,deindent:r,newline:o}=e,{needPauseTracking:a,needArraySpread:l}=t;l&&n("[...("),n(`_cache[${t.index}] || (`),a&&(s(),n(`${i(Rc)}(-1`),t.inVOnce&&n(", true"),n("),"),o(),n("(")),n(`_cache[${t.index}] = `),Gn(t.value,e),a&&(n(`).cacheIndex = ${t.index},`),o(),n(`${i(Rc)}(1),`),o(),n(`_cache[${t.index}]`),r()),n(")"),l&&n(")]")}new RegExp("\\b"+"arguments,await,break,case,catch,class,const,continue,debugger,default,delete,do,else,export,extends,finally,for,function,if,import,let,new,return,super,switch,throw,try,var,void,while,with,yield".split(",").join("\\b|\\b")+"\\b");const Q2=Ux(/^(?:if|else|else-if)$/,(t,e,n)=>eA(t,e,n,(i,s,r)=>{const o=n.parent.children;let a=o.indexOf(i),l=0;for(;a-->=0;){const u=o[a];u&&u.type===9&&(l+=u.branches.length)}return()=>{if(r)i.codegenNode=V0(s,l,n);else{const u=tA(i.codegenNode);u.alternate=V0(s,l+i.branches.length-1,n)}}}));function eA(t,e,n,i){if(e.name!=="else"&&(!e.exp||!e.exp.content.trim())){const s=e.exp?e.exp.loc:t.loc;n.onError(Kt(28,e.loc)),e.exp=pt("true",!1,s)}if(e.name==="if"){const s=z0(t,e),r={type:9,loc:w2(t.loc),branches:[s]};if(n.replaceNode(r),i)return i(r,s,!0)}else{const s=n.parent.children;let r=s.indexOf(t);for(;r-->=-1;){const o=s[r];if(o&&Cx(o)){n.removeNode(o);continue}if(o&&o.type===9){(e.name==="else-if"||e.name==="else")&&o.branches[o.branches.length-1].condition===void 0&&n.onError(Kt(30,t.loc)),n.removeNode();const a=z0(t,e);o.branches.push(a);const l=i&&i(o,a,!1);Af(a,n),l&&l(),n.currentNode=null}else n.onError(Kt(30,t.loc));break}}}function z0(t,e){const n=t.tagType===3;return{type:10,loc:t.loc,condition:e.name==="else"?void 0:e.exp,children:n&&!Di(t,"for")?t.children:[t],userKey:Mf(t,"key"),isTemplateIf:n}}function V0(t,e,n){return t.condition?hd(t.condition,H0(t,e,n),mn(n.helper(Gl),['""',"true"])):H0(t,e,n)}function H0(t,e,n){const{helper:i}=n,s=fn("key",pt(`${e}`,!1,bi,2)),{children:r}=t,o=r[0];if(r.length!==1||o.type!==1)if(r.length===1&&o.type===11){const l=o.codegenNode;return Ic(l,s,n),l}else return bl(n,i(El),Li([s]),r,64,void 0,void 0,!0,!1,!1,t.loc);else{const l=o.codegenNode,u=_2(l);return u.type===13&&nm(u,n),Ic(u,s,n),l}}function tA(t){for(;;)if(t.type===19)if(t.alternate.type===19)t=t.alternate;else return t;else t.type===20&&(t=t.value)}const nA=Ux("for",(t,e,n)=>{const{helper:i,removeHelper:s}=n;return iA(t,e,n,r=>{const o=mn(i(Zp),[r.source]),a=Dc(t),l=Di(t,"memo"),u=Mf(t,"key",!1,!0);u&&u.type;let c=u&&(u.type===6?u.value?pt(u.value.content,!0):void 0:u.exp);const f=c?fn("key",c):null,h=r.source.type===4&&r.source.constType>0,d=h?64:u?128:256;return r.codegenNode=bl(n,i(El),void 0,o,d,void 0,void 0,!0,!h,!1,t.loc),()=>{var m;let x;const{children:_}=r,p=_.length!==1||_[0].type!==1,b=Pc(t)?t:a&&t.children.length===1&&Pc(t.children[0])?t.children[0]:null;if(b)x=b.codegenNode,a&&f&&Ic(x,f,n);else if(p)x=bl(n,i(El),f?Li([f]):void 0,t.children,64,void 0,void 0,!0,void 0,!1);else{x=_[0].codegenNode,a&&f&&Ic(x,f,n);const y=!h||x.isBlockRequired===!0;x.isBlock!==y&&(x.isBlock?(s(ho),s(ha(n.inSSR,x.isComponent))):s(fa(n.inSSR,x.isComponent))),x.isBlock=y,x.isBlock?(i(ho),i(ha(n.inSSR,x.isComponent))):(i(fa(n.inSSR,x.isComponent)),x.needsPatch&&(x.patchFlag=((m=x.patchFlag)!=null?m:0)|512))}if(l){const y=ca(gd(r.parseResult,[pt("_cached")]));y.body=s2([ji(["const _memo = (",l.exp,")"]),ji(["if (_cached && _cached.el",...c?[" && _cached.key === ",c]:[],` && ${n.helperString(Ex)}(_cached, _memo)) return _cached`]),ji(["const _item = ",x]),pt("_item.memo = _memo"),pt("return _item")]),o.arguments.push(y,pt("_cache"),pt(String(n.cached.length))),n.cached.push(null)}else o.arguments.push(ca(gd(r.parseResult),x,!0))}})});function iA(t,e,n,i){if(!e.exp){n.onError(Kt(31,e.loc));return}const s=e.forParseResult;if(!s){n.onError(Kt(32,e.loc));return}Vx(s);const{addIdentifiers:r,removeIdentifiers:o,scopes:a}=n,{source:l,value:u,key:c,index:f}=s,h={type:11,loc:e.loc,source:l,valueAlias:u,keyAlias:c,objectIndexAlias:f,parseResult:s,children:Dc(t)?t.children:[t]};n.replaceNode(h),a.vFor++;const d=i&&i(h);return()=>{a.vFor--,d&&d()}}function Vx(t,e){t.finalized||(t.finalized=!0)}function gd({value:t,key:e,index:n},i=[]){return sA([t,e,n,...i])}function sA(t){let e=t.length;for(;e--&&!t[e];);return t.slice(0,e+1).map((n,i)=>n||pt("_".repeat(i+1),!1))}const G0=pt("undefined",!1),rA=(t,e)=>{if(t.type===1&&(t.tagType===1||t.tagType===3)){const n=Di(t,"slot");if(n)return n.exp,e.scopes.vSlot++,()=>{e.scopes.vSlot--}}},oA=(t,e,n,i)=>ca(t,n,!1,!0,n.length?n[0].loc:i);function aA(t,e,n=oA){e.helper(em);const{children:i,loc:s}=t,r=[],o=[];let a=e.scopes.vSlot>0||e.scopes.vFor>0;const l=Di(t,"slot",!0);if(l){const{arg:_,exp:p}=l;_&&!jn(_)&&(a=!0),r.push(fn(_||pt("default",!0),n(p,void 0,i,s)))}let u=!1,c=!1;const f=[],h=new Set;let d=0;for(let _=0;_<i.length;_++){const p=i[_];let b;if(!Dc(p)||!(b=Di(p,"slot",!0))){p.type!==3&&f.push(p);continue}if(l){e.onError(Kt(37,b.loc));break}u=!0;const{children:y,loc:g}=p,{arg:E=pt("default",!0),exp:T,loc:C}=b;let v;jn(E)?v=E?E.content:"default":a=!0;const A=Di(p,"for"),R=n(T,A,y,g);let L,M;if(L=Di(p,"if"))a=!0,o.push(hd(L.exp,pu(E,R,d++),G0));else if(M=Di(p,/^else(?:-if)?$/,!0)){let I=_,F;for(;I--&&(F=i[I],!!Cx(F)););if(F&&Dc(F)&&Di(F,/^(?:else-)?if$/)){let B=o[o.length-1];for(;B.alternate.type===19;)B=B.alternate;B.alternate=M.exp?hd(M.exp,pu(E,R,d++),G0):pu(E,R,d++)}else e.onError(Kt(30,M.loc))}else if(A){a=!0;const I=A.forParseResult;I?(Vx(I),o.push(mn(e.helper(Zp),[I.source,ca(gd(I),pu(E,R),!0)]))):e.onError(Kt(32,A.loc))}else{if(v){if(h.has(v)){e.onError(Kt(38,C));continue}h.add(v),v==="default"&&(c=!0)}r.push(fn(E,R))}}if(!l){const _=(p,b)=>{const y=n(p,void 0,b,s);return e.compatConfig&&(y.isNonScopedSlot=!0),fn("default",y)};u?f.length&&!f.every(om)&&(c?e.onError(Kt(39,f[0].loc)):r.push(_(void 0,f))):r.push(_(void 0,i))}const m=a?2:Ju(t.children)?3:1;let x=Li(r.concat(fn("_",pt(m+"",!1))),s);return o.length&&(x=mn(e.helper(yx),[x,ao(o)])),{slots:x,hasDynamicSlots:a}}function pu(t,e,n){const i=[fn("name",t),fn("fn",e)];return n!=null&&i.push(fn("key",pt(String(n),!0))),Li(i)}function Ju(t){for(let e=0;e<t.length;e++){const n=t[e];switch(n.type){case 1:if(n.tagType===2||Ju(n.children))return!0;break;case 9:if(Ju(n.branches))return!0;break;case 10:case 11:if(Ju(n.children))return!0;break}}return!1}const Hx=new WeakMap,lA=(t,e)=>function(){if(t=e.currentNode,!(t.type===1&&(t.tagType===0||t.tagType===1)))return;const{tag:i,props:s}=t,r=t.tagType===1;let o=r?uA(t,e):`"${i}"`;const a=Pt(o)&&o.callee===Xp;let l,u,c=0,f,h,d,m=!1,x=!1,_=a||o===rl||o===Vp||!r&&(i==="svg"||i==="foreignObject"||i==="math");if(s.length>0){const b=Gx(t,e,void 0,r,a);l=b.props,c=b.patchFlag,h=b.dynamicPropNames,m=b.needsPatch,x=b.isBlockRequired;const y=b.directives;d=y&&y.length?ao(y.map(g=>fA(g,e))):void 0,b.shouldUseBlock&&(_=!0)}if(t.children.length>0)if(o===wc&&(_=!0,c|=1024),r&&o!==rl&&o!==wc){const{slots:y,hasDynamicSlots:g}=aA(t,e);u=y,g&&(c|=1024)}else if(t.children.length===1&&o!==rl){const y=t.children[0],g=y.type,E=g===5||g===8;E&&Ei(y,e)===0&&(c|=1),E||g===2?u=y:u=t.children}else u=t.children;h&&h.length&&(f=hA(h));const p=t.codegenNode=bl(e,o,l,u,c===0?void 0:c,f,d,!!_,!1,r,t.loc);m=m&&(c===0||c===32),m&&(p.needsPatch=!0),x&&(p.isBlockRequired=!0)};function uA(t,e,n=!1){let{tag:i}=t;const s=_d(i),r=Mf(t,"is",!1,!0);if(r)if(s||lo("COMPILER_IS_ON_ELEMENT",e)){let a;if(r.type===6?a=r.value&&pt(r.value.content,!0):(a=r.exp,a||(a=pt("is",!1,r.arg.loc))),a)return mn(e.helper(Xp),[a])}else r.type===6&&r.value.content.startsWith("vue:")&&(i=r.value.content.slice(4));const o=bx(i)||e.isBuiltInComponent(i);return o?(n||e.helper(o),o):(e.helper($p),e.components.add(i),Al(i,"component"))}function Gx(t,e,n=t.props,i,s,r=!1){const{tag:o,loc:a,children:l}=t;let u=[];const c=[],f=[],h=l.length>0;let d=!1,m=!1,x=0,_=!1,p=!1,b=!1,y=!1,g=!1,E=!1;const T=[],C=M=>{u.length&&(c.push(Li(W0(u),a)),u=[]),M&&c.push(M)},v=()=>{e.scopes.vFor>0&&u.push(fn(pt("ref_for",!0),pt("true")))},A=({key:M,value:I})=>{if(jn(M)){const F=M.content,B=vo(F);if(B&&(!i||s)&&F.toLowerCase()!=="onclick"&&F!=="onUpdate:modelValue"&&!Ys(F)&&(y=!0),B&&Ys(F)&&(E=!0),F==="ref"&&(_=!0),B&&I.type===14&&(I=I.arguments[0]),I.type===20||(I.type===4||I.type===8)&&Ei(I,e)>0)return;F==="class"?p=!0:F==="style"?b=!0:F!=="ref"&&F!=="key"&&!T.includes(F)&&T.push(F),i&&(F==="class"||F==="style")&&!T.includes(F)&&T.push(F)}else g=!0};for(let M=0;M<n.length;M++){const I=n[M];if(I.type===6){const{loc:F,name:B,nameLoc:O,value:z}=I;let H=!0;if(B==="ref"&&(_=!0,v()),B==="is"&&(_d(o)||z&&z.content.startsWith("vue:")||lo("COMPILER_IS_ON_ELEMENT",e)))continue;u.push(fn(pt(B,!0,O),pt(z?z.content:"",H,z?z.loc:F)))}else{const{name:F,arg:B,exp:O,loc:z,modifiers:H}=I,Y=F==="bind",Q=F==="on";if(F==="slot"){i||e.onError(Kt(40,z));continue}if(F==="once"||F==="memo"||F==="is"||Y&&ta(B,"is")&&(_d(o)||lo("COMPILER_IS_ON_ELEMENT",e))||Q&&r)continue;if(Y&&ta(B,"key")&&(d=!0),Q&&h&&B&&jn(B)&&Vt(B.content)==="vue:beforeUpdate"&&(d=!0,m=!0),Y&&ta(B,"ref")&&v(),!B&&(Y||Q)){if(g=!0,O)if(Y){if(C(),lo("COMPILER_V_BIND_OBJECT_ORDER",e)){c.unshift(O);continue}v(),C(),c.push(O)}else C({type:14,loc:z,callee:e.helper(Qp),arguments:i?[O]:[O,"true"]});else e.onError(Kt(Y?34:35,z));continue}Y&&H.some(q=>q.content==="prop")&&(x|=32);const se=e.directiveTransforms[F];if(se){const{props:q,needRuntime:he}=se(I,t,e);!r&&q.forEach(A),Q&&B&&!jn(B)?C(Li(q,a)):u.push(...q),he&&(f.push(I),$n(he)&&Hx.set(I,he))}else Ry(F)||(f.push(I),h&&(d=!0,m=!0))}}let R;c.length?(C(),c.length>1?R=mn(e.helper(Cc),c,a):R=c[0]):u.length&&(R=Li(W0(u),a)),g?x|=16:(p&&!i&&(x|=2),b&&!i&&(x|=4),T.length&&(x|=8),y&&(x|=32));const L=(x===0||x===32)&&(_||E||f.length>0);if(!d&&L&&(x|=512),!e.inSSR&&R)switch(R.type){case 15:let M=-1,I=-1,F=!1;for(let z=0;z<R.properties.length;z++){const H=R.properties[z].key;jn(H)?H.content==="class"?M=z:H.content==="style"&&(I=z):H.isHandlerKey||(F=!0)}const B=R.properties[M],O=R.properties[I];F?R=mn(e.helper(Sl),[R]):(B&&!jn(B.value)&&(B.value=mn(e.helper(Jp),[B.value])),O&&(b||O.value.type===4&&O.value.content.trim()[0]==="["||O.value.type===17)&&(O.value=mn(e.helper(jp),[O.value])));break;case 14:break;default:R=mn(e.helper(Sl),[mn(e.helper(Wl),[R])]);break}return{props:R,directives:f,patchFlag:x,dynamicPropNames:T,shouldUseBlock:d,needsPatch:L,isBlockRequired:m}}function W0(t){const e=new Map,n=[];for(let i=0;i<t.length;i++){const s=t[i];if(s.key.type===8||!s.key.isStatic){n.push(s);continue}const r=s.key.content,o=e.get(r);o?(r==="style"||r==="class"||vo(r))&&cA(o,s):(e.set(r,s),n.push(s))}return n}function cA(t,e){t.value.type===17?t.value.elements.push(e.value):t.value=ao([t.value,e.value],t.loc)}function fA(t,e){const n=[],i=Hx.get(t);i?n.push(e.helperString(i)):(e.helper(qp),e.directives.add(t.name),n.push(Al(t.name,"directive")));const{loc:s}=t;if(t.exp&&n.push(t.exp),t.arg&&(t.exp||n.push("void 0"),n.push(t.arg)),Object.keys(t.modifiers).length){t.arg||(t.exp||n.push("void 0"),n.push("void 0"));const r=pt("true",!1,s);n.push(Li(t.modifiers.map(o=>fn(o,r)),s))}return ao(n,t.loc)}function hA(t){let e="[";for(let n=0,i=t.length;n<i;n++)e+=JSON.stringify(t[n]),n<i-1&&(e+=", ");return e+"]"}function _d(t){return t==="component"||t==="Component"}const dA=(t,e)=>{if(Pc(t)){const{children:n,loc:i}=t,{slotName:s,slotProps:r}=pA(t,e),o=[e.prefixIdentifiers?"_ctx.$slots":"$slots",s,"{}","undefined","true"];let a=2;r&&(o[2]=r,a=3),n.length&&(o[3]=ca([],n,!1,!1,i),a=4),e.scopeId&&!e.slotted&&(a=5),o.splice(a),t.codegenNode=mn(e.helper(xx),o,i)}};function pA(t,e){let n='"default"',i;const s=[];for(let r=0;r<t.props.length;r++){const o=t.props[r];if(o.type===6)o.value&&(o.name==="name"?n=JSON.stringify(o.value.content):(o.name=Vt(o.name),s.push(o)));else if(o.name==="bind"&&ta(o.arg,"name")){if(o.exp)n=o.exp;else if(o.arg&&o.arg.type===4){const a=Vt(o.arg.content);n=o.exp=pt(a,!1,o.arg.loc)}}else o.name==="bind"&&o.arg&&jn(o.arg)&&(o.arg.content=Vt(o.arg.content)),s.push(o)}if(s.length>0){const{props:r,directives:o}=Gx(t,e,s,!1,!1);i=r,o.length&&e.onError(Kt(36,o[0].loc))}return{slotName:n,slotProps:i}}const Wx=(t,e,n,i)=>{const{loc:s,modifiers:r,arg:o}=t;!t.exp&&!r.length&&n.onError(Kt(35,s));let a;if(o.type===4)if(o.isStatic){let f=o.content;f.startsWith("vue:")&&(f=`vnode-${f.slice(4)}`);const h=e.tagType!==0||f.startsWith("vnode")||!/[A-Z]/.test(f)?Zo(Vt(f)):`on:${f}`;a=pt(h,!0,o.loc)}else a=ji([`${n.helperString(fd)}(`,o,")"]);else a=o,a.children.unshift(`${n.helperString(fd)}(`),a.children.push(")");let l=t.exp;l&&!l.content.trim()&&(l=void 0);let u=n.cacheHandlers&&!l&&!n.inVOnce;if(l){const f=Tx(l),h=!(f||h2(l)),d=l.content.includes(";");(h||u&&f)&&(l=ji([`${h?"$event":"(...args)"} => ${d?"{":"("}`,l,d?"}":")"]))}let c={props:[fn(a,l||pt("() => {}",!1,s))]};return i&&(c=i(c)),u&&(c.props[0].value=n.cache(c.props[0].value)),c.props.forEach(f=>f.key.isHandlerKey=!0),c},mA=(t,e,n)=>{const{modifiers:i,loc:s}=t,r=t.arg;let{exp:o}=t;return o&&o.type===4&&!o.content.trim()&&(o=void 0),r.type!==4?(r.children.unshift("("),r.children.push(') || ""')):r.isStatic||(r.content=r.content?`${r.content} || ""`:'""'),i.some(a=>a.content==="camel")&&(r.type===4?r.isStatic?r.content=Vt(r.content):r.content=`${n.helperString(cd)}(${r.content})`:(r.children.unshift(`${n.helperString(cd)}(`),r.children.push(")"))),n.inSSR||(i.some(a=>a.content==="prop")&&$0(r,"."),i.some(a=>a.content==="attr")&&$0(r,"^")),{props:[fn(r,o)]}},$0=(t,e)=>{t.type===4?t.isStatic?t.content=e+t.content:t.content=`\`${e}\${${t.content}}\``:(t.children.unshift(`'${e}' + (`),t.children.push(")"))},gA=(t,e)=>{if(t.type===0||t.type===1||t.type===11||t.type===10)return()=>{const n=t.children;let i,s=!1;for(let r=0;r<n.length;r++){const o=n[r];if(nh(o)){s=!0;for(let a=r+1;a<n.length;a++){const l=n[a];if(nh(l))i||(i=n[r]=ji([o],o.loc)),i.children.push(" + ",l),n.splice(a,1),a--;else{i=void 0;break}}}}if(!(!s||n.length===1&&(t.type===0||t.type===1&&t.tagType===0&&!t.props.find(r=>r.type===7&&!e.directiveTransforms[r.name])&&t.tag!=="template")))for(let r=0;r<n.length;r++){const o=n[r];if(nh(o)||o.type===8){const a=[];(o.type!==2||o.content!==" ")&&a.push(o),!e.ssr&&Ei(o,e)===0&&a.push("1"),n[r]={type:12,content:o,loc:o.loc,codegenNode:mn(e.helper(Wp),a)}}}}},X0=new WeakSet,_A=(t,e)=>{if(t.type===1&&Di(t,"once",!0))return X0.has(t)||e.inVOnce||e.inSSR?void 0:(X0.add(t),e.inVOnce=!0,e.helper(Rc),()=>{e.inVOnce=!1;const n=e.currentNode;n.codegenNode&&(n.codegenNode=e.cache(n.codegenNode,!0,!0))})},$x=(t,e,n)=>{const{exp:i,arg:s}=t;if(!i)return n.onError(Kt(41,t.loc)),Ia();const r=i.loc.source.trim(),o=i.type===4?i.content:r,a=n.bindingMetadata[r];if(a==="props"||a==="props-aliased")return n.onError(Kt(44,i.loc)),Ia();if(a==="literal-const"||a==="setup-const")return n.onError(Kt(45,i.loc)),Ia();if(!o.trim()||!Tx(i))return n.onError(Kt(42,i.loc)),Ia();const l=s||pt("modelValue",!0),u=s?jn(s)?`onUpdate:${Vt(s.content)}`:ji(['"onUpdate:" + ',s]):"onUpdate:modelValue";let c;const f=n.isTS?"($event: any)":"$event";c=ji([`${f} => ((`,i,") = $event)"]);const h=[fn(l,t.exp),fn(u,c)];if(t.modifiers.length&&e.tagType===1){const d=t.modifiers.map(x=>x.content).map(x=>(sm(x)?x:JSON.stringify(x))+": true").join(", "),m=s?jn(s)?`${s.content}Modifiers`:ji([s,' + "Modifiers"']):"modelModifiers";h.push(fn(m,pt(`{ ${d} }`,!1,t.loc,2)))}return Ia(h)};function Ia(t=[]){return{props:t}}const vA=/[\w).+\-_$\]]/,xA=(t,e)=>{lo("COMPILER_FILTERS",e)&&(t.type===5?Lc(t.content,e):t.type===1&&t.props.forEach(n=>{n.type===7&&n.name!=="for"&&n.exp&&Lc(n.exp,e)}))};function Lc(t,e){if(t.type===4)q0(t,e);else for(let n=0;n<t.children.length;n++){const i=t.children[n];typeof i=="object"&&(i.type===4?q0(i,e):i.type===8?Lc(i,e):i.type===5&&Lc(i.content,e))}}function q0(t,e){const n=t.content;let i=!1,s=!1,r=!1,o=!1,a=0,l=0,u=0,c=0,f,h,d,m,x=[];for(d=0;d<n.length;d++)if(h=f,f=n.charCodeAt(d),i)f===39&&h!==92&&(i=!1);else if(s)f===34&&h!==92&&(s=!1);else if(r)f===96&&h!==92&&(r=!1);else if(o)f===47&&h!==92&&(o=!1);else if(f===124&&n.charCodeAt(d+1)!==124&&n.charCodeAt(d-1)!==124&&!a&&!l&&!u)m===void 0?(c=d+1,m=n.slice(0,d).trim()):_();else{switch(f){case 34:s=!0;break;case 39:i=!0;break;case 96:r=!0;break;case 40:u++;break;case 41:u--;break;case 91:l++;break;case 93:l--;break;case 123:a++;break;case 125:a--;break}if(f===47){let p=d-1,b;for(;p>=0&&(b=n.charAt(p),b===" ");p--);(!b||!vA.test(b))&&(o=!0)}}m===void 0?m=n.slice(0,d).trim():c!==0&&_();function _(){x.push(n.slice(c,d).trim()),c=d+1}if(x.length){for(d=0;d<x.length;d++)m=yA(m,x[d],e);t.content=m,t.ast=void 0}}function yA(t,e,n){n.helper(Yp);const i=e.indexOf("(");if(i<0)return n.filters.add(e),`${Al(e,"filter")}(${t})`;{const s=e.slice(0,i),r=e.slice(i+1);return n.filters.add(s),`${Al(s,"filter")}(${t}${r!==")"?","+r:r}`}}const Y0=new WeakSet,EA=(t,e)=>{if(t.type===1){const n=Di(t,"memo");return!n||Y0.has(t)||e.inSSR?void 0:(Y0.add(t),()=>{const i=t.codegenNode||e.currentNode.codegenNode;i&&i.type===13&&(t.tagType!==1&&nm(i,e),t.codegenNode=mn(e.helper(tm),[n.exp,ca(void 0,i),"_cache",String(e.cached.length)]),e.cached.push(null))})}},SA=(t,e)=>{if(t.type===1){for(const n of t.props)if(n.type===7&&n.name==="bind"&&(!n.exp||n.exp.type===4&&!n.exp.content.trim())&&n.arg){const i=n.arg;if(i.type!==4||!i.isStatic)e.onError(Kt(53,i.loc)),n.exp=pt("",!0,i.loc);else{const s=Vt(i.content);(Mx.test(s[0])||s[0]==="-")&&(n.exp=pt(s,!1,i.loc))}}}};function bA(t){return[[SA,_A,Q2,EA,nA,xA,dA,lA,rA,gA],{on:Wx,bind:mA,model:$x}]}function MA(t,e={}){const n=e.onError||im,i=e.mode==="module";e.prefixIdentifiers===!0?n(Kt(48)):i&&n(Kt(49));const s=!1;e.cacheHandlers&&n(Kt(50)),e.scopeId&&!i&&n(Kt(51));const r=_t({},e,{prefixIdentifiers:s}),o=Qe(t)?F2(t,r):t,[a,l]=bA();return L2(o,_t({},r,{nodeTransforms:[...a,...e.nodeTransforms||[]],directiveTransforms:_t({},l,e.directiveTransforms||{})})),O2(o,r)}const AA=()=>({props:[]});/**
* @vue/compiler-dom v3.5.43
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/const Xx=Symbol(""),qx=Symbol(""),Yx=Symbol(""),Kx=Symbol(""),vd=Symbol(""),Zx=Symbol(""),Jx=Symbol(""),jx=Symbol(""),Qx=Symbol(""),e1=Symbol("");t2({[Xx]:"vModelRadio",[qx]:"vModelCheckbox",[Yx]:"vModelText",[Kx]:"vModelSelect",[vd]:"vModelDynamic",[Zx]:"withModifiers",[Jx]:"withKeys",[jx]:"vShow",[Qx]:"Transition",[e1]:"TransitionGroup"});let Co;function TA(t,e=!1){return Co||(Co=document.createElement("div")),e?(Co.innerHTML=`<div foo="${t.replace(/"/g,"&quot;")}">`,Co.children[0].getAttribute("foo")):(Co.innerHTML=t,Co.textContent)}const wA={parseMode:"html",isVoidTag:qy,isNativeTag:t=>Wy(t)||$y(t)||Xy(t),isPreTag:t=>t==="pre",isIgnoreNewlineTag:t=>t==="pre"||t==="textarea",decodeEntities:TA,isBuiltInComponent:t=>{if(t==="Transition"||t==="transition")return Qx;if(t==="TransitionGroup"||t==="transition-group")return e1},getNamespace(t,e,n){let i=e?e.ns:n;if(e&&i===2)if(e.tag==="annotation-xml"){if(t==="svg")return 1;e.props.some(s=>s.type===6&&s.name==="encoding"&&s.value!=null&&(s.value.content==="text/html"||s.value.content==="application/xhtml+xml"))&&(i=0)}else/^m(?:[ions]|text)$/.test(e.tag)&&t!=="mglyph"&&t!=="malignmark"&&(i=0);else e&&i===1&&(e.tag==="foreignObject"||e.tag==="desc"||e.tag==="title")&&(i=0);if(i===0){if(t==="svg")return 1;if(t==="math")return 2}return i}},CA=t=>{t.type===1&&t.props.forEach((e,n)=>{e.type===6&&e.name==="style"&&e.value&&(t.props[n]={type:7,name:"bind",arg:pt("style",!0,e.loc),exp:RA(e.value.content,e.loc),modifiers:[],loc:e.loc})})},RA=(t,e)=>{const n=a_(t);return pt(JSON.stringify(n),!1,e,3)};function Cr(t,e){return Kt(t,e)}const FA=(t,e,n)=>{const{exp:i,loc:s}=t;return i||n.onError(Cr(54,s)),e.children.length&&(n.onError(Cr(55,s)),e.children.length=0),{props:[fn(pt("innerHTML",!0,s),i||pt("",!0))]}},DA=(t,e,n)=>{const{exp:i,loc:s}=t;return i||n.onError(Cr(56,s)),e.children.length&&(n.onError(Cr(57,s)),e.children.length=0),{props:[fn(pt("textContent",!0),i?Ei(i,n)>0?i:mn(n.helperString(bf),[i],s):pt("",!0))]}},PA=(t,e,n)=>{const i=$x(t,e,n);if(!i.props.length||e.tagType===1)return i;t.arg&&n.onError(Cr(59,t.arg.loc));const{tag:s}=e,r=n.isCustomElement(s);if(s==="input"||s==="textarea"||s==="select"||r){let o=Yx,a=!1;if(s==="input"||r){const l=Mf(e,"type");if(l){if(l.type===7)o=vd;else if(l.value)switch(l.value.content){case"radio":o=Xx;break;case"checkbox":o=qx;break;case"file":a=!0,n.onError(Cr(60,t.loc));break}}else d2(e)&&(o=vd)}else s==="select"&&(o=Kx);a||(i.needRuntime=n.helper(o))}else n.onError(Cr(58,t.loc));return i.props=i.props.filter(o=>!(o.key.type===4&&o.key.content==="modelValue")),i},IA=Xn("passive,once,capture"),LA=Xn("stop,prevent,self,ctrl,shift,alt,meta,exact,middle"),NA=Xn("left,right"),t1=Xn("onkeyup,onkeydown,onkeypress"),BA=(t,e,n,i)=>{const s=[],r=[],o=[];for(let a=0;a<e.length;a++){const l=e[a].content;l==="native"&&Ml("COMPILER_V_ON_NATIVE",n)||IA(l)?o.push(l):NA(l)?jn(t)?t1(t.content.toLowerCase())?s.push(l):r.push(l):(s.push(l),r.push(l)):LA(l)?r.push(l):s.push(l)}return{keyModifiers:s,nonKeyModifiers:r,eventOptionModifiers:o}},K0=(t,e)=>jn(t)&&t.content.toLowerCase()==="onclick"?pt(e,!0):t.type!==4?ji(["(",t,`) === "onClick" ? "${e}" : (`,t,")"]):t,UA=(t,e,n)=>Wx(t,e,n,i=>{const{modifiers:s}=t;if(!s.length)return i;let{key:r,value:o}=i.props[0];const{keyModifiers:a,nonKeyModifiers:l,eventOptionModifiers:u}=BA(r,s,n,t.loc);if(l.includes("right")&&(r=K0(r,"onContextmenu")),l.includes("middle")&&(r=K0(r,"onMouseup")),l.length&&(o=mn(n.helper(Zx),[o,JSON.stringify(l)])),a.length&&(!jn(r)||t1(r.content.toLowerCase()))&&(o=mn(n.helper(Jx),[o,JSON.stringify(a)])),u.length){const c=u.map(xo).join("");r=jn(r)?pt(`${r.content}${c}`,!0):ji(["(",r,`) + "${c}"`])}return{props:[fn(r,o)]}}),OA=(t,e,n)=>{const{exp:i,loc:s}=t;return i||n.onError(Cr(62,s)),{props:[],needRuntime:n.helper(jx)}},kA=(t,e)=>{t.type===1&&t.tagType===0&&(t.tag==="script"||t.tag==="style")&&e.removeNode()},zA=[CA],VA={cloak:AA,html:FA,text:DA,model:PA,on:UA,show:OA};function HA(t,e={}){return MA(t,_t({},wA,e,{nodeTransforms:[kA,...zA,...e.nodeTransforms||[]],directiveTransforms:_t({},VA,e.directiveTransforms||{}),transformHoist:null}))}/**
* vue v3.5.43
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/const Z0=Object.create(null);function GA(t,e){if(!Qe(t))if(t.nodeType)t=t.innerHTML;else return Tn;const n=Py(t,e),i=Z0[n];if(i)return i;if(t[0]==="#"){const a=document.querySelector(t);t=a?a.innerHTML:""}const s=_t({hoistStatic:!0,onError:void 0,onWarn:Tn},e);!s.isCustomElement&&typeof customElements<"u"&&(s.isCustomElement=a=>!!customElements.get(a));const{code:r}=HA(t,s),o=new Function("Vue",r)(KM);return o._rc=!0,Z0[n]=o}kv(GA);const Rr=19,Xl=15,ns=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]],Pi={roundLimit:30,ticks:240,shipRadius:Math.sqrt(3)/2-.001,shipCollisionRadius:.75-.001,mineDamage:40,torpedo:{speed:4,damage:45,life:3},plane:{hp:2,speed:6,vision:3,range:12,damage:25}},mu=(t,e,n=!1)=>({damage:t,range:e,multi:n}),Nc={dd:{name:"驱逐",role:"front",hp:100,speed:4,vision:5,collision:15,secondary:mu(8,2),torpedo:{...Pi.torpedo,reserve:3,max:3},aa:{range:3,damage:1},contactSweep:!0},cl:{name:"轻巡",role:"front",hp:150,speed:3,vision:5,collision:20,secondary:mu(12,3),torpedo:{...Pi.torpedo,reserve:9,max:3},aa:{range:2,damage:1}},ca:{name:"重巡",role:"front",hp:230,speed:3,vision:5,collision:30,secondary:mu(16,3,!0),aa:{range:2,damage:1}},bb:{name:"战列",role:"back",hp:270,speed:2,vision:5,collision:35,secondary:mu(10,3),main:{range:9,shots:3,damage:60,reload:1}},cv:{name:"航母",role:"back",hp:210,speed:2,vision:5,collision:15,carrier:{stock:6,launch:2,rearm:1,heal:1,plane:{...Pi.plane}}}},Bc=["dd","cl","ca","bb","cv"],Pn=(t,e=6)=>(t%e+e)%e,dt=t=>structuredClone(t),Je=t=>`${t.q},${t.r}`,Ar=(t,e)=>({q:t-Math.floor(e/2),r:e}),Ea=t=>({c:t.q+Math.floor(t.r/2),r:t.r}),Yt=(t,e)=>Math.max(Math.abs(t.q-e.q),Math.abs(t.r-e.r),Math.abs(t.q+t.r-e.q-e.r)),Ni=(t,e)=>({q:t.q+ns[Pn(e)][0],r:t.r+ns[Pn(e)][1]}),Ir=t=>{const e=Ea(t);return e.c>=0&&e.c<Rr&&e.r>=0&&e.r<Xl},kt=t=>({x:Math.sqrt(3)*(t.q+t.r/2),y:1.5*t.r});function um(t,e){let n=t,i=e,s=-n-i,r=Math.round(n+1e-9),o=Math.round(s+2e-9),a=Math.round(i-3e-9),l=Math.abs(r-n),u=Math.abs(o-s),c=Math.abs(a-i);return l>u&&l>c?r=-o-a:u>c?o=-r-a:a=-r-o,{q:r,r:a}}const rt=t=>um(Math.sqrt(3)/3*t.x-t.y/3,2/3*t.y),tn=(t,e)=>t.q===e.q&&t.r===e.r,bo=()=>Array.from({length:Rr*Xl},(t,e)=>Ar(e%Rr,Math.floor(e/Rr)));function n1(t,e){const n=Yt(t,e);return Array.from({length:n+1},(i,s)=>um(t.q+(e.q-t.q)*s/(n||1),t.r+(e.r-t.r)*s/(n||1)))}function rr(t,e,n){return n1(e,n).slice(1,-1).every(i=>!t.islands.includes(Je(i)))}function Qi(t,e){return Ir(e)&&!t.islands.includes(Je(e))}function po(t){return bo().filter(e=>{const{c:n,r:i}=Ea(e);return t===0?i>=Xl-3&&n<3:i<3&&n>=Rr-3})}function WA(t){let e=(Number(t)||1)>>>0;return()=>{e+=1831565813;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}function i1(t=20261004){const e=WA(t),n=new Set,i=new Set([...po(0),...po(1)].map(Je)),s=l=>{const{c:u,r:c}=Ea(l);return Ar(Rr-1-u,c)},r=l=>{const u=bo().filter(h=>!l.has(Je(h))),c=new Set([Je(u[0])]),f=[u[0]];for(let h=0;h<f.length;h++)for(let d=0;d<6;d++){const m=Ni(f[h],d),x=Je(m);Ir(m)&&!l.has(x)&&!c.has(x)&&(c.add(x),f.push(m))}return c.size===u.length};let o=Ar(5,4);for(let l=0;n.size<30&&l<3e3;l++){l%4===0&&(o=Ar(3+Math.floor(e()*6),1+Math.floor(e()*10)));const u=l%4?Ni(o,Math.floor(e()*6)):o,c=s(u);if(!Ir(u)||u.r===5||u.r===10||i.has(Je(u))||i.has(Je(c)))continue;const f=new Set([...n,Je(u),Je(c)]);f.size<=32&&r(f)&&(n.add(Je(u)),n.add(Je(c)))}const a=[];for(let l=0;a.length<8&&l<1e3;l++){const u=Ar(3+Math.floor(e()*6),1+Math.floor(e()*12)),c=s(u);n.has(Je(u))||n.has(Je(c))||a.some(f=>tn(f,u)||tn(f,c))||a.push(u,c)}return{width:Rr,height:Xl,islands:[...n],mines:a}}function xd(t,e,n,i){var r,o,a,l;const s={radius:Pi.shipRadius,...dt(Nc[t])};return{id:`${e}-${n}`,kind:"ship",team:e,label:`${s.name}-${n+1}`,template:t,cfg:s,hp:s.hp,pos:{...i},xy:kt(i),heading:e===0?0:3,torps:((r=s.torpedo)==null?void 0:r.reserve)||0,mainReady:1,airReady:Array(((o=s.carrier)==null?void 0:o.stock)||0).fill(1),airHP:Array(((a=s.carrier)==null?void 0:a.stock)||0).fill(((l=s.carrier)==null?void 0:l.plane.hp)||0),destroyedPlanes:0}}function s1(t=Bc,e=20261004){const n=i1(e),i=[0,2,4,6,8],s={seed:e,round:1,map:n,ships:[...t.map((r,o)=>xd(r,0,o,po(0)[i[o]])),...Bc.map((r,o)=>xd(r,1,o,po(1)[i[4-o]]))],torpedoes:[],planes:[],nextId:0,log:[],winner:null,phase:"deploy",explored:[[],[]]};return Xs(s),s}const lt=t=>t.hp>0,wl=t=>Math.min(t.cfg.radius,Pi.shipCollisionRadius);function gs(t,e){const n=new Set,i=[...t.ships.filter(s=>s.team===e&&lt(s)).map(s=>({pos:rt(s.xy),vision:s.cfg.vision})),...t.planes.filter(s=>s.team===e&&s.hp>0).map(s=>({pos:rt(s.xy),vision:s.cfg.vision}))];for(const s of i)for(const r of bo())Yt(s.pos,r)<=s.vision&&rr(t.map,s.pos,r)&&n.add(Je(r));return n}function Xs(t){t.explored||(t.explored=[[],[]]);for(const e of[0,1])t.explored[e]=[...new Set([...t.explored[e],...gs(t,e)])];return t.explored}function r1(t,e){const n=gs(t,e);return{round:t.round,map:{...dt(t.map),islands:t.explored?t.map.islands.filter(i=>t.explored[e].includes(i)):[...t.map.islands]},ships:t.ships.filter(i=>lt(i)&&(i.team===e||n.has(Je(rt(i.xy))))).map(dt),torpedoes:t.torpedoes.filter(i=>i.team===e||n.has(Je(rt(i.xy)))).map(dt),planes:t.planes.filter(i=>i.team===e||n.has(Je(rt(i.xy)))).map(dt)}}const Gi=()=>({moves:[],torps:[],main:[],planes:[],sweep:null});function di(t,e,n){let i={...t.pos},s=t.heading;const r=[{pos:{...i},heading:s}];for(const o of((e==null?void 0:e.moves)||[]).slice(0,t.cfg.speed)){s=Pn(s+Math.max(-1,Math.min(1,o.turn||0)));const a=o.forward?Ni(i,s):i;if(o.forward&&!Qi(n,a))break;i={...a},r.push({pos:{...i},heading:s})}return r}function wf(t,e,n=Gi()){const i=Gi(),s=di(e,n,t.map);i.moves=(n.moves||[]).slice(0,s.length-1);const r=gs(t,e.team),o=new Set;for(const a of n.torps||[]){const l=s[a.window];!e.cfg.torpedo||!l||o.has(a.window)||i.torps.length>=Math.min(e.torps,e.cfg.torpedo.max)||[l.heading,Pn(l.heading+3)].includes(Pn(a.dir))||a.window<0||(o.add(a.window),i.torps.push({window:a.window,dir:Pn(a.dir)}))}if(e.cfg.main&&e.mainReady<=t.round&&(i.main=(n.main||[]).filter(a=>Ir(a)&&Yt(e.pos,a)<=e.cfg.main.range).slice(0,e.cfg.main.shots).map(dt)),e.cfg.secondary&&n.sweep&&t.map.mines.some(a=>tn(a,n.sweep))&&Yt(e.pos,n.sweep)<=e.cfg.secondary.range&&rr(t.map,e.pos,n.sweep)&&(i.sweep=dt(n.sweep)),e.cfg.carrier){const a=e.airReady.filter(l=>l<=t.round).length;i.planes=(n.planes||[]).filter(l=>l.mode==="point"?Ir(l.target):t.ships.some(u=>u.id===l.targetId&&u.team!==e.team&&lt(u)&&r.has(Je(u.pos)))).slice(0,Math.min(e.cfg.carrier.launch,a)).map(dt)}return i}const Ka=(t,e)=>Math.hypot(t.x-e.x,t.y-e.y),yd=(t,e,n)=>({x:t.x+(e.x-t.x)*n,y:t.y+(e.y-t.y)*n}),$A=(t,e,n)=>{const i=Ka(t,e);return i<=n?{...e}:yd(t,e,n/i)};function XA(t,e,n,i,s){const r=t.x-n.x,o=t.y-n.y,a=e.x-t.x-(i.x-n.x),l=e.y-t.y-(i.y-n.y),u=r*r+o*o-s*s,c=a*a+l*l,f=2*(r*a+o*l);if(u<=1e-9)return 0;if(c<1e-12)return null;const h=f*f-4*c*u;if(h<0)return null;const d=(-f-Math.sqrt(h))/(2*c);return d>=-1e-9&&d<=1+1e-9?Math.max(0,d):null}function sh(t,e,n){var i;return{t:e,ships:t.ships.filter(lt).map(s=>({id:s.id,team:s.team,label:s.label,hp:s.hp,cfg:s.cfg,pos:rt(s.xy),xy:{...s.xy},heading:s.heading})),torpedoes:t.torpedoes.map(s=>({...s,xy:{...s.xy}})),planes:t.planes.filter(lt).map(s=>({...s,xy:{...s.xy}})),mines:dt(t.map.mines),visible:[...gs(t,0)],explored:[...((i=t.explored)==null?void 0:i[0])||[]],effects:n.splice(0)}}function o1(t,e={}){const n=dt(t),i=[],s=[],r=[],o=[],a=n.round;for(const M of n.ships)M.cfg.carrier&&(M.airHP??(M.airHP=Array(M.cfg.carrier.stock).fill(M.cfg.carrier.plane.hp)));let l=0;const u=(M,I={})=>{r.push(M);const F=I.time??l,B=`effect:${a}:${o.length}`;o.push({id:B,type:"effect",kind:M.kind,at:dt(M.at),team:I.team??null,time:F,duration:M.kind==="hit"?.16:.12,...M.text?{text:M.text}:{}}),M.from&&o.push({id:`${B}:trace`,type:"projectile",kind:M.kind,team:I.team??null,from:dt(I.from??kt(M.from)),to:dt(I.to??kt(M.at)),at:dt(M.at),start:F,end:F+.045})};let c=null;const f=(M,I,F=null)=>{s.push({round:a,t:Number(l.toFixed(3)),text:M,at:I?dt(I):null,team:F})},h=(M,I,F)=>{lt(M)&&(M.hp=Math.max(0,M.hp-I),u({kind:"hit",at:rt(M.xy),text:`−${I}`},{team:M.team,time:c??l}),f(`${M.label} ${F} −${I}${M.hp===0?" · 沉没":""}`,rt(M.xy),M.team))},d={},m={},x=[],_=new Set,p=new Map,b=new Set;for(const M of n.ships.filter(lt)){M.xy=kt(M.pos),d[M.id]=wf(n,M,e[M.id]);const I=d[M.id];m[M.id]={nodes:di(M,I,n.map),stopped:!1,visited:[dt(M.pos)],fired:new Set}}const y=new Set;for(const M of n.ships.filter(lt)){const I=d[M.id];if(I.sweep&&(y.add(Je(I.sweep)),f(`${M.label} 副炮清雷`,I.sweep,M.team)),I.main.length){for(const[F,B]of I.main.entries())x.push({at:B,damage:M.cfg.main.damage,team:M.team}),o.push({id:`main:${a}:${M.id}:${F}`,type:"projectile",kind:"main",sourceId:M.id,team:M.team,from:{...M.xy},to:kt(B),at:dt(B),start:0,end:1.1}),o.push({id:`launch:${a}:${M.id}:${F}`,type:"effect",kind:"launch",team:M.team,at:dt(M.pos),time:0,duration:.09});M.mainReady=a+M.cfg.main.reload+1,f(`${M.label} 主炮发射 ${I.main.length} 发`,M.pos,M.team)}for(const F of I.planes){const B=M.airReady.findIndex(z=>z<=a);if(B<0)break;M.airReady[B]=1/0;const O=n.ships.find(z=>z.id===F.targetId);n.planes.push({id:`p${n.nextId++}`,kind:"plane",team:M.team,mother:M.id,slot:B,hp:M.airHP[B],cfg:dt(M.cfg.carrier.plane),xy:{...M.xy},mode:F.mode,target:dt(F.mode==="point"?F.target:O.pos),targetId:(O==null?void 0:O.id)||null,tracking:F.mode==="target",state:"outbound",traveled:0,waypoints:[]}),f(`${M.label} 放飞`,M.pos,M.team)}}n.map.mines=n.map.mines.filter(M=>!y.has(Je(M)));for(const M of n.planes){const I=n.ships.find(F=>F.id===M.targetId);M.tracking=!!(I&&lt(I)&&gs(n,M.team).has(Je(rt(I.xy))))}const g=(M,I)=>{const F=m[M.id];if(!(!F||F.fired.has(I)||!lt(M))){F.fired.add(I);for(const B of d[M.id].torps.filter(O=>O.window===I))M.torps<=0||(M.torps--,n.torpedoes.push({id:`t${n.nextId++}`,kind:"torpedo",team:M.team,owner:M.id,xy:{...M.xy},heading:B.dir,age:0,launched:a,birth:l,armed:!1,cfg:dt(M.cfg.torpedo)}),f(`${M.label} 发射鱼雷`,rt(M.xy),M.team))}};n.ships.filter(lt).forEach(M=>g(M,0));const E=M=>{M.state="return",M.waypoints=[]},T=()=>{const M=[];for(const I of n.planes.filter(lt))for(const F of n.ships.filter(B=>lt(B)&&B.team!==I.team&&B.cfg.aa)){const B=`${F.id}:${I.id}`;!b.has(B)&&Yt(rt(F.xy),rt(I.xy))<=F.cfg.aa.range&&(b.add(B),M.push([I,F.cfg.aa.damage,F]))}for(const[I,F,B]of M)I.hp=Math.max(0,I.hp-F),u({kind:"aa",from:rt(B.xy),at:rt(I.xy)},{team:B.team,from:B.xy,to:I.xy}),I.hp||f(`${B.label} 击落敌机`,rt(I.xy),B.team)},C=()=>{T();const M=[];for(const O of n.planes.filter(lt)){if(O.state==="return")continue;const z=rt(O.xy),H=n.ships.filter(Y=>lt(Y)&&Y.team!==O.team&&tn(rt(Y.xy),z)&&(O.mode!=="target"||Y.id===O.targetId)).sort((Y,Q)=>Y.id.localeCompare(Q.id))[0];H&&(M.push([H,O.cfg.damage,"遭航空炸弹命中"]),E(O))}for(const[O,z,H]of M)h(O,z,H);const I=new Set;for(const O of n.torpedoes){const z=rt(O.xy),H=n.ships.find(Q=>Q.id===O.owner);if(!O.armed&&(!H||!tn(z,rt(H.xy)))&&(O.armed=!0),!Ir(z)||n.map.islands.includes(Je(z))){I.add(O.id);continue}if(!O.armed)continue;const Y=n.ships.filter(Q=>lt(Q)&&tn(rt(Q.xy),z)).sort((Q,se)=>Q.id.localeCompare(se.id))[0];Y&&(h(Y,O.cfg.damage,"遭鱼雷命中"),I.add(O.id))}n.torpedoes=n.torpedoes.filter(O=>!I.has(O.id));for(const O of[...n.map.mines]){const z=n.ships.filter(H=>lt(H)&&tn(rt(H.xy),O)).sort((H,Y)=>+!!Y.cfg.contactSweep-+!!H.cfg.contactSweep||H.id.localeCompare(Y.id));if(z.length){const H=z[0];n.map.mines=n.map.mines.filter(Y=>!tn(Y,O)),H.cfg.contactSweep?f(`${H.label} 接触排雷`,O,H.team):h(H,Pi.mineDamage,"触雷")}}const F=[gs(n,0),gs(n,1)],B=[];for(const O of n.ships.filter(z=>{var H;return lt(z)&&z.cfg.secondary&&!((H=d[z.id])!=null&&H.sweep)})){const z=p.get(O.id)||new Set,H=O.cfg.secondary;if(!H.multi&&z.size)continue;const Y=rt(O.xy),Q=n.ships.filter(se=>lt(se)&&se.team!==O.team&&!z.has(se.id)&&F[O.team].has(Je(rt(se.xy)))&&Yt(Y,rt(se.xy))<=H.range&&rr(n.map,Y,rt(se.xy))).sort((se,q)=>Yt(Y,rt(se.xy))-Yt(Y,rt(q.xy))||se.id.localeCompare(q.id));for(const se of H.multi?Q:Q.slice(0,1))z.add(se.id),B.push([se,H.damage,O]);p.set(O.id,z)}for(const[O,z,H]of B)u({kind:"shot",from:rt(H.xy),at:rt(O.xy)},{team:H.team,from:H.xy,to:O.xy}),h(O,z,`遭${H.label}副炮命中`)};C(),Xs(n),i.push(sh(n,0,r));for(let M=1;M<=Pi.ticks;M++){const I=(M-1)/Pi.ticks;l=M/Pi.ticks;const F=l-I,B=new Map,O=new Map;for(const q of n.ships.filter(lt)){O.set(q.id,{...q.xy});const he=m[q.id];if(he.stopped){B.set(q.id,{...q.xy});continue}const et=l*q.cfg.speed,We=Math.min(Math.floor(et+1e-9),q.cfg.speed),de=et-We,K=he.nodes[Math.min(We,he.nodes.length-1)],j=he.nodes[Math.min(We+1,he.nodes.length-1)];q.heading=(de>1e-9?j:K).heading,B.set(q.id,yd(kt(K.pos),kt(j.pos),de))}const z=[],H=n.ships.filter(lt),Y=new Map(B);let Q=0,se=0;for(;se++<H.length*H.length;){const q=(K,j)=>m[K.id].stopped?B.get(K.id):yd(O.get(K.id),Y.get(K.id),j),he=[];for(let K=0;K<H.length;K++)for(let j=K+1;j<H.length;j++){const _e=H[K],Fe=H[j],Ce=[_e.id,Fe.id].sort().join("|");if(_.has(Ce))continue;const Ze=XA(q(_e,Q),q(_e,1),q(Fe,Q),q(Fe,1),wl(_e)+wl(Fe));Ze!==null&&he.push({a:_e,b:Fe,t:Q+(1-Q)*Ze,pair:Ce})}if(he.sort((K,j)=>K.t-j.t||K.pair.localeCompare(j.pair)),!he.length)break;const et=he[0].t,We=he.filter(K=>Math.abs(K.t-et)<1e-7),de=new Map;for(const K of We)for(const j of[K.a,K.b])de.has(j.id)||de.set(j.id,{...q(j,et)});for(const K of We)_.add(K.pair),z.push([K.a,K.b.cfg.collision],[K.b,K.a.cfg.collision]);for(const[K,j]of de)B.set(K,j),m[K].stopped=!0;Q=et}for(const q of H){q.xy=B.get(q.id);const he=m[q.id];if(!he.stopped){const et=Math.floor(l*q.cfg.speed+1e-8),We=Math.floor(I*q.cfg.speed+1e-8);for(let de=We+1;de<=et&&de<he.nodes.length;de++)he.visited.push(dt(he.nodes[de].pos)),g(q,de)}}for(const q of n.torpedoes){if(q.birth===l&&q.launched===a)continue;const he=kt({q:ns[q.heading][0],r:ns[q.heading][1]});q.xy.x+=he.x*q.cfg.speed*F,q.xy.y+=he.y*q.cfg.speed*F,q.age+=F}for(const q of n.planes.filter(lt)){const he=n.ships.find(j=>j.id===q.mother);if(q.state==="return"&&(!he||!lt(he))){q.hp=0,f("返航飞机失去母舰",rt(q.xy),q.team);continue}let et;if(q.state==="return")et=he.xy;else if(q.mode==="target"){const j=n.ships.find(_e=>_e.id===q.targetId);!j||!lt(j)?(E(q),et=(he==null?void 0:he.xy)||q.xy):(!q.tracking&&gs(n,q.team).has(Je(rt(j.xy)))&&(q.tracking=!0),q.tracking&&(q.target=rt(j.xy)),et=q.tracking?j.xy:kt(q.target))}else et=kt(q.target);const We={...q.xy},de=q.state==="outbound"?Math.max(0,q.cfg.range-q.traveled):1/0,K=Math.min(q.cfg.speed*F,de)*Math.sqrt(3);q.xy=$A(q.xy,et,K),q.state==="outbound"&&(q.traveled+=Ka(We,q.xy)/Math.sqrt(3))}T();for(const[q,he]of z)h(q,he,"发生碰撞");C();for(const q of n.planes.filter(lt)){const he=n.ships.find(et=>et.id===q.mother);q.state==="outbound"&&(q.traveled>=q.cfg.range-1e-8||q.mode==="point"&&Ka(q.xy,kt(q.target))<1e-7||q.mode==="target"&&!q.tracking&&Ka(q.xy,kt(q.target))<1e-7)&&E(q),q.state==="return"&&he&&lt(he)&&Ka(q.xy,he.xy)<.12&&(he.airReady[q.slot]=a+he.cfg.carrier.rearm+1,he.airHP[q.slot]=q.hp,q.hp=0,q.recovered=!0,f(`${he.label} 回收飞机`,rt(he.xy),q.team))}for(const q of n.planes.filter(he=>!lt(he)&&!he.accounted)){const he=n.ships.find(et=>et.id===q.mother);he&&!q.recovered&&he.destroyedPlanes++,q.accounted=!0}n.planes=n.planes.filter(lt),n.torpedoes=n.torpedoes.filter(q=>q.age<q.cfg.life-1e-8),Xs(n),M%8===0&&i.push(sh(n,l,r))}c=1.1;const v=new Map;for(const M of x){u({kind:"main",at:M.at},{time:1.1,team:M.team});for(const I of n.ships.filter(F=>lt(F)&&tn(rt(F.xy),M.at)))v.set(I.id,(v.get(I.id)||0)+M.damage)}for(const[M,I]of v)h(n.ships.find(F=>F.id===M),I,"遭主炮命中");const A=new Set,R=n.ships.filter(M=>lt(M)&&m[M.id].stopped);for(const M of n.ships.filter(I=>lt(I)&&!m[I.id].stopped))M.pos=rt(M.xy),M.xy=kt(M.pos),A.add(Je(M.pos));R.sort((M,I)=>(M.team===a%2?-1:1)-(I.team===a%2?-1:1)||M.id.localeCompare(I.id));for(const M of R){const F=[...m[M.id].visited].reverse().find(B=>Qi(n.map,B)&&!A.has(Je(B)));F?(M.pos=dt(F),M.xy=kt(F),A.add(Je(F)),f(`${M.label} 沿原路回退`,F,M.team)):h(M,M.hp,"碰撞搁浅")}for(const M of n.planes){const I=n.ships.find(F=>F.id===M.mother);M.state==="return"&&(!I||!lt(I))&&(M.hp=0,I&&!M.accounted&&I.destroyedPlanes++,M.accounted=!0,f("返航飞机失去母舰",rt(M.xy),M.team))}n.planes=n.planes.filter(lt);for(const M of n.planes){const I=n.ships.find(F=>F.id===M.targetId);I&&M.tracking&&(M.target=dt(rt(I.xy))),M.tracking=!1}for(const M of n.ships.filter(lt))if(M.cfg.carrier)for(let I=0;I<M.airReady.length;I++)M.airReady[I]===a+1&&(M.airHP[I]=Math.min(M.cfg.carrier.plane.hp,M.airHP[I]+(M.cfg.carrier.heal??1)));Xs(n),i.push(sh(n,1.1,r)),n.log=[...n.log,...s].slice(-300);const L=[0,1].map(M=>{const I=n.ships.filter(F=>F.team===M&&lt(F));return{count:I.length,hp:I.reduce((F,B)=>F+B.hp,0)}});return!L[0].count||!L[1].count||a>=Pi.roundLimit?(n.winner=L[0].count===L[1].count?L[0].hp===L[1].hp?"draw":L[0].hp>L[1].hp?0:1:L[0].count>L[1].count?0:1,n.phase="ended"):(n.round++,n.phase="plan"),{game:n,frames:i,events:s,counts:L,presentation:o}}function qA(t,e,n=0){const i=new Map,s=[],r=(o,a)=>`${Je(o)}:${a}`;for(const o of bo())if(Qi(t,o)&&Yt(o,e)===n&&rr(t,o,e))for(let a=0;a<6;a++)i.set(r(o,a),0),s.push({h:o,d:a});if(!s.length)for(let o=0;o<6;o++)i.set(r(e,o),0),s.push({h:e,d:o});for(let o=0;o<s.length;o++){const{h:a,d:l}=s[o],u=i.get(r(a,l))+1;for(const c of[-1,0,1])for(const f of[!0,!1]){const h=f?Ni(a,Pn(l+3)):a,d=Pn(l-c),m=r(h,d);Qi(t,h)&&!i.has(m)&&(i.set(m,u),s.push({h,d}))}}return i}function a1(t,e){var a;const n=r1(t,e),i=n.ships.filter(l=>l.team===e),s=n.ships.filter(l=>l.team!==e),r={},o=[];for(const l of i.sort((u,c)=>c.cfg.speed-u.cfg.speed||u.id.localeCompare(c.id))){const u=Gi();let c=dt(l.pos),f=l.heading;const h=l.cfg.carrier?7:l.cfg.main?6:((a=l.cfg.secondary)==null?void 0:a.range)||2,d=s.slice().sort((y,g)=>Yt(c,y.pos)-Yt(c,g.pos)||y.id.localeCompare(g.id))[0],m=e===0?[[16,12],[14,5],[9,2],[3,6]]:[[2,12],[4,5],[9,2],[15,6]],x=m[Math.floor((n.round-1)/5)%m.length],_=(d==null?void 0:d.pos)||Ar(x[0],Math.min(14,x[1]+Number(l.id.split("-")[1])%3)),p=qA(n.map,_,d?h:0);for(let y=0;y<l.cfg.speed;y++){let g=null;for(const E of[-1,0,1])for(const T of[!0,!1]){const C=Pn(f+E),v=T?Ni(c,C):c;if(!Qi(n.map,v))continue;let A=-(p.get(`${Je(v)}:${C}`)??100)*2.5+(T?.1:0)-Math.abs(E)*.06;n.map.mines.some(R=>tn(R,v))&&!l.cfg.contactSweep&&(A-=12);for(const R of i)R.id!==l.id&&Yt(v,R.pos)<1&&(A-=10);for(const R of o)Yt(v,R)<1&&(A-=15);for(const R of n.torpedoes){const L=rt(R.xy);for(let M=0;M<3;M++)tn(v,{q:L.q+ns[R.heading][0]*M,r:L.r+ns[R.heading][1]*M})&&(A-=8)}(!g||A>g.score)&&(g={turn:E,forward:T,h:v,hd:C,score:A})}if(!g)break;u.moves.push({turn:g.turn,forward:g.forward}),c=g.h,f=g.hd}o.push(c);const b=di(l,u,n.map);if(l.cfg.torpedo&&l.torps&&s.length){const y=[];for(let g=0;g<b.length;g++)for(let E=0;E<6;E++){if([b[g].heading,Pn(b[g].heading+3)].includes(E))continue;let T=b[g].pos,C=0;for(let v=1;v<=10&&(T=Ni(T,E),!!Qi(n.map,T));v++){i.some(A=>A.id!==l.id&&tn(A.pos,T))&&(C-=20);for(const A of s){tn(A.pos,T)&&(C+=12/(1+v*.1));const R=Ni(A.pos,A.heading);tn(R,T)&&(C+=6)}}C>3&&y.push({window:g,dir:E,score:C})}y.sort((g,E)=>E.score-g.score);for(const g of y)!u.torps.some(E=>E.window===g.window)&&u.torps.length<Math.min(l.torps,l.cfg.torpedo.max)&&u.torps.push(g)}if(l.cfg.main&&l.mainReady<=n.round){const y=s.filter(g=>Yt(l.pos,g.pos)<=l.cfg.main.range);if(y.length){const g=y.sort((T,C)=>T.hp-C.hp)[0],E=Ni(g.pos,g.heading);u.main=[dt(g.pos),dt(Qi(n.map,E)&&Yt(l.pos,E)<=l.cfg.main.range?E:g.pos),dt(g.pos)]}}if(l.cfg.carrier){const y=Math.min(l.cfg.carrier.launch,l.airReady.filter(g=>g<=n.round).length);for(let g=0;g<y;g++)d?u.planes.push({mode:"target",targetId:d.id}):u.planes.push({mode:"point",target:Ar(e===0?13:5,5+(Number(l.id.split("-")[1])+g*3)%8)})}if(l.cfg.secondary){const y=n.map.mines.find(g=>Yt(l.pos,g)<=l.cfg.secondary.range&&rr(n.map,l.pos,g)&&b.some(E=>Yt(E.pos,g)<=1));y&&!l.cfg.contactSweep&&(u.sweep=dt(y))}r[l.id]=wf(t,l,u)}return r}const rh=Object.freeze(Object.defineProperty({__proto__:null,DEFAULT_ROSTER:Bc,DIRS:ns,H:Xl,RULES:Pi,TEMPLATES:Nc,W:Rr,add:Ni,alive:lt,allHexes:bo,clone:dt,collisionRadius:wl,createGame:s1,createShip:xd,deployment:po,emptyPlan:Gi,fromCR:Ar,generateMap:i1,hasLOS:rr,hexDist:Yt,hexLine:n1,hexToXY:kt,inBounds:Ir,key:Je,legal:Qi,mod:Pn,observe:r1,planAI:a1,resolveRound:o1,roundHex:um,route:di,same:tn,toCR:Ea,updateExploration:Xs,validPlan:wf,visibleCells:gs,xyToHex:rt},Symbol.toStringTag,{value:"Module"})),Uc=(t,e)=>{const n=kt(t),i=kt(e);return Math.hypot(n.x-i.x,n.y-i.y)/Math.sqrt(3)},cm=(t,e)=>({...t,islands:t.islands.filter(n=>e.has(n))});function fm(t,e,n,i=null){var c;const s=di(t,e,n),r=s.at(-1),o=Math.max(0,t.cfg.speed-(((c=e.moves)==null?void 0:c.length)||0)),a=new Map,l=[{pos:{...r.pos},heading:r.heading,cost:0,moves:[],path:[{...r.pos}]}],u=new Set([`${Je(r.pos)}:${r.heading}`]);for(let f=0;f<l.length;f++){const h=l[f],d=Je(h.pos);if(a.has(d)||a.set(d,h),!(h.cost>=o))for(const m of[0,-1,1])for(const x of[!0,!1]){const _=Pn(h.heading+m),p=x?Ni(h.pos,_):h.pos,b=`${Je(p)}:${_}`;!Qi(n,p)||i&&!i.has(Je(p))||u.has(b)||(u.add(b),l.push({pos:{...p},heading:_,cost:h.cost+1,moves:[...h.moves,{turn:m,forward:x}],path:[...h.path,{...p}]}))}}return a}const l1=(t,e,n,i)=>fm(t,e,n,i),YA=(t,e)=>new Map([...t].filter(([n,i])=>e.has(n)&&i.path.every(s=>e.has(Je(s)))));function u1(t,e,n){const i=di(t,e,n).at(-1).pos,s=new Set,r=new Set,o=new Set,a=new Set,l=new Set;for(const u of bo()){const c=Je(u);t.cfg.main&&Yt(t.pos,u)<=t.cfg.main.range&&s.add(c),t.cfg.secondary&&Yt(i,u)<=t.cfg.secondary.range&&rr(n,i,u)&&r.add(c),t.cfg.secondary&&Yt(t.pos,u)<=t.cfg.secondary.range&&rr(n,t.pos,u)&&a.add(c),t.cfg.aa&&Yt(i,u)<=t.cfg.aa.range&&o.add(c),t.cfg.carrier&&Uc(t.pos,u)<=t.cfg.carrier.plane.range+1e-8&&l.add(c)}return{main:s,secondary:r,aa:o,sweep:a,air:l,end:i}}function Ed(t,e,n,i){if(!t.cfg.torpedo)return[];const s=di(t,e,n)[i];if(!s)return[];const r=t.cfg.torpedo,o=r.speed*(1-i/t.cfg.speed),a=r.speed*r.life,l=[];for(let u=0;u<6;u++)if(![s.heading,Pn(s.heading+3)].includes(u)){const c=[];let f=s.pos;for(let m=1;m<=Math.floor(a)&&(f=Ni(f,u),!!Qi(n,f));m++)c.push({...f});const h=Math.min(a,c.length+.5-1e-6),d=m=>({q:s.pos.q+ns[u][0]*m,r:s.pos.r+ns[u][1]*m});l.push({dir:u,origin:{...s.pos},cells:c,roundDistance:o,maxDistance:a,roundEnd:d(Math.min(o,h)),fullEnd:d(h)})}return l}function ju(t,e,n,i){const s=dt(e),r=[];s.moves=s.moves.slice(0,Math.max(0,i)),s.segments=(s.segments||[]).filter(a=>a.end<=s.moves.length);const o=di(t,s,n);return s.torps=(s.torps||[]).filter(a=>{const l=o[a.window],u=!!l&&![l.heading,Pn(l.heading+3)].includes(a.dir);return u||r.push(a),u}),{plan:s,removedTorps:r.length}}function c1(t,e,n,i){if(JSON.stringify(n)===JSON.stringify(i))return!1;const s=t[e]||(t[e]={undo:[],redo:[]});return s.undo.push(dt(n)),s.undo.length>60&&s.undo.shift(),s.redo=[],!0}function f1(t,e,n,i){var o;const s=t[e];return!s||!((o=s[i])!=null&&o.length)?null:(s[i==="undo"?"redo":"undo"].push(dt(n)),s[i].pop())}function h1(t,e,n,i,s){const r=(l,u,c)=>{const f=Math.min(c*l.cfg.speed,u.length-1),h=Math.floor(f),d=kt(u[h].pos),m=kt(u[Math.min(h+1,u.length-1)].pos),x=f-h;return{x:d.x+(m.x-d.x)*x,y:d.y+(m.y-d.y)*x}},o=di(t,e,s),a=[];for(const l of n.filter(u=>u.id!==t.id&&u.team===t.team&&lt(u))){const u=di(l,i[l.id]||Gi(),s),c=[...new Set([0,1,...o.map((f,h)=>h/t.cfg.speed),...u.map((f,h)=>h/l.cfg.speed)])].sort((f,h)=>f-h);for(let f=1;f<c.length;f++){const h=r(t,o,c[f-1]),d=r(t,o,c[f]),m=r(l,u,c[f-1]),x=r(l,u,c[f]),_=h.x-m.x,p=h.y-m.y,b=d.x-h.x-x.x+m.x,y=d.y-h.y-x.y+m.y,g=b*b+y*y,E=g?Math.max(0,Math.min(1,-(_*b+p*y)/g)):0;if(Math.hypot(_+b*E,p+y*E)<=wl(t)+wl(l)+1e-9){a.push(l.label);break}}}return a}function d1(t,e,n){var r,o;const i=cm(t.map,new Set(((r=t.explored)==null?void 0:r[0])||[])),s={};for(const a of t.ships.filter(l=>l.team===0&&lt(l))){const l=e[a.id];if(!((o=l==null?void 0:l.moves)!=null&&o.length))continue;const u=di(a,l,i).at(-1).pos,c=n.game.ships.find(m=>m.id===a.id),f=n.events.some(m=>m.team===0&&m.text.startsWith(a.label+" ")&&/碰撞|沿原路回退/.test(m.text)),h=wf(t,a,l).moves.length,d=lt(c)?f?"碰撞截停并回退":h<l.moves.length?"航路被地形截停":tn(c.pos,u)?"已执行并到达":"未到达计划终点":"执行中沉没";s[a.id]={steps:l.moves.length,received:h,reason:d,blocked:d!=="已执行并到达"}}return s}const KA=Object.freeze(Object.defineProperty({__proto__:null,airDistance:Uc,certainReachable:YA,friendlyRouteConflicts:h1,historyStep:f1,knowledgeMap:cm,knownReachable:l1,movementOutcomes:d1,ranges:u1,reachable:fm,recordEdit:c1,torpedoRays:Ed,trimMovement:ju},Symbol.toStringTag,{value:"Module"})),hm="azurlane-chess",dm=1,Sd=Object.freeze(["auto","slot-1","slot-2","slot-3"]),Cl=2e6,p1="azurlane:airborne",J0=["dd","cl","ca","bb","cv"],ZA=new Set(["__proto__","prototype","constructor"]),JA=new Set(["busy","playFrame","progress","finished","animationTimer","toastTimer","hover","toast","screen","showRules","showLog","pendingTurn","torpWindow","mode","planeMode","history","playSpeed"]);class pm extends Error{constructor(e,n,i=""){super(i?`${n} (${i})`:n),this.name="SaveError",this.code=e,this.path=i}}const cn=(t,e,n="")=>{throw new pm(t,e,n)},ut=(t,e,n="INVALID_STATE")=>{t||cn(n,"存档数据不符合当前规则",e)},Ft=(t,e,n,i,s)=>ut(Number.isSafeInteger(t)&&t>=e&&t<=n,i,s),Wt=(t,e,n,i,s)=>ut(typeof t=="number"&&Number.isFinite(t)&&t>=e&&t<=n,i,s),ds=(t,e,n,i,s=!0)=>ut(typeof t=="string"&&t.length<=e&&(s||t.length>0),n,i),en=(t,e,n)=>ut(t!==null&&typeof t=="object"&&!Array.isArray(t),e,n),ol=(t,e,n)=>ut(typeof t=="boolean",e,n),wn=(t,e,n,i)=>ut(Array.isArray(t)&&t.length<=e,n,i),fs=(t,e)=>Object.hasOwn(t,e),Ci=t=>t.join(".");function jA(t){const e=t[0]==="state"?t.slice(1):t;return e.length===5&&e[0]==="game"&&e[1]==="ships"&&typeof e[2]=="number"&&e[3]==="airReady"&&typeof e[4]=="number"}function Oc(t,e="INVALID_STATE",n=!0){let i=0,s=0;const r=new WeakSet,o=(l,u)=>{s+=new TextEncoder().encode(l).byteLength,s>Cl&&cn(e,"存档数据过大",Ci(u))};function a(l,u,c){if((++i>5e4||c>32)&&cn(e,"存档数据过大或嵌套过深",Ci(u)),l===null||typeof l=="boolean")return l;if(typeof l=="string")return l.length>2e4&&cn(e,"存档文本过长",Ci(u)),o(l,u),l;if(typeof l=="number")return!Number.isFinite(l)&&!(n&&l===1/0&&jA(u))&&cn(e,"存档包含无效数值",Ci(u)),l;typeof l!="object"&&cn(e,"存档只能包含普通数据",Ci(u));const f=Object.getPrototypeOf(l),h=Array.isArray(l);(h?f!==Array.prototype:f!==Object.prototype&&f!==null)&&cn(e,"存档包含不受支持的对象",Ci(u)),r.has(l)&&cn(e,"存档包含循环引用",Ci(u)),r.add(l);const d=Reflect.ownKeys(l);(h&&l.length>1e4||!h&&d.length>200)&&cn(e,"存档数组或对象过大",Ci(u));const m=h?[]:{};for(const x of d){if(h&&x==="length")continue;(typeof x!="string"||ZA.has(x))&&cn(e,"存档包含不安全字段",Ci([...u,String(x)])),o(x,[...u,x]);const _=Object.getOwnPropertyDescriptor(l,x);(!_||!fs(_,"value")||!_.enumerable)&&cn(e,"存档包含非普通字段",Ci([...u,x])),h&&(!/^(0|[1-9]\d*)$/.test(x)||Number(x)>=l.length)&&cn(e,"存档数组格式无效",Ci(u)),Object.defineProperty(m,x,{value:a(_.value,[...u,h?Number(x):x],c+1),enumerable:!0,writable:!0,configurable:!0})}return h&&d.length!==l.length+1&&cn(e,"存档数组存在空缺",Ci(u)),r.delete(l),m}return a(t,[],0)}function ks(t,e,n){en(t,e,n),Ft(t.q,-7,18,`${e}.q`,n),Ft(t.r,0,14,`${e}.r`,n);const i=t.q+Math.floor(t.r/2);ut(i>=0&&i<19,e,n)}function oh(t,e,n){en(t,e,n),Wt(t.x,-1e3,1e3,`${e}.x`,n),Wt(t.y,-1e3,1e3,`${e}.y`,n)}function j0(t,e,n){ds(t,16,e,n,!1),ut(/^-?\d+,\d+$/.test(t),e,n);const[i,s]=t.split(",").map(Number);ks({q:i,r:s},e,n),ut(t===`${i},${s}`,e,n)}function fr(t,e,n,i=s=>s){ut(new Set(t.map(i)).size===t.length,e,n)}function QA(t,e,n){if(en(t,e,n),ds(t.name,100,`${e}.name`,n,!1),ut(["front","back"].includes(t.role),`${e}.role`,n),Wt(t.radius,.001,20,`${e}.radius`,n),Wt(t.hp,1,1e5,`${e}.hp`,n),Ft(t.speed,0,20,`${e}.speed`,n),Ft(t.vision,0,40,`${e}.vision`,n),Wt(t.collision,0,1e5,`${e}.collision`,n),fs(t,"contactSweep")&&ol(t.contactSweep,`${e}.contactSweep`,n),fs(t,"secondary")){const i=t.secondary;en(i,`${e}.secondary`,n),Wt(i.damage,0,1e5,`${e}.secondary.damage`,n),Wt(i.range,0,40,`${e}.secondary.range`,n),ol(i.multi,`${e}.secondary.multi`,n)}if(fs(t,"torpedo")&&(m1(t.torpedo,`${e}.torpedo`,n),Ft(t.torpedo.reserve,0,100,`${e}.torpedo.reserve`,n),Ft(t.torpedo.max,0,100,`${e}.torpedo.max`,n)),fs(t,"aa")&&(en(t.aa,`${e}.aa`,n),Wt(t.aa.range,0,40,`${e}.aa.range`,n),Wt(t.aa.damage,0,1e5,`${e}.aa.damage`,n)),fs(t,"main")&&(en(t.main,`${e}.main`,n),Wt(t.main.range,0,40,`${e}.main.range`,n),Ft(t.main.shots,0,100,`${e}.main.shots`,n),Wt(t.main.damage,0,1e5,`${e}.main.damage`,n),Ft(t.main.reload,0,100,`${e}.main.reload`,n)),fs(t,"carrier")){const i=t.carrier;en(i,`${e}.carrier`,n),Ft(i.stock,0,100,`${e}.carrier.stock`,n),Ft(i.launch,0,100,`${e}.carrier.launch`,n),Ft(i.rearm,0,100,`${e}.carrier.rearm`,n),fs(i,"heal")&&Wt(i.heal,0,1e4,`${e}.carrier.heal`,n),g1(i.plane,`${e}.carrier.plane`,n)}}function m1(t,e,n){en(t,e,n),Wt(t.speed,.001,100,`${e}.speed`,n),Wt(t.damage,0,1e5,`${e}.damage`,n),Wt(t.life,.001,100,`${e}.life`,n)}function g1(t,e,n){en(t,e,n),Wt(t.hp,.001,1e5,`${e}.hp`,n),Wt(t.speed,.001,100,`${e}.speed`,n),Wt(t.vision,0,40,`${e}.vision`,n),Wt(t.range,.001,1e3,`${e}.range`,n),Wt(t.damage,0,1e5,`${e}.damage`,n)}function _1(t,e){var r,o;en(t,"state",e);const n=t.game;en(n,"game",e),ut(["deploy","plan","ended"].includes(n.phase),"game.phase",e),Ft(n.seed,-Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER,"game.seed",e),Ft(n.round,1,30,"game.round",e),Ft(n.nextId,0,1e6,"game.nextId",e),ut([null,0,1,"draw"].includes(n.winner),"game.winner",e),ut(n.phase==="ended"?n.winner!==null:n.winner===null,"game.winner",e),en(n.map,"game.map",e),ut(n.map.width===19&&n.map.height===15,"game.map dimensions",e),wn(n.map.islands,285,"game.map.islands",e),n.map.islands.forEach((a,l)=>j0(a,`game.map.islands.${l}`,e)),fr(n.map.islands,"game.map.islands",e),wn(n.map.mines,285,"game.map.mines",e),n.map.mines.forEach((a,l)=>ks(a,`game.map.mines.${l}`,e)),fr(n.map.mines,"game.map.mines",e,a=>`${a.q},${a.r}`),ut(n.map.mines.every(a=>!n.map.islands.includes(`${a.q},${a.r}`)),"game.map.mines",e),wn(n.explored,2,"game.explored",e),ut(n.explored.length===2,"game.explored",e),n.explored.forEach((a,l)=>{wn(a,285,`game.explored.${l}`,e),a.forEach((u,c)=>j0(u,`game.explored.${l}.${c}`,e)),fr(a,`game.explored.${l}`,e)}),wn(n.ships,10,"game.ships",e),ut(n.ships.length===10,"game.ships",e),fr(n.ships,"game.ships ids",e,a=>a==null?void 0:a.id),n.ships.forEach((a,l)=>{var c,f,h;const u=`game.ships.${l}`;en(a,u,e),ds(a.id,80,`${u}.id`,e,!1),ut(a.kind==="ship",`${u}.kind`,e),Ft(a.team,0,1,`${u}.team`,e),ds(a.label,100,`${u}.label`,e,!1),ut(J0.includes(a.template),`${u}.template`,e),QA(a.cfg,`${u}.cfg`,e),Wt(a.hp,0,a.cfg.hp,`${u}.hp`,e),ks(a.pos,`${u}.pos`,e),oh(a.xy,`${u}.xy`,e),Ft(a.heading,0,5,`${u}.heading`,e),Ft(a.torps,0,((c=a.cfg.torpedo)==null?void 0:c.reserve)||0,`${u}.torps`,e),Ft(a.mainReady,0,1e3,`${u}.mainReady`,e),Ft(a.destroyedPlanes,0,((f=a.cfg.carrier)==null?void 0:f.stock)||0,`${u}.destroyedPlanes`,e),wn(a.airReady,100,`${u}.airReady`,e),ut(a.airReady.length===(((h=a.cfg.carrier)==null?void 0:h.stock)||0),`${u}.airReady`,e),fs(a,"airHP")&&(wn(a.airHP,100,`${u}.airHP`,e),ut(a.airHP.length===a.airReady.length,`${u}.airHP`,e),a.airHP.forEach((d,m)=>{var x;return Wt(d,0,((x=a.cfg.carrier)==null?void 0:x.plane.hp)||0,`${u}.airHP.${m}`,e)})),a.airReady.forEach((d,m)=>{d!==1/0&&Ft(d,0,1e3,`${u}.airReady.${m}`,e)})}),ut([0,1].every(a=>n.ships.filter(l=>l.team===a).length===5),"game.ships teams",e);const i=new Map(n.ships.map(a=>[a.id,a]));wn(n.torpedoes,300,"game.torpedoes",e),fr(n.torpedoes,"game.torpedoes ids",e,a=>a==null?void 0:a.id),n.torpedoes.forEach((a,l)=>{const u=`game.torpedoes.${l}`;en(a,u,e),ds(a.id,80,`${u}.id`,e,!1),ut(a.kind==="torpedo",`${u}.kind`,e),Ft(a.team,0,1,`${u}.team`,e),ut(i.has(a.owner)&&i.get(a.owner).team===a.team,`${u}.owner`,e),oh(a.xy,`${u}.xy`,e),Ft(a.heading,0,5,`${u}.heading`,e),m1(a.cfg,`${u}.cfg`,e),Wt(a.age,0,a.cfg.life,`${u}.age`,e),Ft(a.launched,1,n.round,`${u}.launched`,e),Wt(a.birth,0,1,`${u}.birth`,e),ol(a.armed,`${u}.armed`,e)}),wn(n.planes,100,"game.planes",e),fr(n.planes,"game.planes ids",e,a=>a==null?void 0:a.id);const s=new Set;n.planes.forEach((a,l)=>{const u=`game.planes.${l}`;en(a,u,e),ds(a.id,80,`${u}.id`,e,!1),ut(a.kind==="plane",`${u}.kind`,e),Ft(a.team,0,1,`${u}.team`,e);const c=i.get(a.mother);ut(!!c&&c.team===a.team&&!!c.cfg.carrier,`${u}.mother`,e),Ft(a.slot,0,c.airReady.length-1,`${u}.slot`,e),ut(c.airReady[a.slot]===1/0,`${u}.slot readiness`,e);const f=`${a.mother}:${a.slot}`;ut(!s.has(f),`${u}.slot duplicate`,e),s.add(f),g1(a.cfg,`${u}.cfg`,e),Wt(a.hp,.001,a.cfg.hp,`${u}.hp`,e),oh(a.xy,`${u}.xy`,e),ks(a.target,`${u}.target`,e),ut(["point","target"].includes(a.mode),`${u}.mode`,e),ut(a.targetId===null||i.has(a.targetId)&&i.get(a.targetId).team!==a.team,`${u}.targetId`,e),ut(a.mode!=="target"||a.targetId!==null,`${u}.targetId`,e),ol(a.tracking,`${u}.tracking`,e),ut(["outbound","return"].includes(a.state),`${u}.state`,e),Wt(a.traveled,0,a.cfg.range+1e-6,`${u}.traveled`,e),wn(a.waypoints,100,`${u}.waypoints`,e)}),fr([...n.ships,...n.torpedoes,...n.planes],"game unit ids",e,a=>a.id),wn(n.log,300,"game.log",e),n.log.forEach((a,l)=>{const u=`game.log.${l}`;en(a,u,e),Ft(a.round,1,n.round,`${u}.round`,e),Wt(a.t,0,1.1,`${u}.t`,e),ds(a.text,1e3,`${u}.text`,e),a.at!==null&&ks(a.at,`${u}.at`,e),ut([null,0,1].includes(a.team),`${u}.team`,e)}),wn(t.roster,5,"roster",e),ut(t.roster.length===5&&t.roster.every((a,l)=>J0.includes(a)&&(l<3?["dd","cl","ca"].includes(a):["bb","cv"].includes(a))),"roster",e),Ft(t.seed,-Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER,"seed",e),ut(t.seed===n.seed,"seed",e),ds(t.selected,80,"selected",e),ut(t.selected===""||i.has(t.selected)&&i.get(t.selected).team===0,"selected",e),en(t.plans,"plans",e),ut(Object.keys(t.plans).length<=10,"plans",e);for(const[a,l]of Object.entries(t.plans)){const u=`plans.${a}`,c=i.get(a);ut(!!c,u,e),en(l,u,e),wn(l.moves,c.cfg.speed,`${u}.moves`,e),l.moves.forEach((f,h)=>{en(f,`${u}.moves.${h}`,e),Ft(f.turn,-1,1,`${u}.moves.${h}.turn`,e),ol(f.forward,`${u}.moves.${h}.forward`,e)}),wn(l.torps,c.cfg.torpedo?Math.min(c.cfg.torpedo.max,c.torps):0,`${u}.torps`,e),fr(l.torps,`${u}.torps windows`,e,f=>f==null?void 0:f.window),l.torps.forEach((f,h)=>{en(f,`${u}.torps.${h}`,e),Ft(f.window,0,l.moves.length,`${u}.torps.${h}.window`,e),Ft(f.dir,0,5,`${u}.torps.${h}.dir`,e)}),wn(l.main,((r=c.cfg.main)==null?void 0:r.shots)||0,`${u}.main`,e),l.main.forEach((f,h)=>ks(f,`${u}.main.${h}`,e)),wn(l.planes,((o=c.cfg.carrier)==null?void 0:o.launch)||0,`${u}.planes`,e),l.planes.forEach((f,h)=>{en(f,`${u}.planes.${h}`,e),ut(["point","target"].includes(f.mode),`${u}.planes.${h}.mode`,e),f.mode==="point"?ks(f.target,`${u}.planes.${h}.target`,e):ut(i.has(f.targetId)&&i.get(f.targetId).team!==c.team,`${u}.planes.${h}.targetId`,e)}),l.sweep!==null&&(ut(!!c.cfg.secondary,`${u}.sweep`,e),ks(l.sweep,`${u}.sweep`,e)),fs(l,"segments")&&(wn(l.segments,c.cfg.speed,`${u}.segments`,e),l.segments.forEach((f,h)=>{const d=`${u}.segments.${h}`;en(f,d,e),Ft(f.start,0,l.moves.length,`${d}.start`,e),Ft(f.end,f.start,l.moves.length,`${d}.end`,e),ks(f.target,`${d}.target`,e)}))}return t}function v1(t,e="INVALID_SAVE"){return en(t,"save",e),ut(t.magic===hm,"magic",e),t.schemaVersion!==dm&&cn("UNSUPPORTED_VERSION","这个存档版本暂不支持，请使用对应版本的游戏"),ds(t.label,80,"label",e),ds(t.timestamp,30,"timestamp",e,!1),ut(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(t.timestamp)&&Number.isFinite(Date.parse(t.timestamp))&&new Date(t.timestamp).toISOString()===t.timestamp,"timestamp",e),_1(t.state,e),t}function x1(t){(t.length>Cl||new TextEncoder().encode(t).byteLength>Cl)&&cn("SAVE_TOO_LARGE","存档文件过大（最大 2 MB）")}function mm(t,{label:e="未命名存档",timestamp:n=new Date().toISOString()}={}){const i=Oc(t,"INVALID_STATE");for(const r of JA)delete i[r];_1(i,"INVALID_STATE");const s=Oc({magic:hm,schemaVersion:dm,timestamp:n,label:e,state:i},"INVALID_STATE");return v1(s,"INVALID_STATE")}function Cf(t){return v1(Oc(t,"INVALID_SAVE"))}function y1(t){return Cf(t)}function kc(t){const e=Cf(t);for(const i of e.state.game.ships)i.airReady=i.airReady.map(s=>s===1/0?p1:s);const n=JSON.stringify(e,null,2);return x1(n),n}function zc(t){var i,s;typeof t!="string"&&cn("INVALID_JSON","请选择 JSON 存档文件"),x1(t);let e;try{e=JSON.parse(t)}catch{cn("INVALID_JSON","存档文件不是有效的 JSON")}const n=Oc(e,"INVALID_SAVE",!1);if((s=(i=n==null?void 0:n.state)==null?void 0:i.game)!=null&&s.ships&&Array.isArray(n.state.game.ships))for(const r of n.state.game.ships)Array.isArray(r==null?void 0:r.airReady)&&(r.airReady=r.airReady.map(o=>o===p1?1/0:o));return y1(n)}function E1(t){const e=Cf(t),n=e.label.normalize("NFKC").replace(/[\\/:*?"<>|\x00-\x1f]/g,"-").replace(/\s+/g,"-").replace(/^[. -]+|[. -]+$/g,"").slice(0,40)||"save";return`azurlane-chess-${e.timestamp.slice(0,10)}-R${String(e.state.game.round).padStart(2,"0")}-${n}.json`}function eT(t){return t instanceof pm?{ok:!1,error:{code:t.code,message:t.message}}:(t==null?void 0:t.name)==="QuotaExceededError"||(t==null?void 0:t.name)==="NS_ERROR_DOM_QUOTA_REACHED"||(t==null?void 0:t.code)===22||(t==null?void 0:t.code)===1014?{ok:!1,error:{code:"STORAGE_QUOTA",message:"浏览器存储空间不足，请导出备份或删除不需要的存档"}}:{ok:!1,error:{code:"STORAGE_UNAVAILABLE",message:"浏览器无法保存到本地；请允许站点存储，或导出 JSON 备份"}}}function S1({storage:t,prefix:e="azurlane-chess:v1",now:n=()=>new Date().toISOString()}={}){function i(){const a=t===void 0?globalThis.localStorage:t;return(!a||typeof a.getItem!="function"||typeof a.setItem!="function"||typeof a.removeItem!="function")&&cn("STORAGE_UNAVAILABLE","浏览器无法访问本地存储，请导出 JSON 备份"),a}function s(a){return Sd.includes(a)||cn("INVALID_SLOT","请选择有效的存档槽"),`${e}:${a}`}function r(a){try{return a()}catch(l){return eT(l)}}const o={read(a){return r(()=>{const l=s(a),u=i().getItem(l);return u===null&&cn("SAVE_NOT_FOUND","这个存档槽还没有存档"),{ok:!0,save:zc(u)}})},write(a,l,u={}){return r(()=>{const c=s(a),f=mm(l,{...u,timestamp:u.timestamp??n()}),h=kc(f);return i().setItem(c,h),{ok:!0,save:f}})},import(a,l){return r(()=>{const u=s(a),c=zc(l),f=kc(c);return i().setItem(u,f),{ok:!0,save:c}})},remove(a){return r(()=>{const l=s(a);return i().removeItem(l),{ok:!0}})},list(){return Sd.map(a=>{const l=o.read(a);return{id:a,save:l.ok?l.save:null,error:l.ok||l.error.code==="SAVE_NOT_FOUND"?null:l.error}})}};return o}const tT=Object.freeze(Object.defineProperty({__proto__:null,MAX_SAVE_BYTES:Cl,SAVE_MAGIC:hm,SAVE_SLOTS:Sd,SAVE_VERSION:dm,SaveError:pm,createSave:mm,createSaveStorage:S1,deserializeSave:zc,exportFilename:E1,migrateSave:y1,serializeSave:kc,validateSave:Cf},Symbol.toStringTag,{value:"Module"})),nT="2026-10-03.1",Mo={},iT=(t,e)=>({q:t,r:e}),_i=(t,e)=>iT(t-Math.floor(e/2),e),gu=t=>({kind:"ship",shipId:t}),Bt=t=>({kind:"control",id:t}),Nn=(t,e)=>({kind:"cell",cell:_i(t,e)}),It=(...t)=>({kind:"all",conditions:t}),Ct=(t,e={})=>({kind:"event",types:Array.isArray(t)?t:[t],...e}),ri=(t,e)=>({kind:"planMoves",shipId:t,count:e}),_u=(t,e,n)=>({kind:"routeEnd",shipId:t,cell:_i(e,n)}),ah=(t,e,n,i)=>({kind:"moveAt",shipId:t,index:e,turn:n,forward:i}),lh=t=>({kind:"selected",shipId:t}),Rt=(t,e,n,i,s,r,o)=>({id:t,title:e,instruction:n,hint:i,success:s,highlights:r,condition:o}),sT=[{id:"quick-start",title:"先下令，再一起行动",figure:"timeline",summary:"规划没有倒计时。给每艘船安排动作，检查全舰航线，再执行这一回合。",paragraphs:["主菜单的“新游戏”先选 3 艘前排、2 艘后排，再进入左下角蓝色 3×3 部署区。相同配置可以重复选；前后排只是编队标签，出海后都能自由活动。点击我方舰船，再点击蓝区空格调整部署；左键点另一艘我方舰船会切换选择；先选要移动的船，点“交换位置”再点另一艘友舰即可换位（鼠标也可右键已占用格）。","进入规划后，左键选舰；右键点击目标格追加一段航线，再右键另一个目标继续追加。手机建议横屏：单指拖动海图、双指缩放，点“定位当前舰”可放大当前舰附近；“全图”恢复总览。在“航线”模式点击海格，或使用指令面板的方向、前进、等待按钮；竖屏也可展开底部指令。切换选舰后，全舰队已规划的航线仍显示，方便避碰。没有指令的船原地待命，副炮、防空照常自动工作。","点“执行回合”后，双方所有单位在同一条时间轴上行动，不是轮到哪艘船就先走完哪艘。速度 4 的船每步占 1/4 回合，速度 2 的船每步占 1/2 回合。可以调播放速度或跳过动画，这只改变观看方式。"],takeaway:"先检查友军的整条航路，而不只是各自终点。"},{id:"movement",title:"航线、转向与反悔",figure:"route",summary:"每步最多转 60°；转向前进或原地转向，都占一个移动步骤。",paragraphs:["选择左转60°、直行、右转60°，再点“前进”：先按该方向转向，再前进一格，总共只占一步。点“等待/原地转向”：停在原格，也占一步。选择方向按钮本身不会执行转向。驱逐每轮 4 步，轻巡、重巡 3 步，战列、航母 2 步。","右键或触屏点击目标会自动找出剩余步数内的合法航段，包含必要的原地转向。浅青格表示当前航向和剩余步数能抵达的候选；进入未探索区仍可能遇到未知岛屿，因此这类候选不是通行保证。","“撤销航点”退回最后一次追加目标前，保留早先航段。点击路径节点可截去该点之后的步骤，再继续画；撤销修改/重做修改针对当前舰的编辑记录。用“重新规划”保留主炮、飞机、排雷等指令；失去节点或侧向不再合法的鱼雷会移除。每次改变航路后重新检查鱼雷窗口。"],takeaway:"可以放心改计划，执行前都不会推进战斗。"},{id:"fog",title:"三种迷雾，不保留敌舰幽灵",figure:"fog",summary:"海图记忆会留下，敌人的位置只在当前视野内显示。",paragraphs:["深色格是未探索：不透露岛屿形状。灰暗格是已探索但当前不可见：保留已知地形，不显示敌舰、敌方飞机或鱼雷。亮色格是当前可见：显示当下接触。水雷是公开的例外，即使落在未探索格也显示，不能据此推断附近地形或敌舰。","全队共享探索记录。舰船视野 5 格、飞机视野 3 格；岛屿会挡视野。侦察单位离开后，海格变灰但不会重新变成未知。敌舰离开视野便消失，不画“最后位置”的船影。AI 也遵守同一视野规则。","选舰看移动范围，选择武器看对应射程或射线。主炮、远程排雷与飞机出发范围以回合开始的位置计算；副炮、防空在行动中随实体位置自动触发，终点覆盖仅供预估。鱼雷射线以选定发射节点与当时舰首方向计算。覆盖区不保证会命中，也不会揭露隐藏敌人。"],takeaway:"已探索 ≠ 现在能看见；武器覆盖 ≠ 必中。"},{id:"collision-secondary",title:"撞击与自动武器",figure:"collision",summary:"友军也会相撞；副炮、防空不用逐次手动指定目标。",paragraphs:["舰船按圆形实体连续检测碰撞，航路交叉或迎面接近都可能在到达格心前撞上。双方各受对方配置中的碰撞伤害，不区分友军和敌军。驱逐/轻巡/重巡/战列/航母的撞击伤害分别为 15/20/30/35/15。每对舰本回合只互撞结算一次，第三艘后来撞入仍可造成新伤害。","碰撞双方在接触点停止；还没到达的后续鱼雷节点不再发射。回合末先结算已发出的主炮，再让撞停舰沿自己实际完成的航路倒退到合法且无人占据的格；回退不能跳到从未到达的后续节点。没有合法退路会搁浅沉没。回退先后按队伍逐轮交替，同队按舰号稳定排序。","副炮在执行中自动寻找当前可见、射程内、且岛屿不遮挡的敌舰。普通副炮优先攻击最近的合格目标，每回合总共一炮；同距离按舰号决定。重巡的多目标副炮可对每艘合格敌舰各打一炮，同一敌舰每轮一次。目标在途中才进入射程也能触发。远程排雷占用该舰本轮全部副炮。","防空也自动触发：敌机进入防空射程后，每艘护航舰每轮对每架飞机打一发 1 伤害。驱逐防空 3 格，轻巡和重巡防空 2 格，战列和航母没有防空。每个时刻先结算防空，再判定撞击、鱼雷和航空投弹；2 HP 的飞机会被两艘护航舰截停。"],takeaway:"副炮要看射程、视野和遮挡；避碰要看全舰的同步轨迹。"},{id:"main-guns",title:"战列主炮：可以叠点，也可以盲射",figure:"weapons",summary:"开局发射，回合末落在指定格；不会自动追踪移动目标。",paragraphs:["选战列，再选“主炮”，在回合初位置的 9 格射程内点击落点。最多三发，每发 60 伤害；在同一格点三次就是三发叠点。可以向看不见的海格盲射，但规划时看见敌舰不代表回合末它还在那里。","主炮会误伤友军。已经发出的炮弹即使战列途中沉没也会落地。开火后需空过一个完整回合才能再次发射：第 1 回合开炮，第 2 回合装弹，第 3 回合恢复。远程排雷占副炮，不会占用主炮。"],takeaway:"瞄准敌人可能停留的格，检查友军终点，别只点现在的船。"},{id:"torpedoes",title:"鱼雷：先选窗口，再选侧向",figure:"weapons",summary:"节点 0 是回合起点，每个移动步骤结束还有一个发射窗口。",paragraphs:["驱逐与轻巡有鱼雷。选择窗口后，沿该节点舰首两侧的四个方向之一点击，不能沿正前或正后发射。每窗口一枚，每轮最多三枚，且受剩余备弹限制；驱逐备弹 3、轻巡备弹 9。改航路会改变窗口位置和朝向。","鱼雷速度 4 格/回合、45 伤害、累计最多飞 3 回合。晚发射的鱼雷在本轮剩余时间内飞得更短。离开发射舰所在格后才启用命中判定；遇岛或第一艘船就消失，友军也会被击中。发射后即使原舰沉没，鱼雷仍继续飞行。"],takeaway:"黄色射线是预测弹道；确认侧向、窗口和友军位置。"},{id:"aircraft",title:"飞机：侦察、投弹与返航",figure:"aircraft",summary:"航母有 6 架飞机，每轮最多放飞 2 架已整备飞机。",paragraphs:["飞机 2 HP，速度 6 格/回合，视野 3 格，炸弹 25 伤害。单程累计航程 12 格，不是每回合重置。飞机可以飞过岛屿；返航追踪母舰当前位置，返航路程不占这 12 格预算，回收后需整备一个完整回合，完成整备回复 1 HP，不超过飞机生命上限。","“定点”沿实际直线飞到点击的坐标，途中碰到第一艘敌舰即投弹并返航；不能当作逐格绕岛航路。“指定敌舰”只能选当前可见敌舰，只炸指定目标。目标本轮失去视野仍追踪；下轮未重获视野时飞向冻结的最后终点，到达还未找到就返航。途中重新发现目标可恢复追踪。","到达定点、目标沉没、投弹或单程航程用尽都会返航。返航机没有活着的母舰便立即丢失。防空在同刻投弹前处理，2 HP 飞机穿过两艘防空舰重叠区域可能投不出炸弹；航母最好有护航。"],takeaway:"飞机同时提供视野；别忘记防空区、12 格单程和母舰安全。"},{id:"mines-save",title:"水雷、保存与战局结束",figure:"fog",summary:"公共水雷始终可见，排雷与副炮共用机会。",paragraphs:["水雷触碰造成 40 伤害。驱逐有接触排雷，驶入雷格自动清除，排雷优先于同一格同一时刻触雷。其他有副炮的舰可在回合初副炮射程内、无遮挡时远程排雷；计划一处清雷会消耗该舰本回合全部副炮，不影响主炮。航母没有副炮，不能远程排雷。","在正常战局使用“保存游戏”保留当前状态和计划，主菜单“加载游戏”恢复。演练用练习保存，不会覆盖正常存档。执行动画未完成前先等结算，避免把中间画面误当回合终点。","任一方舰队全灭或第 30 回合结束便结算。先比较存活舰数，再比较剩余总 HP；两项都相同或双方全灭为平局。飞机不计入舰队数量。这是机制原型，数值与 AI 强度仍可能调整。"],takeaway:"需要离开时先保存，想找某条规则可随时返回图文手册。"}],Fr=[{id:"select-deploy",section:"core",title:"01 · 选舰与部署",duration:"25 秒",goal:"把驱逐放进蓝色部署区，再开始规划。",figure:"route",description:"演练不会改动你的正常战局。每一步都要在真实海图上操作；不必担心犯错，随时可重试。",steps:[Rt("select","选中驱逐","点击海图上的驱逐，或左侧“驱逐-1”。","先选我方驱逐；蓝色边框表示正在给这艘船下令。","选中了。舰首的小箭头表示朝向。",[gu("0-0")],It(Ct("select"),lh("0-0"))),Rt("deploy","调整部署","点击 B13，把驱逐部署到这个蓝色空格。","部署只能在左下角蓝色 3×3 区内；先选驱逐，再点 B13。","部署完成。舰队都能在这个区域调整位置。",[Nn(1,12)],It(Ct("deploy"),{kind:"shipAt",shipId:"0-0",cell:_i(1,12)})),Rt("begin","开始规划","点击“完成部署”。","点右上方“完成部署”，这不会立刻执行任何战斗动作。","现在可以不限时规划。",[Bt("begin")],It(Ct("begin"),{kind:"phase",value:"plan"}))]},{id:"route-segments",section:"core",title:"02 · 分段画航线",duration:"30 秒",goal:"先到 H11，再追加 I11。",figure:"route",description:"桌面右键点目标；手机在“航线”模式点海格，也可用侧栏。只改计划，不会移动实体船。",steps:[Rt("first-leg","第一航段","驱逐已选中。从 F11 右键 H11；触屏在“航线”模式点 H11。","请在 H11 追加目标。航向和剩余步数决定能不能到达。","第一段有两步，节点 1、2 已显示。",[gu("0-0"),Nn(7,10),Bt("move-mode")],It(Ct(["route","move"]),_u("0-0",7,10),ri("0-0",2))),Rt("second-leg","再加一段","再右键 I11；触屏点 I11。不要清掉先前的路径。","从上一段终点 H11 继续追加 I11。","航线现在是 F11 → G11 → H11 → I11。",[Nn(8,10)],It(Ct(["route","move"]),_u("0-0",8,10),ri("0-0",3)))]},{id:"turn-cost",section:"core",title:"03 · 转向也占步骤",duration:"35 秒",goal:"用前进、原地转向和直行花完轻巡的 3 步。",figure:"route",description:"每步最多转 60°。选转向按钮不会立即转船；要点前进或等待才写入计划。",steps:[Rt("turn-forward","左转并前进","选“左转60°”，再点“前进”。","先选左转，再前进；目标应是 F10，合起来只花一步。","第一步：左转 60°并前进，消耗 1 步。",[Bt("turn-left"),Bt("forward"),Nn(5,9)],It(Ct("move"),ah("0-0",0,-1,!0),ri("0-0",1))),Rt("turn-wait","原地右转","选“右转60°”，再点“原地等待/原地转向”。","这次用等待，位置留在 F10；原地转向也要占一步。","第二步：仍在 F10，舰首恢复朝东。",[Bt("turn-right"),Bt("wait")],It(Ct("move"),ah("0-0",1,1,!1),ri("0-0",2))),Rt("straight","保持航向前进","选“直行”，再点“前进”。","保持航向前进到 G10；轻巡总共只有 3 步。","第三步到 G10，移动预算已用完。",[Bt("turn-straight"),Bt("forward"),Nn(6,9)],It(Ct("move"),ah("0-0",2,0,!0),ri("0-0",3),_u("0-0",6,9)))]},{id:"undo-redraw",section:"core",title:"04 · 改航路，保留武器",duration:"40 秒",goal:"撤销、重做、截断与重画；保留已经安排的主炮。",figure:"route",description:"战列已有两段直行和一个 L11 主炮落点。这些操作只影响当前舰。",steps:[Rt("undo","撤销上一段","点击“撤销航点”。","撤销最后追加的一段，让终点回到 G11；较早的段和主炮都应保留。","最后一段撤回，早先航线和主炮仍在。",[Bt("undo-segment")],It(Ct("undo"),ri("0-0",1),{kind:"mainCount",shipId:"0-0",count:1})),Rt("redo","重做","点击“重做修改”。","重做把刚撤回的第二航段恢复，终点应回到 H11。","两段航线恢复。",[Bt("redo")],It(Ct("redo"),ri("0-0",2),{kind:"mainCount",shipId:"0-0",count:1})),Rt("truncate","从节点改道","点击路径节点 1（G11），保留这个节点并截去后续。","点青色路径的节点 1；不要删主炮，也不用清空全舰指令。","已从节点 1 截去后续，接下来可继续画新目标。",[Nn(6,10)],It(Ct("truncate"),ri("0-0",1),{kind:"mainCount",shipId:"0-0",count:1})),Rt("redraw","只重画航线","点击“重新规划”。","使用只改移动的按钮；L11 主炮落点必须仍然保留。","移动清空，主炮保留。改航路后也要检查鱼雷节点。",[Bt("redraw-movement")],It(Ct("redraw"),ri("0-0",0),{kind:"mainCount",shipId:"0-0",count:1}))]},{id:"timeline-collision",section:"core",title:"05 · 全舰同步与撞击",duration:"45 秒",goal:"切换选舰检查全队航路，再亲眼看一次友军相撞。",figure:"collision",description:"已安排驱逐 F11 与战列 H11 迎面驶向 G11。驱逐节点 1 还安排了鱼雷。这是一局受控演示。",steps:[Rt("review-dd","检查驱逐计划","点击驱逐。看看它的航线与节点 1 鱼雷。","选择驱逐，其他舰的计划不能因换船而消失。","驱逐每步用 1/4 回合；战列每步用 1/2 回合。",[gu("0-0")],It(Ct("select"),lh("0-0"),ri("0-0",1),ri("0-1",1))),Rt("review-bb","再看战列","点击战列，检查它驶向 G11 的航线；驱逐航线仍应可见。","选择战列 H11。两条航线共享同一片海域，也共享同一回合时间轴。","不同速度不会避免迎面碰撞，友军也会受伤。",[gu("0-1"),Nn(6,10)],It(Ct("select"),lh("0-1"),ri("0-0",1),ri("0-1",1))),Rt("collision","执行并观察撞停","点击“执行回合”，看船在到达 G11 前接触、停住，等结算结束。","这一步要实际执行；跳过动画也会完成真实结算。","驱逐受 35、战列受 15 撞击伤害；未到达的鱼雷节点取消。两舰沿实际完成的原路回退。",[Bt("execute")],It(Ct("roundComplete"),{kind:"collisionResolved",shipIds:["0-0","0-1"]}))]},{id:"fog-secondary",section:"core",title:"06 · 自动副炮与迷雾",duration:"65 秒",goal:"驶入副炮射程，再验证离开视野后只有地形记忆。",figure:"fog",description:"I11 的重巡当前可见，L11 有一艘尚未发现的敌舰。副炮会在执行中自动找可见、射程内、无遮挡的敌人。",steps:[Rt("secondary-overlay","查看副炮范围","开启射程覆盖，显示“副炮”层。","选择副炮覆盖。驱逐副炮只有 2 格；覆盖区不是命中保证。","副炮无需手动点敌舰；执行中按实际位置检查视野与遮挡。",[Bt("ranges")],It(Ct("overlay"),{kind:"overlay",rangeMode:"secondary"})),Rt("scout-route","靠近并侦察","给驱逐追加 H11 航段。","从 F11 前进两格到 H11，不要用武器模式点击。","靠近后，I11 会进入副炮射程，L11 也会进入视野。",[Nn(7,10),Bt("move-mode")],It(Ct(["route","move"]),_u("0-0",7,10),ri("0-0",2))),Rt("auto-shot","执行，等自动开火","点击“执行回合”，等结算，观察副炮自动开火。","需要实际执行。普通副炮每轮只打一炮，重巡可对每艘合格敌舰各打一炮。","副炮已自动命中。它要求当前可见、射程内且无遮挡，普通舰优先最近的合格目标。",[Bt("execute")],It(Ct("roundComplete"),{kind:"secondaryResolved",shipId:"0-0"})),Rt("see-contact","检查新接触","点击或悬停检查 L11：这次应该能看到敌舰。","检查高亮的 L11。亮色是当前可见，敌舰位置只在此时可靠。","L11 从未探索变为当前可见，全队记住了这片海域。",[Nn(11,10)],It(Ct("inspect",{cell:_i(11,10)}),{kind:"visibleCell",cell:_i(11,10),value:!0})),Rt("retreat","撤回视野外","在航线模式追加 F11，再执行回合。系统会把转向也算进步数。","先画到 F11，再执行；驱逐的 4 步足够转向并返回。","回到了 F11。L11 已探索，但当前不再可见。",[Nn(5,10),Bt("execute")],It(Ct("roundComplete"),{kind:"shipAt",shipId:"0-0",cell:_i(5,10)},{kind:"fogCell",cell:_i(11,10),state:"explored"})),Rt("no-ghost","确认没有敌舰幽灵","再次检查灰暗的 L11。","检查 L11：只留下已知地形，不应该显示上轮的敌舰船影。水雷仍是公开例外。","正确：已探索不等于现在可见，旧敌舰位置不会伪装成当前接触。",[Nn(11,10),Bt("fog-legend")],It(Ct("inspect",{cell:_i(11,10)}),{kind:"fogCell",cell:_i(11,10),state:"explored"}))]},{id:"main-save",section:"core",title:"07 · 叠点主炮与保存",duration:"45 秒",goal:"把三发主炮放在同一格，理解装弹，再做一次练习保存。",figure:"weapons",description:"战列面对 L11 的静止重巡。主炮从回合初位置算 9 格射程，开局发射、末尾落地。",steps:[Rt("stack","同格点三次","选择“主炮”，连续点击 L11 三次。","需要三发落点都在 L11。叠点合法，主炮每发 60 伤害。","三发叠点完成。目标若移动，这些炮弹仍落在 L11。",[Bt("main-mode"),Nn(11,10)],It(Ct("main"),{kind:"mainStack",shipId:"0-0",cell:_i(11,10),count:3})),Rt("impact","看回合末落弹","点击“执行回合”，等三发炮弹落下。","必须结算到回合末。主炮会误伤友军，射手途中沉没也不取消已发出的炮弹。","三发共 180 伤害。第 2 回合装弹，第 3 回合恢复。",[Bt("execute")],It(Ct("roundComplete"),{kind:"mainResolved",shipId:"0-0",targetId:"1-0",damage:180},{kind:"reload",shipId:"0-0",value:!0})),Rt("reload","空过一轮完成装弹","再执行一个回合，观察主炮恢复。","装弹要等完整一轮；现在不必下任何新指令。","主炮已整备，可以在第 3 回合再次规划。",[Bt("execute")],It(Ct("roundComplete"),{kind:"round",atLeast:3},{kind:"reload",shipId:"0-0",value:!1})),Rt("save","练习保存","点击“练习保存”。","这次只保存演练到内存，不覆盖你的正常存档。","核心操作学完了。可以开始新游戏，或继续可选的武器与排雷练习。",[Bt("save")],Ct("save",{saved:!0}))]},{id:"torpedo-windows",section:"advanced",title:"08 · 鱼雷窗口与侧向",duration:"45 秒",goal:"在不同节点安排鱼雷，比较起点与晚发弹道。",figure:"weapons",description:"驱逐从 F11 向东行两步。节点 0 是起点，节点 1、2 是各步完成时刻。每窗 1 枚、每轮最多 3 枚。",steps:[Rt("origin","起点侧向发射","选“鱼雷”，把窗口设为 0，点击 F12（东南侧向）。","窗口 0 从 F11 发射；沿舰首正前/正后无效，四个侧向才合法。","窗口 0 已有一枚，不能在同一窗口再加一枚。",[Bt("torp-mode"),Bt("torp-window"),Nn(5,11)],It(Ct("torpedo"),{kind:"torpAt",shipId:"0-0",window:0,dir:1})),Rt("later","换节点再发","把窗口改为 1，点击 G12（该节点东南侧向）。","先选窗口 1，它的原点是 G11。重复窗口会被拒绝。","晚发的鱼雷本轮飞行更短；飞速 4，累计最多 3 回合。",[Bt("torp-window"),Nn(6,11)],It(Ct("torpedo"),{kind:"torpAt",shipId:"0-0",window:1,dir:1},{kind:"torpCount",shipId:"0-0",count:2})),Rt("flight","执行看弹道","点击“执行回合”。","不要再添加正前/正后方向。鱼雷离开本舰格才启用碰撞，会击中第一艘船，包括友军。","两枚鱼雷由不同窗口出发。遇岛或第一艘船即消失，撞停后未来节点不发射。",[Bt("execute")],It(Ct("roundComplete"),{kind:"torpedoResolved",shipId:"0-0",count:2}))]},{id:"aircraft-aa",section:"advanced",title:"09 · 飞机与自动防空",duration:"40 秒",goal:"发射定点飞机，亲眼看两艘防空舰在投弹前击落它。",figure:"aircraft",description:"飞机 2 HP、速度 6、视野 3、单程累计 12。K11 附近两艘敌舰防空重叠，这是受控演示。",steps:[Rt("launch","规划定点飞机","选“飞机”和“定点”，点击 K11。","从航母 F11 放飞定点飞机到 K11；指定敌舰模式要选择当前可见的敌舰。","飞机会沿直线飞行，越岛并提供视野；每轮最多放飞 2 架。",[Bt("plane-mode"),Bt("plane-point"),Nn(10,10)],It(Ct("plane"),{kind:"planePoint",shipId:"0-0",cell:_i(10,10),count:1})),Rt("aa","观察先防空后投弹","执行回合，观察敌方防空击落飞机。","这架 2 HP 飞机必须经过两艘防空舰的覆盖区。每艘舰每轮对每架敌机一发 1 伤害。","飞机在投弹前被击落。若能完成出击，会追踪当前母舰返航；返航不占 12 格，回收后整备一整轮。",[Bt("execute")],It(Ct("roundComplete"),{kind:"aircraftAAResolved",mother:"0-0"}))]},{id:"mines",section:"advanced",title:"10 · 清雷与副炮取舍",duration:"35 秒",goal:"用战列副炮清雷，观察本轮自动副炮被占用。",figure:"fog",description:"G11 的水雷公开可见。战列有副炮，可以在回合初射程内、无遮挡时远程清雷；主炮不受影响。",steps:[Rt("sweep","规划远程清雷","选择“排雷”，点击 G11 水雷。","不要驶进水雷：普通舰触雷受 40 伤害。选排雷模式点击雷格。","这轮副炮用于清雷，不会再攻击附近敌人；主炮仍可规划。",[Bt("mine-mode"),Nn(6,10)],It(Ct("sweep"),{kind:"sweep",shipId:"0-0",cell:_i(6,10)})),Rt("clear","执行验证取舍","执行回合，确认水雷消失，而且战列没有自动副炮开火。","清雷要实际结算。驱逐另有自动接触排雷，接触排雷优先于同刻触雷。","水雷清除，副炮机会已消耗。你可以随时回图文手册查机制。",[Bt("execute")],It(Ct("roundComplete"),{kind:"mineResolved",shipId:"0-0",cell:_i(6,10)}))]}];function b1(t="select-deploy"){if(!Fr.some(e=>e.id===t))throw new Error("Unknown tutorial lesson: "+t);return{lessonId:t,stepIndex:0,attempts:0,complete:!1}}function uh(t,e){var n,i;return(i=(n=t.game)==null?void 0:n.ships)==null?void 0:i.find(s=>s.id===e)}function rT(t,e){var n;return((n=t.plans)==null?void 0:n[e])||{moves:[],torps:[],main:[],planes:[],sweep:null}}function oT(t,e){if(e&&typeof e=="object"&&Number.isFinite(e.q)&&Number.isFinite(e.r))return e;if(typeof e=="string"&&/^-?\d+,-?\d+$/.test(e)){const[n,i]=e.split(",").map(Number);return{q:n,r:i}}return typeof e=="string"&&/^[A-S](?:[1-9]|1[0-5])$/i.test(e)?t.fromCR(e.toUpperCase().charCodeAt(0)-65,Number(e.slice(1))-1):null}function Gr(t,e,n){return!!e&&!!n&&t.same(e,n)}function rs(t){var e;return(((e=t.game)==null?void 0:e.log)||[]).filter(n=>n.round===t.game.round-1)}function M1(t,e,n,i){var o,a,l,u,c,f;const s=e.shipId?rT(n,e.shipId):null,r=e.shipId?uh(n,e.shipId):null;switch(e.kind){case"all":return e.conditions.every(h=>M1(t,h,n,i));case"event":return e.types.includes(i==null?void 0:i.type)&&(!e.shipId||i.shipId===e.shipId)&&(!e.cell||Gr(t,oT(t,i.target??i.cell),e.cell))&&(e.saved===void 0||i.saved===e.saved);case"selected":return n.selected===e.shipId;case"shipAt":return Gr(t,r==null?void 0:r.pos,e.cell);case"phase":return((o=n.game)==null?void 0:o.phase)===e.value;case"planMoves":return s.moves.length===e.count;case"routeEnd":return!!r&&Gr(t,(a=t.route(r,s,n.game.map).at(-1))==null?void 0:a.pos,e.cell);case"moveAt":return((l=s.moves[e.index])==null?void 0:l.turn)===e.turn&&((u=s.moves[e.index])==null?void 0:u.forward)===e.forward;case"mainCount":return s.main.length===e.count;case"overlay":return n.showRanges===!0&&(!n.rangeMode||n.rangeMode==="all"||n.rangeMode===e.rangeMode);case"visibleCell":return t.visibleCells(n.game,0).has(t.key(e.cell))===e.value;case"fogCell":{const h=t.visibleCells(n.game,0).has(t.key(e.cell)),d=(((c=n.game.explored)==null?void 0:c[0])||[]).includes(t.key(e.cell));return(h?"visible":d?"explored":"unexplored")===e.state}case"round":return n.game.round>=e.atLeast;case"reload":return!!r&&r.mainReady>n.game.round===e.value;case"mainStack":return s.main.length===e.count&&s.main.every(h=>Gr(t,h,e.cell));case"collisionResolved":return e.shipIds.every(h=>{const d=uh(n,h);return d&&d.hp<d.cfg.hp&&rs(n).some(m=>m.text.includes(d.label)&&m.text.includes("发生碰撞"))&&rs(n).some(m=>m.text.includes(d.label)&&m.text.includes("沿原路回退"))})&&!rs(n).some(h=>h.text.includes("驱逐-1")&&h.text.includes("发射鱼雷"));case"secondaryResolved":return!!r&&rs(n).some(h=>h.text.includes("遭"+r.label+"副炮命中"));case"mainResolved":{const h=uh(n,e.targetId);return!!r&&!!h&&rs(n).some(d=>d.text.includes(h.label)&&d.text.includes("遭主炮命中 −"+e.damage))}case"torpAt":return s.torps.some(h=>h.window===e.window&&h.dir===e.dir);case"torpCount":return s.torps.length===e.count;case"torpedoResolved":return!!r&&rs(n).filter(h=>h.text.includes(r.label)&&h.text.includes("发射鱼雷")).length===e.count;case"planePoint":return s.planes.length===e.count&&s.planes.every(h=>h.mode==="point"&&Gr(t,h.target,e.cell));case"aircraftAAResolved":return((f=n.game.ships.find(h=>h.id===e.mother))==null?void 0:f.destroyedPlanes)>=1&&rs(n).some(h=>h.text.includes("击落敌机"))&&!rs(n).some(h=>h.text.includes("遭航空炸弹命中"));case"sweep":return Gr(t,s.sweep,e.cell);case"mineResolved":return!!r&&!n.game.map.mines.some(h=>Gr(t,h,e.cell))&&rs(n).some(h=>h.text.includes(r.label)&&h.text.includes("副炮清雷"))&&!rs(n).some(h=>h.text.includes("遭"+r.label+"副炮命中"));default:return!1}}function A1(t){return t.kind==="event"?t.types:t.kind==="all"?t.conditions.flatMap(A1):[]}function T1(t,e,n,i,s){const r=Fr.find(u=>u.id===e),o=r==null?void 0:r.steps[n];if(!o)return{passed:!1,relevant:!1,feedback:""};const a=M1(t,o.condition,i,s),l=A1(o.condition).includes(s==null?void 0:s.type)||["route","move","main","torpedo","plane","sweep","execute","roundComplete","redraw","truncate","undo","redo"].includes(s==null?void 0:s.type);return{passed:a,relevant:l,feedback:a?o.success:l?o.hint:""}}function w1(t,e,n,i){if(e.complete)return{state:{...e},advanced:!1,lessonComplete:!0,feedback:""};const s=T1(t,e.lessonId,e.stepIndex,n,i),r=Fr.find(a=>a.id===e.lessonId),o={...e,attempts:e.attempts+(s.relevant&&!s.passed?1:0),stepIndex:e.stepIndex+(s.passed?1:0)};return o.complete=o.stepIndex>=r.steps.length,{state:o,advanced:s.passed,lessonComplete:o.complete,feedback:s.feedback}}function C1(t,e){if(!Fr.find(c=>c.id===e))throw new Error("Unknown tutorial lesson: "+e);if(e==="select-deploy")return{game:t.createGame(t.DEFAULT_ROSTER,20261004),plans:{},selected:"0-1",mode:"move",rangeMode:"secondary",showRanges:!1,opponentPlans:{},tutorialOnly:!0};const i=t.createGame(t.DEFAULT_ROSTER,20261004);i.phase="plan",i.map.islands=[],i.map.mines=[],i.planes=[],i.torpedoes=[],i.log=[],i.explored=[[],[]],i.ships=[];const s=(c,f,h,d,m,x=f===0?0:3)=>{const _=t.createShip(c,f,h,t.fromCR(d,m));return _.heading=x,i.ships.push(_),_},r=["turn-cost"].includes(e)?"cl":["undo-redraw","main-save","mines"].includes(e)?"bb":e==="aircraft-aa"?"cv":"dd";s(r,0,0,5,10),s("bb",0,1,1,12),s("cl",0,2,0,13),s("ca",0,3,2,14),s("cv",0,4,0,12),s("ca",1,0,18,2),s("cv",1,1,16,3);const o={},a={game:i,plans:o,selected:"0-0",mode:"move",rangeMode:"secondary",showRanges:!1,opponentPlans:{},tutorialOnly:!0},l=(c,f=[],h={})=>o[c]={...t.emptyPlan(),moves:f,...h},u=(c,f,h,d,m=3)=>{const x=i.ships.find(b=>b.id===c),_=Number(c.split("-")[1]),p=t.createShip(f,x.team,_,t.fromCR(h,d));return p.heading=m,i.ships[i.ships.indexOf(x)]=p,p};e==="undo-redraw"&&l("0-0",[{turn:0,forward:!0},{turn:0,forward:!0}],{segments:[{start:0,end:1,target:t.fromCR(6,10)},{start:1,end:2,target:t.fromCR(7,10)}],main:[t.fromCR(11,10)]}),e==="timeline-collision"&&(u("0-1","bb",7,10,3),l("0-0",[{turn:0,forward:!0}],{segments:[{start:0,end:1,target:t.fromCR(6,10)}],torps:[{window:1,dir:1}]}),l("0-1",[{turn:0,forward:!0}],{segments:[{start:0,end:1,target:t.fromCR(6,10)}]})),e==="fog-secondary"&&(u("1-0","ca",8,10),u("1-1","cv",11,10)),e==="main-save"&&u("1-0","ca",11,10),e==="torpedo-windows"&&l("0-0",[{turn:0,forward:!0},{turn:0,forward:!0}],{segments:[{start:0,end:2,target:t.fromCR(7,10)}]}),e==="aircraft-aa"&&(u("1-0","dd",10,10),u("1-1","ca",10,8)),e==="mines"&&(i.map.mines=[t.fromCR(6,10)],u("1-0","ca",7,10));for(const c of i.ships.filter(f=>f.team===1))a.opponentPlans[c.id]=t.emptyPlan();return t.updateExploration(i),a}Mo.route='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" role="img" aria-labelledby="title desc"><title id="title">画航线：可以分段，也能随时改</title><desc id="desc">一艘驱逐沿点顶六角网格从F11分段驶向H11、I11；转向并前进或原地转向均消耗一步。</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#66ded2"/></marker></defs><rect width="960" height="420" rx="12" fill="#0b1723"/><g font-family="Noto Sans SC,Microsoft YaHei,sans-serif"><text x="32" y="40" fill="#66ded2" font-size="23" text-anchor="start" font-weight="600">画航线：可以分段，也能随时改</text><polygon points="96.0,105.0 96.0,135.0 70.0,150.0 44.0,135.0 44.0,105.0 70.0,90.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="147.9,105.0 147.9,135.0 122.0,150.0 96.0,135.0 96.0,105.0 122.0,90.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="199.9,105.0 199.9,135.0 173.9,150.0 147.9,135.0 147.9,105.0 173.9,90.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="251.9,105.0 251.9,135.0 225.9,150.0 199.9,135.0 199.9,105.0 225.9,90.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="303.8,105.0 303.8,135.0 277.8,150.0 251.9,135.0 251.9,105.0 277.8,90.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="355.8,105.0 355.8,135.0 329.8,150.0 303.8,135.0 303.8,105.0 329.8,90.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="407.7,105.0 407.7,135.0 381.8,150.0 355.8,135.0 355.8,105.0 381.8,90.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="459.7,105.0 459.7,135.0 433.7,150.0 407.7,135.0 407.7,105.0 433.7,90.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="122.0,150.0 122.0,180.0 96.0,195.0 70.0,180.0 70.0,150.0 96.0,135.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="173.9,150.0 173.9,180.0 147.9,195.0 122.0,180.0 122.0,150.0 147.9,135.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="225.9,150.0 225.9,180.0 199.9,195.0 173.9,180.0 173.9,150.0 199.9,135.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="277.8,150.0 277.8,180.0 251.9,195.0 225.9,180.0 225.9,150.0 251.9,135.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="329.8,150.0 329.8,180.0 303.8,195.0 277.8,180.0 277.8,150.0 303.8,135.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="381.8,150.0 381.8,180.0 355.8,195.0 329.8,180.0 329.8,150.0 355.8,135.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="433.7,150.0 433.7,180.0 407.7,195.0 381.8,180.0 381.8,150.0 407.7,135.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="485.7,150.0 485.7,180.0 459.7,195.0 433.7,180.0 433.7,150.0 459.7,135.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="96.0,195.0 96.0,225.0 70.0,240.0 44.0,225.0 44.0,195.0 70.0,180.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="147.9,195.0 147.9,225.0 122.0,240.0 96.0,225.0 96.0,195.0 122.0,180.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="199.9,195.0 199.9,225.0 173.9,240.0 147.9,225.0 147.9,195.0 173.9,180.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="251.9,195.0 251.9,225.0 225.9,240.0 199.9,225.0 199.9,195.0 225.9,180.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="303.8,195.0 303.8,225.0 277.8,240.0 251.9,225.0 251.9,195.0 277.8,180.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="355.8,195.0 355.8,225.0 329.8,240.0 303.8,225.0 303.8,195.0 329.8,180.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="407.7,195.0 407.7,225.0 381.8,240.0 355.8,225.0 355.8,195.0 381.8,180.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="459.7,195.0 459.7,225.0 433.7,240.0 407.7,225.0 407.7,195.0 433.7,180.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="122.0,240.0 122.0,270.0 96.0,285.0 70.0,270.0 70.0,240.0 96.0,225.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="173.9,240.0 173.9,270.0 147.9,285.0 122.0,270.0 122.0,240.0 147.9,225.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="225.9,240.0 225.9,270.0 199.9,285.0 173.9,270.0 173.9,240.0 199.9,225.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="277.8,240.0 277.8,270.0 251.9,285.0 225.9,270.0 225.9,240.0 251.9,225.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="329.8,240.0 329.8,270.0 303.8,285.0 277.8,270.0 277.8,240.0 303.8,225.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="381.8,240.0 381.8,270.0 355.8,285.0 329.8,270.0 329.8,240.0 355.8,225.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="433.7,240.0 433.7,270.0 407.7,285.0 381.8,270.0 381.8,240.0 407.7,225.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="485.7,240.0 485.7,270.0 459.7,285.0 433.7,270.0 433.7,240.0 459.7,225.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><line x1="72" y1="210" x2="176" y2="210" stroke="#66ded2" stroke-width="3" marker-end="url(#arrow)"/><line x1="176" y1="210" x2="228" y2="210" stroke="#66ded2" stroke-width="3" marker-end="url(#arrow)"/><circle cx="72" cy="210" r="18" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><path d="M 97 210 l -8 -4 v 8 Z" fill="#66ded2" transform="rotate(0 72 210)"/><text x="72" y="215" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">DD</text><circle cx="124" cy="210" r="12" fill="#173b42" stroke="#66ded2" stroke-width="2"/><text x="124" y="214" fill="#66ded2" font-size="11" text-anchor="middle" font-weight="400">1</text><circle cx="176" cy="210" r="12" fill="#173b42" stroke="#66ded2" stroke-width="2"/><text x="176" y="214" fill="#66ded2" font-size="11" text-anchor="middle" font-weight="400">2</text><circle cx="228" cy="210" r="12" fill="#173b42" stroke="#66ded2" stroke-width="2"/><text x="228" y="214" fill="#66ded2" font-size="11" text-anchor="middle" font-weight="400">3</text><text x="72" y="257" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">F11</text><text x="176" y="257" fill="#66ded2" font-size="13" text-anchor="middle" font-weight="400">H11</text><text x="228" y="257" fill="#66ded2" font-size="13" text-anchor="middle" font-weight="400">I11</text><text x="520" y="107" fill="#d8e4eb" font-size="19" text-anchor="start" font-weight="400">① 右键 H11：追加第一段</text><text x="520" y="150" fill="#d8e4eb" font-size="19" text-anchor="start" font-weight="400">② 右键 I11：从终点继续追加</text><text x="520" y="203" fill="#93b0be" font-size="17" text-anchor="start" font-weight="400">触屏：航线模式点目标格</text><rect x="520" y="235" width="330" height="33" rx="5" fill="#173641" stroke="#66ded2"/><text x="685.0" y="257" fill="#66ded2" font-size="14" text-anchor="middle" font-weight="400">左转 60° ＋ 前进 ＝ 1 步</text><rect x="520" y="283" width="330" height="33" rx="5" fill="#173641" stroke="#66ded2"/><text x="685.0" y="305" fill="#66ded2" font-size="14" text-anchor="middle" font-weight="400">右转 60° ＋ 等待 ＝ 1 步</text><text x="32" y="389" fill="#93b0be" font-size="17" text-anchor="start" font-weight="400">撤销航点 · 点击节点截断 · 重新规划保留武器指令</text></g></svg>';Mo.timeline='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" role="img" aria-labelledby="title desc"><title id="title">同步执行：速度不同，时间相同</title><desc id="desc">同一回合中驱逐每步占四分之一回合，战列每步占二分之一；主炮在开局发射、回合末落地。</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#66ded2"/></marker></defs><rect width="960" height="420" rx="12" fill="#0b1723"/><g font-family="Noto Sans SC,Microsoft YaHei,sans-serif"><text x="32" y="40" fill="#66ded2" font-size="23" text-anchor="start" font-weight="600">同步执行：速度不同，时间相同</text><text x="32" y="87" fill="#93b0be" font-size="17" text-anchor="start" font-weight="400">所有舰船共享 0 → 1 回合时间轴</text><line x1="180" y1="310" x2="894" y2="310" stroke="#2b4958" stroke-width="2"/><line x1="180" y1="110" x2="180" y2="315" stroke="#2b4958" stroke-width="1" stroke-dasharray="4 5"/><text x="180" y="342" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">0.0</text><line x1="320.0" y1="110" x2="320.0" y2="315" stroke="#2b4958" stroke-width="1" stroke-dasharray="4 5"/><text x="320.0" y="342" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">0.2</text><line x1="460.0" y1="110" x2="460.0" y2="315" stroke="#2b4958" stroke-width="1" stroke-dasharray="4 5"/><text x="460.0" y="342" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">0.4</text><line x1="600.0" y1="110" x2="600.0" y2="315" stroke="#2b4958" stroke-width="1" stroke-dasharray="4 5"/><text x="600.0" y="342" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">0.6</text><line x1="740.0" y1="110" x2="740.0" y2="315" stroke="#2b4958" stroke-width="1" stroke-dasharray="4 5"/><text x="740.0" y="342" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">0.8</text><line x1="880" y1="110" x2="880" y2="315" stroke="#2b4958" stroke-width="1" stroke-dasharray="4 5"/><text x="880" y="342" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">1.0</text><text x="34" y="155" fill="#66ded2" font-size="17" text-anchor="start" font-weight="400">驱逐 · 4 步</text><text x="34" y="227" fill="#e9bb72" font-size="17" text-anchor="start" font-weight="400">战列 · 2 步</text><line x1="180" y1="148" x2="880" y2="148" stroke="#66ded2" stroke-width="4"/><line x1="180" y1="220" x2="880" y2="220" stroke="#e9bb72" stroke-width="4"/><circle cx="180" cy="148" r="10" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><text x="180" y="129" fill="#66ded2" font-size="12" text-anchor="middle" font-weight="400">0</text><circle cx="355" cy="148" r="10" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><text x="355" y="129" fill="#66ded2" font-size="12" text-anchor="middle" font-weight="400">1</text><circle cx="530" cy="148" r="10" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><text x="530" y="129" fill="#66ded2" font-size="12" text-anchor="middle" font-weight="400">2</text><circle cx="705" cy="148" r="10" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><text x="705" y="129" fill="#66ded2" font-size="12" text-anchor="middle" font-weight="400">3</text><circle cx="880" cy="148" r="10" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><text x="880" y="129" fill="#66ded2" font-size="12" text-anchor="middle" font-weight="400">4</text><circle cx="180" cy="220" r="10" fill="#3a3324" stroke="#e9bb72" stroke-width="2"/><text x="180" y="202" fill="#e9bb72" font-size="12" text-anchor="middle" font-weight="400">0</text><circle cx="530" cy="220" r="10" fill="#3a3324" stroke="#e9bb72" stroke-width="2"/><text x="530" y="202" fill="#e9bb72" font-size="12" text-anchor="middle" font-weight="400">1</text><circle cx="880" cy="220" r="10" fill="#3a3324" stroke="#e9bb72" stroke-width="2"/><text x="880" y="202" fill="#e9bb72" font-size="12" text-anchor="middle" font-weight="400">2</text><rect x="150" y="264" width="220" height="33" rx="5" fill="#173641" stroke="#66ded2"/><text x="260.0" y="286" fill="#66ded2" font-size="14" text-anchor="middle" font-weight="400">主炮 / 飞机：开局发射</text><rect x="640" y="264" width="220" height="33" rx="5" fill="#173641" stroke="#e9bb72"/><text x="750.0" y="286" fill="#e9bb72" font-size="14" text-anchor="middle" font-weight="400">主炮：回合末落地</text><text x="32" y="389" fill="#93b0be" font-size="17" text-anchor="start" font-weight="400">单位不会依次走完；鱼雷窗口、自动武器和撞击都发生在同一时间轴。</text></g></svg>';Mo.fog='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" role="img" aria-labelledby="title desc"><title id="title">迷雾有三种状态</title><desc id="desc">未探索格隐藏地形；已探索不可见格保留地形但不显示敌舰幽灵；当前可见格显示当前敌舰。公共水雷三种状态都可见。</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#66ded2"/></marker></defs><rect width="960" height="420" rx="12" fill="#0b1723"/><g font-family="Noto Sans SC,Microsoft YaHei,sans-serif"><text x="32" y="40" fill="#66ded2" font-size="23" text-anchor="start" font-weight="600">迷雾有三种状态</text><rect x="40" y="78" width="260" height="267" rx="9" fill="#07131f" stroke="#2b4958"/><text x="170" y="112" fill="#93b0be" font-size="18" text-anchor="middle" font-weight="400">未探索</text><polygon points="115.4,147.5 115.4,174.5 92.0,188.0 68.6,174.5 68.6,147.5 92.0,134.0" fill="#07131f" stroke="#2b4958" stroke-width="1.5"/><polygon points="162.1,147.5 162.1,174.5 138.8,188.0 115.4,174.5 115.4,147.5 138.8,134.0" fill="#07131f" stroke="#2b4958" stroke-width="1.5"/><polygon points="208.9,147.5 208.9,174.5 185.5,188.0 162.1,174.5 162.1,147.5 185.5,134.0" fill="#07131f" stroke="#2b4958" stroke-width="1.5"/><polygon points="138.8,188.0 138.8,215.0 115.4,228.5 92.0,215.0 92.0,188.0 115.4,174.5" fill="#07131f" stroke="#2b4958" stroke-width="1.5"/><polygon points="185.5,188.0 185.5,215.0 162.1,228.5 138.8,215.0 138.8,188.0 162.1,174.5" fill="#07131f" stroke="#2b4958" stroke-width="1.5"/><polygon points="232.3,188.0 232.3,215.0 208.9,228.5 185.5,215.0 185.5,188.0 208.9,174.5" fill="#07131f" stroke="#2b4958" stroke-width="1.5"/><polygon points="115.4,228.5 115.4,255.5 92.0,269.0 68.6,255.5 68.6,228.5 92.0,215.0" fill="#07131f" stroke="#2b4958" stroke-width="1.5"/><polygon points="162.1,228.5 162.1,255.5 138.8,269.0 115.4,255.5 115.4,228.5 138.8,215.0" fill="#07131f" stroke="#2b4958" stroke-width="1.5"/><polygon points="208.9,228.5 208.9,255.5 185.5,269.0 162.1,255.5 162.1,228.5 185.5,215.0" fill="#07131f" stroke="#2b4958" stroke-width="1.5"/><circle cx="233" cy="245" r="10" fill="#463922" stroke="#e9bb72" stroke-width="2"/><text x="233" y="249" fill="#e9bb72" font-size="13" text-anchor="middle" font-weight="400">×</text><text x="170" y="321" fill="#e9bb72" font-size="13" text-anchor="middle" font-weight="400">公开水雷始终显示</text><text x="170" y="230" fill="#3c5463" font-size="40" text-anchor="middle" font-weight="400">?</text><text x="170" y="285" fill="#93b0be" font-size="14" text-anchor="middle" font-weight="400">不透露未知地形</text><rect x="350" y="78" width="260" height="267" rx="9" fill="#10232f" stroke="#2b4958"/><text x="480" y="112" fill="#93b0be" font-size="18" text-anchor="middle" font-weight="400">已探索 · 当前不可见</text><polygon points="425.4,147.5 425.4,174.5 402.0,188.0 378.6,174.5 378.6,147.5 402.0,134.0" fill="#10232f" stroke="#2b4958" stroke-width="1.5"/><polygon points="472.1,147.5 472.1,174.5 448.8,188.0 425.4,174.5 425.4,147.5 448.8,134.0" fill="#10232f" stroke="#2b4958" stroke-width="1.5"/><polygon points="518.9,147.5 518.9,174.5 495.5,188.0 472.1,174.5 472.1,147.5 495.5,134.0" fill="#10232f" stroke="#2b4958" stroke-width="1.5"/><polygon points="448.8,188.0 448.8,215.0 425.4,228.5 402.0,215.0 402.0,188.0 425.4,174.5" fill="#10232f" stroke="#2b4958" stroke-width="1.5"/><polygon points="495.5,188.0 495.5,215.0 472.1,228.5 448.8,215.0 448.8,188.0 472.1,174.5" fill="#10232f" stroke="#2b4958" stroke-width="1.5"/><polygon points="542.3,188.0 542.3,215.0 518.9,228.5 495.5,215.0 495.5,188.0 518.9,174.5" fill="#10232f" stroke="#2b4958" stroke-width="1.5"/><polygon points="425.4,228.5 425.4,255.5 402.0,269.0 378.6,255.5 378.6,228.5 402.0,215.0" fill="#10232f" stroke="#2b4958" stroke-width="1.5"/><polygon points="472.1,228.5 472.1,255.5 448.8,269.0 425.4,255.5 425.4,228.5 448.8,215.0" fill="#10232f" stroke="#2b4958" stroke-width="1.5"/><polygon points="518.9,228.5 518.9,255.5 495.5,269.0 472.1,255.5 472.1,228.5 495.5,215.0" fill="#10232f" stroke="#2b4958" stroke-width="1.5"/><circle cx="543" cy="245" r="10" fill="#463922" stroke="#e9bb72" stroke-width="2"/><text x="543" y="249" fill="#e9bb72" font-size="13" text-anchor="middle" font-weight="400">×</text><text x="480" y="321" fill="#e9bb72" font-size="13" text-anchor="middle" font-weight="400">公开水雷始终显示</text><polygon points="473.4,186.5 473.4,213.5 450.0,227.0 426.6,213.5 426.6,186.5 450.0,173.0" fill="#344953" stroke="#4d646b" stroke-width="1.5"/><text x="480" y="285" fill="#93b0be" font-size="14" text-anchor="middle" font-weight="400">保留地形，不画旧敌舰</text><rect x="660" y="78" width="260" height="267" rx="9" fill="#173a49" stroke="#2b4958"/><text x="790" y="112" fill="#66ded2" font-size="18" text-anchor="middle" font-weight="400">当前可见</text><polygon points="735.4,147.5 735.4,174.5 712.0,188.0 688.6,174.5 688.6,147.5 712.0,134.0" fill="#173a49" stroke="#2b4958" stroke-width="1.5"/><polygon points="782.1,147.5 782.1,174.5 758.8,188.0 735.4,174.5 735.4,147.5 758.8,134.0" fill="#173a49" stroke="#2b4958" stroke-width="1.5"/><polygon points="828.9,147.5 828.9,174.5 805.5,188.0 782.1,174.5 782.1,147.5 805.5,134.0" fill="#173a49" stroke="#2b4958" stroke-width="1.5"/><polygon points="758.8,188.0 758.8,215.0 735.4,228.5 712.0,215.0 712.0,188.0 735.4,174.5" fill="#173a49" stroke="#2b4958" stroke-width="1.5"/><polygon points="805.5,188.0 805.5,215.0 782.1,228.5 758.8,215.0 758.8,188.0 782.1,174.5" fill="#173a49" stroke="#2b4958" stroke-width="1.5"/><polygon points="852.3,188.0 852.3,215.0 828.9,228.5 805.5,215.0 805.5,188.0 828.9,174.5" fill="#173a49" stroke="#2b4958" stroke-width="1.5"/><polygon points="735.4,228.5 735.4,255.5 712.0,269.0 688.6,255.5 688.6,228.5 712.0,215.0" fill="#173a49" stroke="#2b4958" stroke-width="1.5"/><polygon points="782.1,228.5 782.1,255.5 758.8,269.0 735.4,255.5 735.4,228.5 758.8,215.0" fill="#173a49" stroke="#2b4958" stroke-width="1.5"/><polygon points="828.9,228.5 828.9,255.5 805.5,269.0 782.1,255.5 782.1,228.5 805.5,215.0" fill="#173a49" stroke="#2b4958" stroke-width="1.5"/><circle cx="853" cy="245" r="10" fill="#463922" stroke="#e9bb72" stroke-width="2"/><text x="853" y="249" fill="#e9bb72" font-size="13" text-anchor="middle" font-weight="400">×</text><text x="790" y="321" fill="#e9bb72" font-size="13" text-anchor="middle" font-weight="400">公开水雷始终显示</text><polygon points="783.4,186.5 783.4,213.5 760.0,227.0 736.6,213.5 736.6,186.5 760.0,173.0" fill="#344953" stroke="#4d646b" stroke-width="1.5"/><circle cx="815" cy="200" r="18" fill="#173d4a" stroke="#f28d79" stroke-width="2"/><path d="M 840 200 l -8 -4 v 8 Z" fill="#f28d79" transform="rotate(180 815 200)"/><text x="815" y="205" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">敌舰</text><text x="790" y="285" fill="#93b0be" font-size="14" text-anchor="middle" font-weight="400">显示此刻的敌方接触</text><text x="32" y="389" fill="#93b0be" font-size="17" text-anchor="start" font-weight="400">舰船视野 5 · 飞机视野 3 · 全队共享探索 · 岛屿会挡视线</text></g></svg>';Mo.collision='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" role="img" aria-labelledby="title desc"><title id="title">撞击：双方受伤，停止，再原路回退</title><desc id="desc">驱逐和战列迎面驶向同一格，在格心前接触。驱逐受35、战列受15伤害；未来鱼雷节点取消。回合末主炮先落地，然后沿实际完成路线回退。</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#66ded2"/></marker></defs><rect width="960" height="420" rx="12" fill="#0b1723"/><g font-family="Noto Sans SC,Microsoft YaHei,sans-serif"><text x="32" y="40" fill="#66ded2" font-size="23" text-anchor="start" font-weight="600">撞击：双方受伤，停止，再原路回退</text><text x="43" y="90" fill="#93b0be" font-size="17" text-anchor="start" font-weight="400">1 · 原计划：双方驶向 G11</text><polygon points="88.4,131.5 88.4,158.5 65.0,172.0 41.6,158.5 41.6,131.5 65.0,118.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="135.1,131.5 135.1,158.5 111.8,172.0 88.4,158.5 88.4,131.5 111.8,118.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="181.9,131.5 181.9,158.5 158.5,172.0 135.1,158.5 135.1,131.5 158.5,118.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="228.7,131.5 228.7,158.5 205.3,172.0 181.9,158.5 181.9,131.5 205.3,118.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="275.4,131.5 275.4,158.5 252.1,172.0 228.7,158.5 228.7,131.5 252.1,118.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="111.8,172.0 111.8,199.0 88.4,212.5 65.0,199.0 65.0,172.0 88.4,158.5" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="158.5,172.0 158.5,199.0 135.1,212.5 111.8,199.0 111.8,172.0 135.1,158.5" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="205.3,172.0 205.3,199.0 181.9,212.5 158.5,199.0 158.5,172.0 181.9,158.5" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="252.1,172.0 252.1,199.0 228.7,212.5 205.3,199.0 205.3,172.0 228.7,158.5" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="298.8,172.0 298.8,199.0 275.4,212.5 252.1,199.0 252.1,172.0 275.4,158.5" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><circle cx="91" cy="187" r="18" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><path d="M 116 187 l -8 -4 v 8 Z" fill="#66ded2" transform="rotate(0 91 187)"/><text x="91" y="192" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">DD</text><circle cx="278" cy="187" r="18" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><path d="M 303 187 l -8 -4 v 8 Z" fill="#66ded2" transform="rotate(180 278 187)"/><text x="278" y="192" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">BB</text><line x1="121" y1="187" x2="170" y2="187" stroke="#66ded2" stroke-width="3"/><line x1="246" y1="187" x2="197" y2="187" stroke="#66ded2" stroke-width="3"/><text x="92" y="229" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">F11</text><text x="185" y="229" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">G11</text><text x="278" y="229" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">H11</text><text x="362" y="90" fill="#93b0be" font-size="17" text-anchor="start" font-weight="400">2 · 格心前接触，双方停住</text><circle cx="425" cy="181" r="18" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><path d="M 450 181 l -8 -4 v 8 Z" fill="#66ded2" transform="rotate(0 425 181)"/><text x="425" y="186" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">DD</text><circle cx="460" cy="181" r="18" fill="#173d4a" stroke="#e9bb72" stroke-width="2"/><path d="M 485 181 l -8 -4 v 8 Z" fill="#e9bb72" transform="rotate(180 460 181)"/><text x="460" y="186" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">BB</text><text x="425" y="239" fill="#f28d79" font-size="23" text-anchor="middle" font-weight="600">−35</text><text x="479" y="239" fill="#f28d79" font-size="23" text-anchor="middle" font-weight="600">−15</text><line x1="488" y1="136" x2="513" y2="162" stroke="#f28d79" stroke-width="3"/><line x1="513" y1="136" x2="488" y2="162" stroke="#f28d79" stroke-width="3"/><text x="370" y="282" fill="#e9bb72" font-size="16" text-anchor="start" font-weight="400">后续节点鱼雷取消</text><text x="650" y="90" fill="#93b0be" font-size="16" text-anchor="start" font-weight="400">3 · 主炮先落地，再沿原路回退</text><circle cx="705" cy="181" r="18" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><path d="M 730 181 l -8 -4 v 8 Z" fill="#66ded2" transform="rotate(0 705 181)"/><text x="705" y="186" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">DD</text><circle cx="860" cy="181" r="18" fill="#173d4a" stroke="#e9bb72" stroke-width="2"/><path d="M 885 181 l -8 -4 v 8 Z" fill="#e9bb72" transform="rotate(180 860 181)"/><text x="860" y="186" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">BB</text><line x1="759" y1="181" x2="726" y2="181" stroke="#66ded2" stroke-width="3" stroke-dasharray="5 4" marker-end="url(#arrow)"/><line x1="810" y1="181" x2="841" y2="181" stroke="#66ded2" stroke-width="3" stroke-dasharray="5 4" marker-end="url(#arrow)"/><text x="777" y="243" fill="#93b0be" font-size="16" text-anchor="middle" font-weight="400">不能退到未完成节点</text><text x="777" y="282" fill="#f28d79" font-size="16" text-anchor="middle" font-weight="400">无合法退路：搁浅沉没</text><line x1="40" y1="327" x2="920" y2="327" stroke="#2b4958" stroke-width="1"/><text x="40" y="369" fill="#93b0be" font-size="17" text-anchor="start" font-weight="400">友军和敌军都受撞击；同一舰对每轮一次，第三艘撞入仍能造成新伤害。</text></g></svg>';Mo.weapons='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" role="img" aria-labelledby="title desc"><title id="title">手动武器：主炮落点，鱼雷窗口</title><desc id="desc">左侧战列主炮三发叠点；右侧朝东驱逐鱼雷可沿东南、西南、西北、东北四个侧向发射，正前正后不可发射。</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#66ded2"/></marker></defs><rect width="960" height="420" rx="12" fill="#0b1723"/><g font-family="Noto Sans SC,Microsoft YaHei,sans-serif"><text x="32" y="40" fill="#66ded2" font-size="23" text-anchor="start" font-weight="600">手动武器：主炮落点，鱼雷窗口</text><text x="40" y="88" fill="#93b0be" font-size="18" text-anchor="start" font-weight="400">战列主炮：三次点击同一落点</text><polygon points="94.2,131.0 94.2,159.0 70.0,173.0 45.8,159.0 45.8,131.0 70.0,117.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="142.7,131.0 142.7,159.0 118.5,173.0 94.2,159.0 94.2,131.0 118.5,117.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="191.2,131.0 191.2,159.0 167.0,173.0 142.7,159.0 142.7,131.0 167.0,117.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="239.7,131.0 239.7,159.0 215.5,173.0 191.2,159.0 191.2,131.0 215.5,117.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="288.2,131.0 288.2,159.0 264.0,173.0 239.7,159.0 239.7,131.0 264.0,117.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="336.7,131.0 336.7,159.0 312.5,173.0 288.2,159.0 288.2,131.0 312.5,117.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="118.5,173.0 118.5,201.0 94.2,215.0 70.0,201.0 70.0,173.0 94.2,159.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="167.0,173.0 167.0,201.0 142.7,215.0 118.5,201.0 118.5,173.0 142.7,159.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="215.5,173.0 215.5,201.0 191.2,215.0 167.0,201.0 167.0,173.0 191.2,159.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="264.0,173.0 264.0,201.0 239.7,215.0 215.5,201.0 215.5,173.0 239.7,159.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="312.5,173.0 312.5,201.0 288.2,215.0 264.0,201.0 264.0,173.0 288.2,159.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="361.0,173.0 361.0,201.0 336.7,215.0 312.5,201.0 312.5,173.0 336.7,159.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="94.2,215.0 94.2,243.0 70.0,257.0 45.8,243.0 45.8,215.0 70.0,201.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="142.7,215.0 142.7,243.0 118.5,257.0 94.2,243.0 94.2,215.0 118.5,201.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="191.2,215.0 191.2,243.0 167.0,257.0 142.7,243.0 142.7,215.0 167.0,201.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="239.7,215.0 239.7,243.0 215.5,257.0 191.2,243.0 191.2,215.0 215.5,201.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="288.2,215.0 288.2,243.0 264.0,257.0 239.7,243.0 239.7,215.0 264.0,201.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><polygon points="336.7,215.0 336.7,243.0 312.5,257.0 288.2,243.0 288.2,215.0 312.5,201.0" fill="#102633" stroke="#2b4958" stroke-width="1.5"/><circle cx="95" cy="190" r="18" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><path d="M 120 190 l -8 -4 v 8 Z" fill="#66ded2" transform="rotate(0 95 190)"/><text x="95" y="195" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">BB</text><circle cx="307" cy="190" r="23" fill="#463029" stroke="#f28d79" stroke-width="2"/><text x="307" y="195" fill="#f28d79" font-size="18" text-anchor="middle" font-weight="600">×3</text><line x1="128" y1="190" x2="274" y2="190" stroke="#f28d79" stroke-width="3" stroke-dasharray="6 6"/><text x="95" y="254" fill="#93b0be" font-size="13" text-anchor="middle" font-weight="400">回合初位置</text><text x="307" y="254" fill="#f28d79" font-size="13" text-anchor="middle" font-weight="400">同格 3 发</text><text x="40" y="301" fill="#d8e4eb" font-size="16" text-anchor="start" font-weight="400">射程 9 · 每发 60 · 可盲射 / 误伤</text><text x="40" y="345" fill="#e9bb72" font-size="15" text-anchor="start" font-weight="400">第 1 轮开火 → 第 2 轮装弹 → 第 3 轮恢复</text><line x1="475" y1="78" x2="475" y2="359" stroke="#2b4958" stroke-width="1"/><text x="520" y="88" fill="#93b0be" font-size="18" text-anchor="start" font-weight="400">鱼雷：节点窗口 ＋ 四个侧向</text><circle cx="723" cy="204" r="18" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><path d="M 748 204 l -8 -4 v 8 Z" fill="#66ded2" transform="rotate(0 723 204)"/><text x="723" y="209" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">DD</text><line x1="737.0" y1="228.2487113059643" x2="775.0" y2="294.0666419935816" stroke="#e9bb72" stroke-width="3" marker-end="url(#arrow)"/><line x1="709.0" y1="228.2487113059643" x2="671.0" y2="294.06664199358164" stroke="#e9bb72" stroke-width="3" marker-end="url(#arrow)"/><line x1="709.0" y1="179.75128869403574" x2="671.0" y2="113.93335800641842" stroke="#e9bb72" stroke-width="3" marker-end="url(#arrow)"/><line x1="737.0" y1="179.7512886940357" x2="775.0" y2="113.93335800641839" stroke="#e9bb72" stroke-width="3" marker-end="url(#arrow)"/><line x1="607" y1="194" x2="623" y2="214" stroke="#f28d79" stroke-width="3"/><line x1="607" y1="214" x2="623" y2="194" stroke="#f28d79" stroke-width="3"/><line x1="823" y1="194" x2="839" y2="214" stroke="#f28d79" stroke-width="3"/><line x1="823" y1="214" x2="839" y2="194" stroke="#f28d79" stroke-width="3"/><text x="520" y="319" fill="#e9bb72" font-size="16" text-anchor="start" font-weight="400">每窗口 1 枚 · 每轮最多 3 枚</text><text x="520" y="355" fill="#d8e4eb" font-size="16" text-anchor="start" font-weight="400">飞速 4 · 寿命 3 轮 · 伤害 45</text><text x="32" y="399" fill="#93b0be" font-size="15" text-anchor="start" font-weight="400">炮弹落点不会追踪目标；鱼雷遇岛或第一艘船停止，友军也能中弹。</text></g></svg>';Mo.aircraft='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 420" role="img" aria-labelledby="title desc"><title id="title">飞机与防空：先拦截，后投弹</title><desc id="desc">航母发射飞机直线出击，单程预算12，返航追踪当前母舰不占出击预算。右侧两艘防空舰各造成1伤害，在投弹前击落2HP飞机。</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#66ded2"/></marker></defs><rect width="960" height="420" rx="12" fill="#0b1723"/><g font-family="Noto Sans SC,Microsoft YaHei,sans-serif"><text x="32" y="40" fill="#66ded2" font-size="23" text-anchor="start" font-weight="600">飞机与防空：先拦截，后投弹</text><text x="38" y="88" fill="#93b0be" font-size="18" text-anchor="start" font-weight="400">出击沿直线，返航追踪当前母舰</text><circle cx="91" cy="192" r="18" fill="#173d4a" stroke="#66ded2" stroke-width="2"/><path d="M 116 192 l -8 -4 v 8 Z" fill="#66ded2" transform="rotate(0 91 192)"/><text x="91" y="197" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">CV</text><line x1="122" y1="181" x2="550" y2="181" stroke="#b5a2e9" stroke-width="3" stroke-dasharray="5 5"/><text x="335" y="165" fill="#b5a2e9" font-size="16" text-anchor="middle" font-weight="400">单程累计 12 格，不会逐轮重置</text><path d="M -18 -3 L -2 -3 L 4 -13 L 8 -13 L 5 -3 L 17 -3 Q 22 0 17 3 L 5 3 L 8 13 L 4 13 L -2 3 L -18 3 L -14 0 Z" transform="translate(375 194)" fill="#b5a2e9" stroke="#dbd3f9" stroke-width="1"/><line x1="549" y1="244" x2="123" y2="244" stroke="#66ded2" stroke-width="3" stroke-dasharray="6 5" marker-end="url(#arrow)"/><text x="335" y="276" fill="#66ded2" font-size="15" text-anchor="middle" font-weight="400">返航不占 12 格；回收后整备一整轮</text><rect x="41" y="313" width="488" height="33" rx="5" fill="#173641" stroke="#b5a2e9"/><text x="285.0" y="335" fill="#b5a2e9" font-size="14" text-anchor="middle" font-weight="400">2 HP · 速度 6 · 视野 3 · 炸弹 25</text><line x1="591" y1="76" x2="591" y2="355" stroke="#2b4958" stroke-width="1"/><text x="630" y="88" fill="#e9bb72" font-size="19" text-anchor="start" font-weight="400">同刻先防空，再投弹</text><circle cx="783" cy="186" r="26" fill="#30293b" stroke="#b5a2e9" stroke-width="2"/><path d="M -18 -3 L -2 -3 L 4 -13 L 8 -13 L 5 -3 L 17 -3 Q 22 0 17 3 L 5 3 L 8 13 L 4 13 L -2 3 L -18 3 L -14 0 Z" transform="translate(783 186)" fill="#b5a2e9" stroke="#dbd3f9" stroke-width="1"/><circle cx="685" cy="249" r="18" fill="#173d4a" stroke="#f28d79" stroke-width="2"/><path d="M 710 249 l -8 -4 v 8 Z" fill="#f28d79" transform="rotate(0 685 249)"/><text x="685" y="254" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">DD</text><circle cx="882" cy="249" r="18" fill="#173d4a" stroke="#f28d79" stroke-width="2"/><path d="M 907 249 l -8 -4 v 8 Z" fill="#f28d79" transform="rotate(180 882 249)"/><text x="882" y="254" fill="#d8e4eb" font-size="12" text-anchor="middle" font-weight="600">CA</text><line x1="705" y1="233" x2="759" y2="205" stroke="#f28d79" stroke-width="3"/><line x1="862" y1="233" x2="807" y2="205" stroke="#f28d79" stroke-width="3"/><text x="719" y="166" fill="#f28d79" font-size="19" text-anchor="middle" font-weight="400">−1</text><text x="851" y="166" fill="#f28d79" font-size="19" text-anchor="middle" font-weight="400">−1</text><text x="781" y="310" fill="#f28d79" font-size="14" text-anchor="middle" font-weight="400">两艘护航舰 → 2 HP 飞机被击落</text><text x="32" y="392" fill="#93b0be" font-size="16" text-anchor="start" font-weight="400">母舰沉没时返航机立即丢失；航母没有自带防空，需要护航。</text></g></svg>';const aT=Object.freeze(Object.defineProperty({__proto__:null,CONTENT_VERSION:nT,SVG_FIGURES:Mo,TEXT_TUTORIAL:sT,TUTORIAL_LESSONS:Fr,createTutorialGame:C1,createTutorialState:b1,evaluateTutorialStep:T1,recordTutorialEvent:w1},Symbol.toStringTag,{value:"Module"})),lT={props:["canResume","saveCount"],emits:["new","load","book","tutorial","resume"],template:`<main class="home-screen">
<div class="home-heading">
<p class="eyebrow">AZURLANE CHESS / v0.4.0</p>
<h1>碧蓝推演棋</h1>
<p>编队，部署，然后让双方的计划同时执行</p>
</div>
<div class="home-grid">
<button class="home-card primary-card" @click="$emit('new')">
<span>01</span>
<strong>新游戏</strong>
<p>选择 3 艘前排与 2 艘后排，对抗战术 AI</p>
<b>开始编队 →</b>
</button>
<button class="home-card" @click="$emit('load')">
<span>02</span>
<strong>读取游戏</strong>
<p>自动存档、3 个手动槽位与 JSON 备份</p>
<b>{{saveCount||0}} 个本机存档 →</b>
</button>
<button class="home-card" @click="$emit('book')">
<span>03</span>
<strong>图文教程</strong>
<p>图解航线、武器、碰撞、视野与存档机制</p>
<b>阅读作战指南 →</b>
</button>
<button class="home-card" @click="$emit('tutorial')">
<span>04</span>
<strong>交互教学</strong>
<p>在独立演练海域实际下令，逐步学会作战</p>
<b>进入教学 →</b>
</button>
</div>
<div v-if="canResume" class="resume-bar">
<span>当前战局已保留，返回后可继续规划</span>
<button class="primary" @click="$emit('resume')">继续当前战局</button>
</div>
<p class="home-note">规划不限时 · PvAI · 存档保存在此浏览器，导出 JSON 可备份到其他设备</p>
</main>`},uT={props:["records","canSave","notice","pending","inBattle"],emits:["close","write","load","export","import","confirm","cancel"],data:()=>({label:"",importSlot:"slot-1"}),methods:{slotName(t){return t==="auto"?"自动存档":"手动槽位 "+t.slice(-1)},time(t){return new Date(t).toLocaleString("zh-CN")}},template:`<div class="modal-backdrop save-backdrop">
<section class="save-manager" role="dialog" aria-modal="true" aria-label="保存与读取游戏">
<div class="panel-title">
<h2>保存与读取</h2>
<button @click="$emit('close')">{{inBattle?'返回战局':'返回主菜单'}}</button>
</div>
<p class="save-explanation">自动存档记录稳定的部署、规划与回合结果。手动槽位不会自动覆盖。存档仅在当前浏览器；导出 JSON 可跨设备备份</p>
<p v-if="notice" class="save-notice" role="status">{{notice}}</p>
<section v-if="pending" class="save-confirm">
<p>{{pending.message}}</p>
<button class="primary" @click="$emit('confirm')">{{pending.kind==='load'?'确认读取':pending.kind==='new'?'确认新游戏':'确认覆盖'}}</button>
<button @click="$emit('cancel')">取消</button>
</section>
<label v-if="canSave" class="save-label">存档名称 <input v-model="label" maxlength="80" placeholder="留空自动命名">
</label>
<div class="save-slots">
<article v-for="record in records" :key="record.id" :data-save-slot="record.id" class="save-slot">
<div>
<small>{{slotName(record.id)}}</small>
<strong>{{record.save?record.save.label:'空槽位'}}</strong>
<p v-if="record.save">R{{String(record.save.state.game.round).padStart(2,'0')}} · {{record.save.state.game.phase==='deploy'?'部署中':record.save.state.game.phase==='ended'?'已结束':'规划中'}} · {{time(record.save.timestamp)}}</p>
<p v-else-if="record.error" class="save-error">{{record.error.message}}</p>
</div>
<div class="slot-actions">
<button v-if="record.id!=='auto'" class="write-slot" :disabled="!canSave||!!pending" @click="$emit('write',{id:record.id,label})">保存</button>
<button class="load-slot" :disabled="!record.save||!!pending" @click="$emit('load',record.id)">读取</button>
<button :disabled="!record.save||!!pending" @click="$emit('export',record.save)">导出</button>
</div>
</article>
</div>
<div class="backup-tools">
<button :disabled="!canSave||!!pending" @click="$emit('export',null)">导出当前战局 JSON</button>
<label>导入到 <select v-model="importSlot">
<option value="slot-1">槽位 1</option>
<option value="slot-2">槽位 2</option>
<option value="slot-3">槽位 3</option>
</select>
</label>
<label class="file-import-button">选择 JSON 文件<input type="file" accept=".json,application/json" :disabled="!!pending" @change="$emit('import',{id:importSlot,file:$event.target.files[0]});$event.target.value=''" />
</label>
</div>
<p class="save-footer">动画执行期间不可保存。浏览器清理站点数据会移除本机存档，重要战局请导出备份</p>
</section>
</div>`},cT={props:["chapters","figures"],emits:["home","practice"],methods:{scopedFigure(t,e){const n="guide-"+e+"-";return t.replace(/id="([^"]+)"/g,(i,s)=>'id="'+n+s+'"').replace(/url\(#([^)]*)\)/g,(i,s)=>"url(#"+n+s+")").replace(/aria-labelledby="([^"]+)"/g,(i,s)=>'aria-labelledby="'+s.split(" ").map(r=>n+r).join(" ")+'"')}},template:`<main class="tutorial-book">
<div class="book-heading">
<div>
<p class="eyebrow">FIELD GUIDE</p>
<h1>图文作战指南</h1>
<p>先理解规则，再决定本回合的航线与火力</p>
</div>
<div>
<button @click="$emit('home')">返回主菜单</button>
<button class="primary" @click="$emit('practice')">交互教学</button>
</div>
</div>
<nav class="book-contents">
<a v-for="(chapter,i) in chapters" :href="'#guide-'+i">{{chapter.title}}</a>
</nav>
<article v-for="(chapter,i) in chapters" :key="i" :id="'guide-'+i" class="guide-chapter">
<div class="chapter-heading">
<span>{{String(i+1).padStart(2,'0')}}</span>
<h2>{{chapter.title}}</h2>
</div>
<div v-if="chapter.figure&&figures[chapter.figure]" class="guide-figure" v-html="scopedFigure(figures[chapter.figure],i)">
</div>
<p v-for="(p,j) in (chapter.paragraphs||chapter.body||[])" :key="j">{{p}}</p>
<ul v-if="chapter.bullets">
<li v-for="b in chapter.bullets">{{b}}</li>
</ul>
<aside v-if="chapter.takeaway||chapter.tip">{{chapter.takeaway||chapter.tip}}</aside>
</article>
<button class="primary" @click="$emit('practice')">在交互教学中试一遍</button>
</main>`},fT={props:["lessons"],emits:["home","start"],template:`<main class="tutorial-menu">
<div class="book-heading">
<div>
<p class="eyebrow">TRAINING WATERS</p>
<h1>交互教学</h1>
<p>每一步要真的完成操作。演练与普通战局、存档相互独立</p>
</div>
<button @click="$emit('home')">返回主菜单</button>
</div>
<div class="lesson-grid">
<button v-for="(lesson,i) in lessons" :key="lesson.id" class="lesson-card" @click="$emit('start',lesson.id)">
<span>{{String(i+1).padStart(2,'0')}} / {{lesson.section==='advanced'?'进阶':'基础'}}</span>
<strong>{{lesson.title}}</strong>
<p>{{lesson.goal}}</p>
<small>{{lesson.duration}} · {{lesson.steps.length}} 个实操步骤 →</small>
</button>
</div>
</main>`};/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const gm="186",Bi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Yi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},hT=0,Q0=1,dT=2,Qu=1,pT=2,Za=3,mo=0,pi=1,$s=2,er=0,al=1,eg=2,tg=3,ng=4,mT=5,qo=100,gT=101,_T=102,vT=103,xT=104,yT=200,ET=201,ST=202,bT=203,R1=204,F1=205,MT=206,AT=207,TT=208,wT=209,CT=210,RT=211,FT=212,DT=213,PT=214,bd=0,Md=1,Ad=2,Rl=3,Td=4,wd=5,Cd=6,Rd=7,D1=0,IT=1,LT=2,ys=0,P1=1,I1=2,L1=3,N1=4,B1=5,U1=6,O1=7,k1=300,go=301,da=302,ch=303,fh=304,Rf=306,Fd=1e3,qs=1001,Dd=1002,Dn=1003,NT=1004,vu=1005,Hn=1006,hh=1007,eo=1008,xi=1009,z1=1010,V1=1011,Fl=1012,_m=1013,Ts=1014,_s=1015,ws=1016,vm=1017,xm=1018,Dl=1020,H1=35902,G1=35899,W1=1021,$1=1022,Ki=1023,or=1026,to=1027,X1=1028,ym=1029,_o=1030,Em=1031,Sm=1033,ec=33776,tc=33777,nc=33778,ic=33779,Pd=35840,Id=35841,Ld=35842,Nd=35843,Bd=36196,Ud=37492,Od=37496,kd=37488,zd=37489,Vc=37490,Vd=37491,Hd=37808,Gd=37809,Wd=37810,$d=37811,Xd=37812,qd=37813,Yd=37814,Kd=37815,Zd=37816,Jd=37817,jd=37818,Qd=37819,ep=37820,tp=37821,np=36492,ip=36494,sp=36495,rp=36283,op=36284,Hc=36285,ap=36286,BT=3200,lp=0,UT=1,Mr="",ui="srgb",Gc="srgb-linear",Wc="linear",Ut="srgb",dh=7680,OT=519,kT=512,zT=513,VT=514,bm=515,HT=516,GT=517,Mm=518,WT=519,q1=35044,ig="300 es",vs=2e3,Pl=2001;function $T(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function $c(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function XT(){const t=$c("canvas");return t.style.display="block",t}const sg={};function Xc(...t){const e="THREE."+t.shift();console.log(e,...t)}function Y1(t){const e=t[0];if(typeof e=="string"&&e.startsWith("TSL:")){const n=t[1];n&&n.isStackTrace?t[0]+=" "+n.getLocation():t[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return t}function ot(...t){t=Y1(t);const e="THREE."+t.shift();{const n=t[0];n&&n.isStackTrace?console.warn(n.getError(e)):console.warn(e,...t)}}function At(...t){t=Y1(t);const e="THREE."+t.shift();{const n=t[0];n&&n.isStackTrace?console.error(n.getError(e)):console.error(e,...t)}}function na(...t){const e=t.join(" ");e in sg||(sg[e]=!0,ot(...t))}function qT(t,e,n){return new Promise(function(i,s){function r(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:s();break;case t.TIMEOUT_EXPIRED:setTimeout(r,n);break;default:i()}}setTimeout(r,n)})}const YT={[bd]:Md,[Ad]:Cd,[Td]:Rd,[Rl]:wd,[Md]:bd,[Cd]:Ad,[Rd]:Td,[wd]:Rl};class Br{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(n);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const n=this._listeners;if(n===void 0)return;const i=n[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const Bn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let rg=1234567;const ll=Math.PI/180,Il=180/Math.PI;function tr(){const t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Bn[t&255]+Bn[t>>8&255]+Bn[t>>16&255]+Bn[t>>24&255]+"-"+Bn[e&255]+Bn[e>>8&255]+"-"+Bn[e>>16&15|64]+Bn[e>>24&255]+"-"+Bn[n&63|128]+Bn[n>>8&255]+"-"+Bn[n>>16&255]+Bn[n>>24&255]+Bn[i&255]+Bn[i>>8&255]+Bn[i>>16&255]+Bn[i>>24&255]).toLowerCase()}function vt(t,e,n){return Math.max(e,Math.min(n,t))}function Am(t,e){return(t%e+e)%e}function KT(t,e,n,i,s){return i+(t-e)*(s-i)/(n-e)}function ZT(t,e,n){return t!==e?(n-t)/(e-t):0}function ul(t,e,n){return(1-n)*t+n*e}function JT(t,e,n,i){return ul(t,e,1-Math.exp(-n*i))}function jT(t,e=1){return e-Math.abs(Am(t,e*2)-e)}function QT(t,e,n){return t<=e?0:t>=n?1:(t=(t-e)/(n-e),t*t*(3-2*t))}function ew(t,e,n){return t<=e?0:t>=n?1:(t=(t-e)/(n-e),t*t*t*(t*(t*6-15)+10))}function tw(t,e){return t+Math.floor(Math.random()*(e-t+1))}function nw(t,e){return t+Math.random()*(e-t)}function iw(t){return t*(.5-Math.random())}function sw(t){t!==void 0&&(rg=t);let e=rg+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function rw(t){return t*ll}function ow(t){return t*Il}function aw(t){return t>0&&Number.isInteger(t)&&2**Math.round(Math.log2(t))===t}function lw(t){return Math.pow(2,Math.ceil(Math.log(t)/Math.LN2))}function uw(t){return Math.pow(2,Math.floor(Math.log(t)/Math.LN2))}function cw(t,e,n,i,s){const r=Math.cos,o=Math.sin,a=r(n/2),l=o(n/2),u=r((e+i)/2),c=o((e+i)/2),f=r((e-i)/2),h=o((e-i)/2),d=r((i-e)/2),m=o((i-e)/2);switch(s){case"XYX":t.set(a*c,l*f,l*h,a*u);break;case"YZY":t.set(l*h,a*c,l*f,a*u);break;case"ZXZ":t.set(l*f,l*h,a*c,a*u);break;case"XZX":t.set(a*c,l*m,l*d,a*u);break;case"YXY":t.set(l*d,a*c,l*m,a*u);break;case"ZYZ":t.set(l*m,l*d,a*c,a*u);break;default:ot("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function qi(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:case Uint8ClampedArray:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Ot(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const K1={DEG2RAD:ll,RAD2DEG:Il,generateUUID:tr,clamp:vt,euclideanModulo:Am,mapLinear:KT,inverseLerp:ZT,lerp:ul,damp:JT,pingpong:jT,smoothstep:QT,smootherstep:ew,randInt:tw,randFloat:nw,randFloatSpread:iw,seededRandom:sw,degToRad:rw,radToDeg:ow,isPowerOfTwo:aw,ceilPowerOfTwo:lw,floorPowerOfTwo:uw,setQuaternionFromProperEuler:cw,normalize:Ot,denormalize:qi},Im=class Im{constructor(e=0,n=0){this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,i=this.y,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6],this.y=s[1]*n+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=vt(this.x,e.x,n.x),this.y=vt(this.y,e.y,n.y),this}clampScalar(e,n){return this.x=vt(this.x,e,n),this.y=vt(this.y,e,n),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(vt(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(vt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const i=Math.cos(n),s=Math.sin(n),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Im.prototype.isVector2=!0;let Ye=Im;class Lr{constructor(e=0,n=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=s}static slerpFlat(e,n,i,s,r,o,a){let l=i[s+0],u=i[s+1],c=i[s+2],f=i[s+3],h=r[o+0],d=r[o+1],m=r[o+2],x=r[o+3];if(f!==x||l!==h||u!==d||c!==m){let _=l*h+u*d+c*m+f*x;_<0&&(h=-h,d=-d,m=-m,x=-x,_=-_);let p=1-a;if(_<.9995){const b=Math.acos(_),y=Math.sin(b);p=Math.sin(p*b)/y,a=Math.sin(a*b)/y,l=l*p+h*a,u=u*p+d*a,c=c*p+m*a,f=f*p+x*a}else{l=l*p+h*a,u=u*p+d*a,c=c*p+m*a,f=f*p+x*a;const b=1/Math.sqrt(l*l+u*u+c*c+f*f);l*=b,u*=b,c*=b,f*=b}}e[n]=l,e[n+1]=u,e[n+2]=c,e[n+3]=f}static multiplyQuaternionsFlat(e,n,i,s,r,o){const a=i[s],l=i[s+1],u=i[s+2],c=i[s+3],f=r[o],h=r[o+1],d=r[o+2],m=r[o+3];return e[n]=a*m+c*f+l*d-u*h,e[n+1]=l*m+c*h+u*f-a*d,e[n+2]=u*m+c*d+a*h-l*f,e[n+3]=c*m-a*f-l*h-u*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,s){return this._x=e,this._y=n,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,u=a(i/2),c=a(s/2),f=a(r/2),h=l(i/2),d=l(s/2),m=l(r/2);switch(o){case"XYZ":this._x=h*c*f+u*d*m,this._y=u*d*f-h*c*m,this._z=u*c*m+h*d*f,this._w=u*c*f-h*d*m;break;case"YXZ":this._x=h*c*f+u*d*m,this._y=u*d*f-h*c*m,this._z=u*c*m-h*d*f,this._w=u*c*f+h*d*m;break;case"ZXY":this._x=h*c*f-u*d*m,this._y=u*d*f+h*c*m,this._z=u*c*m+h*d*f,this._w=u*c*f-h*d*m;break;case"ZYX":this._x=h*c*f-u*d*m,this._y=u*d*f+h*c*m,this._z=u*c*m-h*d*f,this._w=u*c*f+h*d*m;break;case"YZX":this._x=h*c*f+u*d*m,this._y=u*d*f+h*c*m,this._z=u*c*m-h*d*f,this._w=u*c*f-h*d*m;break;case"XZY":this._x=h*c*f-u*d*m,this._y=u*d*f-h*c*m,this._z=u*c*m+h*d*f,this._w=u*c*f+h*d*m;break;default:ot("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const i=n/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,i=n[0],s=n[4],r=n[8],o=n[1],a=n[5],l=n[9],u=n[2],c=n[6],f=n[10],h=i+a+f;if(h>0){const d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(c-l)*d,this._y=(r-u)*d,this._z=(o-s)*d}else if(i>a&&i>f){const d=2*Math.sqrt(1+i-a-f);this._w=(c-l)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+u)/d}else if(a>f){const d=2*Math.sqrt(1+a-i-f);this._w=(r-u)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(l+c)/d}else{const d=2*Math.sqrt(1+f-i-a);this._w=(o-s)/d,this._x=(r+u)/d,this._y=(l+c)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(vt(this.dot(e),-1,1)))}rotateTowards(e,n){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,n/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const i=e._x,s=e._y,r=e._z,o=e._w,a=n._x,l=n._y,u=n._z,c=n._w;return this._x=i*c+o*a+s*u-r*l,this._y=s*c+o*l+r*a-i*u,this._z=r*c+o*u+i*l-s*a,this._w=o*c-i*a-s*l-r*u,this._onChangeCallback(),this}slerp(e,n){let i=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,s=-s,r=-r,o=-o,a=-a);let l=1-n;if(a<.9995){const u=Math.acos(a),c=Math.sin(u);l=Math.sin(l*u)/c,n=Math.sin(n*u)/c,this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+r*n,this._w=this._w*l+o*n,this._onChangeCallback()}else this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+r*n,this._w=this._w*l+o*n,this.normalize();return this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){const e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(n),r*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Lm=class Lm{constructor(e=0,n=0,i=0){this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(og.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(og.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6]*s,this.y=r[1]*n+r[4]*i+r[7]*s,this.z=r[2]*n+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*n+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*n+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*n+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*n+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const n=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,u=2*(o*s-a*i),c=2*(a*n-r*s),f=2*(r*i-o*n);return this.x=n+l*u+o*f-a*c,this.y=i+l*c+a*u-r*f,this.z=s+l*f+r*c-o*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*n+r[4]*i+r[8]*s,this.y=r[1]*n+r[5]*i+r[9]*s,this.z=r[2]*n+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=vt(this.x,e.x,n.x),this.y=vt(this.y,e.y,n.y),this.z=vt(this.z,e.z,n.z),this}clampScalar(e,n){return this.x=vt(this.x,e,n),this.y=vt(this.y,e,n),this.z=vt(this.z,e,n),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(vt(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const i=e.x,s=e.y,r=e.z,o=n.x,a=n.y,l=n.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return ph.copy(this).projectOnVector(e),this.sub(ph)}reflect(e){return this.sub(ph.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(vt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return n*n+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){const s=Math.sin(n)*e;return this.x=s*Math.sin(i),this.y=Math.cos(n)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=s,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Lm.prototype.isVector3=!0;let X=Lm;const ph=new X,og=new Lr,Nm=class Nm{constructor(e,n,i,s,r,o,a,l,u){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,s,r,o,a,l,u)}set(e,n,i,s,r,o,a,l,u){const c=this.elements;return c[0]=e,c[1]=s,c[2]=a,c[3]=n,c[4]=r,c[5]=l,c[6]=i,c[7]=o,c[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,s=n.elements,r=this.elements,o=i[0],a=i[3],l=i[6],u=i[1],c=i[4],f=i[7],h=i[2],d=i[5],m=i[8],x=s[0],_=s[3],p=s[6],b=s[1],y=s[4],g=s[7],E=s[2],T=s[5],C=s[8];return r[0]=o*x+a*b+l*E,r[3]=o*_+a*y+l*T,r[6]=o*p+a*g+l*C,r[1]=u*x+c*b+f*E,r[4]=u*_+c*y+f*T,r[7]=u*p+c*g+f*C,r[2]=h*x+d*b+m*E,r[5]=h*_+d*y+m*T,r[8]=h*p+d*g+m*C,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],u=e[7],c=e[8];return n*o*c-n*a*u-i*r*c+i*a*l+s*r*u-s*o*l}invert(){const e=this.elements,n=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],u=e[7],c=e[8],f=c*o-a*u,h=a*l-c*r,d=u*r-o*l,m=n*f+i*h+s*d;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/m;return e[0]=f*x,e[1]=(s*u-c*i)*x,e[2]=(a*i-s*o)*x,e[3]=h*x,e[4]=(c*n-s*l)*x,e[5]=(s*r-a*n)*x,e[6]=d*x,e[7]=(i*l-u*n)*x,e[8]=(o*n-i*r)*x,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,s,r,o,a){const l=Math.cos(r),u=Math.sin(r);return this.set(i*l,i*u,-i*(l*o+u*a)+o+e,-s*u,s*l,-s*(-u*o+l*a)+a+n,0,0,1),this}scale(e,n){return na("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(mh.makeScale(e,n)),this}rotate(e){return na("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(mh.makeRotation(-e)),this}translate(e,n){return na("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(mh.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,i=e.elements;for(let s=0;s<9;s++)if(n[s]!==i[s])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Nm.prototype.isMatrix3=!0;let ct=Nm;const mh=new ct,ag=new ct().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),lg=new ct().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function fw(){const t={enabled:!0,workingColorSpace:Gc,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Ut&&(s.r=nr(s.r),s.g=nr(s.g),s.b=nr(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Ut&&(s.r=ia(s.r),s.g=ia(s.g),s.b=ia(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Mr?Wc:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return na("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),t.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return na("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),t.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return t.define({[Gc]:{primaries:e,whitePoint:i,transfer:Wc,toXYZ:ag,fromXYZ:lg,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:ui},outputColorSpaceConfig:{drawingBufferColorSpace:ui}},[ui]:{primaries:e,whitePoint:i,transfer:Ut,toXYZ:ag,fromXYZ:lg,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:ui}}}),t}const bt=fw();function nr(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function ia(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}let Ro;class hw{static getDataURL(e,n="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Ro===void 0&&(Ro=$c("canvas")),Ro.width=e.width,Ro.height=e.height;const s=Ro.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Ro}return i.toDataURL(n)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=$c("canvas");n.width=e.width,n.height=e.height;const i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=nr(r[o]/255)*255;return i.putImageData(s,0,0),n}else if(e.data){const n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(nr(n[i]/255)*255):n[i]=nr(n[i]);return{data:n,width:e.width,height:e.height}}else return ot("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let dw=0;class Tm{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:dw++}),this.uuid=tr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?e.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame<"u"&&n instanceof VideoFrame?e.set(n.displayWidth,n.displayHeight,0):n!==null?e.set(n.width,n.height,n.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(gh(s[o].image)):r.push(gh(s[o]))}else r=gh(s);i.url=r}return n||(e.images[this.uuid]=i),i}}function gh(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?hw.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(ot("Texture: Unable to serialize Texture."),{})}let pw=0;const _h=new X;class Wn extends Br{constructor(e=Wn.DEFAULT_IMAGE,n=Wn.DEFAULT_MAPPING,i=qs,s=qs,r=Hn,o=eo,a=Ki,l=xi,u=Wn.DEFAULT_ANISOTROPY,c=Mr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:pw++}),this.uuid=tr(),this.name="",this.source=new Tm(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=u,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ye(0,0),this.repeat=new Ye(1,1),this.center=new Ye(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ct,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=c,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(_h).x}get height(){return this.source.getSize(_h).y}get depth(){return this.source.getSize(_h).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const n in e){const i=e[n];if(i===void 0){ot(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}const s=this[n];if(s===void 0){ot(`Texture.setValues(): property '${n}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==k1)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Fd:e.x=e.x-Math.floor(e.x);break;case qs:e.x=e.x<0?0:1;break;case Dd:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Fd:e.y=e.y-Math.floor(e.y);break;case qs:e.y=e.y<0?0:1;break;case Dd:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Wn.DEFAULT_IMAGE=null;Wn.DEFAULT_MAPPING=k1;Wn.DEFAULT_ANISOTROPY=1;const Bm=class Bm{constructor(e=0,n=0,i=0,s=1){this.x=e,this.y=n,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,s){return this.x=e,this.y=n,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*n+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*n+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*n+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*n+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,s,r;const l=e.elements,u=l[0],c=l[4],f=l[8],h=l[1],d=l[5],m=l[9],x=l[2],_=l[6],p=l[10];if(Math.abs(c-h)<.01&&Math.abs(f-x)<.01&&Math.abs(m-_)<.01){if(Math.abs(c+h)<.1&&Math.abs(f+x)<.1&&Math.abs(m+_)<.1&&Math.abs(u+d+p-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const y=(u+1)/2,g=(d+1)/2,E=(p+1)/2,T=(c+h)/4,C=(f+x)/4,v=(m+_)/4;return y>g&&y>E?y<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(y),s=T/i,r=C/i):g>E?g<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(g),i=T/s,r=v/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=C/r,s=v/r),this.set(i,s,r,n),this}let b=Math.sqrt((_-m)*(_-m)+(f-x)*(f-x)+(h-c)*(h-c));return Math.abs(b)<.001&&(b=1),this.x=(_-m)/b,this.y=(f-x)/b,this.z=(h-c)/b,this.w=Math.acos((u+d+p-1)/2),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=vt(this.x,e.x,n.x),this.y=vt(this.y,e.y,n.y),this.z=vt(this.z,e.z,n.z),this.w=vt(this.w,e.w,n.w),this}clampScalar(e,n){return this.x=vt(this.x,e,n),this.y=vt(this.y,e,n),this.z=vt(this.z,e,n),this.w=vt(this.w,e,n),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(vt(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Bm.prototype.isVector4=!0;let sn=Bm;class mw extends Br{constructor(e=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Hn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=i.depth,this.scissor=new sn(0,0,e,n),this.scissorTest=!1,this.viewport=new sn(0,0,e,n),this.textures=[];const s={width:e,height:n,depth:i.depth},r=new Wn(s),o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const n={minFilter:Hn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(n.mapping=e.mapping),e.wrapS!==void 0&&(n.wrapS=e.wrapS),e.wrapT!==void 0&&(n.wrapT=e.wrapT),e.wrapR!==void 0&&(n.wrapR=e.wrapR),e.magFilter!==void 0&&(n.magFilter=e.magFilter),e.minFilter!==void 0&&(n.minFilter=e.minFilter),e.format!==void 0&&(n.format=e.format),e.type!==void 0&&(n.type=e.type),e.anisotropy!==void 0&&(n.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(n.colorSpace=e.colorSpace),e.flipY!==void 0&&(n.flipY=e.flipY),e.generateMipmaps!==void 0&&(n.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(n.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=n,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++){this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;const s=Object.assign({},e.textures[n].image);this.textures[n].source=new Tm(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const n=e.depthTexture.clone();n.renderTarget=null,this.depthTexture=n}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class es extends mw{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}}class Z1 extends Wn{constructor(e=null,n=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:s},this.magFilter=Dn,this.minFilter=Dn,this.wrapR=qs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class gw extends Wn{constructor(e=null,n=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:s},this.magFilter=Dn,this.minFilter=Dn,this.wrapR=qs,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const Jc=class Jc{constructor(e,n,i,s,r,o,a,l,u,c,f,h,d,m,x,_){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,s,r,o,a,l,u,c,f,h,d,m,x,_)}set(e,n,i,s,r,o,a,l,u,c,f,h,d,m,x,_){const p=this.elements;return p[0]=e,p[4]=n,p[8]=i,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=u,p[6]=c,p[10]=f,p[14]=h,p[3]=d,p[7]=m,p[11]=x,p[15]=_,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Jc().fromArray(this.elements)}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){const n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return this.determinantAffine()===0?(e.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const n=this.elements,i=e.elements,s=1/Fo.setFromMatrixColumn(e,0).length(),r=1/Fo.setFromMatrixColumn(e,1).length(),o=1/Fo.setFromMatrixColumn(e,2).length();return n[0]=i[0]*s,n[1]=i[1]*s,n[2]=i[2]*s,n[3]=0,n[4]=i[4]*r,n[5]=i[5]*r,n[6]=i[6]*r,n[7]=0,n[8]=i[8]*o,n[9]=i[9]*o,n[10]=i[10]*o,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),u=Math.sin(s),c=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){const h=o*c,d=o*f,m=a*c,x=a*f;n[0]=l*c,n[4]=-l*f,n[8]=u,n[1]=d+m*u,n[5]=h-x*u,n[9]=-a*l,n[2]=x-h*u,n[6]=m+d*u,n[10]=o*l}else if(e.order==="YXZ"){const h=l*c,d=l*f,m=u*c,x=u*f;n[0]=h+x*a,n[4]=m*a-d,n[8]=o*u,n[1]=o*f,n[5]=o*c,n[9]=-a,n[2]=d*a-m,n[6]=x+h*a,n[10]=o*l}else if(e.order==="ZXY"){const h=l*c,d=l*f,m=u*c,x=u*f;n[0]=h-x*a,n[4]=-o*f,n[8]=m+d*a,n[1]=d+m*a,n[5]=o*c,n[9]=x-h*a,n[2]=-o*u,n[6]=a,n[10]=o*l}else if(e.order==="ZYX"){const h=o*c,d=o*f,m=a*c,x=a*f;n[0]=l*c,n[4]=m*u-d,n[8]=h*u+x,n[1]=l*f,n[5]=x*u+h,n[9]=d*u-m,n[2]=-u,n[6]=a*l,n[10]=o*l}else if(e.order==="YZX"){const h=o*l,d=o*u,m=a*l,x=a*u;n[0]=l*c,n[4]=x-h*f,n[8]=m*f+d,n[1]=f,n[5]=o*c,n[9]=-a*c,n[2]=-u*c,n[6]=d*f+m,n[10]=h-x*f}else if(e.order==="XZY"){const h=o*l,d=o*u,m=a*l,x=a*u;n[0]=l*c,n[4]=-f,n[8]=u*c,n[1]=h*f+x,n[5]=o*c,n[9]=d*f-m,n[2]=m*f-d,n[6]=a*c,n[10]=x*f+h}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(_w,e,vw)}lookAt(e,n,i){const s=this.elements;return mi.subVectors(e,n),mi.lengthSq()===0&&(mi.z=1),mi.normalize(),hr.crossVectors(i,mi),hr.lengthSq()===0&&(Math.abs(i.z)===1?mi.x+=1e-4:mi.z+=1e-4,mi.normalize(),hr.crossVectors(i,mi)),hr.normalize(),xu.crossVectors(mi,hr),s[0]=hr.x,s[4]=xu.x,s[8]=mi.x,s[1]=hr.y,s[5]=xu.y,s[9]=mi.y,s[2]=hr.z,s[6]=xu.z,s[10]=mi.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,s=n.elements,r=this.elements,o=i[0],a=i[4],l=i[8],u=i[12],c=i[1],f=i[5],h=i[9],d=i[13],m=i[2],x=i[6],_=i[10],p=i[14],b=i[3],y=i[7],g=i[11],E=i[15],T=s[0],C=s[4],v=s[8],A=s[12],R=s[1],L=s[5],M=s[9],I=s[13],F=s[2],B=s[6],O=s[10],z=s[14],H=s[3],Y=s[7],Q=s[11],se=s[15];return r[0]=o*T+a*R+l*F+u*H,r[4]=o*C+a*L+l*B+u*Y,r[8]=o*v+a*M+l*O+u*Q,r[12]=o*A+a*I+l*z+u*se,r[1]=c*T+f*R+h*F+d*H,r[5]=c*C+f*L+h*B+d*Y,r[9]=c*v+f*M+h*O+d*Q,r[13]=c*A+f*I+h*z+d*se,r[2]=m*T+x*R+_*F+p*H,r[6]=m*C+x*L+_*B+p*Y,r[10]=m*v+x*M+_*O+p*Q,r[14]=m*A+x*I+_*z+p*se,r[3]=b*T+y*R+g*F+E*H,r[7]=b*C+y*L+g*B+E*Y,r[11]=b*v+y*M+g*O+E*Q,r[15]=b*A+y*I+g*z+E*se,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],u=e[13],c=e[2],f=e[6],h=e[10],d=e[14],m=e[3],x=e[7],_=e[11],p=e[15],b=l*d-u*h,y=a*d-u*f,g=a*h-l*f,E=o*d-u*c,T=o*h-l*c,C=o*f-a*c;return n*(x*b-_*y+p*g)-i*(m*b-_*E+p*T)+s*(m*y-x*E+p*C)-r*(m*g-x*T+_*C)}determinantAffine(){const e=this.elements,n=e[0],i=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],u=e[6],c=e[10];return n*(o*c-a*u)-i*(r*c-a*l)+s*(r*u-o*l)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=n,s[14]=i),this}invert(){const e=this.elements,n=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],u=e[7],c=e[8],f=e[9],h=e[10],d=e[11],m=e[12],x=e[13],_=e[14],p=e[15],b=n*a-i*o,y=n*l-s*o,g=n*u-r*o,E=i*l-s*a,T=i*u-r*a,C=s*u-r*l,v=c*x-f*m,A=c*_-h*m,R=c*p-d*m,L=f*_-h*x,M=f*p-d*x,I=h*p-d*_,F=b*I-y*M+g*L+E*R-T*A+C*v;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const B=1/F;return e[0]=(a*I-l*M+u*L)*B,e[1]=(s*M-i*I-r*L)*B,e[2]=(x*C-_*T+p*E)*B,e[3]=(h*T-f*C-d*E)*B,e[4]=(l*R-o*I-u*A)*B,e[5]=(n*I-s*R+r*A)*B,e[6]=(_*g-m*C-p*y)*B,e[7]=(c*C-h*g+d*y)*B,e[8]=(o*M-a*R+u*v)*B,e[9]=(i*R-n*M-r*v)*B,e[10]=(m*T-x*g+p*b)*B,e[11]=(f*g-c*T-d*b)*B,e[12]=(a*A-o*L-l*v)*B,e[13]=(n*L-i*A+s*v)*B,e[14]=(x*y-m*E-_*b)*B,e[15]=(c*E-f*y+h*b)*B,this}scale(e){const n=this.elements,i=e.x,s=e.y,r=e.z;return n[0]*=i,n[4]*=s,n[8]*=r,n[1]*=i,n[5]*=s,n[9]*=r,n[2]*=i,n[6]*=s,n[10]*=r,n[3]*=i,n[7]*=s,n[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,s))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const i=Math.cos(n),s=Math.sin(n),r=1-i,o=e.x,a=e.y,l=e.z,u=r*o,c=r*a;return this.set(u*o+i,u*a-s*l,u*l+s*a,0,u*a+s*l,c*a+i,c*l-s*o,0,u*l-s*a,c*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,n,s,1,0,0,0,0,1),this}compose(e,n,i){const s=this.elements,r=n._x,o=n._y,a=n._z,l=n._w,u=r+r,c=o+o,f=a+a,h=r*u,d=r*c,m=r*f,x=o*c,_=o*f,p=a*f,b=l*u,y=l*c,g=l*f,E=i.x,T=i.y,C=i.z;return s[0]=(1-(x+p))*E,s[1]=(d+g)*E,s[2]=(m-y)*E,s[3]=0,s[4]=(d-g)*T,s[5]=(1-(h+p))*T,s[6]=(_+b)*T,s[7]=0,s[8]=(m+y)*C,s[9]=(_-b)*C,s[10]=(1-(h+x))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,n,i){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return i.set(1,1,1),n.identity(),this;let o=Fo.set(s[0],s[1],s[2]).length();const a=Fo.set(s[4],s[5],s[6]).length(),l=Fo.set(s[8],s[9],s[10]).length();r<0&&(o=-o),ki.copy(this);const u=1/o,c=1/a,f=1/l;return ki.elements[0]*=u,ki.elements[1]*=u,ki.elements[2]*=u,ki.elements[4]*=c,ki.elements[5]*=c,ki.elements[6]*=c,ki.elements[8]*=f,ki.elements[9]*=f,ki.elements[10]*=f,n.setFromRotationMatrix(ki),i.x=o,i.y=a,i.z=l,this}makePerspective(e,n,i,s,r,o,a=vs,l=!1){const u=this.elements,c=2*r/(n-e),f=2*r/(i-s),h=(n+e)/(n-e),d=(i+s)/(i-s);let m,x;if(l)m=r/(o-r),x=o*r/(o-r);else if(a===vs)m=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===Pl)m=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return u[0]=c,u[4]=0,u[8]=h,u[12]=0,u[1]=0,u[5]=f,u[9]=d,u[13]=0,u[2]=0,u[6]=0,u[10]=m,u[14]=x,u[3]=0,u[7]=0,u[11]=-1,u[15]=0,this}makeOrthographic(e,n,i,s,r,o,a=vs,l=!1){const u=this.elements,c=2/(n-e),f=2/(i-s),h=-(n+e)/(n-e),d=-(i+s)/(i-s);let m,x;if(l)m=1/(o-r),x=o/(o-r);else if(a===vs)m=-2/(o-r),x=-(o+r)/(o-r);else if(a===Pl)m=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return u[0]=c,u[4]=0,u[8]=0,u[12]=h,u[1]=0,u[5]=f,u[9]=0,u[13]=d,u[2]=0,u[6]=0,u[10]=m,u[14]=x,u[3]=0,u[7]=0,u[11]=0,u[15]=1,this}equals(e){const n=this.elements,i=e.elements;for(let s=0;s<16;s++)if(n[s]!==i[s])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}};Jc.prototype.isMatrix4=!0;let Zt=Jc;const Fo=new X,ki=new Zt,_w=new X(0,0,0),vw=new X(1,1,1),hr=new X,xu=new X,mi=new X,ug=new Zt,cg=new Lr;class Nr{constructor(e=0,n=0,i=0,s=Nr.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,s=this._order){return this._x=e,this._y=n,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],u=s[5],c=s[9],f=s[2],h=s[6],d=s[10];switch(n){case"XYZ":this._y=Math.asin(vt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-c,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,u),this._z=0);break;case"YXZ":this._x=Math.asin(-vt(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(vt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-o,u)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-vt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,u));break;case"YZX":this._z=Math.asin(vt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-c,u),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-vt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,u),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-c,d),this._y=0);break;default:ot("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return ug.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ug,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return cg.setFromEuler(this),this.setFromQuaternion(cg,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Nr.DEFAULT_ORDER="XYZ";class wm{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let xw=0;const fg=new X,Do=new Lr,Is=new Zt,yu=new X,La=new X,yw=new X,Ew=new Lr,hg=new X(1,0,0),dg=new X(0,1,0),pg=new X(0,0,1),mg={type:"added"},Sw={type:"removed"},Po={type:"childadded",child:null},vh={type:"childremoved",child:null};class gn extends Br{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xw++}),this.uuid=tr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=gn.DEFAULT_UP.clone();const e=new X,n=new Nr,i=new Lr,s=new X(1,1,1);function r(){i.setFromEuler(n,!1)}function o(){n.setFromQuaternion(i,void 0,!1)}n._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Zt},normalMatrix:{value:new ct}}),this.matrix=new Zt,this.matrixWorld=new Zt,this.matrixAutoUpdate=gn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=gn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return Do.setFromAxisAngle(e,n),this.quaternion.multiply(Do),this}rotateOnWorldAxis(e,n){return Do.setFromAxisAngle(e,n),this.quaternion.premultiply(Do),this}rotateX(e){return this.rotateOnAxis(hg,e)}rotateY(e){return this.rotateOnAxis(dg,e)}rotateZ(e){return this.rotateOnAxis(pg,e)}translateOnAxis(e,n){return fg.copy(e).applyQuaternion(this.quaternion),this.position.add(fg.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(hg,e)}translateY(e){return this.translateOnAxis(dg,e)}translateZ(e){return this.translateOnAxis(pg,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Is.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?yu.copy(e):yu.set(e,n,i);const s=this.parent;this.updateWorldMatrix(!0,!1),La.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Is.lookAt(La,yu,this.up):Is.lookAt(yu,La,this.up),this.quaternion.setFromRotationMatrix(Is),s&&(Is.extractRotation(s.matrixWorld),Do.setFromRotationMatrix(Is),this.quaternion.premultiply(Do.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(At("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(mg),Po.child=e,this.dispatchEvent(Po),Po.child=null):At("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(Sw),vh.child=e,this.dispatchEvent(vh),vh.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Is.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Is.multiply(e.parent.matrixWorld)),e.applyMatrix4(Is),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(mg),Po.child=e,this.dispatchEvent(Po),Po.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,n);if(o!==void 0)return o}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(La,e,yw),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(La,Ew,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);const n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const n=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=n-r[0]*n-r[4]*i-r[8]*s,r[13]+=i-r[1]*n-r[5]*i-r[9]*s,r[14]+=s-r[2]*n-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n,i=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),n===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let u=0,c=l.length;u<c;u++){const f=l[u];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,u=this.material.length;l<u;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(n){const a=o(e.geometries),l=o(e.materials),u=o(e.textures),c=o(e.images),f=o(e.shapes),h=o(e.skeletons),d=o(e.animations),m=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),u.length>0&&(i.textures=u),c.length>0&&(i.images=c),f.length>0&&(i.shapes=f),h.length>0&&(i.skeletons=h),d.length>0&&(i.animations=d),m.length>0&&(i.nodes=m)}return i.object=s,i;function o(a){const l=[];for(const u in a){const c=a[u];delete c.metadata,l.push(c)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}gn.DEFAULT_UP=new X(0,1,0);gn.DEFAULT_MATRIX_AUTO_UPDATE=!0;gn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class fi extends gn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const bw={type:"move"};class xh{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new fi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new fi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new X,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new X),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new fi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new X,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new X,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,u=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(u&&e.hand){o=!0;for(const x of e.hand.values()){const _=n.getJointPose(x,i),p=this._getHandJoint(u,x);_!==null&&(p.matrix.fromArray(_.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=_.radius),p.visible=_!==null}const c=u.joints["index-finger-tip"],f=u.joints["thumb-tip"],h=c.position.distanceTo(f.position),d=.02,m=.005;u.inputState.pinching&&h>d+m?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&h<=d-m&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=n.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=n.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(bw)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),u!==null&&(u.visible=o!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new fi;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}const J1={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},dr={h:0,s:0,l:0},Eu={h:0,s:0,l:0};function yh(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}class St{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=ui){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,bt.colorSpaceToWorking(this,n),this}setRGB(e,n,i,s=bt.workingColorSpace){return this.r=e,this.g=n,this.b=i,bt.colorSpaceToWorking(this,s),this}setHSL(e,n,i,s=bt.workingColorSpace){if(e=Am(e,1),n=vt(n,0,1),i=vt(i,0,1),n===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+n):i+n-i*n,o=2*i-r;this.r=yh(o,r,e+1/3),this.g=yh(o,r,e),this.b=yh(o,r,e-1/3)}return bt.colorSpaceToWorking(this,s),this}setStyle(e,n=ui){function i(r){r!==void 0&&parseFloat(r)<1&&ot("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,n);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,n);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,n);break;default:ot("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,n);if(o===6)return this.setHex(parseInt(r,16),n);ot("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=ui){const i=J1[e.toLowerCase()];return i!==void 0?this.setHex(i,n):ot("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=nr(e.r),this.g=nr(e.g),this.b=nr(e.b),this}copyLinearToSRGB(e){return this.r=ia(e.r),this.g=ia(e.g),this.b=ia(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ui){return bt.workingToColorSpace(Un.copy(this),e),Math.round(vt(Un.r*255,0,255))*65536+Math.round(vt(Un.g*255,0,255))*256+Math.round(vt(Un.b*255,0,255))}getHexString(e=ui){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=bt.workingColorSpace){bt.workingToColorSpace(Un.copy(this),n);const i=Un.r,s=Un.g,r=Un.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let l,u;const c=(a+o)/2;if(a===o)l=0,u=0;else{const f=o-a;switch(u=c<=.5?f/(o+a):f/(2-o-a),o){case i:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-i)/f+2;break;case r:l=(i-s)/f+4;break}l/=6}return e.h=l,e.s=u,e.l=c,e}getRGB(e,n=bt.workingColorSpace){return bt.workingToColorSpace(Un.copy(this),n),e.r=Un.r,e.g=Un.g,e.b=Un.b,e}getStyle(e=ui){bt.workingToColorSpace(Un.copy(this),e);const n=Un.r,i=Un.g,s=Un.b;return e!==ui?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,n,i){return this.getHSL(dr),this.setHSL(dr.h+e,dr.s+n,dr.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(dr),e.getHSL(Eu);const i=ul(dr.h,Eu.h,n),s=ul(dr.s,Eu.s,n),r=ul(dr.l,Eu.l,n);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*n+r[3]*i+r[6]*s,this.g=r[1]*n+r[4]*i+r[7]*s,this.b=r[2]*n+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Un=new St;St.NAMES=J1;class Mw extends gn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Nr,this.environmentIntensity=1,this.environmentRotation=new Nr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),n.object.backgroundBlurriness=this.backgroundBlurriness,n.object.backgroundIntensity=this.backgroundIntensity,n.object.backgroundRotation=this.backgroundRotation.toArray(),n.object.environmentIntensity=this.environmentIntensity,n.object.environmentRotation=this.environmentRotation.toArray(),n}}const zi=new X,Ls=new X,Eh=new X,Ns=new X,Io=new X,Lo=new X,gg=new X,Sh=new X,bh=new X,Mh=new X,Ah=new sn,Th=new sn,wh=new sn;class Ii{constructor(e=new X,n=new X,i=new X){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,s){s.subVectors(i,n),zi.subVectors(e,n),s.cross(zi);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,n,i,s,r){zi.subVectors(s,n),Ls.subVectors(i,n),Eh.subVectors(e,n);const o=zi.dot(zi),a=zi.dot(Ls),l=zi.dot(Eh),u=Ls.dot(Ls),c=Ls.dot(Eh),f=o*u-a*a;if(f===0)return r.set(0,0,0),null;const h=1/f,d=(u*l-a*c)*h,m=(o*c-a*l)*h;return r.set(1-d-m,m,d)}static containsPoint(e,n,i,s){return this.getBarycoord(e,n,i,s,Ns)===null?!1:Ns.x>=0&&Ns.y>=0&&Ns.x+Ns.y<=1}static getInterpolation(e,n,i,s,r,o,a,l){return this.getBarycoord(e,n,i,s,Ns)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ns.x),l.addScaledVector(o,Ns.y),l.addScaledVector(a,Ns.z),l)}static getInterpolatedAttribute(e,n,i,s,r,o){return Ah.setScalar(0),Th.setScalar(0),wh.setScalar(0),Ah.fromBufferAttribute(e,n),Th.fromBufferAttribute(e,i),wh.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Ah,r.x),o.addScaledVector(Th,r.y),o.addScaledVector(wh,r.z),o}static isFrontFacing(e,n,i,s){return zi.subVectors(i,n),Ls.subVectors(e,n),zi.cross(Ls).dot(s)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,s){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,n,i,s){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return zi.subVectors(this.c,this.b),Ls.subVectors(this.a,this.b),zi.cross(Ls).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Ii.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return Ii.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,s,r){return Ii.getInterpolation(e,this.a,this.b,this.c,n,i,s,r)}containsPoint(e){return Ii.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Ii.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,s=this.b,r=this.c;let o,a;Io.subVectors(s,i),Lo.subVectors(r,i),Sh.subVectors(e,i);const l=Io.dot(Sh),u=Lo.dot(Sh);if(l<=0&&u<=0)return n.copy(i);bh.subVectors(e,s);const c=Io.dot(bh),f=Lo.dot(bh);if(c>=0&&f<=c)return n.copy(s);const h=l*f-c*u;if(h<=0&&l>=0&&c<=0)return o=l/(l-c),n.copy(i).addScaledVector(Io,o);Mh.subVectors(e,r);const d=Io.dot(Mh),m=Lo.dot(Mh);if(m>=0&&d<=m)return n.copy(r);const x=d*u-l*m;if(x<=0&&u>=0&&m<=0)return a=u/(u-m),n.copy(i).addScaledVector(Lo,a);const _=c*m-d*f;if(_<=0&&f-c>=0&&d-m>=0)return gg.subVectors(r,s),a=(f-c)/(f-c+(d-m)),n.copy(s).addScaledVector(gg,a);const p=1/(_+x+h);return o=x*p,a=h*p,n.copy(i).addScaledVector(Io,o).addScaledVector(Lo,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class ql{constructor(e=new X(1/0,1/0,1/0),n=new X(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(Vi.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(Vi.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const i=Vi.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(n===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Vi):Vi.fromBufferAttribute(r,o),Vi.applyMatrix4(e.matrixWorld),this.expandByPoint(Vi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Su.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Su.copy(i.boundingBox)),Su.applyMatrix4(e.matrixWorld),this.union(Su)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Vi),Vi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Na),bu.subVectors(this.max,Na),No.subVectors(e.a,Na),Bo.subVectors(e.b,Na),Uo.subVectors(e.c,Na),pr.subVectors(Bo,No),mr.subVectors(Uo,Bo),Wr.subVectors(No,Uo);let n=[0,-pr.z,pr.y,0,-mr.z,mr.y,0,-Wr.z,Wr.y,pr.z,0,-pr.x,mr.z,0,-mr.x,Wr.z,0,-Wr.x,-pr.y,pr.x,0,-mr.y,mr.x,0,-Wr.y,Wr.x,0];return!Ch(n,No,Bo,Uo,bu)||(n=[1,0,0,0,1,0,0,0,1],!Ch(n,No,Bo,Uo,bu))?!1:(Mu.crossVectors(pr,mr),n=[Mu.x,Mu.y,Mu.z],Ch(n,No,Bo,Uo,bu))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Vi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Vi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Bs[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Bs[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Bs[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Bs[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Bs[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Bs[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Bs[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Bs[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Bs),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Bs=[new X,new X,new X,new X,new X,new X,new X,new X],Vi=new X,Su=new ql,No=new X,Bo=new X,Uo=new X,pr=new X,mr=new X,Wr=new X,Na=new X,bu=new X,Mu=new X,$r=new X;function Ch(t,e,n,i,s){for(let r=0,o=t.length-3;r<=o;r+=3){$r.fromArray(t,r);const a=s.x*Math.abs($r.x)+s.y*Math.abs($r.y)+s.z*Math.abs($r.z),l=e.dot($r),u=n.dot($r),c=i.dot($r);if(Math.max(-Math.max(l,u,c),Math.min(l,u,c))>a)return!1}return!0}const ln=new X,Au=new Ye;let Aw=0;class Es extends Br{constructor(e,n,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Aw++}),this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=q1,this.updateRanges=[],this.gpuType=_s,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=n.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)Au.fromBufferAttribute(this,n),Au.applyMatrix3(e),this.setXY(n,Au.x,Au.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)ln.fromBufferAttribute(this,n),ln.applyMatrix3(e),this.setXYZ(n,ln.x,ln.y,ln.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)ln.fromBufferAttribute(this,n),ln.applyMatrix4(e),this.setXYZ(n,ln.x,ln.y,ln.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)ln.fromBufferAttribute(this,n),ln.applyNormalMatrix(e),this.setXYZ(n,ln.x,ln.y,ln.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)ln.fromBufferAttribute(this,n),ln.transformDirection(e),this.setXYZ(n,ln.x,ln.y,ln.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=qi(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=Ot(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=qi(n,this.array)),n}setX(e,n){return this.normalized&&(n=Ot(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=qi(n,this.array)),n}setY(e,n){return this.normalized&&(n=Ot(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=qi(n,this.array)),n}setZ(e,n){return this.normalized&&(n=Ot(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=qi(n,this.array)),n}setW(e,n){return this.normalized&&(n=Ot(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=Ot(n,this.array),i=Ot(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,s){return e*=this.itemSize,this.normalized&&(n=Ot(n,this.array),i=Ot(i,this.array),s=Ot(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,n,i,s,r){return e*=this.itemSize,this.normalized&&(n=Ot(n,this.array),i=Ot(i,this.array),s=Ot(s,this.array),r=Ot(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}}class j1 extends Es{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class Q1 extends Es{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class _n extends Es{constructor(e,n,i){super(new Float32Array(e),n,i)}}const Tw=new ql,Ba=new X,Rh=new X;class Ff{constructor(e=new X,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const i=this.center;n!==void 0?i.copy(n):Tw.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ba.subVectors(e,this.center);const n=Ba.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),s=(i-this.radius)*.5;this.center.addScaledVector(Ba,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Rh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ba.copy(e.center).add(Rh)),this.expandByPoint(Ba.copy(e.center).sub(Rh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let ww=0;const Ri=new Zt,Fh=new gn,Oo=new X,gi=new ql,Ua=new ql,Mn=new X;class In extends Br{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ww++}),this.uuid=tr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new($T(e)?Q1:j1)(e,1):this.index=e,this}setIndirect(e,n=0){return this.indirect=e,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new ct().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Ri.makeRotationFromQuaternion(e),this.applyMatrix4(Ri),this}rotateX(e){return Ri.makeRotationX(e),this.applyMatrix4(Ri),this}rotateY(e){return Ri.makeRotationY(e),this.applyMatrix4(Ri),this}rotateZ(e){return Ri.makeRotationZ(e),this.applyMatrix4(Ri),this}translate(e,n,i){return Ri.makeTranslation(e,n,i),this.applyMatrix4(Ri),this}scale(e,n,i){return Ri.makeScale(e,n,i),this.applyMatrix4(Ri),this}lookAt(e){return Fh.lookAt(e),Fh.updateMatrix(),this.applyMatrix4(Fh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Oo).negate(),this.translate(Oo.x,Oo.y,Oo.z),this}setFromPoints(e){const n=this.getAttribute("position");if(n===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new _n(i,3))}else{const i=Math.min(e.length,n.count);for(let s=0;s<i;s++){const r=e[s];n.setXYZ(s,r.x,r.y,r.z||0)}e.length>n.count&&ot("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ql);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){At("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new X(-1/0,-1/0,-1/0),new X(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,s=n.length;i<s;i++){const r=n[i];gi.setFromBufferAttribute(r),this.morphTargetsRelative?(Mn.addVectors(this.boundingBox.min,gi.min),this.boundingBox.expandByPoint(Mn),Mn.addVectors(this.boundingBox.max,gi.max),this.boundingBox.expandByPoint(Mn)):(this.boundingBox.expandByPoint(gi.min),this.boundingBox.expandByPoint(gi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&At('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ff);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){At("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new X,1/0);return}if(e){const i=this.boundingSphere.center;if(gi.setFromBufferAttribute(e),n)for(let r=0,o=n.length;r<o;r++){const a=n[r];Ua.setFromBufferAttribute(a),this.morphTargetsRelative?(Mn.addVectors(gi.min,Ua.min),gi.expandByPoint(Mn),Mn.addVectors(gi.max,Ua.max),gi.expandByPoint(Mn)):(gi.expandByPoint(Ua.min),gi.expandByPoint(Ua.max))}gi.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Mn.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Mn));if(n)for(let r=0,o=n.length;r<o;r++){const a=n[r],l=this.morphTargetsRelative;for(let u=0,c=a.count;u<c;u++)Mn.fromBufferAttribute(a,u),l&&(Oo.fromBufferAttribute(e,u),Mn.add(Oo)),s=Math.max(s,i.distanceToSquared(Mn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&At('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){At("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,s=n.normal,r=n.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new Es(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));const a=[],l=[];for(let v=0;v<i.count;v++)a[v]=new X,l[v]=new X;const u=new X,c=new X,f=new X,h=new Ye,d=new Ye,m=new Ye,x=new X,_=new X;function p(v,A,R){u.fromBufferAttribute(i,v),c.fromBufferAttribute(i,A),f.fromBufferAttribute(i,R),h.fromBufferAttribute(r,v),d.fromBufferAttribute(r,A),m.fromBufferAttribute(r,R),c.sub(u),f.sub(u),d.sub(h),m.sub(h);const L=1/(d.x*m.y-m.x*d.y);isFinite(L)&&(x.copy(c).multiplyScalar(m.y).addScaledVector(f,-d.y).multiplyScalar(L),_.copy(f).multiplyScalar(d.x).addScaledVector(c,-m.x).multiplyScalar(L),a[v].add(x),a[A].add(x),a[R].add(x),l[v].add(_),l[A].add(_),l[R].add(_))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let v=0,A=b.length;v<A;++v){const R=b[v],L=R.start,M=R.count;for(let I=L,F=L+M;I<F;I+=3)p(e.getX(I+0),e.getX(I+1),e.getX(I+2))}const y=new X,g=new X,E=new X,T=new X;function C(v){E.fromBufferAttribute(s,v),T.copy(E);const A=a[v];y.copy(A),y.sub(E.multiplyScalar(E.dot(A))).normalize(),g.crossVectors(T,A);const L=g.dot(l[v])<0?-1:1;o.setXYZW(v,y.x,y.y,y.z,L)}for(let v=0,A=b.length;v<A;++v){const R=b[v],L=R.start,M=R.count;for(let I=L,F=L+M;I<F;I+=3)C(e.getX(I+0)),C(e.getX(I+1)),C(e.getX(I+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==n.count)i=new Es(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let h=0,d=i.count;h<d;h++)i.setXYZ(h,0,0,0);const s=new X,r=new X,o=new X,a=new X,l=new X,u=new X,c=new X,f=new X;if(e)for(let h=0,d=e.count;h<d;h+=3){const m=e.getX(h+0),x=e.getX(h+1),_=e.getX(h+2);s.fromBufferAttribute(n,m),r.fromBufferAttribute(n,x),o.fromBufferAttribute(n,_),c.subVectors(o,r),f.subVectors(s,r),c.cross(f),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,x),u.fromBufferAttribute(i,_),a.add(c),l.add(c),u.add(c),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(_,u.x,u.y,u.z)}else for(let h=0,d=n.count;h<d;h+=3)s.fromBufferAttribute(n,h+0),r.fromBufferAttribute(n,h+1),o.fromBufferAttribute(n,h+2),c.subVectors(o,r),f.subVectors(s,r),c.cross(f),i.setXYZ(h+0,c.x,c.y,c.z),i.setXYZ(h+1,c.x,c.y,c.z),i.setXYZ(h+2,c.x,c.y,c.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Mn.fromBufferAttribute(e,n),Mn.normalize(),e.setXYZ(n,Mn.x,Mn.y,Mn.z)}toNonIndexed(){function e(a,l){const u=a.array,c=a.itemSize,f=a.normalized,h=new u.constructor(l.length*c);let d=0,m=0;for(let x=0,_=l.length;x<_;x++){a.isInterleavedBufferAttribute?d=l[x]*a.data.stride+a.offset:d=l[x]*c;for(let p=0;p<c;p++)h[m++]=u[d++]}return new Es(h,c,f)}if(this.index===null)return ot("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new In,i=this.index.array,s=this.attributes;for(const a in s){const l=s[a],u=e(l,i);n.setAttribute(a,u)}const r=this.morphAttributes;for(const a in r){const l=[],u=r[a];for(let c=0,f=u.length;c<f;c++){const h=u[c],d=e(h,i);l.push(d)}n.morphAttributes[a]=l}n.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const u=o[a];n.addGroup(u.start,u.count,u.materialIndex)}return n}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const l in i){const u=i[l];e.data.attributes[l]=u.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const u=this.morphAttributes[l],c=[];for(let f=0,h=u.length;f<h;f++){const d=u[f];c.push(d.toJSON(e.data))}c.length>0&&(s[l]=c,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const u in s){const c=s[u];this.setAttribute(u,c.clone(n))}const r=e.morphAttributes;for(const u in r){const c=[],f=r[u];for(let h=0,d=f.length;h<d;h++)c.push(f[h].clone(n));this.morphAttributes[u]=c}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let u=0,c=o.length;u<c;u++){const f=o[u];this.addGroup(f.start,f.count,f.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Cw{constructor(e,n){this.isInterleavedBuffer=!0,this.array=e,this.stride=n,this.count=e!==void 0?e.length/n:0,this.usage=q1,this.updateRanges=[],this.version=0,this.uuid=tr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,n,i){e*=this.stride,i*=n.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=n.array[i+s];return this}set(e,n=0){return this.array.set(e,n),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=tr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const n=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(n,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=tr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));const n={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}}const qn=new X;class qc{constructor(e,n,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=n,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let n=0,i=this.data.count;n<i;n++)qn.fromBufferAttribute(this,n),qn.applyMatrix4(e),this.setXYZ(n,qn.x,qn.y,qn.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)qn.fromBufferAttribute(this,n),qn.applyNormalMatrix(e),this.setXYZ(n,qn.x,qn.y,qn.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)qn.fromBufferAttribute(this,n),qn.transformDirection(e),this.setXYZ(n,qn.x,qn.y,qn.z);return this}getComponent(e,n){let i=this.array[e*this.data.stride+this.offset+n];return this.normalized&&(i=qi(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=Ot(i,this.array)),this.data.array[e*this.data.stride+this.offset+n]=i,this}setX(e,n){return this.normalized&&(n=Ot(n,this.array)),this.data.array[e*this.data.stride+this.offset]=n,this}setY(e,n){return this.normalized&&(n=Ot(n,this.array)),this.data.array[e*this.data.stride+this.offset+1]=n,this}setZ(e,n){return this.normalized&&(n=Ot(n,this.array)),this.data.array[e*this.data.stride+this.offset+2]=n,this}setW(e,n){return this.normalized&&(n=Ot(n,this.array)),this.data.array[e*this.data.stride+this.offset+3]=n,this}getX(e){let n=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(n=qi(n,this.array)),n}getY(e){let n=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(n=qi(n,this.array)),n}getZ(e){let n=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(n=qi(n,this.array)),n}getW(e){let n=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(n=qi(n,this.array)),n}setXY(e,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(n=Ot(n,this.array),i=Ot(i,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this}setXYZ(e,n,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(n=Ot(n,this.array),i=Ot(i,this.array),s=Ot(s,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,n,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(n=Ot(n,this.array),i=Ot(i,this.array),s=Ot(s,this.array),r=Ot(r,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Xc("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const n=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)n.push(this.data.array[s+r])}return new Es(new this.array.constructor(n),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new qc(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Xc("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const n=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)n.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:n,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const Dh=new X,Rw=new X,Fw=new ct;class ps{constructor(e=new X(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,s){return this.normal.set(e,n,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const s=Dh.subVectors(i,n).cross(Rw.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n,i=!0){const s=e.delta(Dh),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const o=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:n.copy(e.start).addScaledVector(s,o)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||Fw.getNormalMatrix(e),s=this.coplanarPoint(Dh).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let Dw=0;class Ao extends Br{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Dw++}),this.uuid=tr(),this.name="",this.type="Material",this.blending=al,this.side=mo,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=R1,this.blendDst=F1,this.blendEquation=qo,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new St(0,0,0),this.blendAlpha=0,this.depthFunc=Rl,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=OT,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=dh,this.stencilZFail=dh,this.stencilZPass=dh,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){ot(`Material: parameter '${n}' has value of undefined.`);continue}const s=this[n];if(s===void 0){ot(`Material: '${n}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(n){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(e,n){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new St().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new ps().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=n[e.map]||null),e.matcap!==void 0&&(this.matcap=n[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=n[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=n[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=n[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Ye().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=n[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=n[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=n[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=n[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=n[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=n[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=n[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=n[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=n[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=n[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=n[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=n[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=n[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=n[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ye().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=n[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=n[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=n[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=n[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=n[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=n[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=n[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const s=n.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=n[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class ey extends Ao{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new St(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let ko;const Oa=new X,zo=new X,Vo=new X,Ho=new Ye,ka=new Ye,ty=new Zt,Tu=new X,za=new X,wu=new X,_g=new Ye,Ph=new Ye,vg=new Ye;class Pw extends gn{constructor(e=new ey){if(super(),this.isSprite=!0,this.type="Sprite",ko===void 0){ko=new In;const n=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Cw(n,5);ko.setIndex([0,1,2,0,2,3]),ko.setAttribute("position",new qc(i,3,0,!1)),ko.setAttribute("uv",new qc(i,2,3,!1))}this.geometry=ko,this.material=e,this.center=new Ye(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,n){e.camera===null&&At('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),zo.setFromMatrixScale(this.matrixWorld),ty.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Vo.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&zo.multiplyScalar(-Vo.z);const i=this.material.rotation;let s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));const o=this.center;Cu(Tu.set(-.5,-.5,0),Vo,o,zo,s,r),Cu(za.set(.5,-.5,0),Vo,o,zo,s,r),Cu(wu.set(.5,.5,0),Vo,o,zo,s,r),_g.set(0,0),Ph.set(1,0),vg.set(1,1);let a=e.ray.intersectTriangle(Tu,za,wu,!1,Oa);if(a===null&&(Cu(za.set(-.5,.5,0),Vo,o,zo,s,r),Ph.set(0,1),a=e.ray.intersectTriangle(Tu,wu,za,!1,Oa),a===null))return;const l=e.ray.origin.distanceTo(Oa);l<e.near||l>e.far||n.push({distance:l,point:Oa.clone(),uv:Ii.getInterpolation(Oa,Tu,za,wu,_g,Ph,vg,new Ye),face:null,object:this})}copy(e,n){return super.copy(e,n),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Cu(t,e,n,i,s,r){Ho.subVectors(t,n).addScalar(.5).multiply(i),s!==void 0?(ka.x=r*Ho.x-s*Ho.y,ka.y=s*Ho.x+r*Ho.y):ka.copy(Ho),t.copy(e),t.x+=ka.x,t.y+=ka.y,t.applyMatrix4(ty)}const Us=new X,Ih=new X,Ru=new X,Fu=new X;class Df{constructor(e=new X,n=new X(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Us)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=Us.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(Us.copy(this.origin).addScaledVector(this.direction,n),Us.distanceToSquared(e))}distanceSqToSegment(e,n,i,s){Ih.copy(e).add(n).multiplyScalar(.5),Ru.copy(n).sub(e).normalize(),Fu.copy(this.origin).sub(Ih);const r=e.distanceTo(n)*.5,o=-this.direction.dot(Ru),a=Fu.dot(this.direction),l=-Fu.dot(Ru),u=Fu.lengthSq(),c=Math.abs(1-o*o);let f,h,d,m;if(c>0)if(f=o*l-a,h=o*a-l,m=r*c,f>=0)if(h>=-m)if(h<=m){const x=1/c;f*=x,h*=x,d=f*(f+o*h+2*a)+h*(o*f+h+2*l)+u}else h=r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+u;else h=-r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+u;else h<=-m?(f=Math.max(0,-(-o*r+a)),h=f>0?-r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+u):h<=m?(f=0,h=Math.min(Math.max(-r,-l),r),d=h*(h+2*l)+u):(f=Math.max(0,-(o*r+a)),h=f>0?r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+u);else h=o>0?-r:r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+u;return i&&i.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Ih).addScaledVector(Ru,h),d}intersectSphere(e,n){if(e.radius<0)return null;Us.subVectors(e.center,this.origin);const i=Us.dot(this.direction),s=Us.dot(Us)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,n):this.at(a,n)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){const i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,s,r,o,a,l;const u=1/this.direction.x,c=1/this.direction.y,f=1/this.direction.z,h=this.origin;return u>=0?(i=(e.min.x-h.x)*u,s=(e.max.x-h.x)*u):(i=(e.max.x-h.x)*u,s=(e.min.x-h.x)*u),c>=0?(r=(e.min.y-h.y)*c,o=(e.max.y-h.y)*c):(r=(e.max.y-h.y)*c,o=(e.min.y-h.y)*c),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(e.min.z-h.z)*f,l=(e.max.z-h.z)*f):(a=(e.max.z-h.z)*f,l=(e.min.z-h.z)*f),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,n)}intersectsBox(e){return this.intersectBox(e,Us)!==null}intersectTriangle(e,n,i,s,r){const o=this.origin,a=this.direction,l=a.x,u=a.y,c=a.z,f=e.x-o.x,h=e.y-o.y,d=e.z-o.z,m=n.x-o.x,x=n.y-o.y,_=n.z-o.z,p=i.x-o.x,b=i.y-o.y,y=i.z-o.z,g=Math.abs(l),E=Math.abs(u),T=Math.abs(c);let C,v,A,R,L,M,I,F,B,O,z,H;if(g>=E&&g>=T?(A=l,M=f,B=m,H=p,l>=0?(C=u,v=c,R=h,L=d,I=x,F=_,O=b,z=y):(C=c,v=u,R=d,L=h,I=_,F=x,O=y,z=b)):E>=T?(A=u,M=h,B=x,H=b,u>=0?(C=c,v=l,R=d,L=f,I=_,F=m,O=y,z=p):(C=l,v=c,R=f,L=d,I=m,F=_,O=p,z=y)):(A=c,M=d,B=_,H=y,c>=0?(C=l,v=u,R=f,L=h,I=m,F=x,O=p,z=b):(C=u,v=l,R=h,L=f,I=x,F=m,O=b,z=p)),A===0)return null;const Y=C/A,Q=v/A,se=1/A,q=R-Y*M,he=L-Q*M,et=I-Y*B,We=F-Q*B,de=O-Y*H,K=z-Q*H,j=de*We-K*et,_e=q*K-he*de,Fe=et*he-We*q;if(s){if(j<0||_e<0||Fe<0)return null}else if((j<0||_e<0||Fe<0)&&(j>0||_e>0||Fe>0))return null;const Ce=j+_e+Fe;if(Ce===0)return null;const Ze=se*(j*M+_e*B+Fe*H);return(Ce>0?Ze<0:Ze>0)?null:this.at(Ze/Ce,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ll extends Ao{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new St(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Nr,this.combine=D1,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const xg=new Zt,Xr=new Df,Du=new Ff,yg=new X,Pu=new X,Iu=new X,Lu=new X,Lh=new X,Nu=new X,Eg=new X,Bu=new X;class Jt extends gn{constructor(e=new In,n=new Ll){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,n){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;n.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Nu.set(0,0,0);for(let l=0,u=r.length;l<u;l++){const c=a[l],f=r[l];c!==0&&(Lh.fromBufferAttribute(f,e),o?Nu.addScaledVector(Lh,c):Nu.addScaledVector(Lh.sub(n),c))}n.add(Nu)}return n}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,n){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Du.copy(i.boundingSphere),Du.applyMatrix4(r),Xr.copy(e.ray).recast(e.near),!(Du.containsPoint(Xr.origin)===!1&&(Xr.intersectSphere(Du,yg)===null||Xr.origin.distanceToSquared(yg)>(e.far-e.near)**2))&&(xg.copy(r).invert(),Xr.copy(e.ray).applyMatrix4(xg),!(i.boundingBox!==null&&Xr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,Xr)))}_computeIntersections(e,n,i){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,u=r.attributes.uv,c=r.attributes.uv1,f=r.attributes.normal,h=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,x=h.length;m<x;m++){const _=h[m],p=o[_.materialIndex],b=Math.max(_.start,d.start),y=Math.min(a.count,Math.min(_.start+_.count,d.start+d.count));for(let g=b,E=y;g<E;g+=3){const T=a.getX(g),C=a.getX(g+1),v=a.getX(g+2);s=Uu(this,p,e,i,u,c,f,T,C,v),s&&(s.faceIndex=Math.floor(g/3),s.face.materialIndex=_.materialIndex,n.push(s))}}else{const m=Math.max(0,d.start),x=Math.min(a.count,d.start+d.count);for(let _=m,p=x;_<p;_+=3){const b=a.getX(_),y=a.getX(_+1),g=a.getX(_+2);s=Uu(this,o,e,i,u,c,f,b,y,g),s&&(s.faceIndex=Math.floor(_/3),n.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,x=h.length;m<x;m++){const _=h[m],p=o[_.materialIndex],b=Math.max(_.start,d.start),y=Math.min(l.count,Math.min(_.start+_.count,d.start+d.count));for(let g=b,E=y;g<E;g+=3){const T=g,C=g+1,v=g+2;s=Uu(this,p,e,i,u,c,f,T,C,v),s&&(s.faceIndex=Math.floor(g/3),s.face.materialIndex=_.materialIndex,n.push(s))}}else{const m=Math.max(0,d.start),x=Math.min(l.count,d.start+d.count);for(let _=m,p=x;_<p;_+=3){const b=_,y=_+1,g=_+2;s=Uu(this,o,e,i,u,c,f,b,y,g),s&&(s.faceIndex=Math.floor(_/3),n.push(s))}}}}function Iw(t,e,n,i,s,r,o,a){let l;if(e.side===pi?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===mo,a),l===null)return null;Bu.copy(a),Bu.applyMatrix4(t.matrixWorld);const u=n.ray.origin.distanceTo(Bu);return u<n.near||u>n.far?null:{distance:u,point:Bu.clone(),object:t}}function Uu(t,e,n,i,s,r,o,a,l,u){t.getVertexPosition(a,Pu),t.getVertexPosition(l,Iu),t.getVertexPosition(u,Lu);const c=Iw(t,e,n,i,Pu,Iu,Lu,Eg);if(c){const f=new X;Ii.getBarycoord(Eg,Pu,Iu,Lu,f),s&&(c.uv=Ii.getInterpolatedAttribute(s,a,l,u,f,new Ye)),r&&(c.uv1=Ii.getInterpolatedAttribute(r,a,l,u,f,new Ye)),o&&(c.normal=Ii.getInterpolatedAttribute(o,a,l,u,f,new X),c.normal.dot(i.direction)>0&&c.normal.multiplyScalar(-1));const h={a,b:l,c:u,normal:new X,materialIndex:0};Ii.getNormal(Pu,Iu,Lu,h.normal),c.face=h,c.barycoord=f}return c}class Lw extends Wn{constructor(e=null,n=1,i=1,s,r,o,a,l,u=Dn,c=Dn,f,h){super(null,o,a,l,u,c,s,r,f,h),this.isDataTexture=!0,this.image={data:e,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const qr=new Ff,Nw=new Ye(.5,.5),Ou=new X;class Cm{constructor(e=new ps,n=new ps,i=new ps,s=new ps,r=new ps,o=new ps){this.planes=[e,n,i,s,r,o]}set(e,n,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(n),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=vs,i=!1){const s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],u=r[3],c=r[4],f=r[5],h=r[6],d=r[7],m=r[8],x=r[9],_=r[10],p=r[11],b=r[12],y=r[13],g=r[14],E=r[15];if(s[0].setComponents(u-o,d-c,p-m,E-b).normalize(),s[1].setComponents(u+o,d+c,p+m,E+b).normalize(),s[2].setComponents(u+a,d+f,p+x,E+y).normalize(),s[3].setComponents(u-a,d-f,p-x,E-y).normalize(),i)s[4].setComponents(l,h,_,g).normalize(),s[5].setComponents(u-l,d-h,p-_,E-g).normalize();else if(s[4].setComponents(u-l,d-h,p-_,E-g).normalize(),n===vs)s[5].setComponents(u+l,d+h,p+_,E+g).normalize();else if(n===Pl)s[5].setComponents(l,h,_,g).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),qr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),qr.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(qr)}intersectsSprite(e){qr.center.set(0,0,0);const n=Nw.distanceTo(e.center);return qr.radius=.7071067811865476+n,qr.applyMatrix4(e.matrixWorld),this.intersectsSphere(qr)}intersectsSphere(e){const n=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(n[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const s=n[i];if(Ou.x=s.normal.x>0?e.max.x:e.min.x,Ou.y=s.normal.y>0?e.max.y:e.min.y,Ou.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ou)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Rm extends Ao{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new St(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Yc=new X,Kc=new X,Sg=new Zt,Va=new Df,ku=new Ff,Nh=new X,bg=new X;class ny extends gn{constructor(e=new In,n=new Rm){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const n=e.attributes.position,i=[0];for(let s=1,r=n.count;s<r;s++)Yc.fromBufferAttribute(n,s-1),Kc.fromBufferAttribute(n,s),i[s]=i[s-1],i[s]+=Yc.distanceTo(Kc);e.setAttribute("lineDistance",new _n(i,1))}else ot("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,n){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ku.copy(i.boundingSphere),ku.applyMatrix4(s),ku.radius+=r,e.ray.intersectsSphere(ku)===!1)return;Sg.copy(s).invert(),Va.copy(e.ray).applyMatrix4(Sg);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,u=this.isLineSegments?2:1,c=i.index,h=i.attributes.position;if(c!==null){const d=Math.max(0,o.start),m=Math.min(c.count,o.start+o.count);for(let x=d,_=m-1;x<_;x+=u){const p=c.getX(x),b=c.getX(x+1),y=zu(this,e,Va,l,p,b,x);y&&n.push(y)}if(this.isLineLoop){const x=c.getX(m-1),_=c.getX(d),p=zu(this,e,Va,l,x,_,m-1);p&&n.push(p)}}else{const d=Math.max(0,o.start),m=Math.min(h.count,o.start+o.count);for(let x=d,_=m-1;x<_;x+=u){const p=zu(this,e,Va,l,x,x+1,x);p&&n.push(p)}if(this.isLineLoop){const x=zu(this,e,Va,l,m-1,d,m-1);x&&n.push(x)}}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function zu(t,e,n,i,s,r,o){const a=t.geometry.attributes.position;if(Yc.fromBufferAttribute(a,s),Kc.fromBufferAttribute(a,r),n.distanceSqToSegment(Yc,Kc,Nh,bg)>i)return;Nh.applyMatrix4(t.matrixWorld);const u=e.ray.origin.distanceTo(Nh);if(!(u<e.near||u>e.far))return{distance:u,point:bg.clone().applyMatrix4(t.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:t}}class iy extends Wn{constructor(e=[],n=go,i,s,r,o,a,l,u,c){super(e,n,i,s,r,o,a,l,u,c),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Bw extends Wn{constructor(e,n,i,s,r,o,a,l,u){super(e,n,i,s,r,o,a,l,u),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Nl extends Wn{constructor(e,n,i=Ts,s,r,o,a=Dn,l=Dn,u,c=or,f=1){if(c!==or&&c!==to)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:n,depth:f};super(h,s,r,o,a,l,c,i,u),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Tm(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return n.compareFunction=this.compareFunction,n}}class Uw extends Nl{constructor(e,n=Ts,i=go,s,r,o=Dn,a=Dn,l,u=or){const c={width:e,height:e,depth:1},f=[c,c,c,c,c,c];super(e,e,n,i,s,r,o,a,l,u),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class sy extends Wn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Zi extends In{constructor(e=1,n=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],u=[],c=[],f=[];let h=0,d=0;m("z","y","x",-1,-1,i,n,e,o,r,0),m("z","y","x",1,-1,i,n,-e,o,r,1),m("x","z","y",1,1,e,i,n,s,o,2),m("x","z","y",1,-1,e,i,-n,s,o,3),m("x","y","z",1,-1,e,n,i,s,r,4),m("x","y","z",-1,-1,e,n,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new _n(u,3)),this.setAttribute("normal",new _n(c,3)),this.setAttribute("uv",new _n(f,2));function m(x,_,p,b,y,g,E,T,C,v,A){const R=g/C,L=E/v,M=g/2,I=E/2,F=T/2,B=C+1,O=v+1;let z=0,H=0;const Y=new X;for(let Q=0;Q<O;Q++){const se=Q*L-I;for(let q=0;q<B;q++){const he=q*R-M;Y[x]=he*b,Y[_]=se*y,Y[p]=F,u.push(Y.x,Y.y,Y.z),Y[x]=0,Y[_]=0,Y[p]=T>0?1:-1,c.push(Y.x,Y.y,Y.z),f.push(q/C),f.push(1-Q/v),z+=1}}for(let Q=0;Q<v;Q++)for(let se=0;se<C;se++){const q=h+se+B*Q,he=h+se+B*(Q+1),et=h+(se+1)+B*(Q+1),We=h+(se+1)+B*Q;l.push(q,he,We),l.push(he,et,We),H+=6}a.addGroup(d,H,A),d+=H,h+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zi(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class pa extends In{constructor(e=1,n=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:n,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const u=this;s=Math.floor(s),r=Math.floor(r);const c=[],f=[],h=[],d=[];let m=0;const x=[],_=i/2;let p=0;b(),o===!1&&(e>0&&y(!0),n>0&&y(!1)),this.setIndex(c),this.setAttribute("position",new _n(f,3)),this.setAttribute("normal",new _n(h,3)),this.setAttribute("uv",new _n(d,2));function b(){const g=new X,E=new X;let T=0;const C=(n-e)/i;for(let v=0;v<=r;v++){const A=[],R=v/r,L=R*(n-e)+e;for(let M=0;M<=s;M++){const I=M/s,F=I*l+a,B=Math.sin(F),O=Math.cos(F);E.x=L*B,E.y=-R*i+_,E.z=L*O,f.push(E.x,E.y,E.z),g.set(B,C,O).normalize(),h.push(g.x,g.y,g.z),d.push(I,1-R),A.push(m++)}x.push(A)}for(let v=0;v<s;v++)for(let A=0;A<r;A++){const R=x[A][v],L=x[A+1][v],M=x[A+1][v+1],I=x[A][v+1];(e>0||A!==0)&&(c.push(R,L,I),T+=3),(n>0||A!==r-1)&&(c.push(L,M,I),T+=3)}u.addGroup(p,T,0),p+=T}function y(g){const E=m,T=new Ye,C=new X;let v=0;const A=g===!0?e:n,R=g===!0?1:-1;for(let M=1;M<=s;M++)f.push(0,_*R,0),h.push(0,R,0),d.push(.5,.5),m++;const L=m;for(let M=0;M<=s;M++){const F=M/s*l+a,B=Math.cos(F),O=Math.sin(F);C.x=A*O,C.y=_*R,C.z=A*B,f.push(C.x,C.y,C.z),h.push(0,R,0),T.x=B*.5+.5,T.y=O*.5*R+.5,d.push(T.x,T.y),m++}for(let M=0;M<s;M++){const I=E+M,F=L+M;g===!0?c.push(F,F+1,I):c.push(F+1,F,I),v+=3}u.addGroup(p,v,g===!0?1:2),p+=v}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new pa(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Bl extends pa{constructor(e=1,n=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,n,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:n,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new Bl(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Fm extends In{constructor(e=[],n=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:n,radius:i,detail:s};const r=[],o=[];a(s),u(i),c(),this.setAttribute("position",new _n(r,3)),this.setAttribute("normal",new _n(r.slice(),3)),this.setAttribute("uv",new _n(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(b){const y=new X,g=new X,E=new X;for(let T=0;T<n.length;T+=3)d(n[T+0],y),d(n[T+1],g),d(n[T+2],E),l(y,g,E,b)}function l(b,y,g,E){const T=E+1,C=[];for(let v=0;v<=T;v++){C[v]=[];const A=b.clone().lerp(g,v/T),R=y.clone().lerp(g,v/T),L=T-v;for(let M=0;M<=L;M++)M===0&&v===T?C[v][M]=A:C[v][M]=A.clone().lerp(R,M/L)}for(let v=0;v<T;v++)for(let A=0;A<2*(T-v)-1;A++){const R=Math.floor(A/2);A%2===0?(h(C[v][R+1]),h(C[v+1][R]),h(C[v][R])):(h(C[v][R+1]),h(C[v+1][R+1]),h(C[v+1][R]))}}function u(b){const y=new X;for(let g=0;g<r.length;g+=3)y.x=r[g+0],y.y=r[g+1],y.z=r[g+2],y.normalize().multiplyScalar(b),r[g+0]=y.x,r[g+1]=y.y,r[g+2]=y.z}function c(){const b=new X;for(let y=0;y<r.length;y+=3){b.x=r[y+0],b.y=r[y+1],b.z=r[y+2];const g=_(b)/2/Math.PI+.5,E=p(b)/Math.PI+.5;o.push(g,1-E)}m(),f()}function f(){for(let b=0;b<o.length;b+=6){const y=o[b+0],g=o[b+2],E=o[b+4],T=Math.max(y,g,E),C=Math.min(y,g,E);T>.9&&C<.1&&(y<.2&&(o[b+0]+=1),g<.2&&(o[b+2]+=1),E<.2&&(o[b+4]+=1))}}function h(b){r.push(b.x,b.y,b.z)}function d(b,y){const g=b*3;y.x=e[g+0],y.y=e[g+1],y.z=e[g+2]}function m(){const b=new X,y=new X,g=new X,E=new X,T=new Ye,C=new Ye,v=new Ye;for(let A=0,R=0;A<r.length;A+=9,R+=6){b.set(r[A+0],r[A+1],r[A+2]),y.set(r[A+3],r[A+4],r[A+5]),g.set(r[A+6],r[A+7],r[A+8]),T.set(o[R+0],o[R+1]),C.set(o[R+2],o[R+3]),v.set(o[R+4],o[R+5]),E.copy(b).add(y).add(g).divideScalar(3);const L=_(E);x(T,R+0,b,L),x(C,R+2,y,L),x(v,R+4,g,L)}}function x(b,y,g,E){E<0&&b.x===1&&(o[y]=b.x-1),g.x===0&&g.z===0&&(o[y]=E/2/Math.PI+.5)}function _(b){return Math.atan2(b.z,-b.x)}function p(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fm(e.vertices,e.indices,e.radius,e.detail)}}class Pf extends Fm{constructor(e=1,n=0){const i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,n),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:n}}static fromJSON(e){return new Pf(e.radius,e.detail)}}class If extends In{constructor(e=1,n=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:s};const r=e/2,o=n/2,a=Math.floor(i),l=Math.floor(s),u=a+1,c=l+1,f=e/a,h=n/l,d=[],m=[],x=[],_=[];for(let p=0;p<c;p++){const b=p*h-o;for(let y=0;y<u;y++){const g=y*f-r;m.push(g,-b,0),x.push(0,0,1),_.push(y/a),_.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<a;b++){const y=b+u*p,g=b+u*(p+1),E=b+1+u*(p+1),T=b+1+u*p;d.push(y,g,T),d.push(g,E,T)}this.setIndex(d),this.setAttribute("position",new _n(m,3)),this.setAttribute("normal",new _n(x,3)),this.setAttribute("uv",new _n(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new If(e.width,e.height,e.widthSegments,e.heightSegments)}}class Dm extends In{constructor(e=1,n=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:n,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let u=0;const c=[],f=new X,h=new X,d=[],m=[],x=[],_=[];for(let p=0;p<=i;p++){const b=[],y=p/i,g=o+y*a,E=e*Math.cos(g),T=Math.sqrt(e*e-E*E);let C=0;p===0&&o===0?C=.5/n:p===i&&l===Math.PI&&(C=-.5/n);for(let v=0;v<=n;v++){const A=v/n,R=s+A*r;f.x=-T*Math.cos(R),f.y=E,f.z=T*Math.sin(R),m.push(f.x,f.y,f.z),h.copy(f).normalize(),x.push(h.x,h.y,h.z),_.push(A+C,1-y),b.push(u++)}c.push(b)}for(let p=0;p<i;p++)for(let b=0;b<n;b++){const y=c[p][b+1],g=c[p][b],E=c[p+1][b],T=c[p+1][b+1];(p!==0||o>0)&&d.push(y,g,T),(p!==i-1||l<Math.PI)&&d.push(g,E,T)}this.setIndex(d),this.setAttribute("position",new _n(m,3)),this.setAttribute("normal",new _n(x,3)),this.setAttribute("uv",new _n(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Dm(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function ma(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const s=t[n][i];if(Mg(s))s.isRenderTargetTexture?(ot("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=s.clone();else if(Array.isArray(s))if(Mg(s[0])){const r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[n][i]=r}else e[n][i]=s.slice();else e[n][i]=s}}return e}function Kn(t){const e={};for(let n=0;n<t.length;n++){const i=ma(t[n]);for(const s in i)e[s]=i[s]}return e}function Mg(t){return t&&(t.isColor||t.isMatrix3||t.isMatrix4||t.isVector2||t.isVector3||t.isVector4||t.isTexture||t.isQuaternion)}function Ow(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function ry(t){const e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:bt.workingColorSpace}const kw={clone:ma,merge:Kn};var zw=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Vw=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Cs extends Ao{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zw,this.fragmentShader=Vw,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ma(e.uniforms),this.uniformsGroups=Ow(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?n.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?n.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?n.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?n.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?n.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?n.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?n.uniforms[s]={type:"m4",value:o.toArray()}:n.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}fromJSON(e,n){if(super.fromJSON(e,n),e.uniforms!==void 0)for(const i in e.uniforms){const s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=n[s.value]||null;break;case"c":this.uniforms[i].value=new St().setHex(s.value);break;case"v2":this.uniforms[i].value=new Ye().fromArray(s.value);break;case"v3":this.uniforms[i].value=new X().fromArray(s.value);break;case"v4":this.uniforms[i].value=new sn().fromArray(s.value);break;case"m3":this.uniforms[i].value=new ct().fromArray(s.value);break;case"m4":this.uniforms[i].value=new Zt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Hw extends Cs{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Ja extends Ao{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new St(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new St(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=lp,this.normalScale=new Ye(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Nr,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Gw extends Ao{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=BT,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Ww extends Ao{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class oy extends gn{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new St(e),this.intensity=n}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,n}}class $w extends oy{constructor(e,n,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(gn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new St(n)}copy(e,n){return super.copy(e,n),this.groundColor.copy(e.groundColor),this}toJSON(e){const n=super.toJSON(e);return n.object.groundColor=this.groundColor.getHex(),n}}const Bh=new Zt,Ag=new X,Tg=new X;class Xw{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ye(512,512),this.mapType=xi,this.map=null,this.mapPass=null,this.matrix=new Zt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Cm,this._frameExtents=new Ye(1,1),this._viewportCount=1,this._viewports=[new sn(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const n=this.camera;Ag.setFromMatrixPosition(e.matrixWorld),n.position.copy(Ag),Tg.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(Tg),n.updateMatrixWorld(),this._updateMatrix(n,this.matrix,this._frustum)}_updateMatrix(e,n,i,s){Bh.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix(Bh,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,u=s?s.y/r.y:0;e.coordinateSystem===Pl||e.reversedDepth?n.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+u,0,0,1,0,0,0,0,1):n.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+u,0,0,.5,.5,0,0,0,1),n.multiply(Bh)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Vu=new X,Hu=new Lr,os=new X;class ay extends gn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Zt,this.projectionMatrix=new Zt,this.projectionMatrixInverse=new Zt,this.coordinateSystem=vs,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Vu,Hu,os),os.x===1&&os.y===1&&os.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Vu,Hu,os.set(1,1,1)).invert()}updateWorldMatrix(e,n,i=!1){super.updateWorldMatrix(e,n,i),this.matrixWorld.decompose(Vu,Hu,os),os.x===1&&os.y===1&&os.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Vu,Hu,os.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const gr=new X,wg=new Ye,Cg=new Ye;class Wi extends ay{constructor(e=50,n=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=Il*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ll*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Il*2*Math.atan(Math.tan(ll*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){gr.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(gr.x,gr.y).multiplyScalar(-e/gr.z),gr.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(gr.x,gr.y).multiplyScalar(-e/gr.z)}getViewSize(e,n){return this.getViewBounds(e,wg,Cg),n.subVectors(Cg,wg)}setViewOffset(e,n,i,s,r,o){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(ll*.5*this.fov)/this.zoom,i=2*n,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,u=o.fullHeight;r+=o.offsetX*s/l,n-=o.offsetY*i/u,s*=o.width/l,i*=o.height/u}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,n,n-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}class Lf extends ay{constructor(e=-1,n=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+n,l=s-n;if(this.view!==null&&this.view.enabled){const u=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=u*this.view.offsetX,o=r+u*this.view.width,a-=c*this.view.offsetY,l=a-c*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}class qw extends Xw{constructor(){super(new Lf(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Yw extends oy{constructor(e,n){super(e,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(gn.DEFAULT_UP),this.updateMatrix(),this.target=new gn,this.shadow=new qw}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const n=super.toJSON(e);return n.object.shadow=this.shadow.toJSON(),n.object.target=this.target.uuid,n}}const Go=-90,Wo=1;class Kw extends gn{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Wi(Go,Wo,e,n);s.layers=this.layers,this.add(s);const r=new Wi(Go,Wo,e,n);r.layers=this.layers,this.add(r);const o=new Wi(Go,Wo,e,n);o.layers=this.layers,this.add(o);const a=new Wi(Go,Wo,e,n);a.layers=this.layers,this.add(a);const l=new Wi(Go,Wo,e,n);l.layers=this.layers,this.add(l);const u=new Wi(Go,Wo,e,n);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[i,s,r,o,a,l]=n;for(const u of n)this.remove(u);if(e===vs)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Pl)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const u of n)this.add(u),u.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,u,c]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;const x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let _=!1;e.isWebGLRenderer===!0?_=e.state.buffers.depth.getReversed():_=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,r),e.setRenderTarget(i,1,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,o),e.setRenderTarget(i,2,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,a),e.setRenderTarget(i,3,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,l),e.setRenderTarget(i,4,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,u),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,c),e.setRenderTarget(f,h,d),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}}class Zw extends Wi{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Rg=new Zt;class Jw{constructor(e,n,i=0,s=1/0){this.ray=new Df(e,n),this.near=i,this.far=s,this.camera=null,this.layers=new wm,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,n){this.ray.set(e,n)}setFromCamera(e,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,n.projectionMatrix.elements[14]).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):At("Raycaster: Unsupported camera type: "+n.type)}setFromXRController(e){return Rg.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Rg),this}intersectObject(e,n=!0,i=[]){return up(e,this,i,n),i.sort(Fg),i}intersectObjects(e,n=!0,i=[]){for(let s=0,r=e.length;s<r;s++)up(e[s],this,i,n);return i.sort(Fg),i}}function Fg(t,e){return t.distance-e.distance}function up(t,e,n,i){let s=!0;if(t.layers.test(e.layers)&&t.raycast(e,n)===!1&&(s=!1),s===!0&&i===!0){const r=t.children;for(let o=0,a=r.length;o<a;o++)up(r[o],e,n,!0)}}class Dg{constructor(e=1,n=0,i=0){this.radius=e,this.phi=n,this.theta=i}set(e,n,i){return this.radius=e,this.phi=n,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=vt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,n,i){return this.radius=Math.sqrt(e*e+n*n+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(vt(n/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const Um=class Um{constructor(e,n,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,n,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,n=0){for(let i=0;i<4;i++)this.elements[i]=e[i+n];return this}set(e,n,i,s){const r=this.elements;return r[0]=e,r[2]=n,r[1]=i,r[3]=s,this}};Um.prototype.isMatrix2=!0;let Pg=Um;class jw extends Br{constructor(e,n=null){super(),this.object=e,this.domElement=n,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function Ig(t,e,n,i){const s=Qw(i);switch(n){case W1:return t*e;case X1:return t*e/s.components*s.byteLength;case ym:return t*e/s.components*s.byteLength;case _o:return t*e*2/s.components*s.byteLength;case Em:return t*e*2/s.components*s.byteLength;case $1:return t*e*3/s.components*s.byteLength;case Ki:return t*e*4/s.components*s.byteLength;case Sm:return t*e*4/s.components*s.byteLength;case ec:case tc:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case nc:case ic:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Id:case Nd:return Math.max(t,16)*Math.max(e,8)/4;case Pd:case Ld:return Math.max(t,8)*Math.max(e,8)/2;case Bd:case Ud:case kd:case zd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Od:case Vc:case Vd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Hd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Gd:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case Wd:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case $d:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case Xd:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case qd:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case Yd:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case Kd:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case Zd:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case Jd:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case jd:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case Qd:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case ep:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case tp:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case np:case ip:case sp:return Math.ceil(t/4)*Math.ceil(e/4)*16;case rp:case op:return Math.ceil(t/4)*Math.ceil(e/4)*8;case Hc:case ap:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function Qw(t){switch(t){case xi:case z1:return{byteLength:1,components:1};case Fl:case V1:case ws:return{byteLength:2,components:1};case vm:case xm:return{byteLength:2,components:4};case Ts:case _m:case _s:return{byteLength:4,components:1};case H1:case G1:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${t}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:gm}}));typeof window<"u"&&(window.__THREE__?ot("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=gm);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function ly(){let t=null,e=!1,n=null,i=null;function s(r,o){i=t.requestAnimationFrame(s),n(r,o)}return{start:function(){e!==!0&&n!==null&&t!==null&&(i=t.requestAnimationFrame(s),e=!0)},stop:function(){t!==null&&t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){n=r},setContext:function(r){t=r}}}function e3(t){const e=new WeakMap;function n(a,l){const u=a.array,c=a.usage,f=u.byteLength,h=t.createBuffer();t.bindBuffer(l,h),t.bufferData(l,u,c),a.onUploadCallback();let d;if(u instanceof Float32Array)d=t.FLOAT;else if(typeof Float16Array<"u"&&u instanceof Float16Array)d=t.HALF_FLOAT;else if(u instanceof Uint16Array)a.isFloat16BufferAttribute?d=t.HALF_FLOAT:d=t.UNSIGNED_SHORT;else if(u instanceof Int16Array)d=t.SHORT;else if(u instanceof Uint32Array)d=t.UNSIGNED_INT;else if(u instanceof Int32Array)d=t.INT;else if(u instanceof Int8Array)d=t.BYTE;else if(u instanceof Uint8Array)d=t.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)d=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:h,type:d,bytesPerElement:u.BYTES_PER_ELEMENT,version:a.version,size:f}}function i(a,l,u){const c=l.array,f=l.updateRanges;if(t.bindBuffer(u,a),f.length===0)t.bufferSubData(u,0,c);else{f.sort((d,m)=>d.start-m.start);let h=0;for(let d=1;d<f.length;d++){const m=f[h],x=f[d];x.start<=m.start+m.count+1?m.count=Math.max(m.count,x.start+x.count-m.start):(++h,f[h]=x)}f.length=h+1;for(let d=0,m=f.length;d<m;d++){const x=f[d];t.bufferSubData(u,x.start*c.BYTES_PER_ELEMENT,c,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(t.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const c=e.get(a);(!c||c.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const u=e.get(a);if(u===void 0)e.set(a,n(a,l));else if(u.version<a.version){if(u.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(u.buffer,a,l),u.version=a.version}}return{get:s,remove:r,update:o}}var t3=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,n3=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,i3=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,s3=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,r3=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,o3=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,a3=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,l3=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,u3=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,c3=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,f3=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,h3=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,d3=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,p3=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,m3=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,g3=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,_3=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,v3=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,x3=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,y3=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,E3=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,S3=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,b3=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,M3=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,A3=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,T3=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,w3=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,C3=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,R3=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,F3=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,D3="gl_FragColor = linearToOutputTexel( gl_FragColor );",P3=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,I3=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,L3=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,N3=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,B3=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,U3=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,O3=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,k3=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,z3=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,V3=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,H3=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,G3=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,W3=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,$3=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,X3=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,q3=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Y3=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,K3=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Z3=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,J3=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,j3=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Q3=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,eC=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,tC=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,nC=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,iC=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,sC=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,rC=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,oC=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,aC=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,lC=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,uC=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,cC=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,fC=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hC=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,dC=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,pC=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,mC=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,gC=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,_C=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,vC=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,xC=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,yC=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,EC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,SC=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,bC=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,MC=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,AC=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,TC=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,wC=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,CC=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,RC=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,FC=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,DC=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,PC=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,IC=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,LC=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,NC=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,BC=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,UC=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,OC=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,kC=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,zC=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,VC=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,HC=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,GC=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,WC=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,$C=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,XC=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,qC=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,YC=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,KC=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,ZC=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,JC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,jC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,QC=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,e5=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const t5=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,n5=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,i5=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,s5=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,r5=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,o5=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,a5=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,l5=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,u5=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,c5=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,f5=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,h5=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,d5=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,p5=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,m5=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,g5=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_5=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,v5=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,x5=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,y5=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,E5=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,S5=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,b5=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,M5=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,A5=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,T5=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,w5=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,C5=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,R5=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,F5=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,D5=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,P5=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,I5=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,L5=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,gt={alphahash_fragment:t3,alphahash_pars_fragment:n3,alphamap_fragment:i3,alphamap_pars_fragment:s3,alphatest_fragment:r3,alphatest_pars_fragment:o3,aomap_fragment:a3,aomap_pars_fragment:l3,batching_pars_vertex:u3,batching_vertex:c3,begin_vertex:f3,beginnormal_vertex:h3,bsdfs:d3,iridescence_fragment:p3,bumpmap_pars_fragment:m3,clipping_planes_fragment:g3,clipping_planes_pars_fragment:_3,clipping_planes_pars_vertex:v3,clipping_planes_vertex:x3,color_fragment:y3,color_pars_fragment:E3,color_pars_vertex:S3,color_vertex:b3,common:M3,cube_uv_reflection_fragment:A3,defaultnormal_vertex:T3,displacementmap_pars_vertex:w3,displacementmap_vertex:C3,emissivemap_fragment:R3,emissivemap_pars_fragment:F3,colorspace_fragment:D3,colorspace_pars_fragment:P3,envmap_fragment:I3,envmap_common_pars_fragment:L3,envmap_pars_fragment:N3,envmap_pars_vertex:B3,envmap_physical_pars_fragment:q3,envmap_vertex:U3,fog_vertex:O3,fog_pars_vertex:k3,fog_fragment:z3,fog_pars_fragment:V3,gradientmap_pars_fragment:H3,lightmap_pars_fragment:G3,lights_lambert_fragment:W3,lights_lambert_pars_fragment:$3,lights_pars_begin:X3,lights_toon_fragment:Y3,lights_toon_pars_fragment:K3,lights_phong_fragment:Z3,lights_phong_pars_fragment:J3,lights_physical_fragment:j3,lights_physical_pars_fragment:Q3,lights_fragment_begin:eC,lights_fragment_maps:tC,lights_fragment_end:nC,lightprobes_pars_fragment:iC,logdepthbuf_fragment:sC,logdepthbuf_pars_fragment:rC,logdepthbuf_pars_vertex:oC,logdepthbuf_vertex:aC,map_fragment:lC,map_pars_fragment:uC,map_particle_fragment:cC,map_particle_pars_fragment:fC,metalnessmap_fragment:hC,metalnessmap_pars_fragment:dC,morphinstance_vertex:pC,morphcolor_vertex:mC,morphnormal_vertex:gC,morphtarget_pars_vertex:_C,morphtarget_vertex:vC,normal_fragment_begin:xC,normal_fragment_maps:yC,normal_pars_fragment:EC,normal_pars_vertex:SC,normal_vertex:bC,normalmap_pars_fragment:MC,clearcoat_normal_fragment_begin:AC,clearcoat_normal_fragment_maps:TC,clearcoat_pars_fragment:wC,iridescence_pars_fragment:CC,opaque_fragment:RC,packing:FC,premultiplied_alpha_fragment:DC,project_vertex:PC,dithering_fragment:IC,dithering_pars_fragment:LC,roughnessmap_fragment:NC,roughnessmap_pars_fragment:BC,shadowmap_pars_fragment:UC,shadowmap_pars_vertex:OC,shadowmap_vertex:kC,shadowmask_pars_fragment:zC,skinbase_vertex:VC,skinning_pars_vertex:HC,skinning_vertex:GC,skinnormal_vertex:WC,specularmap_fragment:$C,specularmap_pars_fragment:XC,tonemapping_fragment:qC,tonemapping_pars_fragment:YC,transmission_fragment:KC,transmission_pars_fragment:ZC,uv_pars_fragment:JC,uv_pars_vertex:jC,uv_vertex:QC,worldpos_vertex:e5,background_vert:t5,background_frag:n5,backgroundCube_vert:i5,backgroundCube_frag:s5,cube_vert:r5,cube_frag:o5,depth_vert:a5,depth_frag:l5,distance_vert:u5,distance_frag:c5,equirect_vert:f5,equirect_frag:h5,linedashed_vert:d5,linedashed_frag:p5,meshbasic_vert:m5,meshbasic_frag:g5,meshlambert_vert:_5,meshlambert_frag:v5,meshmatcap_vert:x5,meshmatcap_frag:y5,meshnormal_vert:E5,meshnormal_frag:S5,meshphong_vert:b5,meshphong_frag:M5,meshphysical_vert:A5,meshphysical_frag:T5,meshtoon_vert:w5,meshtoon_frag:C5,points_vert:R5,points_frag:F5,shadow_vert:D5,shadow_frag:P5,sprite_vert:I5,sprite_frag:L5},Le={common:{diffuse:{value:new St(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ct}},envmap:{envMap:{value:null},envMapRotation:{value:new ct},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ct}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ct}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ct},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ct},normalScale:{value:new Ye(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ct},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ct}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ct}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ct}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new St(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new X},probesMax:{value:new X},probesResolution:{value:new X}},points:{diffuse:{value:new St(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0},uvTransform:{value:new ct}},sprite:{diffuse:{value:new St(16777215)},opacity:{value:1},center:{value:new Ye(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ct},alphaMap:{value:null},alphaMapTransform:{value:new ct},alphaTest:{value:0}}},ms={basic:{uniforms:Kn([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.fog]),vertexShader:gt.meshbasic_vert,fragmentShader:gt.meshbasic_frag},lambert:{uniforms:Kn([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new St(0)},envMapIntensity:{value:1}}]),vertexShader:gt.meshlambert_vert,fragmentShader:gt.meshlambert_frag},phong:{uniforms:Kn([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new St(0)},specular:{value:new St(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:gt.meshphong_vert,fragmentShader:gt.meshphong_frag},standard:{uniforms:Kn([Le.common,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.roughnessmap,Le.metalnessmap,Le.fog,Le.lights,{emissive:{value:new St(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:gt.meshphysical_vert,fragmentShader:gt.meshphysical_frag},toon:{uniforms:Kn([Le.common,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.gradientmap,Le.fog,Le.lights,{emissive:{value:new St(0)}}]),vertexShader:gt.meshtoon_vert,fragmentShader:gt.meshtoon_frag},matcap:{uniforms:Kn([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,{matcap:{value:null}}]),vertexShader:gt.meshmatcap_vert,fragmentShader:gt.meshmatcap_frag},points:{uniforms:Kn([Le.points,Le.fog]),vertexShader:gt.points_vert,fragmentShader:gt.points_frag},dashed:{uniforms:Kn([Le.common,Le.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:gt.linedashed_vert,fragmentShader:gt.linedashed_frag},depth:{uniforms:Kn([Le.common,Le.displacementmap]),vertexShader:gt.depth_vert,fragmentShader:gt.depth_frag},normal:{uniforms:Kn([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,{opacity:{value:1}}]),vertexShader:gt.meshnormal_vert,fragmentShader:gt.meshnormal_frag},sprite:{uniforms:Kn([Le.sprite,Le.fog]),vertexShader:gt.sprite_vert,fragmentShader:gt.sprite_frag},background:{uniforms:{uvTransform:{value:new ct},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:gt.background_vert,fragmentShader:gt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ct}},vertexShader:gt.backgroundCube_vert,fragmentShader:gt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:gt.cube_vert,fragmentShader:gt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:gt.equirect_vert,fragmentShader:gt.equirect_frag},distance:{uniforms:Kn([Le.common,Le.displacementmap,{referencePosition:{value:new X},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:gt.distance_vert,fragmentShader:gt.distance_frag},shadow:{uniforms:Kn([Le.lights,Le.fog,{color:{value:new St(0)},opacity:{value:1}}]),vertexShader:gt.shadow_vert,fragmentShader:gt.shadow_frag}};ms.physical={uniforms:Kn([ms.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ct},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ct},clearcoatNormalScale:{value:new Ye(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ct},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ct},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ct},sheen:{value:0},sheenColor:{value:new St(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ct},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ct},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ct},transmissionSamplerSize:{value:new Ye},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ct},attenuationDistance:{value:0},attenuationColor:{value:new St(0)},specularColor:{value:new St(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ct},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ct},anisotropyVector:{value:new Ye},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ct}}]),vertexShader:gt.meshphysical_vert,fragmentShader:gt.meshphysical_frag};const Gu={r:0,b:0,g:0},N5=new Zt,uy=new ct;uy.set(-1,0,0,0,1,0,0,0,1);function B5(t,e,n,i,s,r){const o=new St(0);let a=s===!0?0:1,l,u,c=null,f=0,h=null;function d(b){let y=b.isScene===!0?b.background:null;if(y&&y.isTexture){const g=b.backgroundBlurriness>0;y=e.get(y,g)}return y}function m(b){let y=!1;const g=d(b);g===null?_(o,a):g&&g.isColor&&(_(g,1),y=!0);const E=t.xr.getEnvironmentBlendMode();E==="additive"?n.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,r),(t.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function x(b,y){const g=d(y);g&&(g.isCubeTexture||g.mapping===Rf)?(u===void 0&&(u=new Jt(new Zi(1,1,1),new Cs({name:"BackgroundCubeMaterial",uniforms:ma(ms.backgroundCube.uniforms),vertexShader:ms.backgroundCube.vertexShader,fragmentShader:ms.backgroundCube.fragmentShader,side:pi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(E,T,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),u.material.uniforms.envMap.value=g,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(N5.makeRotationFromEuler(y.backgroundRotation)).transpose(),g.isCubeTexture&&g.isRenderTargetTexture===!1&&u.material.uniforms.backgroundRotation.value.premultiply(uy),u.material.toneMapped=bt.getTransfer(g.colorSpace)!==Ut,(c!==g||f!==g.version||h!==t.toneMapping)&&(u.material.needsUpdate=!0,c=g,f=g.version,h=t.toneMapping),u.layers.enableAll(),b.unshift(u,u.geometry,u.material,0,0,null)):g&&g.isTexture&&(l===void 0&&(l=new Jt(new If(2,2),new Cs({name:"BackgroundMaterial",uniforms:ma(ms.background.uniforms),vertexShader:ms.background.vertexShader,fragmentShader:ms.background.fragmentShader,side:mo,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=g,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.toneMapped=bt.getTransfer(g.colorSpace)!==Ut,g.matrixAutoUpdate===!0&&g.updateMatrix(),l.material.uniforms.uvTransform.value.copy(g.matrix),(c!==g||f!==g.version||h!==t.toneMapping)&&(l.material.needsUpdate=!0,c=g,f=g.version,h=t.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function _(b,y){b.getRGB(Gu,ry(t)),n.buffers.color.setClear(Gu.r,Gu.g,Gu.b,y,r)}function p(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(b,y=1){o.set(b),a=y,_(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(b){a=b,_(o,a)},render:m,addToRenderList:x,dispose:p}}function U5(t,e){const n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},s=h(null);let r=s,o=!1;function a(L,M,I,F,B){let O=!1;const z=f(L,F,I,M);r!==z&&(r=z,u(r.object)),O=d(L,F,I,B),O&&m(L,F,I,B),B!==null&&e.update(B,t.ELEMENT_ARRAY_BUFFER),(O||o)&&(o=!1,g(L,M,I,F),B!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function l(){return t.createVertexArray()}function u(L){return t.bindVertexArray(L)}function c(L){return t.deleteVertexArray(L)}function f(L,M,I,F){const B=F.wireframe===!0;let O=i[M.id];O===void 0&&(O={},i[M.id]=O);const z=L.isInstancedMesh===!0?L.id:0;let H=O[z];H===void 0&&(H={},O[z]=H);let Y=H[I.id];Y===void 0&&(Y={},H[I.id]=Y);let Q=Y[B];return Q===void 0&&(Q=h(l()),Y[B]=Q),Q}function h(L){const M=[],I=[],F=[];for(let B=0;B<n;B++)M[B]=0,I[B]=0,F[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:M,enabledAttributes:I,attributeDivisors:F,object:L,attributes:{},index:null}}function d(L,M,I,F){const B=r.attributes,O=M.attributes;let z=0;const H=I.getAttributes();for(const Y in H)if(H[Y].location>=0){const se=B[Y];let q=O[Y];if(q===void 0&&(Y==="instanceMatrix"&&L.instanceMatrix&&(q=L.instanceMatrix),Y==="instanceColor"&&L.instanceColor&&(q=L.instanceColor)),se===void 0||se.attribute!==q||q&&se.data!==q.data)return!0;z++}return r.attributesNum!==z||r.index!==F}function m(L,M,I,F){const B={},O=M.attributes;let z=0;const H=I.getAttributes();for(const Y in H)if(H[Y].location>=0){let se=O[Y];se===void 0&&(Y==="instanceMatrix"&&L.instanceMatrix&&(se=L.instanceMatrix),Y==="instanceColor"&&L.instanceColor&&(se=L.instanceColor));const q={};q.attribute=se,se&&se.data&&(q.data=se.data),B[Y]=q,z++}r.attributes=B,r.attributesNum=z,r.index=F}function x(){const L=r.newAttributes;for(let M=0,I=L.length;M<I;M++)L[M]=0}function _(L){p(L,0)}function p(L,M){const I=r.newAttributes,F=r.enabledAttributes,B=r.attributeDivisors;I[L]=1,F[L]===0&&(t.enableVertexAttribArray(L),F[L]=1),B[L]!==M&&(t.vertexAttribDivisor(L,M),B[L]=M)}function b(){const L=r.newAttributes,M=r.enabledAttributes;for(let I=0,F=M.length;I<F;I++)M[I]!==L[I]&&(t.disableVertexAttribArray(I),M[I]=0)}function y(L,M,I,F,B,O,z){z===!0?t.vertexAttribIPointer(L,M,I,B,O):t.vertexAttribPointer(L,M,I,F,B,O)}function g(L,M,I,F){x();const B=F.attributes,O=I.getAttributes(),z=M.defaultAttributeValues;for(const H in O){const Y=O[H];if(Y.location>=0){let Q=B[H];if(Q===void 0&&(H==="instanceMatrix"&&L.instanceMatrix&&(Q=L.instanceMatrix),H==="instanceColor"&&L.instanceColor&&(Q=L.instanceColor)),Q!==void 0){const se=Q.normalized,q=Q.itemSize,he=e.get(Q);if(he===void 0)continue;const et=he.buffer,We=he.type,de=he.bytesPerElement,K=We===t.INT||We===t.UNSIGNED_INT||Q.gpuType===_m;if(Q.isInterleavedBufferAttribute){const j=Q.data,_e=j.stride,Fe=Q.offset;if(j.isInstancedInterleavedBuffer){for(let Ce=0;Ce<Y.locationSize;Ce++)p(Y.location+Ce,j.meshPerAttribute);L.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let Ce=0;Ce<Y.locationSize;Ce++)_(Y.location+Ce);t.bindBuffer(t.ARRAY_BUFFER,et);for(let Ce=0;Ce<Y.locationSize;Ce++)y(Y.location+Ce,q/Y.locationSize,We,se,_e*de,(Fe+q/Y.locationSize*Ce)*de,K)}else{if(Q.isInstancedBufferAttribute){for(let j=0;j<Y.locationSize;j++)p(Y.location+j,Q.meshPerAttribute);L.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let j=0;j<Y.locationSize;j++)_(Y.location+j);t.bindBuffer(t.ARRAY_BUFFER,et);for(let j=0;j<Y.locationSize;j++)y(Y.location+j,q/Y.locationSize,We,se,q*de,q/Y.locationSize*j*de,K)}}else if(z!==void 0){const se=z[H];if(se!==void 0)switch(se.length){case 2:t.vertexAttrib2fv(Y.location,se);break;case 3:t.vertexAttrib3fv(Y.location,se);break;case 4:t.vertexAttrib4fv(Y.location,se);break;default:t.vertexAttrib1fv(Y.location,se)}}}}b()}function E(){A();for(const L in i){const M=i[L];for(const I in M){const F=M[I];for(const B in F){const O=F[B];for(const z in O)c(O[z].object),delete O[z];delete F[B]}}delete i[L]}}function T(L){if(i[L.id]===void 0)return;const M=i[L.id];for(const I in M){const F=M[I];for(const B in F){const O=F[B];for(const z in O)c(O[z].object),delete O[z];delete F[B]}}delete i[L.id]}function C(L){for(const M in i){const I=i[M];for(const F in I){const B=I[F];if(B[L.id]===void 0)continue;const O=B[L.id];for(const z in O)c(O[z].object),delete O[z];delete B[L.id]}}}function v(L){for(const M in i){const I=i[M],F=L.isInstancedMesh===!0?L.id:0,B=I[F];if(B!==void 0){for(const O in B){const z=B[O];for(const H in z)c(z[H].object),delete z[H];delete B[O]}delete I[F],Object.keys(I).length===0&&delete i[M]}}}function A(){R(),o=!0,r!==s&&(r=s,u(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:A,resetDefaultState:R,dispose:E,releaseStatesOfGeometry:T,releaseStatesOfObject:v,releaseStatesOfProgram:C,initAttributes:x,enableAttribute:_,disableUnusedAttributes:b}}function O5(t,e,n){let i;function s(l){i=l}function r(l,u){t.drawArrays(i,l,u),n.update(u,i,1)}function o(l,u,c){c!==0&&(t.drawArraysInstanced(i,l,u,c),n.update(u,i,c))}function a(l,u,c){if(c===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,u,0,c);let h=0;for(let d=0;d<c;d++)h+=u[d];n.update(h,i,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function k5(t,e,n,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const C=e.get("EXT_texture_filter_anisotropic");s=t.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(C){return!(C!==Ki&&i.convert(C)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){const v=C===ws&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==xi&&C!==_s&&!v&&i.convert(C)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE))}function l(C){if(C==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=n.precision!==void 0?n.precision:"highp";const c=l(u);c!==u&&(ot("WebGLRenderer:",u,"not supported, using",c,"instead."),u=c);const f=n.logarithmicDepthBuffer===!0,h=n.reversedDepthBuffer===!0&&e.has("EXT_clip_control");n.reversedDepthBuffer===!0&&h===!1&&ot("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const d=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),m=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=t.getParameter(t.MAX_TEXTURE_SIZE),_=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),p=t.getParameter(t.MAX_VERTEX_ATTRIBS),b=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),y=t.getParameter(t.MAX_VARYING_VECTORS),g=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),E=t.getParameter(t.MAX_SAMPLES),T=t.getParameter(t.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:u,logarithmicDepthBuffer:f,reversedDepthBuffer:h,maxTextures:d,maxVertexTextures:m,maxTextureSize:x,maxCubemapSize:_,maxAttributes:p,maxVertexUniforms:b,maxVaryings:y,maxFragmentUniforms:g,maxSamples:E,samples:T}}function z5(t){const e=this;let n=null,i=0,s=!1,r=!1;const o=new ps,a=new ct,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){const d=f.length!==0||h||i!==0||s;return s=h,i=f.length,d},this.beginShadows=function(){r=!0,c(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){n=c(f,h,0)},this.setState=function(f,h,d){const m=f.clippingPlanes,x=f.clipIntersection,_=f.clipShadows,p=t.get(f);if(!s||m===null||m.length===0||r&&!_)r?c(null):u();else{const b=r?0:i,y=b*4;let g=p.clippingState||null;l.value=g,g=c(m,h,y,d);for(let E=0;E!==y;++E)g[E]=n[E];p.clippingState=g,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=b}};function u(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function c(f,h,d,m){const x=f!==null?f.length:0;let _=null;if(x!==0){if(_=l.value,m!==!0||_===null){const p=d+x*4,b=h.matrixWorldInverse;a.getNormalMatrix(b),(_===null||_.length<p)&&(_=new Float32Array(p));for(let y=0,g=d;y!==x;++y,g+=4)o.copy(f[y]).applyMatrix4(b,a),o.normal.toArray(_,g),_[g+3]=o.constant}l.value=_,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,_}}const Ko=4,V5=6,H5=20,G5=256,Ha=new Lf,Lg=new St;let Uh=null,Oh=0,kh=0,zh=!1;const W5=new X,Yr=new X;class Ng{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,n=0,i=.1,s=100,r={}){const{size:o=256,position:a=W5}=r;Uh=this._renderer.getRenderTarget(),Oh=this._renderer.getActiveCubeFace(),kh=this._renderer.getActiveMipmapLevel(),zh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,a),n>0&&this._blur(l,0,0,n),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Og(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ug(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Uh,Oh,kh),this._renderer.xr.enabled=zh,e.scissorTest=!1,$o(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===go||e.mapping===da?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Uh=this._renderer.getRenderTarget(),Oh=this._renderer.getActiveCubeFace(),kh=this._renderer.getActiveMipmapLevel(),zh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Hn,minFilter:Hn,generateMipmaps:!1,type:ws,format:Ki,colorSpace:Gc,depthBuffer:!1},s=Bg(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Bg(e,n,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=$5(r)),this._blurMaterial=q5(r,e,n),this._ggxMaterial=X5(r,e,n)}return s}_compileMaterial(e){const n=new Jt(new In,e);this._renderer.compile(n,Ha)}_sceneToCubeUV(e,n,i,s,r){const l=new Wi(90,1,n,i),u=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],f=this._renderer,h=f.autoClear,d=f.toneMapping;f.getClearColor(Lg),f.toneMapping=ys,f.autoClear=!1,f.state.buffers.depth.getReversed()&&(f.setRenderTarget(s),f.clearDepth(),f.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Jt(new Zi,new Ll({name:"PMREM.Background",side:pi,depthWrite:!1,depthTest:!1})));const x=this._backgroundBox,_=x.material;let p=!1;const b=e.background;b?b.isColor&&(_.color.copy(b),e.background=null,p=!0):(_.color.copy(Lg),p=!0);for(let y=0;y<6;y++){const g=y%3;g===0?(l.up.set(0,u[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+c[y],r.y,r.z)):g===1?(l.up.set(0,0,u[y]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+c[y],r.z)):(l.up.set(0,u[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+c[y]));const E=this._cubeSize;$o(s,g*E,y>2?E:0,E,E),f.setRenderTarget(s),p&&f.render(x,l),f.render(e,l)}f.toneMapping=d,f.autoClear=h,e.background=b}_textureToCubeUV(e,n){const i=this._renderer,s=e.mapping===go||e.mapping===da;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Og()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ug());const r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;$o(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(o,Ha)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);n.autoClear=i}_applyGGXFilter(e,n,i){const s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;const l=o.uniforms,u=i/(this._lodMeshes.length-1),c=n/(this._lodMeshes.length-1),f=Math.sqrt(u*u-c*c),h=u*1.25,d=f*h,{_lodMax:m}=this,x=this._sizeLods[i],_=3*x*(i>m-Ko?i-m+Ko:0),p=4*(this._cubeSize-x);l.envMap.value=e.texture,l.roughness.value=d,l.mipInt.value=m-n,$o(r,_,p,3*x,2*x),s.setRenderTarget(r),s.render(a,Ha),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-i,$o(e,_,p,3*x,2*x),s.setRenderTarget(e),s.render(a,Ha)}_blur(e,n,i,s){const r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,n,i,o),this._blurPass(r,e,i,i,o)}_blurPass(e,n,i,s,r){const o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;const u=a.uniforms;u.envMap.value=e.texture,u.sigma.value=r,u.mipInt.value=this._lodMax-i;const c=this._sizeLods[s],f=3*c*(s>this._lodMax-Ko?s-this._lodMax+Ko:0),h=4*(this._cubeSize-c);$o(n,f,h,3*c,2*c),o.setRenderTarget(n),o.render(l,Ha)}}function $5(t){const e=[],n=[];let i=t;const s=t-Ko+1+V5;for(let r=0;r<s;r++){const o=Math.pow(2,i);e.push(o);const a=1/(o-2),l=-a,u=1+a,c=[l,l,u,l,u,u,l,l,u,u,l,u],f=6,h=6,d=3,m=new Float32Array(d*h*f),x=new Float32Array(d*h*f);for(let p=0;p<f;p++){const b=p%3*2/3-1,y=p>2?0:-1,g=[b,y,0,b+2/3,y,0,b+2/3,y+1,0,b,y,0,b+2/3,y+1,0,b,y+1,0];m.set(g,d*h*p);for(let E=0;E<h;E++){const T=c[E*2]*2-1,C=c[E*2+1]*2-1;p===0?Yr.set(1,C,T):p===1?Yr.set(-T,1,-C):p===2?Yr.set(-T,C,1):p===3?Yr.set(-1,C,-T):p===4?Yr.set(-T,-1,C):Yr.set(T,C,-1),Yr.toArray(x,(p*h+E)*d)}}const _=new In;_.setAttribute("position",new Es(m,d)),_.setAttribute("outputDirection",new Es(x,d)),n.push(new Jt(_,null)),i>Ko&&i--}return{lodMeshes:n,sizeLods:e}}function Bg(t,e,n){const i=new es(t,e,n);return i.texture.mapping=Rf,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function $o(t,e,n,i,s){t.viewport.set(e,n,i,s),t.scissor.set(e,n,i,s)}function X5(t,e,n){return new Cs({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:G5,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Nf(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:er,depthTest:!1,depthWrite:!1})}function q5(t,e,n){return new Cs({name:"SphericalGaussianBlur",defines:{SAMPLES:H5,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Nf(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:er,depthTest:!1,depthWrite:!1})}function Ug(){return new Cs({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Nf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:er,depthTest:!1,depthWrite:!1})}function Og(){return new Cs({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Nf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:er,depthTest:!1,depthWrite:!1})}function Nf(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}class cy extends es{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new iy(s),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Zi(5,5,5),r=new Cs({name:"CubemapFromEquirect",uniforms:ma(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:pi,blending:er});r.uniforms.tEquirect.value=n;const o=new Jt(s,r),a=n.minFilter;return n.minFilter===eo&&(n.minFilter=Hn),new Kw(1,10,this).update(e,o),n.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,n=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(n,i,s);e.setRenderTarget(r)}}function Y5(t){let e=new WeakMap,n=new WeakMap,i=null;function s(h,d=!1){return h==null?null:d?o(h):r(h)}function r(h){if(h&&h.isTexture){const d=h.mapping;if(d===ch||d===fh)if(e.has(h)){const m=e.get(h).texture;return a(m,h.mapping)}else{const m=h.image;if(m&&m.height>0){const x=new cy(m.height);return x.fromEquirectangularTexture(t,h),e.set(h,x),h.addEventListener("dispose",u),a(x.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture){const d=h.mapping,m=d===ch||d===fh,x=d===go||d===da;if(m||x){let _=n.get(h);const p=_!==void 0?_.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==p)return i===null&&(i=new Ng(t)),_=m?i.fromEquirectangular(h,_):i.fromCubemap(h,_),_.texture.pmremVersion=h.pmremVersion,n.set(h,_),_.texture;if(_!==void 0)return _.texture;{const b=h.image;return m&&b&&b.height>0||x&&b&&l(b)?(i===null&&(i=new Ng(t)),_=m?i.fromEquirectangular(h):i.fromCubemap(h),_.texture.pmremVersion=h.pmremVersion,n.set(h,_),h.addEventListener("dispose",c),_.texture):null}}}return h}function a(h,d){return d===ch?h.mapping=go:d===fh&&(h.mapping=da),h}function l(h){let d=0;const m=6;for(let x=0;x<m;x++)h[x]!==void 0&&d++;return d===m}function u(h){const d=h.target;d.removeEventListener("dispose",u);const m=e.get(d);m!==void 0&&(e.delete(d),m.dispose())}function c(h){const d=h.target;d.removeEventListener("dispose",c);const m=n.get(d);m!==void 0&&(n.delete(d),m.dispose())}function f(){e=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:f}}function K5(t){const e={};function n(i){if(e[i]!==void 0)return e[i];const s=t.getExtension(i);return e[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const s=n(i);return s===null&&na("WebGLRenderer: "+i+" extension not supported."),s}}}function Z5(t,e,n,i){const s={},r=new WeakMap;function o(f){const h=f.target;h.index!==null&&e.remove(h.index);for(const m in h.attributes)e.remove(h.attributes[m]);h.removeEventListener("dispose",o),delete s[h.id];const d=r.get(h);d&&(e.remove(d),r.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,n.memory.geometries--}function a(f,h){return s[h.id]===!0||(h.addEventListener("dispose",o),s[h.id]=!0,n.memory.geometries++),h}function l(f){const h=f.attributes;for(const d in h)e.update(h[d],t.ARRAY_BUFFER)}function u(f){const h=[],d=f.index,m=f.attributes.position;let x=0;if(m===void 0)return;if(d!==null){const b=d.array;x=d.version;for(let y=0,g=b.length;y<g;y+=3){const E=b[y+0],T=b[y+1],C=b[y+2];h.push(E,T,T,C,C,E)}}else{const b=m.array;x=m.version;for(let y=0,g=b.length/3-1;y<g;y+=3){const E=y+0,T=y+1,C=y+2;h.push(E,T,T,C,C,E)}}const _=new(m.count>=65535?Q1:j1)(h,1);_.version=x;const p=r.get(f);p&&e.remove(p),r.set(f,_)}function c(f){const h=r.get(f);if(h){const d=f.index;d!==null&&h.version<d.version&&u(f)}else u(f);return r.get(f)}return{get:a,update:l,getWireframeAttribute:c}}function J5(t,e,n){let i;function s(f){i=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,h){t.drawElements(i,h,r,f*o),n.update(h,i,1)}function u(f,h,d){d!==0&&(t.drawElementsInstanced(i,h,r,f*o,d),n.update(h,i,d))}function c(f,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,h,0,r,f,0,d);let x=0;for(let _=0;_<d;_++)x+=h[_];n.update(x,i,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=u,this.renderMultiDraw=c}function j5(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(n.calls++,o){case t.TRIANGLES:n.triangles+=a*(r/3);break;case t.LINES:n.lines+=a*(r/2);break;case t.LINE_STRIP:n.lines+=a*(r-1);break;case t.LINE_LOOP:n.lines+=a*r;break;case t.POINTS:n.points+=a*r;break;default:At("WebGLInfo: Unknown draw mode:",o);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:s,update:i}}function Q5(t,e,n){const i=new WeakMap,s=new sn;function r(o,a,l){const u=o.morphTargetInfluences,c=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=c!==void 0?c.length:0;let h=i.get(a);if(h===void 0||h.count!==f){let R=function(){v.dispose(),i.delete(a),a.removeEventListener("dispose",R)};var d=R;h!==void 0&&h.texture.dispose();const m=a.morphAttributes.position!==void 0,x=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],b=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let g=0;m===!0&&(g=1),x===!0&&(g=2),_===!0&&(g=3);let E=a.attributes.position.count*g,T=1;E>e.maxTextureSize&&(T=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);const C=new Float32Array(E*T*4*f),v=new Z1(C,E,T,f);v.type=_s,v.needsUpdate=!0;const A=g*4;for(let L=0;L<f;L++){const M=p[L],I=b[L],F=y[L],B=E*T*4*L;for(let O=0;O<M.count;O++){const z=O*A;m===!0&&(s.fromBufferAttribute(M,O),C[B+z+0]=s.x,C[B+z+1]=s.y,C[B+z+2]=s.z,C[B+z+3]=0),x===!0&&(s.fromBufferAttribute(I,O),C[B+z+4]=s.x,C[B+z+5]=s.y,C[B+z+6]=s.z,C[B+z+7]=0),_===!0&&(s.fromBufferAttribute(F,O),C[B+z+8]=s.x,C[B+z+9]=s.y,C[B+z+10]=s.z,C[B+z+11]=F.itemSize===4?s.w:1)}}h={count:f,texture:v,size:new Ye(E,T)},i.set(a,h),a.addEventListener("dispose",R)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",o.morphTexture,n);else{let m=0;for(let _=0;_<u.length;_++)m+=u[_];const x=a.morphTargetsRelative?1:1-m;l.getUniforms().setValue(t,"morphTargetBaseInfluence",x),l.getUniforms().setValue(t,"morphTargetInfluences",u)}l.getUniforms().setValue(t,"morphTargetsTexture",h.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",h.size)}return{update:r}}function eR(t,e,n,i,s){let r=new WeakMap;function o(u){const c=s.render.frame,f=u.geometry,h=e.get(u,f);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),u.isInstancedMesh&&(u.hasEventListener("dispose",l)===!1&&u.addEventListener("dispose",l),r.get(u)!==c&&(n.update(u.instanceMatrix,t.ARRAY_BUFFER),u.instanceColor!==null&&n.update(u.instanceColor,t.ARRAY_BUFFER),r.set(u,c))),u.isSkinnedMesh){const d=u.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return h}function a(){r=new WeakMap}function l(u){const c=u.target;c.removeEventListener("dispose",l),i.releaseStatesOfObject(c),n.remove(c.instanceMatrix),c.instanceColor!==null&&n.remove(c.instanceColor)}return{update:o,dispose:a}}const tR={[P1]:"LINEAR_TONE_MAPPING",[I1]:"REINHARD_TONE_MAPPING",[L1]:"CINEON_TONE_MAPPING",[N1]:"ACES_FILMIC_TONE_MAPPING",[U1]:"AGX_TONE_MAPPING",[O1]:"NEUTRAL_TONE_MAPPING",[B1]:"CUSTOM_TONE_MAPPING"};function nR(t,e,n,i,s,r){const o=new es(e,n,{type:t,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let a=null,l=null;const u=new In;u.setAttribute("position",new _n([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new _n([0,2,0,0,2,0],2));const c=new Hw({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new Jt(u,c),h=new Lf(-1,1,1,-1,0,1);let d=null,m=null,x=!1,_,p=null,b=[],y=!1;this.setSize=function(g,E){o.setSize(g,E),a!==null&&a.setSize(g,E),l!==null&&l.setSize(g,E);for(let T=0;T<b.length;T++){const C=b[T];C.setSize&&C.setSize(g,E)}},this.setEffects=function(g){b=g,y=b.length>0&&b[0].isRenderPass===!0;const E=o.width,T=o.height;b.length>0&&a===null&&(a=new es(E,T,{type:ws,depthBuffer:!1,stencilBuffer:!1}),l=new es(E,T,{type:ws,depthBuffer:!1,stencilBuffer:!1}));for(let C=0;C<b.length;C++){const v=b[C];v.setSize&&v.setSize(E,T)}},this.begin=function(g,E){if(x||g.toneMapping===ys&&b.length===0)return!1;if(p=E,E!==null){const T=E.width,C=E.height;(o.width!==T||o.height!==C)&&this.setSize(T,C)}return y===!1&&g.setRenderTarget(o),_=g.toneMapping,g.toneMapping=ys,!0},this.hasRenderPass=function(){return y},this.end=function(g,E){g.toneMapping=_,x=!0;let T=o,C=a;for(let v=0;v<b.length;v++){const A=b[v];A.enabled!==!1&&(A.render(g,C,T,E),A.needsSwap!==!1&&(T=C,C=C===a?l:a))}if(d!==g.outputColorSpace||m!==g.toneMapping){d=g.outputColorSpace,m=g.toneMapping,c.defines={},bt.getTransfer(d)===Ut&&(c.defines.SRGB_TRANSFER="");const v=tR[m];v&&(c.defines[v]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=T.texture,g.setRenderTarget(p),g.render(f,h),p=null,x=!1},this.isCompositing=function(){return x},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),u.dispose(),c.dispose()}}const fy=new Wn,cp=new Nl(1,1),hy=new Z1,dy=new gw,py=new iy,kg=[],zg=[],Vg=new Float32Array(16),Hg=new Float32Array(9),Gg=new Float32Array(4);function Sa(t,e,n){const i=t[0];if(i<=0||i>0)return t;const s=e*n;let r=kg[s];if(r===void 0&&(r=new Float32Array(s),kg[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=n,t[o].toArray(r,a)}return r}function vn(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function xn(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Bf(t,e){let n=zg[e];n===void 0&&(n=new Int32Array(e),zg[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function iR(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function sR(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(vn(n,e))return;t.uniform2fv(this.addr,e),xn(n,e)}}function rR(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(vn(n,e))return;t.uniform3fv(this.addr,e),xn(n,e)}}function oR(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(vn(n,e))return;t.uniform4fv(this.addr,e),xn(n,e)}}function aR(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(vn(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),xn(n,e)}else{if(vn(n,i))return;Gg.set(i),t.uniformMatrix2fv(this.addr,!1,Gg),xn(n,i)}}function lR(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(vn(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),xn(n,e)}else{if(vn(n,i))return;Hg.set(i),t.uniformMatrix3fv(this.addr,!1,Hg),xn(n,i)}}function uR(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(vn(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),xn(n,e)}else{if(vn(n,i))return;Vg.set(i),t.uniformMatrix4fv(this.addr,!1,Vg),xn(n,i)}}function cR(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function fR(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(vn(n,e))return;t.uniform2iv(this.addr,e),xn(n,e)}}function hR(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(vn(n,e))return;t.uniform3iv(this.addr,e),xn(n,e)}}function dR(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(vn(n,e))return;t.uniform4iv(this.addr,e),xn(n,e)}}function pR(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function mR(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(vn(n,e))return;t.uniform2uiv(this.addr,e),xn(n,e)}}function gR(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(vn(n,e))return;t.uniform3uiv(this.addr,e),xn(n,e)}}function _R(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(vn(n,e))return;t.uniform4uiv(this.addr,e),xn(n,e)}}function vR(t,e,n){const i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(t.uniform1i(this.addr,s),i[0]=s);let r;this.type===t.SAMPLER_2D_SHADOW?(cp.compareFunction=n.isReversedDepthBuffer()?Mm:bm,r=cp):r=fy,n.setTexture2D(e||r,s)}function xR(t,e,n){const i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(t.uniform1i(this.addr,s),i[0]=s),n.setTexture3D(e||dy,s)}function yR(t,e,n){const i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(t.uniform1i(this.addr,s),i[0]=s),n.setTextureCube(e||py,s)}function ER(t,e,n){const i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(t.uniform1i(this.addr,s),i[0]=s),n.setTexture2DArray(e||hy,s)}function SR(t){switch(t){case 5126:return iR;case 35664:return sR;case 35665:return rR;case 35666:return oR;case 35674:return aR;case 35675:return lR;case 35676:return uR;case 5124:case 35670:return cR;case 35667:case 35671:return fR;case 35668:case 35672:return hR;case 35669:case 35673:return dR;case 5125:return pR;case 36294:return mR;case 36295:return gR;case 36296:return _R;case 35678:case 36198:case 36298:case 36306:case 35682:return vR;case 35679:case 36299:case 36307:return xR;case 35680:case 36300:case 36308:case 36293:return yR;case 36289:case 36303:case 36311:case 36292:return ER}}function bR(t,e){t.uniform1fv(this.addr,e)}function MR(t,e){const n=Sa(e,this.size,2);t.uniform2fv(this.addr,n)}function AR(t,e){const n=Sa(e,this.size,3);t.uniform3fv(this.addr,n)}function TR(t,e){const n=Sa(e,this.size,4);t.uniform4fv(this.addr,n)}function wR(t,e){const n=Sa(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function CR(t,e){const n=Sa(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function RR(t,e){const n=Sa(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function FR(t,e){t.uniform1iv(this.addr,e)}function DR(t,e){t.uniform2iv(this.addr,e)}function PR(t,e){t.uniform3iv(this.addr,e)}function IR(t,e){t.uniform4iv(this.addr,e)}function LR(t,e){t.uniform1uiv(this.addr,e)}function NR(t,e){t.uniform2uiv(this.addr,e)}function BR(t,e){t.uniform3uiv(this.addr,e)}function UR(t,e){t.uniform4uiv(this.addr,e)}function OR(t,e,n){const i=this.cache,s=e.length,r=Bf(n,s);vn(i,r)||(t.uniform1iv(this.addr,r),xn(i,r));let o;this.type===t.SAMPLER_2D_SHADOW?o=cp:o=fy;for(let a=0;a!==s;++a)n.setTexture2D(e[a]||o,r[a])}function kR(t,e,n){const i=this.cache,s=e.length,r=Bf(n,s);vn(i,r)||(t.uniform1iv(this.addr,r),xn(i,r));for(let o=0;o!==s;++o)n.setTexture3D(e[o]||dy,r[o])}function zR(t,e,n){const i=this.cache,s=e.length,r=Bf(n,s);vn(i,r)||(t.uniform1iv(this.addr,r),xn(i,r));for(let o=0;o!==s;++o)n.setTextureCube(e[o]||py,r[o])}function VR(t,e,n){const i=this.cache,s=e.length,r=Bf(n,s);vn(i,r)||(t.uniform1iv(this.addr,r),xn(i,r));for(let o=0;o!==s;++o)n.setTexture2DArray(e[o]||hy,r[o])}function HR(t){switch(t){case 5126:return bR;case 35664:return MR;case 35665:return AR;case 35666:return TR;case 35674:return wR;case 35675:return CR;case 35676:return RR;case 5124:case 35670:return FR;case 35667:case 35671:return DR;case 35668:case 35672:return PR;case 35669:case 35673:return IR;case 5125:return LR;case 36294:return NR;case 36295:return BR;case 36296:return UR;case 35678:case 36198:case 36298:case 36306:case 35682:return OR;case 35679:case 36299:case 36307:return kR;case 35680:case 36300:case 36308:case 36293:return zR;case 36289:case 36303:case 36311:case 36292:return VR}}class GR{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=SR(n.type)}}class WR{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=HR(n.type)}}class $R{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,n[a.id],i)}}}const Vh=/(\w+)(\])?(\[|\.)?/g;function Wg(t,e){t.seq.push(e),t.map[e.id]=e}function XR(t,e,n){const i=t.name,s=i.length;for(Vh.lastIndex=0;;){const r=Vh.exec(i),o=Vh.lastIndex;let a=r[1];const l=r[2]==="]",u=r[3];if(l&&(a=a|0),u===void 0||u==="["&&o+2===s){Wg(n,u===void 0?new GR(a,t,e):new WR(a,t,e));break}else{let f=n.map[a];f===void 0&&(f=new $R(a),Wg(n,f)),n=f}}}class sc{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=e.getActiveUniform(n,o),l=e.getUniformLocation(n,a.name);XR(a,l,this)}const s=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,n,i,s){const r=this.map[n];r!==void 0&&r.setValue(e,i,s)}setOptional(e,n,i){const s=n[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,n,i,s){for(let r=0,o=n.length;r!==o;++r){const a=n[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,n){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in n&&i.push(o)}return i}}function $g(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}const qR=37297;let YR=0;function KR(t,e){const n=t.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,n.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${n[o]}`)}return i.join(`
`)}const Xg=new ct;function ZR(t){bt._getMatrix(Xg,bt.workingColorSpace,t);const e=`mat3( ${Xg.elements.map(n=>n.toFixed(4))} )`;switch(bt.getTransfer(t)){case Wc:return[e,"LinearTransferOETF"];case Ut:return[e,"sRGBTransferOETF"];default:return ot("WebGLProgram: Unsupported color space: ",t),[e,"LinearTransferOETF"]}}function qg(t,e,n){const i=t.getShaderParameter(e,t.COMPILE_STATUS),r=(t.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return n.toUpperCase()+`

`+r+`

`+KR(t.getShaderSource(e),a)}else return r}function JR(t,e){const n=ZR(e);return[`vec4 ${t}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}const jR={[P1]:"Linear",[I1]:"Reinhard",[L1]:"Cineon",[N1]:"ACESFilmic",[U1]:"AgX",[O1]:"Neutral",[B1]:"Custom"};function QR(t,e){const n=jR[e];return n===void 0?(ot("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+t+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const Wu=new X;function eF(){bt.getLuminanceCoefficients(Wu);const t=Wu.x.toFixed(4),e=Wu.y.toFixed(4),n=Wu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function tF(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ja).join(`
`)}function nF(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function iF(t,e){const n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=t.getActiveAttrib(e,s),o=r.name;let a=1;r.type===t.FLOAT_MAT2&&(a=2),r.type===t.FLOAT_MAT3&&(a=3),r.type===t.FLOAT_MAT4&&(a=4),n[o]={type:r.type,location:t.getAttribLocation(e,o),locationSize:a}}return n}function ja(t){return t!==""}function Yg(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Kg(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const sF=/^[ \t]*#include +<([\w\d./]+)>/gm;function fp(t){return t.replace(sF,oF)}const rF=new Map;function oF(t,e){let n=gt[e];if(n===void 0){const i=rF.get(e);if(i!==void 0)n=gt[i],ot('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return fp(n)}const aF=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Zg(t){return t.replace(aF,lF)}function lF(t,e,n,i){let s="";for(let r=parseInt(e);r<parseInt(n);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Jg(t){let e=`precision ${t.precision} float;
	precision ${t.precision} int;
	precision ${t.precision} sampler2D;
	precision ${t.precision} samplerCube;
	precision ${t.precision} sampler3D;
	precision ${t.precision} sampler2DArray;
	precision ${t.precision} sampler2DShadow;
	precision ${t.precision} samplerCubeShadow;
	precision ${t.precision} sampler2DArrayShadow;
	precision ${t.precision} isampler2D;
	precision ${t.precision} isampler3D;
	precision ${t.precision} isamplerCube;
	precision ${t.precision} isampler2DArray;
	precision ${t.precision} usampler2D;
	precision ${t.precision} usampler3D;
	precision ${t.precision} usamplerCube;
	precision ${t.precision} usampler2DArray;
	`;return t.precision==="highp"?e+=`
#define HIGH_PRECISION`:t.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:t.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const uF={[Qu]:"SHADOWMAP_TYPE_PCF",[Za]:"SHADOWMAP_TYPE_VSM"};function cF(t){return uF[t.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const fF={[go]:"ENVMAP_TYPE_CUBE",[da]:"ENVMAP_TYPE_CUBE",[Rf]:"ENVMAP_TYPE_CUBE_UV"};function hF(t){return t.envMap===!1?"ENVMAP_TYPE_CUBE":fF[t.envMapMode]||"ENVMAP_TYPE_CUBE"}const dF={[da]:"ENVMAP_MODE_REFRACTION"};function pF(t){return t.envMap===!1?"ENVMAP_MODE_REFLECTION":dF[t.envMapMode]||"ENVMAP_MODE_REFLECTION"}const mF={[D1]:"ENVMAP_BLENDING_MULTIPLY",[IT]:"ENVMAP_BLENDING_MIX",[LT]:"ENVMAP_BLENDING_ADD"};function gF(t){return t.envMap===!1?"ENVMAP_BLENDING_NONE":mF[t.combine]||"ENVMAP_BLENDING_NONE"}function _F(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function vF(t,e,n,i){const s=t.getContext(),r=n.defines;let o=n.vertexShader,a=n.fragmentShader;const l=cF(n),u=hF(n),c=pF(n),f=gF(n),h=_F(n),d=tF(n),m=nF(r),x=s.createProgram();let _,p,b=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(_=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m].filter(ja).join(`
`),_.length>0&&(_+=`
`),p=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m].filter(ja).join(`
`),p.length>0&&(p+=`
`)):(_=[Jg(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ja).join(`
`),p=[Jg(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.envMap?"#define "+c:"",n.envMap?"#define "+f:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.retroreflection?"#define USE_RETROREFLECTION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==ys?"#define TONE_MAPPING":"",n.toneMapping!==ys?gt.tonemapping_pars_fragment:"",n.toneMapping!==ys?QR("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",gt.colorspace_pars_fragment,JR("linearToOutputTexel",n.outputColorSpace),eF(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(ja).join(`
`)),o=fp(o),o=Yg(o,n),o=Kg(o,n),a=fp(a),a=Yg(a,n),a=Kg(a,n),o=Zg(o),a=Zg(a),n.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,_=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,p=["#define varying in",n.glslVersion===ig?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===ig?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=b+_+o,g=b+p+a,E=$g(s,s.VERTEX_SHADER,y),T=$g(s,s.FRAGMENT_SHADER,g);s.attachShader(x,E),s.attachShader(x,T),n.index0AttributeName!==void 0?s.bindAttribLocation(x,0,n.index0AttributeName):n.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function C(L){if(t.debug.checkShaderErrors){const M=s.getProgramInfoLog(x)||"",I=s.getShaderInfoLog(E)||"",F=s.getShaderInfoLog(T)||"",B=M.trim(),O=I.trim(),z=F.trim();let H=!0,Y=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(H=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(s,x,E,T);else{const Q=qg(s,E,"vertex"),se=qg(s,T,"fragment");At("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+B+`
`+Q+`
`+se)}else B!==""?ot("WebGLProgram: Program Info Log:",B):(O===""||z==="")&&(Y=!1);Y&&(L.diagnostics={runnable:H,programLog:B,vertexShader:{log:O,prefix:_},fragmentShader:{log:z,prefix:p}})}s.deleteShader(E),s.deleteShader(T),v=new sc(s,x),A=iF(s,x)}let v;this.getUniforms=function(){return v===void 0&&C(this),v};let A;this.getAttributes=function(){return A===void 0&&C(this),A};let R=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(x,qR)),R},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=YR++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=E,this.fragmentShader=T,this}let xF=0;class yF{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,n,i){const s=this._getShaderCacheForMaterial(e);return s.has(n)===!1&&(s.add(n),n.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new EF(e),n.set(e,i)),i}}class EF{constructor(e){this.id=xF++,this.code=e,this.usedTimes=0}}function SF(t){return t===_o||t===Vc||t===Hc}function bF(t,e,n,i,s,r){const o=new wm,a=new yF,l=new Set,u=[],c=new Map,f=i.logarithmicDepthBuffer;let h=i.precision;const d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(v){return l.add(v),v===0?"uv":`uv${v}`}function x(v,A,R,L,M,I){const F=L.fog,B=M.geometry,O=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?L.environment:null,z=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,H=e.get(v.envMap||O,z),Y=H&&H.mapping===Rf?H.image.height:null,Q=d[v.type];v.precision!==null&&(h=i.getMaxPrecision(v.precision),h!==v.precision&&ot("WebGLProgram.getParameters:",v.precision,"not supported, using",h,"instead."));const se=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,q=se!==void 0?se.length:0;let he=0;B.morphAttributes.position!==void 0&&(he=1),B.morphAttributes.normal!==void 0&&(he=2),B.morphAttributes.color!==void 0&&(he=3);let et,We,de,K;if(Q){const Ht=ms[Q];et=Ht.vertexShader,We=Ht.fragmentShader}else{et=v.vertexShader,We=v.fragmentShader;const Ht=a.getVertexShaderStage(v),Mt=a.getFragmentShaderStage(v);a.update(v,Ht,Mt),de=Ht.id,K=Mt.id}const j=t.getRenderTarget(),_e=t.state.buffers.depth.getReversed(),Fe=M.isInstancedMesh===!0,Ce=M.isBatchedMesh===!0,Ze=!!v.map,N=!!v.matcap,k=!!H,ee=!!v.aoMap,ce=!!v.lightMap,oe=!!v.bumpMap&&v.wireframe===!1,ue=!!v.normalMap,xe=!!v.displacementMap,ye=!!v.emissiveMap,pe=!!v.metalnessMap,J=!!v.roughnessMap,U=v.anisotropy>0,Te=v.clearcoat>0,Ae=v.dispersion>0,D=v.retroreflectivity>0,S=v.iridescence>0,G=v.sheen>0,Z=v.transmission>0,ie=U&&!!v.anisotropyMap,me=Te&&!!v.clearcoatMap,we=Te&&!!v.clearcoatNormalMap,ae=Te&&!!v.clearcoatRoughnessMap,le=S&&!!v.iridescenceMap,Re=S&&!!v.iridescenceThicknessMap,Ne=G&&!!v.sheenColorMap,Ee=G&&!!v.sheenRoughnessMap,Me=!!v.specularMap,Ge=!!v.specularColorMap,Ke=!!v.specularIntensityMap,at=Z&&!!v.transmissionMap,$=Z&&!!v.thicknessMap,be=!!v.gradientMap,fe=!!v.alphaMap,De=v.alphaTest>0,Be=!!v.alphaHash,ge=!!v.extensions;let qe=ys;v.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(qe=t.toneMapping);const $e={shaderID:Q,shaderType:v.type,shaderName:v.name,vertexShader:et,fragmentShader:We,defines:v.defines,customVertexShaderID:de,customFragmentShaderID:K,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:h,batching:Ce,batchingColor:Ce&&M._colorsTexture!==null,instancing:Fe,instancingColor:Fe&&M.instanceColor!==null,instancingMorph:Fe&&M.morphTexture!==null,outputColorSpace:j===null?t.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:bt.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Ze,matcap:N,envMap:k,envMapMode:k&&H.mapping,envMapCubeUVHeight:Y,aoMap:ee,lightMap:ce,bumpMap:oe,normalMap:ue,displacementMap:xe,emissiveMap:ye,normalMapObjectSpace:ue&&v.normalMapType===UT,normalMapTangentSpace:ue&&v.normalMapType===lp,packedNormalMap:ue&&v.normalMapType===lp&&SF(v.normalMap.format),metalnessMap:pe,roughnessMap:J,anisotropy:U,anisotropyMap:ie,clearcoat:Te,clearcoatMap:me,clearcoatNormalMap:we,clearcoatRoughnessMap:ae,dispersion:Ae,retroreflection:D,iridescence:S,iridescenceMap:le,iridescenceThicknessMap:Re,sheen:G,sheenColorMap:Ne,sheenRoughnessMap:Ee,specularMap:Me,specularColorMap:Ge,specularIntensityMap:Ke,transmission:Z,transmissionMap:at,thicknessMap:$,gradientMap:be,opaque:v.transparent===!1&&v.blending===al&&v.alphaToCoverage===!1,alphaMap:fe,alphaTest:De,alphaHash:Be,combine:v.combine,mapUv:Ze&&m(v.map.channel),aoMapUv:ee&&m(v.aoMap.channel),lightMapUv:ce&&m(v.lightMap.channel),bumpMapUv:oe&&m(v.bumpMap.channel),normalMapUv:ue&&m(v.normalMap.channel),displacementMapUv:xe&&m(v.displacementMap.channel),emissiveMapUv:ye&&m(v.emissiveMap.channel),metalnessMapUv:pe&&m(v.metalnessMap.channel),roughnessMapUv:J&&m(v.roughnessMap.channel),anisotropyMapUv:ie&&m(v.anisotropyMap.channel),clearcoatMapUv:me&&m(v.clearcoatMap.channel),clearcoatNormalMapUv:we&&m(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ae&&m(v.clearcoatRoughnessMap.channel),iridescenceMapUv:le&&m(v.iridescenceMap.channel),iridescenceThicknessMapUv:Re&&m(v.iridescenceThicknessMap.channel),sheenColorMapUv:Ne&&m(v.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&m(v.sheenRoughnessMap.channel),specularMapUv:Me&&m(v.specularMap.channel),specularColorMapUv:Ge&&m(v.specularColorMap.channel),specularIntensityMapUv:Ke&&m(v.specularIntensityMap.channel),transmissionMapUv:at&&m(v.transmissionMap.channel),thicknessMapUv:$&&m(v.thicknessMap.channel),alphaMapUv:fe&&m(v.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(ue||U),vertexNormals:!!B.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:M.isPoints===!0&&!!B.attributes.uv&&(Ze||fe),fog:!!F,useFog:v.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||B.attributes.normal===void 0&&ue===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:_e,skinning:M.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:q,morphTextureStride:he,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:I.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:t.shadowMap.enabled&&R.length>0,shadowMapType:t.shadowMap.type,toneMapping:qe,decodeVideoTexture:Ze&&v.map.isVideoTexture===!0&&bt.getTransfer(v.map.colorSpace)===Ut,decodeVideoTextureEmissive:ye&&v.emissiveMap.isVideoTexture===!0&&bt.getTransfer(v.emissiveMap.colorSpace)===Ut,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===$s,flipSided:v.side===pi,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:ge&&v.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ge&&v.extensions.multiDraw===!0||Ce)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return $e.vertexUv1s=l.has(1),$e.vertexUv2s=l.has(2),$e.vertexUv3s=l.has(3),l.clear(),$e}function _(v){const A=[];if(v.shaderID?A.push(v.shaderID):(A.push(v.customVertexShaderID),A.push(v.customFragmentShaderID)),v.defines!==void 0)for(const R in v.defines)A.push(R),A.push(v.defines[R]);return v.isRawShaderMaterial===!1&&(p(A,v),b(A,v),A.push(t.outputColorSpace)),A.push(v.customProgramCacheKey),A.join()}function p(v,A){v.push(A.precision),v.push(A.outputColorSpace),v.push(A.envMapMode),v.push(A.envMapCubeUVHeight),v.push(A.mapUv),v.push(A.alphaMapUv),v.push(A.lightMapUv),v.push(A.aoMapUv),v.push(A.bumpMapUv),v.push(A.normalMapUv),v.push(A.displacementMapUv),v.push(A.emissiveMapUv),v.push(A.metalnessMapUv),v.push(A.roughnessMapUv),v.push(A.anisotropyMapUv),v.push(A.clearcoatMapUv),v.push(A.clearcoatNormalMapUv),v.push(A.clearcoatRoughnessMapUv),v.push(A.iridescenceMapUv),v.push(A.iridescenceThicknessMapUv),v.push(A.sheenColorMapUv),v.push(A.sheenRoughnessMapUv),v.push(A.specularMapUv),v.push(A.specularColorMapUv),v.push(A.specularIntensityMapUv),v.push(A.transmissionMapUv),v.push(A.thicknessMapUv),v.push(A.combine),v.push(A.fogExp2),v.push(A.sizeAttenuation),v.push(A.morphTargetsCount),v.push(A.morphAttributeCount),v.push(A.numSunLights),v.push(A.numDirLights),v.push(A.numPointLights),v.push(A.numSpotLights),v.push(A.numSpotLightMaps),v.push(A.numHemiLights),v.push(A.numRectAreaLights),v.push(A.numSunLightShadows),v.push(A.numDirLightShadows),v.push(A.numPointLightShadows),v.push(A.numSpotLightShadows),v.push(A.numSpotLightShadowsWithMaps),v.push(A.numLightProbes),v.push(A.shadowMapType),v.push(A.toneMapping),v.push(A.numClippingPlanes),v.push(A.numClipIntersection),v.push(A.depthPacking)}function b(v,A){o.disableAll(),A.instancing&&o.enable(0),A.instancingColor&&o.enable(1),A.instancingMorph&&o.enable(2),A.matcap&&o.enable(3),A.envMap&&o.enable(4),A.normalMapObjectSpace&&o.enable(5),A.normalMapTangentSpace&&o.enable(6),A.clearcoat&&o.enable(7),A.iridescence&&o.enable(8),A.alphaTest&&o.enable(9),A.vertexColors&&o.enable(10),A.vertexAlphas&&o.enable(11),A.vertexUv1s&&o.enable(12),A.vertexUv2s&&o.enable(13),A.vertexUv3s&&o.enable(14),A.vertexTangents&&o.enable(15),A.anisotropy&&o.enable(16),A.alphaHash&&o.enable(17),A.batching&&o.enable(18),A.dispersion&&o.enable(19),A.retroreflection&&o.enable(24),A.batchingColor&&o.enable(20),A.gradientMap&&o.enable(21),A.packedNormalMap&&o.enable(22),A.vertexNormals&&o.enable(23),v.push(o.mask),o.disableAll(),A.fog&&o.enable(0),A.useFog&&o.enable(1),A.flatShading&&o.enable(2),A.logarithmicDepthBuffer&&o.enable(3),A.reversedDepthBuffer&&o.enable(4),A.skinning&&o.enable(5),A.morphTargets&&o.enable(6),A.morphNormals&&o.enable(7),A.morphColors&&o.enable(8),A.premultipliedAlpha&&o.enable(9),A.shadowMapEnabled&&o.enable(10),A.doubleSided&&o.enable(11),A.flipSided&&o.enable(12),A.useDepthPacking&&o.enable(13),A.dithering&&o.enable(14),A.transmission&&o.enable(15),A.sheen&&o.enable(16),A.opaque&&o.enable(17),A.pointsUvs&&o.enable(18),A.decodeVideoTexture&&o.enable(19),A.decodeVideoTextureEmissive&&o.enable(20),A.alphaToCoverage&&o.enable(21),A.numLightProbeGrids>0&&o.enable(22),A.hasPositionAttribute&&o.enable(23),v.push(o.mask)}function y(v){const A=d[v.type];let R;if(A){const L=ms[A];R=kw.clone(L.uniforms)}else R=v.uniforms;return R}function g(v,A){let R=c.get(A);return R!==void 0?++R.usedTimes:(R=new vF(t,A,v,s),u.push(R),c.set(A,R)),R}function E(v){if(--v.usedTimes===0){const A=u.indexOf(v);u[A]=u[u.length-1],u.pop(),c.delete(v.cacheKey),v.destroy()}}function T(v){a.remove(v)}function C(){a.dispose()}return{getParameters:x,getProgramCacheKey:_,getUniforms:y,acquireProgram:g,releaseProgram:E,releaseShaderCache:T,programs:u,dispose:C}}function MF(){let t=new WeakMap;function e(o){return t.has(o)}function n(o){let a=t.get(o);return a===void 0&&(a={},t.set(o,a)),a}function i(o){t.delete(o)}function s(o,a,l){t.get(o)[a]=l}function r(){t=new WeakMap}return{has:e,get:n,remove:i,update:s,dispose:r}}function AF(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.materialVariant!==e.materialVariant?t.materialVariant-e.materialVariant:t.z!==e.z?t.z-e.z:t.id-e.id}function jg(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function Qg(){const t=[];let e=0;const n=[],i=[],s=[];function r(){e=0,n.length=0,i.length=0,s.length=0}function o(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function a(h,d,m,x,_,p){let b=t[e];return b===void 0?(b={id:h.id,object:h,geometry:d,material:m,materialVariant:o(h),groupOrder:x,renderOrder:h.renderOrder,z:_,group:p},t[e]=b):(b.id=h.id,b.object=h,b.geometry=d,b.material=m,b.materialVariant=o(h),b.groupOrder=x,b.renderOrder=h.renderOrder,b.z=_,b.group=p),e++,b}function l(h,d,m,x,_,p,b){b.reversedDepth===!0&&(_=-_);const y=a(h,d,m,x,_,p);m.transmission>0?i.push(y):m.transparent===!0?s.push(y):n.push(y)}function u(h,d,m,x,_,p){const b=a(h,d,m,x,_,p);m.transmission>0?i.unshift(b):m.transparent===!0?s.unshift(b):n.unshift(b)}function c(h,d){n.length>1&&n.sort(h||AF),i.length>1&&i.sort(d||jg),s.length>1&&s.sort(d||jg)}function f(){for(let h=e,d=t.length;h<d;h++){const m=t[h];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:n,transmissive:i,transparent:s,init:r,push:l,unshift:u,finish:f,sort:c}}function TF(){let t=new WeakMap;function e(i,s){const r=t.get(i);let o;return r===void 0?(o=new Qg,t.set(i,[o])):s>=r.length?(o=new Qg,r.push(o)):o=r[s],o}function n(){t=new WeakMap}return{get:e,dispose:n}}function wF(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"SunLight":case"DirectionalLight":n={direction:new X,color:new St};break;case"SpotLight":n={position:new X,direction:new X,color:new St,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new X,color:new St,distance:0,decay:0};break;case"HemisphereLight":n={direction:new X,skyColor:new St,groundColor:new St};break;case"RectAreaLight":n={color:new St,position:new X,halfWidth:new X,halfHeight:new X};break}return t[e.id]=n,n}}}function CF(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"SunLight":case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ye};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ye};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ye,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let RF=0;function FF(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function DF(t){const e=new wF,n=CF(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)i.probe.push(new X);const s=new X,r=new Zt,o=new Zt;function a(u){let c=0,f=0,h=0;for(let M=0;M<9;M++)i.probe[M].set(0,0,0);let d=0,m=0,x=0,_=0,p=0,b=0,y=0,g=0,E=0,T=0,C=0,v=0,A=0,R=0;u.sort(FF);for(let M=0,I=u.length;M<I;M++){const F=u[M],B=F.color,O=F.intensity,z=F.distance;let H=null;if(F.shadow&&F.shadow.map&&(F.shadow.map.texture.format===_o?H=F.shadow.map.texture:H=F.shadow.map.depthTexture||F.shadow.map.texture),F.isAmbientLight)c+=B.r*O,f+=B.g*O,h+=B.b*O;else if(F.isLightProbe){for(let Y=0;Y<9;Y++)i.probe[Y].addScaledVector(F.sh.coefficients[Y],O);R++}else if(F.isSunLight){const Y=e.get(F);if(Y.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const Q=F.shadow,se=n.get(F);se.shadowIntensity=Q.intensity,se.shadowBias=Q.bias,se.shadowNormalBias=Q.normalBias,se.shadowRadius=Q.radius,se.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()),i.sunShadow[m]=se,i.sunShadowMap[m]=H;const q=Q.getViewportCount();for(let he=0;he<q;he++)i.sunShadowMatrix[x+he]=Q.getMatrix(he),i.sunShadowCascade[x+he]=Q._cascadeData[he];x+=q,m++}i.sun[d]=Y,d++}else if(F.isDirectionalLight){const Y=e.get(F);if(Y.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){const Q=F.shadow,se=n.get(F);se.shadowIntensity=Q.intensity,se.shadowBias=Q.bias,se.shadowNormalBias=Q.normalBias,se.shadowRadius=Q.radius,se.shadowMapSize=Q.mapSize,i.directionalShadow[_]=se,i.directionalShadowMap[_]=H,i.directionalShadowMatrix[_]=F.shadow.matrix,E++}i.directional[_]=Y,_++}else if(F.isSpotLight){const Y=e.get(F);Y.position.setFromMatrixPosition(F.matrixWorld),Y.color.copy(B).multiplyScalar(O),Y.distance=z,Y.coneCos=Math.cos(F.angle),Y.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),Y.decay=F.decay,i.spot[b]=Y;const Q=F.shadow;if(F.map&&(i.spotLightMap[v]=F.map,v++,Q.updateMatrices(F),F.castShadow&&A++),i.spotLightMatrix[b]=Q.matrix,F.castShadow){const se=n.get(F);se.shadowIntensity=Q.intensity,se.shadowBias=Q.bias,se.shadowNormalBias=Q.normalBias,se.shadowRadius=Q.radius,se.shadowMapSize=Q.mapSize,i.spotShadow[b]=se,i.spotShadowMap[b]=H,C++}b++}else if(F.isRectAreaLight){const Y=e.get(F);Y.color.copy(B).multiplyScalar(O),Y.halfWidth.set(F.width*.5,0,0),Y.halfHeight.set(0,F.height*.5,0),i.rectArea[y]=Y,y++}else if(F.isPointLight){const Y=e.get(F);if(Y.color.copy(F.color).multiplyScalar(F.intensity),Y.distance=F.distance,Y.decay=F.decay,F.castShadow){const Q=F.shadow,se=n.get(F);se.shadowIntensity=Q.intensity,se.shadowBias=Q.bias,se.shadowNormalBias=Q.normalBias,se.shadowRadius=Q.radius,se.shadowMapSize=Q.mapSize,se.shadowCameraNear=Q.camera.near,se.shadowCameraFar=Q.camera.far,i.pointShadow[p]=se,i.pointShadowMap[p]=H,i.pointShadowMatrix[p]=F.shadow.matrix,T++}i.point[p]=Y,p++}else if(F.isHemisphereLight){const Y=e.get(F);Y.skyColor.copy(F.color).multiplyScalar(O),Y.groundColor.copy(F.groundColor).multiplyScalar(O),i.hemi[g]=Y,g++}}y>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Le.LTC_FLOAT_1,i.rectAreaLTC2=Le.LTC_FLOAT_2):(i.rectAreaLTC1=Le.LTC_HALF_1,i.rectAreaLTC2=Le.LTC_HALF_2)),i.ambient[0]=c,i.ambient[1]=f,i.ambient[2]=h;const L=i.hash;(L.sunLength!==d||L.directionalLength!==_||L.pointLength!==p||L.spotLength!==b||L.rectAreaLength!==y||L.hemiLength!==g||L.numSunShadows!==m||L.numDirectionalShadows!==E||L.numPointShadows!==T||L.numSpotShadows!==C||L.numSpotMaps!==v||L.numLightProbes!==R)&&(i.sun.length=d,i.directional.length=_,i.spot.length=b,i.rectArea.length=y,i.point.length=p,i.hemi.length=g,i.sunShadow.length=m,i.sunShadowMap.length=m,i.sunShadowMatrix.length=x,i.sunShadowCascade.length=x,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.directionalShadowMatrix.length=E,i.pointShadow.length=T,i.pointShadowMap.length=T,i.pointShadowMatrix.length=T,i.spotShadow.length=C,i.spotShadowMap.length=C,i.spotLightMatrix.length=C+v-A,i.spotLightMap.length=v,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=R,L.sunLength=d,L.directionalLength=_,L.pointLength=p,L.spotLength=b,L.rectAreaLength=y,L.hemiLength=g,L.numSunShadows=m,L.numDirectionalShadows=E,L.numPointShadows=T,L.numSpotShadows=C,L.numSpotMaps=v,L.numLightProbes=R,i.version=RF++)}function l(u,c){let f=0,h=0,d=0,m=0,x=0,_=0;const p=c.matrixWorldInverse;for(let b=0,y=u.length;b<y;b++){const g=u[b];if(g.isSunLight){const E=i.sun[f];E.direction.setFromMatrixPosition(g.matrixWorld),E.direction.transformDirection(p),f++}else if(g.isDirectionalLight){const E=i.directional[h];E.direction.setFromMatrixPosition(g.matrixWorld),s.setFromMatrixPosition(g.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),h++}else if(g.isSpotLight){const E=i.spot[m];E.position.setFromMatrixPosition(g.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(g.matrixWorld),s.setFromMatrixPosition(g.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),m++}else if(g.isRectAreaLight){const E=i.rectArea[x];E.position.setFromMatrixPosition(g.matrixWorld),E.position.applyMatrix4(p),o.identity(),r.copy(g.matrixWorld),r.premultiply(p),o.extractRotation(r),E.halfWidth.set(g.width*.5,0,0),E.halfHeight.set(0,g.height*.5,0),E.halfWidth.applyMatrix4(o),E.halfHeight.applyMatrix4(o),x++}else if(g.isPointLight){const E=i.point[d];E.position.setFromMatrixPosition(g.matrixWorld),E.position.applyMatrix4(p),d++}else if(g.isHemisphereLight){const E=i.hemi[_];E.direction.setFromMatrixPosition(g.matrixWorld),E.direction.transformDirection(p),_++}}}return{setup:a,setupView:l,state:i}}function e_(t){const e=new DF(t),n=[],i=[],s=[];function r(h){f.camera=h,n.length=0,i.length=0,s.length=0}function o(h){n.push(h)}function a(h){i.push(h)}function l(h){s.push(h)}function u(){e.setup(n)}function c(h){e.setupView(n,h)}const f={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:f,setupLights:u,setupLightsView:c,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function PF(t){let e=new WeakMap;function n(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new e_(t),e.set(s,[a])):r>=o.length?(a=new e_(t),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:n,dispose:i}}const IF=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,LF=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,NF=[new X(1,0,0),new X(-1,0,0),new X(0,1,0),new X(0,-1,0),new X(0,0,1),new X(0,0,-1)],BF=[new X(0,-1,0),new X(0,-1,0),new X(0,0,1),new X(0,0,-1),new X(0,-1,0),new X(0,-1,0)],t_=new Zt,Ga=new X,Hh=new X;function UF(t,e,n){let i=new Cm;const s=new Ye,r=new Ye,o=new sn,a=new Gw,l=new Ww,u={},c=n.maxTextureSize,f={[mo]:pi,[pi]:mo,[$s]:$s},h=new Cs({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ye},radius:{value:4}},vertexShader:IF,fragmentShader:LF}),d=h.clone();d.defines.HORIZONTAL_PASS=1;const m=new In;m.setAttribute("position",new Es(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new Jt(m,h),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Qu;let p=this.type;this.render=function(T,C,v){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||T.length===0)return;this.type===pT&&(ot("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Qu);const A=t.getRenderTarget(),R=t.getActiveCubeFace(),L=t.getActiveMipmapLevel(),M=t.state;M.setBlending(er),M.buffers.depth.getReversed()===!0?M.buffers.color.setClear(0,0,0,0):M.buffers.color.setClear(1,1,1,1),M.buffers.depth.setTest(!0),M.setScissorTest(!1);const I=p!==this.type;I&&C.traverse(function(F){F.material&&(Array.isArray(F.material)?F.material.forEach(B=>B.needsUpdate=!0):F.material.needsUpdate=!0)});for(let F=0,B=T.length;F<B;F++){const O=T[F],z=O.shadow;if(z===void 0){ot("WebGLShadowMap:",O,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);const H=z.getFrameExtents();s.multiply(H),r.copy(z.mapSize),(s.x>c||s.y>c)&&(s.x>c&&(r.x=Math.floor(c/H.x),s.x=r.x*H.x,z.mapSize.x=r.x),s.y>c&&(r.y=Math.floor(c/H.y),s.y=r.y*H.y,z.mapSize.y=r.y));const Y=t.state.buffers.depth.getReversed();if(z.camera._reversedDepth=Y,z.map===null||I===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===Za){if(O.isPointLight){ot("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new es(s.x,s.y,{format:_o,type:ws,minFilter:Hn,magFilter:Hn,generateMipmaps:!1}),z.map.texture.name=O.name+".shadowMap",z.map.depthTexture=new Nl(s.x,s.y,_s),z.map.depthTexture.name=O.name+".shadowMapDepth",z.map.depthTexture.format=or,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Dn,z.map.depthTexture.magFilter=Dn}else O.isPointLight?(z.map=new cy(s.x),z.map.depthTexture=new Uw(s.x,Ts)):(z.map=new es(s.x,s.y),z.map.depthTexture=new Nl(s.x,s.y,Ts)),z.map.depthTexture.name=O.name+".shadowMap",z.map.depthTexture.format=or,this.type===Qu?(z.map.depthTexture.compareFunction=Y?Mm:bm,z.map.depthTexture.minFilter=Hn,z.map.depthTexture.magFilter=Hn):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Dn,z.map.depthTexture.magFilter=Dn);z.camera.updateProjectionMatrix()}z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==s.x||z.map.height!==s.y)&&z.map.setSize(s.x,s.y);const Q=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();O.isPointLight!==!0&&z.updateMatrices(O,v);for(let se=0;se<Q;se++){const q=z.getCamera(se);if(O.isPointLight){const he=z.camera,et=z.matrix,We=O.distance||he.far;We!==he.far&&(he.far=We,he.updateProjectionMatrix()),Ga.setFromMatrixPosition(O.matrixWorld),he.position.copy(Ga),Hh.copy(he.position),Hh.add(NF[se]),he.up.copy(BF[se]),he.lookAt(Hh),he.updateMatrixWorld(),et.makeTranslation(-Ga.x,-Ga.y,-Ga.z),t_.multiplyMatrices(he.projectionMatrix,he.matrixWorldInverse),z._frustum.setFromProjectionMatrix(t_,he.coordinateSystem,he.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)t.setRenderTarget(z.map,se),t.clear();else{se===0&&(t.setRenderTarget(z.map),t.clear());const he=z.getViewport(se);o.set(r.x*he.x,r.y*he.y,r.x*he.z,r.y*he.w),M.viewport(o)}i=z.getFrustum(se),g(C,v,q,O,this.type)}z.isPointLightShadow!==!0&&this.type===Za&&b(z,v),z.needsUpdate=!1}p=this.type,_.needsUpdate=!1,t.setRenderTarget(A,R,L)};function b(T,C){const v=e.update(x);h.defines.VSM_SAMPLES!==T.blurSamples&&(h.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null?T.mapPass=new es(s.x,s.y,{format:_o,type:ws}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),h.uniforms.shadow_pass.value=T.map.depthTexture,h.uniforms.resolution.value.set(T.map.width,T.map.height),h.uniforms.radius.value=T.radius,t.setRenderTarget(T.mapPass),t.clear(),t.renderBufferDirect(C,null,v,h,x,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,t.setRenderTarget(T.map),t.clear(),t.renderBufferDirect(C,null,v,d,x,null)}function y(T,C,v,A){let R=null;const L=v.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(L!==void 0)R=L;else if(R=v.isPointLight===!0?l:a,t.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){const M=R.uuid,I=C.uuid;let F=u[M];F===void 0&&(F={},u[M]=F);let B=F[I];B===void 0&&(B=R.clone(),F[I]=B,C.addEventListener("dispose",E)),R=B}if(R.visible=C.visible,R.wireframe=C.wireframe,A===Za?R.side=C.shadowSide!==null?C.shadowSide:C.side:R.side=C.shadowSide!==null?C.shadowSide:f[C.side],R.alphaMap=C.alphaMap,R.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,R.map=C.map,R.clipShadows=C.clipShadows,R.clippingPlanes=C.clippingPlanes,R.clipIntersection=C.clipIntersection,R.displacementMap=C.displacementMap,R.displacementScale=C.displacementScale,R.displacementBias=C.displacementBias,R.wireframeLinewidth=C.wireframeLinewidth,R.linewidth=C.linewidth,v.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const M=t.properties.get(R);M.light=v}return R}function g(T,C,v,A,R){if(T.visible===!1)return;if(T.layers.test(C.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&R===Za)&&(!T.frustumCulled||T.intersectsFrustum(i))){T.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,T.matrixWorld);const I=e.update(T),F=T.material;if(Array.isArray(F)){const B=I.groups;for(let O=0,z=B.length;O<z;O++){const H=B[O],Y=F[H.materialIndex];if(Y&&Y.visible){const Q=y(T,Y,A,R);T.onBeforeShadow(t,T,C,v,I,Q,H),t.renderBufferDirect(v,null,I,Q,T,H),T.onAfterShadow(t,T,C,v,I,Q,H)}}}else if(F.visible){const B=y(T,F,A,R);T.onBeforeShadow(t,T,C,v,I,B,null),t.renderBufferDirect(v,null,I,B,T,null),T.onAfterShadow(t,T,C,v,I,B,null)}}const M=T.children;for(let I=0,F=M.length;I<F;I++)g(M[I],C,v,A,R)}function E(T){T.target.removeEventListener("dispose",E);for(const v in u){const A=u[v],R=T.target.uuid;R in A&&(A[R].dispose(),delete A[R])}}}function OF(t,e){function n(){let $=!1;const be=new sn;let fe=null;const De=new sn(0,0,0,0);return{setMask:function(Be){fe!==Be&&!$&&(t.colorMask(Be,Be,Be,Be),fe=Be)},setLocked:function(Be){$=Be},setClear:function(Be,ge,qe,$e,Ht){Ht===!0&&(Be*=$e,ge*=$e,qe*=$e),be.set(Be,ge,qe,$e),De.equals(be)===!1&&(t.clearColor(Be,ge,qe,$e),De.copy(be))},reset:function(){$=!1,fe=null,De.set(-1,0,0,0)}}}function i(){let $=!1,be=!1,fe=null,De=null,Be=null;return{setReversed:function(ge){if(be!==ge){const qe=e.get("EXT_clip_control");ge?qe.clipControlEXT(qe.LOWER_LEFT_EXT,qe.ZERO_TO_ONE_EXT):qe.clipControlEXT(qe.LOWER_LEFT_EXT,qe.NEGATIVE_ONE_TO_ONE_EXT),be=ge;const $e=Be;Be=null,this.setClear($e)}},getReversed:function(){return be},setTest:function(ge){ge?j(t.DEPTH_TEST):_e(t.DEPTH_TEST)},setMask:function(ge){fe!==ge&&!$&&(t.depthMask(ge),fe=ge)},setFunc:function(ge){if(be&&(ge=YT[ge]),De!==ge){switch(ge){case bd:t.depthFunc(t.NEVER);break;case Md:t.depthFunc(t.ALWAYS);break;case Ad:t.depthFunc(t.LESS);break;case Rl:t.depthFunc(t.LEQUAL);break;case Td:t.depthFunc(t.EQUAL);break;case wd:t.depthFunc(t.GEQUAL);break;case Cd:t.depthFunc(t.GREATER);break;case Rd:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}De=ge}},setLocked:function(ge){$=ge},setClear:function(ge){Be!==ge&&(Be=ge,be&&(ge=1-ge),t.clearDepth(ge))},reset:function(){$=!1,fe=null,De=null,Be=null,be=!1}}}function s(){let $=!1,be=null,fe=null,De=null,Be=null,ge=null,qe=null,$e=null,Ht=null;return{setTest:function(Mt){$||(Mt?j(t.STENCIL_TEST):_e(t.STENCIL_TEST))},setMask:function(Mt){be!==Mt&&!$&&(t.stencilMask(Mt),be=Mt)},setFunc:function(Mt,ei,ti){(fe!==Mt||De!==ei||Be!==ti)&&(t.stencilFunc(Mt,ei,ti),fe=Mt,De=ei,Be=ti)},setOp:function(Mt,ei,ti){(ge!==Mt||qe!==ei||$e!==ti)&&(t.stencilOp(Mt,ei,ti),ge=Mt,qe=ei,$e=ti)},setLocked:function(Mt){$=Mt},setClear:function(Mt){Ht!==Mt&&(t.clearStencil(Mt),Ht=Mt)},reset:function(){$=!1,be=null,fe=null,De=null,Be=null,ge=null,qe=null,$e=null,Ht=null}}}const r=new n,o=new i,a=new s,l=new WeakMap,u=new WeakMap;let c={},f={},h={},d=new WeakMap,m=[],x=null,_=!1,p=null,b=null,y=null,g=null,E=null,T=null,C=null,v=new St(0,0,0),A=0,R=!1,L=null,M=null,I=null,F=null,B=null;const O=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,H=0;const Y=t.getParameter(t.VERSION);Y.indexOf("WebGL")!==-1?(H=parseFloat(/^WebGL (\d)/.exec(Y)[1]),z=H>=1):Y.indexOf("OpenGL ES")!==-1&&(H=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),z=H>=2);let Q=null,se={};const q=t.getParameter(t.SCISSOR_BOX),he=t.getParameter(t.VIEWPORT),et=new sn().fromArray(q),We=new sn().fromArray(he);function de($,be,fe,De){const Be=new Uint8Array(4),ge=t.createTexture();t.bindTexture($,ge),t.texParameteri($,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri($,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let qe=0;qe<fe;qe++)$===t.TEXTURE_3D||$===t.TEXTURE_2D_ARRAY?t.texImage3D(be,0,t.RGBA,1,1,De,0,t.RGBA,t.UNSIGNED_BYTE,Be):t.texImage2D(be+qe,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,Be);return ge}const K={};K[t.TEXTURE_2D]=de(t.TEXTURE_2D,t.TEXTURE_2D,1),K[t.TEXTURE_CUBE_MAP]=de(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),K[t.TEXTURE_2D_ARRAY]=de(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),K[t.TEXTURE_3D]=de(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),j(t.DEPTH_TEST),o.setFunc(Rl),oe(!1),ue(Q0),j(t.CULL_FACE),ee(er);function j($){c[$]!==!0&&(t.enable($),c[$]=!0)}function _e($){c[$]!==!1&&(t.disable($),c[$]=!1)}function Fe($,be){return h[$]!==be?(t.bindFramebuffer($,be),h[$]=be,$===t.DRAW_FRAMEBUFFER&&(h[t.FRAMEBUFFER]=be),$===t.FRAMEBUFFER&&(h[t.DRAW_FRAMEBUFFER]=be),!0):!1}function Ce($,be){let fe=m,De=!1;if($){fe=d.get(be),fe===void 0&&(fe=[],d.set(be,fe));const Be=$.textures;if(fe.length!==Be.length||fe[0]!==t.COLOR_ATTACHMENT0){for(let ge=0,qe=Be.length;ge<qe;ge++)fe[ge]=t.COLOR_ATTACHMENT0+ge;fe.length=Be.length,De=!0}}else fe[0]!==t.BACK&&(fe[0]=t.BACK,De=!0);De&&t.drawBuffers(fe)}function Ze($){return x!==$?(t.useProgram($),x=$,!0):!1}const N={[qo]:t.FUNC_ADD,[gT]:t.FUNC_SUBTRACT,[_T]:t.FUNC_REVERSE_SUBTRACT};N[vT]=t.MIN,N[xT]=t.MAX;const k={[yT]:t.ZERO,[ET]:t.ONE,[ST]:t.SRC_COLOR,[R1]:t.SRC_ALPHA,[CT]:t.SRC_ALPHA_SATURATE,[TT]:t.DST_COLOR,[MT]:t.DST_ALPHA,[bT]:t.ONE_MINUS_SRC_COLOR,[F1]:t.ONE_MINUS_SRC_ALPHA,[wT]:t.ONE_MINUS_DST_COLOR,[AT]:t.ONE_MINUS_DST_ALPHA,[RT]:t.CONSTANT_COLOR,[FT]:t.ONE_MINUS_CONSTANT_COLOR,[DT]:t.CONSTANT_ALPHA,[PT]:t.ONE_MINUS_CONSTANT_ALPHA};function ee($,be,fe,De,Be,ge,qe,$e,Ht,Mt){if($===er){_===!0&&(_e(t.BLEND),_=!1);return}if(_===!1&&(j(t.BLEND),_=!0),$!==mT){if($!==p||Mt!==R){if((b!==qo||E!==qo)&&(t.blendEquation(t.FUNC_ADD),b=qo,E=qo),Mt)switch($){case al:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case eg:t.blendFunc(t.ONE,t.ONE);break;case tg:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case ng:t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ZERO,t.ONE);break;default:At("WebGLState: Invalid blending: ",$);break}else switch($){case al:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case eg:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE,t.ONE,t.ONE);break;case tg:At("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ng:At("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:At("WebGLState: Invalid blending: ",$);break}y=null,g=null,T=null,C=null,v.set(0,0,0),A=0,p=$,R=Mt}return}Be=Be||be,ge=ge||fe,qe=qe||De,(be!==b||Be!==E)&&(t.blendEquationSeparate(N[be],N[Be]),b=be,E=Be),(fe!==y||De!==g||ge!==T||qe!==C)&&(t.blendFuncSeparate(k[fe],k[De],k[ge],k[qe]),y=fe,g=De,T=ge,C=qe),($e.equals(v)===!1||Ht!==A)&&(t.blendColor($e.r,$e.g,$e.b,Ht),v.copy($e),A=Ht),p=$,R=!1}function ce($,be){$.side===$s?_e(t.CULL_FACE):j(t.CULL_FACE);let fe=$.side===pi;be&&(fe=!fe),oe(fe),$.blending===al&&$.transparent===!1?ee(er):ee($.blending,$.blendEquation,$.blendSrc,$.blendDst,$.blendEquationAlpha,$.blendSrcAlpha,$.blendDstAlpha,$.blendColor,$.blendAlpha,$.premultipliedAlpha),o.setFunc($.depthFunc),o.setTest($.depthTest),o.setMask($.depthWrite),r.setMask($.colorWrite);const De=$.stencilWrite;a.setTest(De),De&&(a.setMask($.stencilWriteMask),a.setFunc($.stencilFunc,$.stencilRef,$.stencilFuncMask),a.setOp($.stencilFail,$.stencilZFail,$.stencilZPass)),ye($.polygonOffset,$.polygonOffsetFactor,$.polygonOffsetUnits),$.alphaToCoverage===!0?j(t.SAMPLE_ALPHA_TO_COVERAGE):_e(t.SAMPLE_ALPHA_TO_COVERAGE)}function oe($){L!==$&&($?t.frontFace(t.CW):t.frontFace(t.CCW),L=$)}function ue($){$!==hT?(j(t.CULL_FACE),$!==M&&($===Q0?t.cullFace(t.BACK):$===dT?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):_e(t.CULL_FACE),M=$}function xe($){$!==I&&(z&&t.lineWidth($),I=$)}function ye($,be,fe){$?(j(t.POLYGON_OFFSET_FILL),(F!==be||B!==fe)&&(F=be,B=fe,o.getReversed()&&(be=-be),t.polygonOffset(be,fe))):_e(t.POLYGON_OFFSET_FILL)}function pe($){$?j(t.SCISSOR_TEST):_e(t.SCISSOR_TEST)}function J($){$===void 0&&($=t.TEXTURE0+O-1),Q!==$&&(t.activeTexture($),Q=$)}function U($,be,fe){fe===void 0&&(Q===null?fe=t.TEXTURE0+O-1:fe=Q);let De=se[fe];De===void 0&&(De={type:void 0,texture:void 0},se[fe]=De),(De.type!==$||De.texture!==be)&&(Q!==fe&&(t.activeTexture(fe),Q=fe),t.bindTexture($,be||K[$]),De.type=$,De.texture=be)}function Te(){const $=se[Q];$!==void 0&&$.type!==void 0&&(t.bindTexture($.type,null),$.type=void 0,$.texture=void 0)}function Ae(){try{t.compressedTexImage2D(...arguments)}catch($){At("WebGLState:",$)}}function D(){try{t.compressedTexImage3D(...arguments)}catch($){At("WebGLState:",$)}}function S(){try{t.texSubImage2D(...arguments)}catch($){At("WebGLState:",$)}}function G(){try{t.texSubImage3D(...arguments)}catch($){At("WebGLState:",$)}}function Z(){try{t.compressedTexSubImage2D(...arguments)}catch($){At("WebGLState:",$)}}function ie(){try{t.compressedTexSubImage3D(...arguments)}catch($){At("WebGLState:",$)}}function me(){try{t.texStorage2D(...arguments)}catch($){At("WebGLState:",$)}}function we(){try{t.texStorage3D(...arguments)}catch($){At("WebGLState:",$)}}function ae(){try{t.texImage2D(...arguments)}catch($){At("WebGLState:",$)}}function le(){try{t.texImage3D(...arguments)}catch($){At("WebGLState:",$)}}function Re($){return f[$]!==void 0?f[$]:t.getParameter($)}function Ne($,be){f[$]!==be&&(t.pixelStorei($,be),f[$]=be)}function Ee($){et.equals($)===!1&&(t.scissor($.x,$.y,$.z,$.w),et.copy($))}function Me($){We.equals($)===!1&&(t.viewport($.x,$.y,$.z,$.w),We.copy($))}function Ge($,be){let fe=u.get(be);fe===void 0&&(fe=new WeakMap,u.set(be,fe));let De=fe.get($);De===void 0&&(De=t.getUniformBlockIndex(be,$.name),fe.set($,De))}function Ke($,be){const De=u.get(be).get($);l.get(be)!==De&&(t.uniformBlockBinding(be,De,$.__bindingPointIndex),l.set(be,De))}function at(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),o.setReversed(!1),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),t.pixelStorei(t.PACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,t.BROWSER_DEFAULT_WEBGL),t.pixelStorei(t.PACK_ROW_LENGTH,0),t.pixelStorei(t.PACK_SKIP_PIXELS,0),t.pixelStorei(t.PACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_ROW_LENGTH,0),t.pixelStorei(t.UNPACK_IMAGE_HEIGHT,0),t.pixelStorei(t.UNPACK_SKIP_PIXELS,0),t.pixelStorei(t.UNPACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_SKIP_IMAGES,0),c={},f={},Q=null,se={},h={},d=new WeakMap,m=[],x=null,_=!1,p=null,b=null,y=null,g=null,E=null,T=null,C=null,v=new St(0,0,0),A=0,R=!1,L=null,M=null,I=null,F=null,B=null,et.set(0,0,t.canvas.width,t.canvas.height),We.set(0,0,t.canvas.width,t.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:j,disable:_e,bindFramebuffer:Fe,drawBuffers:Ce,useProgram:Ze,setBlending:ee,setMaterial:ce,setFlipSided:oe,setCullFace:ue,setLineWidth:xe,setPolygonOffset:ye,setScissorTest:pe,activeTexture:J,bindTexture:U,unbindTexture:Te,compressedTexImage2D:Ae,compressedTexImage3D:D,texImage2D:ae,texImage3D:le,pixelStorei:Ne,getParameter:Re,updateUBOMapping:Ge,uniformBlockBinding:Ke,texStorage2D:me,texStorage3D:we,texSubImage2D:S,texSubImage3D:G,compressedTexSubImage2D:Z,compressedTexSubImage3D:ie,scissor:Ee,viewport:Me,reset:at}}function kF(t,e,n,i,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Ye,c=new WeakMap,f=new Set;let h;const d=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(D,S){return m?new OffscreenCanvas(D,S):$c("canvas")}function _(D,S,G){let Z=1;const ie=Ae(D);if((ie.width>G||ie.height>G)&&(Z=G/Math.max(ie.width,ie.height)),Z<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const me=Math.floor(Z*ie.width),we=Math.floor(Z*ie.height);h===void 0&&(h=x(me,we));const ae=S?x(me,we):h;return ae.width=me,ae.height=we,ae.getContext("2d").drawImage(D,0,0,me,we),ot("WebGLRenderer: Texture has been resized from ("+ie.width+"x"+ie.height+") to ("+me+"x"+we+")."),ae}else return"data"in D&&ot("WebGLRenderer: Image in DataTexture is too big ("+ie.width+"x"+ie.height+")."),D;return D}function p(D){return D.generateMipmaps}function b(D){t.generateMipmap(D)}function y(D){return D.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?t.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?t.TEXTURE_2D_ARRAY:t.TEXTURE_2D}function g(D,S,G,Z,ie,me=!1){if(D!==null){if(t[D]!==void 0)return t[D];ot("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let we;Z&&(we=e.get("EXT_texture_norm16"),we||ot("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ae=S;if(S===t.RED&&(G===t.FLOAT&&(ae=t.R32F),G===t.HALF_FLOAT&&(ae=t.R16F),G===t.UNSIGNED_BYTE&&(ae=t.R8),G===t.UNSIGNED_SHORT&&we&&(ae=we.R16_EXT),G===t.SHORT&&we&&(ae=we.R16_SNORM_EXT)),S===t.RED_INTEGER&&(G===t.UNSIGNED_BYTE&&(ae=t.R8UI),G===t.UNSIGNED_SHORT&&(ae=t.R16UI),G===t.UNSIGNED_INT&&(ae=t.R32UI),G===t.BYTE&&(ae=t.R8I),G===t.SHORT&&(ae=t.R16I),G===t.INT&&(ae=t.R32I)),S===t.RG&&(G===t.FLOAT&&(ae=t.RG32F),G===t.HALF_FLOAT&&(ae=t.RG16F),G===t.UNSIGNED_BYTE&&(ae=t.RG8),G===t.UNSIGNED_SHORT&&we&&(ae=we.RG16_EXT),G===t.SHORT&&we&&(ae=we.RG16_SNORM_EXT)),S===t.RG_INTEGER&&(G===t.UNSIGNED_BYTE&&(ae=t.RG8UI),G===t.UNSIGNED_SHORT&&(ae=t.RG16UI),G===t.UNSIGNED_INT&&(ae=t.RG32UI),G===t.BYTE&&(ae=t.RG8I),G===t.SHORT&&(ae=t.RG16I),G===t.INT&&(ae=t.RG32I)),S===t.RGB_INTEGER&&(G===t.UNSIGNED_BYTE&&(ae=t.RGB8UI),G===t.UNSIGNED_SHORT&&(ae=t.RGB16UI),G===t.UNSIGNED_INT&&(ae=t.RGB32UI),G===t.BYTE&&(ae=t.RGB8I),G===t.SHORT&&(ae=t.RGB16I),G===t.INT&&(ae=t.RGB32I)),S===t.RGBA_INTEGER&&(G===t.UNSIGNED_BYTE&&(ae=t.RGBA8UI),G===t.UNSIGNED_SHORT&&(ae=t.RGBA16UI),G===t.UNSIGNED_INT&&(ae=t.RGBA32UI),G===t.BYTE&&(ae=t.RGBA8I),G===t.SHORT&&(ae=t.RGBA16I),G===t.INT&&(ae=t.RGBA32I)),S===t.RGB&&(G===t.UNSIGNED_SHORT&&we&&(ae=we.RGB16_EXT),G===t.SHORT&&we&&(ae=we.RGB16_SNORM_EXT),G===t.UNSIGNED_INT_5_9_9_9_REV&&(ae=t.RGB9_E5),G===t.UNSIGNED_INT_10F_11F_11F_REV&&(ae=t.R11F_G11F_B10F)),S===t.RGBA){const le=me?Wc:bt.getTransfer(ie);G===t.FLOAT&&(ae=t.RGBA32F),G===t.HALF_FLOAT&&(ae=t.RGBA16F),G===t.UNSIGNED_BYTE&&(ae=le===Ut?t.SRGB8_ALPHA8:t.RGBA8),G===t.UNSIGNED_SHORT&&we&&(ae=we.RGBA16_EXT),G===t.SHORT&&we&&(ae=we.RGBA16_SNORM_EXT),G===t.UNSIGNED_SHORT_4_4_4_4&&(ae=t.RGBA4),G===t.UNSIGNED_SHORT_5_5_5_1&&(ae=t.RGB5_A1)}return(ae===t.R16F||ae===t.R32F||ae===t.RG16F||ae===t.RG32F||ae===t.RGBA16F||ae===t.RGBA32F)&&e.get("EXT_color_buffer_float"),ae}function E(D,S){let G;return D?S===null||S===Ts||S===Dl?G=t.DEPTH24_STENCIL8:S===_s?G=t.DEPTH32F_STENCIL8:S===Fl&&(G=t.DEPTH24_STENCIL8,ot("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Ts||S===Dl?G=t.DEPTH_COMPONENT24:S===_s?G=t.DEPTH_COMPONENT32F:S===Fl&&(G=t.DEPTH_COMPONENT16),G}function T(D,S){return p(D)===!0||D.isFramebufferTexture&&D.minFilter!==Dn&&D.minFilter!==Hn?Math.log2(Math.max(S.width,S.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?S.mipmaps.length:1}function C(D){const S=D.target;S.removeEventListener("dispose",C),A(S),S.isVideoTexture&&c.delete(S),S.isHTMLTexture&&f.delete(S)}function v(D){const S=D.target;S.removeEventListener("dispose",v),L(S)}function A(D){const S=i.get(D);if(S.__webglInit===void 0)return;const G=D.source,Z=d.get(G);if(Z){const ie=Z[S.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&R(D),Object.keys(Z).length===0&&d.delete(G)}i.remove(D)}function R(D){const S=i.get(D);t.deleteTexture(S.__webglTexture);const G=D.source,Z=d.get(G);delete Z[S.__cacheKey],o.memory.textures--}function L(D){const S=i.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),i.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(S.__webglFramebuffer[Z]))for(let ie=0;ie<S.__webglFramebuffer[Z].length;ie++)t.deleteFramebuffer(S.__webglFramebuffer[Z][ie]);else t.deleteFramebuffer(S.__webglFramebuffer[Z]);S.__webglDepthbuffer&&t.deleteRenderbuffer(S.__webglDepthbuffer[Z])}else{if(Array.isArray(S.__webglFramebuffer))for(let Z=0;Z<S.__webglFramebuffer.length;Z++)t.deleteFramebuffer(S.__webglFramebuffer[Z]);else t.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&t.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&t.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let Z=0;Z<S.__webglColorRenderbuffer.length;Z++)S.__webglColorRenderbuffer[Z]&&t.deleteRenderbuffer(S.__webglColorRenderbuffer[Z]);S.__webglDepthRenderbuffer&&t.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const G=D.textures;for(let Z=0,ie=G.length;Z<ie;Z++){const me=i.get(G[Z]);me.__webglTexture&&(t.deleteTexture(me.__webglTexture),o.memory.textures--),i.remove(G[Z])}i.remove(D)}let M=0;function I(){M=0}function F(){return M}function B(D){M=D}function O(){const D=M;return D>=s.maxTextures&&ot("WebGLTextures: Trying to use "+(D+1)+" texture units while this GPU supports only "+s.maxTextures),M+=1,D}function z(D){const S=[];return S.push(D.wrapS),S.push(D.wrapT),S.push(D.wrapR||0),S.push(D.magFilter),S.push(D.minFilter),S.push(D.anisotropy),S.push(D.internalFormat),S.push(D.format),S.push(D.type),S.push(D.generateMipmaps),S.push(D.premultiplyAlpha),S.push(D.flipY),S.push(D.unpackAlignment),S.push(D.colorSpace),S.join()}function H(D,S){const G=i.get(D);if(D.isVideoTexture&&U(D),D.isRenderTargetTexture===!1&&D.isExternalTexture!==!0&&D.version>0&&G.__version!==D.version){const Z=D.image;if(Z===null)ot("WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)ot("WebGLRenderer: Texture marked for update but image is incomplete");else{_e(G,D,S);return}}else D.isExternalTexture&&(G.__webglTexture=D.sourceTexture?D.sourceTexture:null);n.bindTexture(t.TEXTURE_2D,G.__webglTexture,t.TEXTURE0+S)}function Y(D,S){const G=i.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&G.__version!==D.version){_e(G,D,S);return}else D.isExternalTexture&&(G.__webglTexture=D.sourceTexture?D.sourceTexture:null);n.bindTexture(t.TEXTURE_2D_ARRAY,G.__webglTexture,t.TEXTURE0+S)}function Q(D,S){const G=i.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&G.__version!==D.version){_e(G,D,S);return}n.bindTexture(t.TEXTURE_3D,G.__webglTexture,t.TEXTURE0+S)}function se(D,S){const G=i.get(D);if(D.isCubeDepthTexture!==!0&&D.version>0&&G.__version!==D.version){Fe(G,D,S);return}n.bindTexture(t.TEXTURE_CUBE_MAP,G.__webglTexture,t.TEXTURE0+S)}const q={[Fd]:t.REPEAT,[qs]:t.CLAMP_TO_EDGE,[Dd]:t.MIRRORED_REPEAT},he={[Dn]:t.NEAREST,[NT]:t.NEAREST_MIPMAP_NEAREST,[vu]:t.NEAREST_MIPMAP_LINEAR,[Hn]:t.LINEAR,[hh]:t.LINEAR_MIPMAP_NEAREST,[eo]:t.LINEAR_MIPMAP_LINEAR},et={[kT]:t.NEVER,[WT]:t.ALWAYS,[zT]:t.LESS,[bm]:t.LEQUAL,[VT]:t.EQUAL,[Mm]:t.GEQUAL,[HT]:t.GREATER,[GT]:t.NOTEQUAL};function We(D,S){if(S.type===_s&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===Hn||S.magFilter===hh||S.magFilter===vu||S.magFilter===eo||S.minFilter===Hn||S.minFilter===hh||S.minFilter===vu||S.minFilter===eo)&&ot("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(D,t.TEXTURE_WRAP_S,q[S.wrapS]),t.texParameteri(D,t.TEXTURE_WRAP_T,q[S.wrapT]),(D===t.TEXTURE_3D||D===t.TEXTURE_2D_ARRAY)&&t.texParameteri(D,t.TEXTURE_WRAP_R,q[S.wrapR]),t.texParameteri(D,t.TEXTURE_MAG_FILTER,he[S.magFilter]),t.texParameteri(D,t.TEXTURE_MIN_FILTER,he[S.minFilter]),S.compareFunction&&(t.texParameteri(D,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(D,t.TEXTURE_COMPARE_FUNC,et[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Dn||S.minFilter!==vu&&S.minFilter!==eo||S.type===_s&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){const G=e.get("EXT_texture_filter_anisotropic");t.texParameterf(D,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function de(D,S){let G=!1;D.__webglInit===void 0&&(D.__webglInit=!0,S.addEventListener("dispose",C));const Z=S.source;let ie=d.get(Z);ie===void 0&&(ie={},d.set(Z,ie));const me=z(S);if(me!==D.__cacheKey){ie[me]===void 0&&(ie[me]={texture:t.createTexture(),usedTimes:0},o.memory.textures++,G=!0),ie[me].usedTimes++;const we=ie[D.__cacheKey];we!==void 0&&(ie[D.__cacheKey].usedTimes--,we.usedTimes===0&&R(S)),D.__cacheKey=me,D.__webglTexture=ie[me].texture}return G}function K(D,S,G){return Math.floor(Math.floor(D/G)/S)}function j(D,S,G,Z){const me=D.updateRanges;if(me.length===0)n.texSubImage2D(t.TEXTURE_2D,0,0,0,S.width,S.height,G,Z,S.data);else{me.sort((Ne,Ee)=>Ne.start-Ee.start);let we=0;for(let Ne=1;Ne<me.length;Ne++){const Ee=me[we],Me=me[Ne],Ge=Ee.start+Ee.count,Ke=K(Me.start,S.width,4),at=K(Ee.start,S.width,4);Me.start<=Ge+1&&Ke===at&&K(Me.start+Me.count-1,S.width,4)===Ke?Ee.count=Math.max(Ee.count,Me.start+Me.count-Ee.start):(++we,me[we]=Me)}me.length=we+1;const ae=n.getParameter(t.UNPACK_ROW_LENGTH),le=n.getParameter(t.UNPACK_SKIP_PIXELS),Re=n.getParameter(t.UNPACK_SKIP_ROWS);n.pixelStorei(t.UNPACK_ROW_LENGTH,S.width);for(let Ne=0,Ee=me.length;Ne<Ee;Ne++){const Me=me[Ne],Ge=Math.floor(Me.start/4),Ke=Math.ceil(Me.count/4),at=Ge%S.width,$=Math.floor(Ge/S.width),be=Ke,fe=1;n.pixelStorei(t.UNPACK_SKIP_PIXELS,at),n.pixelStorei(t.UNPACK_SKIP_ROWS,$),n.texSubImage2D(t.TEXTURE_2D,0,at,$,be,fe,G,Z,S.data)}D.clearUpdateRanges(),n.pixelStorei(t.UNPACK_ROW_LENGTH,ae),n.pixelStorei(t.UNPACK_SKIP_PIXELS,le),n.pixelStorei(t.UNPACK_SKIP_ROWS,Re)}}function _e(D,S,G){let Z=t.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(Z=t.TEXTURE_2D_ARRAY),S.isData3DTexture&&(Z=t.TEXTURE_3D);const ie=de(D,S),me=S.source;n.bindTexture(Z,D.__webglTexture,t.TEXTURE0+G);const we=i.get(me);if(me.version!==we.__version||ie===!0){if(n.activeTexture(t.TEXTURE0+G),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){const fe=bt.getPrimaries(bt.workingColorSpace),De=S.colorSpace===Mr?null:bt.getPrimaries(S.colorSpace),Be=S.colorSpace===Mr||fe===De?t.NONE:t.BROWSER_DEFAULT_WEBGL;n.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Be)}n.pixelStorei(t.UNPACK_ALIGNMENT,S.unpackAlignment);let le=_(S.image,!1,s.maxTextureSize);le=Te(S,le);const Re=r.convert(S.format,S.colorSpace),Ne=r.convert(S.type);let Ee=g(S.internalFormat,Re,Ne,S.normalized,S.colorSpace,S.isVideoTexture);We(Z,S);let Me;const Ge=S.mipmaps,Ke=S.isVideoTexture!==!0,at=we.__version===void 0||ie===!0,$=me.dataReady,be=T(S,le);if(S.isDepthTexture)Ee=E(S.format===to,S.type),at&&(Ke?n.texStorage2D(t.TEXTURE_2D,1,Ee,le.width,le.height):n.texImage2D(t.TEXTURE_2D,0,Ee,le.width,le.height,0,Re,Ne,null));else if(S.isDataTexture)if(Ge.length>0){Ke&&at&&n.texStorage2D(t.TEXTURE_2D,be,Ee,Ge[0].width,Ge[0].height);for(let fe=0,De=Ge.length;fe<De;fe++)Me=Ge[fe],Ke?$&&n.texSubImage2D(t.TEXTURE_2D,fe,0,0,Me.width,Me.height,Re,Ne,Me.data):n.texImage2D(t.TEXTURE_2D,fe,Ee,Me.width,Me.height,0,Re,Ne,Me.data);S.generateMipmaps=!1}else Ke?(at&&n.texStorage2D(t.TEXTURE_2D,be,Ee,le.width,le.height),$&&j(S,le,Re,Ne)):n.texImage2D(t.TEXTURE_2D,0,Ee,le.width,le.height,0,Re,Ne,le.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Ke&&at&&n.texStorage3D(t.TEXTURE_2D_ARRAY,be,Ee,Ge[0].width,Ge[0].height,le.depth);for(let fe=0,De=Ge.length;fe<De;fe++)if(Me=Ge[fe],S.format!==Ki)if(Re!==null)if(Ke){if($)if(S.layerUpdates.size>0){const Be=Ig(Me.width,Me.height,S.format,S.type);for(const ge of S.layerUpdates){const qe=Me.data.subarray(ge*Be/Me.data.BYTES_PER_ELEMENT,(ge+1)*Be/Me.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,fe,0,0,ge,Me.width,Me.height,1,Re,qe)}}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,fe,0,0,0,Me.width,Me.height,le.depth,Re,Me.data)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,fe,Ee,Me.width,Me.height,le.depth,0,Me.data,0,0);else ot("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ke?$&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,fe,0,0,0,Me.width,Me.height,le.depth,Re,Ne,Me.data):n.texImage3D(t.TEXTURE_2D_ARRAY,fe,Ee,Me.width,Me.height,le.depth,0,Re,Ne,Me.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{Ke&&at&&n.texStorage2D(t.TEXTURE_2D,be,Ee,Ge[0].width,Ge[0].height);for(let fe=0,De=Ge.length;fe<De;fe++)Me=Ge[fe],S.format!==Ki?Re!==null?Ke?$&&n.compressedTexSubImage2D(t.TEXTURE_2D,fe,0,0,Me.width,Me.height,Re,Me.data):n.compressedTexImage2D(t.TEXTURE_2D,fe,Ee,Me.width,Me.height,0,Me.data):ot("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ke?$&&n.texSubImage2D(t.TEXTURE_2D,fe,0,0,Me.width,Me.height,Re,Ne,Me.data):n.texImage2D(t.TEXTURE_2D,fe,Ee,Me.width,Me.height,0,Re,Ne,Me.data)}else if(S.isDataArrayTexture)if(Ke){if(at&&n.texStorage3D(t.TEXTURE_2D_ARRAY,be,Ee,le.width,le.height,le.depth),$)if(S.layerUpdates.size>0){const fe=Ig(le.width,le.height,S.format,S.type);for(const De of S.layerUpdates){const Be=le.data.subarray(De*fe/le.data.BYTES_PER_ELEMENT,(De+1)*fe/le.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,De,le.width,le.height,1,Re,Ne,Be)}S.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,le.width,le.height,le.depth,Re,Ne,le.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,Ee,le.width,le.height,le.depth,0,Re,Ne,le.data);else if(S.isData3DTexture)Ke?(at&&n.texStorage3D(t.TEXTURE_3D,be,Ee,le.width,le.height,le.depth),$&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,le.width,le.height,le.depth,Re,Ne,le.data)):n.texImage3D(t.TEXTURE_3D,0,Ee,le.width,le.height,le.depth,0,Re,Ne,le.data);else if(S.isFramebufferTexture){if(at)if(Ke)n.texStorage2D(t.TEXTURE_2D,be,Ee,le.width,le.height);else{let fe=le.width,De=le.height;for(let Be=0;Be<be;Be++)n.texImage2D(t.TEXTURE_2D,Be,Ee,fe,De,0,Re,Ne,null),fe>>=1,De>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in t){const fe=t.canvas;if(fe.hasAttribute("layoutsubtree")||fe.setAttribute("layoutsubtree","true"),le.parentNode!==fe){fe.appendChild(le),f.add(S),fe.onpaint=De=>{const Be=De.changedElements;for(const ge of f)Be.includes(ge.image)&&(ge.needsUpdate=!0)},fe.requestPaint();return}if(t.texElementImage2D.length===3)t.texElementImage2D(t.TEXTURE_2D,t.RGBA8,le);else{const Be=t.RGBA,ge=t.RGBA,qe=t.UNSIGNED_BYTE;t.texElementImage2D(t.TEXTURE_2D,0,Be,ge,qe,le)}t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}}else if(Ge.length>0){if(Ke&&at){const fe=Ae(Ge[0]);n.texStorage2D(t.TEXTURE_2D,be,Ee,fe.width,fe.height)}for(let fe=0,De=Ge.length;fe<De;fe++)Me=Ge[fe],Ke?$&&n.texSubImage2D(t.TEXTURE_2D,fe,0,0,Re,Ne,Me):n.texImage2D(t.TEXTURE_2D,fe,Ee,Re,Ne,Me);S.generateMipmaps=!1}else if(Ke){if(at){const fe=Ae(le);n.texStorage2D(t.TEXTURE_2D,be,Ee,fe.width,fe.height)}$&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,Re,Ne,le)}else n.texImage2D(t.TEXTURE_2D,0,Ee,Re,Ne,le);p(S)&&b(Z),we.__version=me.version,S.onUpdate&&S.onUpdate(S)}D.__version=S.version}function Fe(D,S,G){if(S.image.length!==6)return;const Z=de(D,S),ie=S.source;n.bindTexture(t.TEXTURE_CUBE_MAP,D.__webglTexture,t.TEXTURE0+G);const me=i.get(ie);if(ie.version!==me.__version||Z===!0){n.activeTexture(t.TEXTURE0+G);const we=bt.getPrimaries(bt.workingColorSpace),ae=S.colorSpace===Mr?null:bt.getPrimaries(S.colorSpace),le=S.colorSpace===Mr||we===ae?t.NONE:t.BROWSER_DEFAULT_WEBGL;n.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(t.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,le);const Re=S.isCompressedTexture||S.image[0].isCompressedTexture,Ne=S.image[0]&&S.image[0].isDataTexture,Ee=[];for(let ge=0;ge<6;ge++)!Re&&!Ne?Ee[ge]=_(S.image[ge],!0,s.maxCubemapSize):Ee[ge]=Ne?S.image[ge].image:S.image[ge],Ee[ge]=Te(S,Ee[ge]);const Me=Ee[0],Ge=r.convert(S.format,S.colorSpace),Ke=r.convert(S.type),at=g(S.internalFormat,Ge,Ke,S.normalized,S.colorSpace),$=S.isVideoTexture!==!0,be=me.__version===void 0||Z===!0,fe=ie.dataReady;let De=T(S,Me);We(t.TEXTURE_CUBE_MAP,S);let Be;if(Re){$&&be&&n.texStorage2D(t.TEXTURE_CUBE_MAP,De,at,Me.width,Me.height);for(let ge=0;ge<6;ge++){Be=Ee[ge].mipmaps;for(let qe=0;qe<Be.length;qe++){const $e=Be[qe];S.format!==Ki?Ge!==null?$?fe&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,qe,0,0,$e.width,$e.height,Ge,$e.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,qe,at,$e.width,$e.height,0,$e.data):ot("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):$?fe&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,qe,0,0,$e.width,$e.height,Ge,Ke,$e.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,qe,at,$e.width,$e.height,0,Ge,Ke,$e.data)}}}else{if(Be=S.mipmaps,$&&be){Be.length>0&&De++;const ge=Ae(Ee[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,De,at,ge.width,ge.height)}for(let ge=0;ge<6;ge++)if(Ne){$?fe&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Ee[ge].width,Ee[ge].height,Ge,Ke,Ee[ge].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,at,Ee[ge].width,Ee[ge].height,0,Ge,Ke,Ee[ge].data);for(let qe=0;qe<Be.length;qe++){const Ht=Be[qe].image[ge].image;$?fe&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,qe+1,0,0,Ht.width,Ht.height,Ge,Ke,Ht.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,qe+1,at,Ht.width,Ht.height,0,Ge,Ke,Ht.data)}}else{$?fe&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,0,0,Ge,Ke,Ee[ge]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0,at,Ge,Ke,Ee[ge]);for(let qe=0;qe<Be.length;qe++){const $e=Be[qe];$?fe&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,qe+1,0,0,Ge,Ke,$e.image[ge]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ge,qe+1,at,Ge,Ke,$e.image[ge])}}}p(S)&&b(t.TEXTURE_CUBE_MAP),me.__version=ie.version,S.onUpdate&&S.onUpdate(S)}D.__version=S.version}function Ce(D,S,G,Z,ie,me){const we=r.convert(G.format,G.colorSpace),ae=r.convert(G.type),le=g(G.internalFormat,we,ae,G.normalized,G.colorSpace),Re=i.get(S),Ne=i.get(G);if(Ne.__renderTarget=S,!Re.__hasExternalTextures){const Ee=Math.max(1,S.width>>me),Me=Math.max(1,S.height>>me);ie===t.TEXTURE_3D||ie===t.TEXTURE_2D_ARRAY?n.texImage3D(ie,me,le,Ee,Me,S.depth,0,we,ae,null):n.texImage2D(ie,me,le,Ee,Me,0,we,ae,null)}n.bindFramebuffer(t.FRAMEBUFFER,D),J(S)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,Z,ie,Ne.__webglTexture,0,pe(S)):(ie===t.TEXTURE_2D||ie>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&ie<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,Z,ie,Ne.__webglTexture,me),n.bindFramebuffer(t.FRAMEBUFFER,null)}function Ze(D,S,G){if(t.bindRenderbuffer(t.RENDERBUFFER,D),S.depthBuffer){const Z=S.depthTexture,ie=Z&&Z.isDepthTexture?Z.type:null,me=E(S.stencilBuffer,ie),we=S.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;J(S)?a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,pe(S),me,S.width,S.height):G?t.renderbufferStorageMultisample(t.RENDERBUFFER,pe(S),me,S.width,S.height):t.renderbufferStorage(t.RENDERBUFFER,me,S.width,S.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,we,t.RENDERBUFFER,D)}else{const Z=S.textures;for(let ie=0;ie<Z.length;ie++){const me=Z[ie],we=r.convert(me.format,me.colorSpace),ae=r.convert(me.type),le=g(me.internalFormat,we,ae,me.normalized,me.colorSpace);J(S)?a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,pe(S),le,S.width,S.height):G?t.renderbufferStorageMultisample(t.RENDERBUFFER,pe(S),le,S.width,S.height):t.renderbufferStorage(t.RENDERBUFFER,le,S.width,S.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function N(D,S,G){const Z=S.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(t.FRAMEBUFFER,D),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const ie=i.get(S.depthTexture);if(ie.__renderTarget=S,(!ie.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),Z){if(ie.__webglInit===void 0&&(ie.__webglInit=!0,S.depthTexture.addEventListener("dispose",C)),ie.__webglTexture===void 0){ie.__webglTexture=t.createTexture(),n.bindTexture(t.TEXTURE_CUBE_MAP,ie.__webglTexture),We(t.TEXTURE_CUBE_MAP,S.depthTexture);const Re=r.convert(S.depthTexture.format),Ne=r.convert(S.depthTexture.type);let Ee;S.depthTexture.format===or?Ee=t.DEPTH_COMPONENT24:S.depthTexture.format===to&&(Ee=t.DEPTH24_STENCIL8);for(let Me=0;Me<6;Me++)t.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Me,0,Ee,S.width,S.height,0,Re,Ne,null)}}else H(S.depthTexture,0);const me=ie.__webglTexture,we=pe(S),ae=Z?t.TEXTURE_CUBE_MAP_POSITIVE_X+G:t.TEXTURE_2D,le=S.depthTexture.format===to?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(S.depthTexture.format===or)J(S)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,le,ae,me,0,we):t.framebufferTexture2D(t.FRAMEBUFFER,le,ae,me,0);else if(S.depthTexture.format===to)J(S)?a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,le,ae,me,0,we):t.framebufferTexture2D(t.FRAMEBUFFER,le,ae,me,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function k(D){const S=i.get(D),G=D.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==D.depthTexture){const Z=D.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),Z){const ie=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,Z.removeEventListener("dispose",ie)};Z.addEventListener("dispose",ie),S.__depthDisposeCallback=ie}S.__boundDepthTexture=Z}if(D.depthTexture&&!S.__autoAllocateDepthBuffer)if(G)for(let Z=0;Z<6;Z++)N(S.__webglFramebuffer[Z],D,Z);else{const Z=D.texture.mipmaps;Z&&Z.length>0?N(S.__webglFramebuffer[0],D,0):N(S.__webglFramebuffer,D,0)}else if(G){S.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(n.bindFramebuffer(t.FRAMEBUFFER,S.__webglFramebuffer[Z]),S.__webglDepthbuffer[Z]===void 0)S.__webglDepthbuffer[Z]=t.createRenderbuffer(),Ze(S.__webglDepthbuffer[Z],D,!1);else{const ie=D.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,me=S.__webglDepthbuffer[Z];t.bindRenderbuffer(t.RENDERBUFFER,me),t.framebufferRenderbuffer(t.FRAMEBUFFER,ie,t.RENDERBUFFER,me)}}else{const Z=D.texture.mipmaps;if(Z&&Z.length>0?n.bindFramebuffer(t.FRAMEBUFFER,S.__webglFramebuffer[0]):n.bindFramebuffer(t.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=t.createRenderbuffer(),Ze(S.__webglDepthbuffer,D,!1);else{const ie=D.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,me=S.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,me),t.framebufferRenderbuffer(t.FRAMEBUFFER,ie,t.RENDERBUFFER,me)}}n.bindFramebuffer(t.FRAMEBUFFER,null)}function ee(D,S,G){const Z=i.get(D);S!==void 0&&Ce(Z.__webglFramebuffer,D,D.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),G!==void 0&&k(D)}function ce(D){const S=D.texture,G=i.get(D),Z=i.get(S);D.addEventListener("dispose",v);const ie=D.textures,me=D.isWebGLCubeRenderTarget===!0,we=ie.length>1;if(we||(Z.__webglTexture===void 0&&(Z.__webglTexture=t.createTexture()),Z.__version=S.version,o.memory.textures++),me){G.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(S.mipmaps&&S.mipmaps.length>0){G.__webglFramebuffer[ae]=[];for(let le=0;le<S.mipmaps.length;le++)G.__webglFramebuffer[ae][le]=t.createFramebuffer()}else G.__webglFramebuffer[ae]=t.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){G.__webglFramebuffer=[];for(let ae=0;ae<S.mipmaps.length;ae++)G.__webglFramebuffer[ae]=t.createFramebuffer()}else G.__webglFramebuffer=t.createFramebuffer();if(we)for(let ae=0,le=ie.length;ae<le;ae++){const Re=i.get(ie[ae]);Re.__webglTexture===void 0&&(Re.__webglTexture=t.createTexture(),o.memory.textures++)}if(D.samples>0&&J(D)===!1){G.__webglMultisampledFramebuffer=t.createFramebuffer(),G.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let ae=0;ae<ie.length;ae++){const le=ie[ae];G.__webglColorRenderbuffer[ae]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,G.__webglColorRenderbuffer[ae]);const Re=r.convert(le.format,le.colorSpace),Ne=r.convert(le.type),Ee=g(le.internalFormat,Re,Ne,le.normalized,le.colorSpace,D.isXRRenderTarget===!0),Me=pe(D);t.renderbufferStorageMultisample(t.RENDERBUFFER,Me,Ee,D.width,D.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ae,t.RENDERBUFFER,G.__webglColorRenderbuffer[ae])}t.bindRenderbuffer(t.RENDERBUFFER,null),D.depthBuffer&&(G.__webglDepthRenderbuffer=t.createRenderbuffer(),Ze(G.__webglDepthRenderbuffer,D,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(me){n.bindTexture(t.TEXTURE_CUBE_MAP,Z.__webglTexture),We(t.TEXTURE_CUBE_MAP,S);for(let ae=0;ae<6;ae++)if(S.mipmaps&&S.mipmaps.length>0)for(let le=0;le<S.mipmaps.length;le++)Ce(G.__webglFramebuffer[ae][le],D,S,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ae,le);else Ce(G.__webglFramebuffer[ae],D,S,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);p(S)&&b(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(we){for(let ae=0,le=ie.length;ae<le;ae++){const Re=ie[ae],Ne=i.get(Re);let Ee=t.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(Ee=D.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(Ee,Ne.__webglTexture),We(Ee,Re),Ce(G.__webglFramebuffer,D,Re,t.COLOR_ATTACHMENT0+ae,Ee,0),p(Re)&&b(Ee)}n.unbindTexture()}else{let ae=t.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(ae=D.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(ae,Z.__webglTexture),We(ae,S),S.mipmaps&&S.mipmaps.length>0)for(let le=0;le<S.mipmaps.length;le++)Ce(G.__webglFramebuffer[le],D,S,t.COLOR_ATTACHMENT0,ae,le);else Ce(G.__webglFramebuffer,D,S,t.COLOR_ATTACHMENT0,ae,0);p(S)&&b(ae),n.unbindTexture()}D.depthBuffer&&k(D)}function oe(D){const S=D.textures;for(let G=0,Z=S.length;G<Z;G++){const ie=S[G];if(p(ie)){const me=y(D),we=i.get(ie).__webglTexture;n.bindTexture(me,we),b(me),n.unbindTexture()}}}const ue=[],xe=[];function ye(D){if(D.samples>0){if(J(D)===!1){const S=D.textures,G=D.width,Z=D.height;let ie=t.COLOR_BUFFER_BIT;const me=D.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,we=i.get(D),ae=S.length>1;if(ae)for(let Re=0;Re<S.length;Re++)n.bindFramebuffer(t.FRAMEBUFFER,we.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+Re,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,we.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+Re,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,we.__webglMultisampledFramebuffer);const le=D.texture.mipmaps;le&&le.length>0?n.bindFramebuffer(t.DRAW_FRAMEBUFFER,we.__webglFramebuffer[0]):n.bindFramebuffer(t.DRAW_FRAMEBUFFER,we.__webglFramebuffer);for(let Re=0;Re<S.length;Re++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(ie|=t.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(ie|=t.STENCIL_BUFFER_BIT)),ae){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,we.__webglColorRenderbuffer[Re]);const Ne=i.get(S[Re]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,Ne,0)}t.blitFramebuffer(0,0,G,Z,0,0,G,Z,ie,t.NEAREST),l===!0&&(ue.length=0,xe.length=0,ue.push(t.COLOR_ATTACHMENT0+Re),D.depthBuffer&&D.storeMultisampledDepthBuffer===!1&&(ue.push(me),xe.push(me),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,xe)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,ue))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),ae)for(let Re=0;Re<S.length;Re++){n.bindFramebuffer(t.FRAMEBUFFER,we.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+Re,t.RENDERBUFFER,we.__webglColorRenderbuffer[Re]);const Ne=i.get(S[Re]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,we.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+Re,t.TEXTURE_2D,Ne,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,we.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.storeMultisampledDepthBuffer===!1&&l){const S=D.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[S])}}}function pe(D){return Math.min(s.maxSamples,D.samples)}function J(D){const S=i.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function U(D){const S=o.render.frame;c.get(D)!==S&&(c.set(D,S),D.update())}function Te(D,S){const G=D.colorSpace,Z=D.format,ie=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||G!==Gc&&G!==Mr&&(bt.getTransfer(G)===Ut?(Z!==Ki||ie!==xi)&&ot("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):At("WebGLTextures: Unsupported texture color space:",G)),S}function Ae(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(u.width=D.naturalWidth||D.width,u.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(u.width=D.displayWidth,u.height=D.displayHeight):(u.width=D.width,u.height=D.height),u}this.allocateTextureUnit=O,this.resetTextureUnits=I,this.getTextureUnits=F,this.setTextureUnits=B,this.setTexture2D=H,this.setTexture2DArray=Y,this.setTexture3D=Q,this.setTextureCube=se,this.rebindTextures=ee,this.setupRenderTarget=ce,this.updateRenderTargetMipmap=oe,this.updateMultisampleRenderTarget=ye,this.setupDepthRenderbuffer=k,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=J,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function zF(t,e){function n(i,s=Mr){let r;const o=bt.getTransfer(s);if(i===xi)return t.UNSIGNED_BYTE;if(i===vm)return t.UNSIGNED_SHORT_4_4_4_4;if(i===xm)return t.UNSIGNED_SHORT_5_5_5_1;if(i===H1)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===G1)return t.UNSIGNED_INT_10F_11F_11F_REV;if(i===z1)return t.BYTE;if(i===V1)return t.SHORT;if(i===Fl)return t.UNSIGNED_SHORT;if(i===_m)return t.INT;if(i===Ts)return t.UNSIGNED_INT;if(i===_s)return t.FLOAT;if(i===ws)return t.HALF_FLOAT;if(i===W1)return t.ALPHA;if(i===$1)return t.RGB;if(i===Ki)return t.RGBA;if(i===or)return t.DEPTH_COMPONENT;if(i===to)return t.DEPTH_STENCIL;if(i===X1)return t.RED;if(i===ym)return t.RED_INTEGER;if(i===_o)return t.RG;if(i===Em)return t.RG_INTEGER;if(i===Sm)return t.RGBA_INTEGER;if(i===ec||i===tc||i===nc||i===ic)if(o===Ut)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ec)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===tc)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===nc)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===ic)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ec)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===tc)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===nc)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===ic)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Pd||i===Id||i===Ld||i===Nd)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Pd)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Id)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ld)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Nd)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Bd||i===Ud||i===Od||i===kd||i===zd||i===Vc||i===Vd)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Bd||i===Ud)return o===Ut?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Od)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===kd)return r.COMPRESSED_R11_EAC;if(i===zd)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Vc)return r.COMPRESSED_RG11_EAC;if(i===Vd)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Hd||i===Gd||i===Wd||i===$d||i===Xd||i===qd||i===Yd||i===Kd||i===Zd||i===Jd||i===jd||i===Qd||i===ep||i===tp)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Hd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Gd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Wd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===$d)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Xd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===qd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Yd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Kd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Zd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Jd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===jd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Qd)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===ep)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===tp)return o===Ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===np||i===ip||i===sp)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===np)return o===Ut?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===ip)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===sp)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===rp||i===op||i===Hc||i===ap)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===rp)return r.COMPRESSED_RED_RGTC1_EXT;if(i===op)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Hc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ap)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Dl?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}const VF=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,HF=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class GF{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n){if(this.texture===null){const i=new sy(e.texture);(e.depthNear!==n.depthNear||e.depthFar!==n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,i=new Cs({vertexShader:VF,fragmentShader:HF,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Jt(new If(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class WF extends Br{constructor(e,n){super();const i=this;let s=null,r=1,o=null,a="local-floor",l=1,u=null,c=null,f=null,h=null,d=null,m=null;const x=typeof XRWebGLBinding<"u",_=new GF,p={},b=n.getContextAttributes();let y=null,g=null;const E=[],T=[],C=new Ye;let v=null,A=null;const R=new Wi;R.viewport=new sn;const L=new Wi;L.viewport=new sn;const M=[R,L],I=new Zw;let F=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let j=E[K];return j===void 0&&(j=new xh,E[K]=j),j.getTargetRaySpace()},this.getControllerGrip=function(K){let j=E[K];return j===void 0&&(j=new xh,E[K]=j),j.getGripSpace()},this.getHand=function(K){let j=E[K];return j===void 0&&(j=new xh,E[K]=j),j.getHandSpace()};function O(K){const j=T.indexOf(K.inputSource);if(j===-1)return;const _e=E[j];_e!==void 0&&(_e.update(K.inputSource,K.frame,u||o),_e.dispatchEvent({type:K.type,data:K.inputSource}))}function z(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",H);for(let K=0;K<E.length;K++){const j=T[K];j!==null&&(T[K]=null,E[K].disconnect(j))}F=null,B=null,_.reset();for(const K in p)delete p[K];if(e.setRenderTarget(y),d=null,h=null,f=null,s=null,g=null,de.stop(),i.isPresenting=!1,e.setPixelRatio(v),e.setSize(C.width,C.height,!1),A!==null){const K=A.camera;K.fov=A.fov,K.zoom=A.zoom,K.updateProjectionMatrix(),A=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&ot("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){a=K,i.isPresenting===!0&&ot("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||o},this.setReferenceSpace=function(K){u=K},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return f===null&&x&&(f=new XRWebGLBinding(s,n)),f},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(y=e.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",z),s.addEventListener("inputsourceschange",H),b.xrCompatible!==!0&&await n.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(C),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let _e=null,Fe=null,Ce=null;b.depth&&(Ce=b.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,_e=b.stencil?to:or,Fe=b.stencil?Dl:Ts);const Ze={colorFormat:n.RGBA8,depthFormat:Ce,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(Ze),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),g=new es(h.textureWidth,h.textureHeight,{format:Ki,type:xi,depthTexture:new Nl(h.textureWidth,h.textureHeight,Fe,void 0,void 0,void 0,void 0,void 0,void 0,_e),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{const _e={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,n,_e),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),g=new es(d.framebufferWidth,d.framebufferHeight,{format:Ki,type:xi,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}g.isXRRenderTarget=!0,this.setFoveation(l),u=null,o=await s.requestReferenceSpace(a),de.setContext(s),de.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function H(K){for(let j=0;j<K.removed.length;j++){const _e=K.removed[j],Fe=T.indexOf(_e);Fe>=0&&(T[Fe]=null,E[Fe].disconnect(_e))}for(let j=0;j<K.added.length;j++){const _e=K.added[j];let Fe=T.indexOf(_e);if(Fe===-1){for(let Ze=0;Ze<E.length;Ze++)if(Ze>=T.length){T.push(_e),Fe=Ze;break}else if(T[Ze]===null){T[Ze]=_e,Fe=Ze;break}if(Fe===-1)break}const Ce=E[Fe];Ce&&Ce.connect(_e)}}const Y=new X,Q=new X;function se(K,j,_e){Y.setFromMatrixPosition(j.matrixWorld),Q.setFromMatrixPosition(_e.matrixWorld);const Fe=Y.distanceTo(Q),Ce=j.projectionMatrix.elements,Ze=_e.projectionMatrix.elements,N=Ce[14]/(Ce[10]-1),k=Ce[14]/(Ce[10]+1),ee=(Ce[9]+1)/Ce[5],ce=(Ce[9]-1)/Ce[5],oe=(Ce[8]-1)/Ce[0],ue=(Ze[8]+1)/Ze[0],xe=N*oe,ye=N*ue,pe=Fe/(-oe+ue),J=pe*-oe;if(j.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(J),K.translateZ(pe),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Ce[10]===-1)K.projectionMatrix.copy(j.projectionMatrix),K.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{const U=N+pe,Te=k+pe,Ae=xe-J,D=ye+(Fe-J),S=ee*k/Te*U,G=ce*k/Te*U;K.projectionMatrix.makePerspective(Ae,D,S,G,U,Te),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function q(K,j){j===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(j.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let j=K.near,_e=K.far;_.texture!==null&&(_.depthNear>0&&(j=_.depthNear),_.depthFar>0&&(_e=_.depthFar)),I.near=L.near=R.near=j,I.far=L.far=R.far=_e,(F!==I.near||B!==I.far)&&(s.updateRenderState({depthNear:I.near,depthFar:I.far}),F=I.near,B=I.far),I.layers.mask=K.layers.mask|6,R.layers.mask=I.layers.mask&-5,L.layers.mask=I.layers.mask&-3;const Fe=K.parent,Ce=I.cameras;q(I,Fe);for(let Ze=0;Ze<Ce.length;Ze++)q(Ce[Ze],Fe);Ce.length===2?se(I,R,L):I.projectionMatrix.copy(R.projectionMatrix),A===null&&K.isPerspectiveCamera&&(A={camera:K,fov:K.fov,zoom:K.zoom}),he(K,I,Fe)};function he(K,j,_e){_e===null?K.matrix.copy(j.matrixWorld):(K.matrix.copy(_e.matrixWorld),K.matrix.invert(),K.matrix.multiply(j.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(j.projectionMatrix),K.projectionMatrixInverse.copy(j.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=Il*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return I},this.getFoveation=function(){if(!(h===null&&d===null))return l},this.setFoveation=function(K){l=K,h!==null&&(h.fixedFoveation=K),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=K)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(I)},this.getCameraTexture=function(K){return p[K]};let et=null;function We(K,j){if(c=j.getViewerPose(u||o),m=j,c!==null){const _e=c.views;d!==null&&(e.setRenderTargetFramebuffer(g,d.framebuffer),e.setRenderTarget(g));let Fe=!1;_e.length!==I.cameras.length&&(I.cameras.length=0,Fe=!0);for(let k=0;k<_e.length;k++){const ee=_e[k];let ce=null;if(d!==null)ce=d.getViewport(ee);else{const ue=f.getViewSubImage(h,ee);ce=ue.viewport,k===0&&(e.setRenderTargetTextures(g,ue.colorTexture,ue.depthStencilTexture),e.setRenderTarget(g))}let oe=M[k];oe===void 0&&(oe=new Wi,oe.layers.enable(k),oe.viewport=new sn,M[k]=oe),oe.matrix.fromArray(ee.transform.matrix),oe.matrix.decompose(oe.position,oe.quaternion,oe.scale),oe.projectionMatrix.fromArray(ee.projectionMatrix),oe.projectionMatrixInverse.copy(oe.projectionMatrix).invert(),oe.viewport.set(ce.x,ce.y,ce.width,ce.height),k===0&&(I.matrix.copy(oe.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale)),Fe===!0&&I.cameras.push(oe)}const Ce=s.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){f=i.getBinding();const k=f.getDepthInformation(_e[0]);k&&k.isValid&&k.texture&&_.init(k,s.renderState)}if(Ce&&Ce.includes("camera-access")&&x){e.state.unbindTexture(),f=i.getBinding();for(let k=0;k<_e.length;k++){const ee=_e[k].camera;if(ee){let ce=p[ee];ce||(ce=new sy,p[ee]=ce);const oe=f.getCameraImage(ee);ce.sourceTexture=oe}}}}for(let _e=0;_e<E.length;_e++){const Fe=T[_e],Ce=E[_e];Fe!==null&&Ce!==void 0&&Ce.update(Fe,j,u||o)}et&&et(K,j),j.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:j}),m=null}const de=new ly;de.setAnimationLoop(We),this.setAnimationLoop=function(K){et=K},this.dispose=function(){}}}const $F=new Zt,my=new ct;my.set(-1,0,0,0,1,0,0,0,1);function XF(t,e){function n(_,p){_.matrixAutoUpdate===!0&&_.updateMatrix(),p.value.copy(_.matrix)}function i(_,p){p.color.getRGB(_.fogColor.value,ry(t)),p.isFog?(_.fogNear.value=p.near,_.fogFar.value=p.far):p.isFogExp2&&(_.fogDensity.value=p.density)}function s(_,p,b,y,g){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(_,p):p.isMeshLambertMaterial?(r(_,p),p.envMap&&(_.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(_,p),f(_,p)):p.isMeshPhongMaterial?(r(_,p),c(_,p),p.envMap&&(_.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(_,p),h(_,p),p.isMeshPhysicalMaterial&&d(_,p,g)):p.isMeshMatcapMaterial?(r(_,p),m(_,p)):p.isMeshDepthMaterial?r(_,p):p.isMeshDistanceMaterial?(r(_,p),x(_,p)):p.isMeshNormalMaterial?r(_,p):p.isLineBasicMaterial?(o(_,p),p.isLineDashedMaterial&&a(_,p)):p.isPointsMaterial?l(_,p,b,y):p.isSpriteMaterial?u(_,p):p.isShadowMaterial?(_.color.value.copy(p.color),_.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(_,p){_.opacity.value=p.opacity,p.color&&_.diffuse.value.copy(p.color),p.emissive&&_.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(_.map.value=p.map,n(p.map,_.mapTransform)),p.alphaMap&&(_.alphaMap.value=p.alphaMap,n(p.alphaMap,_.alphaMapTransform)),p.bumpMap&&(_.bumpMap.value=p.bumpMap,n(p.bumpMap,_.bumpMapTransform),_.bumpScale.value=p.bumpScale,p.side===pi&&(_.bumpScale.value*=-1)),p.normalMap&&(_.normalMap.value=p.normalMap,n(p.normalMap,_.normalMapTransform),_.normalScale.value.copy(p.normalScale),p.side===pi&&_.normalScale.value.negate()),p.displacementMap&&(_.displacementMap.value=p.displacementMap,n(p.displacementMap,_.displacementMapTransform),_.displacementScale.value=p.displacementScale,_.displacementBias.value=p.displacementBias),p.emissiveMap&&(_.emissiveMap.value=p.emissiveMap,n(p.emissiveMap,_.emissiveMapTransform)),p.specularMap&&(_.specularMap.value=p.specularMap,n(p.specularMap,_.specularMapTransform)),p.alphaTest>0&&(_.alphaTest.value=p.alphaTest);const b=e.get(p),y=b.envMap,g=b.envMapRotation;y&&(_.envMap.value=y,_.envMapRotation.value.setFromMatrix4($F.makeRotationFromEuler(g)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&_.envMapRotation.value.premultiply(my),_.reflectivity.value=p.reflectivity,_.ior.value=p.ior,_.refractionRatio.value=p.refractionRatio),p.lightMap&&(_.lightMap.value=p.lightMap,_.lightMapIntensity.value=p.lightMapIntensity,n(p.lightMap,_.lightMapTransform)),p.aoMap&&(_.aoMap.value=p.aoMap,_.aoMapIntensity.value=p.aoMapIntensity,n(p.aoMap,_.aoMapTransform))}function o(_,p){_.diffuse.value.copy(p.color),_.opacity.value=p.opacity,p.map&&(_.map.value=p.map,n(p.map,_.mapTransform))}function a(_,p){_.dashSize.value=p.dashSize,_.totalSize.value=p.dashSize+p.gapSize,_.scale.value=p.scale}function l(_,p,b,y){_.diffuse.value.copy(p.color),_.opacity.value=p.opacity,_.size.value=p.size*b,_.scale.value=y*.5,p.map&&(_.map.value=p.map,n(p.map,_.uvTransform)),p.alphaMap&&(_.alphaMap.value=p.alphaMap,n(p.alphaMap,_.alphaMapTransform)),p.alphaTest>0&&(_.alphaTest.value=p.alphaTest)}function u(_,p){_.diffuse.value.copy(p.color),_.opacity.value=p.opacity,_.rotation.value=p.rotation,p.map&&(_.map.value=p.map,n(p.map,_.mapTransform)),p.alphaMap&&(_.alphaMap.value=p.alphaMap,n(p.alphaMap,_.alphaMapTransform)),p.alphaTest>0&&(_.alphaTest.value=p.alphaTest)}function c(_,p){_.specular.value.copy(p.specular),_.shininess.value=Math.max(p.shininess,1e-4)}function f(_,p){p.gradientMap&&(_.gradientMap.value=p.gradientMap)}function h(_,p){_.metalness.value=p.metalness,p.metalnessMap&&(_.metalnessMap.value=p.metalnessMap,n(p.metalnessMap,_.metalnessMapTransform)),_.roughness.value=p.roughness,p.roughnessMap&&(_.roughnessMap.value=p.roughnessMap,n(p.roughnessMap,_.roughnessMapTransform)),p.envMap&&(_.envMapIntensity.value=p.envMapIntensity)}function d(_,p,b){_.ior.value=p.ior,p.sheen>0&&(_.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),_.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(_.sheenColorMap.value=p.sheenColorMap,n(p.sheenColorMap,_.sheenColorMapTransform)),p.sheenRoughnessMap&&(_.sheenRoughnessMap.value=p.sheenRoughnessMap,n(p.sheenRoughnessMap,_.sheenRoughnessMapTransform))),p.clearcoat>0&&(_.clearcoat.value=p.clearcoat,_.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(_.clearcoatMap.value=p.clearcoatMap,n(p.clearcoatMap,_.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(_.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,n(p.clearcoatRoughnessMap,_.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(_.clearcoatNormalMap.value=p.clearcoatNormalMap,n(p.clearcoatNormalMap,_.clearcoatNormalMapTransform),_.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===pi&&_.clearcoatNormalScale.value.negate())),p.dispersion>0&&(_.dispersion.value=p.dispersion),p.retroreflectivity>0&&(_.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(_.iridescence.value=p.iridescence,_.iridescenceIOR.value=p.iridescenceIOR,_.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],_.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(_.iridescenceMap.value=p.iridescenceMap,n(p.iridescenceMap,_.iridescenceMapTransform)),p.iridescenceThicknessMap&&(_.iridescenceThicknessMap.value=p.iridescenceThicknessMap,n(p.iridescenceThicknessMap,_.iridescenceThicknessMapTransform))),p.transmission>0&&(_.transmission.value=p.transmission,_.transmissionSamplerMap.value=b.texture,_.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(_.transmissionMap.value=p.transmissionMap,n(p.transmissionMap,_.transmissionMapTransform)),_.thickness.value=p.thickness,p.thicknessMap&&(_.thicknessMap.value=p.thicknessMap,n(p.thicknessMap,_.thicknessMapTransform)),_.attenuationDistance.value=p.attenuationDistance,_.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(_.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(_.anisotropyMap.value=p.anisotropyMap,n(p.anisotropyMap,_.anisotropyMapTransform))),_.specularIntensity.value=p.specularIntensity,_.specularColor.value.copy(p.specularColor),p.specularColorMap&&(_.specularColorMap.value=p.specularColorMap,n(p.specularColorMap,_.specularColorMapTransform)),p.specularIntensityMap&&(_.specularIntensityMap.value=p.specularIntensityMap,n(p.specularIntensityMap,_.specularIntensityMapTransform))}function m(_,p){p.matcap&&(_.matcap.value=p.matcap)}function x(_,p){const b=e.get(p).light;_.referencePosition.value.setFromMatrixPosition(b.matrixWorld),_.nearDistance.value=b.shadow.camera.near,_.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function qF(t,e,n,i){let s={},r={},o=[];const a=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function l(g,E){const T=E.program;i.uniformBlockBinding(g,T)}function u(g,E){let T=s[g.id];T===void 0&&(_(g),T=c(g),s[g.id]=T,g.addEventListener("dispose",b));const C=E.program;i.updateUBOMapping(g,C);const v=e.render.frame;r[g.id]!==v&&(h(g),r[g.id]=v)}function c(g){const E=f();g.__bindingPointIndex=E;const T=t.createBuffer(),C=g.__size,v=g.usage;return t.bindBuffer(t.UNIFORM_BUFFER,T),t.bufferData(t.UNIFORM_BUFFER,C,v),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,E,T),T}function f(){for(let g=0;g<a;g++)if(o.indexOf(g)===-1)return o.push(g),g;return At("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(g){const E=s[g.id],T=g.uniforms,C=g.__cache;t.bindBuffer(t.UNIFORM_BUFFER,E);for(let v=0,A=T.length;v<A;v++){const R=T[v];if(Array.isArray(R))for(let L=0,M=R.length;L<M;L++)d(R[L],v,L,C);else d(R,v,0,C)}t.bindBuffer(t.UNIFORM_BUFFER,null)}function d(g,E,T,C){if(x(g,E,T,C)===!0){const v=g.__offset,A=g.value;if(Array.isArray(A)){let R=0;for(let L=0;L<A.length;L++){const M=A[L],I=p(M);m(M,g.__data,R),typeof M!="number"&&typeof M!="boolean"&&!M.isMatrix3&&!ArrayBuffer.isView(M)&&(R+=I.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(A,g.__data,0);t.bufferSubData(t.UNIFORM_BUFFER,v,g.__data)}}function m(g,E,T){typeof g=="number"||typeof g=="boolean"?E[0]=g:g.isMatrix3?(E[0]=g.elements[0],E[1]=g.elements[1],E[2]=g.elements[2],E[3]=0,E[4]=g.elements[3],E[5]=g.elements[4],E[6]=g.elements[5],E[7]=0,E[8]=g.elements[6],E[9]=g.elements[7],E[10]=g.elements[8],E[11]=0):ArrayBuffer.isView(g)?E.set(new g.constructor(g.buffer,g.byteOffset,E.length)):g.toArray(E,T)}function x(g,E,T,C){const v=g.value,A=E+"_"+T;if(C[A]===void 0)return typeof v=="number"||typeof v=="boolean"?C[A]=v:ArrayBuffer.isView(v)?C[A]=v.slice():C[A]=v.clone(),!0;{const R=C[A];if(typeof v=="number"||typeof v=="boolean"){if(R!==v)return C[A]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(R.equals(v)===!1)return R.copy(v),!0}}return!1}function _(g){const E=g.uniforms;let T=0;const C=16;for(let A=0,R=E.length;A<R;A++){const L=Array.isArray(E[A])?E[A]:[E[A]];for(let M=0,I=L.length;M<I;M++){const F=L[M],B=Array.isArray(F.value)?F.value:[F.value];for(let O=0,z=B.length;O<z;O++){const H=B[O],Y=p(H),Q=T%C,se=Q%Y.boundary,q=Q+se;T+=se,q!==0&&C-q<Y.storage&&(T+=C-q),F.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=T,T+=Y.storage}}}const v=T%C;return v>0&&(T+=C-v),g.__size=T,g.__cache={},this}function p(g){const E={boundary:0,storage:0};return typeof g=="number"||typeof g=="boolean"?(E.boundary=4,E.storage=4):g.isVector2?(E.boundary=8,E.storage=8):g.isVector3||g.isColor?(E.boundary=16,E.storage=12):g.isVector4?(E.boundary=16,E.storage=16):g.isMatrix3?(E.boundary=48,E.storage=48):g.isMatrix4?(E.boundary=64,E.storage=64):g.isTexture?ot("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(g)?(E.boundary=16,E.storage=g.byteLength):ot("WebGLRenderer: Unsupported uniform value type.",g),E}function b(g){const E=g.target;E.removeEventListener("dispose",b);const T=o.indexOf(E.__bindingPointIndex);o.splice(T,1),t.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function y(){for(const g in s)t.deleteBuffer(s[g]);o=[],s={},r={}}return{bind:l,update:u,dispose:y}}const YF=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let as=null;function KF(){return as===null&&(as=new Lw(YF,16,16,_o,ws),as.name="DFG_LUT",as.minFilter=Hn,as.magFilter=Hn,as.wrapS=qs,as.wrapT=qs,as.generateMipmaps=!1,as.needsUpdate=!0),as}class ZF{constructor(e={}){const{canvas:n=XT(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:d=xi}=e;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=o;const x=d,_=new Set([Sm,Em,ym]),p=new Set([xi,Ts,Fl,Dl,vm,xm]),b=new Uint32Array(4),y=new Int32Array(4),g=new X;let E=null,T=null;const C=[],v=[];let A=null;this.domElement=n,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ys,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let L=!1,M=null,I=null,F=null,B=null;this._outputColorSpace=ui;let O=0,z=0,H=null,Y=-1,Q=null;const se=new sn,q=new sn;let he=null;const et=new St(0);let We=0,de=n.width,K=n.height,j=1,_e=null,Fe=null;const Ce=new sn(0,0,de,K),Ze=new sn(0,0,de,K);let N=!1;const k=new Cm;let ee=!1,ce=!1;const oe=new Zt,ue=new X,xe=new sn,ye={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let pe=!1;function J(){return H===null?j:1}let U=i;function Te(w,W){return n.getContext(w,W)}let Ae,D,S,G,Z,ie,me,we,ae,le,Re,Ne,Ee,Me,Ge,Ke,at,$,be,fe,De,Be,ge;try{const w={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:c,failIfMajorPerformanceCaveat:f};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${gm}`),n.addEventListener("webglcontextlost",Ht,!1),n.addEventListener("webglcontextrestored",Mt,!1),n.addEventListener("webglcontextcreationerror",ei,!1),U===null){const W="webgl2";if(U=Te(W,w),U===null)throw Te(W)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}qe()}catch(w){throw n.removeEventListener("webglcontextlost",Ht,!1),n.removeEventListener("webglcontextrestored",Mt,!1),n.removeEventListener("webglcontextcreationerror",ei,!1),At("WebGLRenderer: "+w.message),w}function qe(){Ae=new K5(U),Ae.init(),De=new zF(U,Ae),D=new k5(U,Ae,e,De),S=new OF(U,Ae),D.reversedDepthBuffer&&h&&S.buffers.depth.setReversed(!0),I=U.createFramebuffer(),F=U.createFramebuffer(),B=U.createFramebuffer(),G=new j5(U),Z=new MF,ie=new kF(U,Ae,S,Z,D,De,G),me=new Y5(R),we=new e3(U),Be=new U5(U,we),ae=new Z5(U,we,G,Be),le=new eR(U,ae,we,Be,G),$=new Q5(U,D,ie),Ge=new z5(Z),Re=new bF(R,me,Ae,D,Be,Ge),Ne=new XF(R,Z),Ee=new TF,Me=new PF(Ae),at=new B5(R,me,S,le,m,l),Ke=new UF(R,le,D),ge=new qF(U,G,D,S),be=new O5(U,Ae,G),fe=new J5(U,Ae,G),G.programs=Re.programs,R.capabilities=D,R.extensions=Ae,R.properties=Z,R.renderLists=Ee,R.shadowMap=Ke,R.state=S,R.info=G}x!==xi&&(A=new nR(x,n.width,n.height,a,s,r));const $e=new WF(R,U);this.xr=$e,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const w=Ae.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=Ae.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(w){w!==void 0&&(j=w,this.setSize(de,K,!1))},this.getSize=function(w){return w.set(de,K)},this.setSize=function(w,W,re=!0){if($e.isPresenting){ot("WebGLRenderer: Can't change size while VR device is presenting.");return}de=w,K=W,n.width=Math.floor(w*j),n.height=Math.floor(W*j),re===!0&&(n.style.width=w+"px",n.style.height=W+"px"),A!==null&&A.setSize(n.width,n.height),this.setViewport(0,0,w,W)},this.getDrawingBufferSize=function(w){return w.set(de*j,K*j).floor()},this.setDrawingBufferSize=function(w,W,re){de=w,K=W,j=re,n.width=Math.floor(w*re),n.height=Math.floor(W*re),this.setViewport(0,0,w,W)},this.setEffects=function(w){if(x===xi){At("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let W=0;W<w.length;W++)if(w[W].isOutputPass===!0){ot("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(se)},this.getViewport=function(w){return w.copy(Ce)},this.setViewport=function(w,W,re,te){w.isVector4?Ce.set(w.x,w.y,w.z,w.w):Ce.set(w,W,re,te),S.viewport(se.copy(Ce).multiplyScalar(j).round())},this.getScissor=function(w){return w.copy(Ze)},this.setScissor=function(w,W,re,te){w.isVector4?Ze.set(w.x,w.y,w.z,w.w):Ze.set(w,W,re,te),S.scissor(q.copy(Ze).multiplyScalar(j).round())},this.getScissorTest=function(){return N},this.setScissorTest=function(w){S.setScissorTest(N=w)},this.setOpaqueSort=function(w){_e=w},this.setTransparentSort=function(w){Fe=w},this.getClearColor=function(w){return w.copy(at.getClearColor())},this.setClearColor=function(){at.setClearColor(...arguments)},this.getClearAlpha=function(){return at.getClearAlpha()},this.setClearAlpha=function(){at.setClearAlpha(...arguments)},this.clear=function(w=!0,W=!0,re=!0){let te=0;if(w){let ne=!1;if(H!==null){const Se=H.texture.format;ne=_.has(Se)}if(ne){const Se=H.texture.type,ke=p.has(Se),Ie=at.getClearColor(),He=at.getClearAlpha(),Xe=Ie.r,ft=Ie.g,mt=Ie.b;ke?(b[0]=Xe,b[1]=ft,b[2]=mt,b[3]=He,U.clearBufferuiv(U.COLOR,0,b)):(y[0]=Xe,y[1]=ft,y[2]=mt,y[3]=He,U.clearBufferiv(U.COLOR,0,y))}else te|=U.COLOR_BUFFER_BIT}W&&(te|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),re&&(te|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),te!==0&&U.clear(te)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),M=w},this.dispose=function(){n.removeEventListener("webglcontextlost",Ht,!1),n.removeEventListener("webglcontextrestored",Mt,!1),n.removeEventListener("webglcontextcreationerror",ei,!1),at.dispose(),Ee.dispose(),Me.dispose(),Z.dispose(),me.dispose(),le.dispose(),Be.dispose(),ge.dispose(),Re.dispose(),$e.dispose(),$e.removeEventListener("sessionstart",Yl),$e.removeEventListener("sessionend",Kl),Rs.stop()};function Ht(w){w.preventDefault(),Xc("WebGLRenderer: Context Lost."),L=!0}function Mt(){Xc("WebGLRenderer: Context Restored."),L=!1;const w=G.autoReset,W=Ke.enabled,re=Ke.autoUpdate,te=Ke.needsUpdate,ne=Ke.type;qe(),G.autoReset=w,Ke.enabled=W,Ke.autoUpdate=re,Ke.needsUpdate=te,Ke.type=ne}function ei(w){At("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function ti(w){const W=w.target;W.removeEventListener("dispose",ti),Ur(W)}function Ur(w){Or(w),Z.remove(w)}function Or(w){const W=Z.get(w).programs;W!==void 0&&(W.forEach(function(re){Re.releaseProgram(re)}),w.isShaderMaterial&&Re.releaseShaderCache(w))}this.renderBufferDirect=function(w,W,re,te,ne,Se){W===null&&(W=ye);const ke=ne.isMesh&&ne.matrixWorld.determinantAffine()<0,Ie=jl(w,W,re,te,ne);S.setMaterial(te,ke);let He=re.index,Xe=1;if(te.wireframe===!0){if(He=ae.getWireframeAttribute(re),He===void 0)return;Xe=2}const ft=re.drawRange,mt=re.attributes.position;let ze=ft.start*Xe,wt=(ft.start+ft.count)*Xe;Se!==null&&(ze=Math.max(ze,Se.start*Xe),wt=Math.min(wt,(Se.start+Se.count)*Xe)),He!==null?(ze=Math.max(ze,0),wt=Math.min(wt,He.count)):mt!=null&&(ze=Math.max(ze,0),wt=Math.min(wt,mt.count));const Qt=wt-ze;if(Qt<0||Qt===1/0)return;Be.setup(ne,te,Ie,re,He);let Gt,Nt=be;if(He!==null&&(Gt=we.get(He),Nt=fe,Nt.setIndex(Gt)),ne.isMesh)te.wireframe===!0?(S.setLineWidth(te.wireframeLinewidth*J()),Nt.setMode(U.LINES)):Nt.setMode(U.TRIANGLES);else if(ne.isLine){let yn=te.linewidth;yn===void 0&&(yn=1),S.setLineWidth(yn*J()),ne.isLineSegments?Nt.setMode(U.LINES):ne.isLineLoop?Nt.setMode(U.LINE_LOOP):Nt.setMode(U.LINE_STRIP)}else ne.isPoints?Nt.setMode(U.POINTS):ne.isSprite&&Nt.setMode(U.TRIANGLES);if(ne.isBatchedMesh)if(Ae.get("WEBGL_multi_draw"))Nt.renderMultiDraw(ne._multiDrawStarts,ne._multiDrawCounts,ne._multiDrawCount);else{const yn=ne._multiDrawStarts,Oe=ne._multiDrawCounts,En=ne._multiDrawCount,Ve=He?we.get(He).bytesPerElement:1,si=Z.get(te).currentProgram.getUniforms();for(let Mi=0;Mi<En;Mi++)si.setValue(U,"_gl_DrawID",Mi),Nt.render(yn[Mi]/Ve,Oe[Mi])}else if(ne.isInstancedMesh)Nt.renderInstances(ze,Qt,ne.count);else if(re.isInstancedBufferGeometry){const yn=re._maxInstanceCount!==void 0?re._maxInstanceCount:1/0,Oe=Math.min(re.instanceCount,yn);Nt.renderInstances(ze,Qt,Oe)}else Nt.render(ze,Qt)};function ba(w,W,re,te){M!==null&&w.isNodeMaterial&&M.setObject(te,w),ee===!0&&Ge.setState(w,re,!1),w.transparent===!0&&w.side===$s&&w.forceSinglePass===!1?(w.side=pi,w.needsUpdate=!0,To(w,W,te),w.side=mo,w.needsUpdate=!0,To(w,W,te),w.side=$s):To(w,W,te)}this.compile=function(w,W,re=null){re===null&&(re=w),M!==null&&M.renderStart(w,W,re),T=Me.get(re),T.init(W),v.push(T),re.traverseVisible(function(ne){ne.isLight&&ne.layers.test(W.layers)&&(T.pushLight(ne),ne.castShadow&&T.pushShadow(ne))}),w!==re&&w.traverseVisible(function(ne){ne.isLight&&ne.layers.test(W.layers)&&(T.pushLight(ne),ne.castShadow&&T.pushShadow(ne))}),T.setupLights(),M!==null&&M.updateLights(T.state.lightsArray),ce=this.localClippingEnabled,ee=Ge.init(this.clippingPlanes,ce),ee===!0&&Ge.setGlobalState(this.clippingPlanes,W),M!==null&&Ke.render(T.state.shadowsArray,re,W);const te=new Set;return w.traverse(function(ne){if(!(ne.isMesh||ne.isPoints||ne.isLine||ne.isSprite))return;const Se=ne.material;if(Se)if(Array.isArray(Se))for(let ke=0;ke<Se.length;ke++){const Ie=Se[ke];ba(Ie,re,W,ne),te.add(Ie)}else ba(Se,re,W,ne),te.add(Se)}),T=v.pop(),M!==null&&M.renderEnd(),te},this.compileAsync=function(w,W,re=null){const te=this.compile(w,W,re);return new Promise(ne=>{function Se(){if(te.forEach(function(ke){const He=Z.get(ke).currentProgram;(He===void 0||He.isReady())&&te.delete(ke)}),te.size===0){ne(w);return}setTimeout(Se,10)}Ae.get("KHR_parallel_shader_compile")!==null?Se():setTimeout(Se,10)})};let Ma=null;function Uf(w){Ma&&Ma(w)}function Yl(){Rs.stop()}function Kl(){Rs.start()}const Rs=new ly;Rs.setAnimationLoop(Uf),typeof self<"u"&&Rs.setContext(self),this.setAnimationLoop=function(w){Ma=w,$e.setAnimationLoop(w),w===null?Rs.stop():Rs.start()},$e.addEventListener("sessionstart",Yl),$e.addEventListener("sessionend",Kl),this.render=function(w,W){if(W!==void 0&&W.isCamera!==!0){At("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;M!==null&&M.renderStart(w,W);const re=$e.enabled===!0&&$e.isPresenting===!0,te=A!==null&&(H===null||re)&&A.begin(R,H);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),$e.enabled===!0&&$e.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&($e.cameraAutoUpdate===!0&&$e.updateCamera(W),W=$e.getCamera()),w.isScene===!0&&w.onBeforeRender(R,w,W,H),T=Me.get(w,v.length),T.init(W),T.state.textureUnits=ie.getTextureUnits(),v.push(T),oe.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),k.setFromProjectionMatrix(oe,vs,W.reversedDepth),ce=this.localClippingEnabled,ee=Ge.init(this.clippingPlanes,ce),E=Ee.get(w,C.length),E.init(),C.push(E),$e.enabled===!0&&$e.isPresenting===!0){const ke=R.xr.getDepthSensingMesh();ke!==null&&Aa(ke,W,-1/0,R.sortObjects)}Aa(w,W,0,R.sortObjects),E.finish(),M!==null&&M.updateLights(T.state.lightsArray),R.sortObjects===!0&&E.sort(_e,Fe),pe=$e.enabled===!1||$e.isPresenting===!1||$e.hasDepthSensing()===!1,pe&&at.addToRenderList(E,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ee===!0&&Ge.beginShadows();const ne=T.state.shadowsArray;if(Ke.render(ne,w,W),ee===!0&&Ge.endShadows(),(te&&A.hasRenderPass())===!1){const ke=E.opaque,Ie=E.transmissive;if(T.setupLights(),W.isArrayCamera){const He=W.cameras;if(Ie.length>0)for(let Xe=0,ft=He.length;Xe<ft;Xe++){const mt=He[Xe];lr(ke,Ie,w,mt)}pe&&at.render(w);for(let Xe=0,ft=He.length;Xe<ft;Xe++){const mt=He[Xe];Zl(E,w,mt,mt.viewport)}}else Ie.length>0&&lr(ke,Ie,w,W),pe&&at.render(w),Zl(E,w,W)}H!==null&&z===0&&(ie.updateMultisampleRenderTarget(H),ie.updateRenderTargetMipmap(H)),te&&A.end(R),w.isScene===!0&&w.onAfterRender(R,w,W),Be.resetDefaultState(),Y=-1,Q=null,v.pop(),v.length>0?(T=v[v.length-1],ie.setTextureUnits(T.state.textureUnits),ee===!0&&Ge.setGlobalState(R.clippingPlanes,T.state.camera)):T=null,C.pop(),C.length>0?E=C[C.length-1]:E=null,M!==null&&M.renderEnd()};function Aa(w,W,re,te){if(w.visible===!1)return;if(w.layers.test(W.layers)){if(w.isGroup)re=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(W);else if(w.isLightProbeGrid)T.pushLightProbeGrid(w);else if(w.isLight)T.pushLight(w),w.castShadow&&T.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||w.intersectsFrustum(k)){te&&xe.setFromMatrixPosition(w.matrixWorld).applyMatrix4(oe);const ke=le.update(w),Ie=w.material;Ie.visible&&E.push(w,ke,Ie,re,xe.z,null,W)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||w.intersectsFrustum(k))){const ke=le.update(w),Ie=w.material;if(te&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),xe.copy(w.boundingSphere.center)):(ke.boundingSphere===null&&ke.computeBoundingSphere(),xe.copy(ke.boundingSphere.center)),xe.applyMatrix4(w.matrixWorld).applyMatrix4(oe)),Array.isArray(Ie)){const He=ke.groups;for(let Xe=0,ft=He.length;Xe<ft;Xe++){const mt=He[Xe],ze=Ie[mt.materialIndex];ze&&ze.visible&&E.push(w,ke,ze,re,xe.z,mt,W)}}else Ie.visible&&E.push(w,ke,Ie,re,xe.z,null,W)}}const Se=w.children;for(let ke=0,Ie=Se.length;ke<Ie;ke++)Aa(Se[ke],W,re,te)}function Zl(w,W,re,te){const{opaque:ne,transmissive:Se,transparent:ke}=w;T.setupLightsView(re),ee===!0&&Ge.setGlobalState(R.clippingPlanes,re),te&&S.viewport(se.copy(te)),ne.length>0&&ni(ne,W,re),Se.length>0&&ni(Se,W,re),ke.length>0&&ni(ke,W,re),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function lr(w,W,re,te){if((re.isScene===!0?re.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[te.id]===void 0){const ze=Ae.has("EXT_color_buffer_half_float")||Ae.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[te.id]=new es(1,1,{generateMipmaps:!0,type:ze?ws:xi,minFilter:eo,samples:Math.max(4,D.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:bt.workingColorSpace})}const Se=T.state.transmissionRenderTarget[te.id],ke=te.viewport||se;Se.setSize(ke.z*R.transmissionResolutionScale,ke.w*R.transmissionResolutionScale);const Ie=R.getRenderTarget(),He=R.getActiveCubeFace(),Xe=R.getActiveMipmapLevel();R.setRenderTarget(Se),R.getClearColor(et),We=R.getClearAlpha(),We<1&&R.setClearColor(16777215,.5),R.clear(),pe&&at.render(re);const ft=R.toneMapping;R.toneMapping=ys;const mt=te.viewport;if(te.viewport!==void 0&&(te.viewport=void 0),T.setupLightsView(te),ee===!0&&Ge.setGlobalState(R.clippingPlanes,te),ni(w,re,te),ie.updateMultisampleRenderTarget(Se),ie.updateRenderTargetMipmap(Se),Ae.has("WEBGL_multisampled_render_to_texture")===!1){let ze=!1;for(let wt=0,Qt=W.length;wt<Qt;wt++){const Gt=W[wt],{object:Nt,geometry:yn,material:Oe,group:En}=Gt;if(Oe.side===$s&&Nt.layers.test(te.layers)){const Ve=Oe.side;Oe.side=pi,Oe.needsUpdate=!0,ii(Nt,re,te,yn,Oe,En),Oe.side=Ve,Oe.needsUpdate=!0,ze=!0}}ze===!0&&(ie.updateMultisampleRenderTarget(Se),ie.updateRenderTargetMipmap(Se))}R.setRenderTarget(Ie,He,Xe),R.setClearColor(et,We),mt!==void 0&&(te.viewport=mt),R.toneMapping=ft}function ni(w,W,re){const te=W.isScene===!0?W.overrideMaterial:null;for(let ne=0,Se=w.length;ne<Se;ne++){const ke=w[ne],{object:Ie,geometry:He,group:Xe}=ke;let ft=ke.material;ft.allowOverride===!0&&te!==null&&(ft=te),Ie.layers.test(re.layers)&&ii(Ie,W,re,He,ft,Xe)}}function ii(w,W,re,te,ne,Se){M!==null&&ne.isNodeMaterial&&M.setObject(w,ne),w.onBeforeRender(R,W,re,te,ne,Se),w.modelViewMatrix.multiplyMatrices(re.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),ne.onBeforeRender(R,W,re,te,w,Se),ne.transparent===!0&&ne.side===$s&&ne.forceSinglePass===!1?(ne.side=pi,ne.needsUpdate=!0,R.renderBufferDirect(re,W,te,ne,w,Se),ne.side=mo,ne.needsUpdate=!0,R.renderBufferDirect(re,W,te,ne,w,Se),ne.side=$s):R.renderBufferDirect(re,W,te,ne,w,Se),w.onAfterRender(R,W,re,te,ne,Se)}function To(w,W,re){W.isScene!==!0&&(W=ye);const te=Z.get(w),ne=T.state.lights,Se=T.state.shadowsArray,ke=ne.state.version,Ie=Re.getParameters(w,ne.state,Se,W,re,T.state.lightProbeGridArray),He=Re.getProgramCacheKey(Ie);let Xe=te.programs;te.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?W.environment:null,te.fog=W.fog;const ft=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;te.envMap=me.get(w.envMap||te.environment,ft),te.envMapRotation=te.environment!==null&&w.envMap===null?W.environmentRotation:w.envMapRotation,Xe===void 0&&(w.addEventListener("dispose",ti),Xe=new Map,te.programs=Xe);let mt=Xe.get(He);if(mt!==void 0){if(te.currentProgram===mt&&te.lightsStateVersion===ke)return Ta(w,Ie),mt}else Ie.uniforms=Re.getUniforms(w),M!==null&&w.isNodeMaterial&&M.build(w,re,Ie),w.onBeforeCompile(Ie,R),mt=Re.acquireProgram(Ie,He),Xe.set(He,mt),te.uniforms=Ie.uniforms;const ze=te.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(ze.clippingPlanes=Ge.uniform),Ta(w,Ie),te.needsLights=Ql(w),te.lightsStateVersion=ke,te.needsLights&&(ze.ambientLightColor.value=ne.state.ambient,ze.lightProbe.value=ne.state.probe,ze.sunLights.value=ne.state.sun,ze.sunLightShadows.value=ne.state.sunShadow,ze.directionalLights.value=ne.state.directional,ze.directionalLightShadows.value=ne.state.directionalShadow,ze.spotLights.value=ne.state.spot,ze.spotLightShadows.value=ne.state.spotShadow,ze.rectAreaLights.value=ne.state.rectArea,ze.ltc_1.value=ne.state.rectAreaLTC1,ze.ltc_2.value=ne.state.rectAreaLTC2,ze.pointLights.value=ne.state.point,ze.pointLightShadows.value=ne.state.pointShadow,ze.hemisphereLights.value=ne.state.hemi,ze.sunShadowMatrix.value=ne.state.sunShadowMatrix,ze.sunShadowCascade.value=ne.state.sunShadowCascade,ze.directionalShadowMatrix.value=ne.state.directionalShadowMatrix,ze.spotLightMatrix.value=ne.state.spotLightMatrix,ze.spotLightMap.value=ne.state.spotLightMap,ze.pointShadowMatrix.value=ne.state.pointShadowMatrix),te.lightProbeGrid=T.state.lightProbeGridArray.length>0,te.currentProgram=mt,te.uniformsList=null,mt}function kr(w){if(w.uniformsList===null){const W=w.currentProgram.getUniforms();w.uniformsList=sc.seqWithValue(W.seq,w.uniforms)}return w.uniformsList}function Ta(w,W){const re=Z.get(w);re.outputColorSpace=W.outputColorSpace,re.batching=W.batching,re.batchingColor=W.batchingColor,re.instancing=W.instancing,re.instancingColor=W.instancingColor,re.instancingMorph=W.instancingMorph,re.skinning=W.skinning,re.morphTargets=W.morphTargets,re.morphNormals=W.morphNormals,re.morphColors=W.morphColors,re.morphTargetsCount=W.morphTargetsCount,re.numClippingPlanes=W.numClippingPlanes,re.numIntersection=W.numClipIntersection,re.vertexAlphas=W.vertexAlphas,re.vertexTangents=W.vertexTangents,re.toneMapping=W.toneMapping}function Jl(w,W){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;g.setFromMatrixPosition(W.matrixWorld);for(let re=0,te=w.length;re<te;re++){const ne=w[re];if(ne.texture!==null&&ne.boundingBox.containsPoint(g))return ne}return null}function jl(w,W,re,te,ne){W.isScene!==!0&&(W=ye),ie.resetTextureUnits();const Se=W.fog,ke=te.isMeshStandardMaterial||te.isMeshLambertMaterial||te.isMeshPhongMaterial?W.environment:null,Ie=H===null?R.outputColorSpace:H.isXRRenderTarget===!0?H.texture.colorSpace:bt.workingColorSpace,He=te.isMeshStandardMaterial||te.isMeshLambertMaterial&&!te.envMap||te.isMeshPhongMaterial&&!te.envMap,Xe=me.get(te.envMap||ke,He),ft=te.vertexColors===!0&&!!re.attributes.color&&re.attributes.color.itemSize===4,mt=!!re.attributes.tangent&&(!!te.normalMap||te.anisotropy>0),ze=!!re.morphAttributes.position,wt=!!re.morphAttributes.normal,Qt=!!re.morphAttributes.color;let Gt=ys;te.toneMapped&&(H===null||H.isXRRenderTarget===!0)&&(Gt=R.toneMapping);const Nt=re.morphAttributes.position||re.morphAttributes.normal||re.morphAttributes.color,yn=Nt!==void 0?Nt.length:0,Oe=Z.get(te),En=T.state.lights;if(ee===!0&&(ce===!0||w!==Q)){const Tt=w===Q&&te.id===Y;Ge.setState(te,w,Tt)}let Ve=!1;te.version===Oe.__version?(Oe.needsLights&&Oe.lightsStateVersion!==En.state.version||Oe.outputColorSpace!==Ie||ne.isBatchedMesh&&Oe.batching===!1||!ne.isBatchedMesh&&Oe.batching===!0||ne.isBatchedMesh&&Oe.batchingColor===!0&&ne._colorsTexture===null||ne.isBatchedMesh&&Oe.batchingColor===!1&&ne._colorsTexture!==null||ne.isInstancedMesh&&Oe.instancing===!1||!ne.isInstancedMesh&&Oe.instancing===!0||ne.isSkinnedMesh&&Oe.skinning===!1||!ne.isSkinnedMesh&&Oe.skinning===!0||ne.isInstancedMesh&&Oe.instancingColor===!0&&ne.instanceColor===null||ne.isInstancedMesh&&Oe.instancingColor===!1&&ne.instanceColor!==null||ne.isInstancedMesh&&Oe.instancingMorph===!0&&ne.morphTexture===null||ne.isInstancedMesh&&Oe.instancingMorph===!1&&ne.morphTexture!==null||Oe.envMap!==Xe||te.fog===!0&&Oe.fog!==Se||Oe.numClippingPlanes!==void 0&&(Oe.numClippingPlanes!==Ge.numPlanes||Oe.numIntersection!==Ge.numIntersection)||Oe.vertexAlphas!==ft||Oe.vertexTangents!==mt||Oe.morphTargets!==ze||Oe.morphNormals!==wt||Oe.morphColors!==Qt||Oe.toneMapping!==Gt||Oe.morphTargetsCount!==yn||!!Oe.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(Ve=!0):(Ve=!0,Oe.__version=te.version);let si=Oe.currentProgram;Ve===!0&&(si=To(te,W,ne),M&&te.isNodeMaterial&&M.onUpdateProgram(te,si,Oe));let Mi=!1,is=!1,Ai=!1;const xt=si.getUniforms(),$t=Oe.uniforms;if(S.useProgram(si.program)&&(Mi=!0,is=!0,Ai=!0),te.id!==Y&&(Y=te.id,is=!0),Oe.needsLights){const Tt=Jl(T.state.lightProbeGridArray,ne);Oe.lightProbeGrid!==Tt&&(Oe.lightProbeGrid=Tt,is=!0)}if(Mi||Q!==w){S.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),xt.setValue(U,"projectionMatrix",w.projectionMatrix),xt.setValue(U,"viewMatrix",w.matrixWorldInverse);const Ti=xt.map.cameraPosition;Ti!==void 0&&Ti.setValue(U,ue.setFromMatrixPosition(w.matrixWorld)),D.logarithmicDepthBuffer&&xt.setValue(U,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(te.isMeshPhongMaterial||te.isMeshToonMaterial||te.isMeshLambertMaterial||te.isMeshBasicMaterial||te.isMeshStandardMaterial||te.isShaderMaterial)&&xt.setValue(U,"isOrthographic",w.isOrthographicCamera===!0),Q!==w&&(Q=w,is=!0,Ai=!0)}if(Oe.needsLights&&(En.state.sunShadowMap.length>0&&xt.setValue(U,"sunShadowMap",En.state.sunShadowMap,ie),En.state.directionalShadowMap.length>0&&xt.setValue(U,"directionalShadowMap",En.state.directionalShadowMap,ie),En.state.spotShadowMap.length>0&&xt.setValue(U,"spotShadowMap",En.state.spotShadowMap,ie),En.state.pointShadowMap.length>0&&xt.setValue(U,"pointShadowMap",En.state.pointShadowMap,ie)),ne.isSkinnedMesh){xt.setOptional(U,ne,"bindMatrix"),xt.setOptional(U,ne,"bindMatrixInverse");const Tt=ne.skeleton;Tt&&(Tt.boneTexture===null&&Tt.computeBoneTexture(),xt.setValue(U,"boneTexture",Tt.boneTexture,ie))}ne.isBatchedMesh&&(xt.setOptional(U,ne,"batchingTexture"),xt.setValue(U,"batchingTexture",ne._matricesTexture,ie),xt.setOptional(U,ne,"batchingIdTexture"),xt.setValue(U,"batchingIdTexture",ne._indirectTexture,ie),xt.setOptional(U,ne,"batchingColorTexture"),ne._colorsTexture!==null&&xt.setValue(U,"batchingColorTexture",ne._colorsTexture,ie));const Sn=re.morphAttributes;if((Sn.position!==void 0||Sn.normal!==void 0||Sn.color!==void 0)&&$.update(ne,re,si),(is||Oe.receiveShadow!==ne.receiveShadow)&&(Oe.receiveShadow=ne.receiveShadow,xt.setValue(U,"receiveShadow",ne.receiveShadow)),(te.isMeshStandardMaterial||te.isMeshLambertMaterial||te.isMeshPhongMaterial)&&te.envMap===null&&W.environment!==null&&($t.envMapIntensity.value=W.environmentIntensity),$t.dfgLUT!==void 0&&($t.dfgLUT.value=KF()),is){if(xt.setValue(U,"toneMappingExposure",R.toneMappingExposure),Oe.needsLights&&Of($t,Ai),Se&&te.fog===!0&&Ne.refreshFogUniforms($t,Se),Ne.refreshMaterialUniforms($t,te,j,K,T.state.transmissionRenderTarget[w.id]),Oe.needsLights&&Oe.lightProbeGrid){const Tt=Oe.lightProbeGrid;$t.probesSH.value=Tt.texture,$t.probesMin.value.copy(Tt.boundingBox.min),$t.probesMax.value.copy(Tt.boundingBox.max),$t.probesResolution.value.copy(Tt.resolution)}sc.upload(U,kr(Oe),$t,ie)}if(te.isShaderMaterial&&te.uniformsNeedUpdate===!0&&(sc.upload(U,kr(Oe),$t,ie),te.uniformsNeedUpdate=!1),te.isSpriteMaterial&&xt.setValue(U,"center",ne.center),xt.setValue(U,"modelViewMatrix",ne.modelViewMatrix),xt.setValue(U,"normalMatrix",ne.normalMatrix),xt.setValue(U,"modelMatrix",ne.matrixWorld),te.uniformsGroups!==void 0){const Tt=te.uniformsGroups;for(let Ti=0,ss=Tt.length;Ti<ss;Ti++){const tu=Tt[Ti];ge.update(tu,si),ge.bind(tu,si)}}return si}function Of(w,W){w.ambientLightColor.needsUpdate=W,w.lightProbe.needsUpdate=W,w.sunLights.needsUpdate=W,w.sunLightShadows.needsUpdate=W,w.directionalLights.needsUpdate=W,w.directionalLightShadows.needsUpdate=W,w.pointLights.needsUpdate=W,w.pointLightShadows.needsUpdate=W,w.spotLights.needsUpdate=W,w.spotLightShadows.needsUpdate=W,w.rectAreaLights.needsUpdate=W,w.hemisphereLights.needsUpdate=W}function Ql(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return O},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return H},this.setRenderTargetTextures=function(w,W,re){const te=Z.get(w);te.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,te.__autoAllocateDepthBuffer===!1&&(te.__useRenderToTexture=!1),Z.get(w.texture).__webglTexture=W,Z.get(w.depthTexture).__webglTexture=te.__autoAllocateDepthBuffer?void 0:re,te.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,W){const re=Z.get(w);re.__webglFramebuffer=W,re.__useDefaultFramebuffer=W===void 0},this.setRenderTarget=function(w,W=0,re=0){H=w,O=W,z=re;let te=null,ne=!1,Se=!1;if(w){const Ie=Z.get(w);if(Ie.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(U.FRAMEBUFFER,Ie.__webglFramebuffer),se.copy(w.viewport),q.copy(w.scissor),he=w.scissorTest,S.viewport(se),S.scissor(q),S.setScissorTest(he),Y=-1;return}else if(Ie.__webglFramebuffer===void 0)ie.setupRenderTarget(w);else if(Ie.__hasExternalTextures)ie.rebindTextures(w,Z.get(w.texture).__webglTexture,Z.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const ft=w.depthTexture;if(Ie.__boundDepthTexture!==ft){if(ft!==null&&Z.has(ft)&&(w.width!==ft.image.width||w.height!==ft.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ie.setupDepthRenderbuffer(w)}}const He=w.texture;(He.isData3DTexture||He.isDataArrayTexture||He.isCompressedArrayTexture)&&(Se=!0);const Xe=Z.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Xe[W])?te=Xe[W][re]:te=Xe[W],ne=!0):w.samples>0&&ie.useMultisampledRTT(w)===!1?te=Z.get(w).__webglMultisampledFramebuffer:Array.isArray(Xe)?te=Xe[re]:te=Xe,se.copy(w.viewport),q.copy(w.scissor),he=w.scissorTest}else se.copy(Ce).multiplyScalar(j).floor(),q.copy(Ze).multiplyScalar(j).floor(),he=N;if(re!==0&&(te=I),S.bindFramebuffer(U.FRAMEBUFFER,te)&&S.drawBuffers(w,te),S.viewport(se),S.scissor(q),S.setScissorTest(he),ne){const Ie=Z.get(w.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+W,Ie.__webglTexture,re)}else if(Se){const Ie=W;for(let He=0;He<w.textures.length;He++){const Xe=Z.get(w.textures[He]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+He,Xe.__webglTexture,re,Ie)}}else if(w!==null&&re!==0){const Ie=Z.get(w.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ie.__webglTexture,re)}Y=-1};function eu(w){const W=Z.get(w);return(W.__readFormat!==w.format||W.__readType!==w.type)&&(W.__readFormat=w.format,W.__readType=w.type,W.__formatReadable=D.textureFormatReadable(w.format),W.__typeReadable=D.textureTypeReadable(w.type)),W}this.readRenderTargetPixels=function(w,W,re,te,ne,Se,ke,Ie=0){if(!(w&&w.isWebGLRenderTarget)){At("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let He=Z.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&ke!==void 0&&(He=He[ke]),He){S.bindFramebuffer(U.FRAMEBUFFER,He);try{const Xe=w.textures[Ie],ft=Xe.format,mt=Xe.type;w.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ie);const ze=eu(Xe);if(ze.__formatReadable===!1){At("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ze.__typeReadable===!1){At("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=w.width-te&&re>=0&&re<=w.height-ne&&U.readPixels(W,re,te,ne,De.convert(ft),De.convert(mt),Se)}finally{const Xe=H!==null?Z.get(H).__webglFramebuffer:null;S.bindFramebuffer(U.FRAMEBUFFER,Xe)}}},this.readRenderTargetPixelsAsync=async function(w,W,re,te,ne,Se,ke,Ie=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let He=Z.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&ke!==void 0&&(He=He[ke]),He)if(W>=0&&W<=w.width-te&&re>=0&&re<=w.height-ne){S.bindFramebuffer(U.FRAMEBUFFER,He);const Xe=w.textures[Ie],ft=Xe.format,mt=Xe.type;w.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ie);const ze=eu(Xe);if(ze.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ze.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const wt=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,wt),U.bufferData(U.PIXEL_PACK_BUFFER,Se.byteLength,U.STREAM_READ),U.readPixels(W,re,te,ne,De.convert(ft),De.convert(mt),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);const Qt=H!==null?Z.get(H).__webglFramebuffer:null;S.bindFramebuffer(U.FRAMEBUFFER,Qt);const Gt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await qT(U,Gt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,wt),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,Se),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(wt),U.deleteSync(Gt),Se}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,W=null,re=0){const te=Math.pow(2,-re),ne=Math.floor(w.image.width*te),Se=Math.floor(w.image.height*te),ke=W!==null?W.x:0,Ie=W!==null?W.y:0;ie.setTexture2D(w,0),U.copyTexSubImage2D(U.TEXTURE_2D,re,0,0,ke,Ie,ne,Se),S.unbindTexture()},this.copyTextureToTexture=function(w,W,re=null,te=null,ne=0,Se=0){let ke,Ie,He,Xe,ft,mt,ze,wt,Qt;const Gt=w.isCompressedTexture?w.mipmaps[Se]:w.image;if(re!==null)ke=re.max.x-re.min.x,Ie=re.max.y-re.min.y,He=re.isBox3?re.max.z-re.min.z:1,Xe=re.min.x,ft=re.min.y,mt=re.isBox3?re.min.z:0;else{const $t=Math.pow(2,-ne);ke=Math.floor(Gt.width*$t),Ie=Math.floor(Gt.height*$t),w.isDataArrayTexture?He=Gt.depth:w.isData3DTexture?He=Math.floor(Gt.depth*$t):He=1,Xe=0,ft=0,mt=0}te!==null?(ze=te.x,wt=te.y,Qt=te.z):(ze=0,wt=0,Qt=0);const Nt=De.convert(W.format),yn=De.convert(W.type);let Oe;W.isData3DTexture?(ie.setTexture3D(W,0),Oe=U.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(ie.setTexture2DArray(W,0),Oe=U.TEXTURE_2D_ARRAY):(ie.setTexture2D(W,0),Oe=U.TEXTURE_2D),S.activeTexture(U.TEXTURE0),S.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,W.flipY),S.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),S.pixelStorei(U.UNPACK_ALIGNMENT,W.unpackAlignment);const En=S.getParameter(U.UNPACK_ROW_LENGTH),Ve=S.getParameter(U.UNPACK_IMAGE_HEIGHT),si=S.getParameter(U.UNPACK_SKIP_PIXELS),Mi=S.getParameter(U.UNPACK_SKIP_ROWS),is=S.getParameter(U.UNPACK_SKIP_IMAGES);S.pixelStorei(U.UNPACK_ROW_LENGTH,Gt.width),S.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Gt.height),S.pixelStorei(U.UNPACK_SKIP_PIXELS,Xe),S.pixelStorei(U.UNPACK_SKIP_ROWS,ft),S.pixelStorei(U.UNPACK_SKIP_IMAGES,mt);const Ai=w.isDataArrayTexture||w.isData3DTexture,xt=W.isDataArrayTexture||W.isData3DTexture;if(w.isDepthTexture){const $t=Z.get(w),Sn=Z.get(W),Tt=Z.get($t.__renderTarget),Ti=Z.get(Sn.__renderTarget);S.bindFramebuffer(U.READ_FRAMEBUFFER,Tt.__webglFramebuffer),S.bindFramebuffer(U.DRAW_FRAMEBUFFER,Ti.__webglFramebuffer);for(let ss=0;ss<He;ss++)Ai&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Z.get(w).__webglTexture,ne,mt+ss),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Z.get(W).__webglTexture,Se,Qt+ss)),U.blitFramebuffer(Xe,ft,ke,Ie,ze,wt,ke,Ie,U.DEPTH_BUFFER_BIT,U.NEAREST);S.bindFramebuffer(U.READ_FRAMEBUFFER,null),S.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(ne!==0||w.isRenderTargetTexture||Z.has(w)){const $t=Z.get(w),Sn=Z.get(W);S.bindFramebuffer(U.READ_FRAMEBUFFER,F),S.bindFramebuffer(U.DRAW_FRAMEBUFFER,B);for(let Tt=0;Tt<He;Tt++)Ai?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,$t.__webglTexture,ne,mt+Tt):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,$t.__webglTexture,ne),xt?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Sn.__webglTexture,Se,Qt+Tt):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Sn.__webglTexture,Se),ne!==0?U.blitFramebuffer(Xe,ft,ke,Ie,ze,wt,ke,Ie,U.COLOR_BUFFER_BIT,U.NEAREST):xt?U.copyTexSubImage3D(Oe,Se,ze,wt,Qt+Tt,Xe,ft,ke,Ie):U.copyTexSubImage2D(Oe,Se,ze,wt,Xe,ft,ke,Ie);S.bindFramebuffer(U.READ_FRAMEBUFFER,null),S.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else xt?w.isDataTexture||w.isData3DTexture?U.texSubImage3D(Oe,Se,ze,wt,Qt,ke,Ie,He,Nt,yn,Gt.data):W.isCompressedArrayTexture?U.compressedTexSubImage3D(Oe,Se,ze,wt,Qt,ke,Ie,He,Nt,Gt.data):U.texSubImage3D(Oe,Se,ze,wt,Qt,ke,Ie,He,Nt,yn,Gt):w.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,Se,ze,wt,ke,Ie,Nt,yn,Gt.data):w.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,Se,ze,wt,Gt.width,Gt.height,Nt,Gt.data):U.texSubImage2D(U.TEXTURE_2D,Se,ze,wt,ke,Ie,Nt,yn,Gt);S.pixelStorei(U.UNPACK_ROW_LENGTH,En),S.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Ve),S.pixelStorei(U.UNPACK_SKIP_PIXELS,si),S.pixelStorei(U.UNPACK_SKIP_ROWS,Mi),S.pixelStorei(U.UNPACK_SKIP_IMAGES,is),Se===0&&W.generateMipmaps&&U.generateMipmap(Oe),S.unbindTexture()},this.initRenderTarget=function(w){Z.get(w).__webglFramebuffer===void 0&&ie.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?ie.setTextureCube(w,0):w.isData3DTexture?ie.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?ie.setTexture2DArray(w,0):ie.setTexture2D(w,0),S.unbindTexture()},this.resetState=function(){O=0,z=0,H=null,S.reset(),Be.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vs}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorSpace=bt._getDrawingBufferColorSpace(e),n.unpackColorSpace=bt._getUnpackColorSpace()}}const n_={type:"change"},Pm={type:"start"},gy={type:"end"},$u=new Df,i_=new ps,JF=Math.cos(70*K1.DEG2RAD),hn=new X,oi=2*Math.PI,zt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Gh=1e-6;class jF extends jw{constructor(e,n=null){super(e,n),this.state=zt.NONE,this.target=new X,this.cursor=new X,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Bi.ROTATE,MIDDLE:Bi.DOLLY,RIGHT:Bi.PAN},this.touches={ONE:Yi.ROTATE,TWO:Yi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new X,this._lastQuaternion=new Lr,this._lastTargetPosition=new X,this._quat=new Lr().setFromUnitVectors(e.up,new X(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Dg,this._sphericalDelta=new Dg,this._scale=1,this._panOffset=new X,this._rotateStart=new Ye,this._rotateEnd=new Ye,this._rotateDelta=new Ye,this._panStart=new Ye,this._panEnd=new Ye,this._panDelta=new Ye,this._dollyStart=new Ye,this._dollyEnd=new Ye,this._dollyDelta=new Ye,this._dollyDirection=new X,this._mouse=new Ye,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=eD.bind(this),this._onPointerDown=QF.bind(this),this._onPointerUp=tD.bind(this),this._onContextMenu=lD.bind(this),this._onMouseWheel=sD.bind(this),this._onKeyDown=rD.bind(this),this._onTouchStart=oD.bind(this),this._onTouchMove=aD.bind(this),this._onMouseDown=nD.bind(this),this._onMouseMove=iD.bind(this),this._interceptControlDown=uD.bind(this),this._interceptControlUp=cD.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=zt.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();const e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(n_),this.update(),this.state=zt.NONE}pan(e,n){this._pan(e,n),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const n=this.object.position;hn.copy(n).sub(this.target),hn.applyQuaternion(this._quat),this._spherical.setFromVector3(hn),this.autoRotate&&this.state===zt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=oi:i>Math.PI&&(i-=oi),s<-Math.PI?s+=oi:s>Math.PI&&(s-=oi),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(hn.setFromSpherical(this._spherical),hn.applyQuaternion(this._quatInverse),n.copy(this.target).add(hn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=hn.length();o=this._clampDistance(a*this._scale);const l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const a=new X(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const u=new X(this._mouse.x,this._mouse.y,0);u.unproject(this.object),this.object.position.sub(u).add(a),this.object.updateMatrixWorld(),o=hn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):($u.origin.copy(this.object.position),$u.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot($u.direction))<JF?this.object.lookAt(this.target):(i_.setFromNormalAndCoplanarPoint(this.object.up,this.target),$u.intersectPlane(i_,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Gh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Gh||this._lastTargetPosition.distanceToSquared(this.target)>Gh?(this.dispatchEvent(n_),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?oi/60*this.autoRotateSpeed*e:oi/60/60*this.autoRotateSpeed}_getZoomScale(e){const n=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*n)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,n){hn.setFromMatrixColumn(n,0),hn.multiplyScalar(-e),this._panOffset.add(hn)}_panUp(e,n){this.screenSpacePanning===!0?hn.setFromMatrixColumn(n,1):(hn.setFromMatrixColumn(n,0),hn.crossVectors(this.object.up,hn)),hn.multiplyScalar(e),this._panOffset.add(hn)}_pan(e,n){const i=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;hn.copy(s).sub(this.target);let r=hn.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*n*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(n*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,n){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),s=e-i.left,r=n-i.top,o=i.width,a=i.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const n=this.domElement;this._rotateLeft(oi*this._rotateDelta.x/n.clientHeight),this._rotateUp(oi*this._rotateDelta.y/n.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let n=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(oi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),n=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-oi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),n=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(oi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),n=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-oi*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),n=!0;break}n&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),i=.5*(e.pageX+n.x),s=.5*(e.pageY+n.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),i=.5*(e.pageX+n.x),s=.5*(e.pageY+n.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){const n=this._getSecondPointerPosition(e),i=e.pageX-n.x,s=e.pageY-n.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const n=this.domElement;this._rotateLeft(oi*this._rotateDelta.x/n.clientHeight),this._rotateUp(oi*this._rotateDelta.y/n.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),i=.5*(e.pageX+n.x),s=.5*(e.pageY+n.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const n=this._getSecondPointerPosition(e),i=e.pageX-n.x,s=e.pageY-n.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+n.x)*.5,a=(e.pageY+n.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let n=0;n<this._pointers.length;n++)if(this._pointers[n]==e.pointerId){this._pointers.splice(n,1);return}}_isTrackingPointer(e){for(let n=0;n<this._pointers.length;n++)if(this._pointers[n]==e.pointerId)return!0;return!1}_trackPointer(e){let n=this._pointerPositions[e.pointerId];n===void 0&&(n=new Ye,this._pointerPositions[e.pointerId]=n),n.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const n=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[n]}_customWheelEvent(e){const n=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(n){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function QF(t){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(t.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(t)&&(this._addPointer(t),t.pointerType==="touch"?this._onTouchStart(t):this._onMouseDown(t),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function eD(t){this.enabled!==!1&&(t.pointerType==="touch"?this._onTouchMove(t):this._onMouseMove(t))}function tD(t){switch(this._removePointer(t),this._pointers.length){case 0:this.domElement.releasePointerCapture(t.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(gy),this.state=zt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],n=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:n.x,pageY:n.y});break}}function nD(t){let e;switch(t.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Bi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(t),this.state=zt.DOLLY;break;case Bi.ROTATE:if(t.ctrlKey||t.metaKey||t.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(t),this.state=zt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(t),this.state=zt.ROTATE}break;case Bi.PAN:if(t.ctrlKey||t.metaKey||t.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(t),this.state=zt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(t),this.state=zt.PAN}break;default:this.state=zt.NONE}this.state!==zt.NONE&&this.dispatchEvent(Pm)}function iD(t){switch(this.state){case zt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(t);break;case zt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(t);break;case zt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(t);break}}function sD(t){this.enabled===!1||this.enableZoom===!1||this.state!==zt.NONE||(t.preventDefault(),this.dispatchEvent(Pm),this._handleMouseWheel(this._customWheelEvent(t)),this.dispatchEvent(gy))}function rD(t){this.enabled!==!1&&this._handleKeyDown(t)}function oD(t){switch(this._trackPointer(t),this._pointers.length){case 1:switch(this.touches.ONE){case Yi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(t),this.state=zt.TOUCH_ROTATE;break;case Yi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(t),this.state=zt.TOUCH_PAN;break;default:this.state=zt.NONE}break;case 2:switch(this.touches.TWO){case Yi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(t),this.state=zt.TOUCH_DOLLY_PAN;break;case Yi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(t),this.state=zt.TOUCH_DOLLY_ROTATE;break;default:this.state=zt.NONE}break;default:this.state=zt.NONE}this.state!==zt.NONE&&this.dispatchEvent(Pm)}function aD(t){switch(this._trackPointer(t),this.state){case zt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(t),this.update();break;case zt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(t),this.update();break;case zt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(t),this.update();break;case zt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(t),this.update();break;default:this.state=zt.NONE}}function lD(t){this.enabled!==!1&&t.preventDefault()}function uD(t){t.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function cD(t){t.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const On={friendly:7397333,enemy:15962489,gold:15581812,purple:12035057},Hi=(t,e=.12)=>{const n=kt(t);return new X(n.x,e,n.y)};function uo(t){const e=new Set,n=new Set,i=new Set;t.traverse(s=>{s.geometry&&e.add(s.geometry);for(const r of Array.isArray(s.material)?s.material:s.material?[s.material]:[])n.add(r),r.map&&i.add(r.map)}),i.forEach(s=>s.dispose()),n.forEach(s=>s.dispose()),e.forEach(s=>s.dispose()),t.clear()}function Zc(t,e,n=1){return new ny(new In().setFromPoints(t),new Rm({color:e,transparent:!0,opacity:n,depthWrite:!1}))}function hp(t,e,n,i=.17){const s=Array.from({length:49},(r,o)=>new X(t.x+Math.cos(o/48*Math.PI*2)*e,i,t.z+Math.sin(o/48*Math.PI*2)*e));return Zc(s,n)}function sa(t,{color:e="#70dfd5",hp:n=null,selected:i=!1,width:s=2.6,height:r=1.05}={}){const o=document.createElement("canvas");o.width=512,o.height=160;const a=o.getContext("2d");a.fillStyle="rgba(7, 24, 36, .94)",a.fillRect(3,3,506,154),a.strokeStyle=i?"#ffe29a":e,a.lineWidth=i?9:4,a.strokeRect(7,7,498,146),a.fillStyle=e,a.font="bold 90px system-ui, sans-serif",a.textAlign="center",a.textBaseline="middle",a.fillText(t,256,n===null?80:65,476),n!==null&&(a.fillStyle="#253b49",a.fillRect(30,117,452,13),a.fillStyle=e,a.fillRect(30,117,452*Math.max(0,Math.min(1,n)),13));const l=new Bw(o);l.colorSpace=ui;const u=new Pw(new ey({map:l,depthTest:!1,transparent:!0}));return u.scale.set(s,r,1),u.renderOrder=8,u}const fD={reach:2316625,main:6963256,secondary:4936545,aa:5324905,air:4407654,sweep:6706747,torp:6313018};class hD{constructor(e){this.root=new fi,e.add(this.root),this.cells=new Map,this.plans=new fi,this.root.add(this.plans),this.nodes=[],this.signature=""}update(e){if(!this.cells.size){const r=new pa(.975,.975,.12,6),o=Array.from({length:7},(c,f)=>new X(Math.cos(Math.PI/6+f*Math.PI/3),.072,Math.sin(Math.PI/6+f*Math.PI/3))),a=new In().setFromPoints(o),l=new Rm({color:3564663,transparent:!0,opacity:.6});for(const c of e.cells){const f=new fi;f.position.copy(Hi(c,0));const h=new Jt(r,new Ja({color:1057844,roughness:.84}));f.add(h),f.add(new ny(a,l));const d=new Jt(new Bl(.82,1.4,5),new Ja({color:7570803,flatShading:!0}));d.position.y=.7,d.rotation.y=c.q*.71,f.add(d),this.root.add(f),this.cells.set(c.k||`${c.q},${c.r}`,{g:f,mesh:h,rock:d});const m=Ea(c);if(c.r===0||m.c===0){const x=sa(c.r===0?String.fromCharCode(65+m.c):String(c.r+1),{width:.65,height:.34,color:"#a6c3cc"});x.position.copy(Hi(c,.05)),c.r===0?x.position.z-=1.3:x.position.x-=1.3,this.root.add(x)}}const u=new Jt(new Zi(35.5,.55,24),new Ja({color:730680,roughness:.6,metalness:.2}));u.position.set(16,-.37,10.5),this.root.add(u)}for(const r of e.cells){const o=this.cells.get(r.k||`${r.q},${r.r}`);if(!o)continue;const a=r.tutorial?9073722:r.hovered?5404289:r.deploy?2383192:r.overlay?fD[e.overlayType]||2316625:r.known?r.visible?2382192:2306879:595747;o.mesh.material.color.setHex(a),o.rock.visible=!!(r.known&&r.island),o.rock.material.color.setHex(r.visible?10136461:4739662)}const n=JSON.stringify([e.phase,e.mode,e.showPlans,e.previews,e.mainTargets,e.showRanges,e.overlayType,e.rays,e.airRange,e.mines]);if(n===this.signature)return;this.signature=n,uo(this.plans),this.nodes=[];for(const r of e.mines||[]){const o=new fi;o.position.copy(Hi(r,.26));const a=new Ja({color:On.gold,metalness:.7,roughness:.35});o.add(new Jt(new Pf(.23,0),a));for(const l of["x","y","z"]){const u=new Jt(new Zi(.07,.7,.07),a);l==="x"&&(u.rotation.z=Math.PI/2),l==="z"&&(u.rotation.x=Math.PI/2),o.add(u)}this.plans.add(o)}if(e.phase!=="plan")return;const i=(r,o,a)=>this.plans.add(Zc([Hi(r,.19),Hi(o,.19)],a)),s=(r,o,a,l=.56)=>{const u=Hi(r,.2);if(this.plans.add(hp(u,l,a)),o){const c=sa(o,{width:.8,height:.37,color:`#${a.toString(16).padStart(6,"0")}`});return c.position.copy(Hi(r,.45)),this.plans.add(c),c}};if(e.showPlans){for(const r of e.previews||[]){const o=r.nodes||[];if(o.length>1&&this.plans.add(Zc(o.map(a=>Hi(a.pos,.2)),On.friendly,r.selected?1:.4)),o.slice(1).forEach((a,l)=>{const u=s(a.pos,String(l+1),On.friendly,.32);u.renderOrder=9,u.userData={type:"node",index:l+1,shipId:r.ship.id,pos:{...a.pos},editable:!!r.selected},this.nodes.push(u)}),o.length>1){const a=sa(`${r.ship.label} · ${o.length-1}/${r.ship.cfg.speed}`,{width:2.2,height:.4});a.position.copy(Hi(o.at(-1).pos,.85)),this.plans.add(a)}for(const a of r.torps||[])i(a.origin,a.fullEnd,7957068),i(a.origin,a.end,On.gold),s(a.origin,`鱼${a.window}`,On.gold,.23);for(const a of r.planes||[])i(r.ship.pos,a.target,On.friendly),s(a.target,"航",On.friendly);r.plan.sweep&&s(r.plan.sweep,"扫",On.gold,.7)}for(const r of e.mainTargets||[])s(r.at,`×${r.count}`,On.enemy,.7)}if(e.showRanges&&e.overlayType==="torp")for(const r of e.rays||[])i(r.origin,r.fullEnd,7957068),i(r.origin,r.roundEnd,On.gold);e.showRanges&&e.overlayType==="air"&&e.airRange&&this.plans.add(hp(Hi(e.airRange.origin),e.airRange.radius,On.purple))}dispose(){uo(this.root),this.root.removeFromParent()}}class dD{constructor(e){this.root=new fi,e.add(this.root),this.cache=new Map,this.picks=[]}update(e){const n=new Set;this.picks=[];for(const[i,s]of[["ship",e.ships],["plane",e.planes],["torpedo",e.torpedoes]])for(const r of s||[]){const o=`${i}:${r.id}`;n.add(o);let a=this.cache.get(o);const l=r.team===0?On.friendly:On.enemy;if(!a){a=new fi,this.root.add(a),this.cache.set(o,a);const u=new Ja({color:l,roughness:.4,metalness:.3,flatShading:!0}),c=new fi;if(a.add(c),a.userData.body=c,i==="ship"){const f=new Jt(new pa(.53,.4,.22,6),u);f.position.y=.19,c.add(f);const h=new Jt(new Bl(.17,.45,3),u);h.rotation.z=-Math.PI/2,h.position.set(.77,.24,0),c.add(h);const d=new Jt(new Zi(.055,1.12,.055),u);d.position.y=.75,a.add(d);const m=hp(new X,.79,On.gold,.14);a.add(m),a.userData.selection=m}else if(i==="plane"){c.add(new Jt(new Zi(.72,.13,.16),u));const f=new Jt(new Zi(.2,.055,.85),u);c.add(f);const h=new Jt(new Zi(.12,.1,.35),u);h.position.x=-.28,c.add(h)}else{const f=new Jt(new pa(.065,.065,.5,6),u);f.rotation.z=Math.PI/2,c.add(f);const h=new Jt(new Bl(.11,.55,3),new Ll({color:12115933,transparent:!0,opacity:.48}));h.rotation.z=-Math.PI/2,h.position.x=-.48,c.add(h)}}if(a.position.set(r.xy.x,i==="plane"?1.8:i==="torpedo"?.15:0,r.xy.y),a.userData.body.rotation.y=-(i==="plane"?r.angle||0:(r.heading||0)*60)*Math.PI/180,i==="ship"){const u=e.selected===r.id||r.tutorial;a.userData.selection.visible=u;const c=`${r.label}:${r.hp}:${r.cfg.hp}:${u}`;if(c!==a.userData.signature){a.userData.card&&(uo(a.userData.card),a.userData.card.removeFromParent());const f=sa(r.label,{color:r.team===0?"#8eefe3":"#ffa18c",hp:r.hp/r.cfg.hp,selected:u,width:u?3:2.6,height:u?1.2:1.05});f.center.set(.5,0),f.position.y=.93,a.add(f),a.userData.card=f,a.userData.signature=c}a.userData.card.userData={type:"ship",ship:r},this.picks.push(a.userData.card);for(const f of a.userData.body.children)f.userData={type:"ship",ship:r},this.picks.push(f)}else if(i==="plane"){const u=r.state==="return";if(u&&!a.userData.returnLabel){const c=sa("返",{width:.5,height:.3});c.position.y=.35,a.add(c),a.userData.returnLabel=c}a.userData.returnLabel&&(a.userData.returnLabel.visible=u)}}for(const[i,s]of this.cache)n.has(i)||(uo(s),s.removeFromParent(),this.cache.delete(i))}dispose(){uo(this.root),this.root.removeFromParent(),this.cache.clear()}}class pD{constructor(e){this.root=new fi,e.add(this.root),this.cache=new Map}update(e={}){const n=new Set;for(const i of e.projectiles||[]){const s=`p:${i.id}`;n.add(s);let r=this.cache.get(s);if(!r){r=new fi;const o=i.kind==="aa"?On.purple:On.gold,a=new Jt(new Dm(i.kind==="main"?.12:.07,6,4),new Ll({color:o}));r.add(a),r.userData.ball=a;const l=Zc([],o);r.add(l),r.userData.trail=l,this.cache.set(s,r),this.root.add(r)}r.userData.ball.visible=!!i.position,i.position&&r.userData.ball.position.set(i.position.x,i.position.y+.12,i.position.z),r.userData.trail.geometry.dispose(),r.userData.trail.geometry=new In().setFromPoints((i.trail||[]).map(o=>new X(o.x,o.y+.12,o.z)))}for(const i of e.effects||[]){const s=`e:${i.id}`;n.add(s);let r=this.cache.get(s);if(!r){r=new fi,r.position.copy(Hi(i.at,.3));const a=new Jt(new Pf(.4,0),new Ll({color:/splash|miss/.test(i.kind)?12119295:16759926,transparent:!0,opacity:.8,wireframe:!1}));if(r.add(a),r.userData.burst=a,i.text){const l=sa(String(i.text),{color:"#ffe2b4",width:1.5,height:.53});l.position.y=1.3,r.add(l),r.userData.text=l}this.cache.set(s,r),this.root.add(r)}const o=Math.max(0,Math.min(1,i.age));r.userData.burst.scale.setScalar(.4+o*2.5),r.userData.burst.material.opacity=.8*(1-o),r.userData.text&&(r.userData.text.position.y=1.1+o,r.userData.text.material.opacity=1-o)}for(const[i,s]of this.cache)n.has(i)||(uo(s),s.removeFromParent(),this.cache.delete(i))}dispose(){uo(this.root),this.root.removeFromParent(),this.cache.clear()}}function s_(t,e,n=6){return Math.hypot(e.clientX-t.x,e.clientY-t.y)>n}function mD({node:t,ship:e,hex:n,mode:i,phase:s,button:r=0}){if(!n&&!e&&!t)return null;if(r===2)return t!=null&&t.pos||n?{type:"hex",hex:(t==null?void 0:t.pos)||n,forceMove:!0}:null;if(r!==0)return null;if(t){if(t.editable&&i==="move"&&s==="plan")return{type:"node",index:t.index,shipId:t.shipId};if(t.pos)return{type:"hex",hex:t.pos,forceMove:!1}}return e?{type:"ship",ship:e}:n?{type:"hex",hex:n,forceMove:!1}:null}function gD(t,e,n){const i=!!n;return t&&(t.mouseButtons.LEFT=i?Bi.ROTATE:Bi.PAN,t.touches.ONE=i?Yi.ROTATE:Yi.PAN),e&&(e.dataset.cameraMode=i?"rotate":"pan"),i}const _D=gf({name:"BattleMap3D",props:{model:{type:Object,required:!0}},emits:["zoom","rotate","hex","ship","node","hover","home"],setup(t,{emit:e,expose:n}){const i=st(null),s=st("");let r,o,a,l,u,c,f,h,d=0,m=!0,x=!0,_=!1,p=[],b=1,y=1;const g=new X(15.9,0,10.5),E=new Jw,T=new Ye,C=new ps(new X(0,1,0),0),v=new X,A=new Map;let R=!1;function L(de,K,j,_e){de.addEventListener(K,j,_e),p.push(()=>de.removeEventListener(K,j,_e))}function M(){if(!a)return;a.updateMatrixWorld();const de=[];for(const Ce of[-2,34.5])for(const Ze of[0,2.2])for(const N of[-2,23])de.push(new X(Ce,Ze,N).sub(g).applyQuaternion(a.quaternion.clone().invert()));const K=Math.max(...de.map(Ce=>Math.abs(Ce.x)))*1.05,j=Math.max(...de.map(Ce=>Math.abs(Ce.y)))*1.05,_e=b/y,Fe=Math.max(j,K/_e);a.left=-Fe*_e,a.right=Fe*_e,a.top=Fe,a.bottom=-Fe,a.updateProjectionMatrix(),m=!0}function I(){O(!1),a&&(a.position.copy(g).add(new X(0,32,24)),a.up.set(0,1,0),a.lookAt(g),l.target.copy(g),a.zoom=1,l.update(),M(),e("zoom",1),m=!0)}function F(de){if(!l||!de)return;const K=new X(de.x,0,de.y),j=K.clone().sub(l.target);a.position.add(j),l.target.copy(K),a.zoom=3,a.updateProjectionMatrix(),l.update(),e("zoom",a.zoom),m=!0}function B(de){!a||!Number.isFinite(de)||de<=0||(a.zoom=K1.clamp(a.zoom*de,1,3),a.updateProjectionMatrix(),m=!0,e("zoom",a.zoom))}function O(de){return _=gD(l,r==null?void 0:r.domElement,de),e("rotate",_),_}function z(){return O(!_)}n({reset:I,focus:F,zoomBy:B,toggleRotate:z});function H(de){const K=r.domElement.getBoundingClientRect();T.set((de.clientX-K.left)/K.width*2-1,-(de.clientY-K.top)/K.height*2+1),a.updateMatrixWorld(),E.setFromCamera(T,a);const _e=E.ray.intersectPlane(C,v)?rt({x:v.x,y:v.z}):null;return _e&&Ir(_e)?_e:null}function Y(de){var Ce,Ze;const K=H(de),j=(Ce=E.intersectObjects(u.nodes,!1)[0])==null?void 0:Ce.object.userData,_e=(Ze=E.intersectObjects(c.picks,!1)[0])==null?void 0:Ze.object.userData.ship,Fe=mD({node:j,ship:_e,hex:de.button===2&&_e?rt(_e.xy):K,mode:t.model.mode,phase:t.model.phase,button:de.button});!Fe||t.model.busy||(Fe.type==="node"?e("node",{index:Fe.index,shipId:Fe.shipId}):Fe.type==="ship"?e("ship",{ship:Fe.ship,event:de}):e("hex",{hex:Fe.hex,event:de,forceMove:Fe.forceMove}))}function Q(){if(!r||!i.value)return;const de=i.value.getBoundingClientRect();b=Math.max(1,de.width),y=Math.max(1,de.height),r.setSize(b,y,!1),M()}function se(){var de,K,j,_e,Fe;!r||s.value||(u.update(t.model),c.update(t.model),f.update(t.model.visuals),Object.assign(r.domElement.dataset,{rendererStatus:"ready",cellCount:String(t.model.cells.length),shipCount:String(t.model.ships.length),planeCount:String(((de=t.model.planes)==null?void 0:de.length)||0),projectileCount:String(((j=(K=t.model.visuals)==null?void 0:K.projectiles)==null?void 0:j.length)||0),effectCount:String(((Fe=(_e=t.model.visuals)==null?void 0:_e.effects)==null?void 0:Fe.length)||0)}),x=!1,m=!0)}function q(){if(d=0,!(!r||s.value||document.hidden)){try{x&&se();const de=l.update();(m||de)&&(r.render(o,a),m=!1)}catch(de){he(de);return}d=requestAnimationFrame(q)}}function he(de){s.value=(de==null?void 0:de.message)||"WebGL 场景不可用",r&&(r.domElement.dataset.rendererStatus="error"),cancelAnimationFrame(d),d=0}function et(){cancelAnimationFrame(d),d=0,h==null||h.disconnect(),h=null,p.forEach(de=>de()),p=[],l==null||l.dispose(),u==null||u.dispose(),c==null||c.dispose(),f==null||f.dispose(),r&&(r.dispose(),r.forceContextLoss(),r.domElement.remove()),r=l=u=c=f=o=a=null,A.clear(),R=!1}function We(){et(),O(!1),s.value="",x=!0,m=!0;try{r=new ZF({antialias:!0,alpha:!1,powerPreference:"high-performance"}),r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)),r.setClearColor(464676),r.outputColorSpace=ui;const de=r.domElement;de.className="battle-map-canvas",de.setAttribute("aria-label","三维六角海战地图：点按选格，拖动平移，滚轮缩放"),de.setAttribute("role","img"),de.tabIndex=0,de.style.touchAction="none",de.dataset.cameraMode=_?"rotate":"pan",i.value.prepend(de),o=new Mw,o.add(new $w(13102070,2376277,2));const K=new Yw(16772827,2.2);K.position.set(-12,35,15),o.add(K),a=new Lf(-20,20,15,-15,.1,250),l=new jF(a,de),l.enableDamping=!1,l.minZoom=1,l.maxZoom=3,l.minPolarAngle=.15,l.maxPolarAngle=Math.PI/2.65,l.screenSpacePanning=!1,l.mouseButtons={LEFT:_?Bi.ROTATE:Bi.PAN,MIDDLE:Bi.ROTATE,RIGHT:Bi.PAN},l.touches={ONE:_?Yi.ROTATE:Yi.PAN,TWO:Yi.DOLLY_PAN},l.addEventListener("change",()=>{m=!0,e("zoom",a.zoom)}),u=new hD(o),c=new dD(o),f=new pD(o),L(de,"pointerdown",j=>{A.size||(R=!1),A.set(j.pointerId,{x:j.clientX,y:j.clientY,button:j.button}),A.size>1&&(R=!0)},!0),L(de,"pointermove",j=>{const _e=A.get(j.pointerId);_e&&s_(_e,j)&&(R=!0),A.size||e("hover",H(j))},!0),L(de,"pointerup",j=>{const _e=A.get(j.pointerId);if(!_e)return;const Fe=R||s_(_e,j)||A.size>1;A.delete(j.pointerId),Fe||Y(j)},!0),L(de,"pointercancel",j=>{R=!0,A.delete(j.pointerId)},!0),L(de,"lostpointercapture",j=>{A.has(j.pointerId)&&(R=!0,A.delete(j.pointerId))},!0),L(de,"pointerleave",()=>e("hover",null)),L(de,"contextmenu",j=>j.preventDefault()),L(de,"webglcontextlost",j=>{j.preventDefault(),he(new Error("图形上下文已中断，请重试加载战场。"))}),L(document,"visibilitychange",()=>{document.hidden?(cancelAnimationFrame(d),d=0):!d&&!s.value&&(m=!0,q())}),h=new ResizeObserver(Q),h.observe(i.value),I(),Q(),se(),q()}catch(de){he(de)}}return ro(()=>t.model,()=>{x=!0},{flush:"sync"}),So(We),Vl(et),()=>Sr("div",{ref:i,class:"battle-map-3d map-scroll"},s.value?[Sr("div",{class:"map-render-error",role:"alert"},[Sr("strong","三维战场暂时无法显示"),Sr("p",s.value),Sr("button",{onClick:We},"重试加载"),Sr("button",{onClick:()=>e("home")},"返回菜单")])]:[])}}),r_=(t,e,n)=>({x:t.x+(e.x-t.x)*n,y:t.y+(e.y-t.y)*n,z:t.z+(e.z-t.z)*n}),vD=(t,e)=>e.has(Je(rt({x:t.x,y:t.z}))),xD=Array.from({length:6},(t,e)=>({x:Math.cos(e*Math.PI/3),z:Math.sin(e*Math.PI/3)}));function yD(t,e,n){const i=[];for(const s of n){let r=0,o=1;for(const a of xD){const l=Math.sqrt(3)/2-1e-7,u=(t.x-s.x)*a.x+(t.z-s.y)*a.z,c=(e.x-t.x)*a.x+(e.z-t.z)*a.z;if(Math.abs(c)<1e-12){if(u>l){o=-1;break}continue}const f=(l-u)/c;if(c>0?o=Math.min(o,f):r=Math.max(r,f),r>o)break}r<=o&&r<=1&&o>=0&&i.push([Math.max(0,r),Math.min(1,o)])}return i.sort((s,r)=>s[0]-r[0]).map(([s,r])=>[r_(t,e,s),r_(t,e,r)])}function Wh(t,e){const n=t.kind==="main",i=t.kind==="aa",s=Math.hypot(t.to.x-t.from.x,t.to.y-t.from.y),r=n?Math.max(1.5,Math.min(5,s*.28)):i?.15:.12;return{x:t.from.x+(t.to.x-t.from.x)*e,y:(i?.2+e*1.4:n?0:.15)+4*r*e*(1-e),z:t.from.y+(t.to.y-t.from.y)*e}}function ED(t=[],e=0,n=new Set){const i=n instanceof Set?n:new Set(n),s=[...i].map(a=>{const[l,u]=a.split(",").map(Number);return kt({q:l,r:u})}),r=[],o=[];for(const a of t){if(a.type==="effect"){const m=(e-a.time)/a.duration;m>=0&&m<=1&&i.has(Je(a.at))&&o.push({id:a.id,kind:a.kind,at:{...a.at},age:m,text:a.text??""});continue}if(a.type!=="projectile"||e<a.start||e>a.end)continue;const l=(e-a.start)/(a.end-a.start),u=Wh(a,l),c=Math.max(0,l-(a.kind==="main"?.24:.55)),f=12,h=[];for(let m=0;m<f;m++){const x=Wh(a,c+(l-c)*m/f),_=Wh(a,c+(l-c)*(m+1)/f);for(const p of yD(x,_,s)){const b=h.at(-1),y=b==null?void 0:b.at(-1);y&&Math.hypot(y.x-p[0].x,y.z-p[0].z)<1e-8?b.push(p[1]):h.push(p)}}const d=vD(u,i)?u:null;if(!h.length){d&&r.push({id:a.id,kind:a.kind,team:a.team,position:d,trail:[]});continue}r.push({id:a.id,kind:a.kind,team:a.team,position:d,trail:h[0]});for(let m=1;m<h.length;m++)r.push({id:`${a.id}:trail:${m}`,kind:a.kind,team:a.team,position:null,trail:h[m]})}return{projectiles:r,effects:o}}function SD(t,e,n){if(!e||n<=0)return t;const i=s=>{const r=new Map(e[s].map(o=>[o.id,o]));return t[s].map(o=>{const a=r.get(o.id);return a?{...o,xy:{x:o.xy.x+(a.xy.x-o.xy.x)*n,y:o.xy.y+(a.xy.y-o.xy.y)*n}}:o})};return{...t,...Number.isFinite(t.t)&&Number.isFinite(e.t)?{t:t.t+(e.t-t.t)*n}:{},ships:i("ships"),torpedoes:i("torpedoes"),planes:i("planes")}}function bD(t,{speed:e,render:n,complete:i,request:s=a=>window.requestAnimationFrame(a),cancel:r=a=>window.cancelAnimationFrame(a),now:o=()=>performance.now()}){let a=!1,l,u=0,c=o();const f=t.length*110;n(t[0],0);const h=d=>{if(a)return;if(u+=Math.max(0,d-c)*e(),c=d,u>=f){a=!0,i();return}const m=u/110,x=Math.floor(m),_=m-x;let p=SD(t[x],t[x+1],_);x===t.length-1&&Number.isFinite(p.t)&&(p={...p,t:p.t+.1*_}),n(p,u/f),l=s(h)};return l=s(h),()=>{a=!0,r(l)}}const MD=Tc({components:{BattleMap3D:_D,HomeScreen:lT,SaveManager:uT,TutorialBook:cT,TutorialMenu:fT},setup(){const t=st("home"),e=st([...Bc]),n=st(0),i=st(20261004),s=st(null),r=st({}),o=st("0-0"),a=st("move"),l=st(0),u=st(0),c=st("point"),f=st(!1),h=st(""),d=st(!1),m=st(null),x=st(1),_=st(0),p=st(!1),b=st(null),y=st(null),g=st({}),E=st(!0),T=st("auto"),C=st(!1),v=st(!0),A=st(!1),R=st([]),L=st(""),M=st(null),I=st(""),F=st(null),B=st(null),O=st(""),z=st(null),H=st({}),Y=st(null),Q=st(1),se=st(!1),q=st(!0),he=st(!1),et=st(!0),We=st(!1),de=st(!1),K=ht(()=>le.value==="deploy"?We.value?"交换位置：点另一艘友舰":"部署":{move:"航线",torp:"鱼雷",main:"主炮",plane:"飞机",mine:"排雷"}[a.value]||"查看");function j(){var P;J.value&&((P=Y.value)==null||P.focus(kt(J.value.pos)))}function _e(P){var Pe,tt,je,bn;const V=((Pe=m.value)==null?void 0:Pe.ships)||((tt=s.value)==null?void 0:tt.ships)||[],ve=P.state==="return"?(je=V.find(Fs=>Fs.id===P.mother))==null?void 0:je.xy:(P.tracking?(bn=V.find(Fs=>Fs.id===P.targetId))==null?void 0:bn.xy:null)||kt(P.target);return ve?Math.atan2(ve.y-P.xy.y,ve.x-P.xy.x)*180/Math.PI:0}const Fe=S1();let Ce=null,Ze,N,k;const ee=bo().map(P=>{const V=kt(P);return{...P,k:Je(P),x:V.x*25+35,y:V.y*25+35}}),ce=P=>{const V=kt(P);return{x:V.x*25+35,y:V.y*25+35}},oe=P=>({x:P.x*25+35,y:P.y*25+35}),ue=P=>{const V=ce(P);return Array.from({length:6},(ve,Pe)=>{const tt=(Pe*60-30)*Math.PI/180;return`${V.x+24.3*Math.cos(tt)},${V.y+24.3*Math.sin(tt)}`}).join(" ")},xe=ht(()=>{var P;return new Set(((P=s.value)==null?void 0:P.map.islands)||[])}),ye=ht(()=>Nc[e.value[n.value]]),pe=ht(()=>n.value<3?"front":"back"),J=ht(()=>{var P;return(P=s.value)==null?void 0:P.ships.find(V=>V.id===o.value)}),U=ht(()=>r.value[o.value]||Gi()),Te=ht(()=>J.value?di(J.value,U.value,Me.value):[]),Ae=ht(()=>{var P;return((P=s.value)==null?void 0:P.ships.filter(V=>V.team===0))||[]}),D=ht(()=>{var P;return new Set(((P=m.value)==null?void 0:P.visible)||(s.value?[...gs(s.value,0)]:[]))}),S=ht(()=>{var P,V;return(((P=m.value)==null?void 0:P.ships)||((V=s.value)==null?void 0:V.ships.filter(lt))||[]).filter(ve=>ve.team===0||D.value.has(Je(rt(ve.xy))))}),G=ht(()=>{var P,V;return(((P=m.value)==null?void 0:P.torpedoes)||((V=s.value)==null?void 0:V.torpedoes)||[]).filter(ve=>ve.team===0||D.value.has(Je(rt(ve.xy))))}),Z=ht(()=>{var P,V;return(((P=m.value)==null?void 0:P.planes)||((V=s.value)==null?void 0:V.planes)||[]).filter(ve=>ve.team===0||D.value.has(Je(rt(ve.xy))))}),ie=ht(()=>{var P,V;return((P=m.value)==null?void 0:P.mines)||((V=s.value)==null?void 0:V.map.mines)||[]}),me=ht(()=>Ae.value.reduce((P,V)=>P+V.hp,0)),we=ht(()=>Ae.value.filter(lt).length),ae=ht(()=>S.value.filter(P=>P.team===1).length),le=ht(()=>{var P;return d.value?"execute":(P=s.value)==null?void 0:P.phase}),Re=ht(()=>{var P;return((P=J.value)==null?void 0:P.airReady.filter(V=>V<=s.value.round).length)||0}),Ne=ht(()=>{var P;return(((P=s.value)==null?void 0:P.log)||[]).filter(V=>V.team===0||V.team===null).slice(-35).reverse()}),Ee=ht(()=>{var P,V,ve;return new Set(((P=m.value)==null?void 0:P.explored)||((ve=(V=s.value)==null?void 0:V.explored)==null?void 0:ve[0])||[])}),Me=ht(()=>s.value?cm(s.value.map,Ee.value):{islands:[],mines:[]}),Ge=ht(()=>J.value&&le.value==="plan"?fm(J.value,U.value,Me.value):new Map),Ke=ht(()=>J.value&&le.value==="plan"?l1(J.value,U.value,Me.value,Ee.value):new Map),at=ht(()=>J.value?u1(J.value,U.value,Me.value):{main:new Set,secondary:new Set,aa:new Set,sweep:new Set,air:new Set}),$=ht(()=>J.value?Ed(J.value,U.value,Me.value,u.value):[]),be=ht(()=>T.value!=="auto"?T.value:a.value==="move"?"reach":a.value==="main"?"main":a.value==="plane"?"air":a.value==="mine"?"sweep":a.value==="torp"?"torp":"reach"),fe=ht(()=>!E.value||le.value!=="plan"?new Set:be.value==="reach"?new Set(Ke.value.keys()):be.value==="torp"?new Set($.value.flatMap(P=>P.cells).map(Je).filter(P=>Ee.value.has(P))):new Set([...at.value[be.value]||[]].filter(P=>["main","air","aa"].includes(be.value)||Ee.value.has(P)))),De=ht(()=>J.value&&le.value==="plan"?h1(J.value,U.value,Ae.value,r.value,Me.value):[]),Be=ht(()=>{var P;return!!((P=g.value[o.value])!=null&&P.undo.length)}),ge=ht(()=>{var P;return!!((P=g.value[o.value])!=null&&P.redo.length)}),qe=ht(()=>{if(!b.value||!J.value)return"";const P=b.value,V=Je(P),ve=Yt(J.value.pos,P);let tt=Ee.value.has(V)?"":"未探索 · ";if(a.value==="move"){const je=Ge.value.get(V);tt+=je?`从航线末端 ${je.cost} 步${Ke.value.has(V)?"可达":" · 试探航路"}`:"剩余步骤内不可达"}else if(a.value==="main")tt+=at.value.main.has(V)?`主炮射程内 · ${ve} 格`:`主炮射程外 · ${ve} 格`;else if(a.value==="plane"){const je=Uc(J.value.pos,P);tt+=`单程 ${je.toFixed(1)} / ${J.value.cfg.carrier.plane.range} 格${je>J.value.cfg.carrier.plane.range?" · 超出航程":""}`}else a.value==="mine"?tt+=at.value.sweep.has(V)?"回合初排雷范围内":"排雷范围外或被已知岛屿遮挡":a.value==="torp"&&(tt+="金线：本回合航程 · 虚线：剩余寿命范围");return tt}),$e=ht(()=>{var P,V,ve;return be.value==="reach"?`航线末端剩余 ${Math.max(0,(((P=J.value)==null?void 0:P.cfg.speed)||0)-U.value.moves.length)} 步 · 绿色为已知可达`:be.value==="secondary"?"副炮：规划终点范围；沿途仍可自动开火":be.value==="aa"?"防空：规划终点范围，不受岛屿遮挡":be.value==="main"?"主炮：回合初舰位射程，可隔岛盲射":be.value==="sweep"?"排雷：回合初舰位与已知直视范围":be.value==="air"?`飞机：母舰起飞位置的单程 ${((ve=(V=J.value)==null?void 0:V.cfg.carrier)==null?void 0:ve.plane.range)??Pi.plane.range} 格极限`:be.value==="torp"?"鱼雷：当前窗口的四个合法侧向；岛屿外的未知路径不保证畅通":""}),Ht=ht(()=>Z.value.filter(P=>P.team===0&&P.mother===o.value)),Mt=ht(()=>Ae.value.filter(lt).map(P=>{const V=r.value[P.id]||Gi(),ve=di(P,V,Me.value);return{ship:P,plan:V,nodes:ve,selected:P.id===o.value,torps:V.torps.map(Pe=>{const tt=ve[Pe.window];if(!tt)return null;const je=Ed(P,V,Me.value,Pe.window).find(bn=>bn.dir===Pe.dir);return je?{...Pe,origin:tt.pos,end:je.roundEnd,fullEnd:je.fullEnd}:null}).filter(Boolean),planes:V.planes.map(Pe=>{var je;const tt=Pe.mode==="point"?Pe.target:(je=s.value.ships.find(bn=>bn.id===Pe.targetId&&D.value.has(Je(bn.pos))))==null?void 0:je.pos;return tt?{...Pe,target:tt}:null}).filter(Boolean)}})),ei=ht(()=>{const P=new Map;for(const V of Mt.value)for(const ve of V.plan.main){const Pe=Je(ve),tt=P.get(Pe)||{at:ve,count:0,selected:!1};tt.count++,tt.selected=tt.selected||V.selected,P.set(Pe,tt)}return[...P.values()]}),ti=ht(()=>!!s.value&&!d.value&&!F.value),Ur=ht(()=>F.value?Fr.find(P=>P.id===F.value.lessonId):null),Or=ht(()=>{var P,V;return((V=Ur.value)==null?void 0:V.steps[(P=F.value)==null?void 0:P.stepIndex])||null}),ba=ht(()=>Ur.value?Fr.findIndex(P=>P.id===Ur.value.id):-1),Ma=new Set(po(0).map(Je)),Uf=ht(()=>ee.map(P=>({q:P.q,r:P.r,k:P.k,known:Ee.value.has(P.k),visible:D.value.has(P.k),island:Ee.value.has(P.k)&&xe.value.has(P.k),deploy:le.value==="deploy"&&Ma.has(P.k),overlay:fe.value.has(P.k)?be.value:null,tutorial:Qt(P),hovered:!!b.value&&tn(b.value,P)}))),Yl=ht(()=>{var P;return{cells:Uf.value,ships:S.value.map(V=>({...V,tutorial:Gt(V.id)})),planes:Z.value.map(V=>({...V,angle:_e(V)})),torpedoes:G.value,mines:ie.value,selected:o.value,phase:le.value,mode:a.value,previews:Mt.value,mainTargets:ei.value,rays:$.value,showPlans:v.value,showRanges:E.value,overlayType:be.value,busy:d.value,airRange:le.value==="plan"&&E.value&&be.value==="air"&&((P=J.value)!=null&&P.cfg.carrier)?{origin:J.value.pos,radius:J.value.cfg.carrier.plane.range*Math.sqrt(3)}:null,visuals:m.value&&y.value?ED(y.value.presentation||[],m.value.t||0,D.value):{projectiles:[],effects:[]}}});function Kl({hex:P,event:V,forceMove:ve}){nu(P,V,ve)}function Rs({ship:P,event:V}){zm(P,V)}function Aa({index:P,shipId:V}){En(P,V)}function Zl(P){P?ze(P,!1):b.value=null}function lr(){return{game:dt(nt(s.value)),plans:dt(nt(r.value)),selected:o.value,roster:[...e.value],seed:Number(i.value),metadata:{showPlans:v.value,showRanges:E.value,rangeMode:T.value}}}function ni(){R.value=Fe.list()}function ii(){if(!ti.value)return;const P=Fe.write("auto",lr(),{label:`自动 · R${String(s.value.round).padStart(2,"0")}`});if(P.ok)I.value="已自动保存";else{const V=I.value!==P.error.message;I.value=P.error.message,V&&Ve(P.error.message)}ni()}function To(){if(F.value)return ft();if(d.value)return Ve("请先完成回合结算，再保存或读取");L.value="",M.value=null,ni(),A.value=!0}function kr(){A.value=!1,M.value=null}function Ta({id:P,label:V},ve=!1){var tt;if(!ti.value)return;if(!ve&&((tt=R.value.find(je=>je.id===P))!=null&&tt.save)){M.value={kind:"write",id:P,label:V,message:`覆盖手动槽位 ${P.slice(-1)} 会替换其中的旧战局。请确认，或先导出旧存档`};return}const Pe=Fe.write(P,lr(),{label:V||`舰队 · R${String(s.value.round).padStart(2,"0")}`});L.value=Pe.ok?"手动存档已保存":Pe.error.message,M.value=null,ni()}function Jl(P){var V,ve,Pe;We.value=!1,q.value=!0,(V=Y.value)==null||V.reset(),N==null||N(),clearTimeout(Ze),s.value=dt(P.game),Xs(s.value),r.value=dt(P.plans),o.value=P.selected,e.value=[...P.roster],i.value=P.seed,d.value=!1,m.value=null,y.value=null,_.value=0,g.value={},l.value=0,u.value=0,a.value="move",c.value="point",b.value=null,C.value=!1,v.value=((ve=P.metadata)==null?void 0:ve.showPlans)??!0,E.value=((Pe=P.metadata)==null?void 0:Pe.showRanges)??!0,T.value="auto",h.value="",t.value="battle"}function jl(P,V=!1){const ve=Fe.read(P);if(!ve.ok){L.value=ve.error.message;return}if(s.value&&!V){M.value={kind:"load",id:P,message:"读取将替换当前战局，自动存档随后会记录新战局。如需保留当前内容，请先存入手动槽位或导出 JSON"};return}Jl(ve.save.state),kr(),I.value="已读取存档"}function Of(){const P=M.value;P&&(P.kind==="write"?Ta(P,!0):P.kind==="load"?jl(P.id,!0):P.kind==="import"?Ql(P.id,P.json):P.kind==="new"&&(kr(),t.value="fleet"))}function Ql(P,V){const ve=Fe.import(P,V);L.value=ve.ok?"JSON 已导入槽位，可点击读取":ve.error.message,M.value=null,ni()}async function eu({id:P,file:V}){var ve;if(V)try{if(V.size>Cl)throw new Error("存档文件过大（最大 2 MB）");const Pe=await V.text();zc(Pe),(ve=R.value.find(tt=>tt.id===P))!=null&&ve.save?M.value={kind:"import",id:P,json:Pe,message:`导入会覆盖手动槽位 ${P.slice(-1)}，请确认或先导出旧存档`}:Ql(P,Pe)}catch(Pe){L.value=Pe.message}}function w(P=null){try{const V=P||mm(lr(),{label:`舰队 R${s.value.round}`}),ve=kc(V),Pe=new Blob([ve],{type:"application/json"}),tt=URL.createObjectURL(Pe),je=document.createElement("a");je.href=tt,je.download=E1(V),je.click(),setTimeout(()=>URL.revokeObjectURL(tt),1e3),L.value="JSON 备份已导出"}catch(V){L.value=V.message}}function W(){y.value?zf():(clearTimeout(k),N==null||N(),d.value=!1,m.value=null,_.value=0),re()}function re(){if(!d.value){if(F.value){Ie();return}ii(),t.value="home",ni()}}function te(){s.value?(ii(),A.value=!0,ni(),M.value={kind:"new",message:"开始新游戏会替换当前战局，并更新自动存档。请先把需要保留的内容存入手动槽位或导出 JSON"}):t.value="fleet"}function ne(){return{game:nt(s.value),plans:nt(r.value),selected:o.value,mode:a.value,rangeMode:{air:"plane",reach:"reachable"}[be.value]||be.value,showRanges:E.value}}function Se(P,V=!1){if(!F.value)return;const ve=w1(rh,nt(F.value),ne(),{shipId:o.value,...P});F.value=ve.state,ve.feedback&&(O.value=ve.feedback,(ve.advanced||!V)&&Ve(ve.feedback))}function ke(P){var ve,Pe,tt;q.value=!0,We.value=!1,(ve=Y.value)==null||ve.reset(),F.value||(s.value&&ii(),Ce=s.value?lr():null);const V=C1(rh,P);B.value=V,F.value=b1(P),s.value=V.game,Xs(s.value),r.value=V.plans,o.value=V.selected,a.value=V.mode||"move",T.value=V.rangeMode||"auto",E.value=V.showRanges??!0,v.value=!0,t.value="battle",d.value=!1,m.value=null,y.value=null,_.value=0,g.value={};for(const[je,bn]of Object.entries(V.plans)){const Fs=V.game.ships.find(Ca=>Ca.id===je);Fs&&((Pe=bn.segments)!=null&&Pe.length)&&(g.value[je]={undo:bn.segments.map(Ca=>ju(Fs,bn,Me.value,Ca.start).plan),redo:[]})}l.value=0,u.value=0,b.value=null,C.value=!1,O.value=((tt=Ur.value)==null?void 0:tt.description)||"",z.value=null}function Ie(){N==null||N(),F.value=null,B.value=null,O.value="",Ce?(Jl(Ce),Ce=null):(s.value=null,r.value={},H.value={},d.value=!1,m.value=null,y.value=null),t.value="home",ni()}function He(){F.value&&Ie(),t.value="lessons"}function Xe(){var P;if((P=F.value)!=null&&P.complete){const V=Fr[ba.value+1];V?ke(V.id):He()}}function ft(){z.value=dt(lr()),Se({type:"save",saved:!0}),Ve("演练已保存到内存，普通存档未改动")}function mt(P,V){return(P==null?void 0:P.kind)==="event"?P.types.includes(V):(P==null?void 0:P.kind)==="all"&&P.conditions.some(ve=>mt(ve,V))}function ze(P,V=!1){var ve;return b.value=P,F.value&&mt((ve=Or.value)==null?void 0:ve.condition,"inspect")?(Se({type:"inspect",cell:{q:P.q,r:P.r}},!V),!0):!1}function wt(P){var V;return!!((V=Or.value)!=null&&V.highlights.some(ve=>ve.kind==="control"&&ve.id===P))}function Qt(P){var V;return!!((V=Or.value)!=null&&V.highlights.some(ve=>ve.kind==="cell"&&tn(ve.cell,P)))}function Gt(P){var V;return!!((V=Or.value)!=null&&V.highlights.some(ve=>ve.kind==="ship"&&ve.shipId===P))}function Nt(){Se({type:"overlay",rangeMode:be.value})}function yn(){E.value=!E.value,Nt()}function Oe(P){l.value=P,Se({type:"turn",turn:P})}function En(P,V){le.value!=="plan"||d.value||o.value!==V||a.value!=="move"||(Tt(P),Se({type:"truncate",index:P}))}ni();const Ve=P=>{h.value=P,clearTimeout(Ze),Ze=setTimeout(()=>h.value="",3500)},si=P=>{const V=Ea(P);return`${String.fromCharCode(65+V.c)}${V.r+1}`};function Mi(P){Nc[P].role===pe.value&&(e.value[n.value]=P)}function is(){var V;q.value=!0,We.value=!1,(V=Y.value)==null||V.reset();const P=Number(i.value);i.value=Number.isFinite(P)&&Math.max(-Number.MAX_SAFE_INTEGER,Math.min(Number.MAX_SAFE_INTEGER,Math.trunc(P)))||20261004,N==null||N(),clearTimeout(Ze),d.value=!1,m.value=null,_.value=0,l.value=0,u.value=0,c.value="point",b.value=null,h.value="",p.value=!1,g.value={},C.value=!1,T.value="auto",E.value=!0,v.value=!0,s.value=s1(e.value,Number(i.value)||20261004),o.value="0-0",r.value={},H.value={},t.value="battle",a.value="move",y.value=null,ii()}function Ai(P){var V;P.team!==0||!lt(P)||d.value||(We.value=!1,o.value=P.id,l.value=0,u.value=(((V=r.value[P.id])==null?void 0:V.moves)||[]).length,a.value="move",C.value=!1,T.value="auto",ii(),Se({type:"select",shipId:P.id}))}function xt(){return!J.value||!lt(J.value)||le.value!=="plan"?null:(r.value[J.value.id]||(r.value[J.value.id]=Gi()),r.value[J.value.id])}function $t(P){const V=dt(nt(U.value));return xt()?(c1(g.value,o.value,V,P),r.value[o.value]=P,u.value=Math.min(u.value,P.moves.length),ii(),!0):!1}function Sn(P){const V=dt(nt(U.value));return P(V),$t(V)}function Tt(P){const V=ju(J.value,nt(U.value),Me.value,P);$t(V.plan)&&V.removedTorps&&Ve(`航线改变，已取消 ${V.removedTorps} 个失效鱼雷窗口`),u.value=Math.min(u.value,P)}function Ti(P,V){if(!xt())return;if(U.value.moves.length>=J.value.cfg.speed)return Ve("该舰的移动步骤已用完");const ve=Te.value.at(-1),Pe=V?Ni(ve.pos,Pn(ve.heading+P)):ve.pos;if(!Qi(Me.value,Pe))return Ve("这一步会驶入已知岛屿或海图外");Sn(tt=>{const je=tt.moves.length;tt.moves.push({turn:P,forward:V}),(tt.segments||(tt.segments=[])).push({start:je,end:tt.moves.length,target:{...Pe}})}),l.value=0,u.value=U.value.moves.length,Se({type:"move",turn:P,forward:V})}function ss(P=null){xt()&&(Tt(P===null?Math.max(0,U.value.moves.length-1):P),Se({type:"undo"}))}function tu(){var Pe;const P=U.value.segments||[];if(!P.length)return ss();const V=ju(J.value,nt(U.value),Me.value,P.at(-1).start).plan,ve=(Pe=g.value[o.value])==null?void 0:Pe.undo.at(-1);ve&&JSON.stringify(ve)===JSON.stringify(V)?kf("undo"):(Tt(P.at(-1).start),Se({type:"undo"}))}function _y(P){var ve;const V=(ve=U.value.segments)==null?void 0:ve[P];V&&(Tt(V.start),Se({type:"truncate",index:V.start}))}function Om(){xt()&&(Tt(0),l.value=0,u.value=0)}function vy(){Om(),C.value=!0,a.value="move",Ve("已清除本舰航线，其他武器指令保留。点击新航点重新规划"),Se({type:"redraw"})}function kf(P){if(!xt())return;const V=f1(g.value,o.value,nt(U.value),P);V&&(r.value[o.value]=V,u.value=Math.min(u.value,V.moves.length),l.value=0,ii(),Se({type:P}))}function xy(P,V){Sn(ve=>{P==="sweep"?ve.sweep=null:ve[P].splice(V,1)})}function km(P){if(!xt())return;const V=Te.value.at(-1);if(tn(V.pos,P))return Ve("用“等待”消耗一步原地停留");const ve=Ke.value.get(Je(P))||Ge.value.get(Je(P));if(!ve)return Ve("剩余步数与转向限制内无法抵达；可先原地转向");Sn(Pe=>{const tt=Pe.moves.length;Pe.moves.push(...ve.moves),(Pe.segments||(Pe.segments=[])).push({start:tt,end:Pe.moves.length,target:{q:P.q,r:P.r}})}),u.value=U.value.moves.length,C.value=!1,ve.path.every(Pe=>Ee.value.has(Je(Pe)))||Ve("这是未探索的试探航路，执行时可能被岛屿截停"),De.value.length?Ve(`航路已记录 ${U.value.moves.length} 步，但可能与 ${De.value.join("、")} 碰撞并回退`):ve.path.every(Pe=>Ee.value.has(Je(Pe)))&&Ve(`航路已记录，共 ${U.value.moves.length} 步`),Se({type:"route",target:{q:P.q,r:P.r}})}function wa(P){if(le.value!=="plan"||!J.value)return;const V=J.value.cfg;if(P==="main"&&(!V.main||J.value.mainReady>s.value.round))return Ve("本舰没有可用主炮");if(P==="torp"&&(!V.torpedo||J.value.torps<=0))return Ve("本舰没有可用鱼雷");if(P==="plane"&&(!V.carrier||Re.value===0))return Ve("本舰没有已整备飞机");if(P==="mine"&&!V.secondary)return Ve("本舰没有副炮，无法远程排雷");a.value=P,C.value=!1,T.value="auto",Se({type:"mode"})}function nu(P,V,ve=!1){if(ze(P,!0)||(b.value=P,d.value||!J.value))return;const Pe=s.value.ships.find(je=>lt(je)&&tn(je.pos,P)&&(je.team===0||D.value.has(Je(P))));if(le.value==="deploy"){if((Pe==null?void 0:Pe.team)===0&&!ve&&!We.value){Ai(Pe);return}if(!po(0).some(je=>tn(je,P)))return Ve("请选择左下角蓝色 3×3 部署区");if(Pe&&Pe.id!==J.value.id&&(Pe.pos={...J.value.pos},Pe.xy=kt(Pe.pos)),We.value&&(!Pe||Pe.id===J.value.id))return Ve("请选择另一艘友舰交换位置，或取消交换");We.value=!1,J.value.pos={q:P.q,r:P.r},J.value.xy=kt(P),Xs(s.value),ii(),Se({type:"deploy",target:{q:P.q,r:P.r}});return}if(le.value!=="plan")return;if(ve||a.value==="move"){if((Pe==null?void 0:Pe.team)===0&&!ve){Ai(Pe);return}km(P);return}const tt=xt();if(a.value==="main"){if(Yt(J.value.pos,P)>J.value.cfg.main.range)return Ve(`落点超出主炮 ${J.value.cfg.main.range} 格射程`);if(tt.main.length>=J.value.cfg.main.shots)return Ve("已设定 3 个落点，可在行动列表删除");Sn(je=>je.main.push({q:P.q,r:P.r})),Se({type:"main",target:{q:P.q,r:P.r}})}if(a.value==="torp"){const je=Te.value[u.value];if(!je)return;if(tt.torps.some(Hf=>Hf.window===u.value))return Ve("这个发射窗口已有 1 枚鱼雷");if(tt.torps.length>=Math.min(J.value.torps,J.value.cfg.torpedo.max))return Ve("本回合最多 3 枚，并受备弹限制");if(tn(je.pos,P))return Ve("点击发射方向上的其他格");const bn=kt(je.pos),Fs=kt(P),Ca=Math.atan2(Fs.y-bn.y,Fs.x-bn.x),Vf=Pn(Math.round(Ca/(Math.PI/3)));if([je.heading,Pn(je.heading+3)].includes(Vf))return Ve("鱼雷只能沿侧面四个方向发射");Sn(Hf=>Hf.torps.push({window:u.value,dir:Vf})),Se({type:"torpedo",window:u.value,dir:Vf})}if(a.value==="plane"){if(tt.planes.length>=Math.min(J.value.cfg.carrier.launch,Re.value))return Ve("每回合最多放飞 2 架，且需要已整备飞机");if(c.value==="target"){if(!Pe||Pe.team===0||!D.value.has(Je(P)))return Ve("请选择当前可见的敌舰");Sn(je=>je.planes.push({mode:"target",targetId:Pe.id})),Se({type:"plane",target:Pe.pos})}else{if(Uc(J.value.pos,P)>J.value.cfg.carrier.plane.range+1e-8)return Ve("终点超过飞机单程航程极限，请选择紫色边界内位置");Sn(je=>je.planes.push({mode:"point",target:{q:P.q,r:P.r}})),Se({type:"plane",target:{q:P.q,r:P.r}})}}if(a.value==="mine"){if(!ie.value.some(je=>tn(je,P)))return Ve("请选择公开水雷格");if(Yt(J.value.pos,P)>J.value.cfg.secondary.range||!rr(s.value.map,J.value.pos,P))return Ve("水雷不在回合初副炮射程或被岛屿遮挡");Sn(je=>je.sweep={q:P.q,r:P.r}),Se({type:"sweep",target:{q:P.q,r:P.r}})}}function zm(P,V){if(V.stopPropagation(),!ze(rt(P.xy),!0)){if(le.value==="deploy"&&We.value){nu(rt(P.xy),V,!0);return}le.value==="plan"&&a.value!=="move"?nu(rt(P.xy)):Ai(P)}}function yy(){We.value=!1,Xs(s.value),s.value.phase="plan",Ve("规划不限时。给各舰下令后，按“执行回合”"),ii(),Se({type:"begin"})}function Vm(){d.value||le.value!=="plan"||(d.value=!0,a.value="move",_.value=0,Se({type:"execute"}),k=setTimeout(()=>{var P;try{const V=dt(nt(s.value)),ve=dt(nt(r.value)),Pe=F.value?((P=B.value.opponentPlansByRound)==null?void 0:P[V.round])||B.value.opponentPlans||{}:a1(V,1),tt=o1(V,{...Pe,...ve});y.value=tt,N=bD(tt.frames,{speed:()=>x.value,render:(je,bn)=>{m.value=je,_.value=bn},complete:zf})}catch(V){d.value=!1,Ve("结算出现异常："+V.message),console.error(V)}},35))}function zf(){var ve;if(!y.value)return;N==null||N();const P=d1(nt(s.value),nt(r.value),nt(y.value));s.value=y.value.game,y.value=null,m.value=null,d.value=!1,_.value=0,r.value={},H.value={},g.value={},C.value=!1,lt(J.value||{hp:0})||(o.value=((ve=Ae.value.find(lt))==null?void 0:ve.id)||""),a.value="move",u.value=0,l.value=0,ii(),H.value=P;const V=Object.entries(P).filter(([,Pe])=>Pe.blocked);V.length&&Ve(V.map(([Pe,tt])=>{var je;return`${(je=s.value.ships.find(bn=>bn.id===Pe))==null?void 0:je.label}：${tt.reason}`}).join("；")),Se({type:"roundComplete"})}function Ey(){xt()&&$t(Gi()),u.value=0,l.value=0}const Sy=["东","东南","西南","西","西北","东北"];function by(P){const V=r.value[P.id]||Gi();return V.moves.length+V.torps.length+V.main.length+V.planes.length+(V.sweep?1:0)}function My(P){return di(P,r.value[P.id]||Gi(),Me.value).map(ve=>{const Pe=ce(ve.pos);return`${Pe.x},${Pe.y}`}).join(" ")}function Ay(P){const V=Te.value[P.window];return V?ce({q:V.pos.q+ns[P.dir][0]*J.value.cfg.torpedo.speed,r:V.pos.r+ns[P.dir][1]*J.value.cfg.torpedo.speed}):null}function Hm(P){if(A.value){P.key==="Escape"&&(P.preventDefault(),M.value?M.value=null:kr());return}if(P.target.matches("input,select,textarea")||f.value||t.value!=="battle"||le.value!=="plan")return;const V=P.key.toLowerCase();if((P.ctrlKey||P.metaKey)&&V==="z"){P.preventDefault(),kf(P.shiftKey?"redo":"undo");return}if([" ","backspace","enter","q","e","w","t","g","f","m","escape","z"].includes(V)&&P.preventDefault(),V==="q")Oe(-1);else if(V==="e")Oe(1);else if(V==="z")Oe(0);else if(V==="w")Ti(l.value,!0);else if(V===" ")Ti(l.value,!1);else if(V==="backspace")ss();else if(V==="t")wa("torp");else if(V==="g")wa("main");else if(V==="f")wa("plane");else if(V==="m")wa("mine");else if(V==="escape")a.value="move",C.value=!1,T.value="auto";else if(V==="enter")Vm();else if(/[1-5]/.test(V)){const ve=Ae.value[Number(V)-1];ve&&Ai(ve)}}return So(()=>window.addEventListener("keydown",Hm)),xa(()=>{window.removeEventListener("keydown",Hm),clearTimeout(k),N==null||N()}),{mapExit:W,mapModel:Yl,mapHex:Kl,mapShip:Rs,mapNode:Aa,mapHover:Zl,cameraRotate:se,routeConflicts:De,lastMovement:H,planeAngle:_e,mapView:Y,mapZoom:Q,ordersOpen:q,rangeToolsOpen:he,portraitHint:et,swapMode:We,coachOpen:de,modeLabel:K,locateShip:j,finished:y,S:tT,T:aT,saveOpen:A,saveRecords:R,saveNotice:L,pendingSave:M,saveStatus:I,canSave:ti,tutorial:F,tutorialFixture:B,tutorialFeedback:O,lesson:Ur,tutorialStep:Or,tutorialIndex:ba,practiceSave:z,refreshSaves:ni,autosave:ii,openSaves:To,closeSaves:kr,writeSave:Ta,loadSave:jl,confirmSaveAction:Of,importSave:eu,exportSave:w,goHome:re,newGame:te,startLesson:ke,exitTutorial:Ie,lessonMenu:He,nextLesson:Xe,savePractice:ft,inspectCell:ze,isControl:wt,isTutorialCell:Qt,isTutorialShip:Gt,rangeChanged:Nt,toggleRanges:yn,chooseTurn:Oe,truncateNode:En,showPlans:v,previews:Mt,mainTargets:ei,P:KA,history:g,showRanges:E,rangeMode:T,replan:C,explored:Ee,knowledge:Me,reachable:Ge,certain:Ke,ranges:at,rays:$,overlayType:be,overlayCells:fe,canUndo:Be,canRedo:ge,hoverHint:qe,rangeHint:$e,airborne:Ht,applyEdit:$t,mutate:Sn,trimRoute:Tt,undoWaypoint:tu,removeWaypoint:_y,clearMovement:Om,startReplan:vy,historyChange:kf,removeOrder:xy,E:rh,screen:t,roster:e,slot:n,seed:i,game:s,plans:r,selected:o,mode:a,pendingTurn:l,torpWindow:u,planeMode:c,showRules:f,toast:h,busy:d,playFrame:m,playSpeed:x,progress:_,showLog:p,hover:b,shapes:ee,point:ce,xy:oe,polygon:ue,island:xe,currentTemplate:ye,role:pe,ship:J,plan:U,nodes:Te,own:Ae,visible:D,displayShips:S,displayTorps:G,displayPlanes:Z,mines:ie,ourHP:me,ourCount:we,visibleEnemies:ae,phase:le,readyAircraft:Re,safeLogs:Ne,coord:si,pickType:Mi,start:is,choose:Ai,addMove:Ti,undo:ss,pathTo:km,setMode:wa,clickHex:nu,shipClick:zm,begin:yy,execute:Vm,complete:zf,resetPlan:Ey,directionNames:Sy,mainCounts:by,plannedPolyline:My,torpEnd:Ay}},template:`
<div class="shell" :class="{'battle-active':screen==='battle','orders-closed':!ordersOpen}">
<header class="topbar">
<div class="brand"><strong>碧蓝推演棋</strong></div>
<span class="release-tag">v0.4.0</span>
<div class="top-actions">
<span class="version-note">{{saveStatus||'PvAI · 规则测试版'}}</span>
<button v-if="screen!=='home'" class="quiet" :disabled="busy" @click="goHome">主菜单</button>
<button v-if="screen==='battle'" class="quiet" :disabled="busy" @click="openSaves">{{tutorial?'练习保存':'保存/读取'}}</button>
<button class="quiet" @click="showRules=true">规则与操作 <span class="key">?</span>
</button>
<button v-if="screen==='battle'&&!tutorial" class="quiet" :disabled="busy" @click="newGame">重新编队</button>
</div>
</header>
<div v-if="showLog&&screen==='battle'" class="mobile-log modal-backdrop" @click.self="showLog=false">
<section role="dialog" aria-modal="true" aria-label="战报" class="rules-modal"><div class="panel-title"><h2>战报</h2><button @click="showLog=false">关闭战报</button></div><p v-if="!safeLogs.length">尚未交战</p><p v-for="(l,i) in safeLogs" :key="i">R{{l.round}} · {{l.text}}</p></section></div>
<HomeScreen v-if="screen==='home'" :can-resume="!!game" :save-count="saveRecords.filter(r=>r.save).length" @new="newGame" @load="openSaves" @book="screen='book'" @tutorial="lessonMenu" @resume="screen='battle'"/>
<TutorialBook v-if="screen==='book'" :chapters="T.TEXT_TUTORIAL" :figures="T.SVG_FIGURES" @home="goHome" @practice="lessonMenu"/>
<TutorialMenu v-if="screen==='lessons'" :lessons="T.TUTORIAL_LESSONS" @home="goHome" @start="startLesson"/>
<main v-if="screen==='fleet'" class="fleet-screen">
 <div class="section-intro">
<div>
<p class="eyebrow">01 / FLEET ASSEMBLY</p>
<h1>出击编队</h1>
<p>选择 3 艘前排、2 艘后排。相同配置可以重复选用</p>
</div>
<span class="flag">对手：战术 AI</span>
</div>
 <div class="assembly-grid">
<section class="roster-panel">
<div class="panel-title">
<h2>我方舰队</h2>
<span>05 / 05</span>
</div>
<div class="role-label">前排 · 机动与护航</div>
<button v-for="(type,i) in roster" :key="i" :class="['roster-slot',{active:slot===i}]" @click="slot=i">
<span class="slot-index">0{{i+1}}</span>
<div>
<small>{{i<3?'前排':'后排'}}</small>
<strong>{{E.TEMPLATES[type].name}}-{{i+1}}</strong>
</div>
<span class="slot-stat">{{E.TEMPLATES[type].hp}} <small>HP</small>
</span>
<span class="selection-indicator">{{slot===i?'编辑中':'更换'}}</span>
</button>
<p class="muted roster-note">前后排只是编队标签；所有舰船在同一片海域自由活动</p>
</section>
 <section class="templates-panel">
<div class="panel-title">
<h2>选择{{role==='front'?'前排':'后排'}}配置</h2>
<span>槽位 0{{slot+1}}</span>
</div>
<div class="template-options">
<button v-for="(t,id) in E.TEMPLATES" v-show="t.role===role" :key="id" :class="['template-card',{active:roster[slot]===id}]" @click="pickType(id)">
<div class="template-top">
<strong>{{t.name}}</strong>
<span>{{roster[slot]===id?'已编入':'选用'}}</span>
</div>
<div class="stat-grid">
<div>
<b>{{t.hp}}</b>
<small>耐久</small>
</div>
<div>
<b>{{t.speed}}</b>
<small>步 / 回合</small>
</div>
<div>
<b>{{t.vision}}</b>
<small>视野</small>
</div>
</div>
<p v-if="t.contactSweep">高速机动 · 强化防空 · 接触排雷</p>
<p v-else-if="t.torpedo">9 枚备弹 · 鱼雷与副炮兼顾</p>
<p v-else-if="t.secondary?.multi">多目标副炮 · 每敌舰每回合一炮</p>
<p v-else-if="t.main">{{t.main.shots}} 发主炮 · {{t.main.range}} 格盲射 · 隔轮装弹</p>
<p v-else>6 架飞机 · 每回合最多放飞 2 架</p>
<div class="loadout-line">
<span v-if="t.secondary">副炮 {{t.secondary.damage}} / {{t.secondary.range}} 格</span>
<span v-if="t.torpedo">鱼雷 {{t.torpedo.reserve}} 枚</span>
<span v-if="t.aa">防空 {{t.aa.range}} 格</span>
<span v-if="t.carrier">飞机 {{t.carrier.plane.hp}} HP · 单程 {{t.carrier.plane.range}} 格 · 整备回血 {{t.carrier.heal ?? 1}}</span>
</div>
</button>
</div>
</section>
</div>
 <section class="sortie-bar">
<div>
<span class="eyebrow">作战海域</span>
<strong>19 × 15 六角海图</strong>
<span class="muted">镜像岛群 · 8 枚公共水雷 · 最多 30 回合</span>
</div>
<label class="seed-label">地图种子 <input type="number" v-model="seed" aria-label="地图种子">
</label>
<button class="primary large" @click="start">进入部署</button>
</section>
 <p class="footnote">规划不限时 · 双方同步执行 · AI 遵守相同视野规则 · 无联网对战</p>
</main>
<main v-if="screen==='battle'" class="battle-screen">
<div v-if="portraitHint" class="portrait-hint"><span>横屏海图更宽，竖屏也可完整操作</span><button aria-label="关闭横屏提示" @click="portraitHint=false">关闭</button></div>
 <section v-if="tutorial" class="tutorial-coach" :class="{expanded:coachOpen}">
<div>
<span class="eyebrow">独立演练 · {{tutorialIndex+1}} / {{T.TUTORIAL_LESSONS.length}}</span>
<h2>{{lesson.title}}</h2>
<strong>{{tutorial.complete?'本课完成':(tutorial.stepIndex+1)+' / '+lesson.steps.length+' · '+tutorialStep?.title}}</strong>
<p>{{tutorial.complete?tutorialFeedback:tutorialStep?.instruction}}</p>
<small>{{tutorial.complete?'可以重试本课，或继续下一课':tutorialStep?.hint}}</small>
</div>
<div class="coach-actions">
<button :disabled="busy" @click="startLesson(lesson.id)">重试本课</button>
<button :disabled="busy||tutorialIndex===0" @click="startLesson(T.TUTORIAL_LESSONS[tutorialIndex-1].id)">上一课</button>
<button class="primary" :disabled="busy||!tutorial.complete" @click="nextLesson">下一课</button>
<button :disabled="busy" @click="exitTutorial">退出教学</button>
</div>
</section>
 <section class="battle-strip">
<button v-if="tutorial" class="mobile-only" @click="coachOpen=!coachOpen" :aria-expanded="coachOpen">教学提示</button>
<div class="round">
<small>ROUND</small>
<strong>{{String(game.round).padStart(2,'0')}}<span>/ 30</span>
</strong>
</div>
<div class="phase-heading">
<span class="eyebrow">{{phase==='deploy'?'02 / DEPLOYMENT':phase==='execute'?'04 / SIMULTANEOUS EXECUTION':'03 / ORDERS'}}</span>
<h1>{{phase==='deploy'?'舰队部署':phase==='execute'?'同步执行中':phase==='ended'?(game.winner==='draw'?'战局结束 · 平局':game.winner===0?'战局结束 · 胜利':'战局结束 · 败北'):'战术规划'}}</h1>
</div>
<div class="fleet-metric">
<b>{{ourCount}} 艘</b>
<small>我方 / {{ourHP}} HP</small>
</div>
<div class="fleet-metric enemy">
<b>{{visibleEnemies}} 艘</b>
<small>当前可见敌舰</small>
</div>
<nav class="mobile-fleet" aria-label="选择舰船">
<button v-for="s in own" :key="s.id" :class="['mobile-ship',{active:selected===s.id,sunk:s.hp<=0}]" :disabled="s.hp<=0||busy" @click="choose(s)" :aria-pressed="selected===s.id">{{s.label}}</button>
</nav>
<button class="mobile-only orders-toggle" :aria-label="ordersOpen?'收起指令':'展开指令'" @click="ordersOpen=!ordersOpen" :aria-expanded="ordersOpen">指令</button>
<button class="mobile-only" @click="showLog=!showLog">战报</button>
<div class="execute-controls">
<template v-if="busy">
<select v-model.number="playSpeed" aria-label="执行速度">
<option :value="1">1× 速度</option>
<option :value="2">2× 速度</option>
<option :value="4">4× 速度</option>
</select>
<button :disabled="!finished" @click="complete">跳过动画</button>
</template>
<button v-else-if="phase==='deploy'" class="primary" @click="begin" :data-tutorial-highlight="isControl('begin')?'true':null">完成部署</button>
<button v-else-if="phase==='ended'" class="primary" @click="screen='fleet'">再战一局</button>
<button v-else class="primary" @click="execute" :data-tutorial-highlight="isControl('execute')?'true':null">执行回合 <span class="key">Enter</span>
</button>
</div>
</section>
 <div class="battle-layout">
<aside class="fleet-sidebar">
<div class="panel-title">
<h2>我方舰队</h2>
<span>1–5 选择</span>
</div>
<button v-for="(s,i) in own" :key="s.id" :class="['ship-row',{active:selected===s.id,sunk:s.hp<=0}]" :disabled="s.hp<=0||busy" @click="choose(s)">
<div class="ship-row-title">
<b>{{s.label}}</b>
<span>{{s.hp>0?mainCounts(s)+' 项指令':'已沉没'}}</span>
</div>
<div class="health">
<i :style="{width:s.hp/s.cfg.hp*100+'%'}">
</i>
</div>
<div class="ship-row-meta">
<span>{{s.hp}} / {{s.cfg.hp}}</span>
<span>{{s.cfg.speed}} 步 · {{coord(s.pos)}}</span>
</div>
</button>
<div class="legend">
<span>
<i class="legend-dot cyan">
</i> 我方</span>
<span>
<i class="legend-dot red">
</i> 敌方</span>
<span>◇ 水雷全图公开</span>
<span>黑色：未探索 · 灰暗：已探索</span>
</div>
<button class="log-toggle" @click="showLog=!showLog">{{showLog?'收起':'查看'}}战报 <span>{{safeLogs.length}}</span>
</button>
<div v-if="showLog" class="battle-log">
<p v-if="!safeLogs.length">尚未交战</p>
<p v-for="(l,i) in safeLogs" :key="i">
<small>R{{l.round}}</small>{{l.text}}</p>
</div>
<div class="seed-caption">海图 #{{game.seed}}</div>
</aside>
 <section class="ocean-panel" :class="{'tools-open':rangeToolsOpen}">
<div class="camera-tools">
<button aria-label="放大海图" @click="mapView?.zoomBy(1.25)" :disabled="mapZoom>=3">＋</button>
<button aria-label="缩小海图" @click="mapView?.zoomBy(.8)" :disabled="mapZoom<=1">−</button>
<button @click="mapView?.reset()">全图</button>
<button @click="locateShip">定位当前舰</button>
<button @click="mapView?.toggleRotate()" :class="{active:cameraRotate}" :aria-pressed="cameraRotate">{{cameraRotate?'旋转中':'旋转视角'}}</button>
<button v-if="phase==='plan'" class="mobile-only" @click="rangeToolsOpen=!rangeToolsOpen" :aria-expanded="rangeToolsOpen">图层</button>
<span class="camera-help">拖动平移 · 双指／滚轮缩放 · 点选下令</span>
</div>
<div class="map-caption">
<span>{{phase==='deploy'?'在蓝色区域点击部署；点舰船切换选择':phase==='plan'?'点友舰选中 · 航线模式点格子追加航段 · 面板切换武器':'所有舰船、飞机与鱼雷共用时间轴'}}</span>
<span>{{hover?coord(hover):'19 × 15'}}</span>
</div>
<div v-if="phase==='plan'" class="map-tools">
<button :class="{active:showRanges}" @click="toggleRanges" :data-tutorial-highlight="isControl('ranges')?'true':null">{{showRanges?'隐藏范围':'显示范围'}}</button>
<select v-model="rangeMode" @change="rangeChanged" aria-label="范围提示类型">
<option value="auto">当前操作</option>
<option value="reach">可达位置</option>
<option v-if="ship?.cfg.secondary" value="secondary">副炮 · 终点</option>
<option v-if="ship?.cfg.aa" value="aa">防空 · 终点</option>
<option v-if="ship?.cfg.main" value="main">主炮 · 回合初</option>
<option v-if="ship?.cfg.carrier" value="air">飞机单程极限</option>
</select>
<button :class="{active:showPlans}" @click="showPlans=!showPlans">{{showPlans?'隐藏全部计划':'显示全部计划'}}</button>
<span>{{showRanges?rangeHint:'范围提示已隐藏'}}</span>
</div>
<BattleMap3D ref="mapView" :model="mapModel" @zoom="mapZoom=$event" @rotate="cameraRotate=$event"
 @hex="mapHex" @ship="mapShip" @node="mapNode" @hover="mapHover" @home="mapExit" />
<div class="map-footer">
<span>
<i class="legend-dot cyan">
</i> 共享视野 {{ship?.cfg.vision||5}} 格 · 岛屿遮挡视线</span>
<span class="hover-hint">{{hoverHint||'水雷公开 · 黑色未探索 · 灰暗记忆地形'}}</span>
</div>
<div v-if="busy" class="execution-progress" :style="{width:progress*100+'%'}">
</div>
</section>
 <aside class="orders-sidebar" v-if="ship" :class="{collapsed:!ordersOpen}" aria-label="舰船指令">

<div class="selected-heading">
<div>

<h2>{{ship.label}}</h2>
</div>
<span class="heading-label">{{directionNames[ship.heading]}}</span>
</div>
<details v-if="phase==='plan'" class="mobile-range-tools"><summary>范围与计划图层</summary>
<button :class="{active:showRanges}" @click="toggleRanges" :data-tutorial-highlight="isControl('ranges')?'true':null">{{showRanges?'隐藏范围':'显示范围'}}</button>
<select v-model="rangeMode" @change="rangeChanged" aria-label="范围提示类型">
<option value="auto">当前操作</option>
<option value="reach">可达位置</option>
<option v-if="ship?.cfg.secondary" value="secondary">副炮 · 终点</option>
<option v-if="ship?.cfg.aa" value="aa">防空 · 终点</option>
<option v-if="ship?.cfg.main" value="main">主炮 · 回合初</option>
<option v-if="ship?.cfg.carrier" value="air">飞机单程极限</option>
</select>
<button :class="{active:showPlans}" @click="showPlans=!showPlans">{{showPlans?'隐藏全部计划':'显示全部计划'}}</button>
<span>{{showRanges?rangeHint:'范围提示已隐藏'}}</span>
</details>
<div class="selected-stats">
<span>
<b>{{ship.hp}}</b> HP</span>
<span>
<b>{{ship.cfg.speed}}</b> 步</span>
<span>
<b>{{ship.torps}}</b> 鱼雷</span>
</div>
 <div v-if="phase==='deploy'" class="deployment-help">
<button :class="{active:swapMode}" @click="swapMode=!swapMode">{{swapMode?'取消交换':'交换位置'}}</button>
<p v-if="swapMode">已选 {{ship.label}}，点击另一艘友舰交换。</p>
<h3>部署到左下角</h3>
<p>点击我方舰船，再点击蓝色部署格。点“交换位置”后点另一艘友舰，可交换位置</p>
<p>初始舰首朝东，敌方在右上角朝西</p>
<button class="primary full" @click="begin" :data-tutorial-highlight="isControl('begin')?'true':null">完成部署</button>
</div>
 <template v-else-if="phase==='plan'&&ship.hp>0">
<div class="mode-buttons">
<button :class="{active:mode==='move'}" @click="setMode('move')" :data-tutorial-highlight="isControl('move-mode')?'true':null">航线</button>
<button v-if="ship.cfg.torpedo" :class="{active:mode==='torp'}" @click="setMode('torp')" :data-tutorial-highlight="isControl('torp-mode')?'true':null">鱼雷 <small>T</small>
</button>
<button v-if="ship.cfg.main" :class="{active:mode==='main'}" :disabled="ship.mainReady>game.round" @click="setMode('main')" :data-tutorial-highlight="isControl('main-mode')?'true':null">主炮 <small>G</small>
</button>
<button v-if="ship.cfg.carrier" :class="{active:mode==='plane'}" @click="setMode('plane')" :data-tutorial-highlight="isControl('plane-mode')?'true':null">飞机 <small>F</small>
</button>
<button v-if="ship.cfg.secondary" :class="{active:mode==='mine'}" @click="setMode('mine')" :data-tutorial-highlight="isControl('mine-mode')?'true':null">排雷 <small>M</small>
</button>
</div>
 <section v-if="mode==='move'" class="order-tool">
<div class="tool-title">追加移动步骤 <span>{{plan.moves.length}} / {{ship.cfg.speed}}</span>
</div>
<div class="turn-buttons">
<button :class="{active:pendingTurn===-1}" @click="chooseTurn(-1)" :data-tutorial-highlight="isControl('turn-left')?'true':null">左转 60° <small>Q</small>
</button>
<button :class="{active:pendingTurn===0}" @click="chooseTurn(0)" :data-tutorial-highlight="isControl('turn-straight')?'true':null">直行 <small>Z</small>
</button>
<button :class="{active:pendingTurn===1}" @click="chooseTurn(1)" :data-tutorial-highlight="isControl('turn-right')?'true':null">右转 60° <small>E</small>
</button>
</div>
<div class="move-buttons">
<button @click="addMove(pendingTurn,true)" :data-tutorial-highlight="isControl('forward')?'true':null">前进 <small>W</small>
</button>
<button @click="addMove(pendingTurn,false)" :data-tutorial-highlight="isControl('wait')?'true':null">{{pendingTurn?'原地转向':'原地等待'}} <small>Space</small>
</button>
</div>
<p class="tool-hint">{{replan?'重新规划中：点击新航点':'点击可达格追加航段（鼠标也可右键）'}}。先选转向，再点前进或原地确认一步</p>
</section>
 <section v-if="mode==='torp'" class="order-tool">
<label>发射窗口 <select v-model.number="torpWindow">
<option v-for="(n,i) in nodes" :value="i">{{i===0?'回合开始':'步骤 '+i+' 后'}} · {{coord(n.pos)}}</option>
</select>
</label>
<p class="tool-hint">点击侧面四个方向之一；每窗口 1 枚，每回合至多 3 枚。金色虚线指示方向</p>
</section>
 <section v-if="mode==='main'" class="order-tool">
<div class="tool-title">主炮落点 <span>{{plan.main.length}} / 3</span>
</div>
<p class="tool-hint">点击 {{ship.cfg.main.range}} 格内任意位置，可重复点同一格。每发 60 伤害，回合末命中；下回合装弹</p>
</section>
 <section v-if="mode==='plane'" class="order-tool">
<div class="turn-buttons">
<button :class="{active:planeMode==='point'}" @click="planeMode='point'">定点航线</button>
<button :class="{active:planeMode==='target'}" @click="planeMode='target'">指定敌舰</button>
</div>
<p class="tool-hint">{{planeMode==='point'?'点击终点，飞机沿六角直线飞行，遇到首艘敌舰投弹':'点击可见敌舰，追踪并只轰炸该目标'}}。每回合最多 2 架</p>
</section>
 <section v-if="mode==='mine'" class="order-tool">
<p class="tool-hint">点击副炮 {{ship.cfg.secondary?.range}} 格内可直视的水雷，回合开始移除。本回合全部副炮机会取消，主炮不受影响</p>
</section>
 <section class="route-edit-tools">
<div class="edit-buttons">
<button @click="historyChange('undo')" :disabled="!canUndo">撤销修改</button>
<button @click="historyChange('redo')" :data-tutorial-highlight="isControl('redo')?'true':null" :disabled="!canRedo">重做修改</button>
</div>
<div class="edit-buttons">
<button @click="undoWaypoint" :data-tutorial-highlight="isControl('undo-segment')?'true':null" :disabled="!plan.moves.length">撤销航点</button>
<button @click="startReplan" :data-tutorial-highlight="isControl('redraw-movement')?'true':null">重新规划</button>
<button @click="clearMovement" :disabled="!plan.moves.length">清除航线</button>
</div>
<p>仅编辑本舰 · Ctrl/⌘ Z 撤销 · Shift Z 重做</p>
<div class="waypoint-item" v-for="(segment,i) in (plan.segments||[])" :key="i">
<span>航点 {{i+1}} · {{coord(segment.target)}} · 累计 {{segment.end}} 步</span>
<button @click="removeWaypoint(i)" :aria-label="'删除航点'+(i+1)+'及后续路线'">×</button>
</div>
</section>
 <p v-if="routeConflicts.length" class="route-warning" role="status">当前计划可能与 {{routeConflicts.join('、')}} 碰撞，移动会截停并可能退回起点。可调整航路或先移开友舰。</p>
<p v-if="lastMovement[selected]" class="movement-receipt" role="status">上回合：{{lastMovement[selected].steps}} 步指令已接收 · {{lastMovement[selected].reason}}</p>
 <section class="action-list">
<div class="tool-title">本舰指令 <button class="text-button" @click="resetPlan">清空全部</button>
</div>
<p v-if="!mainCounts(ship)" class="empty-state">尚无指令，执行时将原地待命<br>副炮与防空仍自动运行</p>
<div v-for="(m,i) in plan.moves" :key="'mv'+i" class="action-item movement">
<span class="action-number">{{i+1}}</span>
<span>{{m.turn===-1?'左转':m.turn===1?'右转':'保持'}} · {{m.forward?'前进':'原地'}}<small>{{coord(nodes[i+1].pos)}}</small>
</span>
<button @click="undo(i)" :aria-label="'删除第'+(i+1)+'步及后续航段'">×</button>
</div>
<div v-for="(t,i) in plan.torps" :key="'to'+i" class="action-item torp">
<span>鱼雷</span>
<span>节点 {{t.window}} · {{directionNames[t.dir]}}</span>
<button @click="removeOrder('torps',i)" aria-label="删除鱼雷指令">×</button>
</div>
<div v-for="(h,i) in plan.main" :key="'ma'+i" class="action-item artillery">
<span>主炮</span>
<span>{{coord(h)}} · 60 伤害</span>
<button @click="removeOrder('main',i)" aria-label="删除主炮落点">×</button>
</div>
<div v-for="(p,i) in plan.planes" :key="'pl'+i" class="action-item aviation">
<span>飞机</span>
<span>{{p.mode==='point'?coord(p.target):'追踪指定敌舰'}}</span>
<button @click="removeOrder('planes',i)" aria-label="删除飞机指令">×</button>
</div>
<div v-if="plan.sweep" class="action-item torp">
<span>清雷</span>
<span>{{coord(plan.sweep)}} · 消耗副炮</span>
<button @click="removeOrder('sweep')" aria-label="取消清雷">×</button>
</div>
<button v-if="plan.moves.length" class="undo-button" @click="undo()">撤销末步 <small>Backspace</small>
</button>
</section>
</template>
 <div v-if="ship.cfg.main" class="weapon-status">
<span>主炮</span>
<b>{{ship.mainReady>game.round?'装弹中 · 下一轮可用':'已装填'}}</b>
</div>
<div v-if="ship.cfg.carrier" class="weapon-status">
<span>机库</span>
<b>{{readyAircraft}} 可用 / {{ship.destroyedPlanes}} 损失</b>
</div>
<div v-if="airborne.length" class="airborne-status">
<p v-for="p in airborne" :key="p.id">飞机 {{p.state==='return'?'返航中':'剩余单程 '+Math.max(0,p.cfg.range-p.traveled).toFixed(1)+' 格'}}</p>
</div>
<div class="capability-note">
<p v-if="ship.cfg.secondary">副炮 {{ship.cfg.secondary.damage}} 伤害 / {{ship.cfg.secondary.range}} 格 · {{ship.cfg.secondary.multi?'每敌舰一次':'全回合一次'}}</p>
<p v-if="ship.cfg.aa">防空 {{ship.cfg.aa.range}} 格 / 每敌机每回合 1 伤害</p>
<p v-if="ship.cfg.contactSweep">接触水雷自动清除</p>
<p v-if="ship.cfg.carrier">飞机 {{ship.cfg.carrier.plane.hp}} HP · {{ship.cfg.carrier.plane.speed}} 格 / 回合 · 单程 {{ship.cfg.carrier.plane.range}} 格 · 炸弹 {{ship.cfg.carrier.plane.damage}} · 整备回血 {{ship.cfg.carrier.heal ?? 1}}</p>
</div>
</aside>
</div>
 <section v-if="phase==='ended'" class="result-panel">
<strong>{{game.winner==='draw'?'双方势均力敌':game.winner===0?'海域控制完成':'舰队作战结束'}}</strong>
<p>我方 {{ourCount}} 艘 / {{ourHP}} HP · 敌方 {{game.ships.filter(s=>s.team===1&&s.hp>0).length}} 艘 / {{game.ships.filter(s=>s.team===1).reduce((n,s)=>n+s.hp,0)}} HP</p>
<span>先比较存活舰船数，数量相同再比较总耐久</span>
</section>
</main>
<SaveManager v-if="saveOpen" :records="saveRecords" :can-save="canSave" :notice="saveNotice" :pending="pendingSave" :in-battle="screen==='battle'" @close="closeSaves" @write="writeSave" @load="loadSave" @export="exportSave" @import="importSave" @confirm="confirmSaveAction" @cancel="pendingSave=null"/>
<div v-if="toast" class="toast" role="status">{{toast}}</div>
<div v-if="showRules" class="modal-backdrop" @click.self="showRules=false">
<section class="rules-modal" role="dialog" aria-modal="true" aria-label="规则与操作">
<div class="panel-title">
<h2>作战手册 · v0.4.0</h2>
<button @click="showRules=false" aria-label="关闭规则">关闭</button>
</div>
<div class="rules-columns">
<section>
<h3>操作</h3>
<p>左键选择我方舰船；右键追加航段。手机可用“航线”模式点击目标格，或用侧栏方向与前进按钮</p>
<p>Q / E 选择左转 / 右转，Z 保持；W 前进，Space 原地等待或转向；Backspace 撤销末步；1–5 选舰</p>
<p>T 鱼雷、G 主炮、F 飞机、M 排雷，Esc 返回航线模式；Enter 执行回合。规划没有时间限制</p>
<h3>迷雾与计划编辑</h3>
<p>黑色格未探索，灰暗格保留已发现地形，正常亮度为当前共享视野。敌舰离开视野即消失，没有残影；水雷仍全图公开。绿色可达范围考虑舰首、剩余步骤和已知岛屿，未探索航路只是试探</p>
<p>所有己方计划默认可见，选中舰高亮；主炮叠点显示发数，飞机显示出击路线，鱼雷实线是本轮航程、虚线是寿命上限。可按需要隐藏范围或全部计划。航点可整段撤销，重新规划/清除航线保留其他武器指令；失效鱼雷窗口会取消并提示。Ctrl/⌘ Z 撤销，Shift Z 重做</p>
<h3>同步与碰撞</h3>
<p>不同航速共享同一回合时间轴。舰船按圆形实体碰撞，友军同样受伤；碰撞后停在接触位置，未到达鱼雷节点取消</p>
<p>主炮命中之后，撞停舰沿实际经过的原路回退到合法格；无处回退则搁浅沉没。无控制区截停</p>
<h3>胜负</h3>
<p>全部舰船沉没或第 30 回合结束时结算。先比存活舰数，再比总 HP；完全相同为平局，双方全灭也为平局</p>
</section>
<section>
<h3>武器</h3>
<p>主炮：开局发射，回合末落地，12 格盲射，最多三发且可叠点，每发 60 伤害，之后空过一轮</p>
<p>鱼雷：起始与每步末尾可发射，每窗 1 枚、每轮最多 3 枚。侧向四选一，速度 5、寿命 3 回合、伤害 45，遇岛或第一目标停止</p>
<p>副炮：可见且无遮挡的最近敌舰，普通每轮总计一炮；强化配置可对每艘敌舰各一炮。远程清雷消耗全部副炮，不影响主炮</p>
<h3>飞机与防空</h3>
<p>每航母 6 架，最多每轮 2 架。飞机 2 HP、航速 6、视野 3、单程累计航程 18、炸弹 25。返航追踪当前母舰，不消耗单程航程；回收后整备一整轮</p>
<p>定点模式沿直线六角航路，遇第一艘敌舰投弹；指定模式只炸目标，本轮丢失视野仍追踪，下轮向冻结的目标终点飞行，途中重获视野则恢复追踪，未找到目标而到达终点则返航。每时刻先防空，后投弹</p>
</section>
</div>
<div class="edge-rules">
<h3>本原型采用的边界约定</h3>
<p>鱼雷离开发射舰所在格后启用碰撞，可误伤友军；主炮也可误伤。水雷 40 伤害，接触排雷优先于同刻触雷。岛屿阻挡视野、副炮与鱼雷，飞机可以越岛</p>
<p>同舰对每回合碰撞伤害只结算一次，第三艘后续撞入仍生效。舰船圆半径为六角内切圆半径减 0.001，避免相邻静止舰接触误判。成组接触同刻处理；回退优先队伍逐轮交替，同队按舰号排序。主炮和副炮同刻伤害按齐射处理</p>
<p>飞机到达定点、失去已沉没目标，或用尽单程航程即返航；母舰沉没时返航机销毁。格边界采用稳定的唯一归格。物理使用固定 240 子步与连续扫掠碰撞，确保相同种子、指令得到相同结果</p>
<p>AI 只使用当轮共享视野可见信息，进行航路、集火、鱼雷方向与友军避碰评分；飞机特殊跨视野追踪与玩家一致。所有单位能力均来自配置，编队标签不参与战斗判断</p>
</div>
<p class="muted">这是可玩的机制原型，耐久、伤害、地图密度和 AI 强度仍需实战调平</p>
</section>
</div>
</div>`});MD.mount("#app");
