# Order Tracking Service - Track Order Interface Agreement

> **Document Type:** API Contract  
> **Status:** Draft  
> **Service / Domain:** Public Order Tracking  
> **Consumer / Partner:** JokiHub storefront (`/cek-pesanan`)

## Design

API ini memverifikasi dan mengambil status satu order untuk customer/guest. UI meminta nomor order dan nomor WhatsApp yang digunakan saat checkout. Keduanya diverifikasi server-side sebelum response detail/timeline diberikan. Lookup harus tahan terhadap enumeration dan brute force: gunakan response error generik, throttling, audit security event, dan minimisasi data. Nomor WhatsApp tidak ditempatkan di URL dan dikembalikan dalam bentuk masked. Endpoint hanya membaca status; perubahan order/payment dilakukan oleh workflow lain.

## Sequence Diagram

```mermaid
sequenceDiagram
    actor User as Customer/guest
    participant UI as Order Tracking UI
    participant API as Public Order Tracking API
    participant DB as Order Database
    User->>UI: Masukkan nomor order dan WhatsApp
    UI->>API: POST /api/orders/v1/tracking/lookup + orderNumber + whatsapp
    API->>API: Validasi format, rate limit, dan abuse controls
    alt Format tidak valid
        API-->>UI: 400 ORDB02001, error generik
        UI-->>User: Tampilkan data lookup tidak valid
    else Format valid
        API->>DB: Cari order dan verifikasi WhatsApp normalized/hash
        alt Order dan WhatsApp cocok
            DB-->>API: Order snapshot + status histories
            API->>API: Mask PII dan bentuk public timeline
            API-->>UI: 200 ORDS00000, data.order + timeline + trackingToken
            UI-->>User: Tampilkan status pesanan
        else Tidak cocok/order tidak ditemukan
            DB-->>API: Tidak ada match
            API-->>UI: 400 ORDB02002, pesan generik
            UI-->>User: Tampilkan nomor order/WhatsApp tidak cocok
        else Database gagal
            DB-->>API: Kegagalan query
            API-->>UI: 500 ORDT03001, data null
            UI-->>User: Tampilkan kegagalan dan opsi coba lagi
        end
    end
    Note over UI,API: Jika halaman detail perlu refresh, gunakan trackingToken berumur pendek; jangan mengirim WhatsApp di path/query.
```

## Performance / SLA Targets

| Success Rate                                      | VUser                                | CPU / Memory                        | Response Time                                            |
| ------------------------------------------------- | ------------------------------------ | ----------------------------------- | -------------------------------------------------------- |
| TBD; define customer tracking availability target | TBD; forecast public visitor traffic | TBD; capacity estimate/NFT required | TBD; include lookup throttling and history query latency |

## General Information

| Component          | Value                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Description        | Memverifikasi nomor order dan WhatsApp, lalu mengembalikan status order dan timeline publik yang aman.                                         |
| Resource URL       | `https://{host}/api/orders/v1/tracking/lookup`                                                                                                 |
| Transport Protocol | HTTPS, REST                                                                                                                                    |
| Request Verb       | POST                                                                                                                                           |
| Content Type       | `application/json`                                                                                                                             |
| Interaction Type   | Synchronous                                                                                                                                    |
| Security Policy    | Public endpoint with PII verification, per-IP/order throttling, enumeration protection, secure logging, and short-lived scoped tracking token. |

### Path / Endpoint

| Section        | Value                            |
| -------------- | -------------------------------- |
| Host / Domain  | `{host}` (environment-specific)  |
| Service Name   | Public Order Tracking            |
| Version        | `v1`                             |
| Resource       | `/orders/v1/tracking/lookup`     |
| Final Endpoint | `/api/orders/v1/tracking/lookup` |

### API Versioning

