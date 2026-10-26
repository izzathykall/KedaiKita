// Only needed when changing source code. The ZIP already includes the built app.
import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const {version}=JSON.parse(await readFile(new URL('version.json',import.meta.url),'utf8'));
if(!/^[a-zA-Z0-9._-]{1,100}$/.test(version))throw new Error('Invalid release version');
let html=await readFile(new URL('index.html',import.meta.url),'utf8');
html=html.replace(/var build='[^']+'/,`var build='${version}'`).replace(/((?:style|design)\.css\?v=)[^"']+/g,`$1${version}`);
await writeFile(new URL('index.html',import.meta.url),html);
let app=await readFile(new URL('app.mjs',import.meta.url),'utf8');
app=app.replace(/window\.__KEDAI_ACTIVE_VERSION__\|\|'[^']*'/,`window.__KEDAI_ACTIVE_VERSION__||'${version}'`);
await writeFile(new URL('app.mjs',import.meta.url),app);
await build({absWorkingDir:root,entryPoints:['entry.mjs'],bundle:true,format:'iife',target:['safari15'],outfile:'app.bundle.js'});
console.log('Built KedaiKita '+version);
