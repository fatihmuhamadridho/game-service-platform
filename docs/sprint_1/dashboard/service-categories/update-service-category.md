# Admin Dashboard - Update Service Category Interface Agreement

> **Document Type:** IFA / API Contract  
> **Status:** Draft  
> **Service / Domain:** Admin Dashboard — Service Category Management  
> **Consumer / Partner:** JokiHub Admin Dashboard (authorized administrator)

## Design

API memperbarui atribut satu kategori layanan dari modal edit Admin Service Categories. UI mengirim seluruh form: nama, slug, deskripsi, dan status aktif. API mempertahankan ID dan waktu pembuatan, memperbarui `updatedAt`, memvalidasi keunikan, dan mencatat audit perubahan. Perubahan kategori tidak otomatis mengubah layanan yang terhubung.

## Sequence Diagram

```mermaid
sequenceDiagram
    actor Admin as Administrator
    participant UI as Admin Dashboard UI
    participant API as Service Category Management API
    participant DB as Catalog Database
    participant Audit as Platform Audit Service
    Admin->>UI: Edit kategori dan simpan perubahan
    UI->>API: PUT /api/admin/service-categories/v1/{categoryId} dengan payload penuh dan kredensial
    API->>API: Autentikasi dan otorisasi izin service-category-update
    alt Tidak terautentikasi atau tidak berizin
        API-->>UI: 400 SCAB01001 / SCAB01002, data null
        UI-->>Admin: Tampilkan pesan akses
    else Berizin
        API->>API: Validasi categoryId dan payload, normalisasi field
        alt Identifier atau payload tidak valid
            API-->>UI: 400 SCAB02001, data null
            UI-->>Admin: Tampilkan kesalahan field
        else Request valid
            API->>DB: Ambil kategori dan cek duplikasi name/slug selain kategori ini
            alt Kategori tidak ditemukan atau soft-deleted
                DB-->>API: Tidak ada kategori yang dapat diperbarui
                API-->>UI: 400 SCAB02003, data null
                UI-->>Admin: Tampilkan kategori tidak ditemukan
            else Nama atau slug dipakai kategori lain
                DB-->>API: Unique conflict
                API-->>UI: 400 SCAB02002, data null
                UI-->>Admin: Tampilkan konflik nama atau slug
            else Data valid dan unik
                API->>DB: Update kategori secara transaksional
                alt Update berhasil
                    DB-->>API: Kategori terbarui
                    API->>Audit: Catat actor, perubahan field, categoryId, dan timestamp
                    Audit-->>API: Audit tercatat atau diterima sesuai kontrak audit
                    API-->>UI: 200 SCAS00000, data.category
                    UI-->>Admin: Tampilkan konfirmasi dan data terbaru
                else Database gagal
                    DB-->>API: Kegagalan update
                    API-->>UI: 500 SCAT03001, data null
                    UI-->>Admin: Tampilkan kegagalan dan opsi coba lagi
                end
            end
        end
    end
```

## Performance / SLA Targets

| Success Rate                                        | VUser                                   | CPU / Memory                             | Response Time                                                                        |
| --------------------------------------------------- | --------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| TBD; konfirmasi criticality dan availability target | TBD; konfirmasi concurrent admin puncak | TBD; tetapkan dari capacity estimate/NFT | TBD; usulan baseline web non-kritis: ideal 200 ms, acceptable 1 s, max tolerable 2 s |

## General Information

| Component          | Value                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Description        | Memperbarui nama, slug, deskripsi, dan status kategori layanan.                                                                                     |
| Resource URL       | `https://{host}/api/admin/service-categories/v1/{categoryId}`                                                                                       |
| Transport Protocol | HTTPS, REST                                                                                                                                         |
| Request Verb       | PUT                                                                                                                                                 |
| Content Type       | `application/json`                                                                                                                                  |
| Interaction Type   | Synchronous                                                                                                                                         |
| Security Policy    | Admin authentication dan izin `service-category-update`. Identity provider dan permission final TBD. Terapkan rate limiting dan audit actor/action. |

### Path / Endpoint

| Section        | Value                                               |
| -------------- | --------------------------------------------------- |
| Host / Domain  | `{host}` (environment-specific)                     |
| Service Name   | Service Category Management                         |
| Version        | `v1`                                                |
| Resource       | `/admin/service-categories/v1/{categoryId}`         |
| Final Endpoint | `PUT /api/admin/service-categories/v1/{categoryId}` |

### API Versioning

