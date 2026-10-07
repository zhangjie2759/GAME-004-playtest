import {validateDialogueProposal} from './dialogue-provider.mjs';

/** The browser calls a user-owned proxy; it never receives a model API key. */
export function createRemoteDialogueClient(config){
  const url=new URL(config.dialogueEndpoint);
  if(url.protocol!=='https:'||url.username||url.password||url.hash||url.search)throw new Error('AI dialogue endpoint must be a credential-free HTTPS URL');
  return {async propose(context,{signal}={}){
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(context),signal,credentials:'omit',cache:'no-store'});
    if(!response.ok)throw new Error(`AI service returned ${response.status}`);
    return validateDialogueProposal(await response.json(),context);
  }};
}
