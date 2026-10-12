# Admin Dashboard - Delete Service Category Interface Agreement

> **Document Type:** IFA / API Contract  
> **Status:** Draft  
> **Service / Domain:** Admin Dashboard — Service Category Management  
> **Consumer / Partner:** JokiHub Admin Dashboard (authorized administrator)

## Design

API menghapus kategori layanan dari Admin Dashboard menggunakan soft delete untuk mempertahankan referensi historis. Penghapusan ditolak selama kategori masih direferensikan oleh layanan; admin harus memindahkan atau menghapus relasi layanan melalui alur pengelolaan layanan terlebih dahulu. Keputusan ini menjaga foreign key tetap valid dan konsisten dengan [Service Category ERD](../../erd/service-category-erd.md), yang mensyaratkan tidak ada orphan dan tidak ada cascade delete. UI saat ini memakai konfirmasi delete, tetapi perilaku persistence dan aturan relasi belum terimplementasi.

## Sequence Diagram

```mermaid
sequenceDiagram
    actor Admin as Administrator
    participant UI as Admin Dashboard UI
    participant API as Service Category Management API
    participant DB as Catalog Database
    participant Audit as Platform Audit Service
    Admin->>UI: Konfirmasi hapus kategori
    UI->>API: DELETE /api/admin/service-categories/v1/{categoryId} dengan kredensial admin
    API->>API: Autentikasi dan otorisasi izin service-category-delete
    alt Tidak terautentikasi atau tidak berizin
        API-->>UI: 400 SCAB01001 / SCAB01002, data null
        UI-->>Admin: Tampilkan pesan akses
    else Berizin
        API->>API: Validasi categoryId
        alt Identifier tidak valid
            API-->>UI: 400 SCAB02001, data null
            UI-->>Admin: Tampilkan identifier tidak valid
        else Identifier valid
            API->>DB: Ambil dan lock kategori non-deleted; cek layanan terkait
            alt Kategori tidak ditemukan atau sudah dihapus
                DB-->>API: Tidak ada kategori aktif
                API-->>UI: 400 SCAB02002, data null
                UI-->>Admin: Tampilkan kategori tidak ditemukan
            else Masih direferensikan layanan
                DB-->>API: Service reference count lebih dari nol
                API-->>UI: 400 SCAB02003, data null
                UI-->>Admin: Tampilkan jumlah layanan terkait dan instruksi pemindahan
            else Tidak memiliki layanan terkait
                API->>DB: Set deleted_at dan updated_at secara atomik
                alt Soft delete berhasil
                    DB-->>API: Kategori ditandai terhapus
                    API->>Audit: Catat actor, action, categoryId, dan timestamp
                    Audit-->>API: Audit tercatat atau diterima sesuai kontrak audit
                    API-->>UI: 200 SCAS00000, data.categoryId dan deletedAt
                    UI-->>Admin: Tampilkan konfirmasi penghapusan
                else Database gagal
                    DB-->>API: Kegagalan penghapusan
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
| Description        | Menandai kategori layanan sebagai terhapus secara soft setelah memastikan tidak ada layanan yang mereferensikannya.                                 |
| Resource URL       | `https://{host}/api/admin/service-categories/v1/{categoryId}`                                                                                       |
| Transport Protocol | HTTPS, REST                                                                                                                                         |
| Request Verb       | DELETE                                                                                                                                              |
| Content Type       | `application/json` response; tidak ada request body.                                                                                                |
| Interaction Type   | Synchronous                                                                                                                                         |
| Security Policy    | Admin authentication dan izin `service-category-delete`. Identity provider dan permission final TBD. Terapkan rate limiting dan audit actor/action. |

### Path / Endpoint

| Section        | Value                                                  |
| -------------- | ------------------------------------------------------ |
| Host / Domain  | `{host}` (environment-specific)                        |
| Service Name   | Service Category Management                            |
| Version        | `v1`                                                   |
| Resource       | `/admin/service-categories/v1/{categoryId}`            |
| Final Endpoint | `DELETE /api/admin/service-categories/v1/{categoryId}` |

### API Versioning

- **Decision:** New Endpoint
- **Previous Endpoint:** Tidak ada API delete kategori admin yang teridentifikasi pada solutioning sprint ini.
- **Final Endpoint:** `DELETE /api/admin/service-categories/v1/{categoryId}`
- **Backward Compatibility:** Belum ada consumer API ini yang teridentifikasi. Response baru tidak mengubah consumer lain; perubahan error/semantik yang mematahkan consumer memerlukan major version baru.
- **Reason:** Admin UI menyediakan aksi hapus kategori; endpoint mengimplementasikan penghapusan aman yang menjaga relasi katalog.

## Business Rules

