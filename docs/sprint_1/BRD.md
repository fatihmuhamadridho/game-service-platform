# JokiHub — Sprint 1 Business Requirements Document

> **Status:** Draft  
> **Sprint:** 1  
> **Source:** Sprint 1 public and Admin Dashboard solutioning documents, ERDs, and current UI flows. Solutioning documents remain proposals until business and API owners approve them.

## 1. Project Overview

Sprint 1 defines the business capabilities and API/data requirements for JokiHub's public storefront and Admin Dashboard. Customers need to discover game services, place orders, submit manual payment evidence, and track order progress. Administrators need to manage catalog and accounts, monitor orders/transactions, review platform activity, and maintain general settings.

Current screens contain prototype data and simulated interactions. This BRD describes the intended Sprint 1 capability scope; it does not treat mock values, prices, service availability, guarantees, contacts, or marketing claims as confirmed production data.

## 2. Objectives

- Enable customers to browse published games, service categories, and services available for a selected game.
- Enable customers to submit a valid fixed-price order and continue to an approved manual payment method.
- Let customers submit payment evidence and view verified, customer-safe order status.
- Enable authorized administrators to manage the operational data required by the storefront.
- Give authorized administrators a consistent view of dashboard metrics, orders, financial transactions, and activity history.
- Protect customer, admin, payment, and audit data through access controls, privacy rules, and traceable changes.

Success measures and targets are **TBD**. Product/operations owners must define adoption, order completion, service availability, and performance targets before release.

## 3. Scope

### In Scope

**Public storefront and customer flows**

- Customer registration, login, logout, and token refresh, subject to the approved identity design.
- Public listing of active games, popular games, and service categories.
- Retrieval of active services and authoritative display pricing for a game slug.
- Checkout validation and creation of an order/payment attempt using server-side catalog pricing.
- Manual payment instructions for approved methods, currently proposed as QRIS and BCA transfer.
- Secure payment-proof upload/submission for eligible payment attempts, followed by manual review status.
- Order lookup using order number and the WhatsApp number used at checkout; retrieval of a customer-safe status timeline.

**Admin Dashboard**

- Dashboard overview of approved business metrics, breakdowns, recent orders, and recent activity.
- Read/list/detail access for orders and financial transactions.
- Member/user management and separate admin-account management, including role assignment under approved RBAC rules.
- Role and permission management.
- Game, service category, and service catalog management.
- General platform settings management.
- Read-only activity-log listing and audit-event recording for administrative actions.

### Out of Scope

- Automated payment-provider settlement, payment gateway callbacks, and automated reconciliation; Sprint 1 payment flow assumes manual review unless separately approved.
- Executing refunds, payouts, and payment reversal workflows. Transaction reporting may show settled refunds but does not execute them.
- Service fulfillment execution, provider/vendor integrations, and guarantees or turnaround commitments not confirmed by the business.
- Quote negotiation and approval workflow for custom/quote-required services. Such services must not proceed to payment until a separate quote flow establishes a final price.
- Promo/voucher validation and discount application until promo rules and a source of truth are defined.
- Admin payment-proof approve/reject operations unless included in a separately approved requirement/contract.
- Multi-currency settlement, tax, fees, and foreign exchange unless finance requirements are approved.
- Analytics export, report scheduling, and dashboard customization.
- Production catalog values, contact details, prices, time estimates, support hours, guarantees, and marketing claims that have not been confirmed.

## 4. Business Requirements

