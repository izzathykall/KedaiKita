# Kedai Kita — Golden Rush V5 (18 Oktober 2026)

## Perubahan
- Pemulangan barang (refund) tidak muncul ketika Rush Hour sedang aktif.
- Jika pelanggan refund sedang dilayan tepat ketika Rush Hour sepatutnya bermula, acara menunggu sehingga urusan selesai, kemudian memaparkan popup permulaan.
- Selepas Rush Hour, pelanggan refund berfungsi seperti biasa.
- Latar kedai lebih meriah dengan efek Golden Rush: sinaran emas bergerak, bintang bercahaya, kilauan kaunter, glow scanner & penimbang dan pelanggan latar hiasan.
- Animasi tidak menghalang klik/touch; mod kurangkan animasi atau reduced motion dipatuhi.
- Popup permulaan/tamat Rush Hour, sasaran pelanggan harian, sistem keuntungan, UID Developer dan Firebase kekal.

## Kemas kini GitHub Pages

Gantikan tepat empat fail daripada ZIP perubahan:
1. `app.mjs`
2. `style.css`
3. `index.html`
4. `version.json`

Jangan ubah `developer-config.js` yang sedia ada. Selepas Commit, tunggu GitHub Pages selesai deploy dan refresh halaman.

## Ujian
- Sintaks JavaScript: lulus.
- Simulasi logik: ketika Rush Hour refund disekat; di luar Rush Hour refund masih muncul; refund sedia ada selesai dahulu: lulus.
- Semakan lapisan visual CSS di Chromium saiz 390, 768 dan 1474 px: lulus.
- Belum diuji terhadap Firebase dan Safari sebenar selepas deploy.
