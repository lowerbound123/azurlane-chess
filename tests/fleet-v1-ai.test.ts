import {it,expect} from 'vitest';
import * as E from '../src/engine.ts';
import {validateOrders} from '../server/views.ts';
it('local AI supplies legal plans for all fifteen identities through terminal rounds',()=>{
 const fleets=[['dd-1','cl-1','ca-1','bb-1','cv-1'],['dd-2','cl-2','ca-2','bb-2','cv-2'],['dd-3','cl-3','ca-3','bb-3','cv-3']];
 const seen=new Set<string>();
 for(let i=0;i<3;i++){
  let g=E.createFleetGame(fleets[i],123+i,fleets[(i+1)%3]);g.phase='plan';
  for(let r=0;r<30&&g.winner===null;r++){
   const plans={...E.planAI(g,0),...E.planAI(g,1)};
   for(const team of [0,1]){const own=Object.fromEntries(Object.entries(plans).filter(([id])=>g.ships.some(s=>s.id===id&&s.team===team)));expect(()=>validateOrders(g,team,own)).not.toThrow();}
   for(const s of g.ships)if(plans[s.id]?.planes.length)seen.add(s.catalogId!);
   g=E.resolveRound(g,plans).game;
  }
  expect(g.phase).toBe('ended');
 }
 expect([...seen].sort()).toEqual(['cv-1','cv-2','cv-3']);
},30000);
it('planning cannot discover hidden islands by truncating suggested moves',()=>{
 const g=E.createFleetGame();g.map.islands=[];g.map.mines=[];g.explored=[['0,7'],[]];g.ships=g.ships.filter(s=>s.id==='0-0'||s.id==='1-0');
 const s=g.ships[0];s.pos={q:0,r:7};s.xy=E.hexToXY(s.pos);s.heading=0;s.cfg.vision=1;
 const first=E.planAI(g,0)[s.id],nodes=E.route(s,first,g.map);const unknown=nodes.find(n=>E.hexDist(n.pos,s.pos)>1)!;
 expect(unknown).toBeDefined();g.map.islands=[E.key(unknown.pos)];expect(E.planAI(g,0)[s.id]).toEqual(first);
});
it('server model boundary carries fleet skills in standard and FULL modes',async()=>{
 const {AIService}=await import('../server/ai.ts');
 const {createAIRoundMemory}=await import('../server/ai-history.ts');
 const {playerResult}=await import('../server/views.ts');
 const model={id:'test',name:'test',model:'test',baseURL:'https://example.test/v1',apiKey:'test',protocol:'chat' as const,timeoutMs:5000};
 const g=E.createFleetGame(['dd-1','cl-3','ca-2','cv-2','cv-3']);g.phase='plan';
 const p=E.planAI(g,0),resolved=E.resolveRound(g,p),history=[createAIRoundMemory(g,playerResult(g,resolved,0),0,p)];
 const requests:any[]=[];
 const service=new AIService({models:[model],logger:null,fetchImpl:async(_url,init)=>{const body=JSON.parse(String(init?.body)),context=JSON.parse(body.messages[1].content);requests.push(context);return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({plans:Object.fromEntries(Object.entries(context.commandGuide).map(([id,v]:[string,any])=>[id,v.suggestedPlan]))})}}]}));}});
 for(const aiMode of ['standard','full'] as const){const plans=await service.generate({game:resolved.game,team:0,modelId:'test',aiMode,history});expect(()=>validateOrders(resolved.game,0,plans)).not.toThrow();}
 expect(requests[0].history).toBeUndefined();expect(requests[1].history).toHaveLength(1);
 expect(requests[0].commandGuide['0-0'].skills.maxMines).toBe(2);
 expect(requests[0].commandGuide['0-3'].readySlots.every((s:any)=>Number.isInteger(s.slot))).toBe(true);
});
