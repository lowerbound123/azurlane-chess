import {it,expect} from 'vitest';
import {AIService} from '../server/ai.ts';
import * as E from '../src/engine.ts';
it('strict structured output declares all properties required including nullable unused radar',async()=>{
 const game=E.createFleetGame(['dd-1','cl-3','ca-2','cv-2','cv-3']);let captured:any;
 const service=new AIService({logger:null,models:[{id:'test',name:'test',model:'test',baseURL:'https://example.test',apiKey:'test',protocol:'chat',structuredOutput:true}],fetchImpl:async(_u,init)=>{const b=JSON.parse(String(init?.body));captured=b.response_format.json_schema.schema;const c=JSON.parse(b.messages[1].content);return new Response(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({plans:Object.fromEntries(Object.entries(c.commandGuide).map(([id,v]:[string,any])=>[id,v.suggestedPlan]))})}}]}));}});
 await service.generate({game,team:0,modelId:'test'});
 function check(s:any){if(s.type==='object')expect([...(s.required??[])].sort()).toEqual(Object.keys(s.properties??{}).sort());for(const v of Object.values(s))if(Array.isArray(v))v.forEach(x=>x&&typeof x==='object'&&check(x));else if(v&&typeof v==='object')check(v);}
 check(captured);
});
