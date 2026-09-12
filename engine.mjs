import {PERSONAS,createContacts,provider,scenarioFor} from './content.mjs';

export const SAVE_KEY='game004.chairman.v1';
export const SAVE_VERSION=5;
export const OPENING_BALANCE_CENTS=8888888888;
export const MAX_PACKET_CENTS=20000;
export const MAX_TRANSFER_CENTS=20000000;

const clone=value=>JSON.parse(JSON.stringify(value));
const clamp=n=>Math.max(0,Math.min(100,n));
const identityFor=(routeId,id)=>PERSONAS.find(p=>p.routeId===routeId&&p.id===id);
const scenarioOf=state=>scenarioFor(state?.routeId);
const storyAmountCents=choice=>choice.kind?Math.round(Number(choice.amount)*100):0;
const chatStatus=tx=>tx.status==='pending'?'待领取':tx.status==='returned'||tx.status==='refunded'?'已退还':tx.direction==='credit'?'已领取':tx.mode==='packet'?'已领取':'已收款';

export function parseAmountCents(value){
  if(typeof value!=='string'||!/^\d{1,9}(?:\.\d{1,2})?$/.test(value.trim()))return null;
  const [whole,fraction='']=value.trim().split('.');
  const cents=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  return Number.isSafeInteger(cents)?cents:null;
}

/** @typedef {{trust:number,respect:number,tension:number}} RelationshipState */
/** @typedef {{id:string,displayName:string,legalName?:string,role:string,age:number,color:string,personality:string,moneyPolicy:'social'|'business'|'formal'}} ContactProfile */
/** @typedef {{id:string,day:number,contact:string,topic:string,lines:string[],choices:ReplyChoice[]}} ScenarioEvent */
/** @typedef {{id:string,text:string,reply:string,effects:object,kind?:'packet'|'transfer',amount?:number,direction?:'debit'|'credit'}} ReplyChoice */
/** @typedef {{id:string,author:string,text:string,day:number,liked:boolean,comments:object[]}} FeedItem */
/** @typedef {{id:string,contactId:string,sourceType:'choice'|'money'|'social',sourceId:string,day:number,tone:'kept'|'hurt'|'noted',summary:string}} RelationshipMemory */
/** @typedef {{id:string,day:number,contact:string,echo:true,resolveLines:(state:object)=>string[],incomingPacket?:object}} ScenarioEcho */
/** @typedef {{id:string,transactionId:string,day:number,direction:'debit'|'credit',amountCents:number,mode:string,source:string,purpose:string,contactId:string,status:string,linkedEntryId?:string}} LedgerEntry */

export function activeEvent(state){const scenario=scenarioOf(state);return scenario.events.find(e=>e.day===state.day&&!state.decisions[e.id]&&!state.skippedEchoes?.includes(e.id))||null;}
export function contactById(state,id){return state.contacts.find(c=>c.id===id);}
export function transactionById(state,id){return state.transactions.find(t=>t.id===id);}
export function unread(state,id){return state.messages.filter(m=>m.contact===id&&m.from!=='me'&&m.seq>(state.read[id]||0)).length;}
export function pendingIncoming(state){return state.transactions.filter(t=>t.source==='incoming'&&t.status==='pending');}

function message(s,contact,text,extra={}){
  const seq=++s.sequence,events=scenarioOf(s).events;
  const done=events.filter(e=>e.day===s.day&&s.decisions[e.id]).length;
  s.messages.push({id:`m${seq}`,seq,day:s.day,time:`${String(9+done*3).padStart(2,'0')}:${String((seq*3)%60).padStart(2,'0')}`,contact,from:contact,text,...extra});
}

function effects(s,person,world={},relation={}){
  const scenario=scenarioOf(s);
  for(const [key,val] of Object.entries(world)){
    if(!scenario.statKeys.includes(key)||!Number.isFinite(val))throw new Error('无效的世界规则');
    s.company[key]=clamp(s.company[key]+val);
  }
  if(person)for(const [key,val] of Object.entries(relation)){
    if(!['trust','respect','tension'].includes(key)||!Number.isFinite(val))throw new Error('无效的关系规则');
    s.relationships[person][key]=clamp(s.relationships[person][key]+val);
  }
}

function memoryTone(relation={}){const positive=(relation.trust||0)+(relation.respect||0)-(relation.tension||0),negative=(relation.trust||0)+(relation.respect||0)<0||(relation.tension||0)>3;return negative?'hurt':positive>2?'kept':'noted';}
function remember(s,{id,contactId,sourceType,sourceId,tone='noted',summary}){
  if(s.memories.some(m=>m.id===id))return;
  s.memories.push({id,contactId,sourceType,sourceId,day:s.day,tone,summary:String(summary).slice(0,120)});
}

function createIncomingPacket(s,ev){
  const packet=ev.incomingPacket;if(!packet)return;
  const id=`tx-incoming-${ev.id}`;if(s.transactions.some(t=>t.id===id))return;
  const tx={id,clientActionId:null,settlementActionId:null,day:s.day,mode:'packet',amountCents:packet.amountCents,note:packet.note,contactId:ev.contact,source:'incoming',direction:'credit',status:'pending'};
  s.transactions.push(tx);message(s,ev.contact,tx.note,{transactionId:id});
}

function activate(s){
  const scenario=scenarioOf(s),ev=activeEvent(s);
  if(ev){provider.opening(ev,s).forEach(text=>message(s,ev.contact,text,{eventId:ev.id}));createIncomingPacket(s,ev);}
  else message(s,scenario.guideId,s.day===7?'今天所有安排都确认了。结果出来后，你可以在这里收下这一周的回信。':'今天需要处理的事都完成了。还可以看看朋友圈，忙完就来这里结束今天。',{dayEnd:true});
}

function seedLikes(scenario,index){return index===0?scenario.feedLikeIds.slice(0,2):scenario.feedLikeIds.slice(2,3);}
function enterDay(s){
  const scenario=scenarioOf(s);
  message(s,scenario.guideId,provider.dayBrief(s));
  scenario.feedSeeds[s.day-1].forEach(([author,text,art],i)=>s.feed.unshift({id:`f${s.day}-${i}`,day:s.day,author,text,art,liked:false,commented:false,comments:[],likes:seedLikes(scenario,i),time:i===0?'08:32':'08:46'}));
  activate(s);
}

