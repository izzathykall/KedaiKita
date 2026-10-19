import {createDelivery} from './delivery.mjs?v=2026-10-20-v34-file8-clean-catalog-art';
import {PRODUCTS,PEOPLE,UPGRADES,DENOMS,money,itemPrice,basketTotal,amountDue,dayTarget,normalCustomerCount,createProgress,restoreProgress,makeCustomer,tipFor,buyUpgrade,netTotal,applyCoupon,dailyMissions,claimMission,calculateExpression,CATEGORIES,availableProducts,unlockCategory,randomManualCode,dayFinished,changeParts,machineTimings,effectiveRushMachineUpgrades,availablePaymentMethods,tenderFor,ensureOperations,stockQuote,buyStock,MAX_STOCK_PURCHASE,LOW_STOCK_UNITS,stockForBasket,takeStock,stockUnits,stockTarget,stockCapacity,stockCost,wholesaleChange,payStoreCost,receiveStoreCash,ensureShift,loseStar,settleShift,arrivalWait,clockText,customerLine,PAPER_PACK,PAPER_COST,CARD_REPAIR_COST,cardRepairCost,returnPolicy,returnMatches,rushHourActive,rushHourMultiplier,rushHourProfitBonus,shouldStartRushHour,startRushHour,tickRushHour,RUSH_DURATION_SECONDS,RUSH_PATIENCE_SECONDS} from './engine.mjs?v=2026-10-20-v34-file8-clean-catalog-art';
import {productArt,moneyArt} from './art.mjs?v=2026-10-20-v34-file8-clean-catalog-art';
import {createCloudSync} from './cloud.mjs?v=2026-10-20-v34-file8-clean-catalog-art';

const $=id=>document.getElementById(id);
const ICONS={basket:'M3 9h18l-2 11H5L3 9ZM8 9l4-7 4 7M8 13v3m4-3v3m4-3v3',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',shop:'M3 10V5h18v5M4 10v11h16V10M2 10a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M9 21v-7h6v7',volume:'M11 4 6 8H2v8h4l5 4V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',mute:'M11 4 6 8H2v8h4l5 4V4Zm5 5 6 6m0-6-6 6',expand:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',pause:'M8 4v16m8-16v16',scan:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M6 12h12M7 9v6m3-6v6m4-6v6m3-6v6',scale:'M6 7h12l3 14H3L6 7Zm3 0V5a3 3 0 0 1 6 0v2m-3 4v5m-2-2h4',arrow:'M4 12h16m-6-6 6 6-6 6',heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',flag:'M5 21V3m0 0c5-3 9 3 14 0v10c-5 3-9-3-14 0',receipt:'M5 3h14v19l-3-2-4 2-4-2-3 2V3Zm3 5h8m-8 4h8m-8 4h5',lock:'M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4',card:'M2 5h20v14H2V5Zm0 5h20M6 15h4',qr:'M3 3h6v6H3V3Zm12 0h6v6h-6V3ZM3 15h6v6H3v-6Zm12 0h3v3h3v3h-6v-6Zm6-3v3M12 3v3m0 6v3M3 12h6m3 6v3',cash:'M2 5h20v14H2V5Zm10 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM5 8h1m12 8h1',check:'M5 12l4 4L19 6',close:'M6 6l12 12M6 18 18 6',play:'m8 4 12 8-12 8V4Z',snow:'M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4m13 9-4 1 1 4M4 14l4 1-1 4m13-9-4-1 1-4',delivery:'M7 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM9 19h7l2-5-2-5h-4l-3 5H5l-2 5h2m5-5h5m-5-5h4M5 7h4m-6 3h6',spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z',undo:'M8 4 3 9l5 5M3 9h10a7 7 0 0 1 0 14',reset:'M4 8a9 9 0 1 1-1 8M4 3v5h5',help:'M9 8a3 3 0 1 1 5 2c-1 1-2 1-2 4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z'};
function icon(name){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]||ICONS.spark}"/></svg>`}
function icons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon))}
function avatar(p,variant=0){const scarf=p.scarf,glasses=p.glasses;return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg"><ellipse cx="101" cy="231" rx="77" ry="8" fill="#36614c" opacity=".12"/><path d="M24 239v-41q4-43 53-48h46q48 4 52 48v41" fill="${p.shirt}"/><path d="M34 205q3-26 16-35M166 206q-3-25-16-35" stroke="#173f37" opacity=".1" stroke-width="3" fill="none"/><path d="M79 138v25q21 22 42 0v-25" fill="${p.skin}"/><path d="M79 144q21 19 42 0v12q-22 17-42 0" fill="#000" opacity=".06"/>${scarf?`<path d="M40 158Q26 76 50 46q19-29 50-28 51 0 62 46 13 43-4 94l-21 42-35-30-36 28Z" fill="${p.scarfColor||'#7b6d79'}"/><path d="M45 100q-7 43 18 62l39 8 32-18 20-55-54-47Z" fill="${p.scarfColor||'#92828e'}"/>`:p.hat==='songkok'?'<path d="M54 78V33q46-16 92 0v45Z" fill="#243a36"/>':`<path d="M54 104Q35 39 80 28q50-23 68 24 9 16 0 53Z" fill="${p.hair}"/>`}${scarf?'':`<ellipse cx="56" cy="106" rx="9" ry="13" fill="${p.skin}"/><ellipse cx="145" cy="106" rx="9" ry="13" fill="${p.skin}"/>`}<path d="M57 78q0-34 43-34 44 0 44 34v38q-4 39-43 43-39-4-44-43Z" fill="${p.skin}"/>${scarf?`<path d="M54 84q4-44 46-44 43 0 47 43-21-4-47-32-12 23-46 33" fill="${p.scarfColor||'#7b6d79'}"/><path d="M55 98q-4-43 24-56-10 37-24 56m90 0q4-43-23-56 9 37 23 56" fill="${p.scarfColor||'#7b6d79'}"/><path d="m53 131 48 39 45-36-13 42-31 21-35-18Z" fill="${p.scarfColor||'#7b6d79'}"/><path d="m73 159 29 17 27-17" stroke="#a89ba6" fill="none" stroke-width="2"/>`:p.hat==='songkok'?'<path d="M52 82Q100 72 148 82V37Q100 25 52 37Z" fill="#263c39"/>':`<path d="M55 82q-10-38 27-46 30-19 57 7 12 9 7 39-11-8-17-30-23 27-74 30" fill="${p.hair}"/><path d="M69 49q23 3 42-8" stroke="#fff" stroke-opacity=".1" stroke-width="5" fill="none"/>`}<path d="m72 94 14-2m28 0 14 2" stroke="${p.hair}" stroke-width="3" stroke-linecap="round"/><g class="eye"><ellipse cx="80" cy="106" rx="3" ry="4" fill="#313738"/><ellipse cx="121" cy="106" rx="3" ry="4" fill="#313738"/><circle cx="81" cy="105" r=".8" fill="white"/><circle cx="122" cy="105" r=".8" fill="white"/></g><path d="m99 108-3 12h7" stroke="#875737" opacity=".35" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="71" cy="121" rx="8" ry="4" fill="#d88372" opacity=".3"/><ellipse cx="131" cy="121" rx="8" ry="4" fill="#d88372" opacity=".3"/><path class="customer-mouth" d="M89 132q12 11 24-1" fill="#fff4e4" stroke="#9d6250" stroke-width="2" stroke-linecap="round"/>${glasses?'<g fill="none" stroke="#494c48" stroke-width="2.5"><rect x="65" y="97" width="29" height="20" rx="7"/><rect x="108" y="97" width="29" height="20" rx="7"/><path d="M94 104q7-4 14 0M65 102l-9-2m81 2 8-2"/></g>':''}${!scarf?`<path d="m79 160 21 17 22-17-8 31-14-14-14 14Z" fill="#fff" opacity=".35"/><path d="M100 178v61" stroke="#173f37" opacity=".12" stroke-width="2"/><circle cx="106" cy="202" r="2" fill="#fff" opacity=".45"/>`:''}<g class="customer-hands"><path d="M35 223q15-16 28-6l22 7 27-3 5 12-38 7-26-5Z" fill="${p.skin}"/><path d="m165 223-23-9-29 9-7 13 33 4 26-5" fill="${p.skin}"/><path d="M32 215h20v24H29m122-24h19l2 24h-21" fill="${p.shirt}"/></g><rect x="124" y="188" width="25" height="13" rx="3" fill="#fff" opacity=".4"/><path d="M129 193h14m-14 4h9" stroke="#173f37" opacity=".15" stroke-width="2"/>${avatarDetails(p)}${p.id==='rider-kita-food'?`<g class="kita-food-uniform"><rect x="113" y="184" width="42" height="25" rx="5" fill="#f2f9e8" stroke="#a0cdb3" stroke-width="2"/><text x="134" y="194" text-anchor="middle" font-size="8" font-weight="900" font-family="sans-serif" fill="#217753">KITA</text><text x="134" y="203" text-anchor="middle" font-size="8" font-weight="900" font-family="sans-serif" fill="#217753">FOOD</text></g>`:''}${p.id==="person-izzat"?`<g><path d="M42 185l31-23 20 26-22 24Z" fill="#273e4e"/><path d="M127 167l28 20-9 27-25-23Z" fill="#273e4e"/><path d="M92 174l8 14 8-14-8-9Z" fill="#d0a05a"/><rect x="129" y="187" width="21" height="13" rx="2" fill="#e9f0ec" stroke="#587f83"/><path d="M133 192h13m-13 4h9" stroke="#5a8987" stroke-width="1.5"/></g>`:p.id==="person-sakinah"?`<g><path d="M29 205q5-33 30-38l23 30-8 42H24Z" fill="#343d4d"/><path d="M171 205q-5-33-30-38l-23 30 8 42h50Z" fill="#343d4d"/><path d="M84 179l17 14 17-14-17 28Z" fill="#f8f2e9"/><path d="M99 199v25" stroke="#aa8666" stroke-width="2"/><rect x="129" y="187" width="23" height="12" rx="2" fill="#dfbc6e"/><rect x="133" y="190" width="15" height="2" rx="1" fill="#fff2ce"/></g>`:p.id==="person-wawa"?`<g><path d="M31 195q10-28 44-32l25 30 25-30q34 4 44 32l4 44H27Z" fill="#304e49"/><path d="M80 166l20 28 20-28-20 42Z" fill="#f7eee0"/><path d="M98 197l-5 20 7 11 7-11-5-20Z" fill="#bfa16c"/><rect x="129" y="187" width="23" height="13" rx="2" fill="#f2eee4"/><path d="M133 192h15m-15 4h10" stroke="#49746b" stroke-width="1.5"/></g>`:""}</svg>`}

let bankCardDrag=null;let previewTheme=null;let scaleBuffer=null,scalePromise=null,scaleSource=null;
// The original scale-place.mp3 now belongs to the cash-change drawer.
let drawerSource=null;
let practiceStore=null,resultTimer=null,explicitPause=false;
let paymentMinimized=false,musicUnlocked=false,musicLevel=0,musicTarget=-1,musicFade=null,musicFramePending=false;
let calculatorPosition=null,calculatorDrag=null,musicStarting=false,musicGain=null,musicSource=null,chaChingBuffer=null,chaChingPromise=null,chaChingSource=null;
let renderedBasket=null,renderedSceneCustomer=undefined,selectedCodeItem=null,calculatorInput='',calculatorResult='',advancePending=false;
const STORAGE='kedai-kita-v1';
const APP_BUILD=window.__KEDAI_ACTIVE_VERSION__||'2026-10-20-v34-file8-clean-catalog-art';
const UPDATE_CHECK_URL='./version.json';
let storageOK=true,progress=createProgress(),session=null,phase='scan',customer=null,mode='career',combo=0,busy=false,paused=true,modalKind='intro',cashPicked=[],lastTip=0,lastEarned=0,toastTimer,audioCtx,scannerBuffer=null,scannerBufferPromise=null,scannerSource=null,sound=true,drag=null,scanToken=0;
let updatePrompt=null,updateCheckTimer=null;
let cloud=null,delivery=null,careerSessionCache=null,practiceRunCache=null;
let kitaFoodArrivalTimer=null;
function showKitaFoodAfterArrival(orderId,delayMs=2000){
 clearTimeout(kitaFoodArrivalTimer);
 // Do not reopen on top of another popup, or after a changed customer.
 kitaFoodArrivalTimer=setTimeout(()=>{
  if(customer?.kind==='kitafood'&&customer.orderId===orderId&&phase==='delivery'&&!paused&&!document.getElementById('modal').open)delivery?.resumeOrder(orderId);
 },delayMs);
}
try{const raw=JSON.parse(localStorage.getItem(STORAGE)||'null');if(raw){progress=restoreProgress(JSON.stringify(raw.progress));sound=raw.sound!==false;practiceRunCache=raw.practiceRun?.session?.mode==='practice'?raw.practiceRun:null;careerSessionCache=raw.session||null;if((raw.session?.customer?.items?.length||['waiting','supply','delivery'].includes(raw.session?.phase))&&raw.session.day===progress.day&&raw.session.mode==='career'){session=raw.session;customer=session.customer;phase=['scan','offer','change','success','lost','end','waiting','supply','delivery'].includes(session.phase)?session.phase:'scan';combo=session.combo||0;cashPicked=Array.isArray(session.cashPicked)?session.cashPicked:[];lastTip=session.lastTip||0;lastEarned=session.lastEarned||0}}}catch{storageOK=false}
const freshOperations=ensureOperations(progress);ensureShift(session);ensureStyle();if(session&&!session.dayStart)session.dayStart=JSON.parse(JSON.stringify(progress));if(customer&&!Array.isArray(customer.items)){customer=null;phase='waiting';if(session){session.customer=null;session.phase='waiting';session.waitSeconds=0}}
if(freshOperations&&customer&&!customer.paid){const need={};for(const p of customer.items)need[p.id]=(need[p.id]||0)+stockUnits(p);for(const [id,n] of Object.entries(need))progress.inventory[id]=Math.max(progress.inventory[id],n)}

function captureGame(){
 if(session){
  session.customer=customer;session.phase=phase;session.combo=combo;
  session.cashPicked=cashPicked;session.lastTip=lastTip;session.lastEarned=lastEarned;
 }
 if(mode==='practice'){
  practiceRunCache=session?{session:JSON.parse(JSON.stringify(session)),store:practiceStore?JSON.parse(JSON.stringify(practiceStore)):null}:null;
  return {progress,session:careerSessionCache,practiceRun:practiceRunCache,sound};
 }
 careerSessionCache=session;
 return {progress,session,practiceRun:practiceRunCache,sound};
}

function hydrateGame(data){
 scanToken++;busy=false;advancePending=false;practiceStore=null;paymentMinimized=false;
 mode='career';progress=restoreProgress(JSON.stringify(data?.progress||createProgress()));
 practiceRunCache=data?.practiceRun?.session?.mode==='practice'?data.practiceRun:null;careerSessionCache=data?.session||null;
 sound=data?.sound!==false;session=null;customer=null;phase='scan';combo=0;
 cashPicked=[];lastTip=0;lastEarned=0;renderedBasket=null;renderedSceneCustomer=undefined;
 const saved=data?.session;
 if(saved?.day===progress.day&&saved?.mode==='career'&&(saved.customer?.items?.length||['waiting','supply','end','delivery'].includes(saved.phase))){
  session=saved;customer=saved.customer||null;
  phase=['scan','offer','change','success','lost','end','waiting','supply','delivery'].includes(saved.phase)?saved.phase:'scan';
  combo=saved.combo||0;cashPicked=Array.isArray(saved.cashPicked)?saved.cashPicked:[];
  lastTip=saved.lastTip||0;lastEarned=saved.lastEarned||0;
 }
 ensureOperations(progress);ensureShift(session);ensureStyle();
 if(session&&!session.dayStart)session.dayStart=JSON.parse(JSON.stringify(progress));
 if(customer&&!Array.isArray(customer.items)){customer=null;phase='waiting';if(session){session.customer=null;session.phase='waiting';session.waitSeconds=0}}
 if(customer&&!customer.paid){const needed={};for(const item of customer.items)needed[item.id]=(needed[item.id]||0)+stockUnits(item);
  for(const [id,units] of Object.entries(needed))progress.inventory[id]=Math.max(progress.inventory[id]||0,units)}
 initIllustrations();render();modalKind=null;showIntro();
}
function save(){
 try{
  const data=captureGame();
  if(cloud)cloud.queueSave(data);
  else localStorage.setItem(STORAGE,JSON.stringify(data));
  if(!cloud)$('saveStatus').textContent='Disimpan pada peranti ini';
 }catch{storageOK=false;$('saveStatus').textContent='Simpanan tidak tersedia'}
}

function beep(type='scan'){if(!sound)return;if(type==='scan'){playScannerSound();return}prepareScannerAudio();try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const notes=type==='success'?[523,659,784]:type==='error'?[196,155]:type==='coin'?[880]:type==='start'?[392,523]:[1100];notes.forEach((freq,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.type='sine';o.frequency.value=freq;const start=audioCtx.currentTime+i*.11;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(.19*effectVolume(type),start+.01);g.gain.exponentialRampToValueAtTime(.001,start+.12);o.start(start);o.stop(start+.13)})}catch{}}
function toast(msg,error=false){$('toast').textContent=msg;$('toast').className='toast show'+(error?' error':'');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);if(error)beep('error')}
function applyRushPatience(c){
 if(!c||c.paid||c.rushOriginalPatience!==undefined)return;
 c.rushOriginalPatience=c.patience;
 // Give a customer present when the event begins ten NEW seconds to act.
 c.patience=c.elapsed+RUSH_PATIENCE_SECONDS;
}
function restoreRushPatience(){
 if(customer?.rushOriginalPatience===undefined)return;
 customer.patience=Math.max(customer.elapsed+5,customer.rushOriginalPatience);
 delete customer.rushOriginalPatience;
}
function beginDailyRush(){
 if(mode!=='career'||modalKind==='rush-start'||!shouldStartRushHour(session,progress.day))return false;
 // Do not start Rush Hour in the middle of a return. Let the refund finish first;
 // advance() will offer the Rush Hour popup before the next buying customer.
 if(customer?.kind==='return'&&!['success','lost'].includes(phase))return false;
 // Present a proper modal BEFORE enabling the event; time is frozen until accepted.
 openModal('rush-start',`<div class="modal-pad rush-event-modal"><div class="rush-event-symbol">⚡</div><div class="modal-kicker">CABARAN KHAS · HARI ${progress.day}</div><h2>Rush Hour akan bermula!</h2><p>Dalam 60 saat, pelanggan cuma sabar selama <b>10 saat</b>. Scanner, penimbang dan conveyor menjadi tahap MAX. Untung barang ×${rushHourMultiplier(progress.upgrades).toFixed(1)}, stok dan resit tanpa had.</p><div class="rush-event-stats"><span><b>60s</b><small>Tempoh</small></span><span><b>10s</b><small>Kesabaran</small></span><span><b>×${rushHourMultiplier(progress.upgrades).toFixed(1)}</b><small>Untung</small></span></div><p class="rush-event-hint">Pelanggan Rush Hour tidak dikira dalam sasaran harian.</p><button class="primary-btn rush-event-primary" id="rushEventStart">⚡ Mula Rush Hour</button></div>`);
 $('rushEventStart').onclick=()=>{
  if(!startRushHour(session,progress.day)){closeModal();return;}
  if(customer&&!customer.paid&&customer.kind!=='return'){applyRushPatience(customer);customer.rushUnlimited=true;customer.rushCustomer=true;}
  applyMachineSpeeds();render();save();closeModal();beep('start');
  if(['success','lost'].includes(phase))advance();
  else if(phase==='waiting'){session.waitSeconds=0;newCustomer();}
 };
 return true;
}
function showRushEnd(){
 if(!session?.rushReportPending||session.rushReportShown)return false;
 const count=session.rushServed||0,lost=session.rushLost||0;
 openModal('rush-end',`<div class="modal-pad rush-event-modal"><div class="rush-event-symbol">✦</div><div class="modal-kicker">CABARAN SELESAI</div><h2>Rush Hour tamat!</h2><p>Hebat! Berikut ialah hasil jualan pelanggan semasa Rush Hour hari ini.</p><div class="rush-end-earnings"><small>UNTUNG BERSIH + TIP RUSH HOUR</small><strong>${money(session.rushEarned||0)}</strong></div><div class="rush-event-stats"><span><b>${count}</b><small>Pelanggan dilayan</small></span><span><b>${money(session.rushRevenue||0)}</b><small>Jumlah jualan</small></span><span><b>+${money(session.rushBonus||0)}</b><small>Bonus pengganda</small></span></div>${lost?`<p class="rush-event-hint">${lost} pelanggan Rush Hour tidak sempat dilayan.</p>`:''}<p class="rush-event-hint">Pelanggan Rush Hour tidak menambah sasaran harian. Sambung pelanggan biasa untuk tamat syif.</p><button class="primary-btn rush-event-primary" id="rushEventContinue">Teruskan bermain ${icon('arrow')}</button></div>`);
 $('rushEventContinue').onclick=()=>{session.rushReportPending=false;session.rushReportShown=true;save();closeModal();if(['success','lost'].includes(phase))advance();else if(['waiting','supply'].includes(phase)&&dayFinished(session,progress.day))showSummary()};
 return true;
}
function newSession(selectedMode='career'){if(selectedMode==='practice'&&mode==='career'){const current=captureGame();careerSessionCache=current.session?JSON.parse(JSON.stringify(current.session)):null;}mode=selectedMode;if(mode==='practice')practiceStore=null;session={dayStart:JSON.parse(JSON.stringify(progress)),day:progress.day,mode,served:0,lost:0,totalSales:0,tips:0,earned:0,mistakes:0,index:0,bestCombo:0,weighed:0,scans:0,perfectCash:0,claimedMissions:[],seenPeople:[],rushStarted:false,rushCompleted:false,rushSecondsRemaining:0,rushBonus:0,rushSales:0,rushServed:0,rushLost:0,rushRevenue:0,rushEarned:0,rushReportPending:false,rushReportShown:false};ensureShift(session);combo=0;initIllustrations();newCustomer()}
function newCustomer(){
 ensureShift(session);
 // KitaFood is a true counter visitor: it occupies the regular customer scene
 // and opens its order popup. No separate rider spawning or cash checkout.
 if(mode==='career'&&delivery){
  const arriving=delivery.maybeArrive(session.index);
  if(arriving){
   advancePending=false;paymentMinimized=false;scanToken++;busy=false;cashPicked=[];
   customer={kind:'kitafood',person:delivery.personFor(arriving),orderId:arriving.id,items:[],elapsed:0,patience:99999};
   phase='delivery';renderedBasket=null;renderedSceneCustomer=undefined;
   $('customerArt').className='customer arrive';setMobileView('counter');resetStations();render();save();
   const riderOrderId=arriving.id;
   const arrivingRider=customer;
   setTimeout(()=>{if(customer===arrivingRider){$('customerArt').classList.remove('arrive');requestAnimationFrame(positionCustomerDialogue)}},680);
   showKitaFoodAfterArrival(riderOrderId,2100);return;
  }
 }
 if(mode!=='practice'&&!readyForCustomer()){enterSupplyWait();return}advancePending=false;paymentMinimized=false;scanToken++;busy=false;cashPicked=[];phase='scan';
 session.seenPeople??=[];
 const featuredNames=['person-izzat','person-sakinah','person-wawa'];
 const alreadyFeatured=session.seenPeople.some(id=>featuredNames.includes(id));
 const featuredId=mode==='career'&&!alreadyFeatured?featuredNames[(progress.day-1)%featuredNames.length]:null;
 const rush=mode==='career'&&rushHourActive(progress.day,session);
 const selected=makeCustomer(mode==='practice'?Math.max(2,progress.day):progress.day,session.index,Math.random,{seen:session.seenPeople,forcedPersonId:featuredId,paymentMethods:availablePaymentMethods(progress.upgrades,mode==='practice'),upgrades:effectiveRushMachineUpgrades(progress.upgrades,rush),challenges:mode==='career',unlocked:mode==='practice'?CATEGORIES.map(c=>c.id):progress.unlocked,stock:mode==='practice'||rush?null:progress.inventory});
 if(!selected){session.practiceDay=(session.practiceDay||1)+1;session.seenPeople=[];toast('Syif latihan baharu bermula.');newCustomer();return}
 customer=selected;if(rush){customer.rushUnlimited=true;customer.rushCustomer=true;}applyMachineSpeeds();prepareReturnCustomer();session.seenPeople.push(customer.person.id);
 customer.patience+=(progress.upgrades.comfort||0)*15;
 // Even a level-5 comfort upgrade cannot override the 10-second Rush Hour challenge.
 if(rush)applyRushPatience(customer);
 $('customerArt').className='customer arrive';
 const incomingCustomer=customer;
 setTimeout(()=>{if(customer===incomingCustomer){$('customerArt').classList.remove('arrive');requestAnimationFrame(positionCustomerDialogue)}},650);
 setMobileView('counter');resetStations();render();save();
}
function rushMachinesActive(){
 return mode==='career'&&!!session&&(rushHourActive(progress.day,session)||rushUnlimited());
}
function gameplayMachineUpgrades(){return effectiveRushMachineUpgrades(progress.upgrades,rushMachinesActive())}
// Suasana kedai kekal konsisten sepanjang hari. Hanya kesan Rush Hour
// dan tema gelap/cerah pilihan pemain dibenarkan mengubah paparan.
function syncSceneAtmosphere(){
 document.body.classList.remove('store-golden-hour','store-evening','store-night');
 document.body.classList.toggle('rush-machine-max',rushMachinesActive());
 document.body.classList.toggle('store-rush-active',mode==='career'&&rushHourActive(progress.day,session));
}

