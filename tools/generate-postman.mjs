import { mkdir, writeFile } from 'node:fs/promises';

const json = (value) => JSON.stringify(value, null, 2);
const bearer = [{ key: 'Accept', value: 'application/json' }];
const raw = (value) => ({ mode: 'raw', raw: typeof value === 'string' ? value : json(value), options: { raw: { language: 'json' } } });
const request = (method, path, body, authenticated = true, scripts = []) => ({
  method,
  header: [...bearer, ...(body ? [{ key: 'Content-Type', value: 'application/json' }] : [])],
  ...(authenticated ? { auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] } } : { auth: { type: 'noauth' } }),
  ...(body ? { body: raw(body) } : {}),
  url: (() => {
    const [pathname, search = ''] = path.split('?');
    return {
      raw: `{{base_url}}${path}`,
      host: ['{{base_url}}'],
      path: pathname.split('/').filter(Boolean),
      ...(search ? { query: [...new URLSearchParams(search)].map(([key, value]) => ({ key, value })) } : {}),
    };
  })(),
  ...(scripts.length ? { event: [{ listen: 'test', script: { type: 'text/javascript', exec: scripts } }] } : {}),
});
const response = (name, method, path, status, body, bodyRequest = undefined) => ({
  name,
  originalRequest: request(method, path, bodyRequest, !['/api/register', '/api/login'].includes(path)),
  status: status >= 400 ? (status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : status === 404 ? 'Not Found' : status === 409 ? 'Conflict' : 'Unprocessable Content') : status === 204 ? 'No Content' : status === 201 ? 'Created' : 'OK',
  code: status,
  _postman_previewlanguage: 'json',
  header: [{ key: 'Content-Type', value: 'application/json' }],
  body: status === 204 ? '' : json(body),
});
const item = (name, req, examples, path, method, bodyRequest) => ({
  name,
  request: req,
  response: examples.map(([label, status, body, bodyExample]) => response(label, method, path, status, body, bodyExample ?? bodyRequest)),
});
const ok = { message: 'Operasi berhasil.' };
const validation = { message: 'Data yang diberikan tidak valid.', errors: { field: ['Nilai tidak valid.'] } };
const authFail = { message: 'Unauthenticated.' };
const authFolder = [
  item('Register anggota', request('POST', '/api/register', { name: 'Nadia Uji', email: 'nadia@example.test', password: 'Belajar123!', password_confirmation: 'Belajar123!' }, false), [
    ['Berhasil - 201', 201, { message: 'Akun berhasil dibuat.', data: { id: 3, name: 'Nadia Uji', email: 'nadia@example.test' } }],
    ['Gagal validasi - email tidak valid (422)', 422, { message: 'Data yang diberikan tidak valid.', errors: { email: ['The email field must be a valid email address.'] } }, { name: 'Nadia', email: 'salah', password: '123', password_confirmation: 'beda' }],
  ], '/api/register', 'POST', { name: 'Nadia Uji', email: 'nadia@example.test', password: 'Belajar123!', password_confirmation: 'Belajar123!' }),
  item('Login admin demo', request('POST', '/api/login', { email: 'admin@perpustakaan.test', password: 'BelajarAPI123!' }, false, [
    'if (pm.response.code === 200) {',
    '  const json = pm.response.json();',
    '  pm.collectionVariables.set("token", json.data.token);',
    '  pm.collectionVariables.set("role", json.data.user.role);',
    '}',
  ]), [
    ['Berhasil - 200', 200, { message: 'Login berhasil.', data: { token_type: 'Bearer', token: '<token-dari-login-aktual>', user: { id: 1, name: 'Admin Demo', email: 'admin@perpustakaan.test', role: 'admin' } } }],
    ['Gagal - kredensial salah (401)', 401, { message: 'Email atau password salah.' }, { email: 'admin@perpustakaan.test', password: 'salah1234' }],
  ], '/api/login', 'POST', { email: 'admin@perpustakaan.test', password: 'BelajarAPI123!' }),
  item('Login anggota demo', request('POST', '/api/login', { email: 'anggota@perpustakaan.test', password: 'BelajarAPI123!' }, false, [
    'if (pm.response.code === 200) {',
    '  const json = pm.response.json();',
    '  pm.collectionVariables.set("token", json.data.token);',
    '  pm.collectionVariables.set("role", json.data.user.role);',
    '}',
  ]), [
    ['Berhasil - 200', 200, { message: 'Login berhasil.', data: { token_type: 'Bearer', token: '<token-dari-login-aktual>', user: { id: 2, name: 'Anggota Demo', email: 'anggota@perpustakaan.test', role: 'anggota' } } }],
    ['Gagal - kredensial salah (401)', 401, { message: 'Email atau password salah.' }, { email: 'anggota@perpustakaan.test', password: 'salah1234' }],
  ], '/api/login', 'POST', { email: 'anggota@perpustakaan.test', password: 'BelajarAPI123!' }),
  item('Lihat profil', request('GET', '/api/profil'), [
    ['Berhasil - 200', 200, { data: { id: 2, name: 'Anggota Demo', email: 'anggota@perpustakaan.test', role: 'anggota' } }],
    ['Gagal - tanpa token (401)', 401, authFail],
  ], '/api/profil', 'GET'),
  item('Logout token saat ini', request('POST', '/api/logout'), [
    ['Berhasil - 200', 200, { message: 'Logout berhasil.' }],
    ['Gagal - tanpa token (401)', 401, authFail],
  ], '/api/logout', 'POST'),
];

