// Apply the test seam before resolving application-relative imports. Vue is
// intentionally loaded only by the rewritten main module, after HappyDOM setup.
export function rewriteUiSource(source) {
  return source
    .replace(/from\s+(['"])\.\/battle-map-3d\.js\1/g,
      () => 'from ' + JSON.stringify(new URL('./battle-map-test-adapter.js', import.meta.url).href))
    .replace(/import\s+['"]\.\/style\.css['"];?\s*/, '')
    .replace(/from\s+(['"])([^'"]+)\1/g, (_, quote, spec) => 'from ' + JSON.stringify(
      spec.startsWith('./') ? new URL('../../src/' + spec.slice(2), import.meta.url).href
        : spec.startsWith('file:') ? spec : import.meta.resolve(spec)));
}
