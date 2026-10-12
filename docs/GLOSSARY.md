# Glossary

Use this glossary for terms shared across the project specification and current-state documents. Define feature-specific terms in the document where they are introduced.

| Term                                      | Definition                                                                                                                                          |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acceptance Criteria                       | Verifiable conditions that describe when a requirement or user story is met.                                                                        |
| API (Application Programming Interface)   | A defined way for software systems to exchange requests and responses.                                                                              |
| API Contract                              | A specification of an API’s behavior, including its endpoint, inputs, outputs, rules, and errors.                                                   |
| Assumption                                | An unconfirmed condition treated as true for planning or analysis.                                                                                  |
| Backward Compatibility                    | The ability of a change to work with existing consumers or integrations without requiring incompatible changes from them.                           |
| BRD (Business Requirements Document)      | A document describing business context, objectives, scope, requirements, assumptions, and open questions.                                           |
| Business Rule                             | A policy or condition that governs a business decision or process.                                                                                  |
| Conditional (C)                           | A field or parameter is required only when a stated condition applies. Used in the M/O/C notation.                                                  |
| Current State                             | The behavior, process, or system as it exists now.                                                                                                  |
| Dependency                                | A person, decision, system, or deliverable that the work relies on.                                                                                 |
| E/N/T                                     | Field-change notation: Existing, New, or Take Out.                                                                                                  |
| Existing (E)                              | A field or capability already present and retained in the described change. Used in the E/N/T notation.                                             |
| HTTP (Hypertext Transfer Protocol)        | A protocol used for communication between web clients and servers.                                                                                  |
| HTTP Status Code                          | A numeric response code indicating the outcome category of an HTTP request, such as success or error.                                               |
| Idempotency Key                           | A request identifier used to recognize retries and prevent the same operation from being applied more than once.                                    |
| Mandatory (M)                             | A field or parameter that must be provided. Used in the M/O/C notation.                                                                             |
| M/O/C                                     | Requiredness notation: Mandatory, Optional, or Conditional.                                                                                         |
| New (N)                                   | A field or capability introduced by the described change. Used in the E/N/T notation.                                                               |
| Optional (O)                              | A field or parameter that may be omitted. Used in the M/O/C notation.                                                                               |
| SLA (Service-Level Agreement)             | An agreed service target, such as availability or response time, measured under stated conditions.                                                  |
| Story                                     | A concise description of a user’s need and the value they expect. Often written from the user’s perspective.                                        |
| Take Out (T)                              | An existing field or capability removed by the described change. Used in the E/N/T notation.                                                        |
| Technical Flow                            | An ordered description of interactions between users, systems, services, or dependencies.                                                           |
| TBD (To Be Determined)                    | A detail that is not yet known or decided and needs follow-up.                                                                                      |
| User                                      | A person or role that interacts with a product, process, or service.                                                                                |
| User Story                                | A short statement of who needs a capability, what they need, and why they need it.                                                                  |
| Validation                                | Checks that confirm input or an action meets defined requirements and rules.                                                                        |
| When / Given / Then                       | A format for expressing a scenario: Given describes context, When describes an action or event, and Then describes the expected outcome.            |
| Admin Account                             | A privileged platform identity used to access the Admin Dashboard. It is separate from a member/customer account and receives access through RBAC.  |
| Activity Log / Audit Event                | An immutable server-side record of an administrative action, including actor, action, target, outcome, and time. Sensitive values must be redacted. |
| Append-Only                               | A data pattern where records are added but not edited or deleted by normal application flows; retention is handled separately.                      |
| Asset Key                                 | A trusted identifier for an approved image or icon in an asset registry/CDN. It is not an arbitrary user-supplied URL.                              |
| Authentication                            | Verifying the identity of a user or system, for example through an identity provider or access token.                                               |
| Authorization                             | Checking whether an authenticated identity may perform a specific action or access a resource.                                                      |
| Cache Invalidation                        | Removing or refreshing cached data after its source changes so consumers receive current values.                                                    |
| Catalog                                   | The published collection of games, service categories, and services available for discovery or purchase.                                            |
| Checkout                                  | The customer flow that selects a game/service, enters order details, reviews the total, and proceeds to payment.                                    |
| Currency (ISO 4217)                       | A standardized three-letter currency code, such as `IDR`, used with monetary amounts.                                                               |
| ETag                                      | An HTTP validator representing a resource version, used for conditional requests or concurrency checks.                                             |
| Fixed-Price Service                       | A service with a server-defined price that can be included in order total calculation.                                                              |
| Guest Checkout                            | An order flow that does not require a signed-in member account; customer details are stored as order-specific snapshots.                            |
| Identity Provider (IdP)                   | A system responsible for authenticating identities and, where applicable, provisioning credentials or invitations.                                  |
| IANA Time Zone                            | A standardized time-zone identifier, such as `Asia/Jakarta`, used for display or business-time interpretation.                                      |
| Idempotency                               | A property that makes retries of the same request avoid creating duplicate effects or resources.                                                    |
| Ledger / Financial Transaction            | A reporting record of a payment or refund movement; it does not replace the order or refund workflow's own status.                                  |
| Manual Payment Validation                 | A process where a customer submits payment proof and an authorized admin reviews it before payment is confirmed.                                    |
| Member                                    | A customer account/profile used for storefront registration and member-facing features; distinct from an admin account.                             |
| Order                                     | A customer purchase record with item, customer, price, and status snapshots that preserve facts at purchase time.                                   |
| Order Item Snapshot                       | The purchase-time copy of game, category, service, quantity, price, and fulfillment details stored with an order.                                   |
| Order Number                              | A customer-facing reference used to identify an order in support and tracking flows.                                                                |
| Order Status                              | The lifecycle state of order fulfillment, such as `PENDING_PAYMENT`, `PROCESSING`, or `COMPLETED`.                                                  |
| Payment Attempt                           | One attempt to pay an order using a selected payment method. An order may have more than one attempt if policy allows.                              |
| Payment Proof                             | A file and metadata submitted by a customer as evidence of a manual payment; submission does not itself confirm settlement.                         |
| Payment Status                            | The lifecycle state of a payment attempt, separate from the order's fulfillment status.                                                             |
| PII (Personally Identifiable Information) | Information that can identify or contact a person, such as name, email, phone number, or IP address; access and retention must be controlled.       |
| Platform Settings                         | The current general configuration snapshot for public platform identity, contact details, regional preferences, and storefront switches.            |
| Public API                                | An endpoint accessible to storefront clients or visitors; it requires input validation, rate limiting, and protection against data exposure.        |
| Quote-Required Service                    | A service without a fixed price; it requires an approved quote and final amount before order payment can proceed.                                   |
| RBAC (Role-Based Access Control)          | An access-control model where permissions are grouped into roles and assigned to admin accounts.                                                    |
| Refund                                    | A return of funds associated with an order. Refund request/review status and completed refund transaction are distinct concepts.                    |
| Service                                   | A purchasable game-related offering with category, availability, estimate, and fixed or quote-required pricing.                                     |
| Service Category                          | A grouping used to classify services, such as top-up or game boosting.                                                                              |
| Soft Delete                               | A logical removal marker, usually a deletion timestamp, that hides a record from normal use while preserving historical references.                 |
| Status History                            | An ordered record of lifecycle transitions, including old/new status, actor or system, reason, and transition time.                                 |
| Tracking Token                            | A short-lived, order-scoped credential issued after order verification and used to retrieve customer-safe status details.                           |
| UTC                                       | Coordinated Universal Time; timestamps are stored/transmitted in UTC and converted for local display when needed.                                   |
| Version / Optimistic Concurrency          | A resource version checked during updates to prevent one administrator from silently overwriting another administrator's newer change.              |
