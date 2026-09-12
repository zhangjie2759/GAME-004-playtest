import {validateDialogueProposal} from './dialogue-provider.mjs';

/** Optional future API client; not imported by app.mjs. Credentials stay on a backend. */
export function createRemoteDialogueClient({endpoint}){
  const url=new URL(endpoint);
  if(url.username||url.password||!(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname))))throw new Error('Use a credential-free HTTPS endpoint');
  return {
    async propose(context,{signal}={}){
      const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(context),signal,credentials:'omit'});
      if(!response.ok)throw new Error('AI service returned '+response.status);
      return validateDialogueProposal(await response.json(),context);
    }
  };
}
