/**
 * Optional future AI seam. This file is intentionally not imported by v0.1.
 * Put model credentials on your own backend; never embed a key in this H5.
 */
export function createRemoteDialogueClient({endpoint}) {
  const url=new URL(endpoint,location.href);
  if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('AI endpoint must use HTTPS');
  return {
    async propose({publicState,event,allowedChoiceIds,signal}) {
      const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({schema:'game004.dialogue.v1',publicState,event,allowedChoiceIds}),signal});
      if(!response.ok)throw new Error(`AI service returned ${response.status}`);
      const data=await response.json();
      if(!Array.isArray(data.lines)||data.lines.length<1||data.lines.length>4||data.lines.some(line=>typeof line!=='string'||line.length>240))throw new Error('Invalid dialogue proposal');
      if(data.intent&&(!allowedChoiceIds.includes(data.intent.choiceId)||data.intent.eventId!==event.id))throw new Error('Invalid AI intent');
      return {lines:data.lines,intent:data.intent||null};
    },
  };
}
