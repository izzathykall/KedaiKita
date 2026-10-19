# KedaiKita — Delivery Rider Studio V29 (19 Oktober 2026)

## Naik taraf bahagian Rider
- Watak rider direka semula sebagai **ilustrasi SVG beranimasi** (bukan emoji), dengan motosikal dan seragam mengikut platform penghantaran.
- Panel Delivery Rider Studio baharu: statistik, barisan pesanan, status penyediaan, masa baki, jumlah bayaran, beg dan serahan.
- **Barang tidak boleh ditanda siap di senarai pesanan.** Pemain wajib cari barangan sendiri melalui rak kedai digital dan sentuh produk tepat untuk mengimbasnya. Rak boleh ditapis ikut kategori atau dicari mengikut nama.
- Barang salah tidak dimasukkan ke beg. Barang dalam beg boleh dikeluarkan semula.
- Hanya pesanan yang lengkap boleh diserahkan kepada rider selepas memasukkan kod 4 digit pada telefon rider.
- Stok tidak dipotong dua kali: pemotongan inventori, keuntungan, bonus, laporan dan statistik hanya dikira sekali selepas pengesahan.
- Naik taraf rak (maksimum 3 pesanan serentak) dan progres pesanan kekal dalam `progress.delivery` untuk simpanan akaun.
- Reka bentuk untuk telefon, iPad dan desktop; mod gelap serta animasi dikurangkan disokong.
- Kekalkan gameplay asal kaunter, pembayaran, rush hour, upgrade lain dan integrasi akaun/Firebase.

## Cara bermain
1. Mulakan **Mod Kerjaya** dan capai **Hari 3** untuk membuka Delivery.
2. Tekan **Rider** > **Terima pesanan baharu**.
3. Rujuk senarai pembelian, kemudian **cari & sentuh barang pada rak** untuk imbas ke dalam beg.
4. Apabila lengkap, baca kod rider pada telefon yang dipaparkan, taip kod dan tekan **Sahkan & serah pesanan**.
5. Naik taraf rak pesanan di panel Rider sekiranya perlu.

## Pemasangan GitHub Pages
Muat naik **semua fail** daripada folder `KedaiKita-main` dalam ZIP ini ke repositori GitHub Pages. Fail penting yang berubah: `delivery.mjs`, `app.mjs`, `style.css`, `index.html`, `version.json`. Jangan gantikan Firebase config peribadi yang telah disesuaikan tanpa semakan. Selepas deploy, refresh game untuk memuatkan versi baharu.

## Semakan
- Sintaks semua fail JavaScript berjaya diperiksa dengan Node.js.
- Aliran pesanan, cari/imbas rak, pengesahan kod salah dan betul, pemotongan stok sekali dan paparan saiz 390/768/1440 diuji dalam Chromium melalui ujian modul.
- Firebase live dan pelayar Safari iOS belum diuji dalam persekitaran peranti sebenar.
