import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import {SCENARIOS,PERSONAS,createContacts,provider} from './content.mjs';
import {buildDialogueContext,validateDialogueProposal,requestDialogue,scriptedAsyncProvider} from './dialogue-provider.mjs';
import {createGame,dispatch,activeEvent,endingFor,saveGame,loadGame,clearGame,SAVE_KEY,SAVE_VERSION,OPENING_BALANCE_CENTS,parseAmountCents} from './engine.mjs';

const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};

test('async API seam excludes hidden state and rejects unauthorized money intents',async()=>{
  const s=createGame({routeId:'worker',identityPresetId:'worker'}),context=buildDialogueContext(s,'manager');
  assert.equal(context.routeId,'worker');assert.ok(context.contact.identityTags.length);
  assert.ok(!JSON.stringify(context).includes('"relationships"'));assert.ok(!JSON.stringify(context).includes('"company":{"evidence"'));
  const valid={lines:['收到，按记录核验。'],intent:context.allowedIntents[0]};
  assert.deepEqual(validateDialogueProposal(valid,context),valid);
  assert.throws(()=>validateDialogueProposal({lines:['已付款'],intent:{type:'SEND_MONEY',amountCents:999999}},context));
  assert.throws(()=>validateDialogueProposal({lines:['x'],intent:{...context.allowedIntents[0],effects:{evidence:100}}},context));
  const bad={async propose(){return {lines:[],intent:null};}};
  assert.equal((await requestDialogue(bad,context)).fallback,true);
  assert.equal((await requestDialogue(scriptedAsyncProvider,context)).fallback,false);
  assert.equal((await requestDialogue({propose(){return new Promise(()=>{});}},context,{timeoutMs:10})).fallback,true);
  const snapshot=JSON.stringify(s);await requestDialogue(scriptedAsyncProvider,context);assert.equal(JSON.stringify(s),snapshot);
});
const start=routeId=>createGame({routeId,identityPresetId:routeId==='worker'?'worker':'tycoon'});
const apply=(s,a)=>{const r=dispatch(s,a);assert.equal(r.error,null,JSON.stringify(a));return r.state;};
const restored=s=>loadGame({getItem:()=>JSON.stringify(s)});
const settleChoice=tx=>['manager','partner'].includes(tx.contactId)?'return':'claim';
function run(routeId,select=()=> 'a',social=false,settle=settleChoice){
  let s=start(routeId),steps=0;
  while(!s.ending){
    assert.ok(++steps<=48);
    const incoming=s.transactions.find(t=>t.source==='incoming'&&t.status==='pending'),e=activeEvent(s);
    const requested=e?select(e):null,choiceId=e&&(e.choices.some(c=>c.id===requested)?requested:e.choices.at(-1).id);
    s=incoming?apply(s,{type:'SETTLE_INCOMING_MONEY',transactionId:incoming.id,decision:settle(incoming),clientActionId:`settle-test-${incoming.id}`}):apply(s,e?{type:'CHOOSE',eventId:e.id,choiceId}:{type:'NEXT_DAY'});
    if(social&&!s.ending){const p=s.feed.find(p=>p.author!=='me'&&!p.likeRewarded);if(p)s=apply(s,{type:'LIKE',postId:p.id});}
    assert.equal(restored(s).error,null);
  }return s;
}
function free(s,{mode='packet',contactId=s.routeId==='worker'?'coworker':'designer',amountCents=100,note='辛苦了',clientActionId='test-request-0001'}={}){
  return apply(s,{type:'SEND_MONEY',mode,contactId,amountCents,note,clientActionId});
}
function advanceTo(s,eventId){while(activeEvent(s)?.id!==eventId){const incoming=s.transactions.find(t=>t.source==='incoming'&&t.status==='pending'),e=activeEvent(s);s=incoming?apply(s,{type:'SETTLE_INCOMING_MONEY',transactionId:incoming.id,decision:settleChoice(incoming),clientActionId:`advance-${incoming.id}`}):apply(s,e?{type:'CHOOSE',eventId:e.id,choiceId:'a'}:{type:'NEXT_DAY'});}return s;}
function legacy(s,version=3){
  const copy=structuredClone(s),first=['林','陈','周','许','沈','顾','方','陆','苏','程','徐','叶'],given=['砚舟','知远','予安','景和','以宁','清禾','允诚','书衡','若岚','子衡','明舒','知夏'],shift=Math.abs(s.seed|0)%12;
  const echoIds=new Set(SCENARIOS.chairman.echoIds),incomingIds=new Set(copy.transactions.filter(t=>t.source==='incoming').map(t=>t.id));
  copy.decisions=Object.fromEntries(Object.entries(copy.decisions).filter(([id])=>!echoIds.has(id)));copy.flags=Object.fromEntries(Object.entries(copy.flags).filter(([id])=>!echoIds.has(id)));
  copy.messages=copy.messages.filter(m=>!echoIds.has(m.eventId)&&!incomingIds.has(m.transactionId)&&!['领取了红包','已退还红包'].includes(m.text)).map((m,i)=>({...m,id:`m${i+1}`,seq:i+1}));copy.sequence=copy.messages.length;
  copy.version=version;copy.player={title:s.player.title,persona:s.player.identityPresetId==='selfmade'?'underdog':s.player.identityPresetId};
  copy.contacts=copy.contacts.map((c,i)=>{const {displayName,legalName,moneyPolicy,...p}=c;p.name=first[(i+shift)%12]+given[(i*5+shift)%12];if(version<3)delete p.image;return p;});
  copy.ledger=s.transactions.filter(t=>t.source==='story').map(t=>({id:t.id.replace('tx-story-','l-'),day:t.day,amountCents:t.amountCents,kind:t.mode,purpose:t.note,to:t.contactId,status:'已收取'}));
  copy.messages=copy.messages.map(m=>{if(!m.transactionId)return m;const {transactionId,...p}=m;return {...p,transaction:copy.ledger.find(l=>l.id===transactionId.replace('tx-story-','l-'))};});
  copy.wallet={balanceCents:OPENING_BALANCE_CENTS-copy.ledger.reduce((n,l)=>n+l.amountCents,0),cards:8};
  for(const key of ['routeId','evidenceItems','transactions','transactionSequence','processedActionIds','memories','skippedEchoes','echoMigrationThroughDay'])delete copy[key];
  if(version<3)delete copy.player.persona;
  if(version===1){copy.ledger=copy.ledger.map(({amountCents,...l})=>({...l,amount:amountCents/100}));delete copy.wallet;copy.company.cash=2000000;}
  return copy;
}
function asV4(s){
  const copy=structuredClone(s),echoIds=new Set(SCENARIOS[s.routeId].echoIds),incomingIds=new Set(copy.transactions.filter(t=>t.source==='incoming').map(t=>t.id));copy.version=4;
  copy.decisions=Object.fromEntries(Object.entries(copy.decisions).filter(([id])=>!echoIds.has(id)));copy.flags=Object.fromEntries(Object.entries(copy.flags).filter(([id])=>!echoIds.has(id)));
  copy.transactions=copy.transactions.filter(t=>t.source!=='incoming');copy.ledger=copy.ledger.filter(l=>!incomingIds.has(l.transactionId));copy.processedActionIds=copy.transactions.filter(t=>t.source==='free').map(t=>t.clientActionId);
  copy.messages=copy.messages.filter(m=>!echoIds.has(m.eventId)&&!incomingIds.has(m.transactionId)&&!['领取了红包','已退还红包'].includes(m.text)).map((m,i)=>({...m,id:`m${i+1}`,seq:i+1}));copy.sequence=copy.messages.length;
  copy.wallet.balanceCents=copy.wallet.openingBalanceCents+copy.ledger.reduce((n,l)=>n+(l.direction==='credit'?l.amountCents:-l.amountCents),0);
  for(const key of ['memories','skippedEchoes','echoMigrationThroughDay'])delete copy[key];return copy;
}
test('each route has twelve mixed display names, adults and twelve existing avatar images',async()=>{
  for(const routeId of Object.keys(SCENARIOS)){
    const people=createContacts(4107,routeId);assert.equal(people.length,12);assert.equal(people.filter(p=>p.tier==='核心').length,8);
    assert.equal(new Set(people.map(p=>p.displayName)).size,12);assert.ok(people.every(p=>p.age>=18));assert.ok(people.filter(p=>p.displayName!==p.legalName).length>=10);
    assert.equal(new Set(people.map(p=>p.image)).size,12);
    for(const p of people){assert.match(p.image,/^\.\/assets\/avatars\/[a-z]+\.png$/);await access(new URL(p.image,import.meta.url));}
    assert.deepEqual(people,createContacts(4107,routeId));assert.notDeepEqual(people,createContacts(20,routeId));
  }
});
test('eight identity presets use the approved independent balances and state fields',()=>{
  assert.equal(PERSONAS.length,8);
  const expected=[1888888888,8888888888,8888888888,888888888,888888,888888,8888888888,8888888888];
  PERSONAS.forEach((p,i)=>{const s=createGame({routeId:p.routeId,identityPresetId:p.id});assert.equal(s.wallet.balanceCents,expected[i]);assert.deepEqual(s.company,p.starts);assert.equal(restored(s).error,null);});
});
test('both routes: all 150 replies can reach day seven without a dead end',()=>{
  for(const [routeId,scenario] of Object.entries(SCENARIOS)){
    assert.equal(scenario.events.length,27);assert.equal(scenario.echoIds.length,6);
    assert.equal(scenario.events.filter(e=>e.echo).length,6);assert.equal(scenario.events.reduce((n,e)=>n+e.choices.length,0),75);
    for(let day=1;day<=7;day++)assert.equal(scenario.events.filter(e=>e.day===day).length,day===1?3:4);
    for(const e of scenario.events)for(const ch of e.choices){assert.equal(e.choices.length,e.echo?2:3);const s=run(routeId,ev=>ev.id===e.id?ch.id:'a');assert.equal(Object.keys(s.decisions).length,27);assert.ok(s.ending);}
  }
});
test('all eight endings reached through choices, no state injection',()=>{
  for(const [routeId,id,select] of [
    ['chairman','steady',()=> 'a'],['chairman','delay',e=>e.id==='d7-launch'?'b':'a'],
    ['chairman','fracture',e=>e.id==='d7-launch'?'c':'b'],['chairman','collapse',()=> 'c'],
    ['worker','worker-win',()=> 'a'],['worker','worker-exit',e=>e.id==='w7-future'?'b':'a'],
    ['worker','worker-lonely',e=>e.id==='w7-future'?'c':'a'],['worker','worker-blamed',()=> 'c']
  ])assert.equal(run(routeId,select).ending.id,id);
});
test('randomized legal paths preserve wallet and hidden-state invariants',()=>{
  let seed=71;
  for(const routeId of Object.keys(SCENARIOS))for(let i=0;i<30;i++){
    const s=run(routeId,()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return ['a','b','c'][seed%3];},i%2===0);
    assert.equal(s.wallet.balanceCents,s.wallet.openingBalanceCents+s.ledger.reduce((n,l)=>n+(l.direction==='credit'?l.amountCents:-l.amountCents),0));
    assert.ok(Object.values(s.company).every(v=>v>=0&&v<=100));
  }
});
test('future, cross-route, duplicate, invalid replies and early day advance are rejected',()=>{
  for(const routeId of Object.keys(SCENARIOS)){
    const s=start(routeId),snapshot=JSON.stringify(s),ev=activeEvent(s);
    for(const a of [{type:'NEXT_DAY'},{type:'CHOOSE',eventId:routeId==='worker'?'d1-target':'w1-task',choiceId:'a'},{type:'CHOOSE',eventId:ev.id,choiceId:'bad'}])assert.equal(dispatch(s,a).state,s);
    const next=apply(s,{type:'CHOOSE',eventId:ev.id,choiceId:'a',effects:{cash:9999999}});
    assert.ok(dispatch(next,{type:'CHOOSE',eventId:ev.id,choiceId:'a'}).error);assert.equal(JSON.stringify(s),snapshot);
  }
});
test('strict money parsing rejects signs, exponent notation and excess decimals',()=>{
  for(const v of ['', '0.001','-1','+1','1e3','1,000','NaN','Infinity','.1','1.','1a',{},null])assert.equal(parseAmountCents(v),null);
  for(const [v,n] of [['0.01',1],['0.29',29],['200',20000],['200000.00',20000000],[' 12.5 ',1250]])assert.equal(parseAmountCents(v),n);
});
test('free packet and transfer settle, refund and link exact ledger entries',()=>{
  let s=start('worker');
  s=free(s,{amountCents:20000});assert.equal(s.wallet.balanceCents,868888);assert.equal(s.transactions[0].status,'accepted');
  s=free(s,{mode:'transfer',contactId:'client',amountCents:12345,note:'项目预付款',clientActionId:'test-request-0002'});assert.equal(s.wallet.balanceCents,856543);
  const before=s.wallet.balanceCents;s=free(s,{mode:'transfer',contactId:'coworker',amountCents:30000,clientActionId:'test-request-0003'});
  assert.equal(s.wallet.balanceCents,before);assert.equal(s.transactions.at(-1).status,'refunded');assert.equal(s.ledger.at(-1).linkedEntryId,s.ledger.at(-2).id);assert.equal(restored(s).error,null);
  s=free(s,{contactId:'manager',clientActionId:'test-request-0004'});assert.equal(s.wallet.balanceCents,before);
});
test('all contacts and both free payment types have valid responses and save roundtrips',()=>{
  for(const routeId of Object.keys(SCENARIOS))for(const c of start(routeId).contacts)for(const mode of ['packet','transfer']){
    const s=free(start(routeId),{contactId:c.id,mode});assert.equal(restored(s).error,null);assert.equal(s.transactions.length,1);
  }
});
test('invalid money requests and insufficient funds preserve original state',()=>{
  const s=start('worker'),base={type:'SEND_MONEY',mode:'packet',contactId:'coworker',amountCents:1,note:'x',clientActionId:'request-invalid-test'};
  for(const update of [{amountCents:0},{amountCents:-1},{amountCents:1.1},{amountCents:20001},{amountCents:Number.MAX_SAFE_INTEGER},{mode:'other'},{contactId:'gm'},{note:'x'.repeat(21)},{clientActionId:'x'},{mode:'transfer',amountCents:20000001},{mode:'transfer',amountCents:888889}]){
    const result=dispatch(s,{...base,...update});assert.ok(result.error);assert.equal(result.state,s);
  }
});
test('idempotency survives reload and missing processed-id corruption',()=>{
  const s=free(start('worker'));const same={type:'SEND_MONEY',mode:'packet',contactId:'coworker',amountCents:100,clientActionId:'test-request-0001'};
  assert.ok(dispatch(restored(s).state,same).error);
  const bad=structuredClone(s);bad.processedActionIds=[];assert.ok(restored(bad).blocked);assert.ok(dispatch(bad,same).error);
});
test('free money gives relationship effect only once per contact per day',()=>{
  let s=free(start('worker'));const trust=s.relationships.coworker.trust;
  for(let i=2;i<=6;i++)s=free(s,{clientActionId:'repeat-request-'+i});
  assert.equal(s.relationships.coworker.trust,trust);
  while(s.day===1){const e=activeEvent(s);s=apply(s,e?{type:'CHOOSE',eventId:e.id,choiceId:'a'}:{type:'NEXT_DAY'});}
  s=free(s,{clientActionId:'next-day-request'});assert.equal(s.relationships.coworker.trust,trust+1);
});
test('story money uses fixed amounts and exhausted wallets retain non-payment replies',()=>{
  let s=advanceTo(start('chairman'),'d2-budget');
  s=apply(s,{type:'CHOOSE',eventId:'d2-budget',choiceId:'a',amountCents:-9000});assert.equal(s.transactions[0].amountCents,8000000);
  const bad=structuredClone(s);delete bad.decisions['d2-budget'];assert.ok(dispatch(bad,{type:'CHOOSE',eventId:'d2-budget',choiceId:'a'}).error);assert.ok(restored(bad).blocked);
  let w=start('worker');w=free(w,{mode:'transfer',contactId:'client',amountCents:w.wallet.balanceCents});
  while(activeEvent(w)?.id!=='w2-expense'){const e=activeEvent(w);w=apply(w,e?{type:'CHOOSE',eventId:e.id,choiceId:'a'}:{type:'NEXT_DAY'});}
  assert.ok(dispatch(w,{type:'CHOOSE',eventId:'w2-expense',choiceId:'a'}).error);w=apply(w,{type:'CHOOSE',eventId:'w2-expense',choiceId:'b'});assert.equal(restored(w).error,null);
});
test('exit compensation credited once, other endings do not receive it',()=>{
  const s=run('worker',e=>e.id==='w7-future'?'b':'a');assert.equal(s.transactions.filter(t=>t.source==='ending').length,1);assert.equal(s.transactions.find(t=>t.source==='ending').amountCents,2000000);
  assert.ok(dispatch(s,{type:'NEXT_DAY'}).error);assert.equal(restored(s).error,null);assert.equal(run('worker').transactions.filter(t=>t.source==='ending').length,0);
});
test('likes, comments and posts affect each route and cannot be farmed',()=>{
  for(const routeId of Object.keys(SCENARIOS)){
    let s=start(routeId),p=s.feed[0],stat=routeId==='worker'?'allies':'team';const initial=s.company[stat];
    s=apply(s,{type:'LIKE',postId:p.id});assert.equal(s.company[stat],initial+1);for(let i=0;i<4;i++)s=apply(s,{type:'LIKE',postId:p.id});assert.equal(s.company[stat],initial+1);
    s=apply(s,{type:'COMMENT',postId:p.id,commentId:SCENARIOS[routeId].socialComments[0].id});assert.ok(dispatch(s,{type:'COMMENT',postId:p.id,commentId:'professional'}).error);
    s=apply(s,{type:'POST',postId:'thanks'});assert.ok(dispatch(s,{type:'POST',postId:'thanks'}).error);assert.equal(restored(s).error,null);
  }
});
test('previous decisions are referenced and providers never mutate state',()=>{
  const c=run('chairman',e=>e.id==='d1-position'?'b':'a');assert.ok(c.messages.some(m=>m.text.includes('期待现在成了质疑')));assert.ok(c.messages.some(m=>m.text.includes('重检费用没有白花')));
  const w=run('worker');assert.ok(w.messages.some(m=>m.text.includes('冻结的版本派上用场')));const before=JSON.stringify(w);provider.opening(SCENARIOS.worker.events[0],w);assert.equal(JSON.stringify(w),before);
});
test('v3 chairman progress, legacy balance and underdog identity migrate to v5',()=>{
  const source=run('chairman'),coreDecisions=Object.fromEntries(Object.entries(source.decisions).filter(([id])=>!SCENARIOS.chairman.echoIds.includes(id)));const old=legacy(source),result=restored(old);assert.equal(result.error,null);assert.equal(result.state.version,SAVE_VERSION);assert.deepEqual(result.state.decisions,coreDecisions);assert.equal(result.state.wallet.balanceCents,old.wallet.balanceCents);
  old.player.persona='underdog';const mapped=restored(old);assert.equal(mapped.error,null);assert.equal(mapped.state.routeId,'chairman');assert.equal(mapped.state.player.identityPresetId,'selfmade');assert.equal(mapped.state.wallet.openingBalanceCents,OPENING_BALANCE_CENTS);
});
test('v1 and v2 sequential migrations preserve legitimate old saves',()=>{
  for(const version of [1,2]){const old=legacy(run('chairman'),version),r=restored(old);assert.equal(r.error,null);assert.equal(r.state.version,SAVE_VERSION);assert.equal(Object.keys(r.state.decisions).length,21);assert.equal(r.state.skippedEchoes.length,6);}
});
test('v4 saves migrate without replaying past relationship echoes',()=>{
  for(const routeId of Object.keys(SCENARIOS)){const old=asV4(run(routeId)),r=restored(old);assert.equal(r.error,null);assert.equal(r.state.version,SAVE_VERSION);assert.equal(r.state.skippedEchoes.length,6);assert.equal(r.state.echoMigrationThroughDay,7);assert.ok(r.state.ending);}
});
test('incoming packets can be claimed or returned exactly once',()=>{
  let claim=advanceTo(start('worker'),'w3-echo-lunch'),before=claim.wallet.balanceCents;claim=apply(claim,{type:'CHOOSE',eventId:'w3-echo-lunch',choiceId:'a'});
  const offer=claim.transactions.find(t=>t.id==='tx-incoming-w3-echo-lunch');assert.equal(offer.status,'pending');assert.equal(claim.wallet.balanceCents,before);
  const draft={type:'SETTLE_INCOMING_MONEY',contactId:'coworker',transactionId:offer.id,decision:'claim',clientActionId:'claim-packet-api1'},context=buildDialogueContext(claim,'coworker',draft);assert.equal(context.pendingIncoming.length,1);assert.deepEqual(context.allowedIntents.at(-1),Object.fromEntries(Object.entries(draft).filter(([key])=>key!=='contactId')));
  claim=apply(claim,{type:'SETTLE_INCOMING_MONEY',transactionId:offer.id,decision:'claim',clientActionId:'claim-packet-0001'});assert.equal(claim.wallet.balanceCents,before+1888);assert.equal(claim.ledger.at(-1).direction,'credit');assert.equal(restored(claim).error,null);
  for(const bad of [{type:'SETTLE_INCOMING_MONEY',transactionId:offer.id,decision:'claim',clientActionId:'claim-packet-0002'},{type:'SETTLE_INCOMING_MONEY',transactionId:'missing',decision:'claim',clientActionId:'claim-packet-0003'}])assert.ok(dispatch(claim,bad).error);
  let returned=advanceTo(start('worker'),'w6-echo-boundary');returned=apply(returned,{type:'CHOOSE',eventId:'w6-echo-boundary',choiceId:'a'});const hush=returned.transactions.find(t=>t.id==='tx-incoming-w6-echo-boundary'),balance=returned.wallet.balanceCents,ledgerCount=returned.ledger.length;
  returned=apply(returned,{type:'SETTLE_INCOMING_MONEY',transactionId:hush.id,decision:'return',clientActionId:'return-packet-0001'});assert.equal(returned.wallet.balanceCents,balance);assert.equal(returned.ledger.length,ledgerCount);assert.equal(hush.status,'pending');assert.equal(returned.transactions.find(t=>t.id===hush.id).status,'returned');assert.equal(restored(returned).error,null);
});
test('relationship echoes and public API memories reflect confirmed history',()=>{
  let a=start('chairman'),b=start('chairman');a=apply(a,{type:'CHOOSE',eventId:'d1-target',choiceId:'a'});b=apply(b,{type:'CHOOSE',eventId:'d1-target',choiceId:'c'});
  a=advanceTo(a,'d2-echo-promise');b=advanceTo(b,'d2-echo-promise');const ev=activeEvent(a),aLines=provider.opening(ev,a),bLines=provider.opening(ev,b);assert.notDeepEqual(aLines,bLines);assert.match(aLines.join(''),/兑现产品承诺/);assert.match(bLines.join(''),/锁了预算/);
  a=apply(a,{type:'CHOOSE',eventId:ev.id,choiceId:'a'});const ctx=buildDialogueContext(a,'hr');assert.ok(ctx.publicMemories.some(m=>m.summary.includes('正式排期')));assert.ok(!JSON.stringify(ctx).includes('"relationships"'));
});
test('malformed current and legacy data enter recovery without overwriting original',()=>{
  const s=free(start('worker'),{mode:'transfer'}),mutations=[
    b=>{delete b.contacts[0].displayName;},b=>{b.contacts[0].image='./secret.png';},b=>{b.feed[0].author='gm';},
    b=>{b.feed[0].likes=['intruder'];},b=>{b.feed[0].comments=[{author:'coworker',text:'forged'}];},
    b=>{b.decisions['w2-baseline']='a';},b=>{b.player.identityPresetId='tycoon';},b=>{b.wallet.balanceCents++;},
    b=>{b.ledger.at(-1).linkedEntryId='wrong';},b=>{b.transactions[0].amountCents++;},b=>{b.messages.pop();},
    b=>{b.evidenceItems.push('invented');},b=>{b.ending={};},b=>{b.routeId='chairman';}
  ];
  for(const mutate of mutations){const b=structuredClone(s);mutate(b);const store=storage(),raw=JSON.stringify(b);store.setItem(SAVE_KEY,raw);assert.ok(loadGame(store).blocked);assert.equal(store.getItem(SAVE_KEY),raw);}
  for(const mutate of [b=>{b.contacts[0].name='假名';},b=>{b.wallet.balanceCents++;},b=>{b.messages.find(m=>m.transaction).transaction.amountCents++;}]){const b=legacy(run('chairman'));mutate(b);assert.ok(restored(b).blocked);}
});
test('save, clear and unavailable browser storage fail visibly and preserve unrelated keys',()=>{
  const store=storage();store.setItem('other','keep');assert.equal(saveGame(store,start('worker')),null);assert.equal(loadGame(store).error,null);assert.equal(clearGame(store),null);assert.equal(store.getItem('other'),'keep');assert.equal(loadGame(store).state,null);
  for(const raw of ['{bad','{"version":99}']){store.setItem(SAVE_KEY,raw);assert.ok(loadGame(store).blocked);assert.equal(store.getItem(SAVE_KEY),raw);}
  const denied={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};assert.ok(saveGame(denied,start('worker')));assert.ok(clearGame(denied));assert.ok(loadGame(denied).error);
});
test('finished stories allow history reads but reject gameplay and money actions',()=>{
  for(const routeId of Object.keys(SCENARIOS)){const s=run(routeId);assert.ok(dispatch(s,{type:'POST',postId:'thanks'}).error);assert.ok(dispatch(s,{type:'SEND_MONEY'}).error);assert.equal(dispatch(s,{type:'READ',contactId:SCENARIOS[routeId].guideId}).error,null);assert.deepEqual(endingFor(s),s.ending);}
});
