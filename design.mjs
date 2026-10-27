// Presentation only: moving existing controls preserves their IDs and event bindings.
const selectedTabs=new Map();
function tabbed(root, groups, after, initial=0){
 const key=root.closest('dialog')?.dataset.kind||'menu';initial=['settings','developer'].includes(key)?0:Math.min(selectedTabs.get(key)||initial,groups.length-1);
 const nav=document.createElement('div');nav.className='studio-tabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Bahagian menu');
 after.after(nav);
 const panels=groups.map(([name,nodes],i)=>{
  const panel=document.createElement('section');panel.className='studio-tab-panel';panel.id='studio-panel-'+i;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','studio-tab-'+i);panel.tabIndex=0;
  nodes.forEach(n=>panel.append(n));nav.after(panel);
  const button=document.createElement('button');button.type='button';button.id='studio-tab-'+i;button.textContent=name;button.setAttribute('role','tab');button.setAttribute('aria-controls',panel.id);nav.append(button);
  button.onclick=()=>activate(i);button.onkeydown=e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%groups.length;else if(e.key==='ArrowLeft')next=(i+groups.length-1)%groups.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=groups.length-1;else return;e.preventDefault();activate(next);nav.children[next].focus()};
  return panel;
 });
 function activate(index){selectedTabs.set(key,index);panels.forEach((panel,i)=>{panel.hidden=i!==index;nav.children[i].setAttribute('aria-selected',String(i===index));nav.children[i].tabIndex=i===index?0:-1})}
 activate(initial);
}
export function enhanceManagement(kind,root,icon){
 const supported=['missions','inventory','catalogue','delivery','shop','settings','developer'].includes(kind);
 fitCategorySelects(root);
 root.classList.toggle('studio-management',supported);if(!supported)return;
 const pad=root.querySelector('.modal-pad');if(!pad)return;
 if(kind==='developer'){
  const head=pad.querySelector('.modal-heading'),footer=pad.querySelector('.dev-panel-footer');
  const buckets=[[],[],[],[],[]];let section=1;
  [...pad.children].forEach(el=>{
   if(el===head||el===footer)return;
   if(el.tagName==='H3')section=el.textContent.includes('segera')?0:el.textContent.includes('inventori')?2:el.textContent.includes('Audit')?3:4;
   buckets[section].push(el);
  });
  tabbed(pad,[['Senario ujian',buckets[0]],['Kewangan',buckets[1]],['Stok & peralatan',buckets[2]],['Penyegerakan',buckets[3]],['Hari & data',buckets[4]]],head);
  const h=pad.querySelector('.dev-scenario-grid');if(h){const hint=document.createElement('p');hint.className='studio-description';hint.textContent='Pilih senario untuk menguji satu aliran permainan. Progres ujian disimpan berasingan.';h.before(hint)}
 }
 if(kind==='shop'){
  const head=pad.querySelector('.shop-wallet'),parts=[[],[]];let section=0;
  let started=false;[...pad.children].forEach(el=>{if(el===head){started=true;return}if(!started)return;if(el.matches('.payment-upgrade-section')||el.textContent.includes('Peralatan kedai & bonus')||el.matches('.payment-upgrades'))section=1;if(el.matches('h3')&&!el.textContent.includes('Buka kelas'))section=1;parts[section].push(el)});
  tabbed(pad,[['Kategori produk',parts[0]],['Peralatan & pembayaran',parts[1]]],head);
 }
 if(kind==='settings'){
  const head=pad.querySelector('.modal-heading'),back=pad.querySelector('#backSettings'),parts=[[],[],[]];let section=0;
  [...pad.children].forEach(el=>{if(el===head||el===back)return;if(el.matches('.setting-row')&&el.textContent.includes('Animasi'))section=1;if(el.matches('.game-reset-compact'))section=2;parts[section].push(el)});
  tabbed(pad,[['Audio',parts[0]],['Paparan',parts[1]],['Progres',parts[2]]],head);
 }
 // Consistent compact section identifiers without changing gameplay controls.
 const heading=pad.querySelector('.modal-heading,.kf-head');if(heading){const badge=document.createElement('span');badge.className='studio-heading-icon';badge.innerHTML=icon(({missions:'flag',inventory:'basket',catalogue:'book',shop:'shop',settings:'settings',developer:'settings'})[kind]||'delivery');if(kind!=='delivery')heading.prepend(badge)}
}
// Keep complete conveyor names on two lines, shrinking the font when necessary.
const productArea=document.getElementById('products');
if(productArea){
 let frame=0;const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 const fit=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
  productArea.querySelectorAll('.product-name').forEach(el=>{
   el.style.removeProperty('font-size');const style=getComputedStyle(el),available=Math.max(16,el.clientWidth-4);let size=parseFloat(style.fontSize);
   function lines(){ctx.font=`${style.fontWeight} ${size}px ${style.fontFamily}`;let count=1,line='';for(const word of el.textContent.trim().split(/\s+/)){if(ctx.measureText(word).width>available)return 3;const next=line?line+' '+word:word;if(ctx.measureText(next).width>available){count++;line=word}else line=next}return count}
   while(size>5&&lines()>2)size-=.25;el.style.setProperty('font-size',size+'px','important');
  });
 })};new ResizeObserver(fit).observe(productArea);new MutationObserver(fit).observe(productArea,{childList:true,subtree:true});
}

// Fit the selected label after layout and on every category/viewport change.
let categoryObserver;
function fitCategorySelects(root){
 categoryObserver?.disconnect();
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 const fit=select=>{
  if(!select.clientWidth||!ctx)return;
  const cs=getComputedStyle(select),label=select.selectedOptions[0]?.textContent||'';
  const available=select.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-26;
  let size=16;ctx.font=`${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  const width=ctx.measureText(label).width;
  size=Math.min(size,Math.max(7,Math.floor(size*available/Math.max(1,width)*10)/10));
  select.style.setProperty('font-size',size+'px','important');
 };
 categoryObserver=new ResizeObserver(entries=>entries.forEach(({target})=>fit(target)));
 root.querySelectorAll('select').forEach(select=>{categoryObserver.observe(select);select.addEventListener('change',()=>fit(select));requestAnimationFrame(()=>fit(select))});
}
