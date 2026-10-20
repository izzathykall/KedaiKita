/* KedaiKita V41: proportionally fit the existing game layout into the
 * physical viewport. Do not reflow/reorder game controls or payment panels. */
(()=>{
 'use strict';
 const app=document.getElementById('gameApp');
 if(!app)return;
 app.classList.add('game-viewport-fit');
 const root=document.documentElement;
 let frame=0,previous=1,inFit=false;
 const round=x=>Math.round(x*10000)/10000;
 function fit(){
  frame=0;
  if(inFit)return;
  // Do not downscale an open keyboard overlay: those live outside the game.
  if(document.activeElement?.matches('input,textarea,[contenteditable="true"]'))return;
  // Keep the same physical zoom when moving between Kaunter and Resit tabs.
  if(window.innerWidth<=760&&document.body.classList.contains('view-payment'))return;
  inFit=true;
  try{
   app.style.setProperty('--game-zoom','1');
   const viewportHeight=root.clientHeight||window.innerHeight;
   const appBox=app.getBoundingClientRect();
   // Scroll height reveals clipped children (the counter minimum height,
   // stations, footer and nav), even when overflow is hidden on body.
   let contentHeight=Math.max(app.scrollHeight,app.clientHeight);
   const work=app.querySelector('.work-area');
   const grid=app.querySelector('.game-grid');
   if(work&&grid&&getComputedStyle(work).display!=='none'){
    const wr=work.getBoundingClientRect();
    contentHeight=Math.max(contentHeight,wr.bottom-appBox.top+(parseFloat(getComputedStyle(app).paddingBottom)||0));
   }
   if(grid)contentHeight=Math.max(contentHeight,grid.getBoundingClientRect().bottom-appBox.top+(parseFloat(getComputedStyle(app).paddingBottom)||0));
   // Keep full sharpness when the canvas already fits. Scale only when
   // clipping exceeds normal subpixel rounding (typically 1–2px).
   const target=contentHeight<=viewportHeight+2?1:
    round(Math.max(0.32,(viewportHeight-1)/Math.max(1,contentHeight))); 
   if(Math.abs(target-previous)>.001){previous=target}
   app.style.setProperty('--game-zoom',String(target));
  }finally{inFit=false}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(fit)}
 schedule();
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 document.addEventListener('fullscreenchange',schedule);
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 // Observe natural-height changes due to content loading and available space.
 for(const selector of ['.topbar','.utility-bar','.operations-bar','.mobile-tabs','.stations','.shift-footer']){
  const el=app.querySelector(selector);if(el)observer?.observe(el);
 }
 document.addEventListener('focusout',()=>setTimeout(schedule,200),{passive:true});
 // The game moves controls into the operations bar after app.mjs loads.
 const watcher=new MutationObserver(schedule);
 watcher.observe(app,{childList:true,subtree:false});
 watcher.observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('load',schedule,{once:true});
 setTimeout(schedule,350);
 setTimeout(schedule,1200);
})();
