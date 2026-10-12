# Admin Dashboard - Get Service Detail Interface Agreement

> **Document Type:** IFA / API Contract  
> **Status:** Draft  
> **Service / Domain:** Admin Dashboard — Game Service Management  
> **Consumer / Partner:** JokiHub Admin Dashboard (authorized administrator)

## Design

API mengambil detail satu layanan game berdasarkan `serviceId` untuk dilihat atau diedit admin. Response mencakup atribut layanan, harga fixed/custom, estimasi, status, serta relasi game dan kategori. Data bersumber dari `game_service` dan projection parent catalog sesuai [Service ERD](../../erd/service-erd.md). UI saat ini hanya memiliki tabel dan modal edit berbasis mock; kontrak ini menyediakan data persisted untuk menggantikan mock.

## Sequence Diagram

```mermaid
sequenceDiagram
    actor Admin as Administrator
    participant UI as Admin Dashboard UI
    participant API as Game Service Management API
    participant DB as Catalog Database
    Admin->>UI: Buka detail atau edit layanan
    UI->>API: GET /api/admin/services/v1/{serviceId}
    API->>API: Autentikasi dan otorisasi izin service-read
    alt Tidak terautentikasi atau tidak berizin
        API-->>UI: 400 SRVB01001 / SRVB01002, data null
        UI-->>Admin: Tampilkan pesan akses
    else Berizin
        API->>API: Validasi serviceId
        alt Identifier tidak valid
            API-->>UI: 400 SRVB02001, data null
            UI-->>Admin: Tampilkan identifier tidak valid
        else Identifier valid
            API->>DB: Ambil service non-deleted beserta game dan kategori
            alt Service tidak ditemukan atau soft-deleted
                DB-->>API: Tidak ada service yang dapat dibaca
                API-->>UI: 400 SRVB02002, data null
                UI-->>Admin: Tampilkan layanan tidak ditemukan
            else Query berhasil
                DB-->>API: Service detail dan parent projections
                API-->>UI: 200 SRVS00000, data.service
                UI-->>Admin: Tampilkan detail/edit form
            else Database gagal
                DB-->>API: Kegagalan baca katalog
                API-->>UI: 500 SRVT03001, data null
                UI-->>Admin: Tampilkan kegagalan dan opsi coba lagi
            end
        end
    end
```

## Performance / SLA Targets

| Success Rate                                        | VUser                                   | CPU / Memory                             | Response Time                                                                        |
| --------------------------------------------------- | --------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| TBD; konfirmasi criticality dan availability target | TBD; konfirmasi concurrent admin puncak | TBD; tetapkan dari capacity estimate/NFT | TBD; usulan baseline web non-kritis: ideal 200 ms, acceptable 1 s, max tolerable 2 s |

## General Information

| Component          | Value                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Description        | Mengambil satu layanan beserta relasi game/kategori untuk detail dan form edit Admin Dashboard.                                                    |
| Resource URL       | `https://{host}/api/admin/services/v1/{serviceId}`                                                                                                 |
| Transport Protocol | HTTPS, REST                                                                                                                                        |
| Request Verb       | GET                                                                                                                                                |
| Content Type       | `application/json` response; GET tidak memiliki request body.                                                                                      |
| Interaction Type   | Synchronous                                                                                                                                        |
| Security Policy    | Admin authentication dan izin `service-read`. Identity provider dan permission final TBD. Terapkan rate limiting dan audit akses sesuai kebijakan. |

### Path / Endpoint

| Section        | Value                                    |
| -------------- | ---------------------------------------- |
| Host / Domain  | `{host}` (environment-specific)          |
| Service Name   | Game Service Management                  |
| Version        | `v1`                                     |
| Resource       | `/admin/services/v1/{serviceId}`         |
| Final Endpoint | `GET /api/admin/services/v1/{serviceId}` |

### API Versioning

- **Decision:** New Endpoint
- **Previous Endpoint:** Tidak ada API detail layanan admin yang teridentifikasi pada solutioning sprint ini.
- **Final Endpoint:** `GET /api/admin/services/v1/{serviceId}`
- **Backward Compatibility:** Belum ada consumer API ini yang teridentifikasi. Penambahan field response opsional bersifat kompatibel; perubahan kontrak yang mematahkan consumer memerlukan major version baru.
- **Reason:** Admin memerlukan detail persisted untuk meninjau dan mengisi form edit satu layanan.

## Business Rules

