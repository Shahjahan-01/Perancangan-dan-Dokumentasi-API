import { mkdir, writeFile } from 'node:fs/promises';

const W = 595;
const H = 842;
const navy = [0.06, 0.17, 0.37];
const blue = [0.12, 0.36, 0.75];
const pale = [0.91, 0.95, 0.99];
const orange = [0.96, 0.43, 0.10];
const escape = (s) => s.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
const wrap = (text, limit = 89) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && `${line} ${word}`.length > limit) { lines.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
};

function page(title, subtitle, content) {
  let y = 780;
  const compact = title !== 'Perpustakaan Digital API';
  const ops = [];
  const rect = (x, top, w, h, color) => ops.push(`${color.join(' ')} rg ${x} ${top - h} ${w} ${h} re f`);
  const text = (s, x, yy, size, font, color = navy) => {
    ops.push(`${color.join(' ')} rg BT /${font} ${size} Tf ${x} ${yy} Td (${escape(s)}) Tj ET`);
  };
  rect(0, H, W, H, [1, 1, 1]);
  rect(0, H, W, 68, navy);
  rect(0, 68, W, 5, orange);
  text('SERAH TERIMA API  |  XI RPL', 42, 812, 10, 'F2', [1, 1, 1]);
  text(title, 42, 760, 23, 'F2');
  text(subtitle, 42, 738, 10, 'F1', blue);
  y = 702;

  for (const block of content) {
    if (block.type === 'section') {
      y -= compact ? 4 : 8;
      rect(42, y + 15, 4, 17, orange);
      text(block.text, 54, y + 3, 13, 'F2', blue);
      y -= compact ? 31 : 23;
    } else if (block.type === 'callout') {
      const lines = wrap(block.text, 86);
      const height = lines.length * 13 + 18;
      rect(42, y + 8, 511, height, pale);
      text(block.label, 55, y - 10, 10, 'F2', blue);
      lines.forEach((line, i) => text(line, 55, y - 26 - i * 13, 9, 'F1'));
      y -= height + 15;
    } else if (block.type === 'table') {
      const widths = block.widths;
      const headerH = 24;
      const rowH = compact ? Math.min(block.rowH ?? 33, 31) : block.rowH ?? 33;
      rect(42, y + 6, 511, compact ? 22 : headerH, blue);
      let x = 51;
      block.headers.forEach((header, i) => {
        text(header, x, y - 9, 8, 'F2', [1, 1, 1]);
        x += widths[i];
      });
      y -= compact ? 22 : headerH;
      for (let ri = 0; ri < block.rows.length; ri++) {
        const row = block.rows[ri];
        if (ri % 2 === 0) rect(42, y + 6, 511, rowH, pale);
        x = 51;
        row.forEach((cell, ci) => {
          wrap(String(cell), Math.floor((widths[ci] - 9) / 4.6)).slice(0, 3).forEach((line, li) => text(line, x, y - 9 - li * (compact ? 9 : 10), 7.4, ci === row.length - 1 && String(cell) === 'LULUS' ? 'F2' : 'F1', ci === row.length - 1 && String(cell) === 'LULUS' ? blue : navy));
          x += widths[ci];
        });
        y -= rowH;
      }
      y -= compact ? 9 : 15;
    } else if (block.type === 'bullet') {
      const lines = wrap(block.text, 92);
      text('-', 50, y, 9, 'F2', orange);
      lines.forEach((line, i) => text(line, 63, y - i * (compact ? 11 : 13), 9, 'F1'));
      y -= lines.length * (compact ? 11 : 13) + (compact ? 2 : 5);
    } else if (block.type === 'paragraph') {
      const lines = wrap(block.text, 96);
      lines.forEach((line, i) => text(line, 48, y - i * (compact ? 11 : 13), 9, 'F1'));
      y -= lines.length * (compact ? 11 : 13) + (compact ? 4 : 9);
    }
  }
  ops.push(`${[0.79, 0.84, 0.91].join(' ')} RG 42 48 m 553 48 l S`);
  text('Dokumentasi berdasarkan implementasi lokal  |  14 November 2026', 42, 30, 8, 'F1', blue);
  text('API HANDOVER', 464, 30, 8, 'F2', blue);
  return ops.join('\n');
}

