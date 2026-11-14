<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Peminjaman;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PeminjamanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $loans = Peminjaman::with('items:id,peminjaman_id,buku_id,judul,jumlah')
            ->where('user_id', $request->user()->id)
            ->latest('id')
            ->get(['id', 'nama_peminjam', 'jatuh_tempo', 'created_at']);

        return response()->json(['data' => $loans]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama_peminjam' => ['required', 'string', 'max:100'],
            'telepon' => ['required', 'string', 'max:20'],
            'jatuh_tempo' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.buku_id' => ['required', 'integer', 'distinct', 'exists:books,id'],
            'items.*.jumlah' => ['required', 'integer', 'min:1', 'max:1000'],
        ]);

        $loan = DB::transaction(function () use ($request, $data) {
            $requested = collect($data['items'])->keyBy('buku_id');
            $books = Book::whereIn('id', $requested->keys())->orderBy('id')->lockForUpdate()->get()->keyBy('id');

            foreach ($requested as $bookId => $item) {
                if ($books[$bookId]->stok < $item['jumlah']) {
                    return null;
                }
            }

            $loan = Peminjaman::create([
                'user_id' => $request->user()->id,
                'nama_peminjam' => $data['nama_peminjam'],
                'telepon' => $data['telepon'],
                'jatuh_tempo' => $data['jatuh_tempo'],
            ]);

            foreach ($requested as $bookId => $item) {
                $book = $books[$bookId];
                $book->decrement('stok', $item['jumlah']);
                $loan->items()->create([
                    'buku_id' => $book->id,
                    'judul' => $book->judul,
                    'jumlah' => $item['jumlah'],
                ]);
            }

            return $loan->load('items:id,peminjaman_id,buku_id,judul,jumlah');
        });

        if (! $loan) {
            return response()->json(['message' => 'Stok berubah atau tidak mencukupi; tidak ada peminjaman yang disimpan.'], 409);
        }

        return response()->json(['message' => 'Peminjaman berhasil.', 'data' => $loan], 201);
    }
}
