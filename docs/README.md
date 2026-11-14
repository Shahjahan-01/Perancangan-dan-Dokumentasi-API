# Panduan menjalankan dan menguji API

Gunakan repo lokal ini dengan PHP 8.3+, Composer, dan SQLite.

1. Jalankan `composer install` dan pastikan `.env` tersedia. Jika belum, salin `.env.example` ke `.env`; jalankan `php artisan key:generate` jika APP_KEY kosong.
2. Jalankan `php artisan migrate:fresh --seed`, lalu `php artisan serve`. Server API ada pada `http://127.0.0.1:8000`; `/api` sudah menjadi bagian path endpoint.
3. Buka Postman, import `postman/Perpustakaan Digital API.postman_collection.json`, dan pilih environment yang dibuat dari `postman/Perpustakaan Digital API.postman_environment.json`. Isi `base_url` dengan `http://127.0.0.1:8000`.
4. Jalankan `Auth > Login admin demo`. Script request menyimpan token hasil login ke variabel `token`; jalankan Profil, katalog, dan operasi admin. Untuk transaksi gunakan `Auth > Login anggota demo`, lalu `Peminjaman > Buat peminjaman` dan `Riwayat saya`. Request Register membuat role anggota.
5. Header Authorization pada request protected memakai Bearer `{{token}}`. Collection memberi contoh request valid dan gagal. Contoh respons tersimpan sebagai ilustrasi kontrak; simpan respons aktual dari server yang diuji sebelum menyerahkan hasil uji final.
6. Logout mencabut token saat itu. Jalankan login lagi sebelum mencoba request protected setelah logout. Admin demo hanya untuk pengujian lokal.

## Pemeriksaan kontrak

Jalankan `php artisan route:list --path=api` untuk melihat sepuluh rute dan middleware. Jalankan `php artisan migrate:fresh --seed` untuk menyiapkan ulang data latihan. Jalankan `php vendor/bin/pest` untuk feature tests (atau `vendor\bin\pest.bat` di Windows). Hasil tes tersimpan pada `laporan/laporan-uji.md`; isi waktu eksekusi dan temuan uji silang yang benar-benar dilakukan sebelum dikumpulkan.

## Skenario penguji silang

1. Penguji mengikuti instruksi ini tanpa petunjuk lisan; catat jika base URL, port, atau nama environment tidak jelas.
2. Minta token lewat request Login admin demo. Pastikan `data.token` terisi, bukan token yang disalin ke chat.
3. Login sebagai anggota, GET profil, katalog filter/sort, dan riwayat. Coba profil tanpa token (401) dan filter sort tidak valid (422).
4. Admin menambah buku, anggota mencoba menambah buku (403), admin menghapus buku uji. Jangan hapus data perpustakaan lain.
5. Anggota mengajukan peminjaman dua buku yang stoknya cukup, lalu kirim input jumlah 0 (422) dan jumlah melebihi stok (409). Bandingkan stok sebelum/sesudah dan pastikan kegagalan tak membuat transaksi.
6. Simpan catatan dengan format `Skenario | Harapan | Hasil aktual | Status | Temuan/Perbaikan`. Bedakan masalah dokumentasi, implementasi, dan lingkungan; uji ulang sesudah perbaikan.

## Data demo dan keamanan

Seeder membuat admin/anggota fiktif dan tiga buku. Kredensial demo `BelajarAPI123!` harus dibatasi untuk lokal. Jangan sertakan token aktif, kata sandi nyata, database lokal, atau file `.env` dalam unggahan. `database/database.sqlite` adalah file lokal; jangan bagikan bila sudah berisi data pribadi.
