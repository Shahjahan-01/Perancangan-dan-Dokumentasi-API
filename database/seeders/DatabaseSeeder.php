<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(['email' => 'admin@perpustakaan.test'], [
            'name' => 'Admin Demo',
            'password' => 'BelajarAPI123!',
            'role' => 'admin',
        ]);

        User::updateOrCreate(['email' => 'anggota@perpustakaan.test'], [
            'name' => 'Anggota Demo',
            'password' => 'BelajarAPI123!',
            'role' => 'anggota',
        ]);

        foreach ([
            ['judul' => 'Dasar API', 'penulis' => 'Rafli Maulana', 'genre' => 'Teknologi', 'stok' => 8],
            ['judul' => 'Belajar Laravel', 'penulis' => 'Tim Laravel', 'genre' => 'Teknologi', 'stok' => 3],
            ['judul' => 'Laskar Pelangi', 'penulis' => 'Andrea Hirata', 'genre' => 'Fiksi', 'stok' => 5],
        ] as $book) {
            \App\Models\Book::updateOrCreate(['judul' => $book['judul']], $book);
        }
    }
}
