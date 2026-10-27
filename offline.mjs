// Cache the public game shell separately from private Firebase account data.
export function prepareOfflineGame(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
 const register=()=>navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
  const announce=()=>{document.documentElement.dataset.offlineReady='true'};
  if(reg.active)announce();
  const track=worker=>worker?.addEventListener('statechange',()=>{if(worker.state==='activated')announce()});
  track(reg.installing);reg.addEventListener('updatefound',()=>track(reg.installing));
 }).catch(()=>{document.documentElement.dataset.offlineReady='false'});
 register();window.addEventListener('online',register);
}
prepareOfflineGame();
