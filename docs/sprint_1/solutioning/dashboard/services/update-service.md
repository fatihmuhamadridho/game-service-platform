# Admin Dashboard - Update Service Interface Agreement

> **Document Type:** IFA / API Contract  
> **Status:** Draft  
> **Service / Domain:** Admin Dashboard — Game Service Management  
> **Consumer / Partner:** JokiHub Admin Dashboard (authorized administrator)

## Design

API memperbarui satu layanan game dari modal edit Admin Services. UI mengirim seluruh field form: game, kategori, nama, harga fixed/custom, estimasi, dan status aktif. API memvalidasi ID serta relasi game/kategori, memastikan kombinasi harga valid, mempertahankan ID dan `createdAt`, memperbarui `updatedAt`, dan mencatat audit. Perubahan katalog tidak menulis ulang snapshot layanan atau harga pada order historis.

## Sequence Diagram

```mermaid
sequenceDiagram
    actor Admin as Administrator
    participant UI as Admin Dashboard UI
    participant API as Game Service Management API
    participant DB as Catalog Database
    participant Audit as Platform Audit Service
    Admin->>UI: Edit layanan dan simpan perubahan
    UI->>API: PUT /api/admin/services/v1/{serviceId} dengan payload penuh dan kredensial
    API->>API: Autentikasi dan otorisasi izin service-update
    alt Tidak terautentikasi atau tidak berizin
        API-->>UI: 400 SRVB01001 / SRVB01002, data null
        UI-->>Admin: Tampilkan pesan akses
    else Berizin
        API->>API: Validasi serviceId, field, dan kombinasi harga
        alt Identifier atau payload tidak valid
            API-->>UI: 400 SRVB02001, data null
            UI-->>Admin: Tampilkan kesalahan field
        else Request valid
            API->>DB: Ambil service; validasi game/kategori dan eligibility status
            alt Service tidak ditemukan atau soft-deleted
                DB-->>API: Service tidak tersedia untuk update
                API-->>UI: 400 SRVB02003, data null
                UI-->>Admin: Tampilkan layanan tidak ditemukan
            else Game/kategori tidak valid atau tidak eligible
                DB-->>API: Parent reference invalid/inactive
                API-->>UI: 400 SRVB02002, data null
                UI-->>Admin: Tampilkan referensi tidak dapat digunakan
            else Referensi valid
                API->>DB: Update game_service secara atomik
                alt Update berhasil
                    DB-->>API: Service terbaru
                    API->>Audit: Catat actor, perubahan field, serviceId, dan timestamp
                    Audit-->>API: Audit tercatat atau diterima sesuai kontrak audit
                    API-->>UI: 200 SRVS00000, data.service
                    UI-->>Admin: Tampilkan konfirmasi dan data terbaru
                else Database gagal
                    DB-->>API: Kegagalan update
                    API-->>UI: 500 SRVT03001, data null
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

| Component          | Value                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Description        | Memperbarui relasi game/kategori, nama, harga, estimasi, dan status layanan.                                                               |
| Resource URL       | `https://{host}/api/admin/services/v1/{serviceId}`                                                                                         |
| Transport Protocol | HTTPS, REST                                                                                                                                |
| Request Verb       | PUT                                                                                                                                        |
| Content Type       | `application/json`                                                                                                                         |
| Interaction Type   | Synchronous                                                                                                                                |
| Security Policy    | Admin authentication dan izin `service-update`. Identity provider dan permission final TBD. Terapkan rate limiting dan audit actor/action. |

### Path / Endpoint

| Section        | Value                                    |
| -------------- | ---------------------------------------- |
| Host / Domain  | `{host}` (environment-specific)          |
| Service Name   | Game Service Management                  |
| Version        | `v1`                                     |
| Resource       | `/admin/services/v1/{serviceId}`         |
| Final Endpoint | `PUT /api/admin/services/v1/{serviceId}` |

### API Versioning

- **Decision:** New Endpoint
- **Previous Endpoint:** Belum ada API update layanan admin yang teridentifikasi pada solutioning sprint ini.
- **Final Endpoint:** `PUT /api/admin/services/v1/{serviceId}`
- **Backward Compatibility:** Belum ada consumer API ini yang teridentifikasi. Penambahan field request opsional bersifat kompatibel; perubahan kontrak yang mematahkan consumer memerlukan major version baru.
- **Reason:** Admin perlu mengubah semua atribut layanan melalui form edit yang mengirim keseluruhan model.

## Business Rules