const pages = [
  page('Perpustakaan Digital API', 'Laporan serah terima dan verifikasi lokal  |  Versi 1.0.0', [
    { type: 'callout', label: 'RINGKASAN', text: 'Aplikasi Laravel 13 dari skeleton kosong kini menyediakan API perpustakaan dengan 10 route. Kontrak, panduan penggunaan, OpenAPI, Postman collection, seeder data fiktif, dan feature tests tersedia di repository.' },
    { type: 'section', text: 'Identitas siswa dan penguji' },
    { type: 'paragraph', text: 'Nama: _________________________________     Kelas: XI RPL ____' },
    { type: 'paragraph', text: 'Nama penguji silang: __________________________________________' },
    { type: 'section', text: 'Hasil verifikasi implementasi' },
    { type: 'paragraph', text: 'Pest seluruh suite: 7 test lulus, 41 assertions. Di dalamnya terdapat 5 feature test API dengan 39 assertions. Cakupan API: register/login, profil/logout, token, filter katalog, validasi, izin, peminjaman, konflik stok, dan privasi riwayat.' },
    { type: 'table', headers: ['Area', 'Kontrak yang dicek', 'Hasil'], widths: [102, 315, 94], rows: [
      ['Auth', 'Register 201; login 200; kredensial salah 401', 'LULUS'],
      ['Bearer', 'Tanpa token 401; logout mencabut token saat ini', 'LULUS'],
      ['Buku', 'Array stabil; filter dan sort; admin 201/204; anggota 403', 'LULUS'],
      ['Validasi', 'Input salah 422; resource tidak ada 404', 'LULUS'],
      ['Peminjaman', 'Transaksi 201; stok dikurangi sesuai jumlah', 'LULUS'],
      ['Konflik stok', '409; tidak ada transaksi baru; stok tetap', 'LULUS'],
      ['Kepemilikan', 'Riwayat hanya terlihat pemilik token', 'LULUS'],
    ], rowH: 38 },
    { type: 'paragraph', text: 'Server lokal: http://127.0.0.1:8000. Base URL dan path /api tertulis di README dan environment Postman.' },
  ]),
  page('Kontrak dan perilaku data', 'Request dan respons mengikuti routes serta validasi aplikasi', [
    { type: 'section', text: 'Endpoint yang disiapkan' },
    { type: 'table', headers: ['Kelompok', 'Route', 'Akses'], widths: [89, 300, 122], rows: [
      ['Auth', 'POST /api/register, POST /api/login', 'Publik'],
      ['Auth', 'GET /api/profil, POST /api/logout', 'Bearer'],
      ['Buku', 'GET /api/buku, GET /api/buku/{id}', 'Bearer'],
      ['Buku', 'POST /api/buku, DELETE /api/buku/{id}', 'Admin + Bearer'],
      ['Pinjam', 'POST /api/peminjaman', 'Anggota + Bearer'],
      ['Pinjam', 'GET /api/peminjaman', 'Pemilik + Bearer'],
    ], rowH: 36 },
    { type: 'section', text: 'Aturan data yang dibuktikan' },
    { type: 'bullet', text: 'Login mengirim data.token bertipe Bearer. Token Sanctum aktif disimpan server, logout menghapus token saat ini.' },
    { type: 'bullet', text: 'Katalog menerima genre, sort=judul|stok, order=asc|desc; hasil selalu array, termasuk saat kosong.' },
    { type: 'bullet', text: 'Field transaksi: nama_peminjam, telepon string, jatuh_tempo YYYY-MM-DD, dan array items berisi buku_id serta jumlah.' },
    { type: 'bullet', text: 'Transaksi valid menyimpan judul snapshot dan mengurangi stok dalam satu database transaction. Stok kurang menghasilkan 409 tanpa perubahan data.' },
    { type: 'bullet', text: 'Anggota hanya melihat riwayatnya; role admin dibutuhkan untuk menambah dan menghapus buku.' },
    { type: 'section', text: 'Perubahan setelah inspeksi' },
    { type: 'paragraph', text: 'Handout adalah contoh rancangan. Route, nama field, role, dan respons di kontrak final mengikuti kode aplikasi. Implementasi menambahkan validasi eksplisit, kode 401/403/404/409/422, migrasi data, dan akun seed fiktif.' },
    { type: 'paragraph', text: 'Seeder memakai akun dan buku fiktif. Password latihan hanya untuk lokal; jangan unggah .env, database dengan data pribadi, atau token aktif.' },
    { type: 'section', text: 'Berkas yang disiapkan' },
    { type: 'bullet', text: 'README dan panduan: instalasi, server, data demo, dan urutan uji; kontrak API dan OpenAPI: field, status, auth, serta efek data.' },
    { type: 'bullet', text: 'Postman collection/environment berisi Auth, Buku, Peminjaman, serta fixture success/failure. Pest: 7 test dan 41 assertions, termasuk 5 feature test API.' },
  ]),
  page('Catatan uji silang dan refleksi', 'Uji lokal selesai; bagian yang membutuhkan teman ditandai jujur', [
    { type: 'section', text: 'Status uji silang' },
    { type: 'callout', label: 'PERLU DIISI SAAT PENGUJIAN TEMAN', text: 'Uji manual pada Postman oleh teman belum dilakukan dalam sesi ini. Tukarkan repository/collection, isi nama penguji dan hasil aktual, lalu lampirkan catatan uji dari perangkat kedua sebelum pengumpulan.' },
    { type: 'table', headers: ['Skenario', 'Harapan', 'Aktual teman'], widths: [170, 180, 161], rows: [
      ['Login -> profil', '200, token Bearer bekerja', '________________'],
      ['Filter katalog', '200, hasil sesuai query', '________________'],
      ['Jumlah item 0', '422, stok tetap', '________________'],
      ['Stok tidak cukup', '409, data batal', '________________'],
      ['Logout -> profil lama', '401', '________________'],
    ], rowH: 38 },
    { type: 'section', text: 'Jawaban refleksi' },
    { type: 'paragraph', text: '1. Token anggota dan admin berbeda izin; base_url lokal dan tanggal YYYY-MM-DD harus disiapkan. README dan Postman memberi langkah login serta menyimpan data.token secara otomatis.' },
    { type: 'paragraph', text: '2. Contoh handout bukan hasil API proyek. Perbedaan diselaraskan dan ditulis: route profil memakai /api/profil, login mengirim token pada data.token, dan perubahan buku memerlukan admin. Respons aktual harus dibandingkan ketika koleksi dijalankan.' },
    { type: 'paragraph', text: '3. Setelah pemeriksaan, API, migrasi, token/logout, role, validasi, transaksi stok, README, kontrak, OpenAPI, collection, environment, dan feature tests diselesaikan. Lima feature tests kemudian lulus.' },
  ]),
];

const objects = [];
const add = (body) => { objects.push(body); return objects.length; };
const catalog = add('<< /Type /Catalog /Pages 2 0 R >>');
const pagesObj = add('');
const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
const pageIds = [];
for (const stream of pages) {
  const bytes = Buffer.from(stream, 'latin1');
  const contentId = add(Buffer.concat([Buffer.from(`<< /Length ${bytes.length} >>\nstream\n`, 'ascii'), bytes, Buffer.from('\nendstream', 'ascii')]));
  const pageId = add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${contentId} 0 R >>`);
  pageIds.push(pageId);
}
objects[pagesObj - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
let pdf = '%PDF-1.4\n';
const offsets = [0];
for (let i = 0; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  const body = objects[i];
  pdf += `${i + 1} 0 obj\n`;
  pdf += Buffer.isBuffer(body) ? body.toString('latin1') : body;
  pdf += '\nendobj\n';
}
const xref = Buffer.byteLength(pdf, 'latin1');
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
await mkdir('laporan', { recursive: true });
await writeFile('laporan/Laporan Serah Terima API.pdf', Buffer.from(pdf, 'latin1'));