- **Decision:** New Endpoint
- **Previous Endpoint:** Belum ada endpoint update kategori yang teridentifikasi pada solutioning sprint ini.
- **Final Endpoint:** `PUT /api/admin/service-categories/v1/{categoryId}`
- **Backward Compatibility:** Belum ada consumer API ini yang teridentifikasi. Penambahan field request opsional bersifat kompatibel; perubahan kontrak yang mematahkan consumer memerlukan major version baru.
- **Reason:** Admin perlu mengubah atribut kategori yang sudah tersimpan. `PUT` dipilih karena UI edit mengirim seluruh field form, bukan patch parsial.

## Business Rules

1. Hanya administrator terautentikasi dengan izin `service-category-update` yang dapat memperbarui kategori. Role mapping final TBD.
2. `categoryId` adalah ID immutable pada `service_category.category_id`; body tidak boleh mengganti ID.
3. Hanya kategori yang ada dan belum soft-deleted yang dapat diperbarui. Kategori aktif maupun nonaktif dapat diedit.
4. Payload adalah full replacement untuk field bisnis yang dikelola form: `name`, `slug`, `description`, dan `isActive` semuanya wajib dikirim. `createdAt`, `updatedAt`, `deletedAt`, dan `serviceCount` tidak dapat diubah melalui request.
5. `name` disimpan setelah trim dan unik case-insensitive setelah normalisasi di antara kategori non-deleted, tidak termasuk kategori target itu sendiri.
6. `slug` disimpan lowercase setelah trim, harus mengikuti format URL-safe, dan unik di antara kategori non-deleted selain target. Slug boleh berubah; dampak link/storefront perlu dimitigasi oleh pemilik produk sebelum slug kategori dipakai sebagai URL permanen.
7. Nama atau slug yang sama dengan kategori lain menghasilkan konflik `SCAB02002`; tidak ada kategori lain yang ditimpa.
8. `description` boleh `null` atau string; whitespace-only dinormalisasi menjadi `null`, panjang maksimal usulan 500 karakter.
9. `isActive=false` menghentikan ketersediaan kategori untuk assignment/publikasi baru. Layanan yang sudah terkait tidak otomatis dinonaktifkan atau dipindahkan; referensi tetap ada sesuai ERD.
10. `updatedAt` ditetapkan service menggunakan waktu UTC saat perubahan tersimpan. `createdAt` tetap.
11. Update tanpa perubahan nilai tetap sukses; implementasi boleh mempertahankan `updatedAt` atau memperbaruinya sesuai kebijakan audit. Usulan: perbarui timestamp dan catat audit hanya bila ada field yang berubah.
12. Update dan validasi uniqueness harus atomik; database unique constraints menjadi proteksi akhir terhadap concurrent writes.
13. Audit merekam actor, kategori, nilai field yang berubah (tanpa data sensitif), dan waktu. Bila audit platform asynchronous, gunakan mekanisme durable yang disetujui agar perubahan tidak kehilangan event audit.
14. Endpoint tidak mengubah nama snapshot layanan atau riwayat order; order memakai snapshot transaksi sendiri.

## Request Headers

| Header          | E/N/T | Type   | M/O/C | Max Length | Description                                                                                 | Example                 |
| --------------- | ----- | ------ | ----- | ---------: | ------------------------------------------------------------------------------------------- | ----------------------- |
| `Authorization` | N     | String | M     |       4096 | Kredensial administrator; skema mengikuti identity provider.                                | `Bearer {access-token}` |
| `Content-Type`  | N     | String | M     |        100 | Format payload.                                                                             | `application/json`      |
| `Accept`        | N     | String | O     |        100 | Tipe media response yang diinginkan; default JSON.                                          | `application/json`      |
| `X-Request-Id`  | N     | String | O     |        100 | ID korelasi untuk audit/support; jangan memuat PII.                                         | `req-6a71d4`            |
| `If-Match`      | N     | String | O     |        100 | ETag/version untuk optimistic concurrency bila mekanisme versioning tersedia; dukungan TBD. | `W/"v3"`                |

## Request Parameters

| Parameter    | E/N/T | Type          | M/O/C | Max Length | Description                            | Example      |
| ------------ | ----- | ------------- | ----- | ---------: | -------------------------------------- | ------------ |
| `categoryId` | N     | String (path) | M     |         64 | ID immutable kategori yang diperbarui. | `cat_01JXYZ` |

## Request Body

