# Kedai Kita — Mod Developer (Setup Diperjelas V2)

**Punca butang DEV TEST tiada:** `developer-config.js` asal sengaja mempunyai `window.KEDAI_DEVELOPER_UIDS = []`. Tiada akaun dibenarkan secara automatik.

## Langkah mudah

1. Upload **keenam-enam fail** ZIP kemas kini ini ke root GitHub Pages dan commit (app.mjs, cloud.mjs, developer-config.js, index.html, style.css, version.json).
2. Buka URL game sedia ada, tambah `?dev=1` di hujung (jika URL sudah ada `?`, gunakan `&dev=1`). Butang **DEV SETUP** muncul walaupun akaun belum diberi akses.
3. Klik **DEV SETUP**, log masuk menggunakan akaun ujian Firebase Authentication. Jika belum ada akaun, buat dahulu menggunakan Firebase Console → Authentication → Users → Add user.
4. Dalam **Akaun → Akses Developer**, salin **UID Firebase** (bukan e-mel, bukan kata laluan).
5. Edit `developer-config.js` pada GitHub:

```js
window.KEDAI_DEVELOPER_UIDS = [
  "PASTE_UID_SEBENAR_DI_SINI"
];
```

6. Commit fail konfigurasi itu, tunggu GitHub Pages selesai deploy, refresh laman dan log masuk akaun yang sama. Butang bertukar kepada **DEV TEST**; sandbox hanya disimpan pada peranti, bukan di Realtime Database.

## Jika masih tidak muncul

- Pastikan UID di dalam `developer-config.js` **sama tepat** dengan UID yang tertera pada skrin akaun; ia bukan alamat e-mel.
- Pastikan semua fail di root repository, bukan dalam folder tambahan.
- Pastikan `developer-config.js` yang baru terbit pada URL `.../developer-config.js`.
- Refresh selepas GitHub Pages deployment, atau buka game dengan `?dev=1&check=2`.
- Pastikan masih log masuk dengan akaun Developer yang dibenarkan.

**Perhatian:** Ini bukan akses admin untuk Firebase Database. JavaScript klien yang boleh diubah pengguna tidak sesuai untuk melindungi data rahsia; Firebase Security Rules masih diperlukan bagi melindungi data pemain. Jangan letak kata laluan atau token dalam fail ini.