export function createGame(options={},legacySeed=4107,legacyPersona='tycoon'){
  if(typeof options==='string')options={title:options,seed:legacySeed,routeId:'chairman',identityPresetId:legacyPersona==='underdog'?'selfmade':legacyPersona};
  const routeId=options.routeId==='worker'?'worker':'chairman',scenario=scenarioFor(routeId);
  const profile=identityFor(routeId,options.identityPresetId)||identityFor(routeId,routeId==='worker'?'worker':'tycoon');
  const seed=Number.isSafeInteger(options.seed)?options.seed:4107;
  const fallback=profile.defaultTitle,title=String(options.title??fallback).trim().slice(0,12)||fallback;
  const contacts=createContacts(seed,routeId);
  const s={version:SAVE_VERSION,routeId,seed,day:1,player:{title,identityPresetId:profile.id},company:clone(profile.starts),wallet:{openingBalanceCents:profile.openingBalanceCents,balanceCents:profile.openingBalanceCents,cards:8},
    contacts,relationships:Object.fromEntries(contacts.map(c=>[c.id,{trust:55,respect:55,tension:15}])),messages:[],feed:[],ledger:[],transactions:[],decisions:{},flags:{},evidenceItems:[],memories:[],skippedEchoes:[],echoMigrationThroughDay:0,read:{},sequence:0,transactionSequence:0,processedActionIds:[],ending:null,postsByDay:{},feedSeenDay:0};
  const chairmanOpenings={handsome:'今天媒体对您的关注甚至早于产品。镜头能带来声量，也会把每次犹豫放大。',tycoon:'专项账户已经备好。钱可以让事情更快，但这周真正难买的是时间和信任。',richwoman:'您上任后第一次亲自盯发布，外界评价不错。团队也在看，您的承诺能不能落到细节。',selfmade:'从一线走到这间办公室，大家愿意跟您说实话。但董事会仍在等一份能证明您的结果。'};
  const workerOpenings={'worker-handsome':'这周新客户群里很多人先记住了你的头像。被看见是优势，但证据不能靠印象。',worker:'你没有可以替你改写结论的背景。好在文档、日志和时间戳不认职级。','hidden-tycoon':'你的账户余额足够让你随时离开，但今天你还坐在这里，因为你想看这套规则能不能被事实改变。','hidden-richwoman':'你不需要靠这份工资过日子。但如果今天不把事说清，下一个人还会坐在同一个位置。'};
  contacts.forEach(c=>{
    let greeting=`你好，我是${c.displayName}，负责${c.role}这边。有进展我会在这里同步。`;
    if(c.id===scenario.guideId)greeting=routeId==='chairman'?`您的行程和待办我都整理好了。${chairmanOpenings[profile.id]}`:`今天的打卡、会议室和项目费用我都记着。${workerOpenings[profile.id]}`;
    if(routeId==='worker'&&c.id==='manager')greeting=`${title}，宏远项目今天起由你盯到底。我只看结果，别什么事都等我确认。`;
    message(s,c.id,greeting,{greeting:true});
  });
  contacts.forEach(c=>s.read[c.id]=s.sequence);enterDay(s);return s;
}

function endingChairman(s){
  const c=s.company,launch=s.flags['d7-launch'],core=s.contacts.filter(p=>p.tier==='核心'),trust=core.reduce((n,p)=>n+s.relationships[p.id].trust,0)/core.length;let id;
  if(launch==='delay'&&c.reputation>=40)id='delay';else if(launch==='full'&&c.ready>=65&&c.hype>=65&&(c.team<45||trust<45))id='fracture';else if(launch!=='delay'&&c.ready>=70&&c.reputation>=40&&c.team>=45&&trust>=40)id='steady';else id='collapse';
  const endings={steady:{title:'稳健发布',kicker:'有些信任，是一件件小事攒下来的。',body:'拾光一号按验证过的范围进入门店。首发没有把每一项纪录都改写，但问题有人接，承诺有人记。团队第二天仍愿意主动给你发消息。'},fracture:{title:'爆款，但团队失和',kicker:'产品站到了聚光灯下，人却慢慢退到了阴影里。',body:'集中资源换来了很大的首发声量，技术团队也顶住了交付。屏幕上全是祝贺，但后台的对话短了。有人开始只发“收到”，不再说“我有个想法”。'},delay:{title:'延期，保住口碑',kicker:'你推迟了一个日期，没有推迟一份承诺。',body:'你亲自解释延期、验证范围和后续安排。台下有失望，也有人愿意继续等。渠道重新排了时间，团队终于敢把没做完的事说清楚。'},collapse:{title:'信任与发布双重失控',kicker:'那些没有被回答的问题，最后一起回来了。',body:'发布进度与实际准备脱节，先前的口径被逐一翻出。门店和团队都在等一个可信的解释。你仍坐在董事长的位置上，却发现一句命令已经换不回一句真话。'}};return {id,...endings[id]};
}
function endingWorker(s){
  const c=s.company,items=s.evidenceItems,has=id=>items.includes(id),flagValues=Object.values(s.flags);let id;
  if(s.flags['w7-future']==='final-stay'&&c.evidence>=70&&c.reputation>=50&&c.allies>=45&&c.pressure<=75&&items.length>=5&&has('board-packet')&&s.flags['w7-hearing']==='hearing-factual')id='worker-win';
  else if(s.flags['w7-future']==='final-exit'&&c.evidence>=50&&c.reputation>=35&&items.length>=3)id='worker-exit';
  else if(c.evidence>=60&&items.length>=4&&(c.reputation<50||c.allies<45||flagValues.some(v=>['public-exposure','public-threat','hearing-attack','final-expose','private-chat-leak'].includes(v))))id='worker-lonely';else id='worker-blamed';
  const endings={'worker-win':{title:'证据完整，会议翻盘',kicker:'真正有力的反击，是让每一个事实回到它应在的位置。',body:'范围邮件、版本基线、审批链和事故日志相互印证。公司撤销不实绩效记录，启动对管理责任的调查，并让你牵头整改交付流程。会后，小鱼第一个给你发来了新的项目表。'},'worker-exit':{title:'拿到证明，体面离开',kicker:'离开不是认输，在不属于你的责任上签字才是。',body:'核验材料足以证明你不是事故的唯一责任人。HR 出具了无个人过错证明和协商补偿方案，宏远建材李总愿意为你的专业表现背书。你关掉工位电脑，没有带走那口锅。'},'worker-lonely':{title:'赢了事实，失去信任',kicker:'截图可以证明一句话，也可以伤害一个愿意替你说话的人。',body:'关键责任最终得到澄清，但公开私聊、逼证人实名或在会上攻击动机，让同事和客户都退后了一步。你赢下了这场争议，却很难再组成原来的团队。'},'worker-blamed':{title:'证据断裂，被迫背锅',kicker:'口头承诺会消失，过早的签字却会留下来。',body:'需求基线、审批指令和事故日志之间缺少能够闭环的记录，几次口径反复也削弱了你的陈述。事故主要责任最终落到你名下。这不是永久结局：重新开始时，第一天就让范围、时间和验收人留在纸面上。'}};return {id,...endings[id]};
}
export function endingFor(s){const scenario=scenarioOf(s),base=s.routeId==='worker'?endingWorker(s):endingChairman(s),summary=scenario.events.filter(e=>s.decisions[e.id]&&scenario.summaryEventIds.includes(e.id)).map(e=>({day:e.day,topic:e.topic,text:e.choices.find(c=>c.id===s.decisions[e.id]).text})),memories=s.memories.filter(m=>m.sourceType!=='social'||m.tone!=='noted').slice(-5).map(m=>({contactId:m.contactId,tone:m.tone,text:m.summary}));return {...base,summary,memories};}