1. Hanya administrator terautentikasi dengan izin `service-read` yang dapat membaca detail. Role mapping final TBD.
2. `serviceId` adalah ID immutable `game_service.service_id`; slug atau nama layanan bukan identifier endpoint.
3. Layanan aktif maupun nonaktif dapat dibaca. Layanan soft-deleted (`deleted_at IS NOT NULL`) tidak dikembalikan pada endpoint detail standar.
4. Atribut layanan berasal dari record `game_service`; nama game dan kategori berasal dari parent catalog terkini. Order historis memakai snapshot tersendiri dan tidak berubah ketika katalog berubah.
5. Harga konsisten dengan storage: custom price mengembalikan `isCustomPrice=true` dan `priceAmount=null`; fixed price mengembalikan `false` dan nilai >= 0.
6. Detail mengembalikan ID dan nama game/kategori agar form edit dapat mempertahankan pilihan saat ini. Parent inactive tetap ditampilkan untuk layanan existing, tetapi opsi assignment baru mengikuti aturan update/create service.
7. Jika parent record tidak ditemukan karena inkonsistensi data, jangan menyamarkan service sebagai not-found. Kembalikan reference ID dengan display name null atau error integritas data sesuai policy platform; keputusan final TBD.
8. Endpoint bersifat read-only; tidak memperbarui timestamp, status, harga, atau audit trail bisnis.
9. Response tidak memuat data order/customer, credential game, atau atribut internal yang tidak tercantum dalam ERD.
10. Identifier yang tidak ada dan identifier soft-deleted menghasilkan kode bisnis yang sama untuk mengurangi enumeration.

## Request Headers

| Header          | E/N/T | Type   | M/O/C | Max Length | Description                                                  | Example                 |
| --------------- | ----- | ------ | ----- | ---------: | ------------------------------------------------------------ | ----------------------- |
| `Authorization` | N     | String | M     |       4096 | Kredensial administrator; skema mengikuti identity provider. | `Bearer {access-token}` |
| `Accept`        | N     | String | O     |        100 | Tipe media response yang diinginkan; default JSON.           | `application/json`      |
| `X-Request-Id`  | N     | String | O     |        100 | ID korelasi untuk audit/support; jangan memuat PII.          | `req-9d3f21`            |

## Request Parameters

| Parameter   | E/N/T | Type          | M/O/C | Max Length | Description                | Example      |
| ----------- | ----- | ------------- | ----- | ---------: | -------------------------- | ------------ |
| `serviceId` | N     | String (path) | M     |         64 | ID immutable layanan game. | `svc_01JXYZ` |

## Request Body

Tidak ada request body.

### Request Validation

1. `Authorization` harus mengidentifikasi administrator terautentikasi dengan izin `service-read`. Kembalikan `SRVB01001` bila belum terautentikasi dan `SRVB01002` bila tidak berizin.
2. `serviceId` wajib, tidak kosong, maksimal 64 karakter, dan mengikuti format ID implementasi. Format invalid menghasilkan `SRVB02001`.
3. Tolak query parameter yang tidak didefinisikan; endpoint tidak membutuhkan query parameter.
4. Jika service tidak ditemukan atau soft-deleted, kembalikan `SRVB02002` tanpa mengungkap status keberadaan historis.
5. Jika database gagal, kembalikan HTTP 500 `SRVT03001` tanpa detail query/schema internal.

## Response Body

Semua response menggunakan envelope `status` dan `data`. Error mengembalikan `data: null`.

| Attribute                        | E/N/T | Type               | M/O/C | Max Length | Description                               | Example                    |
| -------------------------------- | ----- | ------------------ | ----- | ---------: | ----------------------------------------- | -------------------------- |
| `status`                         | N     | Object             | M     |          — | Object status response.                   | `{}`                       |
| `status.code`                    | N     | String             | M     |         20 | Service status code.                      | `SRVS00000`                |
| `status.message`                 | N     | String             | O     |        200 | Pesan hasil untuk consumer.               | `Service detail retrieved` |
| `data`                           | N     | Object/null        | M     |          — | Payload hasil; `null` ketika error.       | `{}`                       |
| `data.service`                   | N     | Object             | M     |          — | Detail satu layanan.                      | `{}`                       |
| `data.service.id`                | N     | String             | M     |         64 | ID internal service.                      | `svc_01JXYZ`               |
| `data.service.name`              | N     | String             | M     |        150 | Nama layanan.                             | `Top Up Diamond 100`       |
| `data.service.game.id`           | N     | String             | M     |         64 | ID game terkait.                          | `gm_01JXYZ`                |
| `data.service.game.name`         | N     | String/null        | O     |        100 | Nama game dari catalog.                   | `Mobile Legends`           |
| `data.service.game.isActive`     | N     | Boolean/null       | O     |          — | Status game parent bila tersedia.         | `true`                     |
| `data.service.category.id`       | N     | String             | M     |         64 | ID kategori terkait.                      | `cat_01JXYZ`               |
| `data.service.category.name`     | N     | String/null        | O     |        100 | Nama kategori dari catalog.               | `Top Up`                   |
| `data.service.category.isActive` | N     | Boolean/null       | O     |          — | Status kategori parent bila tersedia.     | `true`                     |
| `data.service.priceAmount`       | N     | Decimal/null       | C     |       18,2 | Nilai fixed price atau null untuk custom. | `25000.00`                 |
| `data.service.isCustomPrice`     | N     | Boolean            | M     |          — | Penanda harga custom.                     | `false`                    |
| `data.service.estimateText`      | N     | String             | M     |        100 | Estimasi display, bukan SLA.              | `Instan`                   |
| `data.service.isActive`          | N     | Boolean            | M     |          — | Status publikasi service.                 | `true`                     |
| `data.service.createdAt`         | N     | String (date-time) | M     |         35 | Waktu pembuatan UTC.                      | `2026-10-10T08:00:00Z`     |
| `data.service.updatedAt`         | N     | String (date-time) | M     |         35 | Waktu update terakhir UTC.                | `2026-10-11T08:30:00Z`     |