| Attribute     | E/N/T | Type        | M/O/C | Max Length | Description                                        | Example                        |
| ------------- | ----- | ----------- | ----- | ---------: | -------------------------------------------------- | ------------------------------ |
| `name`        | N     | String      | M     |        100 | Nama kategori setelah trim.                        | `Top Up Game`                  |
| `slug`        | N     | String      | M     |        100 | Slug lowercase URL-safe.                           | `top-up-game`                  |
| `description` | N     | String/null | M     |        500 | Deskripsi; kirim `null` untuk menghapus deskripsi. | `Layanan pengisian saldo game` |
| `isActive`    | N     | Boolean     | M     |          — | Status aktif kategori.                             | `true`                         |

### Example Request Body

```json
{
  "name": "Top Up Game",
  "slug": "top-up-game",
  "description": "Layanan pengisian saldo game",
  "isActive": true
}
```

### Request Validation

1. `Authorization` harus mengidentifikasi administrator terautentikasi dengan izin `service-category-update`. Kembalikan `SCAB01001` bila belum terautentikasi dan `SCAB01002` bila tidak berizin.
2. `categoryId` wajib, tidak kosong, maksimal 64 karakter, dan mengikuti format ID yang ditetapkan implementasi. Format invalid menghasilkan `SCAB02001`.
3. Body wajib berupa JSON object valid. Tolak field yang tidak dikenal termasuk `id`, `categoryId`, `createdAt`, `updatedAt`, `deletedAt`, dan `serviceCount` dengan `SCAB02001`.
4. `name` wajib string, trim sebelum simpan, tidak boleh kosong setelah trim, dan maksimal 100 karakter.
5. `slug` wajib string, trim dan lowercase sebelum validasi, maksimal 100 karakter, serta harus cocok dengan `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
6. `description` wajib hadir dan harus string atau `null`; trim string, normalisasi kosong menjadi `null`, maksimal 500 karakter.
7. `isActive` wajib berupa boolean JSON; string seperti `"true"` tidak diterima.
8. `name` atau `slug` duplikat pada kategori non-deleted lain menghasilkan `SCAB02002`.
9. `categoryId` valid tetapi record tidak ada atau soft-deleted menghasilkan `SCAB02003`.
10. Jika `If-Match` didukung, nilai yang tidak cocok dengan versi terkini harus gagal tanpa menimpa perubahan terbaru; kode konflik/versioning response perlu diselaraskan dengan API standard sebelum implementasi.
11. Query parameter yang tidak didefinisikan ditolak. Kegagalan database menghasilkan HTTP 500 `SCAT03001` tanpa detail internal.

## Response Body

Semua response menggunakan envelope `status` dan `data`. Error mengembalikan `data: null`.

| Attribute                    | E/N/T | Type               | M/O/C | Max Length | Description                                                         | Example                        |
| ---------------------------- | ----- | ------------------ | ----- | ---------: | ------------------------------------------------------------------- | ------------------------------ |
| `status`                     | N     | Object             | M     |          — | Object status response.                                             | `{}`                           |
| `status.code`                | N     | String             | M     |         20 | Service status code.                                                | `SCAS00000`                    |
| `status.message`             | N     | String             | O     |        200 | Pesan hasil untuk consumer.                                         | `Service category updated`     |
| `data`                       | N     | Object/null        | M     |          — | Payload hasil; `null` ketika error.                                 | `{}`                           |
| `data.category`              | N     | Object             | M     |          — | Kategori setelah update.                                            | `{}`                           |
| `data.category.id`           | N     | String             | M     |         64 | ID kategori yang tidak berubah.                                     | `cat_01JXYZ`                   |
| `data.category.name`         | N     | String             | M     |        100 | Nama kategori terbaru.                                              | `Top Up Game`                  |
| `data.category.slug`         | N     | String             | M     |        100 | Slug terbaru.                                                       | `top-up-game`                  |
| `data.category.description`  | N     | String/null        | O     |        500 | Deskripsi terbaru.                                                  | `Layanan pengisian saldo game` |
| `data.category.isActive`     | N     | Boolean            | M     |          — | Status aktif terbaru.                                               | `true`                         |
| `data.category.serviceCount` | N     | Integer            | M     |  10 digits | Jumlah layanan terhubung; read-only dan tidak diubah oleh endpoint. | `3`                            |
| `data.category.createdAt`    | N     | String (date-time) | M     |         35 | Waktu pembuatan awal yang tetap.                                    | `2026-10-10T07:00:00Z`         |
| `data.category.updatedAt`    | N     | String (date-time) | M     |         35 | Waktu update UTC.                                                   | `2026-10-11T09:20:00Z`         |

### Success Example

```json
{
  "status": {
    "code": "SCAS00000",
    "message": "Service category updated"
  },
  "data": {
    "category": {
      "id": "cat_01JXYZ",
      "name": "Top Up Game",
      "slug": "top-up-game",
      "description": "Layanan pengisian saldo game",
      "isActive": true,
      "serviceCount": 3,
      "createdAt": "2026-10-10T07:00:00Z",
      "updatedAt": "2026-10-11T09:20:00Z"
    }
  }
}
```

### Business Error Example

```json
{
  "status": {
    "code": "SCAB02002",
    "message": "Service category name or slug already exists"
  },
  "data": null
}
```

### Technical Error Example

```json
{
  "status": {
    "code": "SCAT03001",
    "message": "Service category data is temporarily unavailable"
  },
  "data": null
}
```

## HTTP Status Codes

| HTTP Status | Usage                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200`       | Kategori berhasil diperbarui sesuai baseline IFA project.                                                                                                                  |
| `400`       | Payload/identifier tidak valid, akses admin ditolak sesuai baseline response project, kategori tidak ditemukan, atau nama/slug duplikat. Konfirmasi auth-specific mapping. |
| `500`       | Kegagalan service atau database yang tidak terduga.                                                                                                                        |

