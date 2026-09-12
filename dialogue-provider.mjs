import {activeEvent,contactById} from './engine.mjs';
import {provider as scripted,scenarioFor,PERSONAS} from './content.mjs';

/**
 * Public asynchronous content seam. Only returns text and a permitted intent.
 * The UI remains scripted in v0.2; an API key never belongs in this module.
 */
export function buildDialogueContext(state,contactId,moneyDraft=null){
  const contact=contactById(state,contactId);if(!contact)throw new Error('Unknown contact');
  const scenario=scenarioFor(state.routeId),current=activeEvent(state);
  const event=current?.contact===contactId?current:null;
  const identity=PERSONAS.find(p=>p.id===state.player.identityPresetId);
  const allowedIntents=event?event.choices.map(c=>({type:'CHOOSE',eventId:event.id,choiceId:c.id})):[];
  // Only a draft explicitly confirmed by a player may appear here. Dispatch still validates it.
  if(moneyDraft?.contactId===contactId&&moneyDraft.type==='SETTLE_INCOMING_MONEY')allowedIntents.push({type:'SETTLE_INCOMING_MONEY',transactionId:moneyDraft.transactionId,decision:moneyDraft.decision,clientActionId:moneyDraft.clientActionId});
  else if(moneyDraft?.contactId===contactId)allowedIntents.push({type:'SEND_MONEY',mode:moneyDraft.mode,contactId,amountCents:moneyDraft.amountCents,note:moneyDraft.note||'',clientActionId:moneyDraft.clientActionId});
  return {
    schema:'game004.dialogue.v3',routeId:state.routeId,
    player:{title:state.player.title,role:scenario.role,identityPresetId:identity.id,identityTags:[identity.label,identity.tag]},
    contact:{id:contact.id,displayName:contact.displayName,role:contact.role,personality:contact.personality,identityTags:[...contact.identityTags]},
    publicState:{day:state.day,company:scenario.company,project:scenario.project,dayTitle:scenario.days[state.day-1]},
    publicMemories:state.memories.filter(m=>m.contactId===contactId).slice(-6).map(m=>({day:m.day,tone:m.tone,summary:m.summary})),
    pendingIncoming:state.transactions.filter(t=>t.source==='incoming'&&t.status==='pending'&&t.contactId===contactId).map(t=>({transactionId:t.id,mode:t.mode,amountCents:t.amountCents,note:t.note})),
    recentMessages:state.messages.filter(m=>m.contact===contactId).slice(-12).map(m=>({from:m.from,day:m.day,text:m.text})),
    event:event?{id:event.id,topic:event.topic,lines:scripted.opening(event,state),choices:event.choices.map(c=>({id:c.id,text:c.text}))}:null,
    allowedIntents
  };
}

export function validateDialogueProposal(value,context){
  if(!value||!Array.isArray(value.lines)||value.lines.length<1||value.lines.length>4||value.lines.some(t=>typeof t!=='string'||!t.trim()||t.length>300))throw new Error('Invalid dialogue lines');
  const intent=value.intent??null;
  if(intent){
    const keys=Object.keys(intent).sort();
    const permitted=context.allowedIntents.some(a=>JSON.stringify(Object.keys(a).sort())===JSON.stringify(keys)&&keys.every(k=>a[k]===intent[k]));
    if(!permitted)throw new Error('Intent is not permitted by the current rules');
  }
  return {lines:[...value.lines],intent:intent?{...intent}:null};
}

export const scriptedAsyncProvider={
  async propose(context){
    return {lines:context.event?.lines?.slice(-4)||['消息我看到了。具体的事，我们按当前安排继续。'],intent:null};
  }
};

export async function requestDialogue(contentProvider,context,{signal,timeoutMs=8000}={}){
  const controller=new AbortController();let timer;
  const abort=()=>controller.abort();
  if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
  try{
    const pending=contentProvider.propose(structuredClone(context),{signal:controller.signal});
    const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Dialogue timeout'));},timeoutMs);});
    const proposal=await Promise.race([pending,timeout]);
    if(controller.signal.aborted)throw new Error('Dialogue cancelled');
    return {...validateDialogueProposal(proposal,context),fallback:false};
  }catch(error){
    if(signal?.aborted)throw error;
    return {...await scriptedAsyncProvider.propose(context),fallback:true};
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
