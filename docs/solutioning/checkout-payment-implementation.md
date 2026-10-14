# Checkout and manual payment implementation

This note records the implemented checkout flow against `docs/sprint_1/public/checkout` contracts. It uses manually configured QRIS image or bank transfer details; no payment gateway is connected.

## Checkout

- `POST /api/orders/v1/checkout` requires an `Idempotency-Key`, active game and service, customer name and WhatsApp, game account data, quantity, and `QRIS` or `BCA_TRANSFER`.
- Server reloads catalog prices and platform currency, then creates order, item snapshot, payment, and status history. Custom-price services remain quote-only and cannot be submitted as paid checkout.
- Key and normalized request hash are stored in `checkout_idempotency`. Exact retries replay response; reuse with changed input returns conflict. In-progress requests return conflict.
- Initial order/payment states are `PENDING_PAYMENT` / `UNPAID`; unpaid order expires after 30 minutes.
- Checkout is available only when corresponding payment instructions are configured. Set `PAYMENT_QRIS_IMAGE_URL` or all `PAYMENT_BCA_*` variables. These variables provide instructions only; they do not verify payment.

## Proof upload and admin review

- `POST /api/orders/v1/payments/{paymentId}/proofs` accepts multipart `file`, `orderNumber`, and `whatsapp`. It only accepts valid JPEG/PNG up to 5 MiB, normalizes image to PNG, and stores it privately through S3-compatible object storage.
- `GET /api/orders/v1/payments/{paymentId}/status` verifies the same order number and WhatsApp, then returns payment status, the review note when rejected, expiry, and whether proof can be resubmitted. Existing checkout confirmation polls this endpoint and lets the customer upload replacement proof after rejection while order remains valid.
- Order number and WhatsApp must match an unexpired payment. Payment status uses a conditional transition from `UNPAID` to `PENDING_REVIEW`; duplicate submissions return the existing pending result.
- Configure `OBJECT_STORAGE_ENDPOINT`, `OBJECT_STORAGE_REGION`, `OBJECT_STORAGE_BUCKET`, `OBJECT_STORAGE_ACCESS_KEY_ID`, and `OBJECT_STORAGE_SECRET_ACCESS_KEY`. Set `OBJECT_STORAGE_FORCE_PATH_STYLE=false` only for a provider using virtual-host bucket addressing. Production requires HTTPS endpoint.
- Private bucket access is required. Admin order detail creates a five-minute signed view URL for each proof. Admins with `orders-manage` can approve or reject proof from the existing order detail modal.
- Approval conditionally changes payment to `PAID`, order payment status to `PAID`, order status to `PROCESSING`, writes both histories, and creates a successful financial transaction for the transaction dashboard. Rejection returns an unexpired order to `UNPAID` / `PENDING_PAYMENT`, retaining submitted proof and review note so customer can submit a replacement. Rejection after expiry sets payment `FAILED` and order `CANCELLED`.
- Customer sees “Menunggu Verifikasi” after proof receipt. This is not a paid confirmation; only admin approval marks payment paid. Gateway verification and automated settlement remain outside provider-free scope.

## Database and operations

- Apply migration `20261013T1845_checkout_idempotency` after `20261013T1833_auth_action_tokens`; it creates the idempotency collection and expiry lookup index.
- `pnpm generate:db` regenerates Prisma client after schema changes.
- Missing payment instructions or storage credentials produce explicit 503 responses. Never simulate a successful payment or upload.
