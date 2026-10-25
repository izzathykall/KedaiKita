KedaiKita — Cashier Simulator
V62 | 26 Oktober 2026

PASANG
Ekstrak ZIP dan gantikan semua fail dalam folder laman sedia ada dengan kandungan
folder KedaiKita-main. index.html perlu kekal pada akar laman seperti sebelum ini.
Sertakan sync-policy.mjs, delivery-clock.mjs dan payment-state.mjs.
Jika muat naik fail satu demi satu, muat naik version.json paling akhir.
Buka pautan hosting/GitHub Pages dan muat semula sekali. Jangan reset progres atau
padam data pelayar untuk memasang kemas kini. Jangan buka terus melalui file://.

PENAMBAHBAIKAN V62
1. KitaFood
   - Timer tamat walaupun popup rider masih terbuka.
   - Serahan pada/selepas tamat masa ditolak tanpa mengubah stok atau duit.
   - Buka/tutup popup rider tidak menambah masa dan tidak menjeda timer.
   - Jeda permainan, menu utama, pengurusan lain, akaun dan aplikasi yang berada
     di latar belakang menjeda timer. Baki masa tepat disimpan untuk sambung semula.
   - Pesanan tamat masa dicatat sebagai dibatalkan/lewat; bonus tidak diberikan.
   - Penekanan berulang tidak menggandakan serahan atau tindakan pelanggan berikut.
   - Status popup dan timer lama dibersihkan apabila progres/akaun dimuatkan semula.

2. Bayaran digital
   - Jika stok/kertas resit tidak cukup ketika bayaran selesai diproses, terminal
     kembali sedia untuk dicuba semula selepas bekalan ditambah.
   - Mod santai yang dimuat semula semasa kad/QR sedang diproses tidak lagi
     tertinggal pada animasi memproses. Cuba pembayaran yang belum selesai semula.
   - Bayaran yang sudah disahkan tidak dikreditkan sekali lagi.

3. Bunyi ka-ching
   - Hanya satu laluan audio digunakan bagi setiap transaksi.
   - Muat turun/dekod audio yang selesai lewat tidak mengulangi bunyi.
   - Bunyi gantian yang masih menunggu tidak dimainkan selepas mute, reset atau
     pembatalan main balik. Nada gantian yang sedang berbunyi juga boleh dihentikan.

Semua pembaikan V61 dikekalkan. Lihat README-V61.txt untuk sejarah pembaikan
simpanan, log keluar, versi fail dan pelarasan paparan. Struktur paparan dan fail
audio asal dikekalkan dalam V62; tiada Database Rules atau akaun pelayan diubah.

UJIAN
Lulus semakan sintaks 14 fail JavaScript.
Lulus ujian logik timer/pause, serahan pada deadline, serahan dua kali, pertukaran
akaun, pemulihan bayaran, stok/kertas tidak cukup, kredit sekali sahaja, bunyi
berganda dan pembatalan bunyi. Ujian simpanan, pemuat versi dan model paparan V61
dijalankan semula dan lulus.

Ujian menggunakan jam, DOM, audio dan sambungan Firebase simulasi. Paparan,
sentuhan, bunyi sebenar pada Safari/iPhone/iPad serta Firebase sebenar belum
dapat disahkan. Selepas muat naik, cuba kad/QR/tunai, KitaFood, butang Jeda dan
log keluar/masuk semula pada peranti anda.