function addLedger(s,tx,direction,linkedEntryId){const entry={id:`${tx.id}-${direction}`,transactionId:tx.id,day:tx.day,direction,amountCents:tx.amountCents,mode:tx.mode,source:tx.source,purpose:tx.note,contactId:tx.contactId,status:'completed'};if(linkedEntryId)entry.linkedEntryId=linkedEntryId;s.ledger.push(entry);s.wallet.balanceCents+=direction==='credit'?tx.amountCents:-tx.amountCents;return entry;}
function addStoryTransaction(s,ev,ch){
  if(!ch.kind)return null;const amountCents=storyAmountCents(ch),direction=ch.direction==='credit'?'credit':'debit';
  if(!Number.isSafeInteger(amountCents)||amountCents<=0)return '剧情金额无效。';if(direction==='debit'&&s.wallet.balanceCents<amountCents)return '虚拟钱包余额不足，请选择其他安排。';
  const id=`tx-story-${ev.id}`;if(s.transactions.some(t=>t.id===id))return '这笔虚拟交易已经完成，不能重复执行。';
  const tx={id,clientActionId:null,day:s.day,mode:ch.kind,amountCents,note:ch.purpose,contactId:ev.contact,source:'story',direction,status:direction==='credit'?'received':'accepted'};s.transactions.push(tx);addLedger(s,tx,direction);message(s,ev.contact,ch.purpose,{from:direction==='credit'?ev.contact:'me',transactionId:id});return null;
}
function freeStatus(contact,mode){return (contact.moneyPolicy==='social'&&mode==='packet')||(contact.moneyPolicy==='business'&&mode==='transfer')?'accepted':'refunded';}
function sendMoney(s,action){
  const mode=action.mode,limit=mode==='packet'?MAX_PACKET_CENTS:mode==='transfer'?MAX_TRANSFER_CENTS:0;if(!limit)return '请选择红包或转账。';const contact=contactById(s,action.contactId);if(!contact)return '收款人不存在。';
  if(!Number.isSafeInteger(action.amountCents)||action.amountCents<1||action.amountCents>limit)return mode==='packet'?'红包金额需在 0.01–200.00 元之间。':'转账金额需在 0.01–200,000.00 元之间。';
  const note=String(action.note??'').trim();if(note.length>20)return '留言最多 20 个字。';const clientActionId=String(action.clientActionId??'');if(clientActionId.length<8||clientActionId.length>80||!/^[a-zA-Z0-9._:-]+$/.test(clientActionId))return '交易请求编号无效。';if(s.processedActionIds.includes(clientActionId)||s.transactions.some(t=>t.clientActionId===clientActionId))return '这笔虚拟交易已处理，不能重复扣款。';if(s.wallet.balanceCents<action.amountCents)return '虚拟钱包余额不足。';
  const firstToday=!s.transactions.some(t=>t.source==='free'&&t.contactId===contact.id&&t.day===s.day),id=`tx-free-${s.routeId}-${++s.transactionSequence}`;const tx={id,clientActionId,day:s.day,mode,amountCents:action.amountCents,note:note||(mode==='packet'?'恭喜发财，大吉大利':'转账给你'),contactId:contact.id,source:'free',direction:'debit',status:freeStatus(contact,mode)};
  s.transactions.push(tx);s.processedActionIds.push(clientActionId);const debit=addLedger(s,tx,'debit');message(s,contact.id,tx.note,{from:'me',transactionId:id});
  if(tx.status==='refunded'){addLedger(s,tx,'credit',debit.id);const why=contact.moneyPolicy==='formal'?'我们按正式流程来，这笔虚拟款项我退回了。':mode==='packet'?'心意收到了，但业务往来不收私人红包，我已退回。':'心意收到了，这笔转账没有对应事由，我先退回。';message(s,contact.id,why);if(firstToday)effects(s,contact.id,{},{tension:1});}
  else{message(s,contact.id,mode==='packet'?'红包收到了，谢谢。事情该怎么处理，我们还是按原来的话说。':'虚拟款项已收到，我会按备注核对用途。');if(firstToday)effects(s,contact.id,{},{trust:1});}
  remember(s,{id:`money:${id}`,contactId:contact.id,sourceType:'money',sourceId:id,tone:tx.status==='refunded'?'hurt':'noted',summary:tx.status==='refunded'?`${contact.displayName}退还了你的${mode==='packet'?'红包':'转账'}。`:`${contact.displayName}收下了你的${mode==='packet'?'红包':'转账'}。`});return null;
}

function settleIncomingMoney(s,action){
  const tx=transactionById(s,action.transactionId),decision=action.decision,clientActionId=String(action.clientActionId??'');
  if(!tx||tx.source!=='incoming'||tx.direction!=='credit'||tx.mode!=='packet')return '这个红包不存在。';
  if(!['claim','return'].includes(decision))return '请选择领取或退还红包。';
  if(clientActionId.length<8||clientActionId.length>80||!/^[a-zA-Z0-9._:-]+$/.test(clientActionId))return '红包处理请求编号无效。';
  if(tx.status!=='pending'||s.processedActionIds.includes(clientActionId)||tx.settlementActionId)return '这个红包已经处理，不能重复操作。';
  const ev=scenarioOf(s).events.find(e=>`tx-incoming-${e.id}`===tx.id),packet=ev?.incomingPacket;if(!ev||!packet||ev.contact!==tx.contactId||packet.amountCents!==tx.amountCents||packet.note!==tx.note)return '红包剧情数据无效。';
  tx.status=decision==='claim'?'received':'returned';tx.settlementActionId=clientActionId;s.processedActionIds.push(clientActionId);
  if(decision==='claim'){addLedger(s,tx,'credit');message(s,tx.contactId,'领取了红包',{from:'me'});}else message(s,tx.contactId,'已退还红包',{from:'me'});
  const outcome=packet.effects[decision];effects(s,tx.contactId,outcome?.company||{},outcome?.relation||{});
  remember(s,{id:`money:${tx.id}`,contactId:tx.contactId,sourceType:'money',sourceId:tx.id,tone:decision==='claim'&&(tx.contactId==='manager'||tx.contactId==='partner')?'hurt':'kept',summary:decision==='claim'?`你领取了${contactById(s,tx.contactId).displayName}发来的红包。`:`你退还了${contactById(s,tx.contactId).displayName}发来的红包。`});return null;
}

