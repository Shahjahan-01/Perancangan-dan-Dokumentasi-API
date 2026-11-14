<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('judul', 150);
            $table->string('penulis', 100);
            $table->string('genre', 60);
            $table->unsignedInteger('stok')->default(0);
            $table->timestamps();
            $table->index('genre');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
