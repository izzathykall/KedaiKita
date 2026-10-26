// Preserve saved stock, baskets and receipt references when replacing old products.
const ids={dogfood:'fishfood',treatsdog:'birdseed',petpad:'catbed',pettoy:'cattoy'};
const names={'Makanan anjing':'Makanan ikan','Snek anjing':'Biji makanan burung','Alas latihan haiwan':'Alas tidur kucing','Syampu haiwan':'Syampu kucing','Mainan haiwan':'Bola benang kucing'};
export function migrateProducts(value){
 if(!value||typeof value!=='object')return value;
 for(const key of Object.keys(value)){
  const item=value[key];
  if(ids[key]){const next=ids[key];if(value[next]===undefined)value[next]=item;delete value[key];}
  else if(typeof item==='string'){if((key==='id'||key==='productId')&&ids[item])value[key]=ids[item];else if(key==='name'&&names[item])value[key]=names[item];}
  if(item&&typeof item==='object')migrateProducts(item);
 }
 return value;
}
