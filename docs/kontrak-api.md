# Kontrak API Perpustakaan Digital

Versi 1.0.0 | Laravel API | JSON | Base URL lokal `http://127.0.0.1:8000`

Kontrak ini mencatat perilaku implementasi yang ada. Path sudah memiliki prefix `/api`. Field sensitif password tidak pernah dikirimkan kembali. Semua tanggal memakai format `YYYY-MM-DD` dan tanggal jatuh tempo tidak boleh sebelum tanggal server.

## Aturan umum

- Request JSON: `Accept: application/json`; untuk body: `Content-Type: application/json`.
- Route publik: `POST /api/register`, `POST /api/login`.
- Route lainnya membutuhkan `Authorization: Bearer <token>` dari login. Logout menghapus token yang sedang dipakai saja.
- Role `anggota` dapat membaca katalog dan membuat/membaca riwayat peminjamannya sendiri. Role `admin` dapat melakukan semua tindakan buku.
- Bentuk sukses koleksi selalu `{ "data": [...] }`, termasuk hasil kosong. Satu resource memakai `{ "data": {...} }`. Kegagalan validasi memakai `{ "message": "...", "errors": {"field": ["..."]} }`.
- Password di-hash oleh Laravel. Token disimpan dalam tabel token Sanctum dan tidak dicatat ke log aplikasi.

## Endpoint

| Method | Path | Auth / izin | Ringkasan dan hasil |
|---|---|---|---|
| POST | `/api/register` | Publik | Daftar; 201, akun anggota dibuat tanpa token. |
| POST | `/api/login` | Publik | Email dan password; 200 berisi `data.token_type`, `data.token`, dan `data.user`. |
| GET | `/api/profil` | Bearer | 200 dengan id, name, email, role pemilik token. |
| POST | `/api/logout` | Bearer | 200; token saat ini dicabut, body `{message}`. |
| GET | `/api/buku` | Bearer | 200; selalu array. Query `genre`, `sort=judul\|stok`, `order=asc\|desc`; default judul naik. |
| GET | `/api/buku/{id}` | Bearer | 200 satu buku; ID integer positif, ID tak ada 404. |
| POST | `/api/buku` | Bearer admin | 201 buku dibuat. |
| DELETE | `/api/buku/{id}` | Bearer admin | 204 tanpa body; ID tak ada 404. |
| POST | `/api/peminjaman` | Bearer | 201 transaksi baru, stok berkurang dalam transaksi. |
| GET | `/api/peminjaman` | Bearer | 200 riwayat milik pemilik token saja; array kosong jika belum meminjam. |

Semua route API menggunakan JSON. Bearer tidak ada/kedaluwarsa: 401. Role tidak cukup: 403. Validasi gagal: 422. Route/ID tak ada: 404. Stok tak mencukupi pada konfirmasi: 409 dan seluruh transaksi dibatalkan. Endpoint login salah kredensial: 401. Rate limit register/login: 10 request per menit per alamat sumber.

## Skema field

### Register — `POST /api/register`

| Field | Tipe | Aturan |
|---|---|---|
| `name` | string | Wajib, maksimal 100 karakter. |
| `email` | string email | Wajib, maksimal 255, unik. |
| `password` | string | Wajib, minimal 8 karakter. |
| `password_confirmation` | string | Wajib, harus sama dengan password. |

### Login — `POST /api/login`

`email` string format email wajib; `password` string wajib. Respons sukses: `{ "message": "Login berhasil.", "data": {"token_type":"Bearer", "token":"<nilai-aktual>", "user":{"id":1,"name":"Admin Demo","email":"admin@perpustakaan.test","role":"admin"}} }`. Token di atas hanya dikeluarkan saat login nyata; jangan menyalin token nyata ke berkas yang dibagikan.

### Buku — `POST /api/buku`

| Field | Tipe | Aturan |
|---|---|---|
| `judul` | string | Wajib, maksimal 150. |
| `penulis` | string | Wajib, maksimal 100. |
| `genre` | string | Wajib, maksimal 60. |
| `stok` | integer | Wajib, 0 sampai 100000. |

Respons baca buku: `{ "id": 1, "judul": "Dasar API", "penulis": "Rafli Maulana", "genre": "Teknologi", "stok": 8 }`. Array katalog berisi objek dengan field yang sama.

### Peminjaman — `POST /api/peminjaman`

| Field | Tipe | Aturan |
|---|---|---|
| `nama_peminjam` | string | Wajib, maksimal 100. |
| `telepon` | string | Wajib, maksimal 20. String menjaga angka nol di depan. |
| `jatuh_tempo` | string tanggal | Wajib `YYYY-MM-DD`, hari ini atau setelahnya. |
| `items` | array | Wajib, minimal satu item. |
| `items[].buku_id` | integer | Wajib, ID buku yang tersedia, tidak boleh berulang dalam satu transaksi. |
| `items[].jumlah` | integer | Wajib, 1 sampai 1000, tidak melebihi stok saat konfirmasi. |

Body contoh: `{"nama_peminjam":"Nadia","telepon":"081234567890","jatuh_tempo":"2026-11-15","items":[{"buku_id":1,"jumlah":2}]}` (sesuaikan tanggal dan ID dengan server/data lokal). Identitas peminjam akun diambil dari token, bukan dari field client. Respons menyertakan `data.id`, nama, tanggal, dan `data.items[]` berisi `buku_id`, snapshot `judul`, dan `jumlah`. Kegagalan validasi atau konflik stok tidak membuat transaksi dan tidak mengurangi stok.

## Contoh gagal

Validasi 422:

```json
{
  "message": "Data yang diberikan tidak valid.",
  "errors": {"items.0.jumlah": ["Jumlah minimal 1."]}
}
```

Stok tidak cukup, 409:

```json
{"message":"Stok berubah atau tidak mencukupi; tidak ada peminjaman yang disimpan."}
```

Kredensial login salah, 401: `{"message":"Email atau password salah."}`. Akses tanpa token, 401: `{"message":"Unauthenticated."}`. Anggota mencoba perubahan katalog, 403: `{"message":"Hanya admin yang dapat menambah buku."}` (teks sesuai tindakan).

## Efek data

Register menyimpan pengguna anggota dan hash password. Login membuat token baru. Logout mencabut token request saja. GET tidak mengubah data. Admin POST buku menambah satu baris; DELETE menghapus buku dan mempertahankan judul snapshot transaksi lama dengan relasi buku nullable. Peminjaman yang valid membuat satu transaksi dan detail per buku, lalu mengurangi stok setiap buku dalam satu transaksi database. Jika salah satu stok kurang, tidak ada baris peminjaman yang dibuat dan stok seluruh buku tetap.