const bookFolder = [
  item('Daftar buku', request('GET', '/api/buku?genre=Teknologi&sort=judul&order=asc', undefined, true, [
    'if (pm.response.code === 200) {',
    '  const json = pm.response.json();',
    '  if (json.data?.length) pm.collectionVariables.set("book_id", json.data[0].id);',
    '}',
  ]), [
    ['Berhasil - 200 array', 200, { data: [{ id: 2, judul: 'Belajar Laravel', penulis: 'Tim Laravel', genre: 'Teknologi', stok: 3 }, { id: 1, judul: 'Dasar API', penulis: 'Rafli Maulana', genre: 'Teknologi', stok: 8 }] }],
    ['Gagal - sort tidak didukung (422)', 422, validation],
  ], '/api/buku', 'GET'),
  item('Detail buku', request('GET', '/api/buku/{{book_id}}'), [
    ['Berhasil - 200', 200, { data: { id: 2, judul: 'Belajar Laravel', penulis: 'Tim Laravel', genre: 'Teknologi', stok: 3 } }],
    ['Gagal - buku tidak ada (404)', 404, { message: 'Not Found' }],
  ], '/api/buku/{{book_id}}', 'GET'),
  item('Tambah buku (admin)', request('POST', '/api/buku', { judul: 'Buku Uji Baru', penulis: 'Penulis Demo', genre: 'Teknologi', stok: 4 }, true, [
    'if (pm.response.code === 201) pm.collectionVariables.set("cleanup_book_id", pm.response.json().data.id);',
  ]), [
    ['Berhasil - 201', 201, { message: 'Buku berhasil ditambahkan.', data: { id: 4, judul: 'Buku Uji Baru', penulis: 'Penulis Demo', genre: 'Teknologi', stok: 4 } }],
    ['Gagal - input tidak valid (422)', 422, { message: 'Data yang diberikan tidak valid.', errors: { stok: ['The stok field must be at least 0.'] } }, { judul: '', penulis: 'Penulis Demo', genre: 'Teknologi', stok: -1 }],
  ], '/api/buku', 'POST', { judul: 'Buku Uji Baru', penulis: 'Penulis Demo', genre: 'Teknologi', stok: 4 }),
  item('Hapus buku uji (admin)', request('DELETE', '/api/buku/{{cleanup_book_id}}'), [
    ['Berhasil - 204 tanpa body', 204, null],
    ['Gagal - anggota tidak memiliki izin (403)', 403, { message: 'Hanya admin yang dapat menghapus buku.' }],
  ], '/api/buku/{{cleanup_book_id}}', 'DELETE'),
];

