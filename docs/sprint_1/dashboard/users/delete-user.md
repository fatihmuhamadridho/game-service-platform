# Admin Dashboard - Delete User Interface Agreement

> **Document Type:** IFA / API Contract  
> **Status:** Draft  
> **Service / Domain:** Admin Dashboard — User Management  
> **Consumer / Partner:** JokiHub Admin Dashboard (authorized administrator)

## Design

API ini menghapus akun member dari penggunaan aktif Admin Dashboard dengan soft delete berdasarkan `userId`. Service menandai akun terhapus dan menonaktifkan identity/session agar user tidak dapat login; order, pembayaran, dan riwayat audit tetap tersimpan. Penghapusan akun admin berada di Admin Management, sedangkan retensi atau anonymisasi PII mengikuti kebijakan privacy yang belum ditetapkan.

## Sequence Diagram

```mermaid
sequenceDiagram
    actor Admin as Administrator berizin mengelola user
    participant UI as Admin Dashboard UI
    participant API as Admin User Management API
    participant IDP as Identity Provider
    participant DB as User Database
    Admin->>UI: Pilih hapus user dan konfirmasi
    UI->>API: DELETE /api/admin/users/v1/delete/{userId} + kredensial admin
    API->>API: Autentikasi dan otorisasi izin user-delete
    alt Tidak terautentikasi atau tidak berizin
        API-->>UI: 400 USRB01001 / USRB01002, data null
        UI-->>Admin: Tampilkan pesan akses
    else Berizin
        API->>API: Validasi format userId dan larangan self-delete
        alt userId tidak valid atau request dilarang
            API-->>UI: 400 USRB02001 / USRB02005, data null
            UI-->>Admin: Tampilkan alasan request ditolak
        else Request valid
            API->>DB: Ambil USER_ACCOUNT member dan status delete
            alt User tidak ditemukan atau bukan member
                DB-->>API: Record tidak tersedia
                API-->>UI: 400 USRB02004, data null
                UI-->>Admin: Tampilkan user tidak ditemukan
            else User sudah terhapus
                DB-->>API: Timestamp deleted_at yang ada
                API-->>UI: 200 USRS00000, data.userId dan data.deletedAt
                UI-->>Admin: Tampilkan konfirmasi delete yang sama
            else User ditemukan
                API->>IDP: Nonaktifkan identity dan cabut sesi bila provider mendukung
                alt Identity disable gagal
                    IDP-->>API: Kegagalan disable
                    API-->>UI: 500 USRT02001, data null
                    UI-->>Admin: Tampilkan kegagalan; akun tidak dinyatakan terhapus
                else Identity berhasil dinonaktifkan
                    API->>DB: Set status BLOCKED, deleted_at, updated_at, status history, audit secara atomik
                    alt Persistensi berhasil
                        DB-->>API: Timestamp delete tersimpan
                        API-->>UI: 200 USRS00000, data.userId dan data.deletedAt
                        UI-->>Admin: Hapus user dari daftar aktif
                    else Database gagal
                        DB-->>API: Kegagalan persistensi
                        API->>IDP: Kompensasi/reactivate sesuai kebijakan aman
                        API-->>UI: 500 USRT03001, data null
                        UI-->>Admin: Tampilkan kegagalan dan opsi retry/reconciliation
                    end
                end
            end
        end
    end
```

## Performance / SLA Targets

| Success Rate                                     | VUser                                       | CPU / Memory                        | Response Time                                                                             |
| ------------------------------------------------ | ------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| TBD; confirm criticality and availability target | TBD; confirm peak concurrent administrators | TBD; set from capacity estimate/NFT | TBD; proposed less-critical web baseline: ideal 200 ms, acceptable 1 s, max tolerable 2 s |

## General Information

| Component          | Value                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Description        | Menandai akun member sebagai terhapus, menonaktifkan akses identity, dan mempertahankan data order/history.                                                                       |
| Resource URL       | `https://{host}/api/admin/users/v1/delete/{userId}`                                                                                                                               |
| Transport Protocol | HTTPS, REST                                                                                                                                                                       |
| Request Verb       | DELETE                                                                                                                                                                            |
| Content Type       | Tidak ada request body                                                                                                                                                            |
| Interaction Type   | Synchronous; identity disable dan database update memerlukan orchestration/compensation policy.                                                                                   |
| Security Policy    | Admin authentication dan izin user-delete. Identity provider, self-delete guard, audit, PII retention, dan session revocation policy TBD. Tidak ada credential diterima oleh API. |

