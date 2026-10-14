import type {DraftState} from '../../shared/draft.ts';
import type {Match} from '../../server/types.ts';
import assert from 'node:assert/strict';
import {currentDraftTurn,draftActionError} from '../../src/draft.ts';

// Enter deployment through real commands; never fabricate a completed draft.
export function finishDraft(match:Match|undefined, command:(team:number,type:string,payload:Record<string,unknown>)=>{ok?:boolean}, {confirm=true}={}) {
  assert.ok(match);assert.ok(match.draft);
  if(match.draft.status==='guess')assert.equal(command(0,'draft.guess',{guess:0,revision:match.draft.revision}).ok,true);
  while(match.draft.status==='draft') {
    const turn=currentDraftTurn(match.draft);
    const draft:DraftState=match.draft;const shipId:string|undefined=draft.pool.find(id=>!draftActionError(draft,turn!.team,id));
    assert.ok(shipId,'draft must have a legal next action');
    assert.equal(command(turn!.team,'draft.action',{shipId,revision:match.draft.revision}).ok,true);
  }
  if(confirm)for(let team=0;team<2;team++)assert.equal(command(team,'draft.confirm',{revision:match.draft.revision}).ok,true);
}
