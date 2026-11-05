import {describe,it,expect,vi,afterEach} from 'vitest';
import {open} from 'node:fs/promises';
import {readCompleteFile} from '@/lib/readCompleteFile';
vi.mock('node:fs/promises',()=>({open:vi.fn()}));
afterEach(()=>vi.restoreAllMocks());
describe('完整文件读取',()=>{
 it('早到的空读取与短读取不会截断原始图片',async()=>{
  const source=Buffer.from('original-image-bytes'),close=vi.fn(),reads=vi.fn();
  reads.mockImplementation(async(buffer:Buffer,offset:number,length:number,position:number)=>{if(reads.mock.calls.length===1)return{bytesRead:0,buffer};const count=Math.min(3,length);source.copy(buffer,offset,position,position+count);return{bytesRead:count,buffer};});
  vi.mocked(open).mockResolvedValue({stat:async()=>({isFile:()=>true,size:source.length,mtimeMs:1}),read:reads,close} as never);
  expect(await readCompleteFile('toy.jpg')).toEqual(source);expect(close).toHaveBeenCalledOnce();
 });
 it('持续缺失的数据不会被当作完整资源返回',async()=>{
  const close=vi.fn();vi.mocked(open).mockResolvedValue({stat:async()=>({isFile:()=>true,size:20,mtimeMs:1}),read:async()=>({bytesRead:0}),close} as never);
  await expect(readCompleteFile('toy.jpg')).rejects.toThrow('资源尚未完整读取');expect(close).toHaveBeenCalledTimes(3);
 });
});