- **Decision:** New Endpoint
- **Previous Endpoint:** Tidak ada API tracking yang teridentifikasi; `/cek-pesanan` saat ini hanya menyimpan nomor WhatsApp di sessionStorage dan halaman hasil memakai data simulasi.
- **Final Endpoint:** `POST /api/orders/v1/tracking/lookup`
- **Backward Compatibility:** Belum ada consumer API tracking yang teridentifikasi. Endpoint lookup terpisah dari order list/detail admin dan tidak mengubah kontraknya.
- **Reason:** Customer perlu memverifikasi kepemilikan order sebelum melihat status dan timeline.

## Business Rules

1. Lookup memerlukan pasangan `orderNumber` dan WhatsApp yang sama dengan snapshot checkout. Phone dibandingkan setelah normalisasi ke format canonical yang disepakati.
2. Nomor order saja tidak cukup untuk membuka detail tracking. Jangan menerima `userId` dari client sebagai pengganti otorisasi.
3. Guest order dan order member mengikuti verifikasi yang sama kecuali desain account-authenticated tracking disepakati; sesi login tidak otomatis mengizinkan akses order milik akun lain.
4. Order ditemukan dan WhatsApp cocok mengembalikan informasi minimum untuk tracking: order number, status publik, layanan/game snapshot yang aman, waktu update, payment display status seperlunya, dan timeline relevan.
5. Jangan mengembalikan alamat email, WhatsApp utuh, game account identifier, customer notes, bukti pembayaran, internal reviewer/admin IDs, provider secrets, atau alasan internal yang berisi data sensitif.
6. Timeline berasal dari `order_status_history` dan status payment history yang telah dipetakan ke label customer-safe. Event diurutkan ascending berdasarkan waktu dan tidak mengungkap nama/ID admin internal.
7. Status order dan payment tetap terpisah. Payment pending/rejected tidak boleh disajikan sebagai order fulfillment progress yang sudah dimulai.
8. Mapping status internal ke public display copy harus ditetapkan. Usulan status order: `PENDING_PAYMENT`, `PENDING_VALIDATION`, `PROCESSING`, `COMPLETED`, `CANCELLED`; payment status dapat ditampilkan sebagai tahap terkait, bukan mengganti status order.
9. Jika order tidak ada atau nomor WhatsApp tidak cocok, kembalikan status/error/message yang sama untuk mencegah enumeration. Jangan mengungkap apakah salah satu field benar.
10. Tambahkan rate limiting per IP, order number, dan kombinasi identifier; gunakan progressive delay/temporary block dan monitoring percobaan gagal. Threshold ditentukan security owner.
11. Nomor WhatsApp dan order number tidak dicatat raw di application logs/analytics. Mask atau hash dengan key terproteksi untuk abuse detection; audit akses tetap menyimpan correlation ID.
12. Response sukses dapat mengembalikan opaque `trackingToken` scoped ke satu order dengan TTL pendek untuk refresh detail tanpa mengirim ulang phone. Token bukan pengganti credential umum dan tidak boleh muncul di URL/referrer/log.
13. Tracking token harus dicabut/expired dan tidak dapat digunakan untuk order lain. Jika tidak memakai token, client harus mengulang verifikasi pair melalui POST.
14. Data historis tetap tersedia sesuai retention/legal policy meskipun user/account dihapus; PII yang dianonimkan dapat membuat verification tidak lagi tersedia dan perlu recovery policy.
15. Endpoint read-only; tidak menerima payment proof, mengubah status, memperpanjang expiry, atau memicu fulfillment.

## Request Headers

| Header          | E/N/T | Type   | M/O/C | Max Length | Description                                                                         | Example                 |
| --------------- | ----- | ------ | ----- | ---------: | ----------------------------------------------------------------------------------- | ----------------------- |
| `Content-Type`  | N     | String | M     |        100 | Tipe media request.                                                                 | `application/json`      |
| `Accept`        | N     | String | O     |        100 | Tipe media response yang diinginkan; default JSON.                                  | `application/json`      |
| `X-Request-Id`  | N     | String | O     |        100 | ID korelasi; jangan masukkan PII ke nilai header.                                   | `req-2ac94c`            |
| `Authorization` | N     | String | O     |       4096 | Bearer token bila customer login; pair verification tetap dibutuhkan sesuai policy. | `Bearer {access-token}` |