| ID     | Requirement                                                                                                                                                                                                                                                             |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-001 | As a visitor, I need to view active public games so that I can find a game with available services.                                                                                                                                                                     |
| BR-002 | As a visitor, I need to search, filter, sort, and paginate the game catalog so that I can find relevant games efficiently.                                                                                                                                              |
| BR-003 | As a visitor, I need to see active service categories so that I can navigate the storefront by service type. Categories with no eligible public services should not lead to empty purchase choices.                                                                     |
| BR-004 | As a customer, I need to view active services for the game identified by the order page slug so that I can select a valid service.                                                                                                                                      |
| BR-005 | As a customer, I need to distinguish fixed-price services from quote-required services so that I am not shown an invented price or allowed to pay an unapproved quote.                                                                                                  |
| BR-006 | As a customer, I need to register and authenticate through the approved identity flow so that I can use account-based features. Authentication credentials and OTPs must not be collected in general order fields.                                                      |
| BR-007 | As a customer, I need to submit an order with customer contact, game account identifier, selected service, and quantity so that JokiHub can process my request. The system must validate service availability and calculate price/total from authoritative server data. |
| BR-008 | As a customer, I need order and item details preserved as purchase-time snapshots so that later catalog changes do not alter my order history or agreed amount.                                                                                                         |
| BR-009 | As a customer, I need to choose an available payment method and receive current payment instructions so that I can pay the created order. An order created for payment must not be represented as paid.                                                                 |
| BR-010 | As a customer, I need to submit payment evidence securely for an eligible payment attempt so that an administrator can review the payment. Successful evidence submission means pending review, not confirmed settlement.                                               |
| BR-011 | As a customer, I need to check an order using its order number and the WhatsApp number used at checkout so that only someone with matching order details can see its status. Failed lookups must not disclose whether either value was correct.                         |
| BR-012 | As a customer, I need to see a customer-safe order status and timeline so that I can understand payment validation and fulfillment progress. Order status and payment status must remain distinct.                                                                      |
| BR-013 | As an authorized administrator, I need to view an overview of orders, revenue, users, services, and operational activity so that I can monitor platform operations. Metric definitions and currency basis must be approved before values are treated as authoritative.  |
| BR-014 | As an authorized administrator, I need to list and inspect orders so that I can support customer and operational workflows without exposing unnecessary customer data.                                                                                                  |
| BR-015 | As an authorized administrator, I need to list and inspect financial transactions for order payments and refunds so that I can monitor recorded financial movements. Payouts and refund execution are separate workflows.                                               |
| BR-016 | As an authorized administrator, I need to manage member accounts separately from admin accounts so that customer lifecycle actions do not accidentally grant administrative privileges.                                                                                 |
| BR-017 | As an authorized administrator, I need to create and manage admin accounts with explicitly assigned roles so that privileged access is controlled and auditable. Credential setup must use the approved identity/invitation flow.                                       |
| BR-018 | As an authorized administrator, I need to manage roles and permissions so that admin access can follow least-privilege rules. Protected roles and permission delegation must be enforced.                                                                               |
| BR-019 | As an authorized administrator, I need to manage games, service categories, and services so that the public catalog reflects approved offerings. Inactive or removed catalog entries must not be offered for new orders.                                                |
| BR-020 | As an authorized administrator, I need to update general platform settings so that approved platform information, contacts, regional preferences, maintenance mode, and member registration availability can be maintained.                                             |
| BR-021 | As an authorized administrator, I need to review recent administrative activity with search, category, and date filters so that I can investigate changes and operational events.                                                                                       |
| BR-022 | As the business, I need administrative actions recorded as append-only audit events with actor, action, target, outcome, and time so that changes can be investigated. Secrets and unnecessary personal/payment data must be redacted.                                  |
| BR-023 | As the business, I need all public and administrative operations to validate inputs and enforce the caller's authorization so that invalid or unauthorized actions do not change protected data.                                                                        |
| BR-024 | As the business, I need retries of order creation and payment-proof submission to avoid duplicate effects so that transient failures or repeated clicks do not create duplicate orders or proof records.                                                                |
| BR-025 | As the business, I need customer PII and uploaded payment evidence to be access-controlled, minimized, and retained only under an approved policy so that customer privacy and financial evidence are protected.                                                        |

## 5. Assumptions

- Sprint 1 solutioning documents, ERDs, and current screens are the working source for capability discovery, but remain drafts pending stakeholder approval.
- Public checkout may support guest orders because the current checkout UI does not require sign-in. Account linking and recovery policies are TBD.
- Payment methods are proposed as manual QRIS and BCA transfer. Provider/configuration ownership, fees, expiry duration, and exact method codes are TBD.
- Order and payment statuses are separate. Final initial status values and transition rules must be reconciled across order, payment-proof, tracking, and admin workflows.
- Fixed-price service prices are authoritative only when retrieved and recalculated by the server. Client totals are display-only.
- The platform initially uses IDR and Indonesian customer-facing copy, consistent with current UI. Multi-currency support is not assumed.
- Game inventory, service catalog, prices, descriptions, estimates, contact information, and business claims shown in prototypes are illustrative until confirmed.
- A shared RBAC model governs Admin Dashboard access. Identity provider, permission names, admin invitation, and high-risk role delegation rules are TBD.
- General settings use a proposed single current settings record; the specific table and audit/cache integration remain subject to ERD and architecture approval.
- Activity logs use a proposed shared append-only audit store. Event taxonomy, retention, fail-open/fail-closed behavior, and PII policy require security/privacy approval.
- Dashboard revenue, customer counts, service counts, comparison periods, and data freshness require product/finance/data-owner definitions.
- API paths, service codes, HTTP status mappings, pagination limits, and SLA values in solutioning are proposals, not approved production commitments.