function resetStations(){$('scaleItem').innerHTML='';$('scaleItem').dataset.uid='';setScaleReading(null);$('scaleState').textContent='SEDIA';$('scaleZone').classList.remove('stable');$('weightProgress').style.width='0';$('scaleCaption').textContent='Sedia untuk ditimbang';$('scaleZone').classList.remove('weighing','highlight');$('scannerZone').classList.remove('scanning','highlight');$('scannerStatus').textContent='Sedia untuk scan'}
function render(){refreshCalculatorPresets();renderHeader();renderScene();renderProducts();renderReceipt();renderPayment();icons();renderPatience();renderActivity()}
function renderHeader(){renderOperations();renderPaymentAvailability();$('dayLabel').textContent=mode==='practice'?'Latihan':'Hari '+String(progress.day).padStart(2,'0');$('walletLabel').textContent=money(progress.wallet);$('comboLabel').innerHTML='×'+combo+' <span>✦</span>';$('missionText').textContent=mode==='practice'?'Belajar ikut rentak sendiri':dayTarget(progress.day)+' pelanggan hari ini';$('servedLabel').textContent=mode==='practice'?String(session?.served||0)+' siap':normalCustomerCount(session)+' / '+dayTarget(progress.day);$('missionProgress').style.width=(mode==='practice'?0:Math.min(100,normalCustomerCount(session)/dayTarget(progress.day)*100))+'%';$('soundBtn').innerHTML=icon(sound?'volume':'mute');$('soundBtn').classList.toggle('off',!sound);$('soundBtn').setAttribute('aria-label',sound?'Matikan bunyi':'Hidupkan bunyi');$('shopBtn').disabled=mode==='practice';$('missionBtn').classList.toggle('reward-ready',!!session&&dailyMissions(session).some(m=>m.value>=m.target&&!(session.claimedMissions||[]).includes(m.id)));applySettings();syncBackgroundMusic()}
function renderScene(){
 document.body.classList.toggle('waiting-customer',!!session&&!customer);
 if(session&&!customer){document.body.classList.remove('kita-food-at-counter');$('customerArt').style.visibility='hidden';$('customerName').textContent='Kaunter sedia';if($('customerOccupation'))$('customerOccupation').hidden=true;$('customerRole').textContent=phase==='supply'?'Bekalan perlu ditambah':'Waktu lewat · pelanggan makin kurang';$('speech').textContent=phase==='supply'?'Tambah bekalan untuk sambung berniaga.':'Menunggu pelanggan tiba…';return}$('customerArt').style.visibility='';const person=customer?.person||PEOPLE[0];
 if(renderedSceneCustomer!==customer){$('customerArt').innerHTML=avatar(person);renderedSceneCustomer=customer}
 if(!customer)return;
 $('customerName').textContent=person.name;$('customerRole').textContent='';const occupation=$('customerOccupation');if(occupation){occupation.textContent=person.role||'';occupation.hidden=!person.role;}
 $('customerBadge').textContent=person.name.charAt(0);$('customerBadge').style.background=person.shirt+'44';
 $('customerArt').classList.toggle('happy',phase==='success');$('customerArt').classList.toggle('disappointed',phase==='lost');
 $('customerInfo').classList.toggle('vip',customer.kind==='vip');document.body.classList.toggle('kita-food-at-counter',customer.kind==='kitafood');
 $('customerVipBadge').hidden=customer.kind!=='vip';$('customerVipTip').hidden=customer.kind!=='vip';

 $('speech').textContent=customer.kind==='kitafood'?'Hai! Saya rider KitaFood. Pesanan '+customer.orderId+' sudah sedia untuk diambil?':customer.kind==='return'?(customer.returnReason||customerLine(customer,'returns')):phase==='success'?customerLine(customer,lastTip>0?'thanks':'thanksNoTip'):phase==='lost'?'Saya kena pergi dulu. Lain kali ya.':phase==='change'?customerLine(customer,'change'):phase==='offer'?customerLine(customer,customer.method):customer.hasCoupon?'Saya ada kupon 10%. Tolong gunakan diskaun saya ya.':customerLine(customer,'welcome');requestAnimationFrame(positionCustomerDialogue);
}
function renderProducts(){
 const items=customer?.items||(session?[]:PRODUCTS.filter(p=>p.category==='essentials').slice(0,5).map((p,i)=>({...p,uid:String(i),grams:1000})));
 for(const p of items)if(p.damaged&&!/^\d{4}$/.test(p.manualCode||''))p.manualCode=randomManualCode();
 const scanned=items.filter(i=>i.scanned).length;
 $('itemCount').textContent=scanned+' / '+items.length;$('bagCount').textContent=scanned+' barang';$('mobileCount').textContent=scanned;
 $('products').style.setProperty('--slots',5);$('products').classList.remove('many');
 if(renderedBasket!==items){
   $('products').innerHTML=items.map(productHTML).join('');renderedBasket=items;
   $('products').querySelectorAll('.product').forEach(el=>{el.addEventListener('pointerdown',onItemDown);el.addEventListener('click',e=>{if(e.detail===0)processItem(el.dataset.uid)})});
 }
 let slot=0;
 for(const p of items){const el=$('product-'+p.uid);if(!el)continue;
   if(!p.scanned){el.style.setProperty('--slot',slot);el.dataset.slot=String(slot++);el.tabIndex=(window.innerWidth<=760||slot<=5)?0:-1}
   el.classList.toggle('scanned',!!p.scanned);el.classList.toggle('damaged',!!p.damaged&&!p.repaired&&!!p.barcodeFailTriggered);el.classList.remove('busy');el.disabled=!!p.scanned;
   el.setAttribute('aria-label',p.name+', '+(p.scanned?'sudah dalam beg':p.damaged&&!p.repaired&&p.barcodeFailTriggered?'kod manual '+p.manualCode:p.weighted?'tekan untuk timbang':'tekan untuk scan'));
 }
 $('beltHint').textContent=!customer&&session?'Menunggu pelanggan · tiada barang di conveyor':scanned===items.length?'Semua siap. Teruskan bayaran!':slot>5?slot+' barang menunggu · bergerak ke depan automatik':'Scan barang · conveyor bergerak automatik';
 $('undoScanBtn').disabled=!customer||phase!=='scan'||busy||!scanned;
}
function productHTML(p,i){return `<button id="product-${p.uid}" class="product ${p.scanned?'scanned':''}" data-uid="${p.uid}" style="--product-bg:${p.color};--item-index:${i};--slot:${i}" aria-label="${p.name}" ${p.scanned?'disabled':''}><span class="product-illustration">${productArt(p.id)}</span><span class="product-name">${p.name}</span><span class="product-price">${money(p.price)}${p.weighted?'/kg':''}</span><span class="mini-barcode" aria-hidden="true"></span>${p.weighted?'<span class="weight-tag">'+icon('scale')+'</span>':''}<span class="damaged-tag"><small>KOD MANUAL</small>${p.manualCode||''}</span></button>`}
function renderReceipt(){if(customer?.kind==='kitafood'){$('roundingRow')?.remove();$('discountRow')?.remove();$('receiptList').innerHTML='<div class="receipt-empty"><b>KitaFood</b><small>Pembayaran sudah dibuat dalam aplikasi. Sediakan beg pesanan rider.</small></div>';$('receiptQuantity').textContent='(Pesanan rider)';$('subtotal').textContent=money(0);$('total').textContent=money(0);$('receiptSub').textContent='Pesanan prabayar KitaFood';return}if(customer?.kind==='return'){renderReturnReceipt();return}if(!customer){$('receiptList').innerHTML='<div class="receipt-empty">Menunggu pelanggan</div>';$('subtotal').textContent=money(0);$('total').textContent=money(0);$('receiptQuantity').textContent='(0 barang)';$('receiptSub').textContent='Kaunter sedia untuk pelanggan seterusnya.';return}const items=customer.items.filter(i=>i.scanned),subtotal=basketTotal(items),all=items.length===customer.items.length,rounding=all&&customer.method==='cash'?amountDue(customer)-netTotal(customer):0;const old=$('roundingRow');old?.remove();$('discountRow')?.remove();$('receiptList').innerHTML=items.length?items.map(i=>`<div class="receipt-row"><span class="row-emoji">${productArt(i.id)}</span><span class="row-info"><b>${i.name}</b><small>${i.weighted?(i.grams/1000).toFixed(3)+' kg × '+money(i.price)+'/kg':'1 unit × '+money(i.price)}</small></span><strong>${money(itemPrice(i))}</strong></div>`).join(''):`<div class="receipt-empty">${icon('basket')}<b>Barang belum discan</b><small>Tekan barang di conveyor untuk mula.</small></div>`;$('receiptQuantity').textContent='('+items.length+' barang)';$('subtotal').textContent=money(subtotal);if(rounding){const row=document.createElement('div');row.id='roundingRow';row.innerHTML='<span>Pembundaran tunai</span><b>'+(rounding>0?'+':'−')+money(Math.abs(rounding))+'</b>';row.style.marginTop='7px';$('subtotal').parentElement.after(row)}if(all&&customer.discount){const row=document.createElement('div');row.id='discountRow';row.className='discount-row';row.innerHTML='<span>Kupon 10%</span><b>−'+money(customer.discount)+'</b>';$('subtotal').parentElement.after(row)}const amount=(subtotal-(all?(customer.discount||0):0)+rounding)/100;$('total').innerHTML='RM '+Math.floor(amount)+'<span>.'+amount.toFixed(2).split('.')[1]+'</span>';$('receiptNo').textContent='#'+String(progress.served+session.index+1).padStart(4,'0');$('receiptSub').textContent=items.length===customer.items.length?'Semua barang sudah direkodkan.':'';$('receiptList').scrollTop=$('receiptList').scrollHeight}
function renderPayment(){if(customer)$('paymentArea').dataset.waitKey='';syncPaymentSurface();if(session&&!customer){renderWaiting();return}if(customer?.kind==='return'){renderReturnPayment();return}if(customer?.kind==='kitafood'){const area=$('paymentArea');area.innerHTML=`<div class="kf-counter-payment"><span>${icon('delivery')}</span><b>KitaFood · ${customer.orderId}</b><p>Rider sedang menunggu pesanan. Buka senarai barang untuk meneruskan.</p><button id="kfReopen" class="primary-btn">Lihat Pesanan Rider ${icon('arrow')}</button></div>`;$('kfReopen').onclick=()=>delivery.resumeOrder(customer.orderId);return}const area=$('paymentArea'),transaction=customer,trayScroll=$('changeTray')?.scrollLeft||0;if(!customer){area.innerHTML=`<button class="primary-btn" disabled>Mula syif untuk bermain ${icon('arrow')}</button><p class="payment-hint">Kedai kecil. Pengalaman besar.</p>`;return}const all=customer.items.every(i=>i.scanned),method=customer.method,methodName={cash:'Tunai',card:'Kad debit',qr:'QR e-wallet'}[method];
 if(phase==='scan'){area.innerHTML=`${customer.hasCoupon?`<button class="coupon-btn ${customer.couponApplied?'applied':''}" id="couponBtn" ${!all||customer.couponApplied?'disabled':''}>${icon('ticket')}<span><b>${customer.couponApplied?'Kupon berjaya digunakan':'Kupon pelanggan · 10% OFF'}</b><small>${customer.couponApplied?'Jimat '+money(customer.discount):all?'Tekan untuk gunakan pada resit ini':'Scan semua barang untuk aktifkan'}</small></span>${customer.couponApplied?'✓':'+'}</button>`:''}<div class="method-preview">${icon(method)} Pelanggan bayar dengan ${methodName.toLowerCase()}</div><button class="primary-btn" id="checkoutBtn" ${all?'':'disabled'}>Teruskan bayaran ${icon('arrow')}</button><p class="payment-hint">${all?'Semak jumlah, kemudian terima bayaran.':'Scan atau timbang semua barang dahulu.'}</p>`;if($('couponBtn'))$('couponBtn').onclick=()=>{if(applyCoupon(customer)){beep('coin');renderReceipt();renderPayment();save();toast('Kupon digunakan. Pelanggan jimat '+money(customer.discount))}};$('checkoutBtn').onclick=()=>{if(!all||busy||!ensurePaper())return;phase='offer';paymentMinimized=false;renderPayment();renderScene();save();beep('coin')};return}
 if(phase==='offer'&&method==='cash'){area.innerHTML=`<div class="cash-offer"><span>${icon('cash')}</span><div><small>Pelanggan hulur</small><b>${money(customer.tender)}</b></div></div><div class="offered-cash">${cashArtStack(customer.tender)}</div><button class="primary-btn" id="acceptCash">Terima duit ${icon('check')}</button><p class="payment-hint">${customer.total!==amountDue(customer)?'Bayaran tunai dibundarkan kepada 5 sen terdekat.':'Terima bayaran, kemudian sediakan baki.'}</p>`;$('acceptCash').onclick=()=>{if(paused||busy||transaction!==customer||phase!=='offer')return;phase='change';cashPicked=[];renderPayment();renderScene();save();playDrawerSound()};return}
 if(phase==='change'){const due=customer.tender-amountDue(customer),picked=cashPicked.reduce((a,b)=>a+b,0);area.innerHTML=`<div class="change-banner ${picked===due?'exact':''}"><div><small>Baki perlu dipulangkan</small><b>${money(due)}</b></div><div><small>Anda pilih</small><b class="change-picked">${money(picked)}</b></div></div><div class="drawer-tools"><span class="muted">Pilih duit & syiling</span><button class="text-btn" id="undoCash">${icon('undo')} Undur</button><button class="text-btn" id="resetCash">${icon('reset')} Kosongkan</button></div><div class="drawer">${DENOMS.map(d=>`<button class="denom ${d<100?'coin':''}" data-note="${d}" aria-label="Tambah ${money(d)}">${moneyArt(d)}<b class="drawer-value">${d>=100?money(d):d+' SEN'}</b><small class="drawer-pick">Tekan untuk ambil</small>${cashPicked.includes(d)?'<span class="qty">'+cashPicked.filter(n=>n===d).length+'</span>':''}</button>`).join('')}</div><div class="cash-tray-label"><span>${cashPicked.length?cashPicked.length+' keping · tekan untuk pulangkan':'Dulang baki kosong'}</span><small>Leret kiri / kanan</small></div><div class="cash-tray" id="changeTray" tabindex="0" role="region" aria-label="Duit baki dipilih, leret kiri atau kanan untuk melihat semua">${cashPicked.map((v,i)=>`<button class="tray-money ${v<100?'tray-coin':''}" data-return-cash="${i}" aria-label="Masukkan semula ${money(v)} ke laci" title="Tekan untuk pulangkan ke laci">${moneyArt(v)}<small>− ${money(v)}</small></button>`).join('')}</div><button class="primary-btn" id="giveChange">${due===0?'Sahkan bayaran tepat':'Serahkan baki'} ${icon('check')}</button>`;$('changeTray').scrollLeft=trayScroll;area.querySelectorAll('[data-return-cash]').forEach(b=>b.onclick=()=>returnCash(+b.dataset.returnCash,transaction,b));area.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>{if(paused||busy||transaction!==customer||phase!=='change')return;cashPicked.push(+b.dataset.note);beep('coin');renderPayment();scrollChangeTrayEnd();save()});$('undoCash').onclick=()=>{cashPicked.pop();renderPayment();save()};$('resetCash').onclick=()=>{cashPicked=[];renderPayment();save()};$('giveChange').onclick=()=>{if(paused||busy||transaction!==customer||phase!=='change')return;if(picked<due){session.mistakes++;customer.cashMistakes=(customer.cashMistakes||0)+1;combo=0;toast(picked>due?'Baki terlebih '+money(picked-due)+'. Semak semula.':'Baki kurang '+money(due-picked)+'. Cuba lagi.',true);$('paymentArea').classList.add('shake');setTimeout(()=>$('paymentArea').classList.remove('shake'),350);renderHeader();save();return}transaction.overpaid=Math.max(0,picked-due);completePayment(transaction)};return}
 if(phase==='offer'){if(method==='card'&&operatingStore().cardBroken){renderCardRepair();return}renderDigital();return}
 if(phase==='success'||phase==='lost'){area.innerHTML='';return}
 if(phase==='end')area.innerHTML=`<button class="primary-btn" id="reportBtn">Lihat laporan hari ini ${icon('arrow')}</button>`;if($('reportBtn'))$('reportBtn').onclick=showSummary;
}
function qrArt(){return `<svg class="qr-art" viewBox="0 0 70 70" aria-hidden="true"><rect width="70" height="70" fill="white"/><g fill="#173f37"><path fill-rule="evenodd" d="M2 2h22v22H2Zm4 4v14h14V6Zm40-4h22v22H46Zm4 4v14h14V6ZM2 46h22v22H2Zm4 4v14h14V50Z"/><path d="M9 9h8v8H9Zm44 0h8v8h-8ZM9 53h8v8H9ZM28 2h6v6h-6Zm8 8h5v14h-5Zm-8 8h5v11h-5ZM2 29h10v5H2Zm16 0h6v11h-6Zm10 6h13v7H28Zm18-8h6v12h-6Zm12 4h10v6H58ZM2 38h10v5H2Zm26 9h6v21h-6Zm12 0h11v6H40Zm0 11h6v10h-6Zm12-14h6v12h-6Zm10 0h6v7h-6Zm-11 18h17v6H51Zm11-7h6v7h-6Z"/></g></svg>`}
function renderPatience(){if(!customer)return;const fraction=mode==='practice'?1:Math.max(0,1-customer.elapsed/customer.patience);$('patienceBar').style.width=fraction*100+'%';$('patienceBar').style.background=fraction<.25?'#cc8d62':fraction<.5?'#c5b270':'#75a283';$('customerArt').classList.toggle('impatient',fraction<.25&&phase!=='success');$('patienceText').textContent=mode==='practice'?'Santai':phase==='offer'||phase==='change'?'Bayaran · berhenti':fraction<.25?'Cepat!':fraction<.5?'Menunggu':'Sabar'}
function onItemDown(e){if(e.button!==0||paused||busy||phase!=='scan')return;const el=e.currentTarget,p=customer.items.find(i=>i.uid===el.dataset.uid);if(!p||p.scanned)return;drag={p,el,x:e.clientX,y:e.clientY,moved:false,id:e.pointerId};el.setPointerCapture(e.pointerId);el.addEventListener('pointermove',onItemMove);el.addEventListener('pointerup',onItemUp,{once:true});el.addEventListener('pointercancel',cancelDrag,{once:true});e.preventDefault()}
function onItemMove(e){if(!drag)return;const d=drag;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>7){d.moved=true;d.ghost=document.createElement('div');d.ghost.className='drag-ghost';d.ghost.innerHTML=productArt(d.p.id);document.body.append(d.ghost);d.el.style.opacity='.25'}if(d.ghost){d.ghost.style.left=e.clientX+'px';d.ghost.style.top=e.clientY+'px';for(const id of ['scannerZone','scaleZone'])$(id).classList.toggle('highlight',inside(e,$(id).getBoundingClientRect()))}}
function inside(e,r){return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}
function cancelDrag(){if(!drag)return;drag.ghost?.remove();drag.el.style.opacity='';drag.el.removeEventListener('pointermove',onItemMove);$('scannerZone').classList.remove('highlight');$('scaleZone').classList.remove('highlight');drag=null}
function onItemUp(e){if(!drag)return;const d=drag;let target=null;if(d.moved){if(inside(e,$('scannerZone').getBoundingClientRect()))target='scanner';if(inside(e,$('scaleZone').getBoundingClientRect()))target='scale'}cancelDrag();if(!d.moved||target)processItem(d.p.uid,target)}
async function processItem(uid,target=null,manual=false){if(paused||busy||phase!=='scan'||!ensurePaper())return;const p=customer.items.find(i=>i.uid===uid);if(!p||p.scanned)return;const correct=p.weighted?'scale':'scanner';if(target&&target!==correct){toast(p.weighted?'Barang ini perlu ditimbang. Seret ke penimbang.':'Ada barcode! Seret barang ini ke scanner.',true);return}
 if(p.damaged&&!p.repaired&&!manual){
   busy=true;const attempt=scanToken;
   $('scannerZone').classList.add('scanning');$('scannerStatus').textContent='Membaca barcode…';
   const ok=await delayActive(Math.min(500,machineTimings(gameplayMachineUpgrades()).scanMs+200),attempt);
   if(!ok)return;
   busy=false;$('scannerZone').classList.remove('scanning');
   p.barcodeFailTriggered=true;$('scannerStatus').textContent='✕ Barcode tidak dapat dibaca';
   renderProducts();beep('error');save();
   toast('Barcode rosak! Masukkan kod manual untuk scan.');
   showCodePad(uid);return;
 }
 busy=true;const token=scanToken;const el=$('products').querySelector(`[data-uid="${uid}"]`);el?.classList.add('busy');fly(p.id,el,$(correct==='scale'?'scaleZone':'scannerZone'));if(p.weighted){prepareScaleSound();$('scaleZone').classList.remove('stable');$('scaleZone').classList.add('weighing');setScaleReading(p,0);$('scaleItem').innerHTML=productArt(p.id);$('scaleItem').dataset.uid=p.uid;$('scaleState').textContent='MENIMBANG';$('scaleCaption').textContent='Menstabilkan bacaan berat…';const valid=await delayActive(machineTimings(gameplayMachineUpgrades()).weighMs,token,frac=>{setScaleReading(p,Math.max(0,frac<.95?frac+Math.sin(frac*42)*.05:1));$('weightProgress').style.width=frac*100+'%'});if(!valid)return;$('scaleZone').classList.remove('weighing');setScaleReading(p);$('scaleZone').classList.add('stable');$('scaleState').textContent='STABIL';$('scaleCaption').textContent=money(itemPrice(p))+' · Masuk resit secara automatik';playScaleSound()}else{$('scannerZone').classList.add('scanning');$('scannerStatus').textContent='Membaca barcode…';const valid=await delayActive(machineTimings(gameplayMachineUpgrades()).scanMs,token);if(!valid)return;$('scannerZone').classList.remove('scanning');$('scannerStatus').textContent='✓ '+p.name+' · '+money(itemPrice(p));beep('scan')}p.scanned=true;p.scanOrder=(customer.scanSequence||0)+1;customer.scanSequence=p.scanOrder;session.scans=(session.scans||0)+1;if(p.weighted)session.weighed=(session.weighed||0)+1;busy=false;fly(p.id,$(p.weighted?'scaleZone':'scannerZone'),$('bagZone'));if(p.weighted)setTimeout(()=>{if(token===scanToken&&$('scaleItem').dataset.uid===p.uid){$('scaleItem').innerHTML='';$('scaleItem').dataset.uid=''}},420);renderProducts();renderActivity();renderHeader();renderReceipt();renderPayment();const bag=document.querySelector('.bag-zone');bag.classList.remove('pop');void bag.offsetWidth;bag.classList.add('pop');if(customer.items.every(i=>i.scanned)){$('speech').textContent=customer.kind==='kitafood'?'Hai! Saya rider KitaFood. Pesanan '+customer.orderId+' sudah sedia untuk diambil?':customer.kind==='return'?customer.returnReason:'Dah siap semua! '+({cash:'Saya bayar tunai ya.',card:'Saya nak guna kad.',qr:'Saya guna QR.'}[customer.method]);toast(customer.kind==='return'?'Barang siap discan. Bandingkan resit pemulangan.':'Semua barang siap. Masa untuk bayaran!');setMobileView('payment')}save()}