1. Hanya administrator terautentikasi dengan izin `service-update` yang dapat memperbarui layanan. Role mapping final TBD.
2. `serviceId` adalah ID immutable `game_service.service_id`; body tidak boleh mengubah ID, `createdAt`, `updatedAt`, atau `deletedAt`.
3. Hanya layanan yang ada dan belum soft-deleted dapat diperbarui. Layanan aktif maupun nonaktif dapat diedit.
4. Payload adalah full replacement untuk field form: `gameId`, `categoryId`, `name`, `isCustomPrice`, `priceAmount`, `estimateText`, dan `isActive` wajib dikirim. Penghilangan field bukan instruksi untuk mempertahankan nilai lama.
5. `gameId` dan `categoryId` harus merujuk game dan kategori yang ada serta belum soft-deleted. Layanan aktif hanya boleh menunjuk game dan kategori aktif, mengikuti ERD; aturan mengedit layanan menjadi nonaktif pada parent nonaktif tetap perlu dipastikan.
6. `name` wajib, di-trim, tidak kosong, dan maksimal 150 karakter. ERD belum menetapkan uniqueness scope; update tidak memberlakukan aturan nama unik baru tanpa keputusan product/API owner.
7. Harga fixed membutuhkan `isCustomPrice=false` dan `priceAmount >= 0`. Harga custom membutuhkan `isCustomPrice=true` dan `priceAmount=null`. Kombinasi yang tidak sesuai ditolak.
8. Mata uang mengikuti konfigurasi platform tunggal yang masih perlu dikonfirmasi. Request tidak menerima currency karena kolom currency belum ada pada ERD.
9. `estimateText` wajib, di-trim, dan maksimal 100 karakter. Nilainya adalah teks estimasi, bukan SLA atau jaminan fulfillment.
10. `isActive` menentukan ketersediaan layanan baru pada storefront. Menonaktifkan layanan tidak menghapus order atau referensi historis.
11. Perubahan `gameId`, `categoryId`, nama, harga, atau estimasi hanya memengaruhi katalog untuk pemesanan baru. Snapshot pada order yang sudah dibuat tetap immutable sesuai Order ERD.
12. `updatedAt` ditetapkan service dalam UTC. `createdAt` tetap. Usulan: no-op tidak mengubah timestamp dan tidak menghasilkan audit perubahan.
13. Validasi parent dan update harus atomik terhadap concurrent deactivation/deletion; FK dan transaksi/recheck melindungi integritas.
14. Audit mencatat actor, service ID, perubahan before/after yang relevan, dan waktu. Gunakan pola audit durable platform; detail transaksi/outbox TBD.
15. Update tidak membuat atau menghapus game, kategori, order, payment, maupun data fulfillment.

## Request Headers

| Header          | E/N/T | Type   | M/O/C | Max Length | Description                                                                      | Example                 |
| --------------- | ----- | ------ | ----- | ---------: | -------------------------------------------------------------------------------- | ----------------------- |
| `Authorization` | N     | String | M     |       4096 | Kredensial administrator; skema mengikuti identity provider.                     | `Bearer {access-token}` |
| `Content-Type`  | N     | String | M     |        100 | Format payload.                                                                  | `application/json`      |
| `Accept`        | N     | String | O     |        100 | Tipe media response yang diinginkan; default JSON.                               | `application/json`      |
| `X-Request-Id`  | N     | String | O     |        100 | ID korelasi untuk audit/support; jangan memuat PII.                              | `req-1f56a9`            |
| `If-Match`      | N     | String | O     |        100 | ETag/version untuk optimistic concurrency bila platform mendukung; dukungan TBD. | `W/"v4"`                |

## Request Parameters

| Parameter   | E/N/T | Type          | M/O/C | Max Length | Description                           | Example      |
| ----------- | ----- | ------------- | ----- | ---------: | ------------------------------------- | ------------ |
| `serviceId` | N     | String (path) | M     |         64 | ID immutable layanan yang diperbarui. | `svc_01JXYZ` |

## Request Body

| Attribute       | E/N/T | Type         | M/O/C | Max Length | Description                                           | Example               |
| --------------- | ----- | ------------ | ----- | ---------: | ----------------------------------------------------- | --------------------- |
| `gameId`        | N     | String       | M     |         64 | ID game yang memiliki layanan.                        | `gm_01JXYZ`           |
| `categoryId`    | N     | String       | M     |         64 | ID kategori layanan.                                  | `cat_01JXYZ`          |
| `name`          | N     | String       | M     |        150 | Nama display layanan.                                 | `Top Up 100 Diamonds` |
| `priceAmount`   | N     | Decimal/null | C     |       18,2 | Harga fixed >= 0 atau null untuk custom.              | `30000.00`            |
| `isCustomPrice` | N     | Boolean      | M     |          — | `true` untuk harga custom; `false` untuk harga fixed. | `false`               |
| `estimateText`  | N     | String       | M     |        100 | Estimasi display penyelesaian.                        | `Instan`              |
| `isActive`      | N     | Boolean      | M     |          — | Status publikasi layanan.                             | `true`                |

