import {open} from 'node:fs/promises';
/** Never return a partial file when a filesystem delivers an early EOF. */
export async function readCompleteFile(path:string):Promise<Buffer>{
 for(let attempt=0;attempt<3;attempt++){
  const handle=await open(path,'r');
  try{
   const before=await handle.stat();
   if(!before.isFile())throw new Error('资源不是有效文件');
   const bytes=Buffer.alloc(before.size);let position=0,emptyReads=0;
   while(position<bytes.length){
    const {bytesRead}=await handle.read(bytes,position,bytes.length-position,position);
    if(bytesRead===0){if(++emptyReads>=4)break;await new Promise(r=>setTimeout(r,25));continue;}
    position+=bytesRead;emptyReads=0;
   }
   const after=await handle.stat();
   if(position===bytes.length&&after.size===before.size&&after.mtimeMs===before.mtimeMs)return bytes;
  }finally{await handle.close();}
  await new Promise(r=>setTimeout(r,25));
 }
 throw new Error('资源尚未完整读取，请稍后重试');
}
