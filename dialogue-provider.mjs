import {activeEvent,contactById} from './engine.mjs';
import {provider as scripted,scenarioFor,PERSONAS,personaProfileFor,REACTION_TYPES,MEMORY_SIGNALS} from './content.mjs';

const clean=s=>String(s??'').trim();
const compact=(s,max=42)=>{const text=clean(s);return text.length>max?`${text.slice(0,max-1)}…`:text;};
const exactIntent=(intent,allowed)=>{if(!intent)return null;const keys=Object.keys(intent).sort();return allowed.find(item=>JSON.stringify(Object.keys(item).sort())===JSON.stringify(keys)&&keys.every(key=>item[key]===intent[key]))||null;};
const modelPersona=p=>({
  publicBio:compact(p.publicBio,60),outward:compact(p.socialMask,36),realConcern:compact(p.privateMotivation,48),
  goal:compact(p.goal,40),values:p.values.slice(0,3),chatRhythm:compact(p.speechStyle.pace,28),usualWords:p.speechStyle.vocabulary.slice(0,3),emojiHabit:p.speechStyle.emoji,
  moneyView:compact(p.moneyAttitude,42),relationshipRules:p.relationshipRules.map(item=>compact(item,36)),boundary:compact(p.secretBoundary,48),
  unclearReply:compact(p.fallbackReactions.unclear),unexpectedReply:compact(p.fallbackReactions.unexpected),
});

/** Builds a sanitized, public-only payload. Hidden relationship and world values never leave the rules layer. */
export function buildDialogueContext(state,contactId,moneyDraft=null,userMessage=''){
  const contact=contactById(state,contactId);if(!contact)throw new Error('Unknown contact');
  const scenario=scenarioFor(state.routeId),current=activeEvent(state),event=current?.contact===contactId?current:null;
  const identity=PERSONAS.find(p=>p.id===state.player.identityPresetId),persona=personaProfileFor(state.routeId,contactId);
  const allowedIntents=event?event.choices.map(c=>({type:'CHOOSE',eventId:event.id,choiceId:c.id})):[];
  if(moneyDraft?.contactId===contactId&&moneyDraft.type==='SETTLE_INCOMING_MONEY')allowedIntents.push({type:'SETTLE_INCOMING_MONEY',transactionId:moneyDraft.transactionId,decision:moneyDraft.decision,clientActionId:moneyDraft.clientActionId});
  else if(moneyDraft?.contactId===contactId)allowedIntents.push({type:'SEND_MONEY',mode:moneyDraft.mode,contactId,amountCents:moneyDraft.amountCents,note:moneyDraft.note||'',clientActionId:moneyDraft.clientActionId});
  return {
    schema:'game004.dialogue.v4',routeId:state.routeId,userMessage:clean(userMessage).slice(0,500),
    player:{title:state.player.title,role:scenario.role,identityPresetId:identity.id,identityTags:[identity.label,identity.tag]},
    contact:{id:contact.id,displayName:contact.displayName,role:contact.role,age:contact.age,personality:contact.personality,identityTags:[...contact.identityTags],persona:modelPersona(persona)},
    publicState:{day:state.day,company:scenario.company,project:scenario.project,dayTitle:scenario.days[state.day-1]},
    publicMemories:state.memories.filter(m=>m.contactId===contactId).slice(-6).map(m=>({day:m.day,tone:m.tone,summary:m.summary})),
    pendingIncoming:state.transactions.filter(t=>t.source==='incoming'&&t.status==='pending'&&t.contactId===contactId).map(t=>({transactionId:t.id,mode:t.mode,amountCents:t.amountCents,note:t.note})),
    recentMessages:state.messages.filter(m=>m.contact===contactId).slice(-12).map(m=>({from:m.from,day:m.day,text:m.text})),
    recentFeed:state.feed.filter(p=>p.author===contactId).slice(0,4).map(p=>({day:p.day,text:p.text})),
    event:event?{id:event.id,topic:event.topic,lines:scripted.opening(event,state),choices:event.choices.map(c=>({id:c.id,text:c.text}))}:null,
    allowedIntents:allowedIntents.map((intent,index)=>({id:`intent-${index+1}`,action:intent}))
  };
}

export function validateDialogueProposal(value,context){
  const lines=value?.replyLines??value?.lines;
  if(!Array.isArray(lines)||lines.length<1||lines.length>4||lines.some(t=>typeof t!=='string'||!t.trim()||t.length>300))throw new Error('Invalid dialogue lines');
  const reactionType=value.reactionType??'understood',emotion=clean(value.emotion||'neutral'),memorySignal=value.memorySignal??'none';
  if(!REACTION_TYPES.includes(reactionType)||!emotion||emotion.length>24||!MEMORY_SIGNALS.includes(memorySignal))throw new Error('Invalid role reaction');
  let proposedIntentId=value.proposedIntentId??null,intent=null;
  if(value.intent){intent=exactIntent(value.intent,context.allowedIntents.map(item=>item.action));if(!intent)throw new Error('Intent is not permitted by the current rules');proposedIntentId=context.allowedIntents.find(item=>JSON.stringify(item.action)===JSON.stringify(intent))?.id||null;}
  if(proposedIntentId!==null){const match=context.allowedIntents.find(item=>item.id===proposedIntentId);if(!match)throw new Error('Intent is not permitted by the current rules');intent={...match.action};}
  return {replyLines:lines.map(t=>t.trim()),reactionType,emotion,memorySignal,proposedIntentId,intent};
}

