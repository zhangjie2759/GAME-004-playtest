import {DAYS, COMPANY, EVENTS, PERSONAS, SOCIAL_COMMENTS, PLAYER_POSTS} from './content.mjs';
import {createGame,activeEvent,contactById,unread,dispatch,loadGame,saveGame,clearGame} from './engine.mjs';
const app=document.querySelector('#app'),modal=document.querySelector('#modal');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 chat:'M20 11.5c0 4.1-3.6 7.5-8 7.5-1.1 0-2.1-.2-3-.5L5 20l1-3.5c-1.3-1.3-2-3-2-5C4 7.4 7.6 4 12 4s8 3.4 8 7.5Z',
 contacts:'M15 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 21v-2a7 7 0 0 1 14 0v2M18 4h4M18 9h4M19 14h3',
 discover:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM16 8l-2.5 5.5L8 16l2.5-5.5L16 8Z',
 me:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3a8 8 0 0 1 16 0v3',
 search:'m20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
 plus:'M12 4v16M4 12h16', back:'m15 4-8 8 8 8', chevron:'m9 5 7 7-7 7',
 more:'M4 12h1M11.5 12h1M19 12h1',camera:'M3 7h5l2-3h4l2 3h5v14H3V7ZM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 smile:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 9h.1M16 9h.1M7 14q5 7 10 0',
 voice:'M9 8q5 4 0 8M13 5q8 7 0 14M5 10v4', heart:'M12 20 3.5 12A5 5 0 0 1 12 5a5 5 0 0 1 8.5 7L12 20Z',
 comment:'M3 4h18v13H9l-6 4V4Z', wallet:'M3 6h17v15H3V6ZM3 6V3h15v3M16 11h5v6h-5z',
 calendar:'M4 5h16v16H4V5ZM8 2v6M16 2v6M4 10h16M8 14h2M14 14h2',
 settings:'m12 3 2 3 4-1 1 4 3 3-3 2 1 4-4 1-4 3-2-3-4 1-1-4-3-3 3-2-1-4 4-1 2-3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
 arrow:'M3 8h17l-4-4M21 16H4l4 4',packet:'M5 3h14v18H5V3ZM5 7l7 6 7-6M10 17h4',
 check:'m5 12 4 4L19 6',info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6M12 7h.1',
 qr:'M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM19 19h2v2h-2zM19 13v3M13 19v3',
 signal:'M3 18v3M8 14v7M13 10v11M18 6v15', wifi:'M2 8q10-9 20 0M6 12q6-6 12 0M10 16q2-2 4 0M12 20h.1',
 moon:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
};
const icon=(id,size=24)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[id]||paths.info}"/></svg>`;
let storage;
try{storage=window.localStorage;}catch{storage={getItem(){return null;},setItem(){throw Error();},removeItem(){throw Error();}};}
const loaded=loadGame(storage);
let game=loaded.state||createGame();
let view='messages',thread=null,tab='messages',query='',toastTimer,blocked=Boolean(loaded.blocked),started=Boolean(loaded.state);
const money=n=>new Intl.NumberFormat('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const moneyCents=cents=>money(cents/100);
const playerColors={handsome:'#3f5c78',tycoon:'#556b5d',richwoman:'#8b566d',underdog:'#7b633e'};
const persona=()=>PERSONAS.find(p=>p.id===game.player.persona)||PERSONAS[1];
const person=id=>id==='me'?{id:'me',name:game.player.title,color:playerColors[game.player.persona]||'#556b5d',avatar:2,role:'董事长',company:COMPANY,age:'成年',personality:persona().bio}:contactById(game,id);
function avatar(id,cls='') {const p=person(id);return `<span class="avatar avatar-${p.avatar} ${cls}" style="--avatar:${p.color}" aria-hidden="true"><span>${esc(p.name.slice(-2))}</span>${p.image?`<img data-avatar src="${esc(p.image)}" alt="">`:''}</span>`;}
function notify(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2600);}
function commit(action,{paint=true,bottom=false}={}) {
  if(blocked){notify('请先处理存档提示。');return false;}
  const result=dispatch(game,action);
  if(result.error){notify(result.error);return false;}
  game=result.state;
  if(thread&&view==='chat'&&action.type!=='READ')game=dispatch(game,{type:'READ',contactId:thread}).state;
  const error=saveGame(storage,game);if(error)notify(error);
  if(paint)render(bottom);return true;
}
function status(){return `<div class="status-bar"><span>${game.ending?'19:08':'09:41'}</span><div>${icon('signal',15)}${icon('wifi',17)}<span class="battery"></span></div></div>`;}
function top(title,back=false,actions=''){return `<header class="topbar">${back?`<button class="icon-button" data-action="back" aria-label="返回">${icon('back')}</button>`:''}<h1>${esc(title)}</h1><div class="top-actions">${actions}</div></header>`;}
function nav(){const total=game.contacts.reduce((n,c)=>n+unread(game,c.id),0);return `<nav class="tabbar" aria-label="主导航">${[['messages','chat','消息'],['contacts','contacts','通讯录'],['discover','discover','发现'],['me','me','我']].map(([id,ic,label])=>`<button data-action="tab" data-tab="${id}" class="tab ${tab===id?'selected':''}" aria-current="${tab===id?'page':'false'}"><span class="tab-icon">${icon(ic,26)}${id==='messages'&&total?`<b class="badge">${total>99?'99+':total}</b>`:''}${id==='discover'&&game.feedSeenDay<game.day?'<b class="dot"></b>':''}</span><span>${label}</span></button>`).join('')}</nav>`;}
function chats(){
  const sorted=[...game.contacts].sort((a,b)=>a.id==='assistant'?-1:b.id==='assistant'?1:(game.messages.findLast(m=>m.contact===b.id)?.seq||0)-(game.messages.findLast(m=>m.contact===a.id)?.seq||0));
  const items=sorted.filter(c=>`${c.name}${c.role}`.includes(query));
  return `${top(`微讯${game.contacts.reduce((n,c)=>n+unread(game,c.id),0)?`(${game.contacts.reduce((n,c)=>n+unread(game,c.id),0)})`:''}`,false,`<button class="icon-button" data-action="search" aria-label="搜索">${icon('search')}</button><button class="icon-button" data-action="new-menu" aria-label="更多操作">${icon('plus')}</button>`)}<div class="screen conversation-list" id="scroll">${query?`<button class="search-result" data-action="search">${icon('search',18)} ${esc(query)} · 点此修改</button>`:''}<div class="day-strip">${icon('calendar',15)} 第 ${game.day} 天 · ${DAYS[game.day-1]}<span>${game.ending?'已结束':'澄屿科技'}</span></div>${items.map(c=>{const last=game.messages.findLast(m=>m.contact===c.id);const count=unread(game,c.id);return `<button class="conversation ${c.id==='assistant'?'pinned':''}" data-action="chat" data-id="${c.id}" aria-label="${esc(c.role+' '+c.name)}"><span class="avatar-wrap">${avatar(c.id)}${count?`<b class="badge">${count}</b>`:''}</span><span class="conversation-copy"><span class="conversation-line"><strong>${esc(c.name)}${c.id==='assistant'?'<small>助理</small>':''}</strong><time>${last?.day===game.day?last?.time:`第${last?.day}天`}</time></span><span class="preview">${last?.from==='me'?'我：':''}${last?.transaction?'[虚拟转账] ':''}${esc(last?.text)}</span></span></button>`;}).join('')}${!items.length?'<p class="empty">没有找到这位联系人</p>':''}</div>${nav()}`;
}
function chat(){
  const c=person(thread),ev=activeEvent(game),isActive=ev?.contact===thread&&!game.ending;
  const messages=game.messages.filter(m=>m.contact===thread);let lastDay=0;
  return `${top(c.name,true,`<button class="icon-button" data-action="profile" data-id="${thread}" aria-label="聊天信息">${icon('more')}</button>`)}<div class="screen chat-screen" id="scroll"><div class="chat-role">${esc(c.role)} · ${esc(c.company)}</div>${messages.map(m=>{const sep=lastDay!==m.day;lastDay=m.day;return `${sep?`<div class="time-label">第 ${m.day} 天 ${m.time}</div>`:''}<div class="message ${m.from==='me'?'sent':'received'}">${avatar(m.from==='me'?'me':thread,'small')}<div class="bubble ${m.transaction?'transaction':''}">${m.transaction?`${icon(m.transaction.kind==='packet'?'packet':'arrow',30)}<div><strong>${m.transaction.kind==='packet'?esc(m.transaction.purpose):`¥${moneyCents(m.transaction.amountCents)}`}</strong><span>${m.transaction.kind==='packet'?'恭喜发财，大吉大利':esc(m.transaction.purpose)}</span></div><footer>虚构测试 · ${m.transaction.kind==='packet'?'红包':'转账'} · ${esc(m.transaction.status)}</footer>`:esc(m.text)}</div></div>`;}).join('')}${game.ending?'<div class="time-label">这一周已结束，聊天记录已保留</div>':''}</div><div class="chat-dock">${isActive?`<div class="reply-head"><span>${esc(ev.topic)}</span><small>选择回复</small></div><div class="quick-replies">${ev.choices.map(ch=>`<button data-action="choose" data-event="${ev.id}" data-choice="${ch.id}" class="reply-choice">${ch.kind?`<span class="choice-icon">${icon(ch.kind==='packet'?'packet':'arrow',18)}</span>`:''}<span>${esc(ch.text)}${ch.amount?`<small>虚构${ch.kind==='packet'?'红包':'转账'} · ¥${money(ch.amount)}</small>`:''}</span></button>`).join('')}</div>`:thread==='assistant'?`<div class="assistant-actions">${game.ending?'<button class="green-button" data-action="ending">查看这一周的回信</button>':!ev?`<button class="green-button" data-action="day-end">${game.day===7?'收下这一周的回信':'结束今日，明天继续'}</button>`:`<button class="reply-choice" data-action="chat" data-id="${ev.contact}">${esc(person(ev.contact).name)}在等您回复 · ${esc(ev.topic)} ${icon('chevron',16)}</button>`}</div>`:''}<div class="composer"><span class="composer-symbol">${icon('voice',27)}</span><button class="compose-field" data-action="${isActive?'reply-hint':game.ending?'ending':'next-message'}">${isActive?'点上方内容回复':game.ending?'这一周的聊天已归档':'查看下一条待处理消息'}</button><span class="composer-symbol">${icon('smile',27)}</span><button class="icon-button" data-action="chat-tools" aria-label="聊天工具">${icon('plus',27)}</button></div></div>`;
}
function contacts(){return `${top('通讯录',false,`<button class="icon-button" data-action="search" aria-label="查找联系人">${icon('search')}</button>`)}<div class="screen white-screen" id="scroll"><div class="section-label">公司与合作伙伴</div>${[...game.contacts].sort((a,b)=>a.name.localeCompare(b.name,'zh-CN')).map(c=>`<button class="contact-row" data-action="profile" data-id="${c.id}">${avatar(c.id,'small')}<span>${esc(c.name)}<small>${esc(c.role)}</small></span>${icon('chevron',15)}</button>`).join('')}<p class="contact-count">${game.contacts.length} 位联系人</p></div>${nav()}`;}
function row(title,ic,action,extra='',color='#576b95'){return `<button class="menu-row" data-action="${action}"><span style="color:${color}">${icon(ic,24)}</span><span>${title}</span><small>${extra}</small>${icon('chevron',16)}</button>`;}
function discover(){return `${top('发现')}<div class="screen grey-screen" id="scroll"><div class="menu-group">${row('朋友圈','camera','feed',game.feedSeenDay<game.day?'<b class="dot inline"></b>':'','#64ad67')}</div><div class="menu-group">${row('今日行程','calendar','assistant','第 '+game.day+' 天','#de9840')}</div><div class="menu-group">${row('七日回信','comment','ending',game.ending?'已送达':'','#667d9a')}</div></div>${nav()}`;}
const artTitles={invite:['拾光一号','把普通的一天，好好留下。','CY / LAUNCH WEEK'],lab:['TEST LOG','认真，是一种漫长的重复。','澄屿科技 · 产品实验室'],coffee:['TAKE A BREAK','先吃饭，再解决世界的问题。','办公室日常'],factory:['ON THE WAY','每一个小细节，都有人守着。','澄屿科技 · 发布前夜']};
function feed(){return `${top('朋友圈',true,`<button class="icon-button" data-action="post" aria-label="发表朋友圈">${icon('camera')}</button>`)}<div class="screen feed-screen" id="scroll"><div class="feed-cover"><div class="cover-wordmark">CHENGYU<br><span>把日常，放在心上。</span></div><div class="cover-profile"><strong>${esc(game.player.title)}</strong>${avatar('me','large')}</div></div><p class="feed-bio">澄屿科技 · 董事长</p>${game.feed.map(p=>`<article class="feed-post">${avatar(p.author,'small')}<div class="post-main"><button class="author" data-action="${p.author==='me'?'me':'profile'}" data-id="${p.author}">${esc(person(p.author).name)}</button><p>${esc(p.text)}</p>${p.art?`<div class="post-art art-${p.art}"><small>${artTitles[p.art][2]}</small><strong>${artTitles[p.art][0]}</strong><span>${artTitles[p.art][1]}</span></div>`:''}<div class="post-meta"><span>第 ${p.day} 天 · ${p.time}</span>${p.author!=='me'&&!game.ending?`<div><button data-action="like" data-id="${p.id}" class="${p.liked?'liked':''}" aria-label="${p.liked?'取消赞':'赞'} ${p.id}">${icon('heart',17)}</button><button data-action="comment" data-id="${p.id}" aria-label="评论 ${p.id}">${icon('more',21)}</button></div>`:''}</div>${p.likes.length||p.liked||p.comments.length?`<div class="social-box">${p.likes.length||p.liked?`<div class="likes">${icon('heart',13)} ${[...p.likes,...(p.liked?['me']:[])].map(id=>esc(person(id).name)).join('，')}</div>`:''}${p.comments.map(c=>`<div class="comment-line"><strong>${esc(person(c.author).name)}</strong>：${esc(c.text)}</div>`).join('')}</div>`:''}</div></article>`).join('')}<p class="feed-end">朋友们的日常，都在这里</p></div>`;}
function me(){return `${top('我')}<div class="screen grey-screen" id="scroll"><div class="my-profile">${avatar('me','large')}<div><h2>${esc(game.player.title)}</h2><p>澄屿科技 · 董事长</p><small>${esc(persona().label)} · ${esc(persona().tag)} · 虚构身份</small></div>${icon('qr',22)}</div><div class="menu-group">${row('服务','wallet','services','','#07c160')}</div><div class="menu-group">${row('今日行程','calendar','assistant',`第 ${game.day} 天`)}${row('七日回信','comment','ending',game.ending?'已送达':'发布之后')}</div><div class="menu-group">${row('设置','settings','settings')}</div><p class="local-footnote">董事长日常 · 虚构测试 v0.1</p></div>${nav()}`;}
function services(){return `${top('服务',true)}<div class="screen services-screen" id="scroll"><div class="fiction-ribbon">虚构测试 · 不连接真实支付</div><div class="service-hero"><button data-action="pay-page">${icon('qr',30)}<strong>收付款</strong><span>测试入口</span></button><button data-action="wallet-page">${icon('wallet',30)}<strong>钱包</strong><span>¥${moneyCents(game.wallet.balanceCents)}</span></button></div><h2 class="service-title">金融理财</h2><div class="service-grid"><button data-action="wallet-page">${icon('wallet',28)}<span>零钱</span></button><button data-action="cards">${icon('calendar',28)}<span>银行卡</span><small>8张</small></button><button data-action="ledger">${icon('comment',28)}<span>账单</span></button><button data-action="pay-page">${icon('qr',28)}<span>收付款</span></button></div><h2 class="service-title">生活服务</h2><div class="service-grid muted-grid"><button data-action="service-note">${icon('calendar',28)}<span>手机充值</span></button><button data-action="service-note">${icon('wallet',28)}<span>生活缴费</span></button><button data-action="service-note">${icon('discover',28)}<span>城市服务</span></button><button data-action="service-note">${icon('more',28)}<span>更多</span></button></div></div>`;}
function wallet(){return `${top('钱包',true,`<button class="top-text" data-action="ledger">账单</button>`)}<div class="screen wallet-screen" id="scroll"><div class="fiction-ribbon dark">虚构测试账户 · 余额不可提现</div><section class="balance-card"><span class="coin-mark">¥</span><h2>零钱</h2><strong>¥${moneyCents(game.wallet.balanceCents)}</strong><p>可用虚拟余额</p><button data-action="service-note">充值</button><button data-action="service-note">提现</button></section><div class="wallet-list">${row('银行卡','wallet','cards','8张','#4e72a6')}${row('零钱明细','comment','ledger',`${game.ledger.length}笔`,'#d79b3b')}${row('支付设置','settings','service-note','','#6b9b65')}${row('帮助中心','info','about','','#77818c')}</div><p class="wallet-disclaimer">本页面仅为剧情模拟，不提供真实金融服务。</p></div>`;}
const cardsData=[['澄海银行','储蓄卡 · 6688','#bf5147'],['华辰商业银行','白金卡 · 5208','#344d72'],['东岚银行','储蓄卡 · 8899','#2f7781'],['远州银行','钻石卡 · 1688','#272b35'],['和丰银行','储蓄卡 · 3366','#8b6d37'],['新陆银行','商务卡 · 7788','#315f54'],['云江银行','储蓄卡 · 9988','#536485'],['星河银行','尊享卡 · 6888','#674b67']];
function cards(){return `${top('银行卡',true)}<div class="screen card-screen" id="scroll"><div class="fiction-ribbon">虚构测试 · 以下银行与卡号均为虚构</div>${cardsData.map(([name,type,color])=>`<article class="bank-card" style="--card:${color}"><span class="bank-emblem">◈</span><div><strong>${name}<small>虚构银行</small></strong><p>${type}</p></div><b>¥</b></article>`).join('')}<button class="add-card" data-action="service-note">＋ 添加银行卡</button></div>`;}
function ledger(){return `${top('账单',true)}<div class="screen ledger-screen" id="scroll"><div class="fiction-ribbon">虚构测试 · 仅记录本故事内交易</div><div class="ledger-summary"><span>本周支出</span><strong>¥${moneyCents(game.ledger.reduce((n,l)=>n+l.amountCents,0))}</strong><small>钱包余额 ¥${moneyCents(game.wallet.balanceCents)}</small></div>${game.ledger.length?game.ledger.slice().reverse().map(l=>`<article class="ledger-row"><span class="ledger-icon">${icon(l.kind==='packet'?'packet':'arrow',24)}</span><div><strong>${esc(l.purpose)}</strong><small>第 ${l.day} 天 · ${esc(person(l.to).name)} · ${esc(l.status)}</small></div><b>−${moneyCents(l.amountCents)}</b></article>`).join(''):'<p class="empty ledger-empty">暂无账单<br><small>剧情中的红包和转账会显示在这里</small></p>'}</div>`;}
function payPage(){return `${top('收付款',true)}<div class="screen pay-screen" id="scroll"><div class="pay-test-stamp">虚构测试</div><p>向商家付款</p><div class="fake-pay-code" aria-label="不可扫描的测试图案">${Array.from({length:64},(_,i)=>`<i class="${(i*7+i*i)%9<4?'on':''}"></i>`).join('')}</div><strong>不可扫描 · 不是真实付款码</strong><button class="pay-method" data-action="wallet-page">零钱 <span>¥${moneyCents(game.wallet.balanceCents)} ${icon('chevron',15)}</span></button><div class="receive-box">${icon('arrow',26)}<span>二维码收款<small>测试功能，不生成收款码</small></span></div></div>`;}
function ending(){const e=game.ending;return `${top('这一周的回信',true)}<div class="screen letter-screen" id="scroll"><div class="letter"><small>澄屿科技 / 七日之后</small><h2>${esc(e.title)}</h2><div class="letter-rule"></div><p>${esc(game.player.title)}：</p><p>${esc(e.body)}</p><blockquote>${esc(e.kicker)}</blockquote><h3>你留下的几句话</h3>${e.summary.map(s=>`<div class="memory"><small>第 ${s.day} 天 · ${esc(s.topic)}</small><p>“${esc(s.text)}”</p></div>`).join('')}<p class="signature">董事长办公室<br>第七个工作日，晚</p></div><button class="green-button" data-action="replay">重新经历这七天</button><button class="plain-button" data-action="back">继续翻看聊天记录</button></div>`;}
function render(bottom=false){const old=document.querySelector('#scroll')?.scrollTop||0;app.innerHTML=`${status()}${({messages:chats,chat,contacts,discover,feed,me,services,wallet,cards,ledger,pay:payPage,ending}[view]||chats)()}`;const sc=document.querySelector('#scroll');if(sc)sc.scrollTop=bottom?sc.scrollHeight:old;}
function go(next){view=next;query='';if(['messages','contacts','discover','me'].includes(next)){tab=next;thread=null;}render();document.querySelector('#scroll')?.scrollTo(0,0);}
function openChat(id){thread=id;view='chat';commit({type:'READ',contactId:id},{bottom:true});}
function showDialog(html,cls=''){modal.className=cls;modal.innerHTML=html;if(!modal.open)modal.showModal();}
function closeDialog(){modal.close();}
function buttonsCancel(){return '<button class="plain-button" data-action="close">取消</button>';}
function setup(error=''){showDialog(`<form id="start-form"><div class="setup-logo">${icon('wallet',30)}</div><h2>选择你的董事长人设</h2><p>同一场七日发布危机，不同来路会带来不同的初始处境。</p><div class="persona-grid">${PERSONAS.map((p,i)=>`<label class="persona-card"><input type="radio" name="persona" value="${p.id}" ${i===1?'checked':''}><span><b>${esc(p.label)}</b><em>${esc(p.tag)}</em><small>${esc(p.bio)}</small></span></label>`).join('')}</div><label for="chairman-name">大家怎么称呼您？</label><input id="chairman-name" name="title" maxlength="12" value="林董" autocomplete="off" required><p class="setup-note">人物、公司、交易均为虚构。当前版本使用预设分支对白，进度只保存在此浏览器。</p>${error?`<p class="error-message">${esc(error)}</p>`:''}<button class="green-button" type="submit">登入并进入工作日</button></form>`,'setup-dialog');}
function handle(action,el){
  if(action==='tab')go(el.dataset.tab);
  else if(action==='chat')openChat(el.dataset.id);
  else if(action==='assistant')openChat('assistant');
  else if(action==='back'){
    if(view==='feed')go('discover');
    else if(view==='services')go('me');
    else if(['wallet','pay'].includes(view))go('services');
    else if(['cards','ledger'].includes(view))go('wallet');
    else go(tab);
  }
  else if(action==='close')closeDialog();
  else if(action==='choose'){
    const ev=activeEvent(game),ch=ev?.choices.find(c=>c.id===el.dataset.choice);
    if(!ev||ev.id!==el.dataset.event||!ch)return;
    if(ch.kind)showDialog(`<div class="payment-dialog"><div class="pay-icon">${icon(ch.kind==='packet'?'packet':'arrow',34)}</div><b class="test-pill">虚构测试</b><h2>确认${ch.kind==='packet'?'红包':'转账'}</h2><p>${esc(ch.purpose)} · ${esc(person(ev.contact).name)}</p><strong class="pay-amount">¥${money(ch.amount)}</strong><p class="setup-note">从虚构钱包余额扣除，不产生真实付款。</p><button class="green-button" data-action="pay-confirm" data-event="${ev.id}" data-choice="${ch.id}">确认发送</button>${buttonsCancel()}</div>`);
    else commit({type:'CHOOSE',eventId:ev.id,choiceId:ch.id},{bottom:true});
  } else if(action==='pay-confirm'){if(commit({type:'CHOOSE',eventId:el.dataset.event,choiceId:el.dataset.choice},{bottom:true}))closeDialog();}
  else if(action==='day-end'){
    if(activeEvent(game)){notify('请先回复当天待处理的消息。');return;}
    showDialog(`<h2>${game.day===7?'七天，终于到了这一刻':'今天辛苦了'}</h2><p>${game.day===7?'收下各方的反馈，看看这一周留下了什么。':'未看的聊天和朋友圈都会保留。确认结束今天，进入下一个工作日？'}</p><button class="green-button" data-action="day-confirm">${game.day===7?'收下回信':'结束今日'}</button>${buttonsCancel()}`);
  } else if(action==='day-confirm'){closeDialog();if(commit({type:'NEXT_DAY'},{paint:false})){if(game.ending){view='ending';render();document.querySelector('#scroll').scrollTop=0;}else go('messages');}}
  else if(action==='feed'){commit({type:'FEED_READ'},{paint:false});go('feed');}
  else if(action==='like')commit({type:'LIKE',postId:el.dataset.id});
  else if(action==='comment'){
    const p=game.feed.find(p=>p.id===el.dataset.id);if(p.commented){notify('您已经在这条动态下留过话了。');return;}
    showDialog(`<h2>评论 ${esc(person(p.author).name)}</h2><p class="quoted">${esc(p.text)}</p>${SOCIAL_COMMENTS.map(c=>`<button class="sheet-choice" data-action="comment-send" data-id="${p.id}" data-comment="${c.id}">${esc(c.text)}</button>`).join('')}${buttonsCancel()}`,'sheet-dialog');
  } else if(action==='comment-send'){if(commit({type:'COMMENT',postId:el.dataset.id,commentId:el.dataset.comment})){closeDialog();notify('评论已发送');}}
  else if(action==='post'){
    if(game.ending){notify('这一周已结束，可以继续查看动态。');return;}
    if(game.postsByDay[game.day]){notify('今天已经发过动态了，给朋友们留一点回应的时间。');return;}
    showDialog(`<h2>这一刻的想法</h2><p>选择一句话，发给朋友圈里的人。</p>${PLAYER_POSTS.map(p=>`<button class="sheet-choice" data-action="post-send" data-id="${p.id}">${esc(p.text)}</button>`).join('')}${buttonsCancel()}`,'sheet-dialog');
  } else if(action==='post-send'){if(commit({type:'POST',postId:el.dataset.id})){closeDialog();commit({type:'FEED_READ'},{paint:false});go('feed');notify('已发表');}}
  else if(action==='me')go('me');
  else if(action==='profile'){
    const c=person(el.dataset.id);showDialog(`<div class="profile-detail">${avatar(c.id,'large')}<div><h2>${esc(c.name)}</h2><p>${esc(c.role)} · ${c.age} 岁</p></div></div><div class="profile-info"><p>公司 <span>${esc(c.company)}</span></p><p>签名 <span>${esc(c.personality)}</span></p><p>资料 <span>虚构人物</span></p></div><button class="green-button" data-action="profile-chat" data-id="${c.id}">发消息</button><button class="plain-button" data-action="close">关闭</button>`);
  } else if(action==='profile-chat'){closeDialog();openChat(el.dataset.id);}
  else if(action==='ending'){if(game.ending){view='ending';render();document.querySelector('#scroll').scrollTop=0;}else notify('七日结束后，会收到属于您的回信。');}
  else if(action==='settings')showDialog(`<h2>设置</h2><div class="settings-list"><button data-action="about">关于测试版 ${icon('chevron',16)}</button><button data-action="replay">重新开始七天 ${icon('chevron',16)}</button><button class="danger" data-action="erase">永久清除本地进度 ${icon('chevron',16)}</button></div><button class="plain-button" data-action="close">关闭</button>`);
  else if(action==='about')showDialog('<h2>董事长日常 · v0.1</h2><p>七日董事长社交模拟。当前使用预设分支对白和程序规则，没有连接真实 AI、账号、支付或微信服务。</p><p>界面为高保真交互测试；本项目并非微信官方产品。所有人物均为虚构成年人。</p><p>存档仅在此浏览器。清除后无法恢复，网页关闭期间故事不会自行推进。</p><button class="plain-button" data-action="close">知道了</button>');
  else if(action==='replay'||action==='erase')showDialog(`<h2>${action==='replay'?'重新开始？':'永久清除进度？'}</h2><p>这会删除此浏览器里的聊天、动态、虚拟收支和故事选择。其他网站的数据不受影响，操作无法撤销。</p><button class="danger-button" data-action="erase-confirm" data-restart="${action==='replay'}">${action==='replay'?'清除并重新开始':'永久清除'}</button>${buttonsCancel()}`);
  else if(action==='erase-confirm'){const error=clearGame(storage);if(error){notify(error);return;}blocked=false;started=false;game=createGame();thread=null;view=tab='messages';closeDialog();render();setup('已清除旧进度。填写称呼后开始新的一周。');}
  else if(action==='services')go('services');
  else if(action==='wallet-page')go('wallet');
  else if(action==='cards')go('cards');
  else if(action==='ledger')go('ledger');
  else if(action==='pay-page')go('pay');
  else if(action==='service-note')notify('当前为虚构测试版，此项不连接真实服务。');
  else if(action==='search')showDialog(`<form id="search-form"><h2>查找联系人</h2><input name="query" placeholder="姓名或职务" value="${esc(query)}" maxlength="24" autofocus><button type="submit" class="green-button">搜索</button>${buttonsCancel()}</form>`);
  else if(action==='new-menu')showDialog(`<h2>工作间隙</h2><button class="sheet-choice" data-action="menu-post">${icon('camera',20)} 发一条朋友圈</button><button class="sheet-choice" data-action="menu-assistant">${icon('calendar',20)} 查看今日行程</button>${buttonsCancel()}`,'sheet-dialog');
  else if(action==='menu-post'){closeDialog();handle('post',el);}
  else if(action==='menu-assistant'){closeDialog();openChat('assistant');}
  else if(action==='reply-hint'){document.querySelector('.quick-replies')?.scrollIntoView({block:'nearest'});notify('点上方任意一句话，发送您的决定。');}
  else if(action==='next-message'){const ev=activeEvent(game);openChat(ev?ev.contact:'assistant');}
  else if(action==='chat-tools'){const ev=activeEvent(game);showDialog(`<h2>聊天工具</h2><p>${ev?.contact===thread&&ev.choices.some(c=>c.kind)?'此事项包含虚拟红包或转账选项。点选对应回复后，可确认金额与用途。':'红包与转账会在测试拨款、团队慰问等具体事项中出现。此刻无需额外付款。'}</p><button class="plain-button" data-action="close">知道了</button>`);}
}
document.addEventListener('click',ev=>{const button=ev.target.closest('[data-action]');if(button&&!button.disabled)handle(button.dataset.action,button);});
document.addEventListener('error',ev=>{if(ev.target instanceof HTMLImageElement&&ev.target.matches('img[data-avatar]'))ev.target.hidden=true;},true);
document.addEventListener('change',ev=>{if(ev.target.matches('#start-form input[name="persona"]')){const input=document.querySelector('#chairman-name'),selected=PERSONAS.find(p=>p.id===ev.target.value);if(input&&selected&&PERSONAS.some(p=>p.defaultTitle===input.value))input.value=selected.defaultTitle;} });
document.addEventListener('submit',ev=>{
  if(ev.target.id==='start-form'){ev.preventDefault();const data=new FormData(ev.target),title=String(data.get('title')).trim(),chosen=String(data.get('persona')||'tycoon');if(!title)return;game=createGame(title,4107,chosen);started=true;blocked=false;saveGame(storage,game);closeDialog();go('messages');}
  if(ev.target.id==='search-form'){ev.preventDefault();query=String(new FormData(ev.target).get('query')).trim();closeDialog();view=tab='messages';thread=null;render();document.querySelector('#scroll').scrollTop=0;}
});
modal.addEventListener('cancel',e=>{if(!started||blocked)e.preventDefault();});
render();
if(loaded.blocked)showDialog(`<h2>存档需要处理</h2><p>${esc(loaded.error)}</p><button class="danger-button" data-action="erase">清除损坏的存档</button>`);
else if(!started)setup(loaded.error||'');
else if(loaded.error)notify(loaded.error);
