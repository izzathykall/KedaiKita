/* KedaiKita Professional Delivery Rider Event — stored in progress.delivery */
export function createDelivery({getProgress,getSession,getMode,save,notify,money,products,icon,openModal,closeModal,receiveCash}){
 const platforms=[['foodpanda','#ed4b93','FP'],['GrabFood','#208b61','GF'],['Kita Delivery','#c99453','KD']];
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ensure=()=>{const p=getProgress();if(!p.delivery)p.delivery={orders:[],nextId:1,stats:{completed:0,cancelled:0,revenue:0,bonus:0,late:0},upgrades:{rack:0}};const d=p.delivery;d.orders??=[];d.stats??={completed:0,cancelled:0,revenue:0,bonus:0,late:0};d.upgrades??={rack:0};return d};
 const pending=d=>d.orders.filter(o=>o.status==='new'||o.status==='packing');
 const capacity=d=>1+Math.min(2,d.upgrades.rack||0);
 const time=()=>getSession()?.clockMinutes||480;
 const unlocked=()=>getMode()==='career'&&getProgress().day>=3;
 function newOrder(){
  if(!unlocked()){notify('Delivery dibuka pada Hari 3.',true);return null}
  const p=getProgress(),d=ensure();if(pending(d).length>=capacity(d)){notify('Rak pesanan penuh.',true);return null}
  const pool=products.filter(x=>p.unlocked.includes(x.category)&&!x.weighted&&(p.inventory?.[x.id]||0)>=1);
  if(!pool.length){notify('Stok tidak mencukupi untuk pesanan delivery.',true);return null}
  const count=Math.min(pool.length,2+Math.floor(p.day/5),5),items=[];
  for(let i=0;i<count;i++){const available=pool.filter(x=>!items.some(y=>y.id===x.id));if(!available.length)break;const x=available[Math.floor(Math.random()*available.length)];items.push({id:x.id,name:x.name,price:x.price,packed:false})}
  const n=d.nextId++,platform=platforms[(n-1)%3];const o={id:`${platform[2]}-${String(n).padStart(4,'0')}`,platform:platform[0],color:platform[1],rider:['Amir','Hafiz','Sofia','Nadia','Faris'][n%5],code:String(1000+Math.floor(Math.random()*9000)),items,status:'new',day:p.day,deadline:time()+Math.max(12,23-p.day)};
  d.orders.push(o);save();notify('Pesanan '+o.id+' diterima!');return o;
 }
 function open(id){const p=getProgress(),d=ensure(),orders=pending(d),o=orders.find(x=>x.id===id)||orders[0],s=d.stats;
  openModal('delivery',`<div class="modal-pad delivery-ui"><div class="modal-heading"><div><div class="modal-kicker">KEDAIKITA · DELIVERY RIDER</div><h2>Delivery Control Center 🛵</h2><p class="muted">Siapkan pesanan, sahkan rider dan serahkan barang.</p></div><button id="deliveryClose" class="icon-btn">${icon('close')}</button></div>
  <div class="delivery-metrics"><div><small>PESANAN SELESAI</small><b>${s.completed||0}</b></div><div><small>JUALAN DELIVERY</small><b>${money(s.revenue||0)}</b></div><div><small>RAK PESANAN</small><b>${orders.length}/${capacity(d)}</b></div></div>
  ${!unlocked()?`<div class="delivery-notice">🔒 Sistem rider dibuka bermula Hari 3. Sekarang Hari ${p.day}.</div>`:''}
  <div class="delivery-actions"><button id="deliveryNew" class="primary-btn" ${!unlocked()||orders.length>=capacity(d)?'disabled':''}>+ Terima pesanan</button><button id="deliveryUpgrades" class="secondary-btn">Naik taraf rak</button></div>
  <div class="delivery-tabs">${orders.map(x=>`<button class="secondary-btn ${o?.id===x.id?'selected':''}" data-delivery-id="${safe(x.id)}">${safe(x.id)} · ${x.items.filter(i=>i.packed).length}/${x.items.length}</button>`).join('')||'<p class="muted">Tiada pesanan aktif.</p>'}</div>
  ${o?`<section class="delivery-order"><div class="delivery-rider" style="--rider-color:${o.color}"><div class="delivery-avatar"><div class="delivery-helmet">⛑</div><div class="delivery-face">☺</div><div class="delivery-shirt">🛵</div></div><div class="delivery-rider-info"><b>${safe(o.platform)}</b><small>Rider ${safe(o.rider)} · ${safe(o.id)}</small><small>Telah dibayar melalui aplikasi</small></div><strong class="delivery-time">${Math.max(0,Math.ceil(o.deadline-time()))} min</strong></div><h3>Senarai barang (${o.items.filter(i=>i.packed).length}/${o.items.length})</h3><div class="delivery-items">${o.items.map((x,i)=>`<button data-delivery-pack="${i}" ${x.packed?'disabled':''} class="delivery-item ${x.packed?'packed':''}"><span>${x.packed?'✓':'○'}</span><span>${safe(x.name)}</span><b>${money(x.price)}</b></button>`).join('')}</div><div class="delivery-total"><span>Jumlah pesanan</span><b>${money(o.items.reduce((n,x)=>n+x.price,0))}</b></div><label for="deliveryCode">Kod pengambilan rider</label><div class="delivery-verify"><input id="deliveryCode" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="4 digit"><button class="primary-btn" id="deliveryHandoff" ${o.items.every(x=>x.packed)?'':'disabled'}>Sahkan & serah</button></div><small class="muted">Kod rider untuk simulasi: <b>${safe(o.code)}</b></small><button id="deliveryCancel" class="delivery-cancel">Batalkan pesanan</button></section>`:''}<p class="delivery-note">Stok dan jualan dikira sekali sahaja selepas penyerahan. Progres delivery disimpan bersama akaun.</p></div>`);
  document.getElementById('deliveryClose').onclick=closeModal;
  document.getElementById('deliveryNew').onclick=()=>{const n=newOrder();open(n?.id)};
  document.getElementById('deliveryUpgrades').onclick=showUpgrade;
  document.querySelectorAll('[data-delivery-id]').forEach(b=>b.onclick=()=>open(b.dataset.deliveryId));
  if(!o)return;
  document.querySelectorAll('[data-delivery-pack]').forEach(b=>b.onclick=()=>{const x=o.items[+b.dataset.deliveryPack];if(!x||x.packed)return;if((p.inventory?.[x.id]||0)<1){notify('Stok '+x.name+' tidak cukup.',true);return}x.packed=true;o.status='packing';save();open(o.id)});
  document.getElementById('deliveryHandoff').onclick=()=>{
   if(document.getElementById('deliveryCode').value.trim()!==o.code){notify('Kod rider salah. Semak semula.',true);return}
   if(!o.items.every(x=>x.packed)){notify('Barang belum lengkap.',true);return}
   const counts={};o.items.forEach(x=>counts[x.id]=(counts[x.id]||0)+1);
   if(Object.entries(counts).some(([id,n])=>(p.inventory?.[id]||0)<n)){notify('Stok tidak mencukupi. Semak inventori.',true);return}
   for(const [id,n] of Object.entries(counts))p.inventory[id]-=n;
   const total=o.items.reduce((n,x)=>n+x.price,0),late=time()>o.deadline,bonus=late?0:Math.round(total*.1);
   receiveCash(p,Math.round(total*.25)+bonus);p.lifetime=(p.lifetime||0)+total;
   o.status='completed';o.completedMinute=time();s.completed=(s.completed||0)+1;s.revenue=(s.revenue||0)+total;s.bonus=(s.bonus||0)+bonus;if(late)s.late=(s.late||0)+1;
   const session=getSession();if(session){session.deliveryCompleted=(session.deliveryCompleted||0)+1;session.deliveryRevenue=(session.deliveryRevenue||0)+total;session.deliveryBonus=(session.deliveryBonus||0)+bonus}
   save();notify('Pesanan diserahkan! Bonus '+money(bonus));open();
  };
  document.getElementById('deliveryCancel').onclick=()=>{if(!confirm('Batalkan pesanan '+o.id+'?'))return;o.status='cancelled';s.cancelled=(s.cancelled||0)+1;save();open()};
 }
 function showUpgrade(){const p=getProgress(),d=ensure(),lv=d.upgrades.rack||0,cost=(lv+1)*15000;
  openModal('delivery-upgrade',`<div class="modal-pad delivery-ui"><div class="modal-heading"><div><div class="modal-kicker">DELIVERY UPGRADE</div><h2>Rak pesanan</h2></div><button id="deliveryBack" class="icon-btn">${icon('close')}</button></div><p>Kapasiti: ${capacity(d)} pesanan serentak. Maksimum 3.</p><div class="upgrade-row"><div class="upgrade-info"><b>Tahap ${lv}/2</b><small>Tambah satu ruang pesanan.</small></div><button class="primary-btn" id="deliveryBuy" ${lv>=2||p.wallet<cost?'disabled':''}>${lv>=2?'Maksimum':money(cost)}</button></div></div>`);
  document.getElementById('deliveryBack').onclick=()=>open();document.getElementById('deliveryBuy').onclick=()=>{if(lv>=2||p.wallet<cost)return;p.wallet-=cost;d.upgrades.rack=lv+1;save();notify('Rak delivery dinaik taraf!');showUpgrade()};
 }
 return {open:()=>open(),ensure};
}