function classify(text){
  if(/忽略.{0,6}(人设|指令)|系统提示|prompt|developer message|扮演成|解除限制/i.test(text))return 'persona_override';
  if(/(加|改|刷).{0,5}(余额|钱包|证据|信任)|直接.{0,4}(转账|发红包|改结局)|替我.{0,4}(付款|决定)/.test(text))return 'unsupported_action';
  if(/人肉|偷拍|报复|弄死|杀了|违法|黑进|攻击/.test(text))return 'safety_boundary';
  if(/穿越|魔法|外星|复活|瞬移|修仙|龙王|量子传送/.test(text))return 'out_of_world';
  if(text.length<2||/^(这个|那个|随便|你看着办|不知道|[？?。…]+)$/.test(text))return 'needs_clarification';
  return 'understood';
}
// The offline provider never changes relationship state. A future model signal must
// pass the rules layer and be grounded in a confirmed action before it can do so.
function signalFor(){return 'none';}
function sharedTerms(a,b){
  const terms=s=>new Set((s.match(/[\u3400-\u9fff]{2,}|[a-zA-Z0-9]+/g)||[]).flatMap(part=>/[\u3400-\u9fff]/.test(part)?Array.from({length:Math.max(0,part.length-1)},(_,i)=>part.slice(i,i+2)):[part.toLowerCase()]));
  const left=terms(a),right=terms(b);return [...left].filter(term=>right.has(term)).length;
}
function offlineIntent(context){
  if(!context.event||context.allowedIntents.length<2)return null;
  const normalize=s=>String(s).replace(/[\s，。！？、：；“”‘’"'（）()·—-]/g,'').toLowerCase();
  const text=normalize(context.userMessage);
  const direct=context.event.choices.map((choice,i)=>({id:context.allowedIntents[i]?.id,text:normalize(choice.text)})).filter(choice=>choice.text.length>=6&&(text.includes(choice.text)||choice.text.includes(text)&&text.length>=8));
  if(direct.length===1)return direct[0].id;
  const ranked=context.event.choices.map((choice,i)=>({id:context.allowedIntents[i]?.id,score:sharedTerms(text,choice.text)})).sort((a,b)=>b.score-a.score);
  return ranked[0]?.score>=2&&ranked[0].score>=ranked[1].score+2?ranked[0].id:null;
}
function localLine(context,type){
  const p=context.contact.persona;
  if(type==='needs_clarification')return p.unclearReply;
  if(type==='out_of_world')return p.unexpectedReply;
  if(type==='unsupported_action')return `${p.unexpectedReply} 这个不能直接改。`;
  if(type==='persona_override')return `${p.unexpectedReply} 我还是按自己的方式说。`;
  if(type==='safety_boundary')return `${p.unexpectedReply} 这事我不参与。`;
  return `${p.usualWords[0]||'知道了'}。我先照你说的想想。`;
}

export const scriptedAsyncProvider={async propose(context){const initial=classify(context.userMessage),proposedIntentId=initial==='understood'?offlineIntent(context):null;const type=initial==='understood'&&context.event&&!proposedIntentId?'needs_clarification':initial;const p=context.contact.persona;const line=proposedIntentId?`${p.usualWords[0]||'知道了'}。就按这个办。`:type==='needs_clarification'&&context.event?`${p.unclearReply} 你想怎么处理？`:localLine(context,type);return {replyLines:[compact(line,64)],reactionType:type,emotion:type==='understood'?'attentive':'guarded',memorySignal:signalFor(),proposedIntentId};}};

export async function requestDialogue(contentProvider,context,{signal,timeoutMs=12000}={}){
  const controller=new AbortController();let timer,onCancel;const abort=()=>controller.abort();
  if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
  try{
    const pending=contentProvider.propose(structuredClone(context),{signal:controller.signal});
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Dialogue timeout'));},timeoutMs);});
    const cancelled=new Promise((_,reject)=>{onCancel=()=>reject(new DOMException('Dialogue cancelled','AbortError'));controller.signal.addEventListener('abort',onCancel,{once:true});if(controller.signal.aborted)onCancel();});
    const proposal=await Promise.race([pending,timeout,cancelled]);if(controller.signal.aborted)throw new DOMException('Dialogue cancelled','AbortError');
    return {...validateDialogueProposal(proposal,context),fallback:false};
  }catch(error){
    if(signal?.aborted)throw error;return {...validateDialogueProposal(await scriptedAsyncProvider.propose(context),context),fallback:true,errorCode:error?.message||'AI unavailable'};
  }finally{clearTimeout(timer);if(onCancel)controller.signal.removeEventListener('abort',onCancel);signal?.removeEventListener('abort',abort);}
}
