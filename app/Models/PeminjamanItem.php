<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['peminjaman_id', 'buku_id', 'judul', 'jumlah'])]
class PeminjamanItem extends Model
{
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class, 'buku_id');
    }
}
