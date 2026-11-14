# Perpustakaan Digital API

API perpustakaan untuk latihan serah terima XI RPL. Kontrak yang dijalankan ada di [`docs/kontrak-api.md`](docs/kontrak-api.md), instruksi uji di [`docs/README.md`](docs/README.md), collection Postman di [`postman/Perpustakaan Digital API.postman_collection.json`](postman/Perpustakaan%20Digital%20API.postman_collection.json), dan spesifikasi OpenAPI di [`docs/openapi.yaml`](docs/openapi.yaml).

## Persiapan lokal

Persyaratan: PHP 8.3+, Composer, dan ekstensi PDO SQLite. Jangan bagikan berkas `.env`, token, atau akun asli.

```powershell
composer install
Copy-Item .env.example .env # bila .env belum ada
php artisan key:generate # bila APP_KEY masih kosong
php artisan migrate:fresh --seed
php artisan serve
```

Base URL contoh: `http://127.0.0.1:8000`. Prefix `/api` sudah termasuk dalam setiap path kontrak. Gunakan data demo hasil seeder: `admin@perpustakaan.test` dan `anggota@perpustakaan.test`, keduanya memakai kata sandi latihan `BelajarAPI123!`. Buat akun sendiri melalui `/api/register` bila menguji skenario pengguna baru. Ganti data demo sebelum deploy; jangan gunakan kredensial latihan di server publik.

Login mengembalikan `data.token`. Kirim token itu sebagai `Authorization: Bearer <token>` ke route terlindungi. Body dan respons memakai JSON (`Accept: application/json`); request ber-body memakai `Content-Type: application/json`.

Hanya admin demo yang dapat membuat/menghapus buku (403 untuk anggota). Registrasi membuat role `anggota`; tidak ada endpoint publik untuk menaikkan role. Setiap anggota hanya melihat riwayat peminjamannya sendiri. Proses konfirmasi stok berjalan di dalam transaksi database.

## Pemeriksaan lokal

```powershell
php artisan route:list --path=api
php artisan migrate:fresh --seed
php artisan test
```

Feature test tersedia di `tests/Feature/LibraryApiTest.php`. Bila PHPUnit gagal menemukan `vendor/autoload.php` pada mesin Windows yang memasang proyek ini, pastikan dependensi selesai dipasang dengan `composer install`, kemudian coba `vendor\bin\pest.bat` dari root proyek.
