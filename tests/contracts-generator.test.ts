import {expect,it} from 'vitest';
import {mkdtempSync,cpSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';

it('generates public network contracts when local round results reference historical types',()=>{
 const directory=mkdtempSync(join(tmpdir(),'historical-contracts-'));
 try{
  cpSync(resolve('shared'),join(directory,'shared'),{recursive:true});
  execFileSync(process.execPath,[resolve('scripts/generate-contracts.mjs')],{cwd:directory});
  const contracts=JSON.parse(readFileSync(join(directory,'shared/contracts.generated.json'),'utf8'));
  expect(contracts.PublicConfig.properties.models).toBeTruthy();
  expect(contracts.RoundMessage.properties.result).toBeTruthy();
  expect(JSON.stringify(contracts)).not.toContain('scenarioId');
  expect(JSON.stringify(contracts)).not.toContain('abilityDemos');
 }finally{rmSync(directory,{recursive:true,force:true});}
});
