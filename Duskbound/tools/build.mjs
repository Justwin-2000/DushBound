import { readFile, access, mkdir, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { build } from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const web=path.join(root,'web'),out=path.join(root,'dist');
async function walk(dir){let result=[];for(const d of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,d.name);if(d.isDirectory())result.push(...await walk(file));else result.push(file);}return result;}
for(const file of await walk(web)){if(file.endsWith('app.bundle.js'))continue;if(file.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}if(file.endsWith('.js')){const code=await readFile(file,'utf8');for(const m of code.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g))await access(path.resolve(path.dirname(file),m[1]));}}
for(const [entry,output] of [['src/app.js','prologue.bundle.js'],['src/v2/app.js','app.bundle.js']])await build({entryPoints:[path.join(web,entry)],bundle:true,format:'iife',platform:'browser',target:['chrome58'],charset:'utf8',legalComments:'none',outfile:path.join(web,output),logLevel:'info'});
await access(path.join(web,'assets/title.webp'));
for(const file of await walk(web)){const target=path.join(out,path.relative(web,file));await mkdir(path.dirname(target),{recursive:true});await copyFile(file,target);}
console.log('Compiled classic script targeting Chrome 58; validated sources and artwork; offline release copied to dist/.');
