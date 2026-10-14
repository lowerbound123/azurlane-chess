import { createApp } from './app.ts';
if(Number(process.versions.node.split('.')[0])!==25){console.error('此服务要求 Node.js 25，请切换版本后重试。');process.exit(1);}
let app:Awaited<ReturnType<typeof createApp>>|undefined;
try {
  app=await createApp({logger:true});
  const port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1';
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT 必须为1至65535');
  await app.listen({port,host});
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await app!.close();process.exit(0);});
} catch(error) {console.error(error instanceof Error?error.message:'服务启动失败');if(app)await app.close();process.exitCode=1;}