/** The sole public state mutation boundary. Input never accepts caller-supplied effects. */
export function dispatch(state,action){
  if(!state||!action||typeof action.type!=='string')return {state,error:'无法识别这次操作。'};const s=clone(state),scenario=scenarioOf(s),fail=error=>({state,error});if(s.ending&&!['READ','FEED_READ'].includes(action.type))return fail('这一周已经结束。可以继续查看记录，或重新开始。');
  if(action.type==='CHOOSE'){
    const ev=activeEvent(s);if(!ev||ev.id!==action.eventId)return fail('这件事已经处理，或还没有轮到它。');const ch=ev.choices.find(c=>c.id===action.choiceId);if(!ch)return fail('请选择当前提供的回复。');message(s,ev.contact,ch.text,{from:'me'});const paymentError=addStoryTransaction(s,ev,ch);if(paymentError)return fail(paymentError);effects(s,ev.contact,ch.effects.company,ch.effects.relation);s.decisions[ev.id]=ch.id;if(ch.flag)s.flags[ev.id]=ch.flag;if(ch.evidence&&!s.evidenceItems.includes(ch.evidence))s.evidenceItems.push(ch.evidence);remember(s,{id:`choice:${ev.id}`,contactId:ev.contact,sourceType:'choice',sourceId:ev.id,tone:memoryTone(ch.effects.relation),summary:ch.memory||`${ev.topic}：${ch.text}`});provider.response(ev,ch,s).forEach(t=>message(s,ev.contact,t));provider.followUps(ev,ch,s).forEach(item=>message(s,item.contact,item.text));activate(s);
  }else if(action.type==='SEND_MONEY'){const error=sendMoney(s,action);if(error)return fail(error);}
  else if(action.type==='SETTLE_INCOMING_MONEY'){const error=settleIncomingMoney(s,action);if(error)return fail(error);}
  else if(action.type==='READ'){if(!contactById(s,action.contactId))return fail('联系人不存在。');s.read[action.contactId]=s.sequence;}
  else if(action.type==='FEED_READ')s.feedSeenDay=s.day;
  else if(action.type==='LIKE'){const post=s.feed.find(p=>p.id===action.postId);if(!post||post.author==='me')return fail('这条动态不可点赞。');post.liked=!post.liked;if(post.liked&&!post.likeRewarded){effects(s,post.author,{[s.routeId==='worker'?'allies':'team']:1},{trust:1});post.likeRewarded=true;remember(s,{id:`social:like:${post.id}`,contactId:post.author,sourceType:'social',sourceId:post.id,tone:'noted',summary:`你给${contactById(s,post.author).displayName}的动态点了赞。`});}}
  else if(action.type==='COMMENT'){const post=s.feed.find(p=>p.id===action.postId),template=scenario.socialComments.find(c=>c.id===action.commentId);if(!post||post.author==='me'||post.commented||!template)return fail('这条动态已经回复，或回复不存在。');post.commented=true;post.comments.push({author:'me',text:template.text},{author:post.author,text:template.reply});effects(s,post.author,template.company,template.relation);remember(s,{id:`social:comment:${post.id}`,contactId:post.author,sourceType:'social',sourceId:post.id,tone:memoryTone(template.relation),summary:`你在${contactById(s,post.author).displayName}的动态下留下了回应。`});message(s,post.author,`刚看到你的评论：“${template.text}” ${template.reply}`);}
  else if(action.type==='POST'){const template=scenario.playerPosts.find(p=>p.id===action.postId);if(!template||s.postsByDay[s.day])return fail('今天已经发过动态了。');s.postsByDay[s.day]=template.id;effects(s,template.contact,template.company,{});s.feed.unshift({id:`own-${s.day}`,author:'me',day:s.day,time:'刚刚',text:template.text,art:null,liked:false,commented:false,comments:[{author:template.contact,text:template.reply}],likes:[scenario.guideId,template.contact]});remember(s,{id:`social:post:${s.day}`,contactId:template.contact,sourceType:'social',sourceId:`own-${s.day}`,tone:'noted',summary:`你公开写下：“${template.text.slice(0,48)}”`});}
  else if(action.type==='NEXT_DAY'){
    if(activeEvent(s))return fail('还有需要处理的消息，先完成再下班。');if(pendingIncoming(s).length)return fail('还有收到的红包没有领取或退还，请先处理。');if(s.day===7){s.ending=endingFor(s);if(s.ending.id==='worker-exit'){const tx={id:'tx-ending-worker-exit',clientActionId:null,settlementActionId:null,day:7,mode:'transfer',amountCents:2000000,note:'协商离职补偿',contactId:'finance',source:'ending',direction:'credit',status:'received'};s.transactions.push(tx);addLedger(s,tx,'credit');message(s,'finance','协商离职补偿',{transactionId:tx.id});}message(s,scenario.guideId,'这一周的回信已经放在你的个人页。你随时可以继续翻看聊天和动态。');const endContact=s.routeId==='worker'?'boss':'gm';const text=s.routeId==='worker'?(s.ending.id==='worker-win'?'会议结论已经发出。责任澄清和流程整改都会留下书面记录。':s.ending.id==='worker-exit'?'无过错证明和协商方案已交给 HR，后续按正式流程走。':'今天的复盘结论已经归档。你可以继续查看所有记录。'):(s.ending.id==='steady'?'今天的事情落地了。我先给大家放个假，下周我们继续。':s.ending.id==='delay'?'延期说明已经发出。明天我把剩余验证重新排好，一件一件做。':s.ending.id==='fracture'?'首发数据很好。我想过两天单独跟您聊聊团队的事。':'我需要跟您重新对齐下一步。现在先不要再对外作新的承诺了。');message(s,endContact,text);}else{s.day++;enterDay(s);}
  }else return fail('未知操作，进度未改变。');return {state:s,error:null};
}