## 6. Task Breakdown & Timeline

Sprint duration, estimates, and release dates are not available in current source material; timing remains **TBD**.

| Task or milestone               | Description                                                                                                            | Indicative timing |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Requirement and contract review | Confirm BRD scope, solutioning contracts, ERDs, owners, and unresolved decisions.                                      | TBD               |
| Identity and access foundation  | Approve customer/admin identity model, RBAC permissions, admin invitations, and guest-order access.                    | TBD               |
| Catalog capability              | Implement approved game, category, and service data management plus public catalog reads.                              | TBD               |
| Order and manual payment        | Implement authoritative checkout, order snapshots, payment instructions, proof submission, and payment review handoff. | TBD               |
| Customer tracking               | Implement order/WhatsApp verification and customer-safe status timeline.                                               | TBD               |
| Admin operations                | Implement dashboard overview, order/transaction reads, user/admin/role management, and general settings.               | TBD               |
| Audit and security controls     | Implement audit event capture, access controls, PII/file protections, retention, and abuse throttling.                 | TBD               |
| Readiness and release           | Confirm catalog/business data, operational procedures, performance targets, and security readiness.                    | TBD               |

Dependencies include approved catalog/price data, payment instructions, identity provider and RBAC decisions, audit infrastructure, object storage/scanning, and order/payment status policy.

## 7. Open Questions

- Who approves the final Sprint 1 scope and requirement acceptance? — Owner: Product owner; Needed by: TBD
- Is guest checkout allowed for release, and how are guest orders securely linked or recovered? — Owner: Product/security; Needed by: TBD
- Which payment methods are supported at launch, who owns their QRIS/bank instructions, and what are the expiry and fee rules? — Owner: Finance/operations; Needed by: TBD
- What exact order and payment status enums/transitions apply, especially before and after proof submission, proof rejection, expiry, and retry? — Owner: Product/operations; Needed by: TBD
- Who performs manual payment-proof review, and are approve/reject APIs and procedures included in Sprint 1? — Owner: Finance/operations; Needed by: TBD
- What file formats, maximum size/count, malware scanning, access duration, and retention apply to payment proof? — Owner: Security/operations; Needed by: TBD
- Which services require quotes, and what is the approved quote acceptance flow? — Owner: Product/operations; Needed by: TBD
- Are promotions, fees, tax, or discounts required in Sprint 1? If yes, what service owns validation and calculation? — Owner: Product/finance; Needed by: TBD
- What is the source and definition of dashboard revenue, including refunds, settlement date, failed/pending transactions, and currency? — Owner: Finance/data; Needed by: TBD
- What are the approved game platforms, service categories, ordering rules, service availability rules, and production catalog values? — Owner: Catalog/product; Needed by: TBD
- What is the admin/user identity-provider model, permission taxonomy, role delegation policy, and `SUPER_ADMIN` creation policy? — Owner: Security/IAM; Needed by: TBD
- What activity-log categories, action taxonomy, retention period, privacy masking, and audit-write failure behavior are required? — Owner: Security/compliance; Needed by: TBD
- Which fields are editable in general settings, what are the approved production defaults, and who may change maintenance/registration switches? — Owner: Product/operations; Needed by: TBD
- What are the expected traffic, availability, freshness, response-time, and performance targets for public and admin APIs? — Owner: Product/engineering; Needed by: TBD
- Which API conventions are mandatory: `201` versus `200`, `401/403/404/409/412` mappings, unknown-query handling, pagination style, and service code format? — Owner: API/platform; Needed by: TBD
- What data-retention, anonymization, and deletion rules apply to customer, order, transaction, admin, audit, and payment-proof records? — Owner: Legal/privacy/security; Needed by: TBD

