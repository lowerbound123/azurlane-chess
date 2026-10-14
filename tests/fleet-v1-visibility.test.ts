import {it,expect} from 'vitest';
import {interpolateFrame} from '../src/playback.ts';
import * as E from '../src/engine.ts';
it('does not interpolate positions across a smoke visibility boundary',()=>{
 const g=E.createFleetGame();const s=g.ships[5];const zones=[{kind:'smoke' as const,team:1,center:s.pos,radius:1,expires:3}];
 const a={t:0,ships:[s],planes:[],torpedoes:[],zones,visibleShipIdsByTeam:[[s.id],[s.id]]};
 const b={...a,t:.1,ships:[{...s,xy:{x:s.xy.x+2,y:s.xy.y}}],visibleShipIdsByTeam:[[],[s.id]]};
 expect(interpolateFrame(a,b,.5).ships[0].xy).toEqual(s.xy);
});
