import path from 'node:path';
import {fileURLToPath} from 'node:url';
/** Emitted server files live under dist-server/server; private files stay at release root. */
export const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),import.meta.url.endsWith('.ts')?'..':'../..');