function delayActive(ms,token,onProgress){return new Promise(resolve=>{let elapsed=0,last=performance.now();function tick(now){const delta=Math.min(100,now-last);last=now;if(token!==scanToken){resolve(false);return}if(!paused&&!document.hidden){elapsed+=delta;onProgress?.(Math.min(1,elapsed/ms))}if(elapsed>=ms){resolve(true);return}requestAnimationFrame(tick)}requestAnimationFrame(tick)})}
function fly(productId,from,to){if(!from)return;const a=from.getBoundingClientRect(),b=to.getBoundingClientRect(),el=document.createElement('div');el.className='fly-item';el.innerHTML=productArt(productId);el.style.left=a.left+a.width/2-23+'px';el.style.top=a.top+a.height/2-23+'px';$('fxLayer').append(el);void el.offsetWidth;requestAnimationFrame(()=>{el.style.transform=`translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top+b.height/2-a.top-a.height/2}px) scale(.75)`;el.style.opacity='0'});setTimeout(()=>el.remove(),420)}
function completePayment(transaction=customer){
 if(!transaction||transaction!==customer||transaction.paid||!['scan','offer','change'].includes(phase)||!transaction.items.every(i=>i.scanned))return;
 if(!ensurePaper())return;if(mode!=='practice'&&!rushUnlimited(transaction)&&!stockForBasket(progress,transaction.items)){showInventory();toast('Stok tidak cukup. Tambah bekalan untuk selesaikan jualan.',true);return}
 ensureShift(session);const missedCoupon=transaction.hasCoupon&&!transaction.couponApplied,reason=missedCoupon?'Kupon diminta tetapi tidak digunakan.':'';
 const starLost=missedCoupon?loseStar(session,reason):0;transaction.paid=true;busy=false;phase='success';combo++;session.bestCombo=Math.max(session.bestCombo,combo);
 lastTip=missedCoupon?0:tipFor(customer,combo,progress.upgrades);
 const cost=transaction.items.reduce((n,p)=>n+stockCost(p,stockUnits(p),progress.day),0);
 const itemMargin=amountDue(transaction)-cost;
 const rushBonus=mode==='career'?rushHourProfitBonus(itemMargin,progress.upgrades,rushUnlimited(transaction)||rushHourActive(progress.day,session)):0;
 transaction.rushBonus=rushBonus;
 lastEarned=itemMargin+lastTip+rushBonus;
 session.rushBonus=(session.rushBonus||0)+rushBonus;
 if(rushBonus)session.rushSales=(session.rushSales||0)+1;
 session.served++;if(transaction.rushCustomer){session.rushServed=(session.rushServed||0)+1;session.rushRevenue=(session.rushRevenue||0)+amountDue(transaction);session.rushEarned=(session.rushEarned||0)+lastEarned;}if(transaction.method==='cash'&&!transaction.cashMistakes&&!transaction.overpaid)session.perfectCash=(session.perfectCash||0)+1;session.totalSales+=amountDue(transaction);session.tips+=lastTip;session.earned+=lastEarned;session.overpaid+=transaction.overpaid||0;
 if(mode==='career'){if(!rushUnlimited(transaction)){takeStock(progress,transaction.items);progress.paper--;}receiveStoreCash(progress,amountDue(transaction)+lastTip);progress.wallet+=rushBonus;progress.lifetime+=lastEarned;progress.bestCombo=Math.max(progress.bestCombo,combo);recordSale(transaction);if(transaction.method==='card'){progress.cardHealth=Math.max(0,progress.cardHealth-Math.max(4,24-4*Math.max(1,progress.upgrades.card||1)));progress.cardBroken=progress.cardHealth===0}}
 session.clockMinutes=Math.min(1320,session.clockMinutes+90);render();save();if(transaction.method==='cash')playChaChing();else beep('success');floatingTip(lastTip);if(combo%3===0)confetti(24);
 showTransactionResult(lastTip,starLost,reason,transaction.overpaid||0);advance();
}
function advance(){
 if(advancePending||!['success','lost'].includes(phase))return;
 if(mode==='career'&&session.stars===0){showStarRecovery();return}
 // Interstitials must resolve before spawning the next customer or ending a shift.
 if(mode==='career'){
  if(session.rushReportPending&&showRushEnd())return;
  if(beginDailyRush())return;
  if(dayFinished(session,progress.day)){phase='end';save();renderPayment();showShiftClosing();return}
 }
 advancePending=true;
 session.index++;const wait=mode==='practice'||rushHourActive(progress.day,session)?0:arrivalWait(session.clockMinutes);if(wait){session.waitSeconds=wait;customer=null;phase='waiting';advancePending=false;resetStations();render();save()}else newCustomer();
}
function loseCustomer(){if(!['scan','offer','change'].includes(phase))return;scanToken++;busy=false;cancelDrag();phase='lost';session.lost++;if(customer?.rushCustomer)session.rushLost=(session.rushLost||0)+1;const starLost=loseStar(session,'Pelanggan menunggu terlalu lama.');showTransactionResult(0,starLost,'Pelanggan menunggu terlalu lama.');combo=0;resetStations();render();save();toast('Pelanggan hilang sabar. Cuba lagi!',true);advance()}
function floatingTip(amount){if(!amount)return;const r=$('walletLabel').getBoundingClientRect(),el=document.createElement('div');el.className='floating-tip';el.textContent='+'+money(amount);el.style.left=r.left+'px';el.style.top=r.bottom+18+'px';$('fxLayer').append(el);setTimeout(()=>el.remove(),1850)}
function confetti(count=45){for(let i=0;i<count;i++){const e=document.createElement('i');e.className='confetti';e.style.left=Math.random()*100+'vw';e.style.background=['#a2bd85','#edaf72','#e1cc91','#709988'][i%4];e.style.setProperty('--drift',(Math.random()-.5)*250+'px');e.style.animationDelay=Math.random()*.5+'s';$('fxLayer').append(e);setTimeout(()=>e.remove(),3000)}}
function openModal(kind,html){if(modalKind==='stars-empty'&&kind!=='stars-empty')return;$('modal').dataset.kind=kind;document.body.classList.toggle('style-preview',kind==='style-preview');if(kind!=='style-preview'){previewTheme=null;applySettings()}cancelCalculatorDrag();cancelDrag();cancelBankCardDrag();paused=true;document.body.classList.add('paused');modalKind=kind;if(kind==='pause'){explicitPause=true;stopScaleSound()};syncBackgroundMusic();$('modalContent').innerHTML=html;icons($('modalContent'));if(!$('modal').open)$('modal').showModal()}
function closeModal(){if(modalKind==='delivery')delivery?.stopClock();if(modalKind==='style-preview'){showStyles(previewTheme);return}if(['intro','summary','stars-empty'].includes(modalKind))return;previewTheme=null;applySettings();if(phase==='end'){showSummary();return}$('modal').close();paused=false;explicitPause=false;document.body.classList.remove('paused');modalKind=null;syncBackgroundMusic()}
function startPlay(selected){explicitPause=false;musicUnlocked=true;paymentMinimized=false;beep('start');prepareChaChing();prepareScaleSound();if(selected==='resume'&&session){mode='career';normalizeSession();if(phase==='end'){showSummary();return}render();setMobileView(['offer','change','success','lost'].includes(phase)?'payment':'counter')}else if(selected==='practice'&&practiceRunCache?.session?.mode==='practice'){
   mode='practice';session=JSON.parse(JSON.stringify(practiceRunCache.session));practiceStore=practiceRunCache.store?JSON.parse(JSON.stringify(practiceRunCache.store)):null;
   customer=session.customer||null;phase=session.phase||'scan';combo=session.combo||0;cashPicked=Array.isArray(session.cashPicked)?session.cashPicked:[];
   lastTip=session.lastTip||0;lastEarned=session.lastEarned||0;ensureShift(session);if(practiceStore)ensureOperations(practiceStore);
   scanToken++;busy=false;renderedBasket=null;renderedSceneCustomer=undefined;initIllustrations();resetStations();render();setMobileView('counter');
  }
  else newSession(selected||'career');$('modal').close();paused=false;document.body.classList.remove('paused');modalKind=null;if(customer?.paymentChanged){toast('Tunai sahaja buat masa ini. Buka kad dan QR melalui Upgrade.');delete customer.paymentChanged;save()}if(!storageOK)toast('Simpanan automatik tidak tersedia dalam pelayar ini.');if(mode==='career'&&session.stars===0)showStarRecovery();else if(['success','lost'].includes(phase))advance();else if(phase==='delivery'&&customer?.kind==='kitafood')showKitaFoodAfterArrival(customer.orderId,1800);save();syncBackgroundMusic()}
function showIntro(){explicitPause=true;closeCalculator();let selected='career';openModal('intro',`<div class="modal-pad"><div class="intro-layout"><div><div class="modal-kicker"><span class="live-dot"></span> SELAMAT DATANG KE KEDAI KITA</div><h1>Kedai kecil.<br><em>Seronok besar.</em></h1><p>Jadi cashier paling mesra di taman. Scan barang, kira baki dan buat pelanggan tersenyum.</p><div class="intro-features"><span>${icon('scan')} Scan & timbang</span><span>${icon('cash')} Ringgit Malaysia</span><span>${icon('shop')} Naik taraf kedai</span></div></div><div class="intro-art">${avatar(PEOPLE[0])}<div class="intro-counter"><span>${icon('basket')}</span><b>kita.</b></div><div class="intro-sticker">DIBUKA<br>DENGAN<br>SENYUMAN</div></div></div><div class="mode-options"><button class="mode-choice active" id="careerMode"><b>✦ Mod kerjaya</b><small>Cabaran harian, combo & naik taraf</small></button><button class="mode-choice" id="practiceMode"><b>Mod santai</b><small>Latihan tanpa masa dan tanpa tekanan</small></button></div><div class="intro-bottom"><button class="primary-btn" id="startBtn">${session?'Sambung syif · Hari '+progress.day:'Buka kedai · Hari '+progress.day} ${icon('arrow')}</button><small>Tekan atau seret barang.<br>Mesra telefon, tablet & komputer.</small></div>${session?'<p class="muted" style="margin-bottom:0">Kemajuan syif anda sudah disimpan.</p>':''}</div>`);$('careerMode').onclick=()=>{selected='career';$('careerMode').classList.add('active');$('practiceMode').classList.remove('active');$('startBtn').innerHTML=(session?'Sambung syif · Hari ':'Buka kedai · Hari ')+progress.day+' '+icon('arrow')};$('practiceMode').onclick=()=>{selected='practice';$('practiceMode').classList.add('active');$('careerMode').classList.remove('active');$('startBtn').innerHTML=(practiceRunCache?'Sambung latihan santai ':'Mula latihan santai ')+icon('arrow')};$('startBtn').onclick=()=>startPlay(selected==='career'&&session?'resume':selected)}
function showPause(){if(modalKind==='intro'||modalKind==='summary')return;openModal('pause',`<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">REHAT SEKEJAP</div><h2>Kaunter dijeda.</h2></div><button class="icon-btn" id="closeModal" aria-label="Tutup">${icon('close')}</button></div><p>Pelanggan boleh tunggu. Masa berhenti semasa anda berehat.</p><div class="help-grid"><div class="help-card"><span>${icon('scan')}</span><b>1. Scan barang</b><p>Tekan barang untuk scan automatik, atau seret barang berbungkus ke scanner.</p></div><div class="help-card"><span>${icon('scale')}</span><b>2. Timbang hasil segar</b><p>Tekan atau seret buah, sayur dan ikan ke penimbang. Kelajuan timbang mengikut upgrade penimbang.</p></div><div class="help-card"><span>${icon('cash')}</span><b>3. Terima bayaran</b><p>Ambil duit, kemudian pilih wang kertas dan syiling untuk pulangkan baki tepat.</p></div><div class="help-card"><span>${icon('shop')}</span><b>4. Besarkan kedai</b><p>Urus stok, resit dan peralatan. Jualan menambah duit kedai; stok dibeli pada harga borong. Selesaikan misi harian untuk bonus RM5.</p></div></div><div class="pause-actions"><button class="primary-btn" id="resumeBtn">Sambung bermain ${icon('play')}</button><button class="secondary-btn" id="homeBtn">Menu utama</button></div></div>`);$('closeModal').onclick=closeModal;$('resumeBtn').onclick=closeModal;$('homeBtn').onclick=()=>{if(mode==='career')save();else {save();restoreCareer()}showIntro()}}
function restoreCareer(){practiceStore=null;scanToken++;busy=false;advancePending=false;mode='career';try{const raw=JSON.parse(localStorage.getItem(cloud?.getStorageKey()||STORAGE)||'null');session=raw?.session||null;if(session){customer=session.customer;phase=session.phase;combo=session.combo||0;cashPicked=session.cashPicked||[];lastTip=session.lastTip||0;lastEarned=session.lastEarned||0}else{customer=null;phase='scan';combo=0}}catch{session=null;customer=null}normalizeSession();initIllustrations();render()}
function showShop(returnTo='game'){
 if(mode==='practice'){toast('Semua kategori dibuka untuk latihan. Upgrade tersedia dalam kerjaya.');return}
 const destination=returnTo==='summary'||modalKind==='summary'?'summary':'game';
 openModal('shop',`<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">KEMBANGKAN PASAR MINI ANDA</div><h2>Upgrade & kategori.</h2></div><button class="icon-btn" id="closeShop" aria-label="Tutup">${icon('close')}</button></div><div class="shop-wallet"><small>Duit kedai anda</small><b>${money(progress.wallet)}</b></div><h3 class="shop-section-title">Buka kelas barangan</h3><div class="category-shop">${CATEGORIES.map(c=>{const owned=progress.unlocked.includes(c.id),count=PRODUCTS.filter(p=>p.category===c.id).length;return `<div class="category-card ${owned?'owned':''}"><div class="category-art">${productArt(c.art)}<span>${count} barang</span></div><div><h3>${c.name}</h3><p>Kelas ini mengandungi ${count} jenis barangan. ${owned?'Semua barangan sudah tersedia.':'Buka kelas untuk menjual barangan ini.'}</p></div><button data-category="${c.id}" class="secondary-btn" ${owned||progress.wallet<c.cost?'disabled':''}>${owned?'✓ Dibuka':money(c.cost)}</button><button type="button" class="secondary-btn category-preview-open" data-preview-category="${c.id}" aria-label="Lihat senarai barangan ${c.name}">${icon('book')} Lihat senarai barangan (${count})</button></div>`}).join('')}</div>${paymentUpgradeCards()}<h3 class="shop-section-title">Peralatan kedai & bonus Rush Hour</h3>${UPGRADES.filter(u=>u.type!=='payment').map(u=>{const level=progress.upgrades[u.id]||0,cost=u.cost*(level+1),maxed=level>=u.max;return `<div class="upgrade-row"><span class="upgrade-icon">${icon(u.icon)}</span><div class="upgrade-info"><b>${u.name}</b><span class="level-dots">${'●'.repeat(level)+'○'.repeat(u.max-level)}</span><small>${u.desc}${machineUpgradeInfo(u.id,level,u.max)}</small></div><button class="primary-btn" data-upgrade="${u.id}" ${maxed||progress.wallet<cost?'disabled':''}>${maxed?'Maksimum':money(cost)}</button></div>`}).join('')}<button class="secondary-btn" id="backFromShop" style="width:100%;margin-top:15px">${destination==='summary'?'Kembali ke laporan':'Kembali ke kaunter'}</button></div>`);
 const back=()=>destination==='summary'?showSummary():closeModal();$('closeShop').onclick=back;$('backFromShop').onclick=back;
 $('modalContent').querySelectorAll('[data-preview-category]').forEach(b=>b.onclick=()=>showCategoryProducts(b.dataset.previewCategory));
 $('modalContent').querySelectorAll('[data-upgrade]').forEach(b=>b.onclick=()=>{{const previous=progress.upgrades[b.dataset.upgrade]||0;if(buyUpgrade(progress,b.dataset.upgrade)){if(b.dataset.upgrade==='comfort'&&customer)customer.patience+=15;save();if(cloud?.getUser?.())cloud.flush().catch(()=>toast('Upgrade BELUM disimpan dalam Firebase. Jangan log keluar dahulu.',true));renderHeader();beep('success');showShop(destination);if(['card','qr'].includes(b.dataset.upgrade))toast(previous===0?'Bayaran '+(b.dataset.upgrade==='card'?'kad':'QR')+' dibuka untuk pelanggan seterusnya!':'Peralatan pembayaran dinaik taraf ke tahap '+(previous+1));else if(b.dataset.upgrade==='storage')toast('Kapasiti stor kini '+stockCapacity(progress)+' unit / kg setiap produk.')}}});
 $('modalContent').querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{if(unlockCategory(progress,b.dataset.category)){save();if(cloud?.getUser?.())cloud.flush().catch(()=>toast('Kategori BELUM disimpan dalam Firebase. Jangan log keluar dahulu.',true));renderHeader();initIllustrations();showShop(destination);beep('success');confetti(18);toast('Kategori '+CATEGORIES.find(c=>c.id===b.dataset.category).name+' dibuka!')}});
}
// Paparan produk di dialog berasingan supaya kategori tidak lagi mengembang di halaman Upgrade.
function showCategoryProducts(categoryId){
 const category=CATEGORIES.find(c=>c.id===categoryId);
 if(!category||modalKind!=='shop')return;
 const products=PRODUCTS.filter(p=>p.category===category.id);
 let dialog=document.getElementById('categoryProductDialog');
 if(!dialog){
  dialog=document.createElement('dialog');dialog.id='categoryProductDialog';
  dialog.setAttribute('aria-labelledby','categoryProductTitle');
  document.body.appendChild(dialog);
  // Menekan kawasan gelap di luar popup menutup senarai tanpa menutup halaman Upgrade.
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
 }
 if(dialog.open)dialog.close();
 dialog.innerHTML=`<div class="category-product-sheet"><header class="category-product-heading"><div><div class="modal-kicker">KATALOG KEDAI · ${products.length} BARANG</div><h2 id="categoryProductTitle">${category.name}</h2><p>Senarai barangan dan harga jualan untuk kategori ini.</p></div><button type="button" class="icon-btn" id="closeCategoryProducts" aria-label="Tutup senarai barangan">${icon('close')}</button></header><div class="category-product-grid">${products.map(p=>`<article class="category-product-tile"><div class="category-product-image">${productArt(p.id)}</div><div class="category-product-description"><b>${p.name}</b><span>${money(p.price)}${p.weighted?'/kg':''}</span></div></article>`).join('')}</div><footer class="category-product-footer"><span>${progress.unlocked.includes(category.id)?'Kategori telah dibuka':'Kategori belum dibuka'}</span><button type="button" class="secondary-btn" id="categoryProductsBack">Kembali ke Upgrade</button></footer></div>`;
 icons(dialog);
 dialog.querySelector('#closeCategoryProducts').onclick=()=>dialog.close();
 dialog.querySelector('#categoryProductsBack').onclick=()=>dialog.close();
 dialog.showModal();
}
function showShiftClosing(){
 if(!session)return;
 phase='end';save();
 openModal('shift-closing',`<div class="modal-pad"><div class="modal-kicker">PENUTUPAN SYIF · HARI ${progress.day}</div><h2>Semak sebelum tutup kedai</h2><p>Semua pelanggan harian telah dilayan. Semak laporan sebelum meneruskan.</p><div class="day-summary"><div><small>JUALAN</small><b>${money(session.totalSales||0)}</b></div><div><small>TIP</small><b>${money(session.tips||0)}</b></div><div><small>UNTUNG DIREKOD</small><b>${money(session.earned||0)}</b></div></div><p class="muted">Delivery: ${session.deliveryCompleted||0} pesanan · ${money(session.deliveryRevenue||0)} · Refund: ${money(session.refunds||0)} · Perbelanjaan: ${money(session.expenses||0)} · Pelanggan: ${session.served||0}</p><p class="muted">Laporan ini tidak mengubah baki wang atau mengira caj dua kali.</p><button class="primary-btn" id="confirmShiftClose" style="width:100%">Tutup kedai & lihat laporan</button></div>`);
 $('confirmShiftClose').onclick=()=>showSummary();
}
function showSummary(){closeCalculator();ensureShift(session);settleShift(progress,session,mode==='career');phase='end';save();const stars=session.stars;openModal('summary',`<div class="modal-pad shift-report"><header class="shift-report-head"><div><div class="modal-kicker">KEDAI KITA · LAPORAN HARIAN</div><h2>Laporan penutupan syif</h2><p>Hari ${String(progress.day).padStart(2,'0')} · Syif selesai</p></div><div class="shift-report-rating"><div class="stars">${'★'.repeat(stars)+'☆'.repeat(3-stars)}</div><small>${stars===3?'Prestasi cemerlang':stars===2?'Prestasi baik':'Perlu penambahbaikan'}</small></div></header><div class="shift-report-intro"><strong>${stars===3?'Syabas! Prestasi cemerlang.':'Terima kasih atas usaha hari ini.'}</strong><span>${session.served} pelanggan dilayan · ${normalCustomerCount(session)} pelanggan sasaran · ${session.rushServed||0} Rush Hour</span></div><div class="shift-report-metrics"><div><small>JUMLAH JUALAN</small><strong>${money(session.totalSales||0)}</strong></div><div><small>UNTUNG BERSIH + TIP</small><strong>${money(session.earned||0)}</strong></div><div><small>JUMLAH TIP</small><strong>${money(session.tips||0)}</strong></div><div><small>COMBO TERBAIK</small><strong>×${session.bestCombo||0}</strong></div></div><section class="shift-report-section"><h3>Ringkasan kewangan</h3><div class="shift-report-rows"><div><span>Hasil Rush Hour</span><b>${money(session.rushEarned||0)}</b></div><div><span>Bonus Rush Hour</span><b>${money(session.rushBonus||0)}</b></div><div><span>Bayaran balik pelanggan</span><b>${money(session.refunds||0)}</b></div><div><span>Kos resit & pembaikan</span><b>${money(session.expenses||0)}</b></div><div><span>Hutang pembekal</span><b>${money(progress.supplierDebt||0)}</b></div></div></section><section class="shift-report-section"><h3>Prestasi operasi</h3><div class="shift-report-rows"><div><span>Pelanggan terlepas</span><b>${session.lost||0}</b></div><div><span>Kesilapan baki</span><b>${session.mistakes||0}</b></div><div><span>Jumlah pemulangan</span><b>${session.returnCount||0}</b></div><div><span>Bonus syif sempurna</span><b>${normalCustomerCount(session)>=dayTarget(progress.day)&&session.stars===3?'RM 5.00 · Hari seterusnya':'Belum layak'}</b></div></div></section><div class="shift-report-tools"><button class="secondary-btn" id="summaryInventory">Inventori & bekalan esok</button><button class="summary-missions secondary-btn" id="summaryMissions">Semak ganjaran misi</button></div><div class="summary-actions shift-report-actions"><button class="secondary-btn" id="summaryShop">${icon('shop')} Naik taraf</button><button class="primary-btn" id="nextDay">Teruskan ke Hari ${progress.day+1} ${icon('arrow')}</button></div></div>`);$('summaryInventory').onclick=()=>showInventory('summary');$('summaryMissions').onclick=()=>showMissions('summary');$('summaryShop').onclick=()=>showShop('summary');$('nextDay').onclick=()=>{const bonus=normalCustomerCount(session)>=dayTarget(progress.day)&&session.stars===3?500:0;progress.wallet+=bonus;progress.lifetime+=bonus;progress.served+=session.served;progress.history.push({day:progress.day,served:session.served,earned:session.earned+bonus,stars});progress.history=progress.history.slice(-20);progress.day++;explicitPause=false;newSession('career');$('modal').close();paused=false;modalKind=null;document.body.classList.remove('paused');save();beep('start');syncBackgroundMusic();toast((bonus?'Bonus RM5 diterima. ':'')+'Selamat datang ke hari '+progress.day+'!')};confetti(35)}

