/* KitaFood v30 — rider at the normal checkout counter.
 * Items are selected from a shelf, staged in a bag and only deducted from
 * inventory after a verified handoff. Existing delivery progress is migrated.
 */
export function createDelivery({getProgress,getSession,getMode,save,notify,money,products,categories=[],productArt,icon,openModal,closeModal,receiveCash,onFinish=()=>{}}){
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const people=[
  {name:'Amir',skin:'#cf9570',hair:'#322d2a',shirt:'#27785d',scarf:false},
  {name:'Sofia',skin:'#ddad89',hair:'#3a3030',shirt:'#27785d',scarf:true,scarfColor:'#32645d'},
  {name:'Hafiz',skin:'#bd835f',hair:'#272827',shirt:'#27785d',scarf:false},
  {name:'Nadia',skin:'#cf987c',hair:'#44352f',shirt:'#27785d',scarf:true,scarfColor:'#337768'},
  {name:'Faris',skin:'#d09d78',hair:'#292d2f',shirt:'#27785d',scarf:false}
 ];
 const pmap=new Map(products.map(x=>[x.id,x]));
 const foodCategories=new Set(['essentials','snacks','meals','bakery','frozen','beverages','pantry','kuih']);
 const statsDefault=()=>({completed:0,cancelled:0,revenue:0,bonus:0,late:0,starsTotal:0});
 let activeId=null,stage='list',search='',filter='all',lastPicked=null,clockHandle=null,lastClock=0,resultPending=null;
 const timeLimit=day=>Math.max(65,135-Math.max(0,day-3)*5);
 const pending=d=>d.orders.filter(o=>['new','packing','ready'].includes(o.status)&&Array.isArray(o.items));
 const picked=o=>o.items.filter(x=>x.packed).length;
 const ready=o=>!!o.items.length&&o.items.every(x=>x.packed);
 const due=o=>Math.max(0,Math.ceil((o.timeLimit||timeLimit(o.day))-(o.elapsedSeconds||0)));
 const total=o=>o.items.reduce((n,x)=>n+(Number(x.price)||pmap.get(x.id)?.price||0),0);
 const unlocked=()=>getMode()==='career'&&getProgress().day>=3;
 function ensure(){
  const p=getProgress();
  if(!p.delivery||typeof p.delivery!=='object')p.delivery={orders:[],nextId:1,stats:statsDefault(),upgrades:{rack:0}};
  const d=p.delivery;
  if(!Array.isArray(d.orders))d.orders=[];
  d.nextId=Math.max(1,Math.floor(Number(d.nextId)||1));
  d.stats={...statsDefault(),...(d.stats||{})};
  if(!d.upgrades)d.upgrades={rack:0};
  for(const o of d.orders){
   if(!Array.isArray(o.items))o.items=[];
   if(o.items.length&&ready(o)&&['new','packing'].includes(o.status))o.status='ready';
   // Older app generated multiple external platform brands. Preserve their
   // order IDs, but display the new in-house KitaFood brand everywhere.
   o.platform='KitaFood';o.timeLimit??=timeLimit(o.day||p.day);
   o.elapsedSeconds=Number(o.elapsedSeconds)||0;
  }
  updateIndicator(d);return d;
 }
 function updateIndicator(d){const b=document.getElementById('deliveryBtn');if(!b)return;const n=pending(d).length;b.dataset.pending=String(n);b.classList.toggle('delivery-alert',n>0);b.title=n?`${n} pesanan KitaFood aktif`:'KitaFood'}
 function personFor(order){const normalized=people.find(x=>x.name===order?.rider)||people[0];return {...normalized,id:'rider-kita-food',role:'KitaFood · Rakan Penghantar'};}
 function newOrder(){
  if(!unlocked())return null;
  const p=getProgress(),d=ensure();
  if(pending(d).length)return pending(d)[0];
  const pool=products.filter(x=>foodCategories.has(x.category)&&p.unlocked.includes(x.category)&&!x.weighted&&(Number(p.inventory?.[x.id])||0)>0);
  if(pool.length<2)return null;
  const count=Math.min(pool.length,Math.min(6,2+Math.floor((p.day-1)/3))),items=[];
  const candidates=pool.slice();
  while(items.length<count&&candidates.length){const i=Math.floor(Math.random()*candidates.length),x=candidates.splice(i,1)[0];items.push({id:x.id,name:x.name,price:x.price,packed:false});}
  const id=d.nextId++,rider=people[id%people.length].name;
  const order={id:`KF-${String(id).padStart(4,'0')}`,platform:'KitaFood',rider,code:String(1000+Math.floor(Math.random()*9000)),items,status:'new',day:p.day,timeLimit:timeLimit(p.day),elapsedSeconds:0,wrongPicks:0};
  d.orders.push(order);activeId=order.id;stage='list';search='';filter='all';save();updateIndicator(d);
  return order;
 }
 function maybeArrive(index){
  if(!unlocked()||!getSession())return null;
  const s=getSession(),existing=pending(ensure());
  if(existing.length)return existing[0];
  // One visit every three counter visitors, with a second half-day visit
  // when the shift is long. No visits during Rush Hour.
  if(index<2||index%3!==2||s.kitaFoodLastSpawn===index||s.rushSecondsRemaining>0)return null;
  const order=newOrder();if(order){s.kitaFoodLastSpawn=index;save();}return order;
 }
 function stopClock(){if(clockHandle!==null){clearInterval(clockHandle);clockHandle=null}}
 function startClock(o){
  stopClock();lastClock=Date.now();
  clockHandle=setInterval(()=>{
   if(document.hidden||!document.getElementById('modal')?.open||document.getElementById('modal')?.dataset.kind!=='delivery'||!pending(ensure()).includes(o)){lastClock=Date.now();return}
   const now=Date.now(),elapsed=Math.min(2,(now-lastClock)/1000);lastClock=now;
   o.elapsedSeconds+=elapsed;
   const e=document.getElementById('kfTimer');if(e){e.textContent=`${Math.floor(due(o)/60)}:${String(due(o)%60).padStart(2,'0')}`;e.closest('.kf-timer')?.classList.toggle('urgent',due(o)<30)}
   if(Math.floor(o.elapsedSeconds)%5===0)save();
  },1000);
 }
 function shelfHTML(o){
  const p=getProgress(),term=search.toLocaleLowerCase('ms');
  const list=products.filter(x=>foodCategories.has(x.category)&&p.unlocked.includes(x.category)&&!x.weighted&&(filter==='all'||x.category===filter)&&(!term||x.name.toLocaleLowerCase('ms').includes(term)));
  if(!list.length)return '<div class="kf-no-products">Tiada produk sepadan. Cuba carian lain.</div>';
  return list.map(x=>{
   const packed=o.items.some(y=>y.id===x.id&&y.packed),stock=p.inventory?.[x.id]||0;
   return `<button type="button" class="kf-shelf-product ${packed?'picked':''}" data-kf-pick="${safe(x.id)}" ${stock<=0?'disabled':''} aria-label="Ambil ${safe(x.name)}"><span class="kf-product-art">${productArt(x.id)}</span><strong>${safe(x.name)}</strong><small>${money(x.price)}</small><span class="kf-stock">${stock<=0?'HABIS':`STOK ${stock}`}</span>${packed?`<span class="kf-product-check">${icon('check')}</span>`:''}</button>`;
  }).join('');
 }
 function orderRows(o){return o.items.map((x,i)=>`<div class="kf-order-row ${x.packed?'done':''}"><span class="kf-item-number">${x.packed?icon('check'):String(i+1).padStart(2,'0')}</span><div><b>${safe(x.name)}</b><small>1 unit · ${money(x.price)}</small></div><span class="kf-row-status">${x.packed?'Dalam beg':'Belum ambil'}</span></div>`).join('')}
 function ticket(o){return `<section class="kf-ticket"><div class="kf-section-heading"><div><small>SENARAI BARANGAN</small><h3>Pesanan ${safe(o.id)}</h3></div><b>${picked(o)}/${o.items.length}</b></div><div class="kf-order-rows">${orderRows(o)}</div><div class="kf-ticket-total"><span>DIBAYAR DALAM APLIKASI</span><strong>${money(total(o))}</strong></div></section>`}
 function riderHeader(o){return `<div class="kf-rider"><div class="kf-rider-badge">${icon('delivery')}</div><div class="kf-rider-info"><small>RIDER KITAFOOD DI KAUNTER</small><h3>${safe(o.rider)} <span>· ${safe(o.id)}</span></h3><p>“Hai! Saya datang ambil pesanan pelanggan.”</p></div><div class="kf-timer ${due(o)<30?'urgent':''}"><small>MASA BAKI</small><strong id="kfTimer">${Math.floor(due(o)/60)}:${String(due(o)%60).padStart(2,'0')}</strong></div></div>`}
 function render(id=activeId,{preserve=false}={}){
  stopClock();const d=ensure(),p=getProgress(),o=pending(d).find(x=>x.id===id)||pending(d)[0]||null;
  activeId=o?.id||null;
  const dialog=document.getElementById('modal'),oldScroll=preserve?dialog.scrollTop:0,oldShelf=preserve?document.getElementById('kfShelf')?.scrollTop||0:0;
  const s=d.stats;
  const head=`<header class="kf-head"><div class="kf-logo">${icon('delivery')}</div><div><small>KEDAI KITA · PENGHANTARAN TEMPATAN</small><h2>Kita<em>Food</em></h2><p>Pesanan pelanggan, disiapkan di kaunter.</p></div><button id="kfClose" class="icon-btn" aria-label="Tutup KitaFood">${icon('close')}</button></header>`;
  const stats=`<div class="kf-stats"><div><small>DIHANTAR</small><strong>${s.completed||0}</strong></div><div><small>JUALAN KITAFOOD</small><strong>${money(s.revenue||0)}</strong></div><div><small>GANJARAN PANTAS</small><strong>${money(s.bonus||0)}</strong></div></div>`;
  const content=!o?`<div class="kf-welcome"><div class="kf-welcome-graphic">${icon('delivery')}</div><h3>${unlocked()?'Kaunter KitaFood sedia!':'KitaFood dibuka pada Hari 3'}</h3><p>${unlocked()?'Rider KitaFood akan muncul sendiri selepas beberapa pelanggan biasa. Semak senarai dan cari barang apabila rider tiba.':'Teruskan Mod Kerjaya sehingga Hari 3 untuk menerima pesanan penghantaran.'}</p><div class="kf-mini-steps"><span>Rider tiba</span><span>Cari barang</span><span>Sahkan kod</span></div></div>`:
   `${riderHeader(o)}<nav class="kf-steps" aria-label="Proses pesanan"><span class="done">1. Semak</span><span class="${stage==='pick'||stage==='verify'?'done':''}">2. Cari barang</span><span class="${stage==='verify'?'done':''}">3. Serah</span></nav>
   ${stage==='list'?`<div class="kf-intro-stage">${ticket(o)}<aside class="kf-tip-card"><div class="kf-tip-symbol">${icon('basket')}</div><h3>Cari sendiri barang pesanan</h3><p>Lihat senarai di sebelah. Pilih barang yang betul pada rak kedai dan masukkan ke beg sebelum menyerahkannya kepada rider.</p><div class="kf-tip-note">Bayaran pelanggan sudah diterima melalui KitaFood. Tiada perlu kutip tunai.</div><button class="primary-btn kf-big-button" id="kfStart">Mula Cari Barang ${icon('arrow')}</button></aside></div>`:
   stage==='pick'?`<div class="kf-pick-layout">${ticket(o)}<section class="kf-shop"><div class="kf-section-heading"><div><small>RAK PRODUK KEDAI KITA</small><h3>Pilih barang yang diminta</h3></div><span class="kf-scan-label">${icon('scan')} IMBAS</span></div><div class="kf-filter"><input id="kfSearch" type="search" placeholder="Cari nama produk..." aria-label="Cari barang" autocomplete="off"><select id="kfCategory" aria-label="Kategori barang"><option value="all">Semua kategori</option>${categories.filter(c=>p.unlocked.includes(c.id)&&foodCategories.has(c.id)).map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`).join('')}</select></div><div class="kf-shelf" id="kfShelf">${shelfHTML(o)}</div></section></div><div class="kf-bag"><div class="kf-bag-head">${icon('basket')} <div><small>BEG PESANAN</small><strong>${picked(o)} daripada ${o.items.length} barang</strong></div><div class="kf-progress"><i style="width:${Math.round(100*picked(o)/o.items.length)}%"></i></div></div><div class="kf-packed">${picked(o)?o.items.filter(x=>x.packed).map(x=>`<div class="kf-packed-product">${productArt(x.id)}<span>${safe(x.name)}</span><button data-kf-remove="${safe(x.id)}" type="button">Keluarkan</button></div>`).join(''):'<p>Beg masih kosong. Tekan barang yang betul di rak untuk mengisi beg.</p>'}</div><button class="primary-btn kf-big-button" id="kfDone" ${ready(o)?'':'disabled'}>${ready(o)?'Barang Sudah Siap':'Lengkapkan Semua Barang'} ${icon('check')}</button></div>`:
   `<div class="kf-verify-stage"><div class="kf-sealed"><span class="kf-seal-art">${icon('basket')}<i>${icon('check')}</i></span><h3>Semua barang telah dibungkus!</h3><p>Beg pesanan <b>${safe(o.id)}</b> telah dimeterai. Pastikan kod pengambilan sepadan sebelum serahkan kepada rider.</p><div class="kf-review-list">${o.items.map(x=>`<span>${icon('check')} ${safe(x.name)}</span>`).join('')}</div><button class="kf-back" id="kfEdit">${icon('undo')} Semak semula beg</button></div><div class="kf-phone"><small>KOD PENGAMBILAN PADA TELEFON RIDER</small><strong>${safe(o.code)}</strong><span>KITAFOOD · ${safe(o.rider)}</span><label for="kfCode">Masukkan kod 4 digit rider</label><input id="kfCode" maxlength="4" inputmode="numeric" pattern="[0-9]*" placeholder="0000" autocomplete="off"><button class="primary-btn kf-big-button" id="kfHandoff">Sahkan & Serah Kepada Rider ${icon('check')}</button></div></div>`}
   <div class="kf-cancel-line"><button id="kfCancel" class="kf-cancel">Batalkan pesanan</button><div id="kfConfirmCancel" class="kf-cancel-confirm" hidden><p>Batalkan pesanan ${safe(o.id)}? Stok tidak akan ditolak.</p><button type="button" id="kfKeep">Kembali</button><button type="button" id="kfCancelYes">Ya, batalkan</button></div></div>`;
  openModal('delivery',`<div class="modal-pad kf-ui kf-state-${o?stage:'empty'}">${head}${stats}${content}<footer class="kf-footer">KITAFOOD · Hanya stok pesanan yang berjaya diserahkan akan ditolak.</footer></div>`);
  document.getElementById('kfClose').onclick=()=>{stopClock();closeModal()};
  if(!o)return;
  if(stage==='list')document.getElementById('kfStart').onclick=()=>{stage='pick';render(o.id)};
  if(stage==='pick'){
   const inp=document.getElementById('kfSearch'),sel=document.getElementById('kfCategory');inp.value=search;sel.value=filter;
   inp.oninput=()=>{search=inp.value;refreshShelf(o)};sel.onchange=()=>{filter=sel.value;refreshShelf(o)};
   document.getElementById('kfShelf').onclick=e=>{const btn=e.target.closest('[data-kf-pick]');if(btn)pick(o,btn.dataset.kfPick)};
   document.querySelectorAll('[data-kf-remove]').forEach(b=>b.onclick=()=>removePick(o,b.dataset.kfRemove));
   document.getElementById('kfDone').onclick=()=>{if(!ready(o)){notify('Masih ada barang yang belum diambil.',true);return}o.sealed=true;stage='verify';save();render(o.id)};
  }
  if(stage==='verify'){
   document.getElementById('kfEdit').onclick=()=>{o.sealed=false;stage='pick';save();render(o.id)};
   document.getElementById('kfHandoff').onclick=()=>handoff(o);
   document.getElementById('kfCode').onkeydown=e=>{if(e.key==='Enter')handoff(o)};
  }
  document.getElementById('kfCancel').onclick=()=>{document.getElementById('kfConfirmCancel').hidden=false};
  document.getElementById('kfKeep').onclick=()=>{document.getElementById('kfConfirmCancel').hidden=true};
  document.getElementById('kfCancelYes').onclick=()=>finish(o,false);
  if(preserve){dialog.scrollTop=oldScroll;if(document.getElementById('kfShelf'))document.getElementById('kfShelf').scrollTop=oldShelf}
  startClock(o);
 }
 function refreshShelf(o){const e=document.getElementById('kfShelf');if(e)e.innerHTML=shelfHTML(o)}
 function pick(o,id){
  if(!pending(ensure()).includes(o)||stage!=='pick')return;
  const x=o.items.find(y=>y.id===id&&!y.packed),p=pmap.get(id);
  if(!x){if(!o.items.some(y=>y.id===id))o.wrongPicks=(o.wrongPicks||0)+1;notify((p?.name||'Barang')+' tidak diperlukan atau sudah dimasukkan ke beg.',true);return}
  if((getProgress().inventory?.[id]||0)<1){notify('Stok '+safe(x.name)+' tidak cukup.',true);return}
  x.packed=true;o.status=ready(o)?'ready':'packing';lastPicked=id;save();render(o.id,{preserve:true});
  if(ready(o))notify('Bagus! Semua barang lengkap. Tekan Barang Sudah Siap.');
 }
 function removePick(o,id){const x=o.items.find(y=>y.id===id&&y.packed);if(!x)return;x.packed=false;o.status=picked(o)?'packing':'new';o.sealed=false;save();render(o.id,{preserve:true})}
 function handoff(o){
  if(!ready(o)||!o.sealed){notify('Sediakan semua barang dahulu.',true);return}
  const code=document.getElementById('kfCode')?.value.trim();
  if(code!==String(o.code)){notify('Kod rider tidak sepadan. Semak semula.',true);document.getElementById('kfCode')?.focus();return}
  const p=getProgress(),counts={};for(const x of o.items)counts[x.id]=(counts[x.id]||0)+1;
  if(Object.entries(counts).some(([id,n])=>(p.inventory?.[id]||0)<n)){notify('Stok tidak mencukupi untuk serahan. Semak Inventori.',true);return}
  for(const [id,n]of Object.entries(counts))p.inventory[id]-=n;
  const amount=total(o),isLate=due(o)===0,bonus=isLate?0:Math.round(amount*.10),earn=Math.round(amount*.25)+bonus;
  receiveCash(p,earn);p.lifetime=(p.lifetime||0)+amount;
  const d=ensure(),s=d.stats;
  o.status='completed';o.completedDay=p.day;o.rating=isLate?3:o.wrongPicks?4:5;o.bonus=bonus;o.earned=earn;
  s.completed++;s.revenue+=amount;s.bonus+=bonus;s.starsTotal=(s.starsTotal||0)+o.rating;if(isLate)s.late++;
  const session=getSession();if(session){session.served=(session.served||0)+1;session.deliveryCompleted=(session.deliveryCompleted||0)+1;session.deliveryRevenue=(session.deliveryRevenue||0)+amount;session.deliveryBonus=(session.deliveryBonus||0)+bonus;session.totalSales=(session.totalSales||0)+amount;session.earned=(session.earned||0)+earn;}
  archive(d);save();updateIndicator(d);showResult(o,true);
 }
 function finish(o,success){
  if(success)return handoff(o);
  if(!pending(ensure()).includes(o))return;
  o.status='cancelled';ensure().stats.cancelled++;archive(ensure());save();updateIndicator(ensure());showResult(o,false);
 }
 function archive(d){const done=d.orders.filter(x=>['completed','cancelled'].includes(x.status));if(done.length>50){const old=new Set(done.slice(0,done.length-50));d.orders=d.orders.filter(x=>!old.has(x))}}
 function showResult(o,success){
  resultPending={o,success};stopClock();activeId=null;stage='list';lastPicked=null;search='';filter='all';
  const stars=success?'★'.repeat(o.rating)+'☆'.repeat(5-o.rating):'—';
  openModal('delivery',`<div class="modal-pad kf-ui kf-result"><div class="kf-result-emblem">${icon(success?'check':'close')}</div><small>KITAFOOD · ${safe(o.id)}</small><h2>${success?'Pesanan berjaya diserahkan!':'Pesanan dibatalkan'}</h2><p>${success?`Terima kasih! Rider ${safe(o.rider)} sudah mengambil beg dan bersedia membuat penghantaran.`:'Rider telah dimaklumkan. Stok kekal dan tiada bayaran direkodkan.'}</p>${success?`<div class="kf-result-stars">${stars} <small>Penilaian perkhidmatan</small></div><div class="kf-result-table"><div>Nilai pesanan <b>${money(total(o))}</b></div><div>Untung kedai <b>${money(o.earned-o.bonus)}</b></div><div>Bonus pantas <b>${money(o.bonus)}</b></div><div class="total">Jumlah diterima <b>${money(o.earned)}</b></div></div>`:''}<button id="kfNext" class="primary-btn kf-big-button">${success?'Rider Beredar · Pelanggan Seterusnya':'Teruskan Layan Pelanggan'} ${icon('arrow')}</button></div>`);
  document.getElementById('kfNext').onclick=()=>{resultPending=null;closeModal();onFinish(o,success)};
 }
 function open(id){
  if(resultPending){showResult(resultPending.o,resultPending.success);return}
  const doneOrder=ensure().orders.find(x=>x.id===id&&['completed','cancelled'].includes(x.status));
  if(id&&doneOrder){showResult(doneOrder,doneOrder.status==='completed');return}
  const o=pending(ensure()).find(x=>x.id===id)||pending(ensure())[0]||null;
  if(o&&o.id!==activeId){stage=o.sealed?'verify':picked(o)?'pick':'list';search='';filter='all'}
  render(o?.id||null);
 }
 function resumeOrder(id){activeId=null;open(id)}
 return {open,ensure,maybeArrive,personFor,resumeOrder,stopClock,spawnTestOrder:newOrder};
}