## Request Parameters

None. Nomor order disimpan di body; jangan gunakan path agar URL tidak membocorkan identifier customer ke browser history/referrer.

## Request Query Parameters

None. Nomor WhatsApp dan order number tidak boleh dikirim melalui query string.

## Request Body

| Attribute     | E/N/T | Type   | M/O/C | Max Length | Description                                                                        | Example          |
| ------------- | ----- | ------ | ----- | ---------: | ---------------------------------------------------------------------------------- | ---------------- |
| `orderNumber` | N     | String | M     |         32 | Nomor order yang diterima saat checkout; trim dan uppercase bila format mendukung. | `JH-2026-000123` |
| `whatsapp`    | N     | String | M     |         32 | Nomor WhatsApp yang dipakai saat order; dinormalisasi sebelum dibandingkan.        | `+6281234567890` |

### Example Request Body

```json
{
  "orderNumber": "JH-2026-000123",
  "whatsapp": "+6281234567890"
}
```

### Request Validation

1. Body harus JSON object dengan `orderNumber` dan `whatsapp`; field kosong/missing mengembalikan `ORDB02001`.
2. `orderNumber` harus sesuai format yang diterbitkan order service dan maksimal 32 karakter. Format contoh `JH-YYYY-NNNNNN`; format final mengikuti generator order number.
3. `whatsapp` harus nomor valid dan dapat dinormalisasi; maksimal 32 karakter. Jangan menyimpan raw input bila normalisasi gagal.
4. Field tak dikenal ditolak dengan `ORDB02001`; kredensial, password, OTP, atau payment data tidak diterima.
5. Lookup harus memakai constant-time/safe comparison bila phone verifier hash digunakan dan query harus diparameterisasi.
6. Lookup gagal karena order tidak ditemukan, nomor tidak cocok, atau order tidak lagi dapat diverifikasi mengembalikan response generik `ORDB02002` dengan bentuk dan timing yang tidak memudahkan enumeration.
7. Terapkan throttling sebelum dan selama lookup. Jika limit terlampaui, gunakan error generic/security response dan jangan mengonfirmasi keberadaan order.
8. Kegagalan database mengembalikan HTTP 500 `ORDT03001` tanpa detail internal.

## Response Body

Semua response menggunakan envelope `status` dan `data`. Sukses mengembalikan detail publik; error verifikasi mengembalikan `data: null`.

