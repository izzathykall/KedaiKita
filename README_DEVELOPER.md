# Panduan Developer Mode — Kedai Kita

1. Tiada lagi butang pendaftaran atau DEV SETUP dalam game. Akses Developer hanya untuk UID yang dibenarkan. Pastikan `developer-config.js` mengandungi Firebase Authentication UID anda **tanpa simbol komen `//`** dan anda log masuk menggunakan akaun dengan UID itu.
2. Tekan **DEV TEST** untuk membuka panel. Label **Duit Kedai** adalah nilai yang sama seperti Duit Kedai di bahagian atas game.
3. Isi amaun RM dan tekan **+ Tambah** / **− Tolak**. Tunggu pengesahan Firebase sebelum meneruskan.
4. **Reset duit** (bahagian tersendiri) menetapkan duit kepada **RM0.00**, tetapi mengekalkan hari, stok dan upgrade. Pengesahan diperlukan.
5. **Reset data ujian** (zon berasingan, di bawah panel) memerlukan jawapan soalan darab diikuti persetujuan akhir sebelum mengembalikan sandbox ke Hari 1. Akaun log masuk dan progres biasa tidak dipadam.
6. Ketika Firebase gagal atau offline, reset tidak menukar data semasa dalam memori. Mesej kesilapan akan muncul supaya pemain boleh cuba semula. Periksa Realtime Database Rules jika gagal disimpan.
7. Simpanan ujian menggunakan `users/<UID>/games/kedai-kita/developerSandbox`, bukan progres biasa pada `users/<UID>/games/kedai-kita/state`. Akses satu sesi menggunakan `activeSessions/<UID>`.

> UID Developer dalam fail JS hanyalah kawalan UI; ia bukan akses pentadbir Firebase. Jangan jadikan Realtime Database boleh dibaca atau ditulis oleh umum.
