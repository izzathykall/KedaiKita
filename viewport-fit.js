/* KedaiKita V57 — Device viewport fitting.
 * Scale the EXISTING game (no reordering or layout redesign).
 * Use measured pixel heights instead of CSS calc(dvh / zoom): this works
 * reliably on Safari/iOS PWA, Chrome and desktop fullscreen.
 */
(()=>{
 'use strict';
 const app=document.getElementById('gameApp');
 if(!app)return;
 const root=document.documentElement;
 const body=document.body;
 const visual=window.visualViewport;
 const MAX_WIDTH=1800;
 const MIN_SCALE=0.75;
 const EPSILON=0.003;
 let pending=0,active=false;
 let lastBodyClass=body.className;
 app.classList.add('game-viewport-fit');

 function screen(){
  // Prefer the layout viewport for stable PWA/fullscreen geometry. When
  // Safari's visible viewport is shorter (dynamic browser chrome), fit it.
  const width=Math.max(1,root.clientWidth||window.innerWidth);
  const layoutH=Math.max(1,root.clientHeight||window.innerHeight);
  const visH=visual?.height||layoutH;
  const height=(visual&&visual.scale===1&&visH<layoutH-2)
   ?Math.max(1,Math.min(layoutH,visH+Math.max(0,visual.offsetTop||0)))
   :layoutH;
  return {width,height,layoutH};
 }
 function apply(zoom,height){
  const s=Math.max(MIN_SCALE,Math.min(1,zoom));
  app.style.setProperty('--game-zoom',String(Math.round(s*10000)/10000));
  app.style.setProperty('--game-layout-height',Math.max(1,Math.floor((height-0.5)/s))+'px');
  app.style.setProperty('--game-max-width',Math.round(MAX_WIDTH/s)+'px');
  return s;
 }
 function visible(el){
  return el&&getComputedStyle(el).display!=='none';
 }
 function measure(){
  const origin=app.getBoundingClientRect().top;
  const gameStyle=getComputedStyle(app);
  const bottomPad=parseFloat(gameStyle.paddingBottom)||0;
  let bottom=Math.max(app.scrollHeight,app.clientHeight);
  let right=Math.max(app.scrollWidth,app.clientWidth);
  // Include actual bottom edges: flex and grid descendants can visibly
  // overflow their parents while document scrolling is disabled.
  const children=['.topbar','.utility-bar','.operations-bar','.mobile-tabs',
   '.game-grid','.work-area','.store-scene','.belt-section','.stations',
   '.shift-footer','.pos-panel','.pos-foot'];
  for(const selector of children){
   const el=app.querySelector(selector);
   if(!visible(el))continue;
   const rect=el.getBoundingClientRect();
   const localBottom=rect.bottom-origin;
   bottom=Math.max(bottom,localBottom+bottomPad);
   // Only treat horizontal overflow from main structural panels as a limit.
   if(['.game-grid','.work-area','.pos-panel','.stations'].includes(selector)){
    const localRight=rect.right-app.getBoundingClientRect().left;
    right=Math.max(right,localRight);
   }
  }
  return {width:right,height:bottom};
 }
 function fit(){
  pending=0;
  if(active)return;
  if(document.activeElement?.matches('input,textarea,[contenteditable="true"]'))return;
  const viewport=screen();
  // Portrait is a readable, vertically scrollable counter followed by receipt.
  if(window.matchMedia('(orientation: portrait)').matches){
   app.classList.remove('game-tight');app.dataset.fitOverflow='false';
   apply(1,viewport.height);return;
  }
  // A keyboard opening is not a change of the game's available layout.
  if(visual&&visual.height<viewport.layoutH*.64&&document.activeElement?.isContentEditable)return;
  active=true;
  const paymentView=body.classList.contains('view-payment')&&viewport.width<=760;
  try{
   // Calculate in the counter layout even if the mobile user is looking at
   // the receipt. The same zoom is then retained across BOTH tabs.
   if(paymentView)body.classList.remove('view-payment');
   app.removeAttribute('data-fit-overflow');
   app.classList.remove('game-tight');
   apply(1,viewport.height);
   let natural=measure();
   // Compress empty spacing before reducing text/control size.
   if(Math.min(viewport.height/natural.height,viewport.width/natural.width)<0.9){
    app.classList.add('game-tight');natural=measure();
   }
   const heightFactor=(viewport.height-1)/Math.max(1,natural.height);
   const widthFactor=(viewport.width-1)/Math.max(1,natural.width);
   let zoom=Math.min(1,heightFactor,widthFactor);
   if(!Number.isFinite(zoom))zoom=1;
   zoom=apply(zoom,viewport.height);
   // Second verification catches flex/grid overflow that changes once the
   // available unscaled vertical space grows after zooming out.
   const bottomMargin=1;
   for(let i=0;i<2;i++){
    let over=0;
    const appRect=app.getBoundingClientRect();
    const selectors=['.shift-footer','.pos-foot','.stations','.game-grid'];
    for(const selector of selectors){
     const el=app.querySelector(selector);
     if(!visible(el))continue;
     over=Math.max(over,el.getBoundingClientRect().bottom-(viewport.height-bottomMargin));
    }
    over=Math.max(over,appRect.bottom-viewport.height);
    if(over<=1)break;
    const corrected=Math.max(MIN_SCALE,zoom*((viewport.height-bottomMargin)/(viewport.height+over)));
    if(zoom-corrected<EPSILON)break;
    zoom=apply(corrected,viewport.height);
   }
   // On unusually small windows keep controls readable and reachable instead
   // of shrinking the entire game to 20% or clipping the bottom controls.
   const overflow=app.scrollHeight>app.clientHeight+2||app.scrollWidth>app.clientWidth+2;
   app.dataset.fitOverflow=String(overflow&&zoom<=MIN_SCALE+EPSILON);
  }finally{
   if(paymentView)body.classList.add('view-payment');
   active=false;
  }
 }
 function schedule(){if(active)return;if(!pending)pending=requestAnimationFrame(fit)}
 // Resize of a mobile browser's address bar, split-screen iPad, PWA,
 // desktop window, or fullscreen should all recompute the physical fit.
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('orientationchange',schedule,{passive:true});
 window.addEventListener('pageshow',schedule);
 document.addEventListener('fullscreenchange',schedule);
 visual?.addEventListener('resize',schedule,{passive:true});
 visual?.addEventListener('scroll',schedule,{passive:true});
 document.addEventListener('focusout',()=>setTimeout(schedule,180),{passive:true});

 if(typeof ResizeObserver==='function'){
  const observer=new ResizeObserver(()=>{if(!active)schedule()});
  for(const selector of ['.topbar','.utility-bar','.operations-bar',
    '.mobile-tabs','.stations','.shift-footer','.pos-top']){
   const el=app.querySelector(selector);if(el)observer.observe(el);
  }
 }
 const watcher=new MutationObserver((records)=>{
  if(active)return;
  const changed=records.some(r=>{
   if(r.target!==body)return true;
   if(body.className===lastBodyClass)return false;
   lastBodyClass=body.className;return true;
  });
  if(changed)schedule();
 });
 watcher.observe(app,{childList:true,subtree:false});
 watcher.observe(body,{attributes:true,attributeFilter:['class']});
 if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
 window.addEventListener('load',schedule,{once:true});
 // Fonts/icons can arrive after the first layout frame.
 schedule();setTimeout(schedule,300);setTimeout(schedule,1000);
})();