### Path / Endpoint

| Section        | Value                                 |
| -------------- | ------------------------------------- |
| Host / Domain  | `{host}` (environment-specific)       |
| Service Name   | User Management                       |
| Version        | `v1`                                  |
| Resource       | `/admin/users/v1/delete/{userId}`     |
| Final Endpoint | `/api/admin/users/v1/delete/{userId}` |

### API Versioning

- **Decision:** New Endpoint
- **Previous Endpoint:** Tidak ada API delete user admin yang teridentifikasi.
- **Final Endpoint:** `DELETE /api/admin/users/v1/delete/{userId}`
- **Backward Compatibility:** Belum ada consumer API delete user yang teridentifikasi. Penambahan field response opsional bersifat kompatibel; perubahan kontrak yang mematahkan consumer memerlukan major version baru.
- **Reason:** Admin Dashboard memerlukan penghapusan akun member yang dapat diaudit tanpa merusak riwayat transaksi.

## Business Rules

1. Hanya administrator terautentikasi dengan izin `user-delete` yang dapat menghapus akun member. Identity provider dan nama permission final TBD.
2. Endpoint hanya berlaku untuk `USER_ACCOUNT` member. `ADMIN_ACCOUNT` harus dikelola melalui Admin Management dengan perlindungan administrator terakhir dan role assignment.
3. Operasi menggunakan soft delete: set `deleted_at` dan `updated_at` dalam UTC, serta set status akses ke `BLOCKED` bila status belum blocked. ERD mengusulkan `deleted_at`; status history harus mencatat perubahan yang terjadi.
4. Penghapusan harus menonaktifkan identity eksternal dan mencabut sesi aktif bila provider mendukung. Jika salah satu langkah gagal, akun tidak boleh dilaporkan terhapus; implementasi perlu transaksi terdistribusi, outbox/reconciliation, atau kompensasi terdefinisi.
5. `userId` yang tidak ditemukan atau bukan member mengembalikan `USRB02004`. Untuk request ulang pada user yang sudah terhapus, kembalikan sukses dengan `deletedAt` tersimpan dan tanpa membuat event delete duplikat; operasi bersifat idempotent.
6. Cegah administrator menghapus akun dirinya sendiri melalui user-delete endpoint. Pengecualian break-glass, bila diperlukan, harus berupa alur terpisah dan diaudit.
7. Penghapusan tidak menghapus `customer_order`, pembayaran, refund, komplain, member tier history, atau audit records. Order snapshot dan catatan finansial tetap mengikuti retensi masing-masing.
8. Akun yang memiliki order aktif dapat dinonaktifkan, tetapi order operasional harus tetap dapat diproses melalui snapshot kontak yang tersimpan. Kebijakan komunikasi pelanggan setelah penghapusan perlu ditetapkan.
9. Soft delete tidak otomatis menghapus/anonymize `name`, `email`, username, atau WhatsApp. Kebijakan privacy perlu menentukan dasar, masa retensi, dan proses anonymization setelah retensi operasional/finansial.
10. Identifier, identitas penghapus, timestamp, dan alasan (jika diwajibkan policy) dicatat di audit. Secret, password, atau token tidak boleh dicatat.
11. User terhapus dikecualikan dari list/detail standar, tidak dapat login, dan tidak dapat dipulihkan melalui endpoint ini. Restore atau anonymization, bila dibutuhkan, adalah proses/API terpisah.
12. Pemeriksaan self-delete, status existing, identity disable, local soft-delete, status history, dan audit harus aman terhadap request bersamaan dan retry.

## Request Headers

