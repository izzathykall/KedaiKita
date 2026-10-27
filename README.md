# KedaiKita V73 — paparan responsif

Pakej ini mengekalkan struktur game, mekanik, assets, dan tema V72.

## Perubahan
- `responsive.css`: lapisan responsif tambahan selepas `style.css` dan `design.css`; tidak menggantikan tema asal.
- Telefon portrait: kaunter -> resit dalam satu halaman boleh skrol. Senarai resit ada skrolnya sendiri. Tiada panel disembunyikan di luar skrin.
- Telefon landscape dan komputer: komposisi asal serta pembesaran/pengurangan adaptif; ruang tidak cukup boleh diskrol.
- Kedudukan pelanggan di tengah dengan dialog bersebelahan; dialog disesuaikan untuk telefon kecil.
- Pembayaran dan dialog terkekang kepada kawasan paparan dan boleh skrol.
- Versi cache dinaikkan untuk membolehkan GitHub Pages memuat versi baharu.

## Deploy GitHub Pages
Muat naik SEMUA fail dalam folder `KedaiKita-main` ke akar repositori GitHub Pages, bukan fail ZIP semata-mata. Pastikan `index.html`, `app.bundle.js`, `style.css`, `design.css`, `responsive.css`, `sw.js` dan semua fail assets berada pada aras yang sama. Jika menggunakan root `/KedaiKita/`, jangan tambah subfolder lain.

Jika memainkan versi lama selepas deploy, muat semula halaman. Pengguna offline boleh menggunakan prompt kemas kini yang sedia ada; kod tidak memadam data simpanan.

## Ujian
Semakan statik sintaks CSS/JavaScript dan rujukan fail dilakukan semasa pakej dijana. Ujian interaktif dalam pelayar peranti sebenar masih digalakkan (telefon kecil, iPhone, iPad, desktop, landscape).
