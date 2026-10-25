KedaiKita — Cashier Simulator
V61 | 26 Oktober 2026

CARA PASANG
1. Ekstrak ZIP ini.
2. Gantikan kandungan laman sedia ada dengan SEMUA fail dalam folder KedaiKita-main.
   Pastikan index.html berada pada akar laman seperti pemasangan asal.
3. Sertakan fail baharu sync-policy.mjs. Jangan muat naik app.mjs sahaja.
4. Jika memuat naik secara berperingkat, muat naik version.json paling akhir.
5. Buka laman melalui pautan hosting / GitHub Pages, kemudian muat semula sekali.
   Jangan buka index.html terus melalui aplikasi Files (file://).
6. Jangan reset progres atau padam data pelayar untuk memasang versi ini.

APA YANG DIPERBAIKI
- Simpanan peranti yang belum disegerakkan dibandingkan dengan versi awan asalnya.
  Jika dua peranti mempunyai progres berbeza, pemain memilih simpanan peranti atau
  awan. Hari dan duit kedai dipaparkan untuk membantu pilihan.
- Kedua-dua calon simpanan disalin ke simpanan pemulihan tempatan sebelum pilihan
  konflik dilaksanakan. Salinan ini tidak mempunyai butang pemulihan khusus.
- Proses render/login tidak lagi menulis progres ketika pilihan simpanan belum selesai.
- Log keluar dan menunggu simpanan mempunyai had masa. Kegagalan menyimpan
  membatalkan log keluar, dengan progres tertunda dikekalkan pada peranti jika
  storan tempatan berjaya. Penulisan Firebase yang masih berjalan tidak diduplikasi.
- Status tidak lagi mendakwa simpanan tempatan berjaya jika storan peranti gagal.
- Kemas kini hanya memuat semula laman selepas simpanan berjaya.
- Semua modul tempatan, grafik produk, CSS dan skrip menggunakan versi yang sama.
  Selepas ini versi dalam version.json turut digunakan oleh modul bersarang.
- Pemuatan awal mempunyai had masa dan butang cuba semula jika fail gagal dimuatkan.
- Fon luar dimuatkan secara berasingan supaya ia tidak menghalang skrip permainan.
- Paparan memampatkan ruang terlebih dahulu, kemudian mengecilkan kanvas setakat
  75%. Pada tingkap yang terlalu kecil, kawasan game boleh ditatal untuk mencapai
  kawalan; seluruh game tidak lagi dikecilkan hingga 20%.
- Tiga peraturan CSS yang berulang tepat dibuang dan peraturan muat-skrin dihimpunkan
  dalam satu bahagian. Ini pembersihan terpilih, bukan penulisan semula seluruh CSS.

DIKEKALKAN
Susunan utama, grafik pelanggan/produk, mekanik pembayaran, audio, inventori,
upgrade, KitaFood dan konfigurasi Firebase asal dikekalkan. Tiada perubahan
kepada Database Rules atau akaun di pelayan dilakukan.

PENGESAHAN
Lulus semakan sintaks semua 12 fail JavaScript.
Lulus ujian logik perbandingan simpanan dan had masa, serta ujian dengan adapter
Firebase simulasi: simpanan berjaya, simpanan baharu ketika penulisan berjalan,
internet terganggu, penulisan ditolak, pilihan konflik, storan penuh dan pertukaran
akaun sebelum pengesahan penulisan diterima.
Lulus ujian pemuat versi semasa/versi akan datang dan eksport modul bersarang.
Lulus model geometri paparan telefon, tablet, desktop, tingkap pendek, tab bayaran
serta fokus papan kekunci.

HAD UJIAN
Ujian di atas menggunakan simulasi, bukan akaun Firebase sebenar atau emulator
Firebase. Pelayar ujian tidak tersedia; paparan sebenar, sentuhan dan bunyi pada
Safari/iPhone/iPad belum dapat disahkan. Cuba satu transaksi tunai/kad/QR serta
log keluar dan masuk semula selepas memuat naik versi ini.
