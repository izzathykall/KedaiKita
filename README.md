# KedaiKita — Kita Food V31

Game juruwang responsif untuk GitHub Pages, dengan sistem Kita Food di kaunter, katalog **224 produk dalam 20 kategori** (semuanya sekurang-kurangnya 10 produk), enam kelas barangan baru, UI produk SVG dan **Developer Lab**.

## Pemasangan

Ekstrak ZIP, kemudian upload semua kandungan folder `KedaiKita-main` ke repo GitHub Pages. Firebase menggunakan konfigurasi sedia ada melalui `firebase-config.js`.

Baca **`README_FIREBASE_V31.md`** untuk contoh rules Firebase, perubahan struktur simpanan, migrasi Developer sandbox dan cara menguji data secara langsung.

## Kita Food

Bermula Hari 3, rider Kita Food datang seperti pelanggan biasa. Popup senarai barang dibuka; pemain cari produk sendiri di rak, masukkan ke beg, tekan *Barang Sudah Siap*, kemudian masukkan kod pengambilan rider. Stok hanya ditolak selepas serahan selesai, dan pesanan boleh dibatalkan tanpa potongan stok.

Produk daripada kategori makan/minum yang sesuai termasuk minuman, bahan dapur dan kuih boleh dipesan. Penilaian, bonus cepat, stok, sesi dan rekod rider disimpan dalam progres kerjaya apabila masuk akaun Firebase.
