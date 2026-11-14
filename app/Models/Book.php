<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['judul', 'penulis', 'genre', 'stok'])]
class Book extends Model
{
}
