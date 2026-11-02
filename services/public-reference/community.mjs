import {DatabaseSync} from 'node:sqlite';
import {randomBytes,scrypt as derive,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {promisify} from 'node:util';
const scrypt=promisify(derive),digest=value=>createHash('sha256').update(value).digest('hex');
export function community(directory){
 const db=new DatabaseSync(directory+'/community.sqlite');db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA secure_delete=ON;
 CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT UNIQUE COLLATE NOCASE,salt TEXT,hash TEXT,created TEXT);
 CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,expires INTEGER);
 CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY,user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,parent INTEGER REFERENCES posts(id) ON DELETE CASCADE,title TEXT,body TEXT,status TEXT DEFAULT 'pending',created TEXT);
 CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY,user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,reason TEXT,UNIQUE(user_id,post_id));`);
 const adminName=process.env.FORUM_ADMIN||'nobi_admin';
 if(!db.prepare('SELECT id FROM users WHERE name=?').get(adminName)){
  const password=randomBytes(24).toString('base64url'),salt=randomBytes(16).toString('hex');
  db.prepare('INSERT INTO users(name,salt,hash,created) VALUES(?,?,?,?)').run(adminName,salt,scryptSync(password,salt,64).toString('hex'),new Date().toISOString());
  writeFileSync(directory+'/administrator-password',adminName+'\n'+password+'\n',{mode:0o600});
 }
 const attempts=new Map();let hashing=0;
 const clean=(value,min,max)=>typeof value==='string'&&value.trim().length>=min&&value.length<=max&&!/[<>]/.test(value)&&![...value].some(c=>c.charCodeAt(0)<32&&!['\n','\r','\t'].includes(c));
 async function body(request){let data='';for await(const chunk of request){data+=chunk;if(Buffer.byteLength(data)>16384)throw Error('请求过大 / Request too large');}return JSON.parse(data||'{}');}
 return async(request,response,path)=>{
  const send=(status,value)=>{response.writeHead(status);response.end(JSON.stringify(value));};
  if(!path.startsWith('/api/v1/community/'))return false;
  try{
   const key=request.headers['x-real-ip']||request.socket.remoteAddress,now=Date.now();
   for(const [ip,value]of attempts)if(now-value.at>600000)attempts.delete(ip);
   db.prepare('DELETE FROM sessions WHERE expires < ?').run(now);
   const bearer=request.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
   const user=bearer?db.prepare('SELECT users.id,users.name FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.hash=? AND expires>?').get(digest(bearer),now):null;
   const admin=user&&user.name.toLowerCase()===adminName.toLowerCase();
   if(request.method==='GET'){
    if(path.endsWith('/me')){send(200,{user:user?{...user,admin:!!admin}:null});return true;}
    if(path.endsWith('/posts')){const query=new URL(request.url,'http://localhost').searchParams;const parent=Number(query.get('parent'))||0;if(parent&&!db.prepare("SELECT id FROM posts WHERE id=? AND (status='published' OR user_id=? OR ?=1)").get(parent,user?.id||0,admin?1:0)){send(200,{items:[]});return true;}const rows=db.prepare(`SELECT posts.id,posts.parent,posts.title,posts.body,posts.status,posts.created,users.name AS author,posts.user_id=? AS own FROM posts JOIN users ON users.id=posts.user_id WHERE COALESCE(posts.parent,0)=? AND (posts.status='published' OR posts.user_id=? OR ?=1) ORDER BY posts.id DESC LIMIT 100`).all(user?.id||0,parent,user?.id||0,admin?1:0);send(200,{items:rows});return true;}
    if(path.endsWith('/moderation')&&admin){send(200,{items:db.prepare(`SELECT posts.id,posts.title,posts.body,posts.status,users.name AS author,(SELECT COUNT(*) FROM reports WHERE post_id=posts.id) AS reports FROM posts JOIN users ON users.id=posts.user_id WHERE status IN ('pending','reported') ORDER BY posts.id LIMIT 100`).all()});return true;}
   }
   if(request.method!=='POST'){send(405,{error:'Method not allowed'});return true;}
   if(request.headers['content-type']?.split(';')[0]!=='application/json'){send(415,{error:'JSON required'});return true;}
   const input=await body(request);
   if(path.endsWith('/register')||path.endsWith('/login')){
    const limit=attempts.get(key)||{at:now,count:0};limit.count++;attempts.set(key,limit);if(limit.count>12||hashing>=2){send(429,{error:'操作频繁，请稍后再试 / Try later'});return true;}
    if(!/^[A-Za-z0-9_]{3,24}$/.test(input.name||'')||!clean(input.password,12,128))throw Error('用户名需 3–24 位字母、数字或下划线；密码需 12–128 位 / Invalid username or password');
    let member=db.prepare('SELECT * FROM users WHERE name=?').get(input.name);
    hashing++;
    try{
     if(path.endsWith('/register')){
      if(input.accept!==true)throw Error('请同意论坛规则与账号隐私说明 / Accept community rules');
      if(member||input.name.toLowerCase()===adminName.toLowerCase())throw Error('无法使用此用户名 / Username unavailable');
      const salt=randomBytes(16).toString('hex'),hash=Buffer.from(await scrypt(input.password,salt,64)).toString('hex');
      const id=db.prepare('INSERT INTO users(name,salt,hash,created) VALUES(?,?,?,?)').run(input.name,salt,hash,new Date(now).toISOString()).lastInsertRowid;member={id,name:input.name};
     }else{
      const hash=Buffer.from(await scrypt(input.password,member?.salt||'missing-user-salt',64));if(!member||!timingSafeEqual(hash,Buffer.from(member.hash,'hex')))throw Error('用户名或密码不正确 / Invalid credentials');
     }
    }finally{hashing--;}
    const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(token),member.id,now+86400000);send(200,{token,user:{id:Number(member.id),name:member.name,admin:member.name.toLowerCase()===adminName.toLowerCase()}});return true;
   }
   if(!user){send(401,{error:'请先登录 / Sign in first'});return true;}
   if(path.endsWith('/logout')){db.prepare('DELETE FROM sessions WHERE hash=?').run(digest(bearer));send(200,{ok:true});return true;}
   if(path.endsWith('/delete-account')){if(admin)throw Error('管理员账号不能在此注销');if(input.confirm!==user.name)throw Error('请输入用户名确认 / Confirm username');db.prepare('DELETE FROM users WHERE id=?').run(user.id);db.exec('PRAGMA wal_checkpoint(TRUNCATE)');send(200,{ok:true});return true;}
   if(path.endsWith('/posts')){
    if(!clean(input.body,3,5000)||!clean(input.title,3,120))throw Error('标题 3–120 字，正文 3–5000 字 / Invalid post length');
    const recent=db.prepare('SELECT COUNT(*) AS n FROM posts WHERE user_id=? AND created>?').get(user.id,new Date(now-3600000).toISOString());if(recent.n>=10)throw Error('每小时最多发表十条内容 / Posting limit reached');
    const parent=Number(input.parent)||null;if(parent&&!db.prepare("SELECT id FROM posts WHERE id=? AND parent IS NULL AND status='published'").get(parent))throw Error('主题不可用 / Topic unavailable');
    const result=db.prepare('INSERT INTO posts(user_id,parent,title,body,status,created) VALUES(?,?,?,?,?,?)').run(user.id,parent,input.title.trim(),input.body.trim(),admin?'published':'pending',new Date(now).toISOString());send(201,{id:Number(result.lastInsertRowid),status:admin?'published':'pending'});return true;
   }
   const id=Number(input.id);if(!Number.isSafeInteger(id)||id<1)throw Error('Invalid post');
   if(path.endsWith('/delete')){db.prepare('DELETE FROM posts WHERE id=? AND (user_id=? OR ?=1)').run(id,user.id,admin?1:0);send(200,{ok:true});return true;}
   if(path.endsWith('/report')){if(!clean(input.reason,3,500))throw Error('请填写举报原因 / Report reason required');db.prepare('INSERT OR IGNORE INTO reports(user_id,post_id,reason) VALUES(?,?,?)').run(user.id,id,input.reason);db.prepare("UPDATE posts SET status='reported' WHERE id=?").run(id);send(200,{ok:true});return true;}
   if(path.endsWith('/moderate')&&admin){if(!['published','rejected'].includes(input.status))throw Error('Invalid status');db.prepare('UPDATE posts SET status=? WHERE id=?').run(input.status,id);send(200,{ok:true});return true;}
   send(404,{error:'Not found'});
  }catch(error){send(400,{error:error.message.startsWith('SQLITE')||/constraint|FOREIGN KEY/i.test(error.message)?'请求无法完成 / Request could not be completed':error instanceof SyntaxError?'Invalid JSON':error.message});}
  return true;
 };
}