| Attribute                           | E/N/T | Type               | M/O/C |           Max Length | Description                                                          | Example                      |
| ----------------------------------- | ----- | ------------------ | ----- | -------------------: | -------------------------------------------------------------------- | ---------------------------- |
| `status`                            | N     | Object             | M     |                    — | Object status response.                                              | `{}`                         |
| `status.code`                       | N     | String             | M     |                   20 | Service status code.                                                 | `ORDS00000`                  |
| `status.message`                    | N     | String             | O     |                  200 | Pesan hasil; generik bila verifikasi gagal.                          | `Order status retrieved`     |
| `data`                              | N     | Object/null        | M     |                    — | Payload hasil; null saat error.                                      | `{}`                         |
| `data.order`                        | N     | Object             | C     |                    — | Detail order yang aman untuk customer.                               | `{}`                         |
| `data.order.orderNumber`            | N     | String             | C     |                   32 | Nomor order terverifikasi.                                           | `JH-2026-000123`             |
| `data.order.status`                 | N     | String             | C     |                   30 | Status order storage.                                                | `PROCESSING`                 |
| `data.order.statusLabel`            | N     | String             | C     |                   50 | Label status customer-facing Bahasa Indonesia.                       | `Sedang diproses`            |
| `data.order.paymentStatus`          | N     | String             | O     |                   30 | Payment status yang aman untuk customer.                             | `PAID`                       |
| `data.order.paymentStatusLabel`     | N     | String             | O     |                   50 | Label tahap pembayaran.                                              | `Pembayaran terverifikasi`   |
| `data.order.gameName`               | N     | String             | M     |                  100 | Game snapshot saat order dibuat.                                     | `Roblox`                     |
| `data.order.serviceName`            | N     | String             | M     |                  150 | Service snapshot saat order dibuat.                                  | `Robux 400`                  |
| `data.order.createdAt`              | N     | String (date-time) | M     |                   35 | Waktu order dibuat UTC.                                              | `2026-10-12T09:30:00Z`       |
| `data.order.updatedAt`              | N     | String (date-time) | M     |                   35 | Waktu status/order terakhir diperbarui UTC.                          | `2026-10-12T10:12:00Z`       |
| `data.order.customerWhatsappMasked` | N     | String             | M     |                   32 | Nomor tersimpan dalam bentuk masked.                                 | `+628•••••890`               |
| `data.timeline`                     | N     | Array of Object    | M     | 100 items (proposed) | Timeline customer-safe, kronologis.                                  | `[]`                         |
| `data.timeline[].status`            | N     | String             | M     |                   30 | Status internal yang telah disetujui untuk publik.                   | `PROCESSING`                 |
| `data.timeline[].label`             | N     | String             | M     |                  100 | Label tahap yang tampil ke customer.                                 | `Pesanan diproses`           |
| `data.timeline[].description`       | N     | String/null        | O     |                  200 | Copy publik, tidak berisi alasan internal/PII.                       | `Layanan sedang dikerjakan.` |
| `data.timeline[].occurredAt`        | N     | String (date-time) | M     |                   35 | Waktu event UTC.                                                     | `2026-10-12T10:12:00Z`       |
| `data.trackingToken`                | N     | String             | O     |                 2048 | Token order-scoped untuk refresh berikutnya; TTL dan use policy TBD. | `trk_eyJ...`                 |
| `data.trackingTokenExpiresAt`       | N     | String (date-time) | O     |                   35 | Masa berlaku token tracking.                                         | `2026-10-12T10:27:00Z`       |

### Success Example

```json
{
  "status": {
    "code": "ORDS00000",
    "message": "Order status retrieved"
  },
  "data": {
    "order": {
      "orderNumber": "JH-2026-000123",
      "status": "PROCESSING",
      "statusLabel": "Sedang diproses",
      "paymentStatus": "PAID",
      "paymentStatusLabel": "Pembayaran terverifikasi",
      "gameName": "Roblox",
      "serviceName": "Robux 400",
      "createdAt": "2026-10-12T09:30:00Z",
      "updatedAt": "2026-10-12T10:12:00Z",
      "customerWhatsappMasked": "+628•••••890"
    },
    "timeline": [
      {
        "status": "PENDING_PAYMENT",
        "label": "Menunggu pembayaran",
        "description": "Selesaikan pembayaran sesuai instruksi.",
        "occurredAt": "2026-10-12T09:30:00Z"
      },
      {
        "status": "PENDING_VALIDATION",
        "label": "Menunggu verifikasi pembayaran",
        "description": "Admin sedang memeriksa pembayaran kamu.",
        "occurredAt": "2026-10-12T09:50:00Z"
      },
      {
        "status": "PROCESSING",
        "label": "Pesanan diproses",
        "description": "Layanan sedang dikerjakan.",
        "occurredAt": "2026-10-12T10:12:00Z"
      }
    ],
    "trackingToken": "trk_eyJ...",
    "trackingTokenExpiresAt": "2026-10-12T10:27:00Z"
  }
}
```

### Business Error Example

