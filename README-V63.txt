KedaiKita V63 — Pembetulan permulaan game
26 Oktober 2026

PUNCA YANG DITEMUI
Pemuat V62 menunggu event load CSS walaupun URL itu merujuk fail yang sudah
dimuatkan. Ujian pelayar menghasilkan skrin kosong tanpa ikon, kemudian mesej
"Permainan belum dapat dimuatkan" selepas had masa tamat, seperti gambar laporan.

PEMBAIKAN
- CSS tidak lagi menjadi syarat yang menghalang skrip game bermula.
- Semua modul game tempatan digabungkan ke app.bundle.js. Tiada rangkaian import
  modul tempatan yang perlu selesai satu demi satu ketika membuka game.
- Paparan memuatkan game muncul semasa permulaan.
- Jika fail gagal dimuatkan, nama fail dan butang muat semula dipaparkan.
- Butang muat semula menggunakan URL baharu untuk mencuba fail yang segar.
- Semua pembaikan permainan V61/V62 dikekalkan; simpanan tidak direset.

CARA PASANG
1. Ekstrak ZIP.
2. Muat naik SEMUA kandungan folder KedaiKita-main ke folder laman GitHub Pages
   yang sama seperti dahulu. index.html dan app.bundle.js mesti bersebelahan.
3. Gantikan fail lama. Jangan muat naik ZIP tanpa mengekstraknya, dan jangan
   letakkan satu lagi folder KedaiKita-main di dalam folder laman sedia ada.
4. Jika muat naik berperingkat, muat naik version.json paling akhir.
5. Selepas deployment GitHub Pages selesai, buka pautan game dan refresh.
   Jika tab lama masih menunjukkan versi terdahulu, buka pautan game dengan
   ?boot=63 di hujungnya (atau &boot=63 jika URL sudah ada tanda ?).
6. Tidak perlu reset progres atau padam data Safari.

UJIAN
Masalah V62 berjaya diulang dalam Chromium. Versi V63 lulus ujian pelayar pada
1366x950 (saiz tablet) dan 390x844 (saiz telefon): permulaan, ikon, mod tetamu,
pelanggan pertama, barang, jeda/sambung, muat semula dengan cache dan pemulihan
pelanggan tersimpan. Fail bundle hilang juga memaparkan ralat dan butang pulih.
Ujian logik simpanan, KitaFood, bayaran digital dan audio dijalankan semula.

Ujian ini bukan Safari sebenar. Sambungan Firebase luar disekat dalam ujian
pelayar dan mod tetamu diuji; log masuk akaun sebenar belum diuji. Konfigurasi
Firebase dan data akaun pelayan tidak diubah.

UNTUK PENYELENGGARA KOD
Fail app.bundle.js sudah siap; pemain hanya perlu memuat naik fail.
Jika mengubah fail sumber .mjs/.js, jalankan npm install kemudian npm run build
sebelum memuat naik. Tukar version.json untuk keluaran baharu; build.mjs turut
menyelaraskan versi index.html dan membina bundle. Tiada node_modules perlu
atau patut dimuat naik ke laman.
Nota pemuatan modul berasingan dalam README-V61/V62 digantikan oleh panduan V63.
