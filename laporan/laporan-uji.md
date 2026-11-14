# Laporan serah terima dan pengujian API

## Identitas

- Nama: ______________________________
- Kelas: XI RPL ____
- Nama penguji silang: ______________________________
- Proyek: Perpustakaan Digital API
- Tanggal build: 14 November 2026
- Base URL lokal: `http://127.0.0.1:8000`

## Ringkasan hasil

API dibangun di atas Laravel 13 dengan sepuluh route yang terdokumentasi. Login Sanctum menghasilkan Bearer token; role admin dibutuhkan untuk perubahan buku; riwayat pinjam dibatasi ke pemilik akun. Konfirmasi peminjaman mengurangi stok dan membuat detail transaksi dalam satu database transaction. Contoh akun dan buku berasal dari seeder fiktif.

Verifikasi internal menggunakan Pest: **7 tests lulus, 41 assertions lulus** untuk seluruh folder `tests`; di antaranya **5 feature tests API dengan 39 assertions**. Cakupan API mencakup register/login dan kredensial salah, profil/token/logout, filter katalog, izin admin, ID tidak ada, validasi buku, peminjaman valid, validasi 422, stok tidak cukup 409, dan isolasi riwayat. Perintah verifikasi di lingkungan kerja: `php -d auto_prepend_file=vendor/autoload.php vendor/bin/pest --no-configuration tests` dengan environment testing SQLite memory.

## Tabel uji kontrak

| Skenario | Harapan | Hasil aktual dari feature test | Status |
|---|---|---|---|
| Register dengan data valid | 201, akun anggota dibuat | 201; data identitas dikembalikan tanpa password | Lulus |
| Login valid / password salah | 200 + Bearer / 401 | 200 + token / 401 | Lulus |
| Profil dan katalog tanpa token | Data / 401 | Data / 401 | Lulus |
| Logout kemudian memakai token sama | Token dicabut; akses 401 | Token dicabut; akses 401 | Lulus |
| Katalog filter genre dan sort stok | 200, data tetap array dan berurutan | 200, hasil terfilter dan tersortir | Lulus |
| Parameter sort tidak diizinkan | 422 | 422 | Lulus |
| Anggota menambah buku / admin menambah buku | 403 / 201 | 403 / 201 | Lulus |
| Field buku tidak valid / detail ID tak ada | 422 / 404 | 422 / 404 | Lulus |
| Admin menghapus buku | 204 tanpa body | 204; penghapusan kedua 404 | Lulus |
| Peminjaman valid dua item | 201 dan stok berkurang | 201; stok berkurang sesuai jumlah | Lulus |
| Jumlah item nol | 422 tanpa perubahan | 422 | Lulus |
| Stok kurang saat konfirmasi | 409, tidak ada transaksi baru, stok tetap | 409; jumlah transaksi dan stok tidak berubah | Lulus |
| Riwayat dibuka akun lain | Tidak ada transaksi milik orang lain | Array kosong untuk akun lain | Lulus |

## Catatan uji silang

Uji otomatis dan pemeriksaan kontrak lokal sudah dilakukan. Pengujian manual oleh teman pada Postman belum dilakukan dalam sesi pengerjaan ini, sehingga nama penguji, hasil aktual dari perangkat kedua, dan temuan lintas lingkungan perlu diisi setelah koleksi diberikan kepada teman. Jangan menyatakan pengujian teman telah selesai sebelum langkah itu benar-benar dilakukan.

| Endpoint / skenario | Harapan kontrak | Hasil aktual teman | Status / temuan / perbaikan |
|---|---|---|---|
| Login -> profil | 200, token dipakai sebagai Bearer | __________________ | __________________ |
| GET katalog filter/sort | 200, array sesuai query | __________________ | __________________ |
| Input peminjaman tidak valid | 422 dan stok tetap | __________________ | __________________ |
| Jumlah pinjam melebihi stok | 409 dan tidak ada transaksi | __________________ | __________________ |
| Logout -> profil dengan token lama | 401 | __________________ | __________________ |

## Refleksi

1. Bagian yang berpotensi membingungkan penguji adalah perbedaan token admin dan anggota serta format tanggal `YYYY-MM-DD`. README dan collection menunjukkan akun demo, variabel `token`, dan contoh tanggal; token aktual dibuat saat login.
2. Kontrak awal PDF adalah contoh pembelajaran dan bukan bukti perilaku proyek. Kontrak final dicocokkan dengan sepuluh route aplikasi ini. Contoh perubahan yang dibuat eksplisit: route memakai `/api/profil`, respons login menaruh token pada `data.token`, dan role admin dibutuhkan untuk membuat/menghapus buku. Collection berisi fixture ilustratif dan harus dibandingkan dengan respons server saat uji.
3. Sesudah pemeriksaan kontrak, implementasi dilengkapi dari skeleton, token/logout Sanctum, validasi, izin admin, filter stabil, transaksi stok, migrasi, seed, dokumentasi, OpenAPI, dan request/response Postman. Uji otomatis kemudian memastikan temuan penting tersebut.

## Berkas serah terima

- `README.md`: persiapan proyek, seeder, akun latihan, peringatan rahasia.
- `docs/kontrak-api.md`: method, path, autentikasi, skema, status, contoh, efek database.
- `docs/openapi.yaml`: spesifikasi OpenAPI 3.0.3.
- `docs/README.md`: urutan penggunaan dan skenario penguji.
- `postman/Perpustakaan Digital API.postman_collection.json`: request terkelompok beserta contoh respons.
- `postman/Perpustakaan Digital API.postman_environment.json`: base URL lokal.
- `tests/Feature/LibraryApiTest.php`: feature tests.

## Keamanan data

Akun/email/data buku adalah data demo fiktif. Collection tidak menyimpan token aktif. Sebelum mengunggah, jangan sertakan `.env`, database berisi informasi pribadi, password asli, atau token aktif. Ganti data demo jika aplikasi akan dipublikasikan.