1. Hanya administrator terautentikasi dengan izin `service-category-delete` yang dapat menghapus kategori. Role mapping final TBD.
2. `categoryId` mengidentifikasi kategori secara immutable. Nama/slug tidak digunakan sebagai target delete.
3. Operasi adalah soft delete: set `deleted_at` dan `updated_at` ke waktu UTC server. Record fisik dan referensi historis dipertahankan.
4. Kategori aktif maupun nonaktif dapat dihapus bila tidak memiliki layanan yang mereferensikannya.
5. Jika satu atau lebih `game_service` masih menunjuk kategori, delete ditolak dengan `SCAB02003`. Response menyertakan `linkedServiceCount` dan UI memberi arahan untuk memindahkan/menghapus hubungan tersebut terlebih dahulu.
6. Pemeriksaan referensi dan set `deleted_at` dilakukan atomik/terlindungi FK agar service baru tidak dapat terhubung di sela check dan delete. Jangan cascade delete, reassign, atau deactivate layanan secara diam-diam.
7. Order historis, snapshot kategori/layanan, transaksi, dan entitas lain tidak dihapus maupun diubah.
8. Kategori yang tidak ditemukan atau sudah soft-deleted menghasilkan `SCAB02002`; operasi tidak mengungkap apakah kategori pernah ada.
9. Setelah soft delete, kategori tidak muncul pada list/default detail, tidak bisa dipilih untuk assignment baru, dan uniqueness scope mengikuti ERD. Reuse nama/slug setelah delete masih menunggu keputusan; sampai diputuskan, gunakan constraint yang dikonfirmasi pemilik database.
10. Penghapusan berhasil dicatat pada audit platform dengan actor, target, action, dan waktu. Audit tidak boleh mengakibatkan request retry menghapus entitas lain atau kehilangan jejak perubahan.
11. Endpoint tidak menerima request body dan tidak menyediakan permanent-delete atau restore operation.
12. Client retry setelah sukses mendapat hasil kategori tidak ditemukan/terhapus yang sama; delete tidak melakukan efek samping tambahan.

## Request Headers

| Header          | E/N/T | Type   | M/O/C | Max Length | Description                                                  | Example                 |
| --------------- | ----- | ------ | ----- | ---------: | ------------------------------------------------------------ | ----------------------- |
| `Authorization` | N     | String | M     |       4096 | Kredensial administrator; skema mengikuti identity provider. | `Bearer {access-token}` |
| `Accept`        | N     | String | O     |        100 | Tipe media response yang diinginkan; default JSON.           | `application/json`      |
| `X-Request-Id`  | N     | String | O     |        100 | ID korelasi untuk audit/support; jangan memuat PII.          | `req-95b2ef`            |

## Request Parameters

| Parameter    | E/N/T | Type          | M/O/C | Max Length | Description                              | Example      |
| ------------ | ----- | ------------- | ----- | ---------: | ---------------------------------------- | ------------ |
| `categoryId` | N     | String (path) | M     |         64 | ID immutable kategori yang akan dihapus. | `cat_01JXYZ` |

## Request Body

Tidak ada request body.

### Request Validation

1. `Authorization` harus mengidentifikasi administrator terautentikasi dengan izin `service-category-delete`. Kembalikan `SCAB01001` bila belum terautentikasi dan `SCAB01002` bila tidak berizin.
2. `categoryId` wajib, tidak kosong, maksimal 64 karakter, dan mengikuti format ID yang ditetapkan implementasi. Identifier invalid menghasilkan `SCAB02001`.
3. Tolak request body dan query parameter yang tidak didefinisikan.
4. Kategori valid tetapi tidak ditemukan atau sudah soft-deleted menghasilkan `SCAB02002`.
5. Jika masih ada layanan terkait, kembalikan `SCAB02003` dan `linkedServiceCount`; jangan melakukan update parsial.
6. Bila tidak ada layanan terkait, lakukan soft delete dan audit dalam alur transaksional/durable yang disetujui.
7. Kegagalan database menghasilkan HTTP 500 `SCAT03001` tanpa detail internal.

## Response Body

Semua response menggunakan envelope `status` dan `data`. Error mengembalikan `data: null`, kecuali konflik referensi yang mengembalikan count terkait.

| Attribute                 | E/N/T | Type               | M/O/C | Max Length | Description                                                            | Example                    |
| ------------------------- | ----- | ------------------ | ----- | ---------: | ---------------------------------------------------------------------- | -------------------------- |
| `status`                  | N     | Object             | M     |          — | Object status response.                                                | `{}`                       |
| `status.code`             | N     | String             | M     |         20 | Service status code.                                                   | `SCAS00000`                |
| `status.message`          | N     | String             | O     |        200 | Pesan hasil untuk consumer.                                            | `Service category deleted` |
| `data`                    | N     | Object/null        | M     |          — | Payload hasil; `null` ketika error selain konflik referensi.           | `{}`                       |
| `data.categoryId`         | N     | String             | C     |         64 | ID kategori yang ditandai terhapus.                                    | `cat_01JXYZ`               |
| `data.deletedAt`          | N     | String (date-time) | C     |         35 | Waktu soft delete dalam ISO 8601 UTC.                                  | `2026-10-11T10:00:00Z`     |
| `data.linkedServiceCount` | N     | Integer            | C     |  10 digits | Jumlah layanan yang masih mereferensikan kategori pada konflik delete. | `2`                        |

