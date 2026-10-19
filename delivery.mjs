/* KedaiKita Delivery Rider Studio v29.
 * Orders and packed goods are saved to progress.delivery; inventory is only
 * deducted once a verified handoff is completed. No images or emoji required.
 */
export function createDelivery({getProgress,getSession,getMode,save,notify,money,products,categories=[],productArt,icon,openModal,closeModal,receiveCash}){
 const platforms=[{name:'foodpanda',short:'FP',color:'#e74c92',light:'#fff0f6'},
                  {name:'GrabFood',short:'GF',color:'#178b63',light:'#e9f7f0'},
                  {name:'Kita Delivery',short:'KD',color:'#b47a40',light:'#fbf2e4'}];
 const riders=['Amir','Sofia','Hafiz','Nadia','Faris'];
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pmap=new Map(products.map(p=>[p.id,p]));
 let activeId=null,search='',filter='all',lastPicked=null;
 const emptyStats=()=>({completed:0,cancelled:0,revenue:0,bonus:0,late:0});
 function ensure(){
  const p=getProgress();
  if(!p.delivery||typeof p.delivery!=='object')p.delivery={orders:[],nextId:1,stats:emptyStats(),upgrades:{rack:0}};
  const d=p.delivery;
  if(!Array.isArray(d.orders))d.orders=[];
  d.stats={...emptyStats(),...(d.stats||{})};
  if(!d.upgrades||typeof d.upgrades!=='object')d.upgrades={rack:0};
  d.upgrades.rack=Math.min(2,Math.max(0,Number(d.upgrades.rack)||0));
  d.nextId=Math.max(1,Math.floor(Number(d.nextId)||1));
  // Old v28 orders use `packed` booleans: leave them intact and accessible.
  d.orders.forEach(o=>{if(Array.isArray(o.items)&&['new','packing'].includes(o.status)&&o.items.length&&o.items.every(x=>x.packed))o.status='ready'});
  updateIndicator(d);return d;
 }
 const pending=d=>d.orders.filter(o=>['new','packing','ready'].includes(o.status)&&Array.isArray(o.items));
 const capacity=d=>1+(d.upgrades.rack||0);
 const time=()=>Number(getSession()?.clockMinutes)||480;
 const unlocked=()=>getMode()==='career'&&getProgress().day>=3;
 const ready=o=>o.items.length>0&&o.items.every(x=>x.packed);
 const picked=o=>o.items.filter(x=>x.packed).length;
 const platformOf=o=>platforms.find(x=>x.name===o.platform)||platforms[2];
 const remaining=o=>o.day<getProgress().day?0:Math.max(0,Math.ceil((Number(o.deadline)||0)-time()));
 const total=o=>o.items.reduce((n,x)=>n+(Number(x.price)||pmap.get(x.id)?.price||0),0);
 function updateIndicator(d){const b=document.getElementById('deliveryBtn');if(!b)return;const n=pending(d).length;b.dataset.pending=String(n);b.classList.toggle('delivery-alert',n>0);b.title=n?`${n} pesanan rider perlu disiapkan`:'Urus pesanan rider'}
 const glyph=name=>icon(name);
 function riderArt(o){
  const female=['Sofia','Nadia'].includes(o.rider),platform=platformOf(o);
  return `<svg class="delivery-character" viewBox="0 0 258 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi rider ${safe(o.rider)} bersama motosikal penghantaran">
   <ellipse cx="132" cy="149" rx="115" ry="6" fill="#243d34" opacity=".10"/>
   <g class="rider-scooter"><circle cx="58" cy="124" r="24" fill="#283b43"/><circle cx="58" cy="124" r="16" fill="#9dacb4"/><circle cx="58" cy="124" r="10" fill="#edf2ee"/><circle cx="203" cy="124" r="24" fill="#283b43"/><circle cx="203" cy="124" r="16" fill="#9dacb4"/><circle cx="203" cy="124" r="10" fill="#edf2ee"/>
   <path d="M58 124 87 88h55l24 36h37" stroke="#344e58" stroke-width="8" stroke-linejoin="round" fill="none"/><path d="M78 105q-7-24 13-29h64q16 0 19 15l13 34H79Z" fill="${platform.color}" stroke="#32494a" stroke-width="3"/><path d="M86 105h65q-4 14-16 19H88Z" fill="#f7f7ed" opacity=".32"/><rect x="185" y="74" width="41" height="41" rx="7" fill="${platform.color}" stroke="#fff" stroke-width="3"/><rect x="189" y="79" width="33" height="20" rx="4" fill="#fff" opacity=".91"/><text x="205" y="93" font-size="12" font-weight="900" text-anchor="middle" fill="${platform.color}" font-family="Arial,sans-serif">${platform.short}</text><path d="m155 88 22-24h15" fill="none" stroke="#3d5358" stroke-width="6" stroke-linecap="round"/><rect x="185" y="61" width="14" height="5" rx="2.5" fill="#263a3f"/></g>
   <g class="rider-person"><path d="M95 91q-16 3-23 25l19 6 19-25" fill="#344654"/><path d="M119 94q7 13 25 24l11-7q-6-19-23-36" fill="#334e56"/><path d="M107 69q-20 7-21 35h54q4-28-18-35" fill="${platform.color}"/><path d="M91 99h45" stroke="#fff" opacity=".58" stroke-width="3"/><path d="m127 79 23 11 19-12" stroke="#bf8a65" stroke-width="10" stroke-linecap="round" fill="none"/><path d="m109 64-1 13 15 2 2-16" fill="#c48b64"/>
   ${female?'<path d="M98 46q-11 15-7 36 14 7 37 1l5-21-16-24Z" fill="#394d51"/>':'<path d="M99 48q-2-25 24-20 11 5 9 22" fill="#2b373d"/>'}
   <path d="M100 44q2-17 16-17 18 0 18 20v13q-8 17-20 10-12-6-14-26Z" fill="#d9a07a"/>
   ${female?'<path d="M103 46q3-14 16-14 10 0 13 14l-4-10-11-2-13 14Z" fill="#394d51"/>':'<path d="M100 44q-6-14 6-18 15-7 27 9-17-2-31 12Z" fill="#2a353a"/>'}
   <path d="M98 43q-5-22 14-27 19-5 28 18l-2 13h-13v-5q-12 3-27 1Z" fill="${platform.color}" stroke="#fff" stroke-width="2.5"/><path d="M102 42q12-7 34-2" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/><path d="M118 50h5" stroke="#2e3836" stroke-width="2" stroke-linecap="round"/><path d="M116 60q5 4 9 0" stroke="#a76d59" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M105 75 122 85l-11 9-13-15" fill="#fff" opacity=".75"/>
   </g><g class="rider-motion" stroke="${platform.color}" stroke-width="3" opacity=".4" stroke-linecap="round"><path d="M9 90h31"/><path d="M19 100h20"/><path d="M14 110h18"/></g></svg>`;
 }
 function newOrder(){
  if(!unlocked()){notify('Mod rider dibuka pada Hari 3 dalam Kerjaya.',true);return null}
  const p=getProgress(),d=ensure();if(pending(d).length>=capacity(d)){notify('Rak rider sudah penuh. Selesaikan pesanan dahulu.',true);return null}
  // Reserve stock logically across pending orders without reducing inventory.
  const reserved={};pending(d).forEach(o=>o.items.forEach(x=>reserved[x.id]=(reserved[x.id]||0)+1));
  const pool=products.filter(x=>p.unlocked.includes(x.category)&&!x.weighted&&(p.inventory?.[x.id]||0)-(reserved[x.id]||0)>0);
  if(!pool.length){notify('Stok di rak tidak mencukupi. Tambah stok melalui Inventori.',true);return null}
  const chosen=[],wanted=Math.min(5,2+Math.floor(p.day/5),pool.length);
  while(chosen.length<wanted){const available=pool.filter(x=>!chosen.some(a=>a.id===x.id));if(!available.length)break;const x=available[Math.floor(Math.random()*available.length)];chosen.push({id:x.id,name:x.name,price:x.price,packed:false})}
  const n=d.nextId++,platform=platforms[(n-1)%platforms.length];
  const o={id:`${platform.short}-${String(n).padStart(4,'0')}`,platform:platform.name,color:platform.color,rider:riders[n%riders.length],code:String(1000+Math.floor(Math.random()*9000)),items:chosen,status:'new',day:p.day,deadline:time()+Math.max(12,23-p.day)};
  d.orders.push(o);activeId=o.id;search='';filter='all';save();updateIndicator(d);notify(`Pesanan ${o.id} diterima. Cari barang di rak kedai.`);return o;
 }
 function pick(o,id){
  const p=getProgress();if(!pending(ensure()).includes(o))return;
  const x=o.items.find(i=>i.id===id&&!i.packed);
  const product=pmap.get(id);
  if(!x){notify(product?`${product.name} tidak diperlukan atau sudah diimbas.`:'Produk tidak dijumpai.',true);return}
  const available=p.inventory?.[id]||0;
  if(available<1){notify(`Stok ${x.name} habis. Tambah stok di Inventori dahulu.`,true);return}
  o.items.find(i=>i.id===id&&!i.packed).packed=true;
  o.status=ready(o)?'ready':'packing';lastPicked=id;save();render(o.id,{preserve:true});
  if(ready(o))notify('Semua barang sudah diimbas. Sahkan kod untuk serah kepada rider.');
 }
 function removePick(o,id){const x=o.items.find(i=>i.id===id&&i.packed);if(!x)return;x.packed=false;o.status=picked(o)?'packing':'new';lastPicked=null;save();render(o.id,{preserve:true})}
 function shelfHTML(o){
  const p=getProgress(),term=search.toLocaleLowerCase('ms');const list=products.filter(x=>p.unlocked.includes(x.category)&&!x.weighted&&(filter==='all'||x.category===filter)&&(!term||x.name.toLocaleLowerCase('ms').includes(term)||x.id.includes(term)));
  if(!list.length)return '<div class="delivery-shelf-empty">Tiada barang sepadan. Cuba kategori atau carian lain.</div>';
  return list.map(x=>{const exists=o.items.some(i=>i.id===x.id),wasPacked=o.items.some(i=>i.id===x.id&&i.packed),stock=p.inventory?.[x.id]||0;
   // No "pick" buttons on the order list. Only tapping a product on the physical shelf can pack it.
   return `<button class="delivery-shelf-product ${wasPacked?'is-packed':''} ${stock===0?'out-of-stock':''}" data-delivery-product="${safe(x.id)}" aria-label="Ambil dan imbas ${safe(x.name)}" ${stock===0?'disabled':''}><span class="delivery-shelf-art">${productArt(x.id)}</span><strong>${safe(x.name)}</strong><small>${money(x.price)}</small><span class="delivery-shelf-stock">${stock===0?'HABIS':'Stok '+stock}</span>${wasPacked?`<span class="delivery-picked-mark">${glyph('check')}</span>`:''}</button>`;
  }).join('');
 }
 function render(id=activeId,{preserve=false}={}){
  const d=ensure(),p=getProgress(),orders=pending(d);const o=orders.find(x=>x.id===id)||orders[0]||null;
  activeId=o?.id||null;
  const dialog=document.getElementById('modal'), oldDialog=preserve?dialog.scrollTop:0,oldShelf=preserve?document.getElementById('deliveryShelf')?.scrollTop||0:0;
  const s=d.stats,canAccept=unlocked()&&orders.length<capacity(d);
  openModal('delivery',`<div class="modal-pad delivery-ui"><header class="delivery-head"><div class="delivery-brand"><span class="delivery-mark">${glyph('delivery')}</span><span><small>URUSAN KEDAI · PESANAN DALAM TALIAN</small><h2>Delivery Rider <em>Studio</em></h2><span class="delivery-subtitle">Urus pesanan, cari barang di rak dan serah kepada rider.</span></span></div><button id="deliveryClose" class="icon-btn" title="Tutup delivery" aria-label="Tutup delivery">${glyph('close')}</button></header>
   <div class="delivery-metrics"><div><small>SELESAI DIHANTAR</small><strong>${s.completed||0}</strong><span>pesanan</span></div><div><small>JUMLAH JUALAN</small><strong>${money(s.revenue||0)}</strong><span>melalui aplikasi</span></div><div><small>RUANG RAK</small><strong>${orders.length}<i> / ${capacity(d)}</i></strong><span>pesanan aktif</span></div></div>
   ${!unlocked()?`<div class="delivery-locked">${glyph('lock')} <span>Fungsi Delivery dibuka pada <b>Hari 3</b> dalam Mod Kerjaya. Hari semasa: ${p.day}.</span></div>`:''}
   <div class="delivery-board"><aside class="delivery-sidebar"><div class="delivery-queue-title"><span>BARISAN PESANAN</span><b>${orders.length} aktif</b></div><div class="delivery-queue" id="deliveryQueue">${orders.map(x=>{const pl=platformOf(x);return `<button class="delivery-queue-card ${o?.id===x.id?'active':''}" data-delivery-id="${safe(x.id)}"><span class="delivery-platform-dot" style="background:${pl.color}"></span><span><b>${safe(x.id)}</b><small>${safe(x.platform)} · ${picked(x)}/${x.items.length} barang</small></span><span class="delivery-queue-status">${ready(x)?'Sedia':'Proses'}</span></button>`}).join('')||'<div class="delivery-queue-empty">Tiada pesanan aktif.<small>Terima pesanan baharu untuk mula mencari barang.</small></div>'}</div>
   <button class="delivery-create primary-btn" id="deliveryNew" ${canAccept?'':'disabled'}>${glyph('arrow')} Terima pesanan baharu</button><button class="delivery-upgrade-link" id="deliveryUpgrades">${glyph('shop')} Naik taraf rak pesanan <span>Tahap ${d.upgrades.rack}/2</span></button><div class="delivery-sidebar-caption">Setiap pesanan disimpan bersama kemajuan akaun anda.</div></aside>
   <div class="delivery-main">${o?orderHTML(o):emptyHTML()}</div></div>
   <footer class="delivery-footer"><span class="delivery-footer-dot"></span> Jualan & stok direkod sekali selepas kod rider disahkan. <span>DELIVERY SYSTEM V29</span></footer></div>`);
  document.getElementById('deliveryClose').onclick=closeModal;
  document.getElementById('deliveryNew').onclick=()=>{const n=newOrder();if(n)render(n.id)};
  document.getElementById('deliveryUpgrades').onclick=showUpgrade;
  document.querySelectorAll('[data-delivery-id]').forEach(b=>b.onclick=()=>{search='';filter='all';lastPicked=null;render(b.dataset.deliveryId)});
  if(!o)return;
  const searchInput=document.getElementById('deliverySearch');const filterSelect=document.getElementById('deliveryCategory');
  searchInput.value=search;filterSelect.value=filter;
  searchInput.addEventListener('input',()=>{search=searchInput.value;refreshShelf(o)});
  filterSelect.addEventListener('change',()=>{filter=filterSelect.value;refreshShelf(o)});
  document.getElementById('deliveryShelf').addEventListener('click',e=>{const button=e.target.closest('[data-delivery-product]');if(button)pick(o,button.dataset.deliveryProduct)});
  document.querySelectorAll('[data-delivery-remove]').forEach(b=>b.onclick=()=>removePick(o,b.dataset.deliveryRemove));
  const handoff=document.getElementById('deliveryHandoff');
  handoff.onclick=()=>handoffOrder(o);
  document.getElementById('deliveryCode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(!handoff.disabled)handoffOrder(o)}});
  document.getElementById('deliveryCancel').onclick=()=>{document.getElementById('deliveryCancelConfirm').hidden=false;document.getElementById('deliveryCancel').hidden=true};
  document.getElementById('deliveryCancelBack').onclick=()=>{document.getElementById('deliveryCancelConfirm').hidden=true;document.getElementById('deliveryCancel').hidden=false};
  document.getElementById('deliveryCancelFinal').onclick=()=>{if(!pending(d).includes(o))return;
   o.status='cancelled';d.stats.cancelled=(d.stats.cancelled||0)+1;save();updateIndicator(d);notify('Pesanan '+o.id+' dibatalkan.');render()};
  if(preserve){dialog.scrollTop=oldDialog;document.getElementById('deliveryShelf').scrollTop=oldShelf}
 }
 function refreshShelf(o){const shelf=document.getElementById('deliveryShelf');if(shelf)shelf.innerHTML=shelfHTML(o)}
 function emptyHTML(){return `<div class="delivery-empty"><div class="delivery-empty-art"><span class="delivery-empty-box"></span><span class="delivery-empty-label">KITA / DELIVERY</span></div><h3>Kaunter penghantaran sedia.</h3><p>Terima pesanan, semak senarai pembelian dan cari barangan sendiri pada rak digital. Barang hanya dikira apabila dihantar.</p><div class="delivery-empty-steps"><span>01 · Terima</span><span>02 · Cari & imbas</span><span>03 · Serah</span></div></div>`}
 function orderHTML(o){
  const pl=platformOf(o),done=picked(o),complete=ready(o),remain=remaining(o),totalAmount=total(o),canHandoff=complete;
  const opts=[`<option value="all">Semua rak</option>`,...categories.filter(c=>getProgress().unlocked.includes(c.id)&&products.some(x=>!x.weighted&&x.category===c.id)).map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`)];
  return `<section class="delivery-rider-hero" style="--delivery-accent:${pl.color};--delivery-soft:${pl.light}"><div class="delivery-rider-intro"><span class="delivery-platform-name"><i></i>${safe(o.platform)}</span><h3>Rider ${safe(o.rider)}</h3><div class="delivery-order-ref">PESANAN <b>${safe(o.id)}</b></div><span class="delivery-paid-chip">${glyph('check')} Dibayar melalui aplikasi</span></div><div class="delivery-character-wrap">${riderArt(o)}</div><div class="delivery-timer ${remain<=5?'urgent':''}"><small>MASA BAKI</small><strong>${remain}<span> min</span></strong><small>${remain?'Sebelum lewat':'Masa tamat'}</small></div></section>
  <div class="delivery-workflow"><span class="done">01 <b>Terima order</b></span><span class="${done?'done':''}">02 <b>Cari & imbas</b></span><span class="${complete?'done':''}">03 <b>Serah kepada rider</b></span></div>
  <div class="delivery-pick-layout"><section class="delivery-ticket"><div class="delivery-section-title"><div><small>ORDER ${safe(o.id)}</small><h3>Senarai pembelian</h3></div><span>${done}/${o.items.length}</span></div><p class="delivery-ticket-hint">Rujuk senarai ini. Untuk ambil barang, cari pada rak di sebelah / bawah.</p><div class="delivery-request-items">${o.items.map((x,i)=>`<div class="delivery-request-item ${x.packed?'done':''}"><span class="delivery-request-num">${x.packed?glyph('check'):String(i+1).padStart(2,'0')}</span><span><b>${safe(x.name)}</b><small>1 unit · ${money(x.price)}</small></span><span class="delivery-request-state">${x.packed?'Dalam beg':'Belum ambil'}</span></div>`).join('')}</div><div class="delivery-ticket-total"><span>JUMLAH (PRABAYAR)</span><b>${money(totalAmount)}</b></div></section>
  <section class="delivery-shopping"><div class="delivery-section-title"><div><small>RAK KEDAI KITA</small><h3>Cari & imbas barang</h3></div><span class="delivery-scan-pill">${glyph('scan')} SCAN</span></div><p class="delivery-ticket-hint">Cari produk sebenar dalam rak dan sentuh produknya untuk mengimbas. Pilih barang yang tepat sahaja.</p><div class="delivery-search-tools"><label class="delivery-search-wrap">${glyph('scan')}<input id="deliverySearch" type="search" placeholder="Cari nama barang dalam rak..." aria-label="Cari barang pada rak" autocomplete="off"></label><select id="deliveryCategory" aria-label="Pilih kategori rak">${opts.join('')}</select></div><div class="delivery-shelf-grid" id="deliveryShelf">${shelfHTML(o)}</div></section></div>
  <section class="delivery-bag-panel"><div class="delivery-bag-head"><span class="delivery-bag-icon">${glyph('basket')}</span><div><small>BEG PESANAN ${safe(o.id)}</small><h3>${complete?'Pesanan lengkap':'Barangan telah diimbas'}</h3></div><strong>${done}/${o.items.length}</strong></div><div class="delivery-progress-track"><i style="width:${Math.round(100*done/o.items.length)}%"></i></div><div class="delivery-packed-items">${done?o.items.filter(x=>x.packed).map(x=>`<div class="delivery-packed-item ${lastPicked===x.id?'just-picked':''}">${productArt(x.id)}<span>${safe(x.name)}<small>Telah diimbas ke dalam beg</small></span><button data-delivery-remove="${safe(x.id)}" title="Keluarkan ${safe(x.name)} daripada beg">Keluarkan</button></div>`).join(''):'<span class="delivery-bag-empty">Belum ada barang. Sentuh produk pada rak untuk mula mengisi beg.</span>'}</div></section>
  <section class="delivery-handoff"><div class="delivery-handoff-title"><div><small>LANGKAH AKHIR</small><h3>Pengesahan pengambilan</h3><p>${complete?'Rider sudah bersedia. Masukkan kod daripada skrin telefon rider.':'Cari dan imbas semua barang sebelum serahan boleh dilakukan.'}</p></div><div class="delivery-rider-phone"><span>KOD PENGAMBILAN</span><strong>${safe(o.code)}</strong><small>${safe(o.platform)}</small></div></div><label for="deliveryCode">Masukkan kod 4 digit rider</label><div class="delivery-verify"><input id="deliveryCode" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="0000" ${complete?'':'disabled'} aria-label="Kod pengambilan rider"><button id="deliveryHandoff" class="primary-btn" ${canHandoff?'':'disabled'}>${glyph('check')} Sahkan & serah pesanan</button></div><button id="deliveryCancel" class="delivery-cancel">Batalkan pesanan</button><div id="deliveryCancelConfirm" class="delivery-cancel-confirm" hidden><b>Batalkan ${safe(o.id)}?</b><p>Barang yang diimbas akan dikeluarkan daripada beg. Stok dan bayaran tidak berubah.</p><div><button id="deliveryCancelBack" type="button">Kembali</button><button id="deliveryCancelFinal" type="button">Ya, batalkan</button></div></div></section>`;
 }
 function handoffOrder(o){
  const p=getProgress(),d=ensure();if(!pending(d).includes(o)||!ready(o)){notify('Imbas semua barang dahulu sebelum serahan.',true);return}
  const code=document.getElementById('deliveryCode')?.value.trim();if(code!==String(o.code)){notify('Kod tidak sepadan dengan telefon rider.',true);document.getElementById('deliveryCode')?.focus();return}
  const counts={};for(const x of o.items)counts[x.id]=(counts[x.id]||0)+1;
  if(Object.entries(counts).some(([id,n])=>(p.inventory?.[id]||0)<n)){notify('Stok tidak mencukupi. Tambah bekalan di Inventori.',true);return}
  Object.entries(counts).forEach(([id,n])=>{p.inventory[id]-=n});
  const amount=total(o),late=remaining(o)<=0,bonus=late?0:Math.round(amount*.1);
  receiveCash(p,Math.round(amount*.25)+bonus);p.lifetime=(p.lifetime||0)+amount;
  o.status='completed';o.completedMinute=time();o.completedDay=p.day;
  d.stats.completed++;d.stats.revenue+=amount;d.stats.bonus+=bonus;if(late)d.stats.late++;
  const session=getSession();if(session){session.deliveryCompleted=(session.deliveryCompleted||0)+1;session.deliveryRevenue=(session.deliveryRevenue||0)+amount;session.deliveryBonus=(session.deliveryBonus||0)+bonus}
  // Retain older orders for account progress, but bound archive growth.
  const archive=d.orders.filter(x=>['completed','cancelled'].includes(x.status));if(archive.length>50){const remove=new Set(archive.slice(0,archive.length-50));d.orders=d.orders.filter(x=>!remove.has(x))}
  activeId=null;lastPicked=null;search='';filter='all';save();updateIndicator(d);
  notify('Pesanan '+o.id+' berjaya diserahkan! Bonus '+money(bonus));render();
 }
 function showUpgrade(){const p=getProgress(),d=ensure(),lv=d.upgrades.rack||0,cost=(lv+1)*15000;
  openModal('delivery-upgrade',`<div class="modal-pad delivery-upgrade-ui"><div class="modal-heading"><div><div class="modal-kicker">KEDAI KITA · PENAMBAHBAIKAN</div><h2>Rak pesanan rider</h2><p>Naik taraf untuk menyiapkan lebih banyak pesanan secara serentak.</p></div><button id="deliveryBack" class="icon-btn" aria-label="Kembali">${glyph('close')}</button></div><div class="delivery-upgrade-preview"><span>${glyph('shop')}</span><div><small>KAPASITI SEMASA</small><strong>${capacity(d)} <span>/ 3 pesanan</span></strong><p>Tahap ${lv} daripada 2 · setiap naik taraf menambah satu ruang.</p></div></div><div class="delivery-upgrade-buy"><span>Baki kedai <b>${money(p.wallet)}</b></span><button id="deliveryBuy" class="primary-btn" ${lv>=2||p.wallet<cost||getMode()!=='career'?'disabled':''}>${lv>=2?'Tahap maksimum':'Naik taraf · '+money(cost)}</button></div></div>`);
  document.getElementById('deliveryBack').onclick=()=>render(activeId);
  document.getElementById('deliveryBuy').onclick=()=>{if(lv>=2||getMode()!=='career'||p.wallet<cost)return;p.wallet-=cost;d.upgrades.rack=lv+1;save();notify('Kapasiti rak rider bertambah kepada '+capacity(d)+' pesanan.');showUpgrade()};
 }
 return {open:()=>render(),ensure};
}
