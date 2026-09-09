import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4174);
const allowed=new Set(['index.html','styles.css','wallet.css','ui-enhancements.css','app.mjs','engine.mjs','content.mjs','icon.svg','API_INTEGRATION.md']);
const avatarPattern=/^assets\/avatars\/[a-z0-9-]+\.png$/;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.md':'text/markdown; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  let name;
  try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400).end();return;}
  if(!['GET','HEAD'].includes(req.method)||(!allowed.has(name)&&!avatarPattern.test(name))){res.writeHead(404).end('Not found');return;}
  try{const data=await readFile(path.join(root,name));res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);}catch{res.writeHead(404).end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`GAME-004 local preview: http://127.0.0.1:${port}`));