const loanBody = { nama_peminjam: 'Nadia', telepon: '081234567890', jatuh_tempo: '2026-11-20', items: [{ buku_id: 2, jumlah: 1 }] };
const loanFolder = [
  item('Buat peminjaman', request('POST', '/api/peminjaman', '{\n  "nama_peminjam": "Nadia",\n  "telepon": "081234567890",\n  "jatuh_tempo": "2026-11-20",\n  "items": [{"buku_id": {{book_id}}, "jumlah": 1}]\n}'), [
    ['Berhasil - 201 dan stok berkurang', 201, { message: 'Peminjaman berhasil.', data: { id: 1, nama_peminjam: 'Nadia', jatuh_tempo: '2026-11-20', items: [{ buku_id: 2, judul: 'Belajar Laravel', jumlah: 1 }] } }],
    ['Gagal validasi - jumlah nol (422)', 422, { message: 'Data yang diberikan tidak valid.', errors: { 'items.0.jumlah': ['Jumlah minimal 1.'] } }, { ...loanBody, items: [{ buku_id: '{{book_id}}', jumlah: 0 }] }],
    ['Gagal konflik - stok kurang (409)', 409, { message: 'Stok berubah atau tidak mencukupi; tidak ada peminjaman yang disimpan.' }, { ...loanBody, items: [{ buku_id: '{{book_id}}', jumlah: 9 }] }],
  ], '/api/peminjaman', 'POST', loanBody),
  item('Riwayat peminjaman saya', request('GET', '/api/peminjaman'), [
    ['Berhasil - 200 array', 200, { data: [{ id: 1, nama_peminjam: 'Nadia', jatuh_tempo: '2026-11-20', items: [{ buku_id: 2, judul: 'Dasar API', jumlah: 1 }] }] }],
    ['Gagal - tanpa token (401)', 401, authFail],
  ], '/api/peminjaman', 'GET'),
];

const collection = {
  info: {
    _postman_id: '6fdb7c32-ec4e-4ab0-938f-b9c44c3482a1',
    name: 'Perpustakaan Digital API',
    description: 'Collection untuk kontrak API aplikasi ini. Login demo mengambil token lokal otomatis. Contoh response tersimpan adalah fixture latihan; jalankan request dan simpan response aktual sebelum laporan uji final. Kredensial hanya data fiktif lokal.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [{ key: 'base_url', value: 'http://127.0.0.1:8000' }, { key: 'token', value: '' }, { key: 'role', value: '' }, { key: 'book_id', value: '1' }, { key: 'cleanup_book_id', value: '' }],
  item: [
    { name: 'Auth', description: 'Daftar akun, login untuk memperoleh token, profil dan logout.', item: authFolder },
    { name: 'Buku', description: 'Katalog tersedia bagi pengguna login; perubahan hanya untuk admin.', item: bookFolder },
    { name: 'Peminjaman', description: 'Peminjaman atomic dengan stok; riwayat disaring per pemilik token.', item: loanFolder },
  ],
};

await mkdir('postman', { recursive: true });
await writeFile('postman/Perpustakaan Digital API.postman_collection.json', `${json(collection)}\n`);
await writeFile('postman/Perpustakaan Digital API.postman_environment.json', `${json({
  id: 'fb44e4a6-68a8-4878-bd02-f8dd1a1df0ab',
  name: 'Perpustakaan Digital Lokal',
  values: [{ key: 'base_url', value: 'http://127.0.0.1:8000', type: 'default', enabled: true }],
  _postman_variable_scope: 'environment', _postman_exported_at: '2026-11-14T00:00:00.000Z', _postman_exported_using: 'Codex',
})}\n`);