| Header            | E/N/T | Type   | M/O/C | Max Length | Description                                                                                                       | Example                 |
| ----------------- | ----- | ------ | ----- | ---------: | ----------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `Authorization`   | N     | String | M     |       4096 | Kredensial administrator; skema autentikasi bergantung identity provider.                                         | `Bearer {access-token}` |
| `Accept`          | N     | String | O     |        100 | Tipe media response yang diinginkan; default JSON.                                                                | `application/json`      |
| `Idempotency-Key` | N     | String | C     |        100 | Wajib bila pemanggilan identity provider tidak idempotent; mencegah disable/provision berulang. Policy final TBD. | `idem-4c29d1`           |
| `X-Request-Id`    | N     | String | O     |        100 | ID korelasi untuk audit dan reconciliation.                                                                       | `req-238fa5`            |

## Request Parameters

| Parameter | E/N/T | Type   | M/O/C | Max Length | Description                                 | Example      |
| --------- | ----- | ------ | ----- | ---------: | ------------------------------------------- | ------------ |
| `userId`  | N     | String | M     |         64 | ID immutable akun member yang akan dihapus. | `usr_01JXYZ` |

## Request Query Parameters

None.

## Request Body

Tidak ada request body.

### Request Validation

1. `Authorization` harus mengidentifikasi administrator terautentikasi dengan izin `user-delete`. Kembalikan `USRB01001` bila belum terautentikasi dan `USRB01002` bila izin tidak tersedia.
2. `userId` wajib, tidak kosong, dan maksimal 64 karakter. Format ID mengikuti strategi pembuatan ID TBD; nilai tidak valid mengembalikan `USRB02001`.
3. Request tidak boleh menargetkan identitas admin pemanggil atau akun admin; pelanggaran self-delete mengembalikan `USRB02005`, akun admin/non-member tidak ditemukan pada domain ini (`USRB02004`).
4. Bila user sudah memiliki `deleted_at`, kembalikan `USRS00000` dengan timestamp deletion lama tanpa mengulang identity disable atau menambah history event.
5. Request body tidak digunakan. Field/query tambahan tidak boleh mengubah cakupan soft delete.
6. Identity provider harus berhasil menonaktifkan identity/session sebelum local state dinyatakan terhapus. Provider failure mengembalikan `USRT02001`; database failure mengembalikan `USRT03001` dan memulai kompensasi/reconciliation yang disetujui.
7. Local `deleted_at`, blocked status, status history, dan audit harus commit atomik. Tidak boleh ada `data` parsial pada kegagalan.

## Response Body

Semua response menggunakan `status` dan `data`. Sukses mengembalikan ID dan waktu soft delete, termasuk retry idempotent; error mengembalikan `data: null`.

| Attribute        | E/N/T | Type               | M/O/C | Max Length | Description                                                         | Example                |
| ---------------- | ----- | ------------------ | ----- | ---------: | ------------------------------------------------------------------- | ---------------------- |
| `status`         | N     | Object             | M     |          — | Object status response.                                             | `{}`                   |
| `status.code`    | N     | String             | M     |         20 | Service status code.                                                | `USRS00000`            |
| `status.message` | N     | String             | O     |        200 | Pesan hasil untuk consumer.                                         | `User deleted`         |
| `data`           | N     | Object/null        | M     |          — | Hasil penghapusan; `null` ketika error.                             | `{}`                   |
| `data.userId`    | N     | String             | C     |         64 | ID user yang ditandai terhapus.                                     | `usr_01JXYZ`           |
| `data.deletedAt` | N     | String (date-time) | C     |         35 | Waktu soft delete ISO 8601 UTC; retry mengembalikan timestamp awal. | `2026-10-11T11:30:00Z` |

### Success Example

```json
{
  "status": {
    "code": "USRS00000",
    "message": "User deleted"
  },
  "data": {
    "userId": "usr_01JXYZ",
    "deletedAt": "2026-10-11T11:30:00Z"
  }
}
```

### Business Error Example

```json
{
  "status": {
    "code": "USRB02005",
    "message": "Administrator cannot delete their own account"
  },
  "data": null
}
```

### Technical Error Example

```json
{
  "status": {
    "code": "USRT02001",
    "message": "Identity provider is temporarily unavailable"
  },
  "data": null
}
```

## HTTP Status Codes

