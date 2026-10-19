# KedaiKita V32 — kemas kini Kita Food dan kaunter

Perubahan daripada `KedaiKita-main 7.zip`:

- Rider **Kita Food** muncul di kaunter seperti pelanggan biasa. Selepas kira-kira 2 saat barulah popup pesanan dibuka. Apabila meneruskan sesi tersimpan atau memulakan ujian Developer, watak rider turut dipaparkan dahulu.
- Rambut watak **bersongkok** dilindungi songkok yang lebih labuh pada ilustrasi SVG, termasuk variasi rambut panjang/kerinting.
- **Rush Hour** baharu dicetuskan **setiap 2 hari permainan**, bermula Hari 2 (Hari 2, 4, 6, ...). Tempoh 60 saat dan mekanik sedia ada kekal. Rush Hour lama yang masih aktif selepas kemas kini dibiarkan tamat supaya simpanan tidak tersekat.
- Popup pembayaran QR: **telefon pelanggan dipusatkan**, saiz telefon diseimbangkan dengan QR dan **scanner dibesarkan**. Kaedah sentuh/seret scanner dikekalkan.
- Keterangan panjang diminta telah dikeluarkan daripada halaman jeda, panel Developer, katalog dan inventori; mekanik yang diterangkan masih berfungsi.
- Data lama yang mengandungi pelanggan tanpa `items` ditangani tanpa mereset duit, stok dan upgrade kerjaya.
- Label katalog diselaraskan kepada bilangan produk semasa (224 produk, 20 kategori).

## Pemasangan

Gantikan fail dalam repositori GitHub Pages dengan kandungan folder ini. **Jangan padam Firebase Realtime Database atau reset data.** Simpan backup fail asal terlebih dahulu.

## Ujian

- Pemeriksaan sintaks `app.mjs`, `engine.mjs`, `delivery.mjs` lulus.
- Semakan katalog: 224 produk, 20 kategori, setiap kategori >= 10 barang.
- Logik Rush Hour Hari 1–10 dan keserasian sesi Rush Hour lama lulus.
- Ujian visual pelayar sebenar / Firebase live perlu dibuat di tapak GitHub Pages selepas diterbitkan.
