# KedaiKita V31 — Developer Lab

Untuk mengaktifkan **DEV TEST**, masukkan Firebase Authentication UID anda (bukan e-mel) ke dalam senarai `window.KEDAI_DEVELOPER_UIDS` pada `developer-config.js`, kemudian log masuk semula.

Developer Lab menggunakan `users/<UID>/games/kedai-kita/developerSandbox/state`, berasingan daripada `users/<UID>/games/kedai-kita/state` kerjaya. Progres pengguna biasa tidak dipadam oleh ujian Developer. UID dalam Javascript **bukan** peranan administrator Firebase; ia hanya menyembunyikan/menunjukkan panel. Lindungi pangkalan data dengan Realtime Database Rules yang sesuai.

## Apa yang boleh diuji

- Duit Kedai: tambah, tolak dan reset RM dengan pengesahan tulis ke Firebase sebelum angka UI ditukar.
- Senario segera: tunai, kad dan PIN, kad ditolak, QR, barcode rosak, VIP, refund sah/palsu, Kita Food biasa dan lewat, Rush Hour mula/tamat, stok rendah, stok habis, resit habis, terminal rosak, semua upgrade.
- Kawalan inventori: penuhkan stok, masukkan bilangan stok bagi produk individu, buka/kunci kategori, baiki terminal/tambah resit.
- Kawalan upgrade dan hari: tetapkan semua upgrade maksimum, reset upgrade, lompat ke Hari 1–60.
- Audit Firebase: tekan **Simpan & semak Firebase** untuk memaksa upload progres dan baca semula rekod simpanan bagi memastikan versi akaun di Firebase sepadan dengan versi tempatan.

**Reset data ujian** kini tidak akan mengubah memori/peranti apabila write ke Firebase gagal. Ini mengelakkan keadaan game reset tetapi data pelayan masih kekal. Mesej ralat menerangkan jika sambungan / Rules menghalang reset.

Rujuk `README_FIREBASE_V31.md` untuk pemasangan, contoh rules dan struktur simpanan. Pastikan UID Developer anda benar-benar di dalam `developer-config.js`, bukan hanya di dalam komen.