### Example Request Body

```json
{
  "gameId": "gm_01JXYZ",
  "categoryId": "cat_01JXYZ",
  "name": "Top Up 100 Diamonds",
  "priceAmount": 30000.0,
  "isCustomPrice": false,
  "estimateText": "Instan",
  "isActive": true
}
```

### Request Validation

1. `Authorization` harus mengidentifikasi administrator terautentikasi dengan izin `service-update`. Kembalikan `SRVB01001` bila belum terautentikasi dan `SRVB01002` bila tidak berizin.
2. `serviceId` wajib, tidak kosong, maksimal 64 karakter, dan mengikuti format ID implementasi. Format invalid menghasilkan `SRVB02001`.
3. Body wajib JSON object valid. Tolak field tak dikenal termasuk `id`, `serviceId`, `createdAt`, `updatedAt`, dan `deletedAt` dengan `SRVB02001`.
4. Semua field bisnis wajib hadir. `gameId` dan `categoryId` berupa string non-kosong maksimal 64 karakter; `name` berupa string setelah trim, tidak kosong, maksimal 150 karakter.
5. `priceAmount` harus angka decimal atau `null` sesuai `isCustomPrice`; fixed price >= 0, custom price wajib null. Tolak string numerik, NaN, Infinity, nilai negatif, serta precision/scale lebih dari `18,2`.
6. `isCustomPrice` dan `isActive` wajib boolean JSON. Nilai string seperti `"true"` tidak diterima.
7. `estimateText` wajib string setelah trim, tidak kosong, dan maksimal 100 karakter.
8. `gameId` dan `categoryId` harus menunjuk record yang ada dan belum soft-deleted. Jika `isActive=true`, game dan kategori harus aktif. Referensi tidak valid/tidak eligible menghasilkan `SRVB02002`.
9. `serviceId` valid tetapi layanan tidak ditemukan atau soft-deleted menghasilkan `SRVB02003`.
10. Bila `If-Match` digunakan, mismatch terhadap versi terbaru tidak boleh menimpa perubahan concurrent; kode dan HTTP mapping konflik perlu diselaraskan dengan API standard.
11. Tolak query parameter yang tidak didefinisikan. Kegagalan database saat update mengembalikan HTTP 500 `SRVT03001` tanpa detail internal.

## Response Body

Semua response menggunakan envelope `status` dan `data`. Error mengembalikan `data: null`.

| Attribute                    | E/N/T | Type               | M/O/C | Max Length | Description                           | Example                |
| ---------------------------- | ----- | ------------------ | ----- | ---------: | ------------------------------------- | ---------------------- |
| `status`                     | N     | Object             | M     |          — | Object status response.               | `{}`                   |
| `status.code`                | N     | String             | M     |         20 | Service status code.                  | `SRVS00000`            |
| `status.message`             | N     | String             | O     |        200 | Pesan hasil untuk consumer.           | `Service updated`      |
| `data`                       | N     | Object/null        | M     |          — | Payload hasil; `null` ketika error.   | `{}`                   |
| `data.service`               | N     | Object             | M     |          — | Layanan setelah update.               | `{}`                   |
| `data.service.id`            | N     | String             | M     |         64 | ID layanan yang tetap.                | `svc_01JXYZ`           |
| `data.service.gameId`        | N     | String             | M     |         64 | ID game terbaru.                      | `gm_01JXYZ`            |
| `data.service.gameName`      | N     | String             | M     |        100 | Nama game hasil projection.           | `Mobile Legends`       |
| `data.service.categoryId`    | N     | String             | M     |         64 | ID kategori terbaru.                  | `cat_01JXYZ`           |
| `data.service.categoryName`  | N     | String             | M     |        100 | Nama kategori hasil projection.       | `Top Up`               |
| `data.service.name`          | N     | String             | M     |        150 | Nama layanan terbaru.                 | `Top Up 100 Diamonds`  |
| `data.service.priceAmount`   | N     | Decimal/null       | C     |       18,2 | Harga terbaru atau null untuk custom. | `30000.00`             |
| `data.service.isCustomPrice` | N     | Boolean            | M     |          — | Status custom pricing.                | `false`                |
| `data.service.estimateText`  | N     | String             | M     |        100 | Estimasi terbaru.                     | `Instan`               |
| `data.service.isActive`      | N     | Boolean            | M     |          — | Status aktif terbaru.                 | `true`                 |
| `data.service.createdAt`     | N     | String (date-time) | M     |         35 | Waktu pembuatan awal, tidak berubah.  | `2026-10-10T08:00:00Z` |
| `data.service.updatedAt`     | N     | String (date-time) | M     |         35 | Waktu update UTC.                     | `2026-10-11T10:20:00Z` |

