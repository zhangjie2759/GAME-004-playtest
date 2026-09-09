import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {EVENTS,PERSONAS,createContacts,provider} from './content.mjs';
import {createGame,dispatch,activeEvent,endingFor,saveGame,loadGame,clearGame,SAVE_KEY,OPENING_BALANCE_CENTS} from './engine.mjs';
function run(selector=()=> 'a',social=false) {
  let state=createGame();let steps=0;
  while(!state.ending) {
    assert.ok(++steps<=28,'progress must not deadlock');
    const ev=activeEvent(state);
    const result=dispatch(state,ev?{type:'CHOOSE',eventId:ev.id,choiceId:selector(ev)}:{type:'NEXT_DAY'});
    assert.equal(result.error,null);state=result.state;
    if(social&&!state.ending) {
      for(const p of state.feed.filter(p=>!p.likeRewarded&&p.author!=='me'))state=dispatch(state,{type:'LIKE',postId:p.id}).state;
    }
  }return state;
}
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
test('12 deterministic distinct adult contacts with 8 core and 4 environment roles',()=>{
  const people=createContacts();assert.equal(people.length,12);assert.equal(people.filter(c=>c.tier==='核心').length,8);
  assert.equal(new Set(people.map(c=>c.name)).size,12);assert.ok(people.every(c=>c.age>=18));assert.deepEqual(people,createContacts());assert.notDeepEqual(people,createContacts(20));
});
test('login personas have distinct starting context and avatars exist locally',async()=>{
  assert.deepEqual(PERSONAS.map(p=>p.id),['handsome','tycoon','richwoman','underdog']);
  const starts=PERSONAS.map(p=>createGame(p.defaultTitle,4107,p.id));
  assert.equal(new Set(starts.map(s=>JSON.stringify(s.company))).size,4);
  assert.deepEqual(starts.map(s=>s.player.persona),PERSONAS.map(p=>p.id));
  const people=createContacts();assert.equal(new Set(people.map(p=>p.image)).size,12);
  for(const p of people){assert.match(p.image,/^\.\/assets\/avatars\/[a-z]+\.png$/);await access(fileURLToPath(new URL(p.image,import.meta.url)));}
});
test('21 events, 3 choices each, every choice reachable with a complete ending',()=>{
  assert.equal(EVENTS.length,21);
  for(let day=1;day<=7;day++)assert.equal(EVENTS.filter(e=>e.day===day).length,3);
  for(const ev of EVENTS)for(const ch of ev.choices){const s=run(e=>e.id===ev.id?ch.id:'a');assert.equal(Object.keys(s.decisions).length,21);assert.equal(s.day,7);assert.ok(s.ending);}
});
test('four endings reached through legal player choices, no state injection',()=>{
  const routes=[['steady',()=> 'a'],['delay',ev=>ev.id==='d7-launch'?'b':'a'],['fracture',ev=>ev.id==='d7-launch'?'c':'b'],['collapse',()=> 'c']];
  for(const [id,selector] of routes)assert.equal(run(selector).ending.id,id);
});
test('randomized paths cannot deadlock, overflow money, or escape state bounds',()=>{
  let n=59;for(let i=0;i<120;i++){
    const s=run(()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return ['a','b','c'][n%3];},i%2===0);
    assert.equal(s.wallet.balanceCents,OPENING_BALANCE_CENTS-s.ledger.reduce((a,l)=>a+l.amountCents,0));
    for(const k of ['ready','team','reputation','hype'])assert.ok(s.company[k]>=0&&s.company[k]<=100);
    assert.ok(Object.values(s.relationships).every(r=>Object.values(r).every(v=>v>=0&&v<=100)));
  }
});
test('replayed, future, invalid choice and early day advance never change state',()=>{
  const start=createGame(),snapshot=JSON.stringify(start);let result=dispatch(start,{type:'NEXT_DAY'});assert.ok(result.error);assert.equal(result.state,start);
  result=dispatch(start,{type:'CHOOSE',eventId:'d2-budget',choiceId:'a'});assert.ok(result.error);
  result=dispatch(start,{type:'CHOOSE',eventId:'d1-target',choiceId:'invalid'});assert.ok(result.error);
  const chosen=dispatch(start,{type:'CHOOSE',eventId:'d1-target',choiceId:'a',effects:{cash:999999999}}).state;
  assert.equal(JSON.stringify(start),snapshot);assert.equal(chosen.wallet.balanceCents,OPENING_BALANCE_CENTS);
  assert.ok(dispatch(chosen,{type:'CHOOSE',eventId:'d1-target',choiceId:'a'}).error);
});
test('six interaction classes affect state and transactions are debit-only/idempotent',()=>{
  let s=createGame();s=dispatch(s,{type:'LIKE',postId:'f1-0'}).state;assert.equal(s.company.team,66);
  const once=s.relationships.designer.trust;
  for(let i=0;i<6;i++)s=dispatch(s,{type:'LIKE',postId:'f1-0'}).state;
  assert.equal(s.relationships.designer.trust,once);
  s=dispatch(s,{type:'COMMENT',postId:'f1-0',commentId:'care'}).state;assert.equal(s.feed.find(p=>p.id==='f1-0').comments.length,2);
  assert.ok(dispatch(s,{type:'COMMENT',postId:'f1-0',commentId:'care'}).error);
  s=dispatch(s,{type:'POST',postId:'thanks'}).state;assert.ok(s.feed.some(p=>p.author==='me'));assert.ok(dispatch(s,{type:'POST',postId:'ambition'}).error);
  while(s.day<2){const e=activeEvent(s);s=dispatch(s,e?{type:'CHOOSE',eventId:e.id,choiceId:'a'}:{type:'NEXT_DAY'}).state;}
  s=dispatch(s,{type:'CHOOSE',eventId:'d2-budget',choiceId:'a',amount:-1000000}).state;assert.equal(s.ledger[0].amountCents,8000000);assert.equal(s.wallet.balanceCents,OPENING_BALANCE_CENTS-8000000);
  assert.ok(dispatch(s,{type:'CHOOSE',eventId:'d2-budget',choiceId:'a'}).error);
  s=dispatch(s,{type:'CHOOSE',eventId:'d2-team',choiceId:'a'}).state;assert.equal(s.ledger[1].kind,'packet');assert.equal(s.wallet.balanceCents,OPENING_BALANCE_CENTS-8120000);
});
test('insufficient virtual funds reject payment without blocking non-payment options',()=>{
  let s=createGame();while(s.day<2){let e=activeEvent(s);s=dispatch(s,e?{type:'CHOOSE',eventId:e.id,choiceId:'a'}:{type:'NEXT_DAY'}).state;}
  s.wallet.balanceCents=0;assert.ok(dispatch(s,{type:'CHOOSE',eventId:'d2-budget',choiceId:'a'}).error);
  assert.equal(dispatch(s,{type:'CHOOSE',eventId:'d2-budget',choiceId:'c'}).error,null);
});
test('prior decisions are referenced in future messages',()=>{
  const s=run(ev=>ev.id==='d1-position'?'b':'a');assert.ok(s.messages.some(m=>m.text.includes('期待现在成了质疑')));
  assert.ok(s.messages.some(m=>m.text.includes('重检费用没有白花')));
  const before=JSON.stringify(s);provider.opening(EVENTS[0],s);assert.equal(JSON.stringify(s),before);
});
test('save, resume and permanent delete preserve unrelated browser keys',()=>{
  const store=storage(),s=run();store.setItem('other.project','keep');assert.equal(saveGame(store,s),null);
  const restored=loadGame(store);assert.equal(restored.error,null);assert.deepEqual(restored.state,s);
  assert.equal(clearGame(store),null);assert.equal(store.getItem(SAVE_KEY),null);assert.equal(store.getItem('other.project'),'keep');assert.equal(loadGame(store).state,null);
  assert.equal(Object.keys(createGame().decisions).length,0);assert.equal(createGame().ledger.length,0);
});
test('unknown/broken saves are preserved with a visible recoverable error',()=>{
  const store=storage();for(const bad of ['{bad',JSON.stringify({version:99}),JSON.stringify({...createGame(),feed:[{author:'unknown'}]})]){
    store.setItem(SAVE_KEY,bad);const r=loadGame(store);assert.equal(r.state,null);assert.equal(r.blocked,true);assert.equal(store.getItem(SAVE_KEY),bad);
  }
  const denied={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};
  assert.ok(saveGame(denied,createGame()));assert.ok(clearGame(denied));assert.ok(loadGame(denied).error);
});
test('review findings: malformed contacts, feed, ledger, ending and broken decision prefix are rejected',()=>{
  const base=createGame(),mutations=[
    s=>{delete s.contacts[0].name;},
    s=>{s.feed[0].art='unknown';},
    s=>{s.feed[0].likes=['intruder'];},
    s=>{s.ledger=[{id:'l-made-up',day:1,amountCents:1,kind:'transfer',purpose:'x',to:'gm',status:'已收取'}];s.wallet.balanceCents--;},
    s=>{s.ending={};},
    s=>{s.decisions['d1-position']='a';},
  ];
  for(const mutate of mutations){const store=storage(),bad=structuredClone(base);mutate(bad);store.setItem(SAVE_KEY,JSON.stringify(bad));assert.equal(loadGame(store).blocked,true);}
});
test('review findings: deleted story records and forged transaction messages are rejected',()=>{
  const complete=run(),mutations=[
    s=>{s.messages.splice(5,1);},
    s=>{s.feed.splice(3,1);},
    s=>{s.messages[0].transaction={id:'l-fake',amountCents:1};},
  ];
  for(const mutate of mutations){const store=storage(),bad=structuredClone(complete);mutate(bad);store.setItem(SAVE_KEY,JSON.stringify(bad));assert.equal(loadGame(store).blocked,true);}
});
test('review finding: removed transaction decision cannot be replayed after save corruption',()=>{
  let s=createGame();while(s.day<2){const e=activeEvent(s);s=dispatch(s,e?{type:'CHOOSE',eventId:e.id,choiceId:'a'}:{type:'NEXT_DAY'}).state;}
  s=dispatch(s,{type:'CHOOSE',eventId:'d2-budget',choiceId:'a'}).state;
  delete s.decisions['d2-budget'];
  const store=storage();store.setItem(SAVE_KEY,JSON.stringify(s));const loaded=loadGame(store);assert.equal(loaded.blocked,true);
  assert.ok(dispatch(s,{type:'CHOOSE',eventId:'d2-budget',choiceId:'a'}).error);
});
test('v1 saves migrate to the unified high-value wallet without losing story choices',()=>{
  let s=createGame();while(s.day<2){const e=activeEvent(s);s=dispatch(s,e?{type:'CHOOSE',eventId:e.id,choiceId:'a'}:{type:'NEXT_DAY'}).state;}
  s=dispatch(s,{type:'CHOOSE',eventId:'d2-budget',choiceId:'a'}).state;
  const old=structuredClone(s);old.version=1;old.company.cash=1920000;delete old.wallet;old.ledger=old.ledger.map(({amountCents,...l})=>({...l,amount:amountCents/100}));
  const store=storage();store.setItem(SAVE_KEY,JSON.stringify(old));const loaded=loadGame(store);assert.equal(loaded.error,null);assert.equal(loaded.state.version,3);assert.equal(loaded.state.player.persona,'tycoon');assert.equal(loaded.state.decisions['d2-budget'],'a');assert.equal(loaded.state.wallet.balanceCents,OPENING_BALANCE_CENTS-8000000);
});
test('v2 saves gain persona and image paths without losing progress',()=>{
  const old=createGame();old.version=2;delete old.player.persona;old.contacts.forEach(c=>delete c.image);
  const store=storage();store.setItem(SAVE_KEY,JSON.stringify(old));const loaded=loadGame(store);
  assert.equal(loaded.error,null);assert.equal(loaded.state.version,3);assert.equal(loaded.state.player.persona,'tycoon');assert.ok(loaded.state.contacts.every(c=>c.image));
});
test('ending locks gameplay but permits history reading',()=>{const s=run();assert.ok(dispatch(s,{type:'POST',postId:'thanks'}).error);assert.equal(dispatch(s,{type:'READ',contactId:'gm'}).error,null);assert.deepEqual(endingFor(s),s.ending);});
