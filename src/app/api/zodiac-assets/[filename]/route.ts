import {stat} from 'node:fs/promises';
import {join} from 'node:path';
import {BOX_IMAGE,ZODIAC} from '@/data/zodiac';
import {readCompleteFile} from '@/lib/readCompleteFile';
export const dynamic='force-dynamic';
const allowed=new Set([BOX_IMAGE,...ZODIAC.map(a=>a.image)].map(path=>path.split('/').at(-1)!));
const cache=new Map<string,{mtime:number;size:number;bytes:Buffer;type:string}>();
const pending=new Map<string,Promise<{mtime:number;size:number;bytes:Buffer;type:string}>>();
export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}){
 const {filename}=await params;
 if(!allowed.has(filename))return new Response('未找到生肖图片',{status:404});
 try{
  const path=join(process.cwd(),'public/assets/zodiac',filename),info=await stat(path);
  let item=cache.get(filename);
  if(!item||item.mtime!==info.mtimeMs||item.size!==info.size){
   let loading=pending.get(filename);
   if(!loading){loading=(async()=>{const bytes=await readCompleteFile(path);const type=bytes.subarray(0,4).toString('ascii')==='RIFF'&&bytes.subarray(8,12).toString('ascii')==='WEBP'?'image/webp':bytes[0]===255&&bytes[1]===216?'image/jpeg':null;if(!type)throw new Error('图片格式无效');const updated={mtime:info.mtimeMs,size:bytes.length,bytes,type};cache.set(filename,updated);return updated;})();pending.set(filename,loading);}
   try{item=await loading;}finally{pending.delete(filename);}
  }
  return new Response(new Uint8Array(item.bytes),{headers:{'Content-Type':item.type,'Content-Length':String(item.bytes.length),'Cache-Control':'no-cache'}});
 }catch{return new Response('生肖图片暂时无法完整读取，请稍后重试',{status:503,headers:{'Cache-Control':'no-store'}});}
}
