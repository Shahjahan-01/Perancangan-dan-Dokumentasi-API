<?php

use App\Models\Book;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function apiAdmin(): User
{
    return User::create(['name' => 'Admin Uji', 'email' => 'admin@test.local', 'password' => 'password123', 'role' => 'admin']);
}

function apiMember(): User
{
    return User::create(['name' => 'Anggota Uji', 'email' => 'anggota@test.local', 'password' => 'password123', 'role' => 'anggota']);
}

it('registers and logs in with a bearer token, and rejects bad credentials', function () {
    $this->postJson('/api/register', [
        'name' => 'Nadia', 'email' => 'nadia@example.test', 'password' => 'Belajar123!', 'password_confirmation' => 'Belajar123!',
    ])->assertCreated()->assertJsonPath('data.email', 'nadia@example.test');

    $this->postJson('/api/login', ['email' => 'nadia@example.test', 'password' => 'Belajar123!'])
        ->assertOk()->assertJsonPath('data.token_type', 'Bearer')->assertJsonStructure(['data' => ['token', 'user' => ['id', 'name', 'email', 'role']]]);

    $this->postJson('/api/login', ['email' => 'nadia@example.test', 'password' => 'salah1234'])->assertUnauthorized();
});

it('protects profile and revokes only the current token on logout', function () {
    $user = apiMember();
    Sanctum::actingAs($user);
    $this->getJson('/api/profil')->assertOk()->assertJsonPath('data.role', 'anggota');
    $this->postJson('/api/logout')->assertOk();

    auth()->forgetGuards();
    $this->getJson('/api/profil')->assertUnauthorized();
    $this->getJson('/api/buku')->assertUnauthorized();
});

it('filters and sorts the catalog, returns a stable array, and enforces admin book changes', function () {
    $member = apiMember();
    $admin = apiAdmin();
    Book::create(['judul' => 'Zeta', 'penulis' => 'A', 'genre' => 'Teknologi', 'stok' => 2]);
    Book::create(['judul' => 'Alfa', 'penulis' => 'B', 'genre' => 'Teknologi', 'stok' => 5]);
    Book::create(['judul' => 'Cerita', 'penulis' => 'C', 'genre' => 'Fiksi', 'stok' => 0]);

    Sanctum::actingAs($member);
    $this->getJson('/api/buku?genre=Teknologi&sort=stok&order=desc')->assertOk()->assertJsonPath('data.0.judul', 'Alfa');
    $this->getJson('/api/buku?sort=penulis')->assertUnprocessable();
    $this->postJson('/api/buku', ['judul' => 'X', 'penulis' => 'Y', 'genre' => 'Z', 'stok' => 1])->assertForbidden();
    $this->getJson('/api/buku/9999')->assertNotFound();

    Sanctum::actingAs($admin);
    $this->postJson('/api/buku', ['judul' => 'Buku Baru', 'penulis' => 'Penulis', 'genre' => 'Teknologi', 'stok' => 1])->assertCreated();
    $this->postJson('/api/buku', ['judul' => '', 'penulis' => 'Penulis', 'genre' => 'Teknologi', 'stok' => -1])->assertUnprocessable();
    $book = Book::where('judul', 'Buku Baru')->firstOrFail();
    $this->deleteJson('/api/buku/'.$book->id)->assertNoContent();
    $this->deleteJson('/api/buku/'.$book->id)->assertNotFound();
});

it('records a loan for its owner and deducts stock once', function () {
    $member = apiMember();
    $book = Book::create(['judul' => 'Dasar API', 'penulis' => 'Rafli', 'genre' => 'Teknologi', 'stok' => 3]);
    Sanctum::actingAs($member);

    $payload = [
        'nama_peminjam' => 'Nadia', 'telepon' => '081234567890', 'jatuh_tempo' => now()->addDay()->toDateString(),
        'items' => [['buku_id' => $book->id, 'jumlah' => 2]],
    ];
    $this->postJson('/api/peminjaman', $payload)->assertCreated()->assertJsonPath('data.items.0.judul', 'Dasar API');
    expect($book->fresh()->stok)->toBe(1);
    $this->getJson('/api/peminjaman')->assertOk()->assertJsonCount(1, 'data');

    $payload['items'][0]['jumlah'] = 2;
    $this->postJson('/api/peminjaman', $payload)->assertStatus(409);
    expect($book->fresh()->stok)->toBe(1);
    $this->assertDatabaseCount('peminjamans', 1);

    $payload['items'][0]['jumlah'] = 0;
    $this->postJson('/api/peminjaman', $payload)->assertUnprocessable();
});

it('does not show another member\'s loans', function () {
    $owner = apiMember();
    $other = User::create(['name' => 'Orang Lain', 'email' => 'other@test.local', 'password' => 'password123', 'role' => 'anggota']);
    $book = Book::create(['judul' => 'Buku', 'penulis' => 'A', 'genre' => 'Fiksi', 'stok' => 2]);
    Sanctum::actingAs($owner);
    $this->postJson('/api/peminjaman', [
        'nama_peminjam' => 'Pemilik', 'telepon' => '081234567890', 'jatuh_tempo' => now()->addDay()->toDateString(),
        'items' => [['buku_id' => $book->id, 'jumlah' => 1]],
    ])->assertCreated();

    Sanctum::actingAs($other);
    $this->getJson('/api/peminjaman')->assertOk()->assertJsonCount(0, 'data');
});