| HTTP Status | Usage                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200`       | Akun berhasil/ulangannya telah ditandai terhapus; metadata penghapusan dikembalikan.                                                                                                              |
| `400`       | ID tidak valid, akses admin ditolak, request self-delete, atau user tidak ditemukan/bukan member sesuai baseline response project. Konfirmasi apakah API standard mengharuskan `401`/`403`/`404`. |
| `500`       | Kegagalan service/database/identity yang tidak terduga. Kegagalan dependency dapat memakai `502`/`503` bila API standard mendukung.                                                               |

## Service Status Codes

Format: `[Service Prefix][Status Type][Category][Specific Error Code]`

| Code        | Type      | Category         | Meaning                                                                    |
| ----------- | --------- | ---------------- | -------------------------------------------------------------------------- |
| `USRS00000` | Success   | General          | User berhasil atau sudah terhapus sebelumnya.                              |
| `USRB01001` | Business  | Authentication   | Administrator belum terautentikasi.                                        |
| `USRB01002` | Business  | Authentication   | Administrator tidak memiliki izin user-delete.                             |
| `USRB02001` | Business  | User validation  | `userId` tidak tersedia atau format/panjangnya tidak valid.                |
| `USRB02004` | Business  | User validation  | User tidak ditemukan, sudah tidak ada di domain member, atau bukan member. |
| `USRB02005` | Business  | User validation  | Self-delete tidak diizinkan.                                               |
| `USRT02001` | Technical | External service | Identity provider gagal menonaktifkan identity/session.                    |
| `USRT03001` | Technical | Database         | Akun, status history, atau audit gagal disimpan/database tidak tersedia.   |

## API Exposure Classification

| Classification                 | Rationale                                                                                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enterprise Intranet (proposed) | Endpoint administratif yang menonaktifkan akses user. Pastikan boundary internal; jika internet-accessible, klasifikasikan sebagai Public dan terapkan proteksi API publik. |

## Testing & Documentation Scope

| Scope      | Required | Rationale / Handoff                                                                                                                                                                                                                                       |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFT        | Yes      | API admin write dengan identity provider dependency. Uji delete sukses, retry/idempotency, self-delete, non-member/not-found, provider/database failure, compensation, dan concurrency. VUser, CPU/memory, dan target TPS TBD mengikuti forecast traffic. |
| VA/Pentest | Yes      | Endpoint menonaktifkan akun. Uji authentication/authorization, `userId` IDOR, self-delete bypass, admin-account targeting, session revocation, race/replay, PII retention, dan audit attribution.                                                         |

## Assumptions

- Endpoint `/api/admin/users/v1/delete/{userId}`, HTTP `DELETE`, soft-delete behavior, envelope, prefix `USR`, dan status codes adalah usulan mengikuti kontrak user lainnya; API owner perlu menyetujui.
- `deleted_at` sudah diusulkan pada User Management ERD, tetapi kebijakan soft delete, restore, anonymization, uniqueness reuse, dan retention PII belum diputuskan.
- Penghapusan user mencakup pemblokiran access dan identity-provider deactivation; bila provider tidak terintegrasi, scope endpoint perlu disesuaikan sebelum implementasi.
- Endpoint hanya untuk member. Admin account deletion, administrator terakhir, role cleanup, dan role assignment ditangani Admin Management/RBAC.
- Self-delete guard, identity provider, session revoke, idempotency retention, compensation/outbox, audit storage, financial retention, SLA, dan HTTP auth/not-found mapping TBD.
- Data order, payment, refund, complaint, and status history tidak dihapus. PII anonymization bukan bagian dari operasi synchronous ini sampai retention policy disetujui.

## References

- `./create-user.md` — user/member creation scope and account boundary.
- `./get-list-users.md` — list filtering excludes soft-deleted users.
- `./get-detail-user.md` — user detail access boundary.
- `./update-user.md` — status lifecycle and identity update policy.
- `../../erd/user-management-erd.md` — proposed `USER_ACCOUNT.deleted_at` and status history.
- `../../erd/order-erd.md` — order snapshots and retention.
- `docs/sprint_1/solutioning/dashboard/games/delete-game.md` — admin soft-delete contract pattern.
