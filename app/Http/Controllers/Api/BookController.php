<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'genre' => ['sometimes', 'string', 'max:60'],
            'sort' => ['sometimes', Rule::in(['judul', 'stok'])],
            'order' => ['sometimes', Rule::in(['asc', 'desc'])],
        ]);

        $books = Book::query()
            ->when($filters['genre'] ?? null, fn ($query, $genre) => $query->where('genre', $genre))
            ->orderBy($filters['sort'] ?? 'judul', $filters['order'] ?? 'asc')
            ->get(['id', 'judul', 'penulis', 'genre', 'stok']);

        return response()->json(['data' => $books]);
    }

    public function show(Book $book): JsonResponse
    {
        return response()->json(['data' => $book->only(['id', 'judul', 'penulis', 'genre', 'stok'])]);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403, 'Hanya admin yang dapat menambah buku.');

        $data = $request->validate([
            'judul' => ['required', 'string', 'max:150'],
            'penulis' => ['required', 'string', 'max:100'],
            'genre' => ['required', 'string', 'max:60'],
            'stok' => ['required', 'integer', 'min:0', 'max:100000'],
        ]);
        $book = Book::create($data);

        return response()->json(['message' => 'Buku berhasil ditambahkan.', 'data' => $book], 201);
    }

    public function destroy(Request $request, Book $book): JsonResponse
    {
        abort_unless($request->user()->role === 'admin', 403, 'Hanya admin yang dapat menghapus buku.');
        $book->delete();

        return response()->json(null, 204);
    }
}
