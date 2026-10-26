// Fictional in-game aid. All amounts are integer sen; no real identity data.
export const KASIH_PRODUCTS = new Set(['milk','bread','eggs','rice','noodles','cookies','soap','coffee','water','curry','detergent','oil','sugar','flour','soy','sardine','tea','malt','salt','condensed','tissue','toothpaste','shampoo','dishsoap']);
export const kasihEligible = item => KASIH_PRODUCTS.has(item.id);
export function kasihAccount(store,person,rng=Math.random){
 store.kitaKasih??={accounts:{},receipts:[]};
 store.kitaKasih.accounts??={};store.kitaKasih.receipts??=[];
 const key=person.id;
 const account=store.kitaKasih.accounts[key]??={balance:1000+Math.min(18,Math.max(0,Math.floor(rng()*19)))*500};
 // Random game ID is assigned once; keep balances and historical receipts intact.
 if(!/^KK-\d{6}$/.test(account.card||'')){
  const used=new Set(Object.values(store.kitaKasih.accounts).map(a=>a.card));
  let n=100000+Math.min(899999,Math.max(0,Math.floor(rng()*900000)));
  while(used.has('KK-'+n))n=n===999999?100000:n+1;
  account.card='KK-'+n;
 }
 return account;
}
export function kasihQuote(customer){
 const price=i=>i.weighted?Math.round(i.price*i.grams/1000):i.price;
 const gross=customer.items.reduce((s,i)=>s+price(i),0);
 const total=Math.max(0,gross-(customer.discount||0));
 const eligibleGross=customer.items.filter(kasihEligible).reduce((s,i)=>s+price(i),0);
 const eligible=gross?Math.floor(total*eligibleGross/gross):0;
 const balance=Math.max(0,Math.floor(customer.kasih?.balanceBefore||0));
 const aid=Math.min(balance,eligible);
 return {total,eligible,ineligible:total-eligible,aid,remaining:total-aid,balanceAfter:balance-aid};
}
export function kasihContribution(c){return c?.kasih?.reserved?kasihQuote(c).aid:0}
export function commitKasih(store,c){
 if(!c.kasih)return true;
 const k=c.kasih;if(k.committed)return false;
 const account=kasihAccount(store,c.person),q=kasihQuote(c);
 if(!k.verified||!k.reserved||account.balance!==k.balanceBefore)return false;
 account.balance=q.balanceAfter;k.committed=true;k.balanceAfter=q.balanceAfter;k.aid=q.aid;
 store.kitaKasih.receipts.unshift({id:k.id,name:c.person.name,card:account.card,aid:q.aid,balance:q.balanceAfter,total:q.total,extra:q.remaining,method:c.method,day:store.day});
 store.kitaKasih.receipts=store.kitaKasih.receipts.slice(0,20);
 return true;
}
