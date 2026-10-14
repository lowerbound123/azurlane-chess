import {it,expect} from 'vitest';
import {GameService} from '../server/game-service.ts';
import {AIService} from '../server/ai.ts';
import * as E from '../src/engine.ts';
import {finishDraft} from './helpers/draft-match.ts';
import type {Player} from '../server/types.ts';
const settle=async()=>{for(let i=0;i<12;i++)await new Promise(r=>setImmediate(r));};
for(const mode of ['friend','queue','standard','full'] as const)it(`completes a fleet-v1 ${mode} match through service commands`,async()=>{
 let now=1000,id=0;const requests:any[]=[];const model={id:'test',name:'test',model:'test',baseURL:'https://example.test',apiKey:'test',protocol:'chat' as const,timeoutMs:10000};
 const ai=new AIService({models:[model],logger:null,fetchImpl:async(_url,init)=>{const body=JSON.parse(String(init?.body)),c=JSON.parse(body.messages[1].content);requests.push(c);return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({plans:Object.fromEntries(Object.entries(c.commandGuide).map(([id,v]:[string,any])=>[id,v.suggestedPlan]))})}}]}));}});
 const service=new GameService({models:[model],ai,pool:{resolve:async(g,p)=>E.resolveRound(g,p),close:async()=>{}},autoTick:false,now:()=>now,logger:{error(){}}});
 const players=['a','b'].map(name=>service.connect(service.session(name).token,()=>{}));
 const cmd=(p:Player,type:string,payload:Record<string,unknown>={})=>{const m=p.match?service.matches.get(p.match):null;const reply=service.command(p,{v:2,id:String(++id),type,payload,matchId:m?.id,round:m?.game?.round??0});expect(reply.ok,JSON.stringify(reply)).toBe(true);return reply;};
 try{
  if(mode==='friend'){const reply=cmd(players[0],'room.create',{turnSeconds:0});cmd(players[1],'room.join',{code:reply.data!.code});players.forEach(p=>cmd(p,'room.ready',{ready:true}));cmd(players[0],'room.start');}
  else if(mode==='queue')players.forEach(p=>cmd(p,'queue.join'));
  else cmd(players[0],'ai.start',{modelId:'test',aiMode:mode,roster:['dd-1','cl-3','ca-2','cv-2','cv-3']});
  const m=service.matches.get(players[0].match!)!;
  if(m.draft)finishDraft(m,(team,type,payload)=>cmd(players.find(p=>p.id===m.seats[team].playerId)!,type,payload));
  expect(m.game!.ruleset).toBe('fleet-v1');
  if(mode==='standard'||mode==='full')expect(m.game!.ships.filter(s=>s.team===1).map(s=>s.catalogId)).toEqual(['dd-2','cl-2','ca-1','bb-1','cv-1']);
  for(const p of players.filter(p=>p.match===m.id)){const team=m.seats.findIndex(s=>s.playerId===p.id);cmd(p,'deploy.update',{ready:true,positions:m.game!.ships.filter(s=>s.team===team).map(s=>({id:s.id,pos:s.pos}))});}
  for(let rounds=0;rounds<30&&m.stage!=='ended';rounds++){
   await settle();expect(m.aiStatus).not.toBe('error');
   for(const p of players.filter(p=>p.match===m.id)){const team=m.seats.findIndex(s=>s.playerId===p.id);cmd(p,'orders.submit',{plans:E.planAI(m.game!,team)});}
   await settle();expect(m.stage).toBe('playback');now+=10000;service.tick();
  }
  expect(m.stage).toBe('ended');expect(m.roundsResolved).toBeGreaterThan(0);
  if(mode==='full'){expect(m.aiHistory).toHaveLength(m.roundsResolved);expect(requests.at(-1).history.length).toBe(m.roundsResolved-1);}
 }finally{await service.close();}
},30000);
