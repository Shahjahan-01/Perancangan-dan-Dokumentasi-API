<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\PeminjamanController;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profil', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/buku', [BookController::class, 'index']);
    Route::get('/buku/{book}', [BookController::class, 'show'])->whereNumber('book');
    Route::post('/buku', [BookController::class, 'store']);
    Route::delete('/buku/{book}', [BookController::class, 'destroy'])->whereNumber('book');
    Route::get('/peminjaman', [PeminjamanController::class, 'index']);
    Route::post('/peminjaman', [PeminjamanController::class, 'store']);
});