function setMobileView(view){const pay=view==='payment';document.body.classList.toggle('view-payment',pay);$('counterTab').classList.toggle('active',!pay);$('paymentTab').classList.toggle('active',pay);$('counterTab').setAttribute('aria-selected',String(!pay));$('paymentTab').setAttribute('aria-selected',String(pay))}
Object.assign(ICONS,{user:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8',moon:'M20 15.5A8.7 8.7 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z',calculator:'M5 2h14v20H5V2Zm3 3h8v4H8V5Zm0 8h1m3 0h1m3 0h1m-9 4h1m3 0h1m3 0h1',ticket:'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V6Zm12 0v12',clock:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4v6l4 2',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',book:'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3V4Zm9 2v16'});

// Developer sandbox — requires a configured Firebase Authentication UID.
// Developer access is exclusively controlled by the existing UID allowlist.
let developerMode=false;
function developerAccessChanged(enabled){
 developerMode=!!enabled;
 const button=$('developerPanelBtn');
 if(button){
  button.hidden=!developerMode;
  button.classList.remove('dev-setup-locked');
  button.innerHTML='🛠️ <span>DEV TEST</span>';
  button.setAttribute('aria-label','Buka panel ujian Developer');
 }
 document.body.classList.toggle('developer-mode',developerMode);
 if(developerMode)toast('Mod Developer aktif · semua ujian disimpan secara berasingan');
}
function assertDeveloper(){return developerMode&&cloud?.isDeveloper?.()===true}
function prepareDeveloperProfile(day=7){
 const preservedSettings={...progress.settings},preservedWallet=progress.wallet;
 progress=createProgress();progress.settings=preservedSettings;
 progress.day=Math.max(1,Math.min(60,Math.floor(Number(day)||1)));
 progress.wallet=Math.max(0,Math.round(Number(preservedWallet)||0)); // preserve Developer wallet across scenarios
 progress.unlocked=CATEGORIES.map(c=>c.id);
 progress.upgrades.card=1;progress.upgrades.qr=1;
 ensureOperations(progress);
 for(const item of PRODUCTS)progress.inventory[item.id]=stockTarget(item,progress);
 progress.paper=120;progress.cardBroken=false;progress.cardHealth=100;
 ensureStyle();applyMachineSpeeds();
}
function runDeveloperScenario(key,requestedDay=7){
 if(!assertDeveloper())return;
 const day=key==='barcode'?4:key==='rush'?8:key==='decline'?11:key==='pin'?6:key==='refundValid'||key==='refundInvalid'?4:key==='vip'?8:key==='qr'?8:key==='cash'?1:key==='kitafood'||key==='kitafoodLate'?7:key==='rushEnd'?8:requestedDay;
 prepareDeveloperProfile(day);
 if(key==='full'){
  for(const u of UPGRADES)progress.upgrades[u.id]=u.max;
  for(const item of PRODUCTS)progress.inventory[item.id]=stockTarget(item,progress);
 }
 newSession('career');
 if(key==='rushEnd'){session.rushStarted=true;session.rushCompleted=true;session.rushSecondsRemaining=0;session.rushServed=4;session.rushRevenue=9800;session.rushEarned=2300;session.rushBonus=1150;session.rushReportPending=true;session.rushReportShown=false;}
 if(key==='rush'){
  session.index=1;session.clockMinutes=750;session.seenPeople=[];session.rushStarted=true;session.rushCompleted=false;session.rushSecondsRemaining=RUSH_DURATION_SECONDS;session.rushReportPending=false;session.rushReportShown=false;newCustomer();
 }
 if(key==='barcode'){
  const item=customer.items.find(i=>!i.weighted);
  if(item){item.damaged=true;item.manualCode=randomManualCode();item.repaired=false;item.barcodeFailTriggered=false;}
 }
 if(['decline','pin'].includes(key)){
  customer.method='card';customer.requiresPin=key==='pin';
  customer.cardStage='ready';customer.cardContactReady=false;
  customer.cardDeclineReason=key==='decline'?'insufficient':null;
  customer.cardDeclineHandled=false;
 }
 if(key==='qr'){
  customer.method='qr';customer.requiresPin=false;customer.cardStage='ready';
  customer.qrArmed=false;customer.qrScanned=false;
 }
 if(key==='vip')customer.kind='vip';
 if(key==='noPaper')progress.paper=0;
 if(key==='terminalBroken'){progress.cardBroken=true;progress.cardHealth=0;}
 if(key==='lowStock'){for(const p of PRODUCTS)if(progress.unlocked.includes(p.category))progress.inventory[p.id]=p.weighted?1000:1;}
 if(key==='outOfStock'){for(const p of PRODUCTS)if(progress.unlocked.includes(p.category))progress.inventory[p.id]=0;}
 if(key==='refundValid'||key==='refundInvalid'){
  const item=PRODUCTS.find(x=>x.id==='tissue')||PRODUCTS.find(x=>!!returnPolicy(x));
  const sale={id:'dev-sale',receipt:'KK-00001',day:progress.day-1,productId:item.id,grams:1000,paid:item.price,cost:Math.max(1,Math.floor(item.price*.6)),returned:false};
  progress.sales=[sale];session.index=2;customer.returnId=sale.id;
  customer.kind='return';customer.returnClaim={receipt:sale.receipt,day:sale.day,productId:sale.productId,quantity:1,paid:sale.paid};
  customer.returnReason=returnPolicy(item)?.reason||'Saya mahu pulangkan barang.';
  customer.returnCondition=returnPolicy(item)?.condition||'Masih berbungkus';
  if(key==='refundInvalid')customer.returnClaim.receipt='KK-99999';
  customer.items=[{...item,grams:1000,uid:'dev-return',scanned:false}];customer.total=sale.paid;
  customer.method='cash';customer.tender=0;customer.discount=0;customer.hasCoupon=false;
  customer.requiresPin=false;customer.cardFailure=false;
 }
 customer.elapsed=0;customer.paid=false;
 phase='scan';busy=false;advancePending=false;paymentMinimized=false;
 if(['kitafood','kitafoodLate'].includes(key)){
  const o=delivery?.spawnTestOrder();
  if(o){if(key==='kitafoodLate')o.elapsedSeconds=o.timeLimit;customer={kind:'kitafood',person:delivery.personFor(o),orderId:o.id,items:[],elapsed:0,patience:99999};phase='delivery';}
 }
 scanToken++;renderedBasket=null;renderedSceneCustomer=undefined;
 resetStations();render();save();
 if($('modal').open)$('modal').close();
 paused=false;explicitPause=false;modalKind=null;document.body.classList.remove('paused');
 setMobileView('counter');syncBackgroundMusic();
 if(phase==='delivery'&&customer?.kind==='kitafood')showKitaFoodAfterArrival(customer.orderId,1800);
 else if(key==='rushEnd')showRushEnd();
 const labels={rush:'Rush Hour',barcode:'Barcode tidak dibaca',decline:'Kad ditolak',pin:'PIN kad',cash:'Bayaran tunai',qr:'Bayaran QR',vip:'Pelanggan VIP',refundValid:'Refund sah',refundInvalid:'Refund tidak sah',full:'Semua upgrade',kitafood:'KitaFood',kitafoodLate:'KitaFood lewat',lowStock:'Stok hampir habis',outOfStock:'Stok kosong',noPaper:'Resit habis',terminalBroken:'Terminal rosak',rushEnd:'Rush Hour tamat'};
 toast('Ujian: '+(labels[key]||'Hari '+day)+' · data sandbox sahaja');
}
function showDeveloperPanel(){
 if(!assertDeveloper())return;
 openModal('developer',`<div class="modal-pad dev-panel"><div class="modal-heading"><div><div class="modal-kicker">DEVELOPER · SANDBOX</div><h2>Uji fungsi Kedai Kita.</h2></div><button id="closeDeveloperPanel" class="icon-btn" aria-label="Tutup">${icon('close')}</button></div><section class="dev-wallet" aria-label="Ubah duit Developer"><div class="dev-wallet-top"><span>DUIT KEDAI</span><strong id="devWalletBalance">${money(progress.wallet)}</strong></div><label for="devWalletAmount">Jumlah yang hendak diubah (RM)</label><div class="dev-wallet-form"><input id="devWalletAmount" type="number" min="0.01" max="1000000" step="0.01" inputmode="decimal" placeholder="Contoh: 500.00"><button type="button" id="devAddMoney" class="primary-btn">+ Tambah</button><button type="button" id="devSubtractMoney" class="secondary-btn">− Tolak</button></div><small id="devWalletHint">Nilai yang sama dipaparkan pada Duit Kedai di bahagian atas dan disimpan ke Firebase.</small></section>
 <section class="dev-money-reset" aria-label="Reset duit kedai sahaja"><div><b>Reset duit kedai</b><small>Set duit kepada RM0.00 tanpa mengubah hari, inventori, upgrade atau senario ujian.</small></div><button type="button" class="secondary-btn" id="devResetMoney">Reset duit</button></section>
 <h3>Ujian segera</h3><div class="dev-scenario-grid">
 <button data-dev-scenario="cash">💵 <b>Bayar tunai</b><small>Kira baki sendiri</small></button>
 <button data-dev-scenario="pin">💳 <b>Kad + PIN</b><small>Masukkan PIN</small></button>
 <button data-dev-scenario="decline">🚫 <b>Kad ditolak</b><small>Baki tidak cukup</small></button>
 <button data-dev-scenario="qr">📱 <b>Imbas QR</b><small>Bayaran e-wallet</small></button>
 <button data-dev-scenario="barcode">▥ <b>Barcode rosak</b><small>Masukkan kod manual</small></button>
 <button data-dev-scenario="rush">⚡ <b>Rush Hour</b><small>60s · 10s sabar · mesin tahap 5</small></button>
 <button data-dev-scenario="refundValid">↩ <b>Refund sah</b><small>Resit sepadan</small></button>
 <button data-dev-scenario="refundInvalid">⚠ <b>Refund salah</b><small>Resit tidak sepadan</small></button>
 <button data-dev-scenario="vip">★ <b>Pelanggan VIP</b><small>Cabaran tip</small></button>
 <button data-dev-scenario="full">🧰 <b>Semua upgrade</b><small>Inventori & peralatan penuh</small></button>
 <button data-dev-scenario="kitafood">🛵 <b>KitaFood</b><small>Rider tiba di kaunter</small></button>
 <button data-dev-scenario="kitafoodLate">⏳ <b>Pesanan lewat</b><small>Uji tanpa bonus</small></button>
 <button data-dev-scenario="lowStock">📦 <b>Stok rendah</b><small>Tinggal 1 unit / 1 kg</small></button>
 <button data-dev-scenario="outOfStock">🚫 <b>Stok kosong</b><small>Uji inventori habis</small></button>
 <button data-dev-scenario="noPaper">🧾 <b>Resit habis</b><small>Uji kertas kosong</small></button>
 <button data-dev-scenario="terminalBroken">🔧 <b>Terminal rosak</b><small>Uji pembaikan kad</small></button>
 <button data-dev-scenario="rushEnd">🏁 <b>Rush Hour tamat</b><small>Uji laporan khas</small></button>
 </div>
 <h3>Kawalan inventori & tahap kedai</h3>
 <div class="dev-controls-grid">
  <button class="secondary-btn" id="devUnlockAll">Buka semua 20 kategori</button>
  <button class="secondary-btn" id="devLockCategories">Kunci kategori tambahan</button>
  <button class="secondary-btn" id="devMaxUpgrades">Maksimumkan upgrade</button>
  <button class="secondary-btn" id="devResetUpgrades">Reset semua upgrade</button>
  <button class="secondary-btn" id="devRefillAll">Penuhkan semua stok</button>
  <button class="secondary-btn" id="devRepairAll">Baiki terminal & tambah resit</button>
 </div>
 <div class="dev-stock-tool"><label for="devStockProduct">Uji stok mengikut produk</label><select id="devStockProduct" aria-label="Pilih produk untuk ubah stok">${CATEGORIES.map(c=>`<optgroup label="${c.name}">${PRODUCTS.filter(p=>p.category===c.id).map(p=>`<option value="${p.id}">${p.name}${p.weighted?' (kg)':''}</option>`).join('')}</optgroup>`).join('')}</select><div class="dev-stock-row"><input id="devStockAmount" type="number" min="0" max="1000" step="1" value="5" inputmode="numeric" aria-label="Jumlah stok (unit atau kg)"><button type="button" class="primary-btn" id="devSetStock">Tetapkan stok</button></div><small>Untuk hasil segar, nilai stok dikira dalam kilogram. Tindakan mengubah sandbox sahaja.</small></div>
 <h3>Audit Firebase</h3><div class="dev-audit"><p>Semak simpanan sebenar melalui bacaan semula Realtime Database. Data ujian tidak akan bercampur dengan progres kerjaya.</p><button id="devVerifyFirebase" class="primary-btn">Simpan & semak Firebase</button><div id="devAuditResult" role="status" aria-live="polite">Belum diuji pada sesi ini.</div></div>
 <h3>Ujian hari permainan</h3><div class="dev-day-input"><label for="developerDay">Hari (1–60)</label><input id="developerDay" type="number" min="1" max="60" value="${progress.day}"><button id="devRunDay" class="primary-btn">Buka hari</button></div><section class="dev-data-reset" aria-label="Reset keseluruhan data ujian"><div><b>Reset semua data ujian</b><small>Padam progres ujian sahaja termasuk hari, inventori, upgrade dan duit kedai. Akaun Firebase kekal.</small></div><button type="button" class="secondary-btn" id="devClearSandbox">Reset data ujian</button></section><p id="devResetError" class="dev-reset-error" role="alert" aria-live="polite"></p><div class="dev-panel-footer"><button class="primary-btn" id="devBack">Kembali ke game</button></div></div>`);
 $('closeDeveloperPanel').onclick=closeModal;$('devBack').onclick=closeModal;
 async function storeDeveloperWallet(next,action){
  if(!assertDeveloper())return;
  if(!Number.isSafeInteger(next)||next<0||next>1000000000){toast('Jumlah duit tidak sah.',true);return}
  const controls=[$('devAddMoney'),$('devSubtractMoney'),$('devResetMoney'),$('devClearSandbox')];
  controls.forEach(x=>x.disabled=true);
  const hint=$('devWalletHint');hint.textContent='Menyimpan '+action+' ke Firebase…';
  const snapshot=captureGame();
  const fresh={...snapshot,progress:{...snapshot.progress,wallet:next}};
  try{
   await cloud.resetProgress(fresh); // Wait for the authoritative remote save, not a delayed queue.
   progress.wallet=next;renderHeader();$('devWalletBalance').textContent=money(progress.wallet);
   hint.textContent='✓ '+action+' disimpan. Duit Kedai sama dengan paparan utama.';
   $('devWalletAmount').value='';toast(action+' · '+money(next));
  }catch(error){
   hint.textContent='⚠ Simpanan gagal. Duit kedai tidak diubah. '+String(error?.message||'Cuba semula.');
   toast('Tidak dapat menyimpan duit kedai. Cuba semula.',true);
  }finally{controls.forEach(x=>x.disabled=false)}
 }
 for(const [buttonId,sign] of [['devAddMoney',1],['devSubtractMoney',-1]]){
  $(buttonId).onclick=async()=>{
   if(!assertDeveloper())return;
   const raw=$('devWalletAmount').value.trim();
   if(!/^(?:\d{1,7})(?:\.\d{1,2})?$/.test(raw)){toast('Masukkan amaun RM0.01 hingga RM1,000,000.00 (maksimum dua perpuluhan).',true);return}
   const cents=Math.round(Number(raw)*100);
   if(cents<1||cents>100000000){toast('Amaun mestilah RM0.01 hingga RM1,000,000.00.',true);return}
   const next=progress.wallet+sign*cents;
   if(next<0){toast('Duit kedai tidak mencukupi untuk ditolak.',true);return}
   await storeDeveloperWallet(next,sign>0?'Tambah duit':'Tolak duit');
  };
 }
 $('devResetMoney').onclick=async()=>{
  if(!assertDeveloper())return;
  await storeDeveloperWallet(0,'Reset duit kedai');
 };
 $('modalContent').querySelectorAll('[data-dev-scenario]').forEach(btn=>btn.onclick=()=>runDeveloperScenario(btn.dataset.devScenario));
 $('devRunDay').onclick=()=>runDeveloperScenario('day',Number($('developerDay').value));
 function developerEdit(change,description){
  if(!assertDeveloper())return;
  change();ensureOperations(progress);render();save();toast(description+' · menyimpan sandbox Firebase');
 }
 $('devUnlockAll').onclick=()=>developerEdit(()=>{progress.unlocked=CATEGORIES.map(c=>c.id);for(const p of PRODUCTS)if(!progress.inventory[p.id])progress.inventory[p.id]=stockTarget(p,progress)},'Semua kategori dibuka');
 $('devLockCategories').onclick=()=>developerEdit(()=>{progress.unlocked=['essentials']},'Kategori tambahan dikunci');
 $('devMaxUpgrades').onclick=()=>developerEdit(()=>{for(const u of UPGRADES)progress.upgrades[u.id]=u.max;},'Upgrade dimaksimumkan');
 $('devResetUpgrades').onclick=()=>developerEdit(()=>{for(const u of UPGRADES)progress.upgrades[u.id]=0;},'Upgrade direset');
 $('devRefillAll').onclick=()=>developerEdit(()=>{for(const p of PRODUCTS)progress.inventory[p.id]=stockTarget(p,progress)},'Semua stok penuh');
 $('devRepairAll').onclick=()=>developerEdit(()=>{progress.paper=120;progress.cardHealth=100;progress.cardBroken=false;},'Bekalan dan terminal dipulihkan');
 $('devSetStock').onclick=()=>{
  const id=$('devStockProduct').value,p=PRODUCTS.find(p=>p.id===id),raw=$('devStockAmount').value;
  if(!p||!/^\d{1,4}$/.test(raw)||Number(raw)>1000){toast('Masukkan kuantiti sah antara 0–1000.',true);return;}
  developerEdit(()=>{progress.inventory[p.id]=Number(raw)*(p.weighted?1000:1)},p.name+' · '+raw+(p.weighted?' kg':' unit'));
 };
 $('devVerifyFirebase').onclick=async()=>{
  const button=$('devVerifyFirebase'),out=$('devAuditResult');button.disabled=true;out.textContent='Menyimpan kemudian membaca data dari Firebase…';
  try{save();await cloud.flush();const result=await cloud.verifyFirebase();out.textContent=`✓ Disahkan Firebase · Hari ${result.day} · Duit ${money(result.wallet)} · ${result.items} rekod inventori · ${result.categories} kategori dibuka · ${result.upgrades} jenis upgrade · ${result.delivery} pesanan KitaFood · ${result.developer?'Sandbox ujian':'Kerjaya'}`;toast('Bacaan semula Firebase berjaya.');}
  catch(err){out.textContent='⚠ Pengesahan gagal: '+String(err?.message||'Tidak dapat mencapai Firebase.');toast('Simpanan Firebase belum dapat disahkan.',true)}
  finally{button.disabled=false;}
 };
 $('devClearSandbox').onclick=async()=>{
  if(!assertDeveloper())return;
  const controls=[$('devAddMoney'),$('devSubtractMoney'),$('devResetMoney'),$('devClearSandbox')];
  controls.forEach(x=>x.disabled=true);
  const error=$('devResetError');if(error)error.textContent='';
  const fresh={progress:createProgress(),session:null,sound};
  try{
   await cloud.resetProgress(fresh);
   scanToken++;clearTimeout(resultTimer);stopScannerSound();stopScaleSound();stopDrawerSound();stopChaChing();
   explicitPause=true;hydrateGame(fresh);render();save();
   // hydrateGame() has already opened the fresh Day 1 intro. Do not reopen the
   // developer panel here: it can leave the newly reset game paused behind a modal.
   toast('Data ujian disahkan reset dalam Firebase. Buka kedai untuk Hari 1.');
  }catch(error){
   if($('devResetError'))$('devResetError').textContent='Reset data ujian gagal. '+String(error?.message||'Cuba semula.');
   toast('Reset data ujian gagal.',true);
  }finally{controls.forEach(x=>{if(x)x.disabled=false})}
 };
}
developerAccessChanged(false);
cloud=createCloudSync({
 capture:captureGame,
 hydrate:hydrateGame,
 pauseForAccount:()=>{if(!paused&&modalKind!=='intro')showPause()},
 report:label=>{if($('saveStatus'))$('saveStatus').textContent=label},
 onDeveloperChanged:developerAccessChanged
});
delivery=createDelivery({getProgress:()=>progress,getSession:()=>session,getMode:()=>mode,save,notify:toast,money,products:PRODUCTS,categories:CATEGORIES,productArt,icon,openModal,closeModal,receiveCash:receiveStoreCash,onFinish:(order,completed)=>{
 if(customer?.kind==='kitafood'&&customer.orderId===order.id){
  scanToken++;customer=null;phase='waiting';renderedSceneCustomer=undefined;renderedBasket=null;
  session.index++;session.waitSeconds=0;
  // Delivery handoff increments session.served in delivery.mjs. Do not count
  // the same rider again here. A cancelled order does not meet the daily quota.
  save();
  if(mode==='career'&&session.rushReportPending&&showRushEnd())return;
  if(mode==='career'&&beginDailyRush())return;
  if(mode==='career'&&dayFinished(session,progress.day)){
   phase='end';save();render();showShiftClosing();
  }else newCustomer();
  toast(completed?'Pesanan KitaFood selesai. Pelanggan seterusnya tiba!':'Rider beredar. Sambung layan pelanggan.');
 }else {renderHeader();}
}});
initIllustrations();icons();renderHeader();renderScene();renderProducts();renderPayment();showIntro();
$('developerPanelBtn').onclick=()=>{if(assertDeveloper())showDeveloperPanel()};
$('deliveryBtn').onclick=()=>delivery.open(customer?.kind==='kitafood'?customer.orderId:undefined);$('inventoryBtn').onclick=()=>showInventory();$('calcBtn').onclick=showCalculator;$('missionBtn').onclick=showMissions;$('catalogueBtn').onclick=()=>showCodePad();$('settingsBtn').onclick=showSettings;$('bagZone').onclick=showBag;$('nightBtn').onclick=toggleDark;$('undoScanBtn').onclick=undoScan;
$('counterTab').onclick=()=>setMobileView('counter');$('paymentTab').onclick=()=>setMobileView('payment');
$('soundBtn').onclick=()=>{sound=!sound;if(!sound){stopScannerSound();stopChaChing();stopScaleSound();stopDrawerSound()}renderHeader();save()};$('pauseBtn').onclick=()=>{if($('modal').open){if(!['intro','summary','rush-start','rush-end'].includes(modalKind))closeModal()}else showPause()};$('shopBtn').onclick=()=>{if(modalKind==='intro')return;showShop()};$('fullBtn').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('Ajukan peranti secara melintang untuk ruang lebih luas.')}catch{toast('Skrin penuh tidak disokong di pelayar ini.')}};
$('scannerZone').onclick=()=>{if(paused)return;toast('Tekan barang berbungkus atau seret ke scanner.')};$('scaleZone').onclick=()=>{if(paused)return;toast('Tekan hasil segar atau seret ke penimbang.')};
$('modal').addEventListener('cancel',e=>{e.preventDefault();if(!['intro','summary','rush-start','rush-end'].includes(modalKind))closeModal()});
document.addEventListener('keydown',e=>{
 const categoryDialog=document.getElementById('categoryProductDialog');
 if(categoryDialog?.open&&(e.key==='Escape'||e.key.toLowerCase()==='p')){e.preventDefault();if(e.key==='Escape')categoryDialog.close();return}
 const editing=e.target?.matches?.('input, textarea, select, [contenteditable="true"]');
 if(editing&&e.key!=='Escape')return;
 if(handleCalculatorKey(e)||handlePaymentOverlayKey(e))return;
 if(e.key==='Escape'||e.key.toLowerCase()==='p'){
  if(e.key.toLowerCase()==='p'&&$('modal').open&&modalKind!=='pause'){
   // Jangan tutup atau lompat ke rak KitaFood apabila P ditekan dalam popup.
   e.preventDefault();return;
  }
  if($('modal').open){if(!['intro','summary','rush-start','rush-end'].includes(modalKind)){e.preventDefault();closeModal()}}
  else{e.preventDefault();showPause()}
  return;
 }if(!paused&&phase==='offer'&&customer?.cardStage==='pin'&&(/^\d$/.test(e.key)||['Backspace','Enter'].includes(e.key))){e.preventDefault();pressPin(e.key==='Backspace'?'⌫':e.key==='Enter'?'OK':e.key);return}if(!paused&&!editing&&/^[1-9]$/.test(e.key)&&customer){const p=(Array.isArray(customer.items)?customer.items:[]).filter(p=>!p.scanned)[+e.key-1];if(p)processItem(p.uid)}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();cloud?.flush?.().catch(()=>{});if(!paused)showPause()}syncBackgroundMusic()});window.addEventListener('pagehide',()=>{save();cloud?.flush?.().catch(()=>{});musicUnlocked=false;musicFade=null;musicTarget=0;writeMusicLevel(0);$('backgroundMusic').pause();stopScannerSound();stopChaChing();stopScaleSound();stopDrawerSound()});window.addEventListener('pageshow',()=>{if(session&&modalKind!=='intro'){musicUnlocked=true;syncBackgroundMusic()}});
let lastTick=performance.now(),sinceSave=0;function loop(now){const dt=Math.min((now-lastTick)/1000,.1);lastTick=now;if(!paused&&!document.hidden&&session&&phase!=='end'){
 if(mode!=='practice'){session.clockMinutes=Math.min(1320,(session.clockMinutes||480)+dt*.35);renderOperations();sinceSave+=dt;if(sinceSave>5){save();sinceSave=0}}
 if(mode==='career'&&tickRushHour(session,dt)){
   restoreRushPatience();applyMachineSpeeds();
   session.rushReportPending=true;
   renderOperations();save();
   // Wait for the current Rush Hour customer to finish before displaying totals.
   if(!customer||['success','lost'].includes(phase)||!customer.rushCustomer){
     showRushEnd();requestAnimationFrame(loop);return;
   }
 }
 if(mode==='career'&&phase!=='delivery'&&!session.rushStarted&&beginDailyRush()){requestAnimationFrame(loop);return;}
 if(phase==='waiting'){session.waitSeconds=Math.max(0,session.waitSeconds-dt);renderWaiting();if(session.waitSeconds<=0)newCustomer()}
 else if(phase==='supply'&&readyForCustomer())newCustomer();
 else if(customer&&mode!=='practice'&&phase==='scan'){customer.elapsed+=dt;renderPatience();if(customer.elapsed>=customer.patience)loseCustomer()}
  // After checkout begins, countdown and impatience stay frozen until payment finishes.
 }requestAnimationFrame(loop)}requestAnimationFrame(loop);