```json
{
  "status": {
    "code": "ORDB02002",
    "message": "Order could not be verified. Check the order number and WhatsApp, then try again."
  },
  "data": null
}
```

### Technical Error Example

```json
{
  "status": {
    "code": "ORDT03001",
    "message": "Order tracking is temporarily unavailable"
  },
  "data": null
}
```

## HTTP Status Codes

| HTTP Status | Usage                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `200`       | Order ditemukan dan WhatsApp terverifikasi; detail/timeline publik dikembalikan.                                               |
| `400`       | Input format tidak valid, lookup tidak terverifikasi, atau throttling policy menolak request sesuai baseline response project. |
| `500`       | Unexpected order/tracking database failure.                                                                                    |

## Service Status Codes

Format: `[Service Prefix][Status Type][Category][Specific Error Code]`

| Code        | Type      | Category        | Meaning                                                             |
| ----------- | --------- | --------------- | ------------------------------------------------------------------- |
| `ORDS00000` | Success   | General         | Status order berhasil dikembalikan setelah verifikasi.              |
| `ORDB02001` | Business  | User validation | Nomor order/WhatsApp wajib atau format input tidak valid.           |
| `ORDB02002` | Business  | User validation | Kombinasi order number dan WhatsApp tidak dapat diverifikasi.       |
| `ORDB02003` | Business  | User validation | Lookup dibatasi oleh abuse/rate-limit policy; pesan dibuat generik. |
| `ORDT03001` | Technical | Database        | Order atau status history gagal dibaca/database tidak tersedia.     |

## API Exposure Classification

| Classification | Rationale                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public         | Customer-facing endpoint mengekspos status order setelah verifikasi PII. Wajib anti-enumeration, throttling, minimal response, dan masking contact. |

## Testing & Documentation Scope

| Scope      | Required | Rationale / Handoff                                                                                                                                                      |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| NFT        | Yes      | Uji lookup latency, status-history size, throttle behavior, concurrent polls, dan valid/invalid lookup ratios. Traffic, rate limits, and SLA targets TBD.                |
| VA/Pentest | Yes      | Uji order enumeration, WhatsApp brute force, IDOR, response/timing differences, rate-limit bypass, PII leakage, tracking-token replay/scope, and history data isolation. |

## Assumptions

- Endpoint POST `/api/orders/v1/tracking/lookup` menggabungkan verifikasi dan detail awal agar nomor WhatsApp tidak muncul pada URL. Bentuk response/error mengikuti baseline API project dan perlu review.
- UI route `/cek-pesanan` dan `/cek-pesanan/[orderId]` saat ini belum terhubung backend; sessionStorage phone hanya mock lokal dan tidak dianggap sebagai mekanisme aman.
- Order number, WhatsApp snapshot, order status/history, dan payment status mengacu ke [Order ERD](../../erd/order-erd.md).
- Format order number, phone normalization/hash strategy, login vs guest policy, throttle thresholds, tracking-token TTL, public status copy, and HTTP auth/error mapping masih TBD.
- PII masking, analytics/log redaction, account deletion/anonymization impact, and retention require privacy/security owner decision.
- Endpoint hanya read status; order list/detail admin, payment proof submission/review, support contact, cancellation, and refund operations are separate flows.

## References

- `src/app/cek-pesanan/page.tsx` — public order lookup route.
- `src/app/cek-pesanan/[orderId]/page.tsx` — public tracking result route.
- `src/features/OrderTracking/views/pages/OrderTracking.page.tsx` — order number/WhatsApp form and current navigation behavior.
- `src/features/OrderTracking/views/pages/OrderTrackingResult.page.tsx` — current simulated status and timeline presentation.
- `docs/sprint_1/solutioning/erd/order-erd.md` — order, payment, and status history model plus tracking verification notes.
- `docs/sprint_1/solutioning/public/checkout/continue-to-payment.md` — checkout order creation and initial statuses.
- `docs/sprint_1/solutioning/TEMPLATE.md` — API contract template.
