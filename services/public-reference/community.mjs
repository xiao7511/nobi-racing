import {DatabaseSync} from 'node:sqlite';
import {randomBytes,scrypt as derive,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
import {writeFileSync,readFileSync} from 'node:fs';
import {promisify} from 'node:util';
const scrypt=promisify(derive),digest=value=>createHash('sha256').update(value).digest('hex');
const stickers=new Set(JSON.parse(readFileSync(new URL('./community-content.json',import.meta.url),'utf8')).stickers.map(s=>s.id));
export function community(directory){
 const db=new DatabaseSync(directory+'/community.sqlite');db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA secure_delete=ON;
 CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,name TEXT UNIQUE COLLATE NOCASE,salt TEXT,hash TEXT,created TEXT);
 CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,expires INTEGER);
 CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY,user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,parent INTEGER REFERENCES posts(id) ON DELETE CASCADE,title TEXT,body TEXT,status TEXT DEFAULT 'pending',created TEXT);
 CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY,user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,reason TEXT,UNIQUE(user_id,post_id));`);
 const columns=new Set(db.prepare('PRAGMA table_info(posts)').all().map(c=>c.name));
 if(!columns.has('reply_to'))db.exec('ALTER TABLE posts ADD COLUMN reply_to INTEGER REFERENCES posts(id) ON DELETE SET NULL');
 if(!columns.has('sticker'))db.exec('ALTER TABLE posts ADD COLUMN sticker TEXT');
 db.exec(`CREATE INDEX IF NOT EXISTS posts_thread_status ON posts(parent,status,id);
 CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY,user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,created TEXT,read_at TEXT,UNIQUE(user_id,post_id));
 CREATE INDEX IF NOT EXISTS notifications_recipient ON notifications(user_id,read_at,id);`);
 db.exec('CREATE INDEX IF NOT EXISTS notifications_created ON notifications(created); CREATE INDEX IF NOT EXISTS posts_author_time ON posts(user_id,created)');
 const visibleRoot=(id,user,admin)=>db.prepare("SELECT p.*,u.name AS author,p.user_id=? AS own FROM posts p JOIN users u ON u.id=p.user_id WHERE p.id=? AND p.parent IS NULL AND (p.status='published' OR p.user_id=? OR ?=1)").get(user?.id||0,id,user?.id||0,admin?1:0);
 function notify(id){
  const post=db.prepare("SELECT p.*,root.user_id AS root_author,root.status AS root_status,q.user_id AS target_author FROM posts p JOIN posts root ON root.id=p.parent LEFT JOIN posts q ON q.id=p.reply_to WHERE p.id=? AND p.status='published'").get(id);
  if(!post||post.root_status!=='published')return;
  for(const recipient of new Set([post.root_author,post.target_author].filter(value=>value&&value!==post.user_id)))db.prepare('INSERT OR IGNORE INTO notifications(user_id,sender_id,post_id,created) VALUES(?,?,?,?)').run(recipient,post.user_id,id,new Date().toISOString());
 }
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
   for(const [ip,value]of attempts)if(now-value.at>120000)attempts.delete(ip);
   db.prepare('DELETE FROM sessions WHERE expires < ?').run(now);
   db.prepare('DELETE FROM notifications WHERE created < ?').run(new Date(now-90*86400000).toISOString());
   const bearer=request.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
   const user=bearer?db.prepare('SELECT users.id,users.name FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.hash=? AND expires>?').get(digest(bearer),now):null;
   const admin=user&&user.name.toLowerCase()===adminName.toLowerCase();
   if(request.method==='GET'){
    if(path.endsWith('/overview')){send(200,{topics:db.prepare("SELECT COUNT(*) AS n FROM posts WHERE parent IS NULL AND status='published'").get().n,replies:db.prepare("SELECT COUNT(*) AS n FROM posts p JOIN posts root ON root.id=p.parent WHERE p.status='published' AND root.status='published'").get().n,items:db.prepare("SELECT p.id,p.title,p.body,p.sticker,p.created,u.name AS author FROM posts p JOIN users u ON u.id=p.user_id WHERE p.parent IS NULL AND p.status='published' ORDER BY p.id DESC LIMIT 3").all().map(p=>({...p,body:p.body.slice(0,120)}))});return true;}
    if(path.endsWith('/topic')){const id=Number(new URL(request.url,'http://localhost').searchParams.get('id'));const item=Number.isSafeInteger(id)&&id>0?visibleRoot(id,user,admin):null;send(item?200:404,item?{item}:{error:'主题不可用 / Topic unavailable'});return true;}
    if(path.endsWith('/notifications')){if(!user){send(401,{error:'请先登录 / Sign in first'});return true;}const rows=db.prepare(`SELECT n.id,n.post_id AS message_id,p.parent AS topic_id,root.title,p.body,p.sticker,n.created,n.read_at,u.name AS author FROM notifications n JOIN posts p ON p.id=n.post_id JOIN posts root ON root.id=p.parent JOIN users u ON u.id=n.sender_id WHERE n.user_id=? AND p.status='published' AND root.status='published' ORDER BY n.id DESC LIMIT 100`).all(user.id);send(200,{items:rows.map(n=>({...n,body:n.body.slice(0,160)})),unread:db.prepare("SELECT COUNT(*) AS n FROM notifications n JOIN posts p ON p.id=n.post_id JOIN posts root ON root.id=p.parent WHERE n.user_id=? AND n.read_at IS NULL AND p.status='published' AND root.status='published'").get(user.id).n});return true;}
    if(path.endsWith('/me')){send(200,{user:user?{...user,admin:!!admin}:null});return true;}
    if(path.endsWith('/posts')){const query=new URL(request.url,'http://localhost').searchParams,parent=Number(query.get('parent'))||0,limit=Math.min(200,Math.max(50,Number(query.get('limit'))||50));if(!Number.isSafeInteger(parent)||parent<0||!Number.isSafeInteger(limit))throw Error('Invalid page');if(parent&&!visibleRoot(parent,user,admin)){send(200,{items:[],hasMore:false});return true;}const rows=db.prepare(`SELECT p.id,p.parent,p.title,p.body,p.status,p.created,p.sticker,p.reply_to,u.name AS author,p.user_id=? AS own,
      CASE WHEN q.status='published' OR q.user_id=? OR ?=1 THEN q.body ELSE NULL END AS quote_body,
      CASE WHEN q.status='published' OR q.user_id=? OR ?=1 THEN qu.name ELSE NULL END AS quote_author,
      CASE WHEN q.status='published' OR q.user_id=? OR ?=1 THEN q.sticker ELSE NULL END AS quote_sticker,
      (SELECT COUNT(*) FROM posts c WHERE c.parent=p.id AND (c.status='published' OR c.user_id=? OR ?=1)) AS replies
      FROM posts p JOIN users u ON u.id=p.user_id LEFT JOIN posts q ON q.id=p.reply_to LEFT JOIN users qu ON qu.id=q.user_id
      WHERE COALESCE(p.parent,0)=? AND (p.status='published' OR p.user_id=? OR ?=1) ORDER BY p.id DESC LIMIT ?`).all(user?.id||0,user?.id||0,admin?1:0,user?.id||0,admin?1:0,user?.id||0,admin?1:0,user?.id||0,admin?1:0,parent,user?.id||0,admin?1:0,limit+1);const hasMore=rows.length>limit;const items=rows.slice(0,limit).map(p=>({...p,quote_body:p.quote_body?.slice(0,180)||null}));send(200,{items:parent?items.reverse():items,hasMore});return true;}
    if(path.endsWith('/moderation')&&admin){send(200,{items:db.prepare(`SELECT posts.id,posts.parent,posts.title,posts.body,posts.sticker,posts.status,users.name AS author,(SELECT COUNT(*) FROM reports WHERE post_id=posts.id) AS reports FROM posts JOIN users ON users.id=posts.user_id WHERE status IN ('pending','reported') ORDER BY posts.id LIMIT 100`).all()});return true;}
   }
   if(request.method!=='POST'){send(405,{error:'Method not allowed'});return true;}
   if(request.headers['content-type']?.split(';')[0]!=='application/json'){send(415,{error:'JSON required'});return true;}
   const input=await body(request);
   if(path.endsWith('/register')||path.endsWith('/login')){
    const limit=attempts.get(key)||{at:now,count:0};if(!attempts.has(key))setTimeout(()=>{if(attempts.get(key)===limit)attempts.delete(key);},120000).unref();limit.count++;attempts.set(key,limit);if(limit.count>12||hashing>=2){send(429,{error:'操作频繁，请稍后再试 / Try later'});return true;}
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
   if(path.endsWith('/notifications/read')){if(input.all===true)db.prepare('UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL').run(new Date(now).toISOString(),user.id);else{if(!Number.isSafeInteger(input.id)||input.id<1)throw Error('Invalid notification');db.prepare('UPDATE notifications SET read_at=? WHERE id=? AND user_id=?').run(new Date(now).toISOString(),input.id,user.id);}send(200,{ok:true});return true;}
   if(path.endsWith('/logout')){db.prepare('DELETE FROM sessions WHERE hash=?').run(digest(bearer));send(200,{ok:true});return true;}
   if(path.endsWith('/delete-account')){if(admin)throw Error('管理员账号不能在此注销');if(input.confirm!==user.name)throw Error('请输入用户名确认 / Confirm username');db.prepare('DELETE FROM users WHERE id=?').run(user.id);db.exec('PRAGMA wal_checkpoint(TRUNCATE)');send(200,{ok:true});return true;}
   if(path.endsWith('/posts')){
    const parent=input.parent==null?null:Number(input.parent),sticker=input.sticker||null,text=typeof input.body==='string'?input.body.trim():'';if(parent!==null&&(!Number.isSafeInteger(parent)||parent<1))throw Error('Invalid topic');if(sticker&&!stickers.has(sticker))throw Error('Invalid sticker');if(!clean(text,0,5000)||(!text&&!sticker)||!clean(input.title,3,120))throw Error('请填写标题和内容，或选择表情贴纸 / Invalid post length');
    const recent=db.prepare('SELECT COUNT(*) AS n FROM posts WHERE user_id=? AND (parent IS NULL)=? AND created>?').get(user.id,parent?0:1,new Date(now-3600000).toISOString());if(recent.n>=(parent?60:10))throw Error('发表频率已达上限，请稍后再试 / Posting limit reached');
    if(parent&&!db.prepare("SELECT id FROM posts WHERE id=? AND parent IS NULL AND status='published'").get(parent))throw Error('主题不可用 / Topic unavailable');
    const replyTo=input.replyTo==null?parent:Number(input.replyTo);if(replyTo&&(!Number.isSafeInteger(replyTo)||!db.prepare("SELECT id FROM posts WHERE id=? AND (id=? OR parent=?) AND status='published'").get(replyTo,parent,parent)))throw Error('引用消息不可用 / Quoted message unavailable');
    const result=db.prepare('INSERT INTO posts(user_id,parent,title,body,status,created,reply_to,sticker) VALUES(?,?,?,?,?,?,?,?)').run(user.id,parent,input.title.trim(),text,admin?'published':'pending',new Date(now).toISOString(),replyTo,sticker);if(admin)notify(Number(result.lastInsertRowid));send(201,{id:Number(result.lastInsertRowid),status:admin?'published':'pending'});return true;
   }
   const id=Number(input.id);if(!Number.isSafeInteger(id)||id<1)throw Error('Invalid post');
   if(path.endsWith('/delete')){db.prepare('DELETE FROM posts WHERE id=? AND (user_id=? OR ?=1)').run(id,user.id,admin?1:0);send(200,{ok:true});return true;}
   if(path.endsWith('/report')){if(!clean(input.reason,3,500))throw Error('请填写举报原因 / Report reason required');db.prepare('INSERT OR IGNORE INTO reports(user_id,post_id,reason) VALUES(?,?,?)').run(user.id,id,input.reason);db.prepare("UPDATE posts SET status='reported' WHERE id=?").run(id);send(200,{ok:true});return true;}
   if(path.endsWith('/moderate')&&admin){if(!['published','rejected'].includes(input.status))throw Error('Invalid status');db.exec('BEGIN');try{db.prepare('UPDATE posts SET status=? WHERE id=?').run(input.status,id);if(input.status==='published')notify(id);db.exec('COMMIT');}catch(error){db.exec('ROLLBACK');throw error;}send(200,{ok:true});return true;}
   send(404,{error:'Not found'});
  }catch(error){send(400,{error:error.message.startsWith('SQLITE')||/constraint|FOREIGN KEY/i.test(error.message)?'请求无法完成 / Request could not be completed':error instanceof SyntaxError?'Invalid JSON':error.message});}
  return true;
 };
}
