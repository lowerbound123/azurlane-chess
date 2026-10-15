import type {CompiledAbilityDemo} from './scenarios.ts';
/** Assertions protect the authored captions when future rules or fixtures change. */
export function assertDemoEvidence(d:CompiledAbilityDemo){
 const rounds=d.rounds,events=rounds.flatMap(r=>r.events.map(e=>e.text)),visuals=rounds.flatMap(r=>r.presentation),has=(s:string)=>events.some(e=>e.includes(s)),damage=(n:number)=>visuals.some(e=>e.type==='effect'&&e.kind==='hit'&&e.text===`−${n}`);
 const checks:Record<string,()=>boolean>={
  'dd-1':()=>rounds[0].game.ships[0].minesLeft===4&&rounds[0].game.map.mines.length===2&&has('触雷 −40'),
  'dd-2':()=>rounds[0].game.ships[0].torps===4&&events.filter(e=>e.includes('鱼雷命中 −40')).length===4,
  'dd-3':()=>!!rounds[0].frames[0].zones?.length&&!rounds[2].frames[0].zones?.length,
  'cl-1':()=>has('击落敌机')&&!has('航空炸弹')&&visuals.filter(e=>e.type==='projectile'&&e.kind==='aa').length===2,
  'cl-2':()=>events.filter(e=>e.includes('副炮命中 −12')).length===2,
  'cl-3':()=>rounds[1].game.ships[0].radarLeft===2&&!!rounds[2].frames[0].zones?.some(z=>z.kind==='radar')&&!rounds[3].frames[0].zones?.some(z=>z.kind==='radar'),
  'ca-1':()=>damage(18)&&damage(42)&&has('封锁'),
  'ca-2':()=>damage(18)&&damage(42)&&damage(60)&&rounds[0].game.ships[0].pos.q===4,
  'ca-3':()=>rounds[0].events.filter(e=>e.text.includes('副炮命中 −16')).length===2&&d.experiments.partial.rounds[0].events.filter(e=>e.text.includes('副炮命中 −16')).length===1,
  'bb-1':()=>damage(180)&&!rounds[1].presentation.some(e=>e.type==='projectile'&&e.kind==='main')&&rounds[1].game.ships[0].mainReady===3,
  'bb-2':()=>damage(120)&&visuals.filter(e=>e.type==='effect'&&e.kind==='hit'&&e.text==='−60').length===2,
  'bb-3':()=>rounds.every(r=>r.events.some(e=>e.text.includes('主炮命中 −80'))),
  'cv-1':()=>damage(35)&&rounds[0].events.filter(e=>e.text.includes('回收飞机')).length===2&&rounds[0].game.ships[0].airReady[0]===4,
  'cv-2':()=>damage(25)&&visuals.some(e=>e.type==='effect'&&e.kind==='fighter')&&rounds.at(-1)!.game.planes.filter(p=>p.team===0).length===0,
  'cv-3':()=>!rounds[0].events.some(e=>e.text.includes('航空炸弹'))&&rounds[1].events.some(e=>e.team===0&&e.text.includes('放飞'))&&damage(25),
 };
 if(!checks[d.spec.id]?.())throw new Error(`演示证据与分镜不一致：${d.spec.id}；请核对实际规则与字幕后重录`);
}
