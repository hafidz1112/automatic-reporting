# Dokumentasi API: Login Kasir

Dokumen ini berisi spesifikasi API untuk proses otentikasi (login) sebagai kasir.

## Informasi Dasar

- **URL Endpoint:** `/api/v1/auth/login/cashier`
- **Metode HTTP:** `POST`
- **Content-Type:** `application/json`
- **Deskripsi:** Endpoint ini digunakan untuk mengautentikasi pengguna dengan peran kasir dan mengembalikan token akses (misalnya JWT) yang akan digunakan untuk permintaan API selanjutnya.

---

## Request (Permintaan)

Kirimkan data berikut di dalam *body* permintaan menggunakan format JSON.

### Request Body (JSON)

| Parameter | Tipe Data | Wajib | Deskripsi |
| :--- | :--- | :--- | :--- |
| `username` | `string` | Ya | Username, ID pegawai, atau email kasir. |
| `password` | `string` | Ya | Kata sandi untuk akun kasir tersebut. |

### Contoh Request

```json
{
  "username": "kasir_budi",
  "password": "passwordAman123"
}
```

---

## Response (Balasan)

### 1. Berhasil Login (HTTP Status: `200 OK`)

Dikembalikan ketika kombinasi username dan password valid.

```json
{
  "status": "success",
  "message": "Login berhasil.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...",
    "user": {
      "id": "USR-987654321",
      "name": "Budi Santoso",
      "username": "kasir_budi",
      "role": "cashier",
      "branch_id": "BRC-001"
    }
  }
}
```

### 2. Gagal Login - Kredensial Salah (HTTP Status: `401 Unauthorized`)

Dikembalikan ketika username tidak ditemukan atau password salah.

```json
{
  "status": "error",
  "message": "Username atau kata sandi salah."
}
```

### 3. Gagal Login - Data Tidak Lengkap (HTTP Status: `400 Bad Request`)

Dikembalikan jika tidak mengirimkan `username` atau `password` pada *body* request.

```json
{
  "status": "error",
  "message": "Username dan password wajib diisi.",
  "errors": {
    "username": "Username tidak boleh kosong.",
    "password": "Password tidak boleh kosong."
  }
}
```

### 4. Gagal Login - Akun Nonaktif/Diblokir (HTTP Status: `403 Forbidden`)

Dikembalikan jika akun kasir dinonaktifkan oleh admin.

```json
{
  "status": "error",
  "message": "Akun Anda telah dinonaktifkan. Silakan hubungi administrator."
}
```

---

## Catatan Tambahan

1. **Keamanan:** Pastikan API ini selalu diakses melalui koneksi yang aman (HTTPS/SSL).
2. **Penggunaan Token:** Token yang didapat dari *response* sukses (dalam `data.token`) harus disertakan pada HTTP Header `Authorization: Bearer <token>` untuk setiap permintaan ke endpoint lain yang membutuhkan autentikasi.
3. **CORS:** Jika aplikasi klien (frontend) berjalan di domain yang berbeda dengan server API, pastikan server telah dikonfigurasi untuk mengizinkan (CORS) dari domain aplikasi klien.
