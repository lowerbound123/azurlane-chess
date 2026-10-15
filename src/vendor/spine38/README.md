# Spine 3.8 compatibility runtime

Official EsotericSoftware/spine-runtimes branch 3.8, fixed commit
`8b4844bd4b193ba9e54487ed397a777993cbad56`.
Original `spine-ts/build/spine-threejs.js` is preserved as upstream.js.
LICENSE is preserved and embedded in core.mjs and renderer.mjs.
The official core includes SkeletonBinary and reads the CDN's original 3.8.99
.skel directly. Modules never install spine on window/globalThis.

Modern Three adaptations: Reflect.construct for native ES classes; current
attribute/update-range/usage APIs and mipmap constants; PMA alpha, slot blend
modes and transparent depthWrite=false. Library-owned atlas textures are shared
by actors, whose disposal releases only geometry/material resources.

adapter.ts shares the loading lifecycle implementation from ../legacy-loader.ts.