function initIllustrations(){
 const pool=availableProducts(mode==='practice'?CATEGORIES.map(c=>c.id):progress.unlocked);const shelves=['shelfLeft','shelfRight'].map((id,n)=>[id,Array.from({length:12},(_,i)=>pool[(i+n*12)%pool.length].id)]);
 for(const [id,items]of shelves)$(id).innerHTML=[0,1,2].map(row=>'<div>'+items.slice(row*4,row*4+4).map(p=>productArt(p)).join('')+'</div>').join('');
}
function applySettings(){applyMachineSpeeds();const settings=progress.settings||{motion:true,theme:'mint'};document.body.classList.toggle('reduced-motion',settings.motion===false);document.body.setAttribute('data-theme',previewTheme||(settings.dark?'dark':settings.theme||'mint'));$('nightBtn').setAttribute('aria-pressed',String(!!settings.dark));$('nightLabel').textContent=settings.dark?'Cerah':'Gelap'}
function renderActivity(){
 // The compact POS header deliberately hides the nonessential activity label.
 // Older and newer index.html versions may omit this element entirely.
 // Never fail cloud-save hydration because an optional UI element is missing.
 const status=$('activityStatus');
 if(!status)return;
 if(!customer){
  status.textContent=phase==='supply'?'Tambah bekalan kedai':'Menunggu pelanggan';
  status.classList.remove('vip');
  return;
 }
 const left=(customer.items||[]).filter(p=>!p.scanned).length;
 status.textContent=phase==='success'?'Transaksi selesai · combo ×'+combo:customer.kind==='vip'?'VIP di kaunter · tip ×1.5':customer.kind==='express'?'Pelanggan ekspres · servis pantas':left?left+' barang lagi · '+(session?.scans||0)+' scan hari ini':'Semua barang sudah dibungkus';
 status.classList.toggle('vip',customer.kind==='vip');
}
function undoScan(){
 if(!customer||busy||phase!=='scan')return;
 const p=customer.items.filter(i=>i.scanned).sort((a,b)=>(b.scanOrder||0)-(a.scanOrder||0))[0];
 if(!p)return;if(p.weighted)resetStations();p.scanned=false;customer.discount=0;customer.couponApplied=false;session.scans=Math.max(0,(session.scans||0)-1);if(p.weighted)session.weighed=Math.max(0,(session.weighed||0)-1);
 renderProducts();renderReceipt();renderPayment();renderHeader();renderActivity();setMobileView('counter');save();toast('Scan '+p.name+' dibatalkan. Barang kembali tersedia.');
}
function showBag(){
 if(!customer||modalKind==='intro')return;
 const packed=customer.items.filter(i=>i.scanned);
 openModal('bag',`<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">SEMAK SEBELUM PELANGGAN BALIK</div><h2>Dalam beg belian.</h2></div><button class="icon-btn" id="closeBag" aria-label="Tutup">${icon('close')}</button></div><p>${packed.length} daripada ${customer.items.length} barang sudah dibungkus.</p><div class="bag-grid">${packed.length?packed.map(p=>`<div>${productArt(p.id)}<b>${p.name}</b><small>${p.weighted?(p.grams/1000).toFixed(3)+' kg':'1 unit'} · ${money(itemPrice(p))}</small></div>`).join(''):'<p class="muted">Beg masih kosong. Scan barang untuk memasukkannya ke sini.</p>'}</div><button class="primary-btn" id="backBag">Kembali ke kaunter ${icon('arrow')}</button></div>`);
 $('closeBag').onclick=closeModal;$('backBag').onclick=closeModal;
}
function showMissions(returnTo='game'){
 const destination=returnTo==='summary'||modalKind==='summary'?'summary':'game';
 if(!session||modalKind==='intro')return;
 openModal('missions',`<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">CABARAN HARI ${progress.day}</div><h2>Setiap syif, satu pencapaian.</h2></div><button class="icon-btn" id="closeMissions" aria-label="Tutup">${icon('close')}</button></div><p>${mode==='practice'?'Latihan santai: ganjaran wang hanya dalam kerjaya.':'Lengkapkan misi dan tuntut ganjaran sebelum hari seterusnya.'}</p><div class="mission-cards">${dailyMissions(session).map(m=>{const claimed=(session.claimedMissions||[]).includes(m.id),ready=m.value>=m.target;return `<div class="mission-card ${ready?'ready':''}"><span class="mission-symbol">${icon(m.id==='fresh'?'scale':m.id==='perfect'?'cash':'spark')}</span><div><h3>${m.title}</h3><p>${m.description}</p><div class="mission-track"><i style="width:${Math.min(100,m.value/m.target*100)}%"></i></div><small>${Math.min(m.value,m.target)} / ${m.target}</small></div><button class="secondary-btn" data-mission="${m.id}" ${claimed||!ready||mode==='practice'?'disabled':''}>${claimed?'Dituntut':money(m.reward)}</button></div>`}).join('')}</div><div class="career-stats"><span><small>DUIT TERKUMPUL</small><b>${money(progress.lifetime)}</b></span><span><small>COMBO TERBAIK</small><b>×${progress.bestCombo}</b></span><span><small>HARI BERMAIN</small><b>${progress.day}</b></span></div><button class="primary-btn" id="backMissions">Sambung syif ${icon('play')}</button></div>`);
 const back=()=>destination==='summary'?showSummary():closeModal();$('closeMissions').onclick=back;$('backMissions').onclick=back;
 $('modalContent').querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{if(claimMission(progress,session,b.dataset.mission)){save();renderHeader();beep('success');showMissions(destination);toast('Ganjaran misi masuk ke duit kedai!')}});
}
function showCalculator(){
 if(!session||modalKind==='intro'||modalKind==='summary')return;
 const panel=$('floatingCalculator');panel.hidden=false;
 panel.innerHTML=`<div class="floating-calc-header"><div id="calcDragHandle" role="button" tabindex="0" aria-label="Seret kalkulator. Gunakan kekunci anak panah untuk mengalihkannya.">${icon('calculator')}<b>Kalkulator</b><span>⠿</span></div><button id="closeCalculator" class="icon-btn" aria-label="Tutup kalkulator">${icon('close')}</button></div><div class="floating-calc-body"><div class="calc-screen"><small id="calcExpression">${calculatorInput||'PEMBANTU JURUWANG'}</small><strong id="calcDisplay">${calculatorResult||calculatorInput||'0'}</strong></div><div class="calc-presets"><button id="calcTotal">Jumlah</button><button id="calcTender">Diterima</button><button id="calcChange">Baki</button></div><div class="calc-keys">${['C','⌫','÷','×','7','8','9','−','4','5','6','+','1','2','3','=','0','.','00'].map(k=>`<button data-calc="${k}" class="${k==='='?'equals':''}">${k}</button>`).join('')}</div></div>`;
 $('closeCalculator').onclick=closeCalculator;
 panel.querySelectorAll('[data-calc]').forEach(b=>b.onclick=()=>pressCalculator(b.dataset.calc));
 function preset(expression,result=''){calculatorInput=expression;calculatorResult=result;updateCalculatorDisplay()}
 $('calcTotal').onclick=()=>{if(customer)preset((amountDue(customer)/100).toFixed(2))};
 $('calcTender').onclick=()=>{if(customer?.method==='cash'&&customer.kind!=='return')preset((customer.tender/100).toFixed(2))};
 $('calcChange').onclick=()=>{if(customer?.method==='cash'&&customer.kind!=='return')preset((customer.tender/100).toFixed(2)+'−'+(amountDue(customer)/100).toFixed(2),String((customer.tender-amountDue(customer))/100))};
 refreshCalculatorPresets();updateCalculatorDisplay();
 if(!calculatorPosition)calculatorPosition=preferredCalculatorPosition(panel);
 positionCalculator(calculatorPosition.x,calculatorPosition.y);
 const handle=$('calcDragHandle');
 handle.onpointerdown=e=>{if(e.button>0)return;const r=panel.getBoundingClientRect();calculatorDrag={pointer:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top,moved:false};handle.setPointerCapture(e.pointerId);panel.classList.add('dragging');e.preventDefault()};
 handle.onpointermove=e=>{const d=calculatorDrag;if(!d||d.pointer!==e.pointerId)return;d.moved||=Math.hypot(e.clientX-d.x,e.clientY-d.y)>4;positionCalculator(d.left+e.clientX-d.x,d.top+e.clientY-d.y)};
 handle.onpointerup=e=>{if(calculatorDrag?.pointer===e.pointerId)e.preventDefault();cancelCalculatorDrag()};
 handle.onpointercancel=cancelCalculatorDrag;
 handle.onclick=e=>{if(calculatorDrag?.moved)e.preventDefault()};
 handle.onkeydown=e=>{const step=e.shiftKey?30:10,moves={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};if(moves[e.key]){e.preventDefault();const [x,y]=moves[e.key];positionCalculator(calculatorPosition.x+x,calculatorPosition.y+y)}};
}
function isCompactPhoneLayout(){return Math.min(window.innerWidth||0,window.innerHeight||0)<520||window.innerWidth<=760}
function preferredCalculatorPosition(panel=$('floatingCalculator')){
 const w=window.innerWidth||390,h=window.innerHeight||844;
 if(isCompactPhoneLayout())return {x:8,y:Math.max(8,h-(panel?.getBoundingClientRect().height||320)-8)};
 return {x:18,y:Math.max(12,h-(panel?.getBoundingClientRect().height||320)-20)};
}
function closeCalculator(){const panel=$('floatingCalculator');if(!panel)return;panel.hidden=true;cancelCalculatorDrag()}
function cancelCalculatorDrag(){calculatorDrag=null;$('floatingCalculator')?.classList.remove('dragging')}
function positionCalculator(x,y){
 const panel=$('floatingCalculator');if(panel.hidden)return;
 const r=panel.getBoundingClientRect(),w=window.innerWidth||1024,h=window.innerHeight||768;
 const margin=isCompactPhoneLayout()?8:12;
 calculatorPosition={x:isCompactPhoneLayout()?margin:Math.max(margin,Math.min(Math.max(margin,w-r.width-margin),x)),y:Math.max(margin,Math.min(Math.max(margin,h-r.height-margin),y))};
 if(panel.style.left!=='0px')panel.style.left='0px';if(panel.style.top!=='0px')panel.style.top='0px';
 panel.style.transform=`translate3d(${calculatorPosition.x}px,${calculatorPosition.y}px,0)`;
 panel.style.setProperty('--calc-x',calculatorPosition.x+'px');
 panel.style.setProperty('--calc-y',calculatorPosition.y+'px');
}
function refreshCalculatorPresets(){if($('floatingCalculator')?.hidden||!$('calcTender'))return;const cash=customer?.method==='cash'&&customer.kind!=='return';$('calcTotal').disabled=!customer;$('calcTender').disabled=!cash;$('calcChange').disabled=!cash}
function updateCalculatorDisplay(){if(!$('calcDisplay'))return;$('calcExpression').textContent=calculatorResult?calculatorInput+' =':'Kalkulator cashier';$('calcDisplay').textContent=calculatorResult||calculatorInput||'0'}
function pressCalculator(k){
 if(k==='C'){calculatorInput='';calculatorResult=''}else if(k==='⌫'){calculatorInput=calculatorInput.slice(0,-1);calculatorResult=''}else if(k==='='){try{calculatorResult=String(calculateExpression(calculatorInput))}catch(e){toast(e.message,true)}}else{if(calculatorResult){calculatorInput=/[÷×−+]/.test(k)?calculatorResult:'';calculatorResult=''}if(calculatorInput.length+k.length<=32)calculatorInput+=k}updateCalculatorDisplay();
}
function handleCalculatorKey(e){
 const panel=$('floatingCalculator');if(!panel||panel.hidden||$('modal').open)return false;
 if(e.key==='Escape'){e.preventDefault();closeCalculator();return true}
 if(!e.target?.closest?.('#floatingCalculator'))return false;
 const mapped={'*':'×','/':'÷','-':'−','Enter':'=','Backspace':'⌫','Delete':'C'};
 if(/^\d$/.test(e.key)||['.','+','*','/','-','Enter','Backspace','Delete'].includes(e.key)){if(e.key==='Enter'&&e.target.tagName==='BUTTON')return false;e.preventDefault();pressCalculator(mapped[e.key]||e.key);playTapSound();return true}
 return false;
}

function productCode(p){return /^\d{4}$/.test(p.manualCode||'')?p.manualCode:(p.manualCode=randomManualCode())}
function showCodePad(uid=null){
 if(!session||modalKind==='intro')return;if(!customer){showCatalogue();return}
 const selected=customer.items.find(p=>p.uid===uid&&!p.scanned);selectedCodeItem=selected?.uid||null;
 if(!selected){showCatalogue();return}
 const code=productCode(selected);
 if(selected.damaged&&!selected.repaired){$('scannerStatus').textContent='Barcode rosak · masukkan kod pada label'}
 openModal('codes',`<div class="modal-pad manual-code-modal"><div class="modal-heading"><div><div class="modal-kicker">LABEL BARCODE ROSAK</div><h2>Masukkan kod pada barang.</h2></div><button class="icon-btn" id="closeCodes" aria-label="Tutup">${icon('close')}</button></div><div class="manual-item">${productArt(selected.id)}<div><b>${selected.name}</b><small>Salin kod rawak pada label gantian ini.</small><div class="broken-barcode" aria-label="Barcode koyak dan tidak boleh dibaca"><i></i><b>BARCODE ROSAK</b></div><strong class="random-code-label">${code}</strong></div></div><form id="manualForm" class="manual-entry"><input id="manualCode" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="4 digit pada label" aria-label="Kod rawak pada barang" autocomplete="off"><button class="primary-btn" type="submit">Scan kod ${icon('scan')}</button></form><p id="codeError" class="code-error" aria-live="polite"></p><div class="manual-keypad">${['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(k=>`<button type="button" data-manual-key="${k}">${k}</button>`).join('')}</div><p class="muted">Kod ini khas untuk barang ini sahaja. Barang lain akan menerima kod berbeza.</p></div>`);
 $('closeCodes').onclick=closeModal;
 $('modalContent').querySelectorAll('[data-manual-key]').forEach(b=>b.onclick=()=>{const input=$('manualCode'),k=b.dataset.manualKey;if(k==='C')input.value='';else if(k==='⌫')input.value=input.value.slice(0,-1);else if(input.value.length<4)input.value+=k});
 $('manualForm').onsubmit=e=>{e.preventDefault();if($('manualCode').value.trim()!==code){$('codeError').textContent='Kod tidak sepadan dengan label. Cuba semula.';beep('error');return}selected.repaired=true;closeModal();processItem(selected.uid,null,true)};
}
function showSettings(){
 if(!session||modalKind==='intro')return;
 const settings=progress.settings||{motion:true,theme:'mint'};
 openModal('settings',`<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">KEDAI IKUT GAYA ANDA</div><h2>Tetapan.</h2></div><button class="icon-btn" id="closeSettings" aria-label="Tutup">${icon('close')}</button></div><div class="setting-row"><div><b>Semua bunyi</b><small>Aktifkan atau senyapkan audio game.</small></div><button class="toggle ${sound?'on':''}" id="toggleSound" aria-label="Efek bunyi" aria-pressed="${sound}"><i></i></button></div><div class="sound-settings"><label for="soundVolume">Volume efek bunyi <b id="volumeLabel">${Math.round(audioVolume()*100)}%</b></label><input id="soundVolume" type="range" min="0" max="100" step="5" value="${Math.round(audioVolume()*100)}" aria-label="Kekuatan bunyi"></div>${effectSettingsHTML()}${musicSettingsHTML()}<div class="setting-row"><div><b>Animasi penuh</b><small>Gerakan produk, pelanggan dan konfeti.</small></div><button class="toggle ${settings.motion!==false?'on':''}" id="toggleMotion" aria-label="Animasi penuh" aria-pressed="${settings.motion!==false}"><i></i></button></div><div class="theme-heading">Warna kedai</div><button class="secondary-btn" id="openStyles">Preview & beli warna kedai</button><p class="muted">Mod santai tidak mengubah progres kerjaya.</p><section class="game-reset-compact" aria-label="Pengurusan progres"><div><strong>Reset progres</strong><small>Mulakan semula dari Hari 1. Akaun log masuk kekal.</small></div><button type="button" class="secondary-btn" id="openResetGame">Reset</button></section><button class="primary-btn" id="backSettings">Selesai ${icon('check')}</button></div>`);
 bindEffectSettings();bindMusicSettings();$('closeSettings').onclick=closeModal;$('backSettings').onclick=closeModal;
 $('soundVolume').oninput=()=>{progress.settings.volume=Number($('soundVolume').value)/100;$('volumeLabel').textContent=Math.round(audioVolume()*100)+'%';refreshEffectLevels();save()};
 $('toggleSound').onclick=()=>{sound=!sound;if(!sound){stopScannerSound();stopChaChing();stopScaleSound();stopDrawerSound()}save();renderHeader();showSettings()};
 $('toggleMotion').onclick=()=>{progress.settings??={theme:'mint',motion:true};progress.settings.motion=progress.settings.motion===false;applySettings();save();showSettings()};
 $('openStyles').onclick=()=>showStyles();$('openResetGame').onclick=showResetGameConfirm;
}


// Two independent checks: a randomly generated multiplication question first,
// then explicit consent. Neither step changes local or remote game data.
function openSafeResetFlow({title,description,onCancel,onExecute}){
 const first=2+Math.floor(Math.random()*8),second=2+Math.floor(Math.random()*8);
 openModal('reset-challenge',`<div class="modal-pad reset-security"><div class="modal-heading"><div><div class="modal-kicker">PENGESAHAN 1 DARIPADA 2</div><h2>Semak sebelum reset.</h2></div><button class="icon-btn" id="cancelResetX" aria-label="Batal">${icon('close')}</button></div><p class="muted">Untuk meneruskan <b>${title}</b>, jawab soalan ringkas ini dahulu. Tiada data akan dipadam pada langkah ini.</p><form id="resetMathForm" class="reset-math-form"><label for="resetMathAnswer">Berapakah ${first} × ${second}?</label><input id="resetMathAnswer" type="number" inputmode="numeric" min="0" max="100" step="1" required placeholder="Masukkan jawapan" autocomplete="off"><p class="reset-error" id="resetMathError" role="alert" aria-live="polite"></p><div class="reset-actions"><button type="button" class="secondary-btn" id="cancelResetGame">Batal</button><button type="submit" class="primary-btn">Semak jawapan ${icon('arrow')}</button></div></form></div>`);
 const cancel=()=>onCancel();
 $('cancelResetX').onclick=cancel;$('cancelResetGame').onclick=cancel;
 $('resetMathForm').onsubmit=event=>{
  event.preventDefault();
  if(Number($('resetMathAnswer').value)!==first*second||!$('resetMathAnswer').value.trim()){
   $('resetMathError').textContent='Jawapan tidak tepat. Cuba sekali lagi.';beep('error');return;
  }
  $('modalContent').innerHTML=`<div class="modal-pad reset-security"><div class="modal-heading"><div><div class="modal-kicker">PENGESAHAN 2 DARIPADA 2</div><h2>Setuju untuk reset?</h2></div><button class="icon-btn" id="cancelResetX" aria-label="Batal">${icon('close')}</button></div><div class="reset-warning"><span class="reset-warning-symbol">${icon('help')}</span><div><b>${title}</b><p>${description}</p></div></div><label class="reset-confirm-label"><input type="checkbox" id="resetConfirmCheck"><span>Saya faham perubahan ini kekal dan saya bersetuju untuk meneruskannya.</span></label><p class="reset-error" id="resetError" role="alert" aria-live="polite"></p><div class="reset-actions"><button class="secondary-btn" id="cancelResetGame">Batal</button><button class="primary-btn reset-danger" id="confirmResetGame" disabled>Ya, saya setuju</button></div></div>`;
  $('cancelResetX').onclick=cancel;$('cancelResetGame').onclick=cancel;
  const btn=$('confirmResetGame');$('resetConfirmCheck').onchange=()=>btn.disabled=!$('resetConfirmCheck').checked;
  btn.onclick=async()=>{
   if(btn.disabled||!$('resetConfirmCheck').checked)return;
   btn.disabled=true;$('cancelResetGame').disabled=true;$('cancelResetX').disabled=true;
   btn.textContent='Sedang menyimpan…';
   try{await onExecute()}
   catch(error){
    $('resetError').textContent='Reset tidak berjaya. Data asal dikekalkan. '+String(error?.message||'Semak sambungan Firebase dan cuba lagi.');
    btn.textContent='Cuba reset semula';btn.disabled=false;
    $('cancelResetGame').disabled=false;$('cancelResetX').disabled=false;
   }
  };
 };
}
function showResetGameConfirm(){
 if(modalKind!=='settings')return;
 openSafeResetFlow({
  title:'Reset progres permainan',
  description:'Hari, duit kedai, inventori, kelas, upgrade, statistik dan syif akan kembali ke tetapan asal. Akaun Firebase kekal. Tindakan ini tidak boleh dibatalkan.',
  onCancel:showSettings,
  onExecute:async()=>{
   const fresh={progress:createProgress(),session:null,sound};
   if(cloud)await cloud.resetProgress(fresh);
   else localStorage.setItem(STORAGE,JSON.stringify(fresh));
   scanToken++;clearTimeout(resultTimer);advancePending=false;explicitPause=true;
   closeCalculator();stopScannerSound();stopScaleSound();stopDrawerSound();stopChaChing();hideUpdatePrompt();
   hydrateGame(fresh);toast('Progres berjaya direset. Selamat datang ke Hari 1!');
  }
 });
}

