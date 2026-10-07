import {validateDialogueProposal} from './dialogue-provider.mjs';

function retryDelay(signal,ms=650){
  return new Promise((resolve,reject)=>{
    if(signal?.aborted){reject(new DOMException('Dialogue cancelled','AbortError'));return;}
    let timer;
    const cancel=()=>{clearTimeout(timer);reject(new DOMException('Dialogue cancelled','AbortError'));};
    const done=()=>{signal?.removeEventListener('abort',cancel);resolve();};
    timer=setTimeout(done,ms);
    signal?.addEventListener('abort',cancel,{once:true});
  });
}

/** The browser calls a user-owned proxy; it never receives a model API key. */
export function createRemoteDialogueClient(config){
  const url=new URL(config.dialogueEndpoint);
  if(url.protocol!=='https:'||url.username||url.password||url.hash||url.search)throw new Error('AI dialogue endpoint must be a credential-free HTTPS URL');
  return {async propose(context,{signal}={}){
    let lastError;
    for(let attempt=0;attempt<2;attempt++){
      try{
        const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(context),signal,credentials:'omit',cache:'no-store'});
        if(!response.ok){const error=new Error(`AI service returned ${response.status}`);error.status=response.status;throw error;}
        return validateDialogueProposal(await response.json(),context);
      }catch(error){lastError=error;if(signal?.aborted||attempt||![502,503,504].includes(error.status))throw error;await retryDelay(signal,config.retryDelayMs??650);}
    }
    throw lastError;
  }};
}
