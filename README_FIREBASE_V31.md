# KedaiKita V31 — Firebase dan Developer Lab

## Penting sebelum menerbitkan

1. **Simpan salinan sandaran Realtime Database** projek sedia ada terlebih dahulu.
2. Pastikan `firebase-config.js` menunjuk ke projek Firebase sebenar yang menggunakan **Firebase Authentication (Email/Password)** dan **Realtime Database**. Tiada kunci service-account diperlukan atau patut diletakkan dalam GitHub Pages.
3. Semak `firebase-rules.example.json` dan **gabungkan rules untuk KedaiKita dengan rules sedia ada**, bukan menggantikan semua rules projek lain tanpa semakan. Publish rules di Firebase Console → Realtime Database → Rules. File JSON ini hanya contoh, ia TIDAK dipublish secara automatik.
4. Muat naik **semua fail** dalam folder `KedaiKita-main/` ke repositori GitHub Pages anda. Gunakan `version.json` baharu untuk elak cache versi lama.
5. Log masuk sebagai pemain (bukan tetamu) untuk menyimpan di Firebase. Mod tetamu disimpan setempat sahaja.
6. Selepas simpan kemajuan, status di kaunter perlu menyatakan `✓ Progres disimpan`. Jika `Simpanan belum disegerakkan`, jangan log keluar atau padam data pelayar. Sambung internet dan cuba sekali lagi.

## Struktur Realtime Database

Semua data akaun dibaca daripada `users/<Firebase Auth UID>/games/kedai-kita`. Simpanan menggunakan **update**, bukan menimpa keseluruhan node.

- `.../state`: kerjaya (hari, wang, stok kesemua produk, kategori, upgrade, tetapan bunyi/UI, jualan dan refund, rekod Kita Food, sesi/checkout yang belum selesai, rekod harian, pemulihan bintang, dan snapshot sambungan **Mod Latihan** dalam `practiceRun`)
- `.../developerSandbox/state`: data ujian untuk UID yang disenaraikan sebagai developer
- `.../sessionToken`: token untuk sesi aktif peranti semasa
- `activeSessions/<UID>`: semakan satu akaun / satu sesi aktif

V30 menyimpan data kerjaya pada `.../kedai-kita/state`; V31 membacanya tanpa mereset progres. Developer sandbox V30 yang berada pada `users/<UID>/games/developerSandbox/state` akan dicuba untuk dipindah secara automatik ke `.../kedai-kita/developerSandbox/state` apabila developer sah log masuk. Jika rules lama menghalang bacaan, salinan data pada peranti masih boleh digunakan apabila tersedia.

**Jangan pindahkan Developer sandbox ke `state` kerjaya.** Kedua-duanya disimpan berasingan dan kemas kini normal tidak akan memadamkan sandbox.

Mod Latihan kini menyimpan sesi yang belum selesai secara berasingan dalam snapshot akaun. Ia tidak mengubah wang / hari kerjaya. Pilih **Mod santai → Sambung latihan santai** pada menu utama untuk menyambungnya.

Firebase tidak boleh dijamin ketika tiada talian. Game mengekalkan salinan tempatan sementara; sistem cuba simpan semula apabila talian pulih. Butang **Simpan & semak Firebase** dalam Developer Lab memaksa penghantaran serta membaca semula data daripada Firebase untuk mengesahkannya. Ini bukan ujian pentadbiran backend atau bukti Rules sudah dipublish.

## Developer Lab

Akses Developer masih menggunakan `developer-config.js` allowlist **Firebase UID**. Jangan letakkan kata laluan atau private key dalam repositori. Allowlist UI bukan kawalan keselamatan admin Firebase; rules perlu mengekang akses setiap pengguna berdasarkan Auth UID.

Antara ujian yang ada:

- Wang: tambah, tolak atau reset secara atomik melalui Firebase
- Pelanggan: tunai, PIN, kad gagal, QR, barcode rosak, VIP, refund sah / palsu
- Kita Food: rider di kaunter, pesanan lewat / bonus tamat
- Rush Hour: aktif dan laporan tamat
- Inventori: stok rendah, kosong, ubah stok produk tertentu, semua stok penuh, kertas resit habis, terminal rosak dan baiki
- Perkembangan: semua kategori dibuka, kategori tambahan dikunci, semua upgrade maksimum, reset upgrade, lompat hari 1–60
- Audit: simpan dan baca semula Firebase, tunjuk bilangan rekod stok, hari, kategori, upgrade dan pesanan

**Reset data ujian** hanya berlaku setelah write Firebase berjaya. Jika gagal, data semasa kekal — tiada reset senyap pada peranti yang menipu bahawa data telah dipadam dari pelayan.

## Katalog V31

224 produk, 20 kategori dengan **minimum 10 produk setiap kategori**. Enam kategori baharu: Minuman & jus, Bahan masakan, Penjagaan diri, Perkakasan rumah, Aksesori digital, Pakaian & tekstil. Harga ialah harga *simulasi*, bukan harga pasaran sebenar. Produk baharu yang termasuk dalam kategori yang sudah dibuka pada versi lama menerima stok awal sekali sahaja; barang sedia ada dengan stok 0 tidak direset.

**Had ujian:** Kod dan aliran data boleh diuji setempat, tetapi pengesahan log masuk, hak akses sebenar dan muat naik ke projek Firebase pemilik hanya boleh dilakukan selepas memasang versi ini pada projek Firebase anda. Safari iOS perlu diuji selepas deploy juga.
