# Public order tracking implementation

This implements `docs/sprint_1/public/orders/track-order.md` and `get-order-status.md` in the existing `/cek-pesanan` flow.

## Lookup and refresh

- `POST /api/orders/v1/tracking/lookup` accepts only `orderNumber` and `whatsapp`; it normalizes both, returns the same generic mismatch error, and throttles by IP and HMAC-derived IP/order/phone bucket.
- Successful lookup returns the safe order snapshot, masked WhatsApp, merged order/payment timeline, and a 256-bit random tracking token. Only its SHA-256 hash is stored in `order_tracking_token`.
- Tracking token is scoped to one order, expires after 15 minutes, and a new successful lookup revokes prior active tokens for that order. Token is held in tab-scoped `sessionStorage`; it never appears in URL/query or referrer.
- `GET /api/orders/v1/tracking/{orderNumber}/status` requires the token in `Authorization: Bearer`. It verifies token expiry/revocation and order scope, then returns public-safe order/payment status and up to 50 timeline events. It never returns full phone, account credentials, review notes, or internal actor identifiers.
- Existing detail page refreshes every 30 seconds. Expired token returns customer to verification form. Transient service errors preserve last confirmed status.

## Database and setup

- Migration `20261013T1909_order_tracking_token` adds token hash, order scope, expiry, revocation fields, and lookup indexes. `pnpm generate:db` updates the ORM contract; migration has been applied to the configured database.
- Lookup and status requests share `order-tracking` rate buckets. Run `pnpm init:auth-rate-limit` after applying the base rate-limit migration so its index exists.
