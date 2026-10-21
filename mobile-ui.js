/* KedaiKita V58 · Compact mobile management, original controls preserved. */
(()=>{
 const bar=document.getElementById('storeMenu');
 const toggle=document.getElementById('storeMenuToggle');
 const label=document.getElementById('storeMenuText');
 if(!bar||!toggle)return;
 const mobile=window.matchMedia('(max-width:760px)');
 const setOpen=open=>{
  const show=!!open&&mobile.matches;
  bar.classList.toggle('mobile-menu-collapsed',!show);
  bar.classList.toggle('mobile-menu-expanded',show);
  toggle.setAttribute('aria-expanded',String(show));
  label.textContent=show?'Tutup':'Lagi';
 };
 setOpen(false);
 toggle.addEventListener('click',()=>setOpen(!bar.classList.contains('mobile-menu-expanded')));
 bar.addEventListener('click',event=>{
  if(event.target.closest('button')&&!event.target.closest('#storeMenuToggle')&&mobile.matches)setOpen(false);
 });
 document.addEventListener('pointerdown',event=>{
  if(!bar.contains(event.target)&&bar.classList.contains('mobile-menu-expanded'))setOpen(false);
 },{passive:true});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&bar.classList.contains('mobile-menu-expanded')){setOpen(false);toggle.focus()}});
 mobile.addEventListener?.('change',()=>setOpen(false));
})();
