import {EVENTS, DAYS, PERSONAS, createContacts, provider, FEED_SEEDS, SOCIAL_COMMENTS, PLAYER_POSTS} from './content.mjs';
export const SAVE_KEY = 'game004.chairman.v1';
export const SAVE_VERSION = 3;
export const OPENING_BALANCE_CENTS = 8888888888;
const clone = value => JSON.parse(JSON.stringify(value));
const clamp = n => Math.max(0, Math.min(100,n));
/** @typedef {{trust:number,respect:number,tension:number}} RelationshipState */
/** @typedef {{id:string,name:string,role:string,age:number,color:string,personality:string}} ContactProfile */
/** @typedef {{id:string,day:number,contact:string,topic:string,lines:string[],choices:ReplyChoice[]}} ScenarioEvent */
/** @typedef {{id:string,text:string,reply:string,effects:object,kind?:string,amount?:number}} ReplyChoice */
/** @typedef {{id:string,author:string,text:string,day:number,liked:boolean,comments:object[]}} FeedItem */
/** @typedef {{id:string,day:number,amountCents:number,kind:string,purpose:string,to:string,status:string}} LedgerEntry */
/** @typedef {{version:number,seed:number,day:number,player:object,company:object,wallet:object,contacts:ContactProfile[],relationships:Object<string,RelationshipState>,messages:object[],feed:FeedItem[],ledger:LedgerEntry[],decisions:object,flags:object,read:object,sequence:number,ending:object|null}} GameState */
export function activeEvent(state) { return EVENTS.find(e => e.day===state.day && !state.decisions[e.id]) || null; }
export function contactById(state,id) { return state.contacts.find(c=>c.id===id); }
export function unread(state,id) { return state.messages.filter(m=>m.contact===id&&m.from!=='me'&&m.seq>(state.read[id]||0)).length; }
function message(s,contact,text,extra={}) {
  const seq = ++s.sequence;
  const done = EVENTS.filter(e=>e.day===s.day&&s.decisions[e.id]).length;
  s.messages.push({id:`m${seq}`,seq,day:s.day,time:`${String(9+done*3).padStart(2,'0')}:${String((seq*3)%60).padStart(2,'0')}`,contact,from:contact,text,...extra});
}
function effects(s,person,company={},relation={}) {
  for(const [key,val] of Object.entries(company)) {
    if(!['ready','reputation','team','hype'].includes(key)||!Number.isFinite(val)) throw new Error('无效的世界规则');
    s.company[key]=clamp(s.company[key]+val);
  }
  if(person) for(const [key,val] of Object.entries(relation)) {
    if(!['trust','respect','tension'].includes(key)||!Number.isFinite(val)) throw new Error('无效的关系规则');
    s.relationships[person][key]=clamp(s.relationships[person][key]+val);
  }
}
function activate(s) {
  const ev = activeEvent(s);
  if(ev) provider.opening(ev,s).forEach(text=>message(s,ev.contact,text,{eventId:ev.id}));
  else message(s,'assistant',s.day===7?'今天所有安排都确认了。发布之后，您可以在这里收下这一周的回信。':'今天需要您拍板的事都处理好了。还可以看看朋友圈，忙完跟我说一声，我们就结束今天。',{dayEnd:true});
}
function enterDay(s) {
  message(s,'assistant',provider.dayBrief(s));
  FEED_SEEDS[s.day-1].forEach(([author,text,art],i)=>s.feed.unshift({id:`f${s.day}-${i}`,day:s.day,author,text,art,liked:false,commented:false,comments:[],likes: i===0?['assistant','market']:['product'],time:i===0?'08:32':'08:46'}));
  activate(s);
}
export function createGame(title='林董',seed=4107,persona='tycoon') {
  const profile=PERSONAS.find(p=>p.id===persona)||PERSONAS[1];
  title = String(title).trim().slice(0,12) || '林董';
  const contacts = createContacts(seed);
  const starts={handsome:{ready:40,reputation:52,team:62,hype:40},tycoon:{ready:40,reputation:55,team:65,hype:30},richwoman:{ready:40,reputation:62,team:64,hype:32},underdog:{ready:38,reputation:50,team:75,hype:28}};
  const s={version:SAVE_VERSION,seed,day:1,player:{title,persona:profile.id},company:starts[profile.id],wallet:{balanceCents:OPENING_BALANCE_CENTS,cards:8},
    contacts,relationships:Object.fromEntries(contacts.map(c=>[c.id,{trust:55,respect:55,tension:15}])),
    messages:[],feed:[],ledger:[],decisions:{},flags:{},read:{},sequence:0,ending:null,postsByDay:{},feedSeenDay:0};
  const personaOpenings={
    handsome:'今天媒体对您的关注甚至早于产品。镜头能带来声量，也会把每次犹豫放大。',
    tycoon:'专项账户已经备好。钱可以让事情更快，但这周真正难买的是时间和信任。',
    richwoman:'您上任后第一次亲自盯发布，外界评价不错。团队也在看，您的承诺能不能落到细节。',
    underdog:'昨晚最后一份股权委托已经生效。那些曾让您替项目背锅的人，今天开始要到这里向您汇报。',
  };
  contacts.forEach(c=>message(s,c.id,c.id==='assistant'?`您的行程和待办我都整理好了。${personaOpenings[profile.id]}`:c.id==='investor'&&profile.id==='underdog'?`${title}，董事会改选结果我收到了。能从一线走到这个位置不容易，但资本只看下一份结果。`:`${title}，我是${c.name}，负责${c.role.replace('负责人','')}这边。有进展我会在这里同步。`,{greeting:true}));
  // Existing acquaintance messages are not new notifications.
  contacts.forEach(c=>s.read[c.id]=s.sequence);
  enterDay(s); return s;
}
export function endingFor(s) {
  const c=s.company, launch=s.flags['d7-launch'];
  const core=s.contacts.filter(p=>p.tier==='核心');
  const trust=core.reduce((n,p)=>n+s.relationships[p.id].trust,0)/core.length;
  let id;
  if(launch==='delay'&&c.reputation>=40) id='delay';
  else if(launch==='full'&&c.ready>=65&&c.hype>=65&&(c.team<45||trust<45)) id='fracture';
  else if(launch!=='delay'&&c.ready>=70&&c.reputation>=40&&c.team>=45&&trust>=40) id='steady';
  else id='collapse';
  const endings={
    steady:{title:'稳健发布',kicker:'有些信任，是一件件小事攒下来的。',body:'拾光一号按验证过的范围进入门店。首发没有把每一项纪录都改写，但问题有人接，承诺有人记。团队第二天仍愿意主动给你发消息。'},
    fracture:{title:'爆款，但团队失和',kicker:'产品站到了聚光灯下，人却慢慢退到了阴影里。',body:'集中资源换来了很大的首发声量，技术团队也顶住了交付。屏幕上全是祝贺，但后台的对话短了。有人开始只发“收到”，不再说“我有个想法”。'},
    delay:{title:'延期，保住口碑',kicker:'你推迟了一个日期，没有推迟一份承诺。',body:'你亲自解释延期、验证范围和后续安排。台下有失望，也有人愿意继续等。渠道重新排了时间，团队终于敢把没做完的事说清楚。'},
    collapse:{title:'信任与发布双重失控',kicker:'那些没有被回答的问题，最后一起回来了。',body:'发布进度与实际准备脱节，先前的口径被逐一翻出。门店和团队都在等一个可信的解释。你仍坐在董事长的位置上，却发现一句命令已经换不回一句真话。'},
  };
  const summary = EVENTS.filter(e=>s.decisions[e.id]).filter(e=>['d1-target','d3-supply','d4-statement','d5-staff','d7-launch'].includes(e.id)).map(e=>({day:e.day,topic:e.topic,text:e.choices.find(c=>c.id===s.decisions[e.id]).text}));
  return {id,...endings[id],summary};
}
/** The sole public state mutation boundary. Input never accepts caller-supplied effects or money. */
export function dispatch(state,action) {
  if(!state||!action||typeof action.type!=='string') return {state,error:'无法识别这次操作。'};
  const s=clone(state);
  const fail=error=>({state,error});
  if(s.ending&&!['READ','FEED_READ'].includes(action.type)) return fail('这一周已经结束。可以继续查看记录，或重新开始。');
  if(action.type==='CHOOSE') {
    const ev=activeEvent(s);
    if(!ev||ev.id!==action.eventId) return fail('这件事已经处理，或还没有轮到它。');
    const ch=ev.choices.find(c=>c.id===action.choiceId);
    if(!ch) return fail('请选择当前提供的回复。');
    const amountCents=ch.amount*100;
    if(ch.amount && (!Number.isSafeInteger(amountCents)||amountCents<=0||s.wallet.balanceCents<amountCents)) return fail('虚拟钱包余额不足，请选择其他安排。');
    message(s,ev.contact,ch.text,{from:'me'});
    if(ch.kind) {
      const id=`l-${ev.id}`;
      if(s.ledger.some(item=>item.id===id))return fail('这笔虚拟交易已经完成，不能重复扣款。');
      s.wallet.balanceCents-=amountCents;
      const entry={id,day:s.day,amountCents,kind:ch.kind,purpose:ch.purpose,to:ev.contact,status:'已收取'};
      s.ledger.push(entry);
      message(s,ev.contact,ch.purpose,{from:'me',transaction:entry});
    }
    effects(s,ev.contact,ch.effects.company,ch.effects.relation);
    s.decisions[ev.id]=ch.id;
    if(ch.flag)s.flags[ev.id]=ch.flag;
    provider.response(ev,ch,s).forEach(t=>message(s,ev.contact,t));
    // A consequential follow-up is visible outside the decision conversation.
    if(ev.id==='d2-team'||ev.id==='d5-staff') message(s,'engineer',ch.id==='a'?'听人事说可以轮休了。谢谢您，我今晚把交接写清楚，明天接着做。':'人事的安排收到了。我先把这轮测试跑完。');
    if(ev.id==='d4-leak') message(s,'assistant',ch.id==='a'?'内部群重新有人补充截图的上下文了，我转给人事核实。':'今天内部群消息少了很多。我会继续整理您需要的信息。');
    activate(s);
  } else if(action.type==='READ') {
    if(!contactById(s,action.contactId))return fail('联系人不存在。');
    s.read[action.contactId]=s.sequence;
  } else if(action.type==='FEED_READ') {
    s.feedSeenDay=s.day;
  } else if(action.type==='LIKE') {
    const post=s.feed.find(p=>p.id===action.postId);
    if(!post||post.author==='me')return fail('这条动态不可点赞。');
    // Reversible notification gesture; first positive effect can be claimed only once.
    post.liked=!post.liked;
    if(post.liked&&!post.likeRewarded) {effects(s,post.author,{team:1},{trust:1});post.likeRewarded=true;}
  } else if(action.type==='COMMENT') {
    const post=s.feed.find(p=>p.id===action.postId);
    const template=SOCIAL_COMMENTS.find(c=>c.id===action.commentId);
    if(!post||post.author==='me'||post.commented||!template)return fail('这条动态已经回复，或回复不存在。');
    post.commented=true;
    post.comments.push({author:'me',text:template.text},{author:post.author,text:template.reply});
    effects(s,post.author,template.company,template.relation);
    message(s,post.author,`刚看到您的评论：“${template.text}” ${template.reply}`);
  } else if(action.type==='POST') {
    const template=PLAYER_POSTS.find(p=>p.id===action.postId);
    if(!template||s.postsByDay[s.day])return fail('今天已经发过动态了。');
    s.postsByDay[s.day]=template.id;
    effects(s,template.contact,template.company,{});
    s.feed.unshift({id:`own-${s.day}`,author:'me',day:s.day,time:'刚刚',text:template.text,art:null,liked:false,comments:[{author:template.contact,text:template.reply}],likes:['assistant',template.contact]});
  } else if(action.type==='NEXT_DAY') {
    if(activeEvent(s))return fail('还有需要您拍板的消息，先处理完再下班。');
    if(s.day===7) {
      s.ending=endingFor(s);
      message(s,'assistant','这一周的回信已经放在您的个人页。您随时可以继续翻看聊天和动态。');
      message(s,'gm',s.ending.id==='steady'?'今天的事情落地了。我先给大家放个假，下周我们继续。':s.ending.id==='delay'?'延期说明已经发出。明天我把剩余验证重新排好，一件一件做。':s.ending.id==='fracture'?'首发数据很好。我想过两天单独跟您聊聊团队的事。':'我需要跟您重新对齐下一步。现在先不要再对外作新的承诺了。');
    } else {s.day++;enterDay(s);}
  } else return fail('未知操作，进度未改变。');
  return {state:s,error:null};
}
export function saveGame(storage,state) {
  try {storage.setItem(SAVE_KEY,JSON.stringify(state));return null;}catch{return '浏览器无法保存。请勿关闭页面，或换普通浏览模式后重试。';}
}
export function clearGame(storage) {
  try {storage.removeItem(SAVE_KEY);return null;}catch{return '浏览器拒绝清除，请在浏览器设置中删除本站数据。';}
}
export function loadGame(storage) {
  let raw;
  try {raw=storage.getItem(SAVE_KEY);}catch{return {state:null,error:'浏览器不允许读取存档，可继续临时试玩。',blocked:false};}
  if(!raw)return {state:null,error:null};
  try {
    let s=JSON.parse(raw);
    if(s.version===1)s=migrateV1(s);
    if(s.version===2)s=migrateV2(s);
    if(s.version!==SAVE_VERSION)throw new Error('存档版本暂不兼容');
    if(!Number.isInteger(s.day)||s.day<1||s.day>7||!s.player||typeof s.player.title!=='string'||s.player.title.length>12||!PERSONAS.some(p=>p.id===s.player.persona))throw new Error('存档信息不完整');
    if(!Number.isSafeInteger(s.seed)||!Array.isArray(s.contacts)||!Array.isArray(s.messages)||!Array.isArray(s.feed)||!Array.isArray(s.ledger)||!s.flags||!s.decisions||!s.read||!s.postsByDay||!s.relationships||!s.wallet)throw new Error('存档结构不完整');
    const expected=createContacts(s.seed),ids=expected.map(c=>c.id),allowed=new Set([...ids,'me']);
    if(s.contacts.length!==expected.length||new Set(s.contacts.map(c=>c.id)).size!==expected.length||s.contacts.some((c,i)=>!expected[i]||['id','name','role','age','tier','personality','color','avatar','image','company'].some(k=>c[k]!==expected[i][k])))throw new Error('联系人数据无效');
    for(const id of ids)for(const k of ['trust','respect','tension'])if(!Number.isFinite(s.relationships[id]?.[k])||s.relationships[id][k]<0||s.relationships[id][k]>100)throw new Error('关系数据无效');
    for(const k of ['ready','reputation','team','hype'])if(!Number.isFinite(s.company?.[k])||s.company[k]<0||s.company[k]>100)throw new Error('状态数据无效');
    validateStoryPrefix(s);
    validateFlags(s);
    validateMessages(s,ids);
    validateFeed(s,allowed);
    validateProgressMetadata(s,ids);
    validateLedger(s);
    if(s.ending!==null) {
      if(s.day!==7||activeEvent(s))throw new Error('结局数据无效');
      if(JSON.stringify(s.ending)!==JSON.stringify(endingFor(s)))throw new Error('结局数据无效');
    } else if(s.day===7&&!activeEvent(s)&&s.messages.some(m=>m.text.includes('这一周的回信已经放在')))throw new Error('结局数据缺失');
    return {state:s,error:null};
  } catch(e) {return {state:null,error:`${e.message || '无法读取存档'}。原数据尚未覆盖，请确认后清除并重开。`,blocked:true};}
}

