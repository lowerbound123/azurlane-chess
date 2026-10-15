import {test,expect} from 'vitest';
import {rollup} from 'rollup';

for(const version of ['38']) {
  test(`Spine ${version} renderer bundles as a production ES module without assigning imported bindings`,async()=>{
    const bundle=await rollup({
      input:new URL(`../src/vendor/spine${version}/renderer.mjs`,import.meta.url).pathname,
      external:['three'],
      onwarn(warning,defaultHandler){
        // Legacy TypeScript's inheritance helper intentionally probes top-level
        // this, which is undefined in ES modules. Its local fallback is valid.
        if(warning.code!=='THIS_IS_UNDEFINED')defaultHandler(warning);
      },
    });
    try {
      const result=await bundle.generate({format:'es'});
      expect(result.output).toHaveLength(1);
      const chunk=result.output[0];
      expect(chunk.type).toBe('chunk');
      if(chunk.type==='chunk')expect(chunk.exports).toContain('default');
    } finally {await bundle.close();}
  });
}
