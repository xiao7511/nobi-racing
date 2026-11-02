import {test} from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {mkdtemp,readFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {community} from './community.mjs';
test('persistent accounts, moderation, authorization, reports, replies and account erasure',async()=>{
 const dir=await mkdtemp(tmpdir()+'/nobi-community-'),handle=community(dir);
 const server=http.createServer(async(req,res)=>{res.setHeader('Content-Type','application/json');await handle(req,res,new URL(req.url,'http://localhost').pathname);});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port+'/api/v1/community/';
 const call=async(path,data,token)=>{const r=await fetch(base+path,{method:data?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:data?JSON.stringify(data):undefined});return {...await r.json(),status:r.status};};
 try{
  const a=await call('register',{name:'fan_one',password:'A unique password 001',accept:true}),b=await call('register',{name:'fan_two',password:'A unique password 002',accept:true});assert.ok(a.token&&b.token);
  assert.equal((await call('login',{name:'fan_one',password:'Wrong password 000'})).status,400);
  assert.equal((await call('posts',{title:'Discussion',body:'No login'})).status,401);
  const post=await call('posts',{title:'Race discussion',body:'A thoughtful racing discussion.'},a.token);assert.equal(post.status,201);
  assert.equal((await call('posts')).items.length,0);assert.equal((await call('posts',undefined,b.token)).items.length,0);assert.equal((await call('posts',undefined,a.token)).items.length,1);
  const [name,password]=(await readFile(dir+'/administrator-password','utf8')).trim().split('\n');const admin=await call('login',{name,password});assert.equal(admin.user.admin,true);
  assert.equal((await call('moderate',{id:post.id,status:'published'},b.token)).status,404);
  await call('moderate',{id:post.id,status:'published'},admin.token);assert.equal((await call('posts')).items.length,1);
  await call('delete',{id:post.id},b.token);assert.equal((await call('posts')).items.length,1);
  const reply=await call('posts',{title:'Reply',body:'Another perspective',parent:post.id},b.token);await call('moderate',{id:reply.id,status:'published'},admin.token);assert.equal((await call('posts?parent='+post.id)).items.length,1);
  await call('report',{id:post.id,reason:'Please review this post'},b.token);assert.equal((await call('posts')).items.length,0);
  await call('delete-account',{confirm:'fan_one'},a.token);assert.equal((await call('me',undefined,a.token)).user,null);assert.equal((await call('posts?parent='+post.id)).items.length,0);
  const persisted=community(dir);assert.equal(typeof persisted,'function');
 }finally{await new Promise(resolve=>server.close(resolve));}
});
