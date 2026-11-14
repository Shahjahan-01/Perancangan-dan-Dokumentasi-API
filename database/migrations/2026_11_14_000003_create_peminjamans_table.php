<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('peminjamans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama_peminjam', 100);
            $table->string('telepon', 20);
            $table->date('jatuh_tempo');
            $table->timestamps();
        });

        Schema::create('peminjaman_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('peminjaman_id')->constrained('peminjamans')->cascadeOnDelete();
            $table->foreignId('buku_id')->nullable()->constrained('books')->nullOnDelete();
            $table->string('judul', 150);
            $table->unsignedInteger('jumlah');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peminjaman_items');
        Schema::dropIfExists('peminjamans');
    }
};