### Success Example

```json
{
  "status": {
    "code": "SCAS00000",
    "message": "Service category deleted"
  },
  "data": {
    "categoryId": "cat_01JXYZ",
    "deletedAt": "2026-10-11T10:00:00Z"
  }
}
```

### Business Error Example — Category Has Services

```json
{
  "status": {
    "code": "SCAB02003",
    "message": "Service category is referenced by services"
  },
  "data": {
    "linkedServiceCount": 2
  }
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

| HTTP Status | Usage                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200`       | Kategori berhasil ditandai terhapus sesuai baseline response project. Konfirmasi apakah DELETE standard memakai `204`.                                                |
| `400`       | Identifier invalid, akses admin ditolak sesuai baseline response project, kategori tidak ditemukan, atau masih ada layanan terkait. Konfirmasi auth-specific mapping. |
| `500`       | Kegagalan service/database yang tidak terduga.                                                                                                                        |

## Service Status Codes

Format: `[Service Prefix][Status Type][Category][Specific Error Code]`

| Code        | Type      | Category        | Meaning                                                                      |
| ----------- | --------- | --------------- | ---------------------------------------------------------------------------- |
| `SCAS00000` | Success   | General         | Kategori berhasil ditandai terhapus.                                         |
| `SCAB01001` | Business  | Authentication  | Administrator belum terautentikasi.                                          |
| `SCAB01002` | Business  | Authentication  | Administrator tidak memiliki izin delete kategori.                           |
| `SCAB02001` | Business  | User validation | `categoryId` invalid atau request memuat parameter/body yang tidak didukung. |
| `SCAB02002` | Business  | User validation | Kategori tidak ditemukan atau sudah terhapus.                                |
| `SCAB02003` | Business  | User validation | Kategori masih direferensikan oleh satu atau lebih layanan.                  |
| `SCAT03001` | Technical | Database        | Kategori gagal ditandai terhapus atau database tidak tersedia.               |

## API Exposure Classification

| Classification                 | Rationale                                                                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise Intranet (proposed) | Operasi destruktif admin untuk katalog. Jika endpoint dapat diakses dari internet, klasifikasikan sebagai Public dan terapkan proteksi API publik. |

## Testing & Documentation Scope

| Scope      | Required | Rationale / Handoff                                                                                                                                                                                                                  |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFT        | Yes      | API delete admin baru. Uji kategori tanpa layanan, kategori dengan layanan aktif/nonaktif, kategori telah dihapus, race antara assignment service dan delete, dan retry. VUser, CPU/memory, serta target TPS TBD mengikuti forecast. |
| VA/Pentest | Yes      | Verifikasi authentication/authorization, IDOR, privilege boundaries, referential integrity, race condition, audit attribution, serta tidak ada cascade/permanent data loss.                                                          |

## Assumptions

- Endpoint dan soft-delete semantics merupakan proposal; ERD menyebut soft delete tetapi kebijakan final masih TBD.
- Delete ditolak selama kategori memiliki service reference, mengikuti aturan ERD bahwa hard delete diblokir saat referensi ada dan soft delete memerlukan no-linked-service atau workflow reassignment yang disetujui.
- `linkedServiceCount` menghitung semua layanan yang masih memiliki FK ke kategori; apakah layanan inactive/soft-deleted ikut dihitung perlu dikonfirmasi bersama service ERD.
- Operation memakai HTTP `200` dan envelope standar proyek; `204` dapat dipilih bila API standard mensyaratkannya.
- Audit platform, identity provider, role mapping, database engine, unique-name/slug reuse policy, serta SLA TBD.
- Tidak ada permanent delete, reassignment, atau auto-deactivation dalam scope ini.

## References

- `../../erd/service-category-erd.md` — relasi kategori-layanan, soft-delete proposal, dan larangan orphan/cascade delete.
- `./create-service-category.md` — kontrak create kategori dan identifier.
- `./get-detail-service-category.md` — detail kategori dan relasi layanan.
- `./update-service-category.md` — aturan update kategori dan dampak terhadap layanan.
- `src/features/AdminServiceCategories/views/templates/AdminServiceCategories.template.tsx` — konfirmasi aksi delete pada UI admin.
