# KedaiKita — Kita Food V30

Aplikasi simulasi juruwang KedaiKita untuk GitHub Pages.

## Sistem Kita Food

Mulai **Hari 3** dalam **Mod Kerjaya**, rider Kita Food datang ke **kaunter pelanggan biasa** selepas beberapa transaksi pelanggan. Dia memakai uniform Kita Food dan muncul sebagai watak di tempat pelanggan, bukan papan permainan berasingan. Sebuah popup pesanan terbuka secara automatik.

1. **Semak pesanan:** Baca nama rider, ID pesanan dan barang yang diminta. Tekan **Mula Cari Barang**.
2. **Cari sendiri:** Cari produk di rak digital berdasarkan nama dan kategori. Sentuh setiap barang yang tepat untuk memasukkannya ke beg. Salah pilih tidak dimasukkan.
3. **Barang Sudah Siap:** Button hanya aktif apabila semua barang tersedia dalam beg. Pemain boleh keluarkan barang untuk membetulkan kesilapan.
4. **Serah kepada rider:** Beg dimeterai, pemain memasukkan kod empat digit daripada telefon rider dan menekan **Sahkan & Serah Kepada Rider**.
5. **Lihat keputusan:** Paparan penilaian 3–5 bintang, untung kedai dan bonus siap pantas. Tekan **Rider Beredar · Pelanggan Seterusnya**.

Barang prabayar, tiada proses tunai; stok dan keuntungan dikira **sekali sahaja** selepas serahan berjaya. Pesanan yang dibatalkan tidak memotong stok. Jika pemain menutup popup, pesanan masih boleh dibuka daripada butang **Kita Food** dan kemajuan disimpan untuk sambungan semula.

Pada Hari 3 dan seterusnya, rider boleh muncul selepas beberapa pelanggan. Pesanan menjadi lebih banyak dan had masa lebih singkat mengikut hari. Ride tidak dikira sebagai pelanggan biasa dalam sasaran harian. Menu **Kita Food** menunjukkan statistik penghantaran dan maklumat pembukaan ciri.

Fail `progress.delivery` lama daripada V29 dimigrasi kepada jenama Kita Food; ID pesanan lama dikekalkan untuk elak kehilangan progres.

## Pasang dalam GitHub Pages

Muat naik semua fail dalam folder `KedaiKita-main` ke akar repository GitHub Pages, bukan ZIP sahaja. `index.html`, `app.mjs`, `delivery.mjs`, `engine.mjs`, `style.css`, `version.json` dan aset media hendaklah kekal bersama.

Sistem Firebase yang sedia ada kekal berdasarkan konfigurasi persekitaran yang dipasang. Uji log masuk sebenar selepas deploy.