### Success Example

```json
{
  "status": {
    "code": "SRVS00000",
    "message": "Service updated"
  },
  "data": {
    "service": {
      "id": "svc_01JXYZ",
      "gameId": "gm_01JXYZ",
      "gameName": "Mobile Legends",
      "categoryId": "cat_01JXYZ",
      "categoryName": "Top Up",
      "name": "Top Up 100 Diamonds",
      "priceAmount": 30000.0,
      "isCustomPrice": false,
      "estimateText": "Instan",
      "isActive": true,
      "createdAt": "2026-10-10T08:00:00Z",
      "updatedAt": "2026-10-11T10:20:00Z"
    }
  }
}
```

### Business Error Example

```json
{
  "status": {
    "code": "SRVB02002",
    "message": "Game or category is unavailable for this service"
  },
  "data": null
}
```

### Technical Error Example

```json
{
  "status": {
    "code": "SRVT03001",
    "message": "Service catalog is temporarily unavailable"
  },
  "data": null
}
```

## HTTP Status Codes

| HTTP Status | Usage                                                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `200`       | Layanan berhasil diperbarui sesuai baseline IFA project.                                                                              |
| `400`       | Identifier/payload/reference tidak valid atau akses admin ditolak sesuai baseline response project. Konfirmasi auth-specific mapping. |
| `500`       | Kegagalan service atau database yang tidak terduga.                                                                                   |

## Service Status Codes

Format: `[Service Prefix][Status Type][Category][Specific Error Code]`

| Code        | Type      | Category        | Meaning                                                           |
| ----------- | --------- | --------------- | ----------------------------------------------------------------- |
| `SRVS00000` | Success   | General         | Layanan berhasil diperbarui.                                      |
| `SRVB01001` | Business  | Authentication  | Administrator belum terautentikasi.                               |
| `SRVB01002` | Business  | Authentication  | Administrator tidak memiliki izin update layanan.                 |
| `SRVB02001` | Business  | User validation | Identifier atau payload tidak valid.                              |
| `SRVB02002` | Business  | User validation | Game/kategori tidak ditemukan, soft-deleted, atau tidak eligible. |
| `SRVB02003` | Business  | User validation | Layanan tidak ditemukan atau soft-deleted.                        |
| `SRVT03001` | Technical | Database        | Layanan gagal diperbarui atau database tidak tersedia.            |

## API Exposure Classification

| Classification                 | Rationale                                                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise Intranet (proposed) | Operasi tulis katalog admin. Jika endpoint dapat diakses dari internet, klasifikasikan sebagai Public dan terapkan proteksi API publik. |

## Testing & Documentation Scope

| Scope      | Required | Rationale / Handoff                                                                                                                                                                                              |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFT        | Yes      | API update admin baru. Uji update setiap field, fixed/custom price, parent aktif/nonaktif/deleted, perubahan relasi, no-op, concurrency, serta persistence. VUser, CPU/memory, target TPS TBD menunggu forecast. |
| VA/Pentest | Yes      | Uji authentication/authorization, IDOR, mass assignment, validasi referensi, race condition, audit attribution, dan pastikan snapshot order lama tidak berubah.                                                  |

## Assumptions

- Endpoint, response envelope, permission, dan prefix `SRV` mengikuti usulan pada [Create Service](./create-service.md); belum ada backend contract yang disetujui.
- `PUT` dipakai karena modal edit mengirim seluruh field. Penggunaan `PATCH` memerlukan semantik omission/null yang berbeda.
- ERD belum menetapkan name uniqueness, currency schema, atau aturan update ke parent inactive; keputusan product/API owner diperlukan.
- Flag `isCustomPrice` merupakan field eksplisit pada proposed persistence model; UI saat ini merepresentasikannya sebagai `price === null`.
- Audit mechanism, optimistic concurrency/ETag, identity provider, role mapping, auth HTTP mapping, database engine, dan SLA TBD.

## References

- `../../erd/service-erd.md` — field layanan, harga, relasi, lifecycle, dan order snapshot rule.
- `../../erd/game-erd.md` — status dan lifecycle game.
- `../../erd/service-category-erd.md` — status dan lifecycle kategori.
- `./create-service.md` — kontrak create dan validasi service baseline.
- `src/features/AdminServices/views/interfaces/admin-service.interface.ts` — field layanan pada UI.
- `src/features/AdminServices/views/templates/AdminServices.template.tsx` — form edit, harga custom, estimasi, status, dan relasi.
- `src/features/AdminServices/views/pages/AdminServices.page.tsx` — alur edit form dan mock behavior.
- `../../erd/order-erd.md` — snapshot transaksi/order yang tidak boleh berubah saat katalog diperbarui.