### Success Example

```json
{
  "status": {
    "code": "SRVS00000",
    "message": "Service detail retrieved"
  },
  "data": {
    "service": {
      "id": "svc_01JXYZ",
      "name": "Top Up Diamond 100",
      "game": {
        "id": "gm_01JXYZ",
        "name": "Mobile Legends",
        "isActive": true
      },
      "category": {
        "id": "cat_01JXYZ",
        "name": "Top Up",
        "isActive": true
      },
      "priceAmount": 25000.0,
      "isCustomPrice": false,
      "estimateText": "Instan",
      "isActive": true,
      "createdAt": "2026-10-10T08:00:00Z",
      "updatedAt": "2026-10-11T08:30:00Z"
    }
  }
}
```

### Business Error Example

```json
{
  "status": {
    "code": "SRVB02002",
    "message": "Service not found"
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

| HTTP Status | Usage                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200`       | Detail layanan berhasil diambil.                                                                                                                                        |
| `400`       | Identifier tidak valid, akses admin ditolak sesuai baseline response project, atau layanan tidak ditemukan. Konfirmasi apakah auth/not-found memakai `401`/`403`/`404`. |
| `500`       | Kegagalan service/database katalog yang tidak terduga.                                                                                                                  |

## Service Status Codes

Format: `[Service Prefix][Status Type][Category][Specific Error Code]`

| Code        | Type      | Category        | Meaning                                                   |
| ----------- | --------- | --------------- | --------------------------------------------------------- |
| `SRVS00000` | Success   | General         | Detail layanan berhasil dikembalikan.                     |
| `SRVB01001` | Business  | Authentication  | Administrator belum terautentikasi.                       |
| `SRVB01002` | Business  | Authentication  | Administrator tidak memiliki izin membaca detail layanan. |
| `SRVB02001` | Business  | User validation | `serviceId` invalid atau parameter tidak dikenal.         |
| `SRVB02002` | Business  | User validation | Layanan tidak ditemukan atau soft-deleted.                |
| `SRVT03001` | Technical | Database        | Detail layanan gagal dibaca atau database tidak tersedia. |

## API Exposure Classification

| Classification                 | Rationale                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise Intranet (proposed) | Endpoint admin untuk metadata katalog dan harga. Jika dapat diakses dari internet, klasifikasikan sebagai Public dan terapkan kontrol API publik yang sesuai. |

## Testing & Documentation Scope

| Scope      | Required | Rationale / Handoff                                                                                                                                                                               |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFT        | Yes      | API detail admin baru. Uji fixed/custom price, parent aktif/nonaktif, kategori/game relation, service soft-deleted, dan query detail puncak. VUser, CPU/memory, target TPS TBD menunggu forecast. |
| VA/Pentest | Yes      | Verifikasi authentication/authorization, IDOR terhadap `serviceId`, enumeration, excessive data exposure, dan tidak adanya order/customer data dalam response.                                    |

## Assumptions

- Endpoint, response envelope, permission, dan prefix `SRV` mengikuti proposal service list/create/update; belum ada backend contract yang disetujui.
- Detail hanya mengembalikan service non-deleted. Restore/recycle-bin retrieval memerlukan kontrak lain.
- `isCustomPrice` merupakan field eksplisit dari proposed ERD; UI saat ini merepresentasikannya sebagai `price === null`.
- Parent `isActive` disertakan sebagai display/informasi assignment; final service ERD/game/category schemas harus memastikan nama dan availability field konsisten.
- Currency mengikuti konfigurasi platform tunggal dan tidak dikembalikan per service hingga ERD menetapkan currency field.
- Data integrity behavior untuk parent hilang, HTTP auth mapping, rate limit, identity provider, role mapping, database engine, dan SLA TBD.

## References

- `../../erd/service-erd.md` — field service, harga, relasi game/category, lifecycle, dan constraints.
- `../../erd/game-erd.md` — detail reference game.
- `../../erd/service-category-erd.md` — detail reference kategori.
- `../../erd/order-erd.md` — order snapshot yang tidak berubah saat katalog diperbarui.
- `./get-list-services.md` — list fields, permission, service codes, dan soft-delete behavior.
- `./create-service.md` — field dan price model create.
- `./update-service.md` — full update semantics dan status parent.
- `./delete-service.md` — soft-delete semantics.
- `src/features/AdminServices/views/interfaces/admin-service.interface.ts` — field service UI.
- `src/features/AdminServices/views/templates/AdminServices.template.tsx` — detail/edit form fields.
