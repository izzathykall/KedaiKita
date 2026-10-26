// Deterministic per customer and situation: re-renders never shuffle requests.
const lines={
 welcome:['Hai, boleh tolong kira barang saya?','Saya singgah beli barang keperluan.','Ini barang saya ya. Terima kasih.','Boleh bantu saya di kaunter?','Saya dah pilih barang. Boleh kira sekarang?','Hai! Saya nak bayar barang ini.'],
 cash:['Saya bayar tunai ya.','Ini duit saya. Tolong semak bakinya ya.','Saya guna wang tunai untuk belian ini.','Boleh terima tunai? Saya dah sediakan duit.'],
 card:['Saya guna kad debit ya.','Kad saya dah sedia. Boleh teruskan bayaran.','Saya nak bayar dengan kad ini.','Tolong proses melalui kad debit saya.'],
 qr:['Saya dah buka kod QR pada telefon.','Boleh imbas QR pada skrin saya?','Saya bayar dengan e-wallet ya.','Telefon saya dah sedia untuk diimbas.'],
 coupon:['Saya ada kupon 10%. Tolong gunakan sebelum bayar ya.','Boleh tolak kupon 10% saya dahulu?','Jangan lupa kupon 10% saya ya.','Saya nak gunakan kupon 10% untuk belian ini.'],
 kasihCoupon:['Saya guna KitaKasih dan ada kupon 10%. Tolong guna kupon dahulu ya.','Boleh tolak kupon 10% dahulu, kemudian bayar dengan KitaKasih?','Saya nak guna KitaKasih. Jangan lupa kupon 10% saya juga ya.','Kupon 10% ini untuk belian saya. Selebihnya saya guna KitaKasih ya.'],
 kasih:['Saya nak bayar dengan KitaKasih. Ini kad saya.','Boleh semak baki KitaKasih saya dahulu?','Saya guna KitaKasih untuk barang yang layak ya.','Tolong gunakan KitaKasih. Baki belian saya bayar sendiri.'],
 kasihApplied:['Terima kasih guna kupon tadi. Sekarang saya bayar dengan KitaKasih.','Kupon dah ditolak ya? Boleh teruskan dengan kad KitaKasih saya.','Baik, selepas diskaun saya guna KitaKasih ya.'],
 couponApplied:['Terima kasih, kupon saya dah digunakan.','Diskaun dah masuk. Boleh teruskan bayaran ya.','Baik, jumlah selepas kupon itu betul.'],
 change:['Saya tunggu baki ya. Terima kasih.','Boleh semak baki sebelum serahkan?','Kira perlahan pun tak mengapa, asalkan tepat.','Terima kasih. Bakinya sekali ya.'],
 lost:['Saya perlu pergi dulu. Nanti saya datang semula.','Maaf, saya tak dapat tunggu lebih lama.','Saya ada urusan lain. Belian ini saya tangguhkan dulu.'],
 thanks:['Terima kasih! Ini sedikit tip untuk awak.','Layanan baik. Saya beri sedikit tip ya.','Ini tip untuk awak. Terima kasih bantu saya.'],
 thanksNoTip:['Terima kasih, jumpa lagi!','Dah selesai ya? Terima kasih.','Terima kasih kerana bantu uruskan belian saya.','Baik, saya bawa barang dulu. Jumpa lagi!','Semoga urusan kedai dipermudahkan. Terima kasih.']
};
function say(c,key){const pool=lines[key]||lines.welcome;let seed=Number(c.dialogueSeed)||0;for(const ch of key)seed=(seed*31+ch.charCodeAt(0))>>>0;return pool[seed%pool.length]}
export function customerSpeech(c,phase='scan',tip=0){
 if(!c)return '';
 if(c.kind==='kitafood')return `Hai, saya rider KitaFood. Saya ambil pesanan ${c.orderId} ya.`;
 if(c.kind==='return')return c.returnReason||'Saya bawa barang dan resit untuk semakan pemulangan.';
 if(phase==='success')return say(c,tip>0?'thanks':'thanksNoTip');
 if(phase==='lost')return say(c,'lost');
 if(phase==='change')return say(c,'change');
 if(c.hasCoupon&&!c.couponApplied)return say(c,c.kasih?'kasihCoupon':'coupon');
 if(c.kasih){
  if(c.method!=='kasih')return `Baki selepas KitaKasih saya bayar dengan ${{cash:'tunai',card:'kad debit',qr:'QR e-wallet'}[c.method]||'kaedah lain'} ya.`;
  return say(c,c.couponApplied?'kasihApplied':'kasih');
 }
 if(phase==='offer'||c.items?.every(i=>i.scanned))return say(c,c.method);
 if(c.couponApplied)return say(c,'couponApplied');
 return say(c,'welcome');
}