function normalizeSession(){
 if(!session)return;ensureOperations(progress);ensureShift(session);if(!customer)return;
 if(customer.kind==='kitafood'){session.seenPeople??=[];return;}
 if(!Array.isArray(customer.items)){customer=null;phase='waiting';session.customer=null;session.phase='waiting';session.waitSeconds=0;return;}
 ensureReturnClaim();customer.willTip??=(customer.dialogueSeed||0)%10<4;
 session.seenPeople??=[];
 customer.person=PEOPLE.find(p=>p.id===customer.person.id||p.name===customer.person.name)||customer.person;
 const id=customer.person.id||customer.person.name;if(!session.seenPeople.includes(id))session.seenPeople.push(id);
 customer.cardPin??=String(1000+Math.floor(Math.random()*9000));customer.requiresPin??=customer.method==='card'&&Math.random()<.5;
 if(mode!=='practice'&&!availablePaymentMethods(progress.upgrades).includes(customer.method)&&!['success','end'].includes(phase)){customer.method='cash';customer.tender=tenderFor(amountDue(customer));customer.requiresPin=false;customer.paymentChanged=true;phase=customer.items.every(i=>i.scanned)?'offer':'scan'}
 customer.cardContactReady=false;if(customer.cardStage!=='pin')customer.cardPose=null;customer.qrScanned=false;customer.qrArmed=false;customer.cardStage=['pin','ready','declined'].includes(customer.cardStage)?customer.cardStage:'ready';customer.pinInput??='';
 customer.items.forEach(p=>{if(p.damaged&&!/^\d{4}$/.test(p.manualCode||''))p.manualCode=randomManualCode()});
}
function toggleDark(){progress.settings??={motion:true,theme:'mint'};progress.settings.dark=!progress.settings.dark;applySettings();save()}
function avatarDetails(p){return `<g class="avatar-details">${p.hairStyle==='long'&&!p.scarf&&p.hat!=='songkok'?`<path d="M53 70Q34 141 53 177l17-19-12-55m86-33q18 70 0 107l-15-19 12-55" fill="${p.hair}"/>`:''}${p.hairStyle==='curly'&&p.hat!=='songkok'?`<g fill="${p.hair}">${[55,70,85,100,115,130,145].map((x,i)=>`<circle cx="${x}" cy="${44+Math.abs(i-3)*5}" r="13"/>`).join('')}</g>`:''}${p.hairStyle==='bun'&&p.hat!=='songkok'?`<circle cx="101" cy="25" r="19" fill="${p.hair}"/>`:''}${p.hat==='songkok'?'<path d="M51 84V30q49-15 98 0v54q-49-13-98 0" fill="#203430" stroke="#172a27" stroke-width="2"/><path d="M55 43q45-7 90 0" stroke="#52605a" stroke-width="2" fill="none"/><path d="M54 81q46-12 92 0" stroke="#122a26" stroke-width="3" fill="none"/>':p.hat==='turban'?`<path d="M50 71Q35 17 100 15q65 2 50 56l-50-28Z" fill="${p.hatColor||'#766887'}"/><path d="m50 55 49-25 51 25M55 40l45 14 45-14" fill="none" stroke="#fff" opacity=".28" stroke-width="3"/>`:''}${p.beard?`<path d="M58 120q12 28 32 14h21q22 14 32-14-4 43-43 47-39-4-42-47" fill="${p.hair}" opacity=".8"/>`:''}${p.moustache?`<path d="M100 128q-9-4-20 8 12 3 20-3 9 6 21 3-12-12-21-8" fill="${p.hair}"/>`:''}${p.earrings&&!p.scarf?'<g stroke="#e5bb5e" stroke-width="3" fill="none"><circle cx="55" cy="121" r="5"/><circle cx="146" cy="121" r="5"/></g>':''}</g>`}
function showCatalogue(){
 openModal('catalogue',`<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">${PRODUCTS.length} BARANG · ${CATEGORIES.length} KATEGORI</div><h2>Katalog Kedai</h2></div><button class="icon-btn" id="closeCatalogue" aria-label="Tutup">${icon('close')}</button></div><div class="catalogue-filters">${CATEGORIES.map(c=>`<button data-filter="${c.id}" class="secondary-btn">${c.name}${mode!=='practice'&&!progress.unlocked.includes(c.id)?' · Terkunci':''}</button>`).join('')}</div><div class="catalogue-grid" id="catalogueItems"></div></div>`);
 function fill(id){const unlocked=mode==='practice'||progress.unlocked.includes(id);$('catalogueItems').innerHTML=PRODUCTS.filter(p=>p.category===id).map(p=>`<div class="catalogue-item ${unlocked?'':'locked'}">${productArt(p.id)}<b>${p.name}</b><small>${money(p.price)}${p.weighted?'/kg':''}</small>${unlocked?'':`<span class="catalogue-lock">${icon('lock')} Upgrade kategori</span>`}</div>`).join('')}
 $('closeCatalogue').onclick=closeModal;$('modalContent').querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>fill(b.dataset.filter));fill('essentials');
}
function cashArtStack(amount){return changeParts(amount).parts.flatMap(p=>Array.from({length:p.count},()=>p.value)).slice(0,8).map((v,i)=>`<span style="--note-index:${i}">${moneyArt(v)}</span>`).join('')}
function renderDigital(){
 if(customer.method==='card'){renderCardTerminal();return}
 const stage=customer.cardStage||'ready',working=stage==='processing';
 $('paymentArea').innerHTML=`<div id="payDevice" class="payment-scene qr-scene qr-balanced stage-${stage}"><div class="customer-phone"><div class="phone-camera"></div><small>DOMPET PELANGGAN</small><b>${customer.person.name}</b><button class="phone-qr" id="qrTarget" aria-label="Imbas kod QR pada telefon" ${working?'disabled':''}>${qrArt()}<i class="qr-scan-line"></i></button><span>${money(amountDue(customer))}</span><small>Tunjukkan kod untuk diimbas</small></div><div class="qr-hand-scanner" id="qrScanner" role="button" tabindex="0" aria-label="Ambil scanner kemudian imbas QR">${icon('scan')}<i></i></div><div class="qr-light-cone"></div></div><p class="payment-hint qr-instructions">${working?'Mengesahkan bayaran…':'Seret scanner ke kod QR pada telefon, atau tekan scanner kemudian tekan kod QR.'}</p>`;
 if(!working)bindQrScanner();
}
const CARD_DECLINE_MESSAGES={
 insufficient:'Baki kad tidak mencukupi. Minta pelanggan menggunakan kad lain atau wang tunai.',
 technical:'Rangkaian bank terganggu. Cuba sentuh kad sekali lagi atau gunakan tunai.',
 expired:'Kad pelanggan telah tamat tempoh. Gunakan kad lain atau wang tunai.'
};
function declineCardIfNeeded(transaction){
 if(!transaction||transaction!==customer||transaction.method!=='card')return false;
 // Map old in-progress saves that used a generic card-failure flag.
 const reason=transaction.cardDeclineReason||(transaction.cardFailure?'technical':null);
 if(!reason||transaction.cardDeclineHandled)return false;
 transaction.cardDeclineHandled=true;transaction.cardFailure=false;
 transaction.cardDeclineReason=reason;transaction.cardStage='declined';
 transaction.cardContactReady=false;transaction.cardPose=null;transaction.pinInput='';
 busy=false;renderPayment();save();beep('error');return true;
}
function resolveCardDecline(action){
 if(paused||busy||phase!=='offer'||customer?.method!=='card'||customer.cardStage!=='declined')return;
 if(action==='cash'){
  customer.method='cash';customer.cardDeclineReason=null;customer.cardStage='ready';
  customer.cardContactReady=false;customer.cardPose=null;customer.pinInput='';
  customer.tender=tenderFor(amountDue(customer));
  toast('Pelanggan memilih tunai. Terima duit dan pulangkan baki.');
 }else if(action==='other-card'){
  customer.cardDeclineReason=null;customer.cardStage='ready';
  customer.cardContactReady=false;customer.cardPose=null;customer.pinInput='';
  customer.cardPin=String(1000+Math.floor(Math.random()*9000));customer.cardExpiry='12/28';
  const all=['theme-green','theme-gold','theme-pink','theme-black'];
  customer.cardTheme=all[(all.indexOf(customer.cardTheme)+1+all.length)%all.length];
  toast('Kad baharu diberikan. Sentuh kad pada terminal semula.');
 }else return;
 renderPayment();renderReceipt();renderScene();save();
}
async function startDigital(confirmed=false){
 if(paused||busy||phase!=='offer'||['pin','declined'].includes(customer.cardStage)||(customer.method==='qr'&&!customer.qrScanned)||!ensurePaper())return;
 const card=customer.method==='card',store=operatingStore();
 if(card&&(!confirmed||!customer.cardContactReady))return;
 if(card&&store.cardBroken){renderPayment();beep('error');return;}
 busy=true;const token=scanToken,transaction=customer;customer.cardStage=card?'contact':'processing';renderPayment();save();
 const qrLevel=Math.max(1,Math.min(5,Number(progress.upgrades.qr)||1));
 if(!await delayActive(card?520:Math.max(580,1400-(qrLevel-1)*205),token))return;
 busy=false;beep('scan');
 if(card&&customer.requiresPin){customer.cardStage='pin';customer.pinInput='';renderPayment();save();return}
 if(card&&declineCardIfNeeded(transaction))return;
 completePayment(transaction);
}
function renderCardTerminal(){
 const stage=customer.cardStage||'ready',pin=stage==='pin',declined=stage==='declined',working=['contact','processing'].includes(stage);
 const action='Sentuh kad pada terminal';
 const keys=['1','2','3','4','5','6','7','8','9','⌫','0','OK'];
 const themes=['theme-green','theme-gold','theme-pink','theme-black'];
 customer.cardTheme??=themes[Math.floor(Math.random()*themes.length)];
 const holder=(customer.person?.name||'Pelanggan').toUpperCase();
 const helper=declined?'Transaksi tidak berjaya. Lihat arahan di bawah.':pin?'Masukkan 4 digit PIN dan tekan OK':working?'Sila tunggu pengesahan terminal':customer.requiresPin?'Sentuh kad pada terminal. Kemudian masukkan PIN':'Sentuh kad pada terminal';
 $('paymentArea').innerHTML=`<div id="payDevice" class="payment-scene modern-card-scene stage-${stage}"><div class="terminal-v2"><div class="terminal-v2-top"></div><div class="contact-reader" id="cardReaderTarget"><span class="reader-icon" aria-hidden="true"></span><small>SENTUH KAD PADA TERMINAL</small></div><div class="terminal-v2-screen-frame"><div class="terminal-v2-screen"><small>${declined?'BAYARAN DITOLAK':pin?'MASUKKAN PIN':working?'SEDANG MEMPROSES':'TERMINAL SEDIA'}</small><b>${declined?'DECLINED':pin?('●'.repeat(customer.pinInput.length)||'_ _ _ _'):money(amountDue(customer))}</b><span>${helper}</span></div></div><div class="terminal-v2-keys">${keys.map(k=>`<button type="button" data-terminal-pin="${k}" class="${k==='OK'?'pin-ok':k==='⌫'?'pin-clear':''}" ${pin?'':'disabled'} aria-label="${k==='⌫'?'Padam':k==='OK'?'Sahkan PIN':k}">${k}</button>`).join('')}</div></div><button class="payment-bankcard ${customer.cardTheme}" id="swipeCard" ${working||pin||declined?'disabled':''} aria-label="${action}"><span class="bank-name">KITA BANK</span><span class="card-motif" aria-hidden="true"></span><i class="card-chip"></i><span class="card-wave" aria-hidden="true">))))</span><b class="card-number">4826 2026 1234 5678</b><em class="card-expiry">${customer.cardExpiry||(customer.cardDeclineReason==='expired'?'09/26':'12/26')}</em><small class="card-holder">${holder}</small><strong class="card-brand">mc</strong></button><span class="terminal-action-label">${declined?'Pilih kaedah bayaran seterusnya':pin?'Masukkan 4 digit PIN pada terminal':working?'Kad sedang dibaca…':'Sentuh kad pada terminal'}</span></div>${pin?`<div class="card-pin-guide"><small>PIN pelanggan</small><strong>${customer.cardPin}</strong><span id="pinError" class="code-error">${customer.pinError||''}</span></div>` : declined?`<div class="card-decline-panel"><b>Transaksi kad tidak berjaya</b><p>${CARD_DECLINE_MESSAGES[customer.cardDeclineReason]||'Pilih kaedah bayaran lain.'}</p><div class="card-decline-actions"><button type="button" class="secondary-btn" data-card-recovery="other-card">${customer.cardDeclineReason==='technical'?'Cuba semula':'Guna kad lain'}</button><button type="button" class="secondary-btn" data-card-recovery="cash">Bayar tunai</button></div></div>` : `<div class="card-drag-instruction">${customer.requiresPin?'Sentuh kad pada terminal. Selepas itu masukkan PIN pelanggan.':'Sentuh kad pada terminal untuk lengkapkan pembayaran.'}</div>`}`;
 if(declined){$('paymentArea').querySelectorAll('[data-card-recovery]').forEach(b=>b.onclick=()=>resolveCardDecline(b.dataset.cardRecovery));return}
 if(pin){setCardPose();$('paymentArea').querySelectorAll('[data-terminal-pin]').forEach(b=>b.onclick=()=>pressPin(b.dataset.terminalPin));return}
 if(working)setCardPose();else bindBankCardDrag();
}
function pressPin(key){
 if(paused||busy||phase!=='offer'||customer.cardStage!=='pin')return;
 customer.pinError='';
 if(key==='⌫')customer.pinInput=customer.pinInput.slice(0,-1);
 else if(key==='OK'){
   if(customer.pinInput!==customer.cardPin){customer.pinError='PIN tidak tepat. Semak nombor yang pelanggan beri.';customer.pinInput='';beep('error');renderPayment();save();return}
   busy=true;customer.cardStage='processing';const token=scanToken,transaction=customer;renderPayment();save();beep('scan');delayActive(900,token).then(valid=>{if(valid){busy=false;if(declineCardIfNeeded(transaction))return;completePayment(transaction)}});return;
 }else if(/^\d$/.test(key)&&customer.pinInput.length<4)customer.pinInput+=key;
 renderPayment();save();
}

function applyMachineSpeeds(){
 const speed=machineTimings(gameplayMachineUpgrades());
 document.body.style.setProperty('--scan-duration',speed.scanMs+'ms');
 document.body.style.setProperty('--belt-duration',speed.beltMs+'ms');
 document.body.style.setProperty('--item-slide-duration',speed.slideMs+'ms');
 $('scannerZone').setAttribute('title','Scanner · '+speed.scanMs/1000+' saat');
 $('scaleZone').setAttribute('title','Penimbang · '+speed.weighMs/1000+' saat');
}
function machineUpgradeInfo(id,level,max){
 if(id==='rushBoost')return `<span class="machine-speed">Bonus Rush Hour: ×${rushHourMultiplier(progress.upgrades).toFixed(1)} → ×${rushHourMultiplier({...progress.upgrades,rushBoost:Math.min(max,level+1)}).toFixed(1)} · ${level>=max?'Maksimum':'Tambah +0.3 setiap tahap'}</span>`;
 if(id==='storage')return `<span class="machine-speed">Had stok: ${stockCapacity(progress)} → ${level<max?stockCapacity({upgrades:{storage:level+1}}):stockCapacity(progress)} unit/kg</span>`;
 if(!['scanner','scale','conveyor'].includes(id))return '';
 const current=machineTimings(progress.upgrades),next=machineTimings({...progress.upgrades,[id]:Math.min(max,level+1)});
 const key={scanner:'scanMs',scale:'weighMs',conveyor:'slideMs'}[id];
 return `<span class="machine-speed">${id==='conveyor'?'Gerakan barang':'Masa proses'}: ${(current[key]/1000).toFixed(2)}s${level<max?' → '+(next[key]/1000).toFixed(2)+'s':' · Maksimum'}</span>`;
}
function returnCash(index,transaction,button){
 if(paused||busy||phase!=='change'||transaction!==customer||!Number.isInteger(index)||index<0||index>=cashPicked.length)return;
 const value=cashPicked[index],from=button.getBoundingClientRect();
 cashPicked.splice(index,1);renderPayment();save();beep('coin');
 const target=$('paymentArea').querySelector(`[data-note="${value}"]`);
 if(!target)return;const to=target.getBoundingClientRect(),el=document.createElement('div');
 el.className='return-cash-fx';el.innerHTML=moneyArt(value);el.style.left=from.left+'px';el.style.top=from.top+'px';$('fxLayer').append(el);void el.offsetWidth;
 requestAnimationFrame(()=>{el.style.transform=`translate(${to.left-from.left}px,${to.top-from.top}px) scale(.7)`;el.style.opacity='0'});setTimeout(()=>el.remove(),350);
}
function armQrScanner(){
 if(paused||busy||phase!=='offer'||customer.method!=='qr'||customer.cardStage==='processing')return;
 customer.qrArmed=true;$('payDevice').classList.add('qr-armed');
 // Scanner is controlled directly; no separate payment button.
 $('qrTarget').setAttribute('aria-label','Scanner sedia. Tekan untuk imbas QR');
}
function scanQrTarget(){
 if(paused||busy||phase!=='offer'||customer.method!=='qr'||!customer.qrArmed)return;
 customer.qrScanned=true;startDigital();
}
function bindQrScanner(){
 const scanner=$('qrScanner'),target=$('qrTarget');let origin=null,moved=false;
 target.onclick=()=>{if(!customer.qrArmed){toast('Ambil scanner dahulu, kemudian tekan kod QR.');return}scanQrTarget()};
 scanner.onclick=()=>{if(!moved)armQrScanner()};
 scanner.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();armQrScanner()}};
 scanner.onpointerdown=e=>{if(paused||busy||e.button>0)return;origin={x:e.clientX,y:e.clientY};moved=false;scanner.setPointerCapture(e.pointerId);armQrScanner();e.preventDefault()};
 scanner.onpointermove=e=>{if(!origin)return;const dx=e.clientX-origin.x,dy=e.clientY-origin.y;moved||=Math.hypot(dx,dy)>7;scanner.style.transform=`translate(${dx}px,${dy}px) rotate(-22deg)`;target.classList.toggle('qr-target-hit',inside(e,target.getBoundingClientRect()))};
 scanner.onpointerup=e=>{if(!origin)return;origin=null;scanner.style.transform='';target.classList.remove('qr-target-hit');if(moved&&inside(e,target.getBoundingClientRect()))scanQrTarget();else if(moved)toast('Halakan scanner tepat pada kod QR.');};
 scanner.onpointercancel=()=>{origin=null;moved=false;scanner.style.transform='';target.classList.remove('qr-target-hit')};
}

function setScaleReading(product,fraction=1){const grams=product?Math.max(0,Math.round(product.grams*fraction)):0;$('weightDisplay').textContent=(grams/1000).toFixed(3)}
function renderPaymentAvailability(){
 const enabled=availablePaymentMethods(progress.upgrades,mode==='practice');
 $('paymentAvailability').innerHTML=['cash','card','qr'].map(id=>`<button class="payment-chip ${enabled.includes(id)?'enabled':'locked'}" data-payment-upgrade="${id}" ${id==='cash'||enabled.includes(id)?'disabled':''} aria-label="${{cash:'Tunai',card:'Kad',qr:'QR'}[id]} ${enabled.includes(id)?'tersedia':'terkunci, buka melalui upgrade'}">${icon(id)}<span>${{cash:'Tunai',card:'Kad',qr:'QR'}[id]}</span>${enabled.includes(id)?'<i></i>':icon('lock')}</button>`).join('');
 $('paymentAvailability').querySelectorAll('[data-payment-upgrade]').forEach(b=>b.onclick=()=>{if(session&&modalKind!=='intro')showShop()});
}
function paymentUpgradeCards(){return `<h3 class="shop-section-title">Terminal pembayaran</h3><p class="muted">Tahap 1 membuka kaedah bayaran. Empat tahap seterusnya meningkatkan ketahanan terminal atau kelajuan QR.</p><div class="payment-upgrade-grid">${UPGRADES.filter(u=>u.type==='payment').map(u=>{const level=progress.upgrades[u.id]||0,owned=level>=1,maxed=level>=u.max,cost=u.cost*(level+1);return `<div class="payment-upgrade-card ${owned?'owned':''}"><span class="payment-upgrade-art">${icon(u.icon)}<i>${icon(owned?'check':'lock')}</i></span><h3>${u.name}</h3><span class="payment-level">Tahap ${level} / ${u.max}</span><p>${u.desc}</p><button class="primary-btn" data-upgrade="${u.id}" ${maxed||progress.wallet<cost?'disabled':''}>${maxed?'✓ Maksimum':owned?'Upgrade · '+money(cost):'Buka · '+money(cost)}</button><small>${maxed?'Semua 5 tahap lengkap':owned?'Pembayaran aktif · upgrade pilihan':progress.wallet<cost?'Perlu lagi '+money(cost-progress.wallet):'Sedia dibuka'}</small></div>`}).join('')}</div>`}