export function saveGame(storage,state){try{storage.setItem(SAVE_KEY,JSON.stringify(state));return null;}catch{return '浏览器无法保存。请勿关闭页面，或换普通浏览模式后重试。';}}
export function clearGame(storage){try{storage.removeItem(SAVE_KEY);return null;}catch{return '浏览器拒绝清除，请在浏览器设置中删除本站数据。';}}
export function loadGame(storage){let raw;try{raw=storage.getItem(SAVE_KEY);}catch{return {state:null,error:'浏览器不允许读取存档，可继续临时试玩。',blocked:false};}if(!raw)return {state:null,error:null};try{let s=JSON.parse(raw);if(s.version===1)s=migrateV1(s);if(s.version===2)s=migrateV2(s);if(s.version===3)s=migrateV3(s);if(s.version===4)s=migrateV4(s);if(s.version!==SAVE_VERSION)throw new Error('存档版本暂不兼容');validateState(s);return {state:s,error:null};}catch(e){return {state:null,error:`${e.message||'无法读取存档'}。原数据尚未覆盖，请确认后清除并重开。`,blocked:true};}}
function migrateV1(old){const s=clone(old);if(!Array.isArray(s.ledger))throw new Error('旧存档流水无效');s.version=2;s.wallet={balanceCents:OPENING_BALANCE_CENTS-s.ledger.reduce((sum,l)=>sum+(Number.isSafeInteger(l.amount)&&l.amount>0?l.amount*100:0),0),cards:8};s.ledger=s.ledger.map(l=>({id:l.id,day:l.day,amountCents:l.amount*100,kind:l.kind,purpose:l.purpose,to:l.to,status:l.status}));if(s.company)delete s.company.cash;return s;}
function migrateV2(old){const s=clone(old);s.version=3;s.migratingV2=true;s.player={...s.player,persona:s.player?.persona||'tycoon'};return s;}
function migrateV3(old){
  validateLegacySave(old);
  const s=clone(old),mapped=s.player?.persona==='underdog'?'selfmade':(['handsome','tycoon','richwoman'].includes(s.player?.persona)?s.player.persona:'tycoon'),oldLedger=Array.isArray(s.ledger)?s.ledger:[],transactions=[];s.routeId='chairman';s.version=4;s.player={title:s.player?.title||'林董',identityPresetId:mapped};s.contacts=legacyContactProfiles(s.seed);s.evidenceItems=[];s.transactions=[];s.ledger=[];s.transactionSequence=0;s.processedActionIds=[];s.migratedFromVersion=3;s.wallet={openingBalanceCents:OPENING_BALANCE_CENTS,balanceCents:Number.isSafeInteger(old.wallet?.balanceCents)?old.wallet.balanceCents:OPENING_BALANCE_CENTS,cards:8};
  for(const oldEntry of oldLedger){const eventId=String(oldEntry.id||'').replace(/^l-/,''),id=`tx-story-${eventId}`,tx={id,clientActionId:null,day:oldEntry.day,mode:oldEntry.kind,amountCents:oldEntry.amountCents,note:oldEntry.purpose,contactId:oldEntry.to,source:'story',direction:'debit',status:'accepted'};transactions.push(tx);s.ledger.push({id:`${id}-debit`,transactionId:id,day:tx.day,direction:'debit',amountCents:tx.amountCents,mode:tx.mode,source:'story',purpose:tx.note,contactId:tx.contactId,status:'completed'});}s.transactions=transactions;s.messages=(s.messages||[]).map(m=>{if(!m.transaction)return m;const eventId=String(m.transaction.id||'').replace(/^l-/,''),copy={...m,transactionId:`tx-story-${eventId}`};delete copy.transaction;return copy;});return s;
}

function migrateV4(old){
  const s=clone(old),scenario=scenarioOf(s),hadEnding=Boolean(s.ending),currentDayHasProgress=scenario.events.some(e=>!e.echo&&e.day===s.day&&(Object.hasOwn(s.decisions||{},e.id)||s.messages?.some(m=>m.eventId===e.id)));
  s.version=SAVE_VERSION;s.memories=[];
  for(const [eventId,choiceId] of Object.entries(s.decisions||{})){const ev=scenario.events.find(e=>e.id===eventId),ch=ev?.choices.find(c=>c.id===choiceId);if(ev&&ch)s.memories.push({id:`choice:${ev.id}`,contactId:ev.contact,sourceType:'choice',sourceId:ev.id,day:ev.day,tone:memoryTone(ch.effects.relation),summary:String(ch.memory||`${ev.topic}：${ch.text}`).slice(0,120)});}
  for(const tx of s.transactions||[])if(tx.source==='free')s.memories.push({id:`money:${tx.id}`,contactId:tx.contactId,sourceType:'money',sourceId:tx.id,day:tx.day,tone:tx.status==='refunded'?'hurt':'noted',summary:tx.status==='refunded'?`${contactById(s,tx.contactId).displayName}退还了你的${tx.mode==='packet'?'红包':'转账'}。`:`${contactById(s,tx.contactId).displayName}收下了你的${tx.mode==='packet'?'红包':'转账'}。`});
  s.echoMigrationThroughDay=Math.max(0,s.day-1+(currentDayHasProgress||hadEnding?1:0));s.skippedEchoes=scenario.events.filter(e=>e.echo&&e.day<=s.echoMigrationThroughDay).map(e=>e.id);
  if(hadEnding)s.ending=endingFor(s);return s;
}