function migrateV1(old) {
  const s=clone(old);
  if(!Array.isArray(s.ledger))throw new Error('旧存档流水无效');
  s.version=2;
  s.wallet={balanceCents:OPENING_BALANCE_CENTS-s.ledger.reduce((sum,l)=>sum+(Number.isSafeInteger(l.amount)&&l.amount>0?l.amount*100:0),0),cards:8};
  s.ledger=s.ledger.map(l=>({id:l.id,day:l.day,amountCents:l.amount*100,kind:l.kind,purpose:l.purpose,to:l.to,status:l.status}));
  if(s.company)delete s.company.cash;
  return migrateV2(s);
}
function migrateV2(old) {
  const s=clone(old),expected=createContacts(s.seed);
  s.version=SAVE_VERSION;
  s.player={...s.player,persona:s.player?.persona||'tycoon'};
  if(Array.isArray(s.contacts))s.contacts=s.contacts.map((c,i)=>({...c,image:c.image??expected[i]?.image}));
  return s;
}
function validateStoryPrefix(s) {
  const decisionKeys=Object.keys(s.decisions);
  if(decisionKeys.some(id=>!EVENTS.some(e=>e.id===id)))throw new Error('剧情数据无效');
  for(let day=1;day<=7;day++) {
    const dayEvents=EVENTS.filter(e=>e.day===day);
    const chosen=dayEvents.map(e=>Object.hasOwn(s.decisions,e.id));
    if(day<s.day&&chosen.some(v=>!v))throw new Error('剧情进度缺失');
    if(day>s.day&&chosen.some(Boolean))throw new Error('剧情时间无效');
    if(chosen.some((v,i)=>v&&!chosen.slice(0,i).every(Boolean)))throw new Error('剧情顺序无效');
    dayEvents.forEach(e=>{if(Object.hasOwn(s.decisions,e.id)&&!e.choices.some(c=>c.id===s.decisions[e.id]))throw new Error('剧情选择无效');});
  }
}
function validateFlags(s) {
  const expected={};
  for(const [eventId,choiceId] of Object.entries(s.decisions)) {
    const ev=EVENTS.find(e=>e.id===eventId),ch=ev.choices.find(c=>c.id===choiceId);
    if(ch.flag)expected[eventId]=ch.flag;
  }
  if(JSON.stringify(s.flags)!==JSON.stringify(expected))throw new Error('剧情标记无效');
}
function validateMessages(s,ids) {
  if(!Number.isSafeInteger(s.sequence)||s.sequence<0||s.messages.length!==s.sequence||s.messages.some((m,i)=>m.seq!==i+1||!ids.includes(m.contact)||!(m.from==='me'||m.from===m.contact)||typeof m.text!=='string'||!Number.isInteger(m.day)||m.day<1||m.day>s.day||typeof m.time!=='string'))throw new Error('消息数据无效');
  const current=activeEvent(s);
  for(const ev of EVENTS) {
    const reached=ev.day<s.day||Object.hasOwn(s.decisions,ev.id)||current?.id===ev.id;
    const tagged=s.messages.filter(m=>m.eventId===ev.id);
    if(reached&&!tagged.some(m=>m.contact===ev.contact&&m.from===ev.contact&&m.day===ev.day))throw new Error('剧情消息前缀缺失');
    if(!reached&&tagged.length)throw new Error('剧情消息时间无效');
  }
  for(const m of s.messages)if(m.transaction) {
    const entry=s.ledger.find(l=>l.id===m.transaction.id);
    if(!entry||JSON.stringify(m.transaction)!==JSON.stringify(entry)||m.from!=='me'||m.contact!==entry.to||m.text!==entry.purpose)throw new Error('交易消息无效');
  }
  for(const entry of s.ledger)if(s.messages.filter(m=>m.transaction?.id===entry.id).length!==1)throw new Error('交易消息缺失');
}
function validateFeed(s,allowed) {
  const arts=new Set([null,'invite','lab','coffee','factory']),ids=new Set();
  if(s.feed.some(p=>ids.has(p.id)||!ids.add(p.id)||!allowed.has(p.author)||typeof p.text!=='string'||!arts.has(p.art??null)||typeof p.liked!=='boolean'||!Array.isArray(p.comments)||p.comments.some(c=>!allowed.has(c.author)||typeof c.text!=='string')||!Array.isArray(p.likes)||p.likes.some(id=>!allowed.has(id))))throw new Error('动态数据无效');
  for(let day=1;day<=s.day;day++)for(let i=0;i<FEED_SEEDS[day-1].length;i++) {
    const seed=FEED_SEEDS[day-1][i],p=s.feed.find(item=>item.id===`f${day}-${i}`);
    if(!p||p.day!==day||p.author!==seed[0]||p.text!==seed[1]||p.art!==(seed[2]??null)||JSON.stringify(p.likes)!==JSON.stringify(i===0?['assistant','market']:['product']))throw new Error('动态剧情前缀缺失');
    if(p.liked&&!p.likeRewarded)throw new Error('动态点赞状态无效');
    if(p.commented) {
      const choice=SOCIAL_COMMENTS.find(c=>p.comments.length===2&&p.comments[0].author==='me'&&p.comments[0].text===c.text&&p.comments[1].author===p.author&&p.comments[1].text===c.reply);
      if(!choice)throw new Error('动态评论状态无效');
    } else if(p.comments.length)throw new Error('动态评论状态无效');
  }
  const postDays=Object.keys(s.postsByDay);
  if(postDays.some(key=>!Number.isInteger(Number(key))||Number(key)<1||Number(key)>s.day))throw new Error('发表动态记录无效');
  for(const key of postDays) {
    const day=Number(key),template=PLAYER_POSTS.find(p=>p.id===s.postsByDay[key]),post=s.feed.find(p=>p.id===`own-${day}`);
    if(!template||!post||post.author!=='me'||post.day!==day||post.text!==template.text||post.art!==null||post.liked||post.commented||JSON.stringify(post.likes)!==JSON.stringify(['assistant',template.contact])||post.comments.length!==1||post.comments[0].author!==template.contact||post.comments[0].text!==template.reply)throw new Error('发表动态数据无效');
  }
  if(s.feed.length!==s.day*2+postDays.length)throw new Error('动态数量无效');
}
function validateProgressMetadata(s,ids) {
  if(!Number.isInteger(s.feedSeenDay)||s.feedSeenDay<0||s.feedSeenDay>s.day)throw new Error('动态阅读记录无效');
  if(Object.keys(s.read).some(id=>!ids.includes(id))||Object.values(s.read).some(seq=>!Number.isSafeInteger(seq)||seq<0||seq>s.sequence))throw new Error('消息阅读记录无效');
}
function validateLedger(s) {
  if(s.wallet.cards!==8||!Number.isSafeInteger(s.wallet.balanceCents)||s.wallet.balanceCents<0||s.wallet.balanceCents>OPENING_BALANCE_CENTS)throw new Error('虚拟钱包数据无效');
  if(new Set(s.ledger.map(l=>l.id)).size!==s.ledger.length)throw new Error('虚拟流水重复');
  let spent=0;
  for(const l of s.ledger) {
    const ev=EVENTS.find(e=>`l-${e.id}`===l.id),ch=ev?.choices.find(c=>c.id===s.decisions[ev.id]&&c.kind);
    if(!ev||!ch||l.day!==ev.day||l.amountCents!==ch.amount*100||l.kind!==ch.kind||l.purpose!==ch.purpose||l.to!==ev.contact||l.status!=='已收取'||!Number.isSafeInteger(l.amountCents)||l.amountCents<=0)throw new Error('虚拟流水数据无效');
    spent+=l.amountCents;
  }
  for(const [eventId,choiceId] of Object.entries(s.decisions)) {
    const ev=EVENTS.find(e=>e.id===eventId),ch=ev.choices.find(c=>c.id===choiceId);
    if(ch.kind&&!s.ledger.some(l=>l.id===`l-${eventId}`))throw new Error('虚拟流水缺失');
  }
  if(s.wallet.balanceCents!==OPENING_BALANCE_CENTS-spent)throw new Error('虚拟钱包余额与流水不一致');
}