function audioVolume(){const n=Number(progress.settings?.volume??.6);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):.6}
function prepareScannerAudio(){
 try{
  audioCtx??=new(window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  if(!scannerBufferPromise&&typeof fetch==='function')scannerBufferPromise=fetch('./scanner-beep.wav').then(r=>{if(!r.ok)throw new Error('Audio unavailable');return r.arrayBuffer()}).then(bytes=>audioCtx.decodeAudioData(bytes)).then(buffer=>{scannerBuffer=buffer;return buffer}).catch(()=>{scannerBufferPromise=null;return null});
 }catch{}
}
function stopScannerSound(){
 try{scannerSource?.node.stop()}catch{}scannerSource=null;
 try{$('scannerSound').pause();$('scannerSound').currentTime=0}catch{}
}
function playScannerSound(){
 if(!sound||effectVolume('scanner')===0)return;prepareScannerAudio();stopScannerSound();
 if(scannerBuffer&&audioCtx){
  try{const node=audioCtx.createBufferSource(),gain=audioCtx.createGain();node.buffer=scannerBuffer;gain.gain.value=effectVolume('scanner');node.connect(gain);gain.connect(audioCtx.destination);scannerSource={node,gain};node.onended=()=>{node.disconnect();gain.disconnect();if(scannerSource?.node===node)scannerSource=null};node.start();return}catch{}
 }
 try{const clip=$('scannerSound');clip.volume=effectVolume('scanner');clip.currentTime=0;const playing=clip.play();playing?.catch(()=>{})}catch{}
}

function scrollChangeTrayEnd(){const tray=$('changeTray');if(tray)tray.scrollLeft=tray.scrollWidth}
function musicVolume(){const n=Number(progress.settings?.musicVolume??.2);return Number.isFinite(n)?Math.max(0,Math.min(1,n)):.2}
function musicWanted(){return musicUnlocked&&!!session&&sound&&progress.settings?.music!==false&&musicVolume()>0&&!explicitPause}
function writeMusicLevel(level){
 musicLevel=Math.max(0,Math.min(1,level));const track=$('backgroundMusic');
 try{if(musicGain){musicGain.gain.value=musicLevel;track.volume=1}else track.volume=musicLevel}catch{}
}
function fadeMusicTo(target){
 if(musicTarget===target)return;musicTarget=target;
 musicFade={from:musicLevel,to:target,start:performance.now(),duration:target>musicLevel?850:650};
 if(!musicFramePending){musicFramePending=true;requestAnimationFrame(tickMusicFade)}
}
function tickMusicFade(now){
 musicFramePending=false;const fade=musicFade;if(!fade)return;
 const p=Math.min(1,Math.max(0,(now-fade.start)/fade.duration)),smooth=p*p*(3-2*p);
 writeMusicLevel(fade.from+(fade.to-fade.from)*smooth);
 if(p<1){musicFramePending=true;requestAnimationFrame(tickMusicFade)}else{musicFade=null;if(fade.to===0&&!musicWanted())try{$('backgroundMusic').pause()}catch{}}
}
function syncBackgroundMusic(){
 const track=$('backgroundMusic');if(!track)return;
 if(!musicWanted()){fadeMusicTo(0);return}
 prepareScannerAudio();
 try{if(audioCtx&&!musicSource){const gain=audioCtx.createGain();gain.gain.value=musicLevel;const source=audioCtx.createMediaElementSource(track);source.connect(gain);gain.connect(audioCtx.destination);musicSource=source;musicGain=gain}writeMusicLevel(musicLevel)}catch{}
 track.loop=true;
 if(track.paused===false){fadeMusicTo(musicVolume());return}
 if(musicStarting)return;
 try{musicStarting=true;writeMusicLevel(0);const result=track.play();Promise.resolve(result).then(()=>{musicStarting=false;if(musicWanted()){musicTarget=-1;fadeMusicTo(musicVolume())}else{musicFade=null;musicTarget=0;writeMusicLevel(0);track.pause()}}).catch(()=>{musicStarting=false})}catch{musicStarting=false}
}
function prepareChaChing(){
 prepareScannerAudio();if(!audioCtx||chaChingPromise||typeof fetch!=='function')return;
 chaChingPromise=fetch('./cha-ching.wav').then(r=>{if(!r.ok)throw new Error('Audio unavailable');return r.arrayBuffer()}).then(b=>audioCtx.decodeAudioData(b)).then(b=>{chaChingBuffer=b;return b}).catch(()=>{chaChingPromise=null;return null});
}
function stopChaChing(){try{chaChingSource?.node.stop()}catch{}chaChingSource=null;try{$('chaChingSound').pause();$('chaChingSound').currentTime=0}catch{}}
function playChaChing(){
 if(!sound||effectVolume('chaching')===0)return;prepareChaChing();stopChaChing();
 if(chaChingBuffer&&audioCtx){try{const node=audioCtx.createBufferSource(),gain=audioCtx.createGain();node.buffer=chaChingBuffer;gain.gain.value=effectVolume('chaching');node.connect(gain);gain.connect(audioCtx.destination);chaChingSource={node,gain};node.onended=()=>{node.disconnect();gain.disconnect();if(chaChingSource?.node===node)chaChingSource=null};node.start();return}catch{}}
 try{const clip=$('chaChingSound');clip.volume=effectVolume('chaching');clip.currentTime=0;clip.play()?.catch(()=>{})}catch{}
}
function playTapSound(){
 if(!sound||effectVolume('tap')===0)return;prepareScannerAudio();if(!audioCtx)return;
 try{const node=audioCtx.createOscillator(),gain=audioCtx.createGain(),t=audioCtx.currentTime;node.type='triangle';node.frequency.setValueAtTime(750,t);node.frequency.exponentialRampToValueAtTime(330,t+.035);gain.gain.setValueAtTime(.15*effectVolume('tap'),t);gain.gain.exponentialRampToValueAtTime(.001,t+.04);node.connect(gain);gain.connect(audioCtx.destination);node.start(t);node.stop(t+.045);node.onended=()=>{node.disconnect();gain.disconnect()}}catch{}
}
function musicSettingsHTML(){return `<div class="setting-row"><div><b>Muzik latar</b><small>Gameplay · dimainkan berulang semasa bermain.</small></div><button class="toggle ${progress.settings.music!==false?'on':''}" id="toggleMusic" aria-label="Muzik latar" aria-pressed="${progress.settings.music!==false}"><i></i></button></div><div class="sound-settings music-settings"><label for="musicVolume">Volume muzik <b id="musicVolumeLabel">${Math.round(musicVolume()*100)}%</b></label><input id="musicVolume" type="range" min="0" max="100" step="5" value="${Math.round(musicVolume()*100)}" aria-label="Volume muzik latar"><span>Muzik terus bermain dalam Tetapan. Tekan Jeda untuk fade keluar dan berhenti.</span></div>`}
function bindMusicSettings(){
 $('toggleMusic').onclick=()=>{progress.settings.music=progress.settings.music===false;syncBackgroundMusic();save();showSettings()};
 $('musicVolume').oninput=()=>{progress.settings.musicVolume=Number($('musicVolume').value)/100;$('musicVolumeLabel').textContent=Math.round(musicVolume()*100)+'%';syncBackgroundMusic();save()};
}
window.addEventListener('resize',()=>{if(calculatorPosition)positionCalculator(calculatorPosition.x,calculatorPosition.y)});
window.visualViewport?.addEventListener('resize',()=>{if(calculatorPosition)positionCalculator(calculatorPosition.x,calculatorPosition.y)});
document.addEventListener('click',e=>{const button=e.target?.closest?.('button');if(button&&!button.disabled)playTapSound()},true);


function syncPaymentSurface(){
 const overlay=$('paymentOverlay'),area=$('paymentArea'),active=!!customer&&['offer','change'].includes(phase),visible=active&&!paymentMinimized;
 const opening=visible&&overlay.hidden;
 const mount=$(active?'paymentMount':'paymentHome');if(area.parentElement!==mount)mount.append(area);
 overlay.hidden=!visible;$('resumePayment').hidden=!active;$('gameApp').inert=visible;
 document.body.classList.toggle('payment-open',visible);
 if(active){
  overlay.dataset.method=customer.method;overlay.dataset.kind=customer.kind;overlay.dataset.phase=phase;
  $('paymentTitle').textContent=customer.kind==='return'?'Pemulangan barang':customer.method==='cash'?(phase==='change'?'Laci baki tunai':'Terima bayaran tunai'):customer.method==='card'?'Pembayaran kad':'Pembayaran QR';
  $('paymentCustomer').textContent=customer.person.name+' · Jumlah '+money(amountDue(customer))+(customer.method==='cash'?(customer.kind==='return'?' · Bayaran balik':' · Diterima '+money(customer.tender)):'');
  $('paymentInstructions').textContent=customer.kind==='return'?'Bandingkan data resit dengan rekod sistem. Terima hanya pemulangan yang sah.':customer.method==='cash'?'Pilih dari laci · tekan duit dalam dulang untuk masukkan semula':customer.method==='card'?'Sentuh kad pada terminal. Jika diminta, masukkan PIN pada mesin' :'Ambil scanner dan imbas kod pada telefon pelanggan';
 }
 if(opening)$('paymentTitle').focus?.({preventScroll:true});
 $('resumePayment').onclick=()=>{paymentMinimized=false;syncPaymentSurface()};
 $('minimizePayment').onclick=()=>{cancelBankCardDrag();paymentMinimized=true;syncPaymentSurface();$('resumePayment').focus?.()};
 $('paymentCalculator').onclick=showCalculator;$('paymentSettings').onclick=showSettings;$('paymentPause').onclick=showPause;
}
function handlePaymentOverlayKey(e){
 if($('paymentOverlay').hidden||$('modal').open)return false;
 if(e.key==='Escape'){e.preventDefault();$('minimizePayment').onclick();return true}
 if(e.key!=='Tab')return false;
 const roots=[$('paymentOverlay'),...($('floatingCalculator').hidden?[]:[$('floatingCalculator')])];
 const buttons=roots.flatMap(root=>[...root.querySelectorAll('button:not(:disabled), [tabindex="0"], input:not(:disabled)')]).filter(el=>el.getClientRects().length);
 if(!buttons.length)return false;const index=buttons.indexOf(document.activeElement),next=e.shiftKey?(index<=0?buttons.length-1:index-1):(index+1)%buttons.length;
 e.preventDefault();buttons[next].focus();return true;
}

function operatingStore(){
 if(mode!=='practice')return progress;
 if(!practiceStore){practiceStore=createProgress();practiceStore.wallet=1000000;practiceStore.unlocked=CATEGORIES.map(c=>c.id);ensureOperations(practiceStore);practiceStore.paper=999}
 return practiceStore;
}
function rushUnlimited(c=customer){return mode==='career'&&!!c?.rushUnlimited}
function readyForCustomer(){return (mode==='career'&&rushHourActive(progress.day,session))||(progress.paper>0&&availableProducts(progress.unlocked).some(p=>progress.inventory[p.id]>=(p.weighted?100:1)))}
function enterSupplyWait(){customer=null;phase='supply';busy=false;advancePending=false;session.waitSeconds=0;resetStations();render();save()}
function ensurePaper(){if(mode==='practice'||rushUnlimited()||(mode==='career'&&rushHourActive(progress.day,session))||progress.paper>0)return true;showInventory();toast('Kertas resit habis. Beli satu pek sebelum melayan pelanggan.',true);return false}
function renderOperations(){
 syncSceneAtmosphere();
 const s=operatingStore(),rush=mode==='career'&&!!session&&rushHourActive(progress.day,session);
 $('storeClock').textContent=clockText(session?.clockMinutes||480);
 const banner=$('rushHourBanner');if(banner){banner.hidden=!rush;if(rush){$('rushClock').textContent=String(Math.ceil(session.rushSecondsRemaining)).padStart(2,'0')+'s';$('rushMultiplier').textContent='×'+rushHourMultiplier(progress.upgrades).toFixed(1);$('rushBar').style.width=(session.rushSecondsRemaining/RUSH_DURATION_SECONDS*100).toFixed(2)+'%';}}
 $('storeClock').classList.toggle('rush-active',rush);
 const stars=session?.stars??3;$('storeStars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);$('storeStars').setAttribute('aria-label',stars+' daripada 3 bintang servis');
 $('supplyStatus').textContent=((rush||rushUnlimited())?'⚡ Stok & resit ∞':'Resit '+s.paper)+' · Kad '+(s.cardBroken?'ROSAK':s.cardHealth+'%');
}
function renderWaiting(){
 const area=$('paymentArea'),key=phase+(progress.paper===0?'paper':'stock');if(area.dataset.waitKey!==key){area.dataset.waitKey=key;area.innerHTML=`<div class="waiting-counter">${icon(phase==='supply'?'basket':'clock')}<h3>${phase==='supply'?(progress.paper===0?'Kertas resit habis':'Stok kedai habis'):'Kaunter lapang seketika'}</h3><p>${phase==='supply'?'Tambah bekalan sebelum pelanggan seterusnya boleh dilayan.':'Dah lewat. Pelanggan datang lebih perlahan.'}</p><button class="secondary-btn" id="waitingInventory">Buka inventori</button></div>`;$('waitingInventory').onclick=()=>showInventory()}

}
function inventorySelectedFilter(){return $('inventoryStateFilter')?.value||'all'}
function inventoryStateFor(product,store){
 const amount=store.inventory[product.id]||0,unit=product.weighted?1000:1;
 return amount<=0?'empty':amount<LOW_STOCK_UNITS*unit?'low':'good';
}
function bindInventoryControls(){
 const content=$('modalContent');
 content.querySelectorAll('[data-restock]').forEach(b=>b.onclick=()=>{
  const input=content.querySelector(`[data-stock-qty="${b.dataset.restock}"]`),amount=Number(input?.value);
  if(!Number.isInteger(amount)||amount<1||amount>MAX_STOCK_PURCHASE){toast('Pilih kuantiti 1–20 sahaja.',true);return}
  if(!stockQuote(operatingStore(),b.dataset.restock,amount).lines.length){toast('Stok sudah mencapai had stor. Naik taraf kapasiti stor dahulu.',true);return}
  confirmSupply('stock',b.dataset.restock,inventoryDestination,amount);
 });
 content.querySelectorAll('[data-stock-qty]').forEach(input=>{
  const card=input.closest('.stock-card'),minus=card.querySelector('[data-stock-minus]'),plus=card.querySelector('[data-stock-plus]'),buy=card.querySelector('[data-restock]');
  const update=()=>{
   const amount=Number(input.value),product=PRODUCTS.find(p=>p.id===input.dataset.stockQty);
   const unit=product.weighted?1000:1,space=Math.max(0,stockCapacity(operatingStore())-Math.floor((operatingStore().inventory[product.id]||0)/unit));
   const limit=Math.min(MAX_STOCK_PURCHASE,space),valid=Number.isInteger(amount)&&amount>=1&&amount<=limit;
   minus.disabled=!valid||amount<=1;plus.disabled=!valid||amount>=limit;
   buy.disabled=mode==='practice'||!valid;
   const qty=amount*(product.weighted?1000:1);
   buy.textContent=valid?'Beli '+amount+(product.weighted?' kg':' unit')+' · '+money(stockCost(product,qty,operatingStore().day)):space<=0?'Stok sudah penuh':'Had baki '+limit+' '+(product.weighted?'kg':'unit');
  };
  minus.onclick=()=>{input.value=Math.max(1,Number(input.value||1)-1);update()};
  plus.onclick=()=>{input.value=Math.min(MAX_STOCK_PURCHASE,Math.max(0,stockCapacity(operatingStore())-Math.floor((operatingStore().inventory[input.dataset.stockQty]||0)/(PRODUCTS.find(p=>p.id===input.dataset.stockQty).weighted?1000:1))),Number(input.value||0)+1);update()};
  input.oninput=update;
  input.onchange=()=>{const item=PRODUCTS.find(p=>p.id===input.dataset.stockQty),u=item.weighted?1000:1,room=Math.max(0,stockCapacity(operatingStore())-Math.floor((operatingStore().inventory[item.id]||0)/u));input.value=String(Math.max(1,Math.min(MAX_STOCK_PURCHASE,room,Math.trunc(Number(input.value)||1))));update()};
  update();
 });
}
let inventoryDestination='game';
function showInventory(returnTo='game'){
 if(!session||modalKind==='intro')return;
 const store=operatingStore(),quote=stockQuote(store);
 inventoryDestination=returnTo==='summary'||modalKind==='summary'?'summary':'game';
 const destination=inventoryDestination;
 const back=()=>{if(destination==='summary'){showSummary();return}closeModal();if(phase==='supply'&&readyForCustomer())newCustomer()};
 openModal('inventory',`<div class="modal-pad inventory-panel"><div class="modal-heading"><div><div class="modal-kicker">STOK & PENYELENGGARAAN</div><h2>Inventori kedai.</h2></div><button class="icon-btn" id="closeInventory" aria-label="Tutup">${icon('close')}</button></div><div class="inventory-money"><span>Duit kedai <b id="inventoryWallet">${money(store.wallet)}</b></span><span>Hutang pembekal <b id="inventoryDebt">${money(store.supplierDebt)}</b></span></div><button class="primary-btn" id="restockAll" ${!quote.lines.length||mode==='practice'?'disabled':''}>Tambah semua stok · ${money(quote.total)}</button><p class="inventory-credit">Jika duit tidak cukup, anda boleh sahkan pembelian secara hutang. 30% kutipan jualan seterusnya digunakan untuk membayarnya.</p><div class="supply-cards"><div><b>Kertas resit</b><strong id="inventoryPaper">${store.paper} helai</strong><small>Satu helai bagi setiap jualan atau pulangan.</small><button class="secondary-btn" id="buyPaper">Beli ${PAPER_PACK} helai · ${money(PAPER_COST)}</button></div><div><b>Terminal kad</b><strong id="inventoryTerminal">${store.cardBroken?'Rosak':store.cardHealth+'% keadaan'}</strong><small>Rosak selepas haus atau gangguan rawak. Bayaran kad disekat sehingga dibaiki.</small><button class="secondary-btn" id="repairTerminal" ${!cardRepairCost(store)?'disabled':''}>Baiki · ${money(cardRepairCost(store))}</button></div></div><div class="inventory-toolbar"><input id="inventorySearch" type="search" placeholder="Cari nama barang…" aria-label="Cari inventori"><label for="inventoryStateFilter">Tapis stok</label><select id="inventoryStateFilter" aria-label="Tapis stok mengikut tahap"><option value="all">Semua stok</option><option value="empty">Stok habis (0)</option><option value="low">Stok rendah (1–4)</option><option value="good">Stok mencukupi (5+)</option></select><button class="secondary-btn" id="foldStock">Lipat semua</button></div><div class="inventory-list" id="inventoryGroups">${inventoryGroupsHTML(store)}</div><button class="secondary-btn" id="backInventory">${destination==='summary'?'Kembali ke laporan':'Kembali ke kaunter'}</button></div><div class="inventory-confirm-layer" id="inventoryConfirmLayer" hidden></div>`);
 $('inventorySearch').oninput=filterInventory;
 $('inventoryStateFilter').onchange=filterInventory;
 $('foldStock').onclick=()=>{$('modalContent').querySelectorAll('[data-stock-category]').forEach(el=>el.open=false)};
 $('closeInventory').onclick=back;$('backInventory').onclick=back;
 $('restockAll').onclick=()=>confirmSupply('stock',null,destination);
 $('buyPaper').onclick=()=>confirmSupply('paper',null,destination);
 $('repairTerminal').onclick=()=>confirmSupply('repair',null,destination);
 bindInventoryControls();
}
function refreshInventoryInPlace(){
 const store=operatingStore(),list=$('inventoryGroups');if(!list)return;
 const scrollTop=list.scrollTop,modalScroll=$('modal').scrollTop,contentScroll=$('modalContent').scrollTop,filter=$('inventoryStateFilter').value,search=$('inventorySearch').value;
 const openCategories=new Set([...list.querySelectorAll('[data-stock-category][open]')].map(x=>x.dataset.stockCategory));
 // Update the displayed inventory without recreating the dialog itself.
 list.innerHTML=inventoryGroupsHTML(store);
 list.querySelectorAll('[data-stock-category]').forEach(group=>group.open=openCategories.has(group.dataset.stockCategory));
 $('inventoryStateFilter').value=filter;$('inventorySearch').value=search;
 $('inventoryWallet').textContent=money(store.wallet);$('inventoryDebt').textContent=money(store.supplierDebt);
 $('inventoryPaper').textContent=store.paper+' helai';$('inventoryTerminal').textContent=store.cardBroken?'Rosak':store.cardHealth+'% keadaan';
 const quote=stockQuote(store),restock=$('restockAll');restock.textContent='Tambah semua stok · '+money(quote.total);restock.disabled=!quote.lines.length||mode==='practice';
 const repair=$('repairTerminal');repair.disabled=!cardRepairCost(store);repair.textContent='Baiki · '+money(cardRepairCost(store));
 bindInventoryControls();filterInventory();list.scrollTop=scrollTop;
 $('modal').scrollTop=modalScroll;$('modalContent').scrollTop=contentScroll;
 requestAnimationFrame(()=>{if($('inventoryGroups')===list){list.scrollTop=scrollTop;$('modal').scrollTop=modalScroll;$('modalContent').scrollTop=contentScroll}});
}
function confirmSupply(type,id=null,destination='game',units=null){
 const store=operatingStore(),quote=type==='stock'?stockQuote(store,id,units):null,cost=quote?quote.total:type==='paper'?PAPER_COST:cardRepairCost(store);
 if(!cost||(type==='repair'&&!cardRepairCost(store)))return;
 const credit=store.wallet<cost,shortfall=Math.max(0,cost-store.wallet);
 const description=type==='stock'?quote.lines.map(x=>`${x.name}: +${x.weighted?(x.quantity/1000).toFixed(2)+' kg':x.quantity+' unit'}`).join('<br>'):type==='paper'?`${PAPER_PACK} helai kertas resit`:'Pembaikan terminal kad sehingga 100%';
 const confirmHTML=`<div class="inventory-confirm-box" role="alertdialog" aria-labelledby="inventoryConfirmHeading" aria-modal="true"><div class="modal-kicker">SEMAK SEBELUM MEMBELI</div><h2 id="inventoryConfirmHeading">Sahkan ${type==='stock'?'tambah stok':type==='paper'?'kertas resit':'pembaikan'}?</h2><div class="supply-confirm-lines">${description}</div><div class="supply-confirm-total"><span>Jumlah kos</span><strong>${money(cost)}</strong></div><p>${credit?'Duit tidak cukup. '+money(store.wallet)+' dibayar sekarang dan '+money(shortfall)+' ditambah kepada hutang pembekal.':'Kos ini akan ditolak daripada duit kedai.'}</p><button class="primary-btn" id="confirmSupply">${credit?'Sahkan pembelian + hutang':'Sahkan pembelian'} · ${money(cost)}</button><button class="secondary-btn" id="cancelSupply">Batal</button></div>`;
 // The existing inventory modal remains open and its scroll state is unchanged.
 const layer=$('inventoryConfirmLayer');
 if(layer&&modalKind==='inventory'){
  layer.innerHTML=confirmHTML;layer.hidden=false;
 }else{
  openModal('supply-confirm',`<div class="modal-pad supply-confirm">${confirmHTML}</div>`);
 }
 const cancel=()=>{if(layer&&modalKind==='inventory'){layer.hidden=true;layer.innerHTML=''}else showInventory(destination)};
 $('cancelSupply').onclick=cancel;
 let confirmed=false;
 $('confirmSupply').onclick=()=>{
  if(confirmed)return;
  const ok=type==='stock'?buyStock(store,quote,credit):payStoreCost(store,cost,credit);
  if(!ok){toast('Inventori berubah. Semak semula jumlah pembelian.',true);cancel();return}
  confirmed=true;
  if(type==='paper')store.paper+=PAPER_PACK;
  if(type==='repair'){store.cardBroken=false;store.cardHealth=100;if(customer)customer.cardFailure=false}
  if(type!=='stock'){session.expenses+=cost;session.earned-=cost;if(mode==='career')progress.lifetime-=cost}
  save();renderHeader();renderPayment();
  if(layer&&modalKind==='inventory'){
   layer.hidden=true;layer.innerHTML='';refreshInventoryInPlace();
  }else showInventory(destination);
  beep('success');toast(type==='repair'?'Terminal kad siap dibaiki.':type==='paper'?'Kertas resit ditambah.':'Stok kedai ditambah.');
 };
}
function renderCardRepair(){
 $('paymentArea').innerHTML=`<div class="machine-fault">${icon('card')}<h3>Terminal kad rosak</h3><p>Kad belum dicaj. Bayar kos pembaikan untuk guna terminal semula.</p><strong>${money(cardRepairCost(operatingStore()))}</strong><button class="primary-btn" id="repairCardNow">Baiki terminal</button><button class="secondary-btn" id="cardToCash">Minta pelanggan bayar tunai</button></div>`;
 $('repairCardNow').onclick=()=>confirmSupply('repair');$('cardToCash').onclick=()=>{if(paused||busy)return;customer.method='cash';customer.requiresPin=false;customer.cardStage='ready';customer.tender=tenderFor(amountDue(customer));render();save();toast('Pelanggan bersetuju bayar tunai. Terminal masih perlu dibaiki.')};
}
function recordSale(transaction){
 const seq=++progress.saleSequence,total=amountDue(transaction);let allocated=0;
 transaction.items.forEach((p,i)=>{const paid=i===transaction.items.length-1?total-allocated:Math.floor(total*itemPrice(p)/Math.max(1,transaction.total));allocated+=paid;progress.sales.push({id:progress.day+'-'+seq+'-'+i,receipt:'KK-'+String(seq).padStart(5,'0'),day:progress.day,productId:p.id,grams:p.grams,paid,cost:stockCost(p,stockUnits(p),progress.day),returned:false})});progress.sales=progress.sales.slice(-120);
}
function prepareReturnCustomer(){
 // No refund customers during the 60-second Rush Hour. They return only after it ends.
 if(mode==='practice'||(mode==='career'&&rushHourActive(progress.day,session))||progress.day<2||session.index<2||(session.index+progress.day)%4!==0)return;
 const record=[...progress.sales].reverse().find(x=>{const rule=returnPolicy(PRODUCTS.find(p=>p.id===x.productId));return rule&&!x.returned&&x.paid>0&&progress.day-x.day<=rule.days});if(!record)return;
 const product=PRODUCTS.find(p=>p.id===record.productId),rule=returnPolicy(product);
 customer.kind='return';customer.returnId=record.id;customer.returnReason=rule.reason;customer.returnCondition=rule.condition;customer.returnClaim={receipt:record.receipt,day:record.day,productId:record.productId,quantity:1,paid:record.paid};
 // Persist the discrepancy once. Reopening a panel never rolls a different receipt.
 if(Math.random()<.35){const field=['receipt','paid','day','productId'][Math.floor(Math.random()*4)];if(field==='receipt')customer.returnClaim.receipt='KK-'+String(90000+session.index);else if(field==='paid')customer.returnClaim.paid+=200;else if(field==='day')customer.returnClaim.day=Math.max(1,record.day+1);else customer.returnClaim.productId=PRODUCTS.find(p=>p.id!==product.id&&p.category===product.category)?.id||'milk';}
 customer.items=[{...product,grams:record.grams,uid:'return-'+progress.day+'-'+session.index,scanned:false}];customer.total=record.paid;customer.method='cash';customer.tender=0;customer.hasCoupon=false;customer.discount=0;customer.requiresPin=false;customer.cardFailure=false;
}
function ensureReturnClaim(){if(customer?.kind!=='return')return;const record=operatingStore().sales.find(x=>x.id===customer.returnId),rule=returnPolicy(customer.items[0]);customer.returnClaim??=record?{receipt:record.receipt,day:record.day,productId:record.productId,quantity:1,paid:record.paid}:null;customer.returnReason??=rule?.reason||'Saya ingin memulangkan barang ini.';customer.returnCondition??=rule?.condition||'Kategori tidak layak dipulangkan';}
function renderReturnPayment(){
 ensureReturnClaim();const area=$('paymentArea'),record=operatingStore().sales.find(x=>x.id===customer.returnId),all=customer.items.every(i=>i.scanned),rule=returnPolicy(customer.items[0]);
 if(phase==='scan'){area.innerHTML=`<div class="return-label">${icon('undo')} Pelanggan memulangkan barang</div><p class="payment-hint">Scan barang kemudian bandingkan resit pelanggan dengan rekod kedai.</p><button class="primary-btn" id="checkoutBtn" ${!all?'disabled':''}>Semak pemulangan ${icon('arrow')}</button>`;$('checkoutBtn').onclick=()=>{if(paused||!all||!ensurePaper())return;phase='offer';paymentMinimized=false;renderPayment();save()};return}
 if(phase!=='offer'){area.innerHTML='';return}
 const receipt=customer.returnClaim,fields=[['No. resit',receipt?.receipt,record?.receipt],['Hari pembelian',receipt?'Hari '+receipt.day:'—',record?'Hari '+record.day:'—'],['Nama barang',PRODUCTS.find(p=>p.id===receipt?.productId)?.name,PRODUCTS.find(p=>p.id===record?.productId)?.name],['Kuantiti',receipt?.quantity+' unit',record?'1 unit':'—'],['Amaun dibayar',receipt?money(receipt.paid):'—',record?money(record.paid):'—']];
 area.innerHTML=`<div class="return-review"><div class="return-case"><div class="return-product">${productArt(customer.items[0].id)}<div><small>BARANG DI KAUNTER</small><h3>${customer.items[0].name}</h3><p>${customer.returnReason}</p><b>${customer.returnCondition}</b></div></div><div class="return-policy"><b>Polisi kedai</b><p>${rule?'Pemulangan dalam '+rule.days+' hari selepas pembelian. Resit mesti sepadan.':'Kategori ini tidak layak dipulangkan.'}</p><small>Hari semasa: ${progress.day} · ${record?.returned?'Rekod sudah dipulangkan':'Rekod belum dipulangkan'}</small></div></div><div class="receipt-compare"><div class="compare-heading"><span>MAKLUMAT</span><b>RESIT PELANGGAN</b><b>REKOD SISTEM</b></div>${fields.map(([label,claim,system])=>`<div class="compare-row"><span>${label}</span><strong>${claim||'Tidak ditemui'}</strong><strong>${system||'Tidak ditemui'}</strong></div>`).join('')}</div><div class="return-decision"><p id="returnError" class="code-error">Bandingkan maklumat dan pilih Lulus atau Tolak.</p><div><button class="primary-btn" id="approveReturn">Lulus pemulangan · ${money(receipt?.paid||0)}</button><button class="secondary-btn danger-btn" id="rejectReturn">Tolak pemulangan</button></div></div></div>`;
 $('approveReturn').onclick=completeReturn;$('rejectReturn').onclick=rejectReturn;
}
// Penalti dalaman: pemain tidak ditunjukkan sama ada keputusan refund betul atau salah.
// Nilai dalam sen (500 = RM5). Ia mengurangkan untung serta baki kedai.
const RETURN_DECISION_PENALTY=500;
function applyReturnDecisionPenalty(store){
 if(customer.returnPenalty)return 0;
 customer.returnPenalty=true;
 payStoreCost(store,RETURN_DECISION_PENALTY,true);
 session.expenses+=RETURN_DECISION_PENALTY;
 session.earned-=RETURN_DECISION_PENALTY;
 if(mode==='career')progress.lifetime-=RETURN_DECISION_PENALTY;
 return RETURN_DECISION_PENALTY;
}
function finishReturnDecision(payout=0){
 customer.paid=true;
 lastTip=0;
 lastEarned=-payout;
 session.served++;
 if(customer.rushCustomer){
  session.rushServed=(session.rushServed||0)+1;
  session.rushEarned=(session.rushEarned||0)-payout;
 }
 session.clockMinutes=Math.min(1320,session.clockMinutes+90);
 phase='success';busy=false;
 render();
 showTransactionResult(0,0,'Urusan pemulangan selesai.');
 save();advance();
}
function rejectReturn(){
 if(paused||busy||customer?.kind!=='return'||customer.paid||phase!=='offer'||!ensurePaper())return;
 const store=operatingStore(),record=store.sales.find(x=>x.id===customer.returnId);
 const valid=returnMatches(record,customer.returnClaim,customer.items[0],progress.day);
 const penalty=valid?applyReturnDecisionPenalty(store):0;
 finishReturnDecision(penalty);
}
function completeReturn(){
 if(paused||busy||customer?.kind!=='return'||customer.paid||phase!=='offer'||!ensurePaper())return;
 const store=operatingStore(),record=store.sales.find(x=>x.id===customer.returnId),item=customer.items[0];
 const valid=returnMatches(record,customer.returnClaim,item,progress.day);
 // Keputusan salah tidak disekat atau diberitahu; ia terus mengurangkan keuntungan.
 const refund=valid?record.paid:Math.max(0,Math.round(Number(customer.returnClaim?.paid)||0));
 const penalty=valid?0:applyReturnDecisionPenalty(store);
 payStoreCost(store,refund,true);
 if(valid){
  const restock=returnPolicy(item).restock;
  record.returned=true;
  if(restock)store.inventory[record.productId]+=1;
 }
 if(!rushUnlimited(customer))store.paper--;
 session.returnCount++;
 session.refunds+=refund;
 // Refund sebenar ialah wang yang keluar dari kedai. Kos barang yang boleh
 // dijual semula ditolak daripada jumlah kerugian sahaja untuk refund sah.
 const restockCost=valid&&returnPolicy(item).restock?record.cost:0;
 const loss=refund-restockCost;
 session.earned-=loss;
 if(mode==='career')progress.lifetime-=loss;
 finishReturnDecision(loss+penalty);
}
document.addEventListener('pointerdown',()=>{const result=$('transactionResult');if(result&&!result.hidden){clearTimeout(resultTimer);result.hidden=true}},true);
function showTransactionResult(tip,starLost=0,reason='',overpaid=0){
 const el=$('transactionResult');clearTimeout(resultTimer);el.hidden=false;el.innerHTML=`<div class="result-check">${icon('check')}</div><small>${phase==='lost'?'PELANGGAN TELAH PERGI':customer?.kind==='return'?(phase==='offer'?'SEMAKAN PEMULANGAN':'URUSAN PULANGAN SELESAI'):'PAYMENT APPROVED'}</small><strong>${tip>0?'Tip +'+money(tip):starLost?'Servis perlu diperbaiki':'Terima kasih!'}</strong>${starLost?`<div class="result-stars">${'★'.repeat(session.stars)+'☆'.repeat(3-session.stars)}</div>`:''}<p>${starLost?'−'+starLost+' bintang · ':''}${reason||customerLine(customer||{},tip>0?'thanks':'thanksNoTip')}</p>${overpaid?`<span>Baki terlebih ${money(overpaid)} · ditolak pada akhir hari</span>`:''}${customer?.rushBonus>0?`<span class="result-rush-bonus">⚡ Bonus Rush Hour +${money(customer.rushBonus)} · ×${rushHourMultiplier(progress.upgrades).toFixed(1)} untung</span>`:''}`;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');resultTimer=setTimeout(()=>{el.hidden=true},1450);
}

function ensureStyle(){
 const s=progress.settings;progress.ownedThemes??=['mint'];
 if(s.theme==='dark'){s.dark=true;s.theme='mint'}
 if(['mint','peach','blue'].includes(s.theme)&&!progress.ownedThemes.includes(s.theme))progress.ownedThemes.push(s.theme);
 if(!progress.ownedThemes.includes(s.theme))s.theme='mint';
}
function styleChoices(){return [
 ['mint','Kebun mint',0,'#c9e6d3'],['peach','Senja pic',1800,'#f1ceb6'],['blue','Langit biru',1800,'#bfdde9'],['lavender','Lavender lembut',2200,'#dcd1ed'],['rose','Mawar manis',2200,'#efd0da'],['honey','Madu keemasan',2500,'#f0dda4'],['terracotta','Tanah senja',2500,'#dfb5a0'],['ocean','Laut turquoise',2800,'#a9dcd8']];}
function showStyles(selected=null){
 const id=selected||progress.settings.theme,choice=styleChoices().find(x=>x[0]===id)||styleChoices()[0],owned=progress.ownedThemes.includes(id);
 previewTheme=null;applySettings();
 openModal('styles',`<div class="modal-pad"><div class="modal-heading"><div><div class="modal-kicker">KOLEKSI WARNA KEDAI</div><h2>Warna untuk kedai anda.</h2></div><button class="icon-btn" id="closeStyles" aria-label="Tutup">${icon('close')}</button></div><p>Pilih warna kemudian lihat pada kedai sebenar sebelum membeli.</p><div class="theme-options">${styleChoices().map(([key,name,cost,color])=>`<button class="theme-option ${id===key?'selected':''}" data-preview-theme="${key}"><span class="theme-swatch" style="background:${color}"></span><b>${name}</b><small>${progress.ownedThemes.includes(key)?'Dimiliki':money(cost)}</small></button>`).join('')}</div><div class="style-purchase"><span><b>${choice[1]}</b><small>Duit kedai ${money(progress.wallet)}</small></span>${!owned?'<button class="secondary-btn" id="previewStyle">Preview kedai sebenar</button>':''}<button class="primary-btn" id="buyStyle" ${!owned&&(mode==='practice'||progress.wallet<choice[2])?'disabled':''}>${owned?'Gunakan warna':'Beli · '+money(choice[2])}</button></div><button class="text-btn" id="cancelStyle">Kembali ke tetapan</button></div>`);
 $('closeStyles').onclick=()=>showSettings();$('cancelStyle').onclick=()=>showSettings();$('modalContent').querySelectorAll('[data-preview-theme]').forEach(b=>b.onclick=()=>showStyles(b.dataset.previewTheme));if($('previewStyle'))$('previewStyle').onclick=()=>previewStoreStyle(id);$('buyStyle').onclick=()=>purchaseStyle(id);
}
function purchaseStyle(id){const choice=styleChoices().find(c=>c[0]===id);if(!choice)return;if(!progress.ownedThemes.includes(id)){if(mode==='practice'||progress.wallet<choice[2])return;progress.wallet-=choice[2];progress.ownedThemes.push(id)}progress.settings.theme=id;previewTheme=null;document.body.classList.remove('style-preview');applySettings();save();showStyles(id);toast('Warna '+choice[1]+' digunakan.')}
function previewStoreStyle(id){const choice=styleChoices().find(c=>c[0]===id);if(!choice||progress.ownedThemes.includes(id))return;previewTheme=id;applySettings();setMobileView('counter');openModal('style-preview',`<div class="live-style-toolbar"><button class="icon-btn" id="exitStylePreview" aria-label="Keluar preview">${icon('close')}</button><div><small>PREVIEW PERCUMA · KEDAI SEBENAR</small><strong>${choice[1]}</strong><span>Kemajuan dijeda · warna belum dibeli</span></div><button class="primary-btn" id="buyPreviewStyle" ${mode==='practice'||progress.wallet<choice[2]?'disabled':''}>Beli & gunakan · ${money(choice[2])}</button></div>`);$('exitStylePreview').onclick=()=>showStyles(id);$('buyPreviewStyle').onclick=()=>purchaseStyle(id)}
function showStarRecovery(){
 if(mode!=='career'||session.stars>0)return;
 const ledger=progress.starRecovery?.day===progress.day?progress.starRecovery:{day:progress.day,count:0,spent:0};progress.starRecovery=ledger;
 const cost=1500*(ledger.count+1),canBuy=ledger.count<3&&progress.wallet>=cost;
 clearTimeout(resultTimer);$('transactionResult').hidden=true;save();
 openModal('stars-empty',`<div class="modal-pad star-recovery"><div class="modal-kicker">BINTANG SERVIS HABIS</div><h2>Masa untuk mula semula.</h2><div class="empty-stars">☆ ☆ ☆</div><p>Pilih untuk ulang hari ${progress.day}, atau pulihkan 3 bintang menggunakan duit kedai.</p><div class="supply-confirm-total"><span>Pemulihan hari ini</span><strong>${ledger.count} / 3</strong></div><button class="primary-btn" id="restoreStars" ${canBuy?'':'disabled'}>${ledger.count>=3?'Had 3 pemulihan telah digunakan':'Pulihkan 3 bintang · '+money(cost)}</button>${!canBuy&&ledger.count<3?'<p>Duit kedai tidak mencukupi. Anda masih boleh ulang hari.</p>':''}<button class="secondary-btn" id="restartDay">Ulang hari ${progress.day}</button><small>Ulang hari memulihkan simpanan awal hari. Bilangan dan kos pemulihan bintang tidak direset.</small></div>`);
 $('restoreStars').onclick=()=>{if(session.stars!==0||ledger.count>=3||progress.wallet<cost)return;progress.wallet-=cost;ledger.count++;ledger.spent+=cost;session.stars=3;session.expenses+=cost;session.earned-=cost;progress.lifetime-=cost;modalKind=null;$('modal').close();paused=false;document.body.classList.remove('paused');render();save();if(['success','lost'].includes(phase))advance()};
 $('restartDay').onclick=()=>{const snapshot=session.dayStart;if(!snapshot)return;const currentSettings={...progress.settings},rescues={...ledger};const priorSpent=snapshot.starRecovery?.day===progress.day?snapshot.starRecovery.spent:0;const retainedUpgrades={...progress.upgrades};const retainedCategories=[...progress.unlocked];const retainedWallet=progress.wallet;
progress=JSON.parse(JSON.stringify(snapshot));progress.settings=currentSettings;
progress.upgrades={...progress.upgrades,...retainedUpgrades};progress.unlocked=retainedCategories;progress.wallet=retainedWallet;progress.starRecovery=rescues;ensureOperations(progress);payStoreCost(progress,Math.max(0,rescues.spent-priorSpent),true);ensureStyle();modalKind=null;$('modal').close();paused=false;advancePending=false;document.body.classList.remove('paused');newSession('career');save()};
}
function prepareScaleSound(){prepareScannerAudio();if(!audioCtx||scalePromise||typeof fetch!=='function')return;scalePromise=fetch('./digital-scale.wav').then(r=>r.arrayBuffer()).then(b=>audioCtx.decodeAudioData(b)).then(b=>scaleBuffer=b).catch(()=>{scalePromise=null})}
function playScaleSound(){if(!sound||!effectVolume('scale'))return;prepareScaleSound();stopScaleSound();if(scaleBuffer&&audioCtx){try{const node=audioCtx.createBufferSource(),gain=audioCtx.createGain();node.buffer=scaleBuffer;gain.gain.value=effectVolume('scale');node.connect(gain);gain.connect(audioCtx.destination);scaleSource={node,gain};node.onended=()=>{node.disconnect();gain.disconnect();if(scaleSource?.node===node)scaleSource=null};node.start();return}catch{}}try{const clip=$('scaleSound');clip.currentTime=0;clip.volume=effectVolume('scale');clip.play()?.catch(()=>{})}catch{}}
function stopScaleSound(){try{scaleSource?.node.stop()}catch{}scaleSource=null;try{$('scaleSound').pause();$('scaleSound').currentTime=0}catch{}}

function playDrawerSound(){
 if(!sound||effectVolume('drawer')===0)return;
 try {
  const clip=$('drawerSound');if(!clip)return;
  clip.pause();clip.currentTime=0;clip.volume=effectVolume('drawer');
  const result=clip.play();result?.catch(()=>{});
 } catch {}
}
function stopDrawerSound(){
 try{const clip=$('drawerSound');if(clip){clip.pause();clip.currentTime=0}}catch{}
}

function effectChoices(){return [['scanner','Scanner barcode'],['scale','Penimbang digital'],['drawer','Buka laci baki tunai'],['chaching','Cha-ching / bayaran'],['tap','Sentuhan butang'],['coin','Wang & syiling'],['success','Bayaran digital berjaya'],['error','Amaran / ralat'],['start','Mula syif']]}
function effectLevel(id){const v=Number(progress.settings.effects?.[id]??1);return Number.isFinite(v)?Math.max(0,Math.min(1,v)):1}
function effectVolume(id){return audioVolume()*effectLevel(id)}
function refreshEffectLevels(){for(const [key,source,audio]of [['scanner',scannerSource,'scannerSound'],['scale',scaleSource,'scaleSound'],['drawer',drawerSource,'drawerSound'],['chaching',chaChingSource,'chaChingSound']]){if(source?.gain)source.gain.gain.value=effectVolume(key);try{$(audio).volume=effectVolume(key)}catch{}}}
function previewEffect(id){if(id==='scale')playScaleSound();else if(id==='drawer')playDrawerSound();else if(id==='chaching')playChaChing();else if(id==='scanner')playScannerSound();else if(id==='tap')playTapSound();else beep(id)}
function effectSettingsHTML(){return `<details class="effect-mixer"><summary>Volume setiap bunyi</summary><p>Volume utama × volume bunyi. 0% untuk senyapkan satu bunyi sahaja.</p><div>${effectChoices().map(([id,label])=>`<div class="effect-channel"><label for="effect-${id}">${label} <b id="effect-label-${id}">${Math.round(effectLevel(id)*100)}%</b></label><input type="range" min="0" max="100" step="5" id="effect-${id}" data-effect="${id}" value="${Math.round(effectLevel(id)*100)}"><button class="secondary-btn" data-preview-effect="${id}" aria-label="Cuba bunyi ${label}">${icon('play')}</button></div>`).join('')}</div></details>`}
function bindEffectSettings(){$('modalContent').querySelectorAll('[data-effect]').forEach(el=>el.oninput=()=>{progress.settings.effects??={};progress.settings.effects[el.dataset.effect]=Number(el.value)/100;$('effect-label-'+el.dataset.effect).textContent=el.value+'%';refreshEffectLevels();save()});$('modalContent').querySelectorAll('[data-preview-effect]').forEach(el=>el.onclick=()=>previewEffect(el.dataset.previewEffect))}

function inventoryGroupsHTML(store){
 const all=PRODUCTS.filter(p=>store.unlocked.includes(p.category));
 return CATEGORIES.filter(c=>store.unlocked.includes(c.id)).map(c=>{
  const list=all.filter(p=>p.category===c.id),low=list.filter(p=>inventoryStateFor(p,store)!=='good').length;
  return `<details class="stock-category" data-stock-category="${c.id}" open><summary><span>${c.name}</span><small>${list.length} barang${low?' · '+low+' memerlukan stok':''}</small></summary><div class="stock-grid">${list.map(p=>{
   const count=store.inventory[p.id]||0,weighted=!!p.weighted,multiplier=weighted?1000:1;
   const state=inventoryStateFor(p,store),lowStock=state!=='good';
   const unitLabel=weighted?'kg':'unit',units=1;
   const remaining=Math.max(0,stockCapacity(store)-Math.floor(count/multiplier));
   const delta=wholesaleChange(p,store.day);
   const trendLabel=store.day<=1?'Harga hari ini':delta>0?'▲ Naik '+delta+'%':delta<0?'▼ Turun '+Math.abs(delta)+'%':'Harga stabil';
   const badge=state==='empty'?'<small class="stock-level empty">Stok habis</small>':state==='low'?'<small class="stock-level low">Stok rendah</small>':'<small class="stock-level good">Stok mencukupi</small>';
   return `<article class="stock-card ${lowStock?'low-stock':''}" data-stock-name="${p.name.toLowerCase()}" data-state="${state}">${productArt(p.id)}<div><b>${p.name}</b><span>${weighted?(count/1000).toFixed(2)+' kg':count+' unit'} ${badge}</span><small>Jual ${money(p.price)}${weighted?'/kg':''} · Borong ${money(stockCost(p,multiplier,store.day))}/${unitLabel}</small><small class="wholesale-trend ${delta>0?'up':delta<0?'down':'stable'}">${trendLabel}</small></div><meter min="0" max="${stockCapacity(store)}" value="${Math.min(stockCapacity(store),count/multiplier)}" aria-label="Stok ${p.name}"></meter><div class="stock-buy-picker"><span>Kuantiti beli (${unitLabel}) · Baki ${remaining}</span><div class="stock-qty-controls"><button type="button" data-stock-minus="${p.id}" aria-label="Kurangkan kuantiti ${p.name}">−</button><input data-stock-qty="${p.id}" inputmode="numeric" type="number" min="1" max="${MAX_STOCK_PURCHASE}" step="1" value="1" aria-label="Kuantiti untuk ${p.name}"><button type="button" data-stock-plus="${p.id}" aria-label="Tambah kuantiti ${p.name}">+</button></div></div><button type="button" class="secondary-btn stock-buy-action" data-restock="${p.id}" ${mode==='practice'||remaining===0?'disabled':''}>Beli 1 ${unitLabel} · ${money(stockCost(p,multiplier,store.day))}</button></article>`;
  }).join('')}</div></details>`;
 }).join('');
}
function filterInventory(){
 const term=$('inventorySearch').value.toLowerCase().trim(),state=inventorySelectedFilter();
 const cards=$('modalContent').querySelectorAll('[data-stock-name]');
 cards.forEach(el=>el.hidden=!el.dataset.stockName.includes(term)||(state!=='all'&&el.dataset.state!==state));
 $('modalContent').querySelectorAll('[data-stock-category]').forEach(group=>{
  group.hidden=![...group.querySelectorAll('[data-stock-name]')].some(el=>!el.hidden);
  if(term||state!=='all')group.open=true;
 });
}

function renderReturnReceipt(){ensureReturnClaim();const item=customer.items[0],claim=customer.returnClaim,total=item.scanned?(claim?.paid||0):0;$('roundingRow')?.remove();$('discountRow')?.remove();$('receiptQuantity').textContent='('+Number(!!item.scanned)+' barang)';$('receiptNo').textContent=claim?.receipt||'PULANGAN';$('receiptSub').textContent='Amaun dituntut · belum disahkan';$('subtotal').textContent=money(total);$('total').textContent=money(total);$('receiptList').innerHTML=item.scanned?`<div class="receipt-row"><span class="row-emoji">${productArt(item.id)}</span><span class="row-info"><b>${item.name}</b><small>Pemulangan · 1 unit</small></span><strong>${money(total)}</strong></div>`:`<div class="receipt-empty">${icon('undo')}<b>Barang pemulangan belum discan</b><small>Tekan barang di conveyor untuk semak.</small></div>`}

function cardGeometry(){const card=$('swipeCard'),scene=$('payDevice'),target=$('cardReaderTarget');if(!card||!scene||!target)return null;const plain=el=>{const b=el.getBoundingClientRect();return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,width:b.width,height:b.height}};return {c:plain(card),t:plain(target),r:plain(scene)}}
function cardDropAccepted(c,t){
 const centerX=c.left+c.width/2,centerY=c.top+c.height/2,targetX=t.left+t.width/2,targetY=t.top+t.height/2;
 return Math.abs(centerX-targetX)<=Math.max(42,t.width*.56)&&Math.abs(centerY-targetY)<=Math.max(30,t.height*.7);
}
function setCardPose(realign=false){const el=$('swipeCard');if(!el)return;if(realign){customer.cardPose=null;el.style.setProperty('--card-x','0px');el.style.setProperty('--card-y','0px')}let pose=customer.cardPose;if(!pose&&customer.cardStage!=='ready'){const g=cardGeometry();if(g){const {c,t}=g;pose={x:t.left+t.width/2-c.left-c.width*.5,y:t.top+t.height/2-c.top-c.height/2};customer.cardPose=pose}}if(pose){el.style.setProperty('--card-x',pose.x+'px');el.style.setProperty('--card-y',pose.y+'px')}}
function cancelBankCardDrag(){if(!bankCardDrag)return;bankCardDrag=null;const el=$('swipeCard');if(el){el.classList.remove('dragging');el.style.setProperty('--card-x','0px');el.style.setProperty('--card-y','0px')}if($('payDevice'))$('payDevice').classList.remove('card-in-range');}
function bindBankCardDrag(){
 const el=$('swipeCard'),scene=$('payDevice'),transaction=customer;let keyPose={x:0,y:0};
 const allowed=()=>transaction===customer&&!paused&&!busy&&phase==='offer'&&customer.cardStage==='ready';
 const reset=()=>{cancelBankCardDrag();el.classList.remove('dragging');el.classList.add('returning');el.style.setProperty('--card-x','0px');el.style.setProperty('--card-y','0px');keyPose={x:0,y:0};scene.classList.remove('card-in-range');setTimeout(()=>el.classList.remove('returning'),200)};
 const move=(dx,dy,base)=>{const r=base.r,c=base.c;dx=Math.max(r.left+5-c.left,Math.min(r.right-5-c.right,dx));dy=Math.max(r.top+5-c.top,Math.min(r.bottom-25-c.bottom,dy));el.style.setProperty('--card-x',dx+'px');el.style.setProperty('--card-y',dy+'px');const translated={...c,left:c.left+dx,top:c.top+dy};const valid=cardDropAccepted(translated,base.t);scene.classList.toggle('card-in-range',valid);return {x:dx,y:dy,valid}};
 const finish=pose=>{el.classList.remove('dragging');bankCardDrag=null;
  if(!allowed()||!pose?.valid){reset();return}
  const g=cardGeometry();
  if(g){customer.cardPose={x:g.t.left+g.t.width*.5-g.c.left-g.c.width*.5,y:g.t.top+g.t.height*.5-g.c.top-g.c.height*.5};}
  else customer.cardPose={x:pose.x,y:pose.y};
  customer.cardContactReady=true;startDigital(true)};
 el.onpointerdown=e=>{if(!allowed()||e.button>0||bankCardDrag)return;const base=cardGeometry();if(!base)return;base.c.left-=keyPose.x;base.c.right-=keyPose.x;base.c.top-=keyPose.y;base.c.bottom-=keyPose.y;el.classList.remove('returning');bankCardDrag={pointer:e.pointerId,x:e.clientX-keyPose.x,y:e.clientY-keyPose.y,base,pose:{x:0,y:0,valid:false},moved:false};el.setPointerCapture?.(e.pointerId);el.classList.add('dragging');e.preventDefault?.()};
 el.onpointermove=e=>{const d=bankCardDrag;if(!d||e.pointerId!==d.pointer)return;if(!allowed()){reset();return}const dx=e.clientX-d.x,dy=e.clientY-d.y;d.moved||=Math.hypot(dx,dy)>8;d.pose=move(dx,dy,d.base)};
 el.onpointerup=e=>{const d=bankCardDrag;if(!d||e.pointerId!==d.pointer)return;if(d.moved){const dx=e.clientX-d.x,dy=e.clientY-d.y;d.pose=move(dx,dy,d.base)}finish(d.moved?d.pose:null)};
 el.onpointercancel=reset;el.onlostpointercapture=()=>{if(bankCardDrag)reset()};
 el.onclick=()=>{};
 el.onkeydown=e=>{if(!allowed())return;const shifts={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};if(e.key==='Escape'){e.preventDefault();reset();return}if(e.key==='Enter'||e.key===' '){e.preventDefault();finish(keyPose);return}if(!shifts[e.key])return;e.preventDefault();const base=cardGeometry();base.c.left-=keyPose.x;base.c.right-=keyPose.x;base.c.top-=keyPose.y;base.c.bottom-=keyPose.y;keyPose=move(keyPose.x+shifts[e.key][0],keyPose.y+shifts[e.key][1],base)};
}
function positionCustomerDialogue(){
 const scene=document.querySelector('.store-scene'),art=$('customerArt'),bubble=$('speech'),info=$('customerInfo');
 if(!scene||!art||!bubble||!info||!customer)return;
 const sceneBox=scene.getBoundingClientRect();if(!sceneBox.width||!sceneBox.height)return;
 const compact=sceneBox.width<520,veryNarrow=sceneBox.width<390;
 // The character is centered using translateX(-50%). offsetLeft is the
 // stable untransformed center, unlike getBoundingClientRect during animation.
 art.style.left=compact?'34%':'';
 const center=art.offsetLeft,half=art.offsetWidth/2;
 const charLeft=center-half,charRight=center+half;
 const gap=compact?12:22,edge=compact?9:15;
 const rightRoom=sceneBox.width-charRight-gap-edge,leftRoom=charLeft-gap-edge;
 const onRight=rightRoom>=112||rightRoom>=leftRoom;
 const free=Math.max(1,onRight?rightRoom:leftRoom);
 const width=Math.max(1,Math.min(compact?(veryNarrow?148:185):240,free));
 const left=onRight?charRight+gap:charLeft-gap-width;
 bubble.classList.toggle('speech-left',!onRight);
 bubble.style.left=Math.round(Math.max(edge,left))+'px';bubble.style.right='auto';
 bubble.style.width=Math.floor(width)+'px';bubble.style.maxWidth=Math.floor(width)+'px';bubble.style.minWidth='0';
 bubble.style.bottom='auto';bubble.style.transform='none';
 const infoTop=info.getBoundingClientRect().top-sceneBox.top;
 const safeSpace=Math.max(32,infoTop-26);
 bubble.style.maxHeight=safeSpace+'px';
 const height=bubble.getBoundingClientRect().height;
 const target=art.offsetTop+Math.round(art.offsetHeight*.14);
 bubble.style.top=Math.round(Math.max(10,Math.min(target,infoTop-height-12)))+'px';
}

window.addEventListener('resize',()=>{cancelBankCardDrag();if(customer?.method==='card'&&['pin','processing','contact'].includes(customer.cardStage))setCardPose(true);if(!$('floatingCalculator')?.hidden&&calculatorPosition)positionCalculator(calculatorPosition.x,calculatorPosition.y);requestAnimationFrame(positionCustomerDialogue)});
window.visualViewport?.addEventListener('resize',()=>{if(!$('floatingCalculator')?.hidden&&calculatorPosition)positionCalculator(calculatorPosition.x,calculatorPosition.y)});
document.addEventListener('fullscreenchange',()=>requestAnimationFrame(positionCustomerDialogue));
if(typeof ResizeObserver!=='undefined'){const sceneObserver=new ResizeObserver(()=>requestAnimationFrame(positionCustomerDialogue));const scene=document.querySelector('.store-scene');if(scene)sceneObserver.observe(scene);sceneObserver.observe($('speech'));}

function ensureUpdatePrompt(){
 if(updatePrompt)return updatePrompt;
 updatePrompt=document.createElement('button');
 updatePrompt.type='button';
 updatePrompt.className='update-prompt';
 updatePrompt.hidden=true;
 updatePrompt.setAttribute('aria-live','polite');
 updatePrompt.innerHTML=`<span>${icon('spark')}</span><span class="update-prompt-copy"><b>Versi baharu tersedia</b><small>Tekan untuk kemas kini sekarang</small></span>`;
 updatePrompt.onclick=applyRemoteUpdate;
 document.body.append(updatePrompt);
 return updatePrompt;
}
function showUpdatePrompt(version='baru'){
 if(updatingNow)return;
 const el=ensureUpdatePrompt();el.hidden=false;el.disabled=false;el.dataset.version=version;
}
function hideUpdatePrompt(){if(updatePrompt)updatePrompt.hidden=true}
let updatingNow=false;
async function applyRemoteUpdate(){
 if(updatingNow)return;
 const button=ensureUpdatePrompt(),targetVersion=button.dataset.version;
 updatingNow=true;button.disabled=true;
 button.querySelector('.update-prompt-copy').innerHTML='<b>Sedang mengemas kini...</b><small>Sila tunggu sebentar</small>';
 // Let any queued progress save start, then navigate with a fresh URL. The new
 // page loads app.mjs and style.css using the latest version.json identifier.
 try{
  // Keep the last transaction before leaving the page. Firebase saves are
  // normally debounced, so flush the pending snapshot explicitly.
  save();
  if(cloud?.getUser?.()){
   await Promise.race([cloud.flush(),new Promise(resolve=>setTimeout(resolve,4500))]);
  }
  const url=new URL(location.href);
  url.searchParams.set('release',targetVersion||String(Date.now()));
  url.searchParams.set('refresh',String(Date.now()));
  location.replace(url.href);
 }catch{
  updatingNow=false;button.disabled=false;
  button.querySelector('.update-prompt-copy').innerHTML='<b>Kemas kini belum berjaya</b><small>Tekan untuk cuba semula</small>';
  button.hidden=false;
 }
}
async function checkForRemoteUpdate(){
 try{
  const response=await fetch(`${UPDATE_CHECK_URL}?check=${Date.now()}`,{cache:'no-store'});
  if(!response.ok)return;
  const data=await response.json();
  if(typeof data?.version==='string'&&/^[a-zA-Z0-9._-]{1,100}$/.test(data.version)){
    if(data.version!==APP_BUILD)showUpdatePrompt(data.version);
    else hideUpdatePrompt();
  }
 }catch{ /* Unavailable network should not hide an existing update */ }
}
function startUpdateChecker(){
 checkForRemoteUpdate();clearInterval(updateCheckTimer);
 updateCheckTimer=setInterval(checkForRemoteUpdate,60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkForRemoteUpdate()});
}