## Service Status Codes

Format: `[Service Prefix][Status Type][Category][Specific Error Code]`

| Code        | Type      | Category        | Meaning                                                 |
| ----------- | --------- | --------------- | ------------------------------------------------------- |
| `SCAS00000` | Success   | General         | Kategori layanan berhasil diperbarui.                   |
| `SCAB01001` | Business  | Authentication  | Administrator belum terautentikasi.                     |
| `SCAB01002` | Business  | Authentication  | Administrator tidak memiliki izin update kategori.      |
| `SCAB02001` | Business  | User validation | Identifier atau payload tidak valid.                    |
| `SCAB02002` | Business  | User validation | Nama atau slug sudah digunakan kategori lain.           |
| `SCAB02003` | Business  | User validation | Kategori tidak ditemukan atau soft-deleted.             |
| `SCAT03001` | Technical | Database        | Kategori gagal diperbarui atau database tidak tersedia. |

## API Exposure Classification

| Classification                 | Rationale                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise Intranet (proposed) | Operasi tulis admin untuk katalog. Jika endpoint dapat diakses dari internet, klasifikasikan sebagai Public dan terapkan proteksi API publik. |

## Testing & Documentation Scope

| Scope      | Required | Rationale / Handoff                                                                                                                                                                                                              |
| ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFT        | Yes      | API update admin baru. Uji perubahan tiap field, no-op, perubahan status, perubahan slug, duplicate check concurrent, referensi layanan tetap utuh, dan persistence. VUser, CPU/memory, serta target TPS TBD mengikuti forecast. |
| VA/Pentest | Yes      | Verifikasi authentication/authorization, IDOR, mass assignment, race condition uniqueness, input validation, audit attribution, serta tidak ada perubahan ke layanan/order snapshot.                                             |

## Assumptions

- Endpoint, permission, response envelope, status code, dan field mapping adalah proposal karena backend category API belum didefinisikan.
- `PUT` mewakili full update; seluruh field form wajib hadir. Jika API standard memakai `PATCH`, kontrak harus berubah menjadi partial update dengan semantik field omission yang eksplisit.
- Name uniqueness, slug uniqueness, slug format, dan batas field mengikuti draft ERD. Unique constraints database menjadi sumber final untuk concurrency.
- Slug dapat diubah dari modal edit; redirect/compatibility untuk URL lama perlu diputuskan bila slug digunakan storefront.
- Audit menggunakan platform audit service. Transaksi/outbox, gagal audit, dan audit retention TBD.
- Optimistic concurrency melalui `If-Match` opsional dan belum diimplementasikan sampai API platform menetapkan ETag/version policy.
- HTTP auth mapping, rate limit, identity provider, role mapping, database engine, serta SLA TBD.

## References

- `../../erd/service-category-erd.md` — atribut kategori, uniqueness, relasi layanan, dan audit proposal.
- `./create-service-category.md` — aturan create, normalisasi, dan kode layanan kategori.
- `./get-detail-service-category.md` — field detail kategori.
- `src/features/AdminServiceCategories/views/interfaces/admin-service-category.interface.ts` — model kategori dan form update.
- `src/features/AdminServiceCategories/views/templates/AdminServiceCategories.template.tsx` — modal edit, slug handling, description, dan active toggle.
