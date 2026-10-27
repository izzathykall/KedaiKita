// Cache the public game shell separately from private Firebase account data.
export function prepareOfflineGame(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
 const register=()=>navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
  const announce=()=>{const label=document.getElementById('offlineStatus');if(label){label.textContent='Sedia dimainkan offline';label.title='Fail permainan tersedia pada peranti ini. Progres akaun disegerakkan apabila internet kembali.'}};
  if(reg.active)announce();
  const track=worker=>worker?.addEventListener('statechange',()=>{if(worker.state==='activated')announce()});
  track(reg.installing);reg.addEventListener('updatefound',()=>track(reg.installing));
 }).catch(()=>{const label=document.getElementById('offlineStatus');if(label)label.textContent='Cache offline belum tersedia'});
 register();window.addEventListener('online',register);
}
prepareOfflineGame();