function validateState(s){
  const scenario=scenarioFor(s.routeId),profile=identityFor(s.routeId,s.player?.identityPresetId);if(!['chairman','worker'].includes(s.routeId)||!Number.isInteger(s.day)||s.day<1||s.day>7||!profile||typeof s.player.title!=='string'||!s.player.title.trim()||s.player.title.length>12)throw new Error('存档信息不完整');if(!Number.isSafeInteger(s.seed)||!Array.isArray(s.contacts)||!Array.isArray(s.messages)||!Array.isArray(s.feed)||!Array.isArray(s.ledger)||!Array.isArray(s.transactions)||!Array.isArray(s.evidenceItems)||!Array.isArray(s.memories)||!Array.isArray(s.skippedEchoes)||!Array.isArray(s.processedActionIds)||!s.flags||!s.decisions||!s.read||!s.postsByDay||!s.relationships||!s.wallet)throw new Error('存档结构不完整');
  const expected=s.migratedFromVersion===3?legacyContactProfiles(s.seed):createContacts(s.seed,s.routeId),ids=expected.map(c=>c.id),allowed=new Set([...ids,'me']),contactKeys=['id','displayName','legalName','name','role','age','tier','personality','moneyPolicy','color','avatar','image','company'];if(s.contacts.length!==expected.length||new Set(s.contacts.map(c=>c.id)).size!==expected.length||s.contacts.some((c,i)=>!expected[i]||contactKeys.some(k=>c[k]!==expected[i][k])||JSON.stringify(c.identityTags)!==JSON.stringify(expected[i].identityTags)))throw new Error('联系人数据无效');for(const id of ids)for(const key of ['trust','respect','tension'])if(!Number.isFinite(s.relationships[id]?.[key])||s.relationships[id][key]<0||s.relationships[id][key]>100)throw new Error('关系数据无效');for(const key of scenario.statKeys)if(!Number.isFinite(s.company?.[key])||s.company[key]<0||s.company[key]>100)throw new Error('状态数据无效');if(Object.keys(s.company).some(key=>!scenario.statKeys.includes(key)))throw new Error('状态字段无效');validateStoryPrefix(s,scenario);validateFlagsAndEvidence(s,scenario);validateMessages(s,scenario,ids);validateFeed(s,scenario,allowed);validateProgressMetadata(s,ids);validateMemories(s,scenario,ids);validateLedger(s,scenario,profile);if(s.ending!==null){if(s.day!==7||activeEvent(s)||pendingIncoming(s).length||JSON.stringify(s.ending)!==JSON.stringify(endingFor(s)))throw new Error('结局数据无效');}else if(s.day===7&&!activeEvent(s)&&s.messages.some(m=>m.text.includes('这一周的回信已经放在')))throw new Error('结局数据缺失');
}
function validateStoryPrefix(s,scenario){
  const decisionKeys=Object.keys(s.decisions),expectedSkipped=scenario.events.filter(e=>e.echo&&e.day<=s.echoMigrationThroughDay).map(e=>e.id);
  if(!Number.isInteger(s.echoMigrationThroughDay)||s.echoMigrationThroughDay<0||s.echoMigrationThroughDay>7||new Set(s.skippedEchoes).size!==s.skippedEchoes.length||JSON.stringify(s.skippedEchoes)!==JSON.stringify(expectedSkipped)||decisionKeys.some(id=>!scenario.events.some(e=>e.id===id))||s.skippedEchoes.some(id=>Object.hasOwn(s.decisions,id)))throw new Error('剧情数据无效');
  for(let day=1;day<=7;day++){
    const dayEvents=scenario.events.filter(e=>e.day===day),processed=dayEvents.map(e=>Object.hasOwn(s.decisions,e.id)||s.skippedEchoes.includes(e.id)),chosen=dayEvents.map(e=>Object.hasOwn(s.decisions,e.id));
    if(day<s.day&&processed.some(v=>!v))throw new Error('剧情进度缺失');if(day>s.day&&chosen.some(Boolean))throw new Error('剧情时间无效');if(processed.some((v,i)=>v&&!processed.slice(0,i).every(Boolean)))throw new Error('剧情顺序无效');
    dayEvents.forEach(e=>{if(Object.hasOwn(s.decisions,e.id)&&!e.choices.some(c=>c.id===s.decisions[e.id]))throw new Error('剧情选择无效');});
  }
}
function validateFlagsAndEvidence(s,scenario){const flags={},evidence=[];for(const ev of scenario.events){const choiceId=s.decisions[ev.id];if(!choiceId)continue;const ch=ev.choices.find(c=>c.id===choiceId);if(ch.flag)flags[ev.id]=ch.flag;if(ch.evidence&&!evidence.includes(ch.evidence))evidence.push(ch.evidence);}if(JSON.stringify(s.flags)!==JSON.stringify(flags)||JSON.stringify(s.evidenceItems)!==JSON.stringify(evidence))throw new Error('剧情标记无效');}
function validateMessages(s,scenario,ids){if(s.messages.some(m=>m.transaction||m.eventId&&!scenario.events.some(e=>e.id===m.eventId)))throw new Error('消息引用无效');if(!Number.isSafeInteger(s.sequence)||s.sequence<0||s.messages.length!==s.sequence||s.messages.some((m,i)=>m.seq!==i+1||!ids.includes(m.contact)||!(m.from==='me'||m.from===m.contact)||typeof m.text!=='string'||!Number.isInteger(m.day)||m.day<1||m.day>s.day||typeof m.time!=='string'))throw new Error('消息数据无效');const current=activeEvent(s);for(const ev of scenario.events){const skipped=s.skippedEchoes.includes(ev.id),reached=!skipped&&(ev.day<s.day||Object.hasOwn(s.decisions,ev.id)||current?.id===ev.id),tagged=s.messages.filter(m=>m.eventId===ev.id);if(reached&&!tagged.some(m=>m.contact===ev.contact&&m.from===ev.contact&&m.day===ev.day))throw new Error('剧情消息前缀缺失');if(!reached&&tagged.length)throw new Error('剧情消息时间无效');}for(const m of s.messages)if(m.transactionId){const tx=s.transactions.find(t=>t.id===m.transactionId),expectedFrom=tx?.direction==='credit'?tx.contactId:'me';if(!tx||m.contact!==tx.contactId||m.from!==expectedFrom||m.text!==tx.note)throw new Error('交易消息无效');}for(const tx of s.transactions)if(s.messages.filter(m=>m.transactionId===tx.id).length!==1)throw new Error('交易消息缺失');}
function validateFeed(s,scenario,allowed){const arts=new Set([null,'invite','lab','coffee','factory']),seen=new Set();if(s.feed.some(p=>seen.has(p.id)||!seen.add(p.id)||!allowed.has(p.author)||typeof p.text!=='string'||!arts.has(p.art??null)||typeof p.liked!=='boolean'||!Array.isArray(p.comments)||p.comments.some(c=>!allowed.has(c.author)||typeof c.text!=='string')||!Array.isArray(p.likes)||p.likes.some(id=>!allowed.has(id))))throw new Error('动态数据无效');for(let day=1;day<=s.day;day++)for(let i=0;i<scenario.feedSeeds[day-1].length;i++){const seed=scenario.feedSeeds[day-1][i],post=s.feed.find(item=>item.id===`f${day}-${i}`);if(!post||post.day!==day||post.author!==seed[0]||post.text!==seed[1]||post.art!==(seed[2]??null)||JSON.stringify(post.likes)!==JSON.stringify(seedLikes(scenario,i)))throw new Error('动态剧情前缀缺失');if(post.liked&&!post.likeRewarded)throw new Error('动态点赞状态无效');if(post.commented){const choice=scenario.socialComments.find(c=>post.comments.length===2&&post.comments[0].author==='me'&&post.comments[0].text===c.text&&post.comments[1].author===post.author&&post.comments[1].text===c.reply);if(!choice)throw new Error('动态评论状态无效');}else if(post.comments.length)throw new Error('动态评论状态无效');}const postDays=Object.keys(s.postsByDay);if(postDays.some(key=>!Number.isInteger(Number(key))||Number(key)<1||Number(key)>s.day))throw new Error('发表动态记录无效');for(const key of postDays){const day=Number(key),template=scenario.playerPosts.find(p=>p.id===s.postsByDay[key]),post=s.feed.find(p=>p.id===`own-${day}`);if(!template||!post||post.author!=='me'||post.day!==day||post.text!==template.text||post.art!==null||post.liked||post.commented||JSON.stringify(post.likes)!==JSON.stringify([scenario.guideId,template.contact])||post.comments.length!==1||post.comments[0].author!==template.contact||post.comments[0].text!==template.reply)throw new Error('发表动态数据无效');}if(s.feed.length!==s.day*2+postDays.length)throw new Error('动态数量无效');}
function validateProgressMetadata(s,ids){if(!Number.isInteger(s.feedSeenDay)||s.feedSeenDay<0||s.feedSeenDay>s.day)throw new Error('动态阅读记录无效');if(Object.keys(s.read).some(id=>!ids.includes(id))||Object.values(s.read).some(seq=>!Number.isSafeInteger(seq)||seq<0||seq>s.sequence))throw new Error('消息阅读记录无效');}
function validateMemories(s,scenario,ids){
  if(new Set(s.memories.map(m=>m.id)).size!==s.memories.length||s.memories.some((m,i)=>!ids.includes(m.contactId)||!['choice','money','social'].includes(m.sourceType)||!['kept','hurt','noted'].includes(m.tone)||typeof m.sourceId!=='string'||typeof m.summary!=='string'||!m.summary||m.summary.length>120||!Number.isInteger(m.day)||m.day<1||m.day>s.day||(i&&m.day<s.memories[i-1].day)))throw new Error('人物记忆无效');
  for(const [eventId,choiceId] of Object.entries(s.decisions)){const ev=scenario.events.find(e=>e.id===eventId),ch=ev.choices.find(c=>c.id===choiceId),memory=s.memories.find(m=>m.id===`choice:${eventId}`),expected={id:`choice:${ev.id}`,contactId:ev.contact,sourceType:'choice',sourceId:ev.id,day:ev.day,tone:memoryTone(ch.effects.relation),summary:String(ch.memory||`${ev.topic}：${ch.text}`).slice(0,120)};if(JSON.stringify(memory)!==JSON.stringify(expected))throw new Error('剧情记忆无效');}
  for(const tx of s.transactions.filter(t=>t.source==='free'||t.source==='incoming'&&t.status!=='pending')){const m=s.memories.find(m=>m.id===`money:${tx.id}`);if(!m||m.contactId!==tx.contactId||m.sourceType!=='money'||m.sourceId!==tx.id||m.day!==tx.day)throw new Error('交易记忆无效');}
  for(const m of s.memories.filter(m=>m.sourceType==='choice'))if(!Object.hasOwn(s.decisions,m.sourceId))throw new Error('孤立剧情记忆');
  for(const m of s.memories.filter(m=>m.sourceType==='money'))if(!s.transactions.some(t=>t.id===m.sourceId&&(t.source==='free'||t.source==='incoming'&&t.status!=='pending')))throw new Error('孤立交易记忆');
  for(const m of s.memories.filter(m=>m.sourceType==='social'))if(!s.feed.some(p=>p.id===m.sourceId)||!(m.id===`social:like:${m.sourceId}`||m.id===`social:comment:${m.sourceId}`||m.id.startsWith('social:post:')))throw new Error('动态记忆无效');
}
function validateLedger(s,scenario,profile){
  const expectedOpening=s.migratedFromVersion===3?OPENING_BALANCE_CENTS:profile.openingBalanceCents;
  if(s.migratedFromVersion!==undefined&&(s.migratedFromVersion!==3||s.routeId!=='chairman'))throw new Error('迁移标记无效');
  if(s.wallet.cards!==8||s.wallet.openingBalanceCents!==expectedOpening||!Number.isSafeInteger(s.wallet.balanceCents)||s.wallet.balanceCents<0)throw new Error('虚拟钱包数据无效');
  if(!Number.isInteger(s.transactionSequence)||s.transactionSequence<0||new Set(s.processedActionIds).size!==s.processedActionIds.length||new Set(s.transactions.map(t=>t.id)).size!==s.transactions.length||new Set(s.ledger.map(l=>l.id)).size!==s.ledger.length)throw new Error('虚拟流水重复');
  const free=s.transactions.filter(t=>t.source==='free'),incoming=s.transactions.filter(t=>t.source==='incoming'),settledIncoming=incoming.filter(t=>t.status!=='pending'),expectedActions=[...free.map(t=>t.clientActionId),...settledIncoming.map(t=>t.settlementActionId)];
  if(s.transactionSequence!==free.length||expectedActions.length!==s.processedActionIds.length||new Set(expectedActions).size!==expectedActions.length||expectedActions.some(id=>!s.processedActionIds.includes(id))||free.some((t,i)=>t.id!==`tx-free-${s.routeId}-${i+1}`||typeof t.clientActionId!=='string'||!/^[a-zA-Z0-9._:-]{8,80}$/.test(t.clientActionId)))throw new Error('交易幂等记录无效');
  const current=activeEvent(s);
  for(const ev of scenario.events.filter(e=>e.incomingPacket)){const required=!s.skippedEchoes.includes(ev.id)&&(ev.day<s.day||Object.hasOwn(s.decisions,ev.id)||current?.id===ev.id),found=incoming.filter(t=>t.id===`tx-incoming-${ev.id}`);if((required&&found.length!==1)||(!required&&found.length))throw new Error('剧情红包记录无效');}
  for(const tx of s.transactions){
    if(!Number.isSafeInteger(tx.amountCents)||tx.amountCents<=0||!['packet','transfer'].includes(tx.mode)||!s.contacts.some(c=>c.id===tx.contactId)||!Number.isInteger(tx.day)||tx.day<1||tx.day>s.day||typeof tx.note!=='string'||(tx.source==='free'&&tx.note.length>20))throw new Error('虚拟交易数据无效');
    if(tx.source==='story'){
      const eventId=tx.id.replace(/^tx-story-/,''),ev=scenario.events.find(e=>e.id===eventId),ch=ev?.choices.find(c=>c.id===s.decisions[eventId]),direction=ch?.direction==='credit'?'credit':'debit';
      if(!ev||!ch?.kind||tx.clientActionId!==null||tx.day!==ev.day||tx.mode!==ch.kind||tx.amountCents!==storyAmountCents(ch)||tx.note!==ch.purpose||tx.contactId!==ev.contact||tx.direction!==direction||tx.status!==(direction==='credit'?'received':'accepted'))throw new Error('剧情交易数据无效');
    }else if(tx.source==='free'){
      const contact=contactById(s,tx.contactId),match=/^tx-free-(chairman|worker)-(\d+)$/.exec(tx.id),limit=tx.mode==='packet'?MAX_PACKET_CENTS:MAX_TRANSFER_CENTS;
      if(!match||match[1]!==s.routeId||Number(match[2])<1||Number(match[2])>s.transactionSequence||tx.direction!=='debit'||tx.amountCents>limit||tx.status!==freeStatus(contact,tx.mode)||!s.processedActionIds.includes(tx.clientActionId))throw new Error('自由交易数据无效');
    }else if(tx.source==='incoming'){
      const eventId=tx.id.replace(/^tx-incoming-/,''),ev=scenario.events.find(e=>e.id===eventId),packet=ev?.incomingPacket,settled=tx.status!=='pending';
      if(!ev||!packet||tx.clientActionId!==null||tx.day!==ev.day||tx.mode!=='packet'||tx.amountCents!==packet.amountCents||tx.note!==packet.note||tx.contactId!==ev.contact||tx.direction!=='credit'||!['pending','received','returned'].includes(tx.status)||(settled?typeof tx.settlementActionId!=='string'||!/^[a-zA-Z0-9._:-]{8,80}$/.test(tx.settlementActionId)||!s.processedActionIds.includes(tx.settlementActionId):tx.settlementActionId!==null))throw new Error('收到的红包数据无效');
    }else if(tx.source==='ending'){
      if(s.routeId!=='worker'||s.ending?.id!=='worker-exit'||tx.id!=='tx-ending-worker-exit'||tx.day!==7||tx.mode!=='transfer'||tx.direction!=='credit'||tx.amountCents!==2000000||tx.note!=='协商离职补偿'||tx.contactId!=='finance'||tx.status!=='received'||tx.clientActionId!==null)throw new Error('结局入账无效');
    }else throw new Error('虚拟交易来源无效');
    const entries=s.ledger.filter(l=>l.transactionId===tx.id),expectedDirections=tx.source==='free'&&tx.status==='refunded'?['debit','credit']:tx.source==='incoming'?(tx.status==='received'?['credit']:[]):[tx.direction];
    if(entries.length!==expectedDirections.length||expectedDirections.some(d=>!entries.some(l=>l.direction===d))||entries.some(l=>l.id!==`${tx.id}-${l.direction}`||l.linkedEntryId!==(tx.source==='free'&&tx.status==='refunded'&&l.direction==='credit'?`${tx.id}-debit`:undefined)||l.amountCents!==tx.amountCents||l.mode!==tx.mode||l.source!==tx.source||l.purpose!==tx.note||l.contactId!==tx.contactId||l.day!==tx.day||l.status!=='completed'))throw new Error('虚拟流水数据无效');
  }
  for(const [eventId,choiceId] of Object.entries(s.decisions)){const ev=scenario.events.find(e=>e.id===eventId),ch=ev.choices.find(c=>c.id===choiceId);if(ch.kind&&!s.transactions.some(t=>t.id===`tx-story-${eventId}`))throw new Error('剧情交易缺失');}
  if(s.ending?.id==='worker-exit'&&!s.transactions.some(t=>t.id==='tx-ending-worker-exit'))throw new Error('补偿流水缺失');if(s.ledger.some(l=>!s.transactions.some(t=>t.id===l.transactionId)))throw new Error('孤立流水数据无效');const balance=s.wallet.openingBalanceCents+s.ledger.reduce((sum,l)=>sum+(l.direction==='credit'?l.amountCents:-l.amountCents),0);if(s.wallet.balanceCents!==balance)throw new Error('虚拟钱包余额与流水不一致');
}