// Mobile: move original control buttons into a collapsible bar, leaving the
// existing game header, utility bar, conveyor and stations unchanged.
function setupMobileControls(){
 const nav=$('gameTools'),topbar=document.querySelector('.topbar'),slot=$('mobileControlsSlot'),toggle=$('mobileControlsToggle');
 if(!nav||!topbar||!slot||!toggle)return;
 const media=window.matchMedia('(max-width:760px)');
 const update=()=>{
  if(media.matches){
   if(nav.parentElement!==slot)slot.append(nav);
   nav.hidden=!nav.classList.contains('mobile-expanded');
   toggle.setAttribute('aria-expanded',String(!nav.hidden));
   toggle.querySelector('.mobile-chevron').textContent=nav.hidden?'▾':'▴';
  }else{
   if(nav.parentElement!==topbar)topbar.append(nav);
   nav.hidden=false;nav.classList.remove('mobile-expanded');
   toggle.setAttribute('aria-expanded','false');
  }
 };
 toggle.onclick=()=>{
  const expanded=!nav.classList.contains('mobile-expanded');
  nav.classList.toggle('mobile-expanded',expanded);
  nav.hidden=!expanded;toggle.setAttribute('aria-expanded',String(expanded));
  toggle.querySelector('.mobile-chevron').textContent=expanded?'▴':'▾';
 };
 nav.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
  if(!media.matches||!nav.classList.contains('mobile-expanded'))return;
  nav.classList.remove('mobile-expanded');nav.hidden=true;
  toggle.setAttribute('aria-expanded','false');
  toggle.querySelector('.mobile-chevron').textContent='▾';
 }));
 if(media.addEventListener)media.addEventListener('change',update);
 else media.addListener(update);
 update();
}
setupMobileControls();

// Cloud login opens over the existing start screen. The game stays usable offline.
cloud.start();
startUpdateChecker();