function legacyContactProfiles(seed){
  const first=['林','陈','周','许','沈','顾','方','陆','苏','程','徐','叶'],given=['砚舟','知远','予安','景和','以宁','清禾','允诚','书衡','若岚','子衡','明舒','知夏'],shift=Math.abs(seed|0)%12;
  return createContacts(seed,'chairman').map((c,i)=>{
    const legalName=first[(i+shift)%12]+given[(i*5+shift)%12],last=legalName[0];
    const names={gm:last+'总｜总经办',finance:'财务-'+last+'总监',product:last+'产品',supply:'老'+last+'·供应链',market:legalName,hr:'HR'+last+'姐',investor:'远岑资本 '+last+'总',partner:'森渡渠道'+last+'总',assistant:'小'+last+'｜董事长办',engineer:last+'工',service:'客服小'+last,designer:last+last+'不熬夜'};
    return {...c,legalName,displayName:names[c.id],name:names[c.id]};
  });
}
function validateLegacySave(s){
  const oldIds=['gm','finance','product','supply','market','hr','investor','partner','assistant','engineer','service','designer'];
  const first=['林','陈','周','许','沈','顾','方','陆','苏','程','徐','叶'],given=['砚舟','知远','予安','景和','以宁','清禾','允诚','书衡','若岚','子衡','明舒','知夏'];
  const shift=Math.abs(s.seed|0)%12,expected=createContacts(s.seed,'chairman');
  if(!Number.isSafeInteger(s.seed)||!Array.isArray(s.contacts)||s.contacts.length!==12||!Array.isArray(s.messages)||!Array.isArray(s.ledger)||!s.wallet||!['handsome','tycoon','richwoman','underdog'].includes(s.player?.persona)||typeof s.player.title!=='string'||!s.player.title.trim()||s.player.title.length>12)throw new Error('旧存档结构无效');
  if(s.contacts.some((c,i)=>!c||c.id!==oldIds[i]||c.name!==first[(i+shift)%12]+given[(i*5+shift)%12]||['role','age','tier','personality','color','avatar','company'].some(k=>c[k]!==expected[i][k])||(!s.migratingV2&&c.image!==expected[i].image)||(s.migratingV2&&c.image!==undefined&&c.image!==expected[i].image)))throw new Error('旧存档联系人数据无效');
  if(s.wallet.cards!==8||!Number.isSafeInteger(s.wallet.balanceCents)||s.wallet.balanceCents!==OPENING_BALANCE_CENTS-s.ledger.reduce((n,l)=>n+l.amountCents,0))throw new Error('旧存档余额与账单不一致');
  for(const m of s.messages)if(m.transaction){const l=s.ledger.find(l=>l.id===m.transaction.id);if(!l||JSON.stringify(l)!==JSON.stringify(m.transaction)||m.from!=='me'||m.contact!==l.to||m.text!==l.purpose)throw new Error('旧存档交易消息无效');}
  for(const l of s.ledger)if(l.status!=='已收取'||s.messages.filter(m=>m.transaction?.id===l.id).length!==1)throw new Error('旧存档交易记录无效');
}

export {chatStatus};
