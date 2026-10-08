# JokiHub — Design Specification

> Status: Draft · Version: 1.0 · Based on the approved dark-mode wireframes (landing and order/checkout, desktop and mobile).

## 1. Product overview

JokiHub is a responsive gaming-services storefront for browsing games, selecting digital services (e.g., joki/rank boosting and top-ups), and placing orders. The experience should feel fast, trustworthy, easy to scan, and mobile-first.

**Primary user flow:** Landing → Select game/service → Configure order → Enter account/contact details → Review summary → Select payment method → Submit order / receive instructions.

**Design direction:** Dark mode **by default**, with deep navy surfaces, electric-blue accents, rounded cards, game imagery, compact information density, and strong calls to action.

**Scope of this design:**

- Landing page — desktop and mobile
- Order / checkout page — desktop and mobile
- Global header, navigation, and footer
- Reusable UI elements and responsive behavior

**Out of scope for the current wireframes:** Auth pages, order-tracking detail page, payment-provider flows, admin interface, and service management. Navigation references these features but their screens require separate designs.

## 2. Information architecture

```text
/
├── Hero
├── Popular games
├── Service categories
├── Top-up promotion
├── Trust / benefits
└── Footer

/services or /games
└── Game & service listing (future design)

/order/:gameSlug
├── 1. Choose game
├── 2. Choose service
├── 3. Order details
├── 4. Payment method (future detailed design)
└── Order summary

/orders/track (future design)
/help (future design)
/login, /register (future design)
```

Use clear Indonesian UI copy as shown in the reference wireframe. Keep brand and game titles in their original names.

## 3. Visual system

### 3.1 Colors

The following tokens are **implementation recommendations**, not sampled pixel-perfect values from the illustration.

| Token              | Hex       | Usage                                 |
| ------------------ | --------- | ------------------------------------- |
| `--bg`             | `#090F1B` | App/page background                   |
| `--surface`        | `#111C2B` | Cards, panels, form groups            |
| `--surface-raised` | `#172438` | Hover, inputs, highlighted containers |
| `--border`         | `#29394D` | Outlines and dividers                 |
| `--text`           | `#F4F7FC` | Main copy / headings                  |
| `--text-muted`     | `#94A6BC` | Descriptions, placeholders            |
| `--primary`        | `#1675FF` | CTA, selected state, active links     |
| `--primary-hover`  | `#348BFF` | CTA hover                             |
| `--primary-subtle` | `#102A52` | Selected card background              |
| `--success`        | `#28C78D` | Success / confirmed orders            |
| `--error`          | `#FB6776` | Errors and validation                 |
| `--warning`        | `#F4B94A` | Pending / warnings                    |

Dark mode is the initial and canonical theme (`color-scheme: dark`). A light theme is not required for this version.

### 3.2 Typography

- Font: **Inter** (fallback: system sans-serif).
- Desktop hero heading: 40–48px / 1.1; mobile: 28–34px / 1.15.
- Section heading: 22–26px desktop; 18–22px mobile.
- Card heading: 14–16px, semibold/bold.
- Body: 14–16px; secondary: 12–14px.
- Prices: bold, with blue for totals/featured prices.
- Maintain accessible contrast between text and dark surfaces.

### 3.3 Layout / shape

| Property              | Desktop                      | Mobile                       |
| --------------------- | ---------------------------- | ---------------------------- |
| Content width         | Max 1200–1280px, centered    | 100% minus 16px side padding |
| Grid                  | 12 columns; flexible content | 1–2 columns as appropriate   |
| Section spacing       | 40–64px                      | 24–36px                      |
| Card gap              | 12–20px                      | 8–12px                       |
| Card radius           | 10–14px                      | 10–12px                      |
| Input height          | 40–44px                      | ≥44px                        |
| Primary button height | 44–48px                      | ≥48px                        |

Breakpoints: mobile `< 640px`, tablet `640–1023px`, desktop `≥ 1024px`. Avoid horizontal page overflow; use contained horizontal scrolling only for dense game selection rows.

### 3.4 Icons and assets

- Use consistent outline icons (e.g., Lucide) for utility actions, trust benefits, category tiles, and contact methods.
- Show recognizable game artwork where licensing permits. Otherwise use consistent placeholders.
- Use a gaming-themed hero illustration (person with headset/controller), ideally transparent or dark-friendly artwork.
- Do not use screenshots or game assets without appropriate rights.

## 4. Global components

### 4.1 Header — desktop

- Logo on the left: gamepad icon + **JokiHub** (blue accent).
- Nav links: **Beranda**, **Layanan** (dropdown), **Cek Pesanan**, **Bantuan**.
- Search field: `Cari game atau layanan...`.
- Right side: **Masuk / Daftar** when signed out; avatar when signed in.
- Active nav item gets blue emphasis; use visible keyboard focus states.

### 4.2 Header — mobile

- Compact row with hamburger, centered/near-center logo, search button, and account/avatar icon.
- Hamburger opens a dismissible navigation drawer with links and categories.
- Search button opens an inline search area or overlay; avoid squeezing a full search field into the header.
- Header remains usable at 320px width.

### 4.3 Footer — desktop

Full-width footer separated by top border; five logical areas:

1. **Brand:** JokiHub logo, short description, social icons.
2. **Quick Links:** Beranda, Layanan, Cek Pesanan, Bantuan, Tentang Kami.
3. **Layanan:** Top Up Game, Joki Game, Voucher Game, Pulsa & Paket Data, E-Wallet, Lainnya.
4. **Bantuan:** Pusat Bantuan, Syarat & Ketentuan, Kebijakan Privasi, Hubungi Kami, Status Layanan.
5. **Kontak Kami:** verified email, phone/WhatsApp, service hours.

Bottom line: dynamic copyright year, brand name, and legal links. **Contact details are placeholders until provided by the business.**

### 4.4 Footer — mobile

- Brand logo and short description on top.
- Social icons in a touch-friendly row.
- Link groups can be stacked or rendered as accessible accordions.
- Copyright and legal links below.
- Footer is present on the **mobile landing page** and at the bottom of the order page (not hidden behind the sticky CTA).

### 4.5 Common components

`Button`, `IconButton`, `Input`, `Textarea`, `SearchInput`, `Card`, `Badge`, `GameCard`, `CategoryCard`, `ServiceOption`, `Stepper`, `OrderSummary`, `QuantityStepper`, `TrustBenefit`, `SectionHeader`, `Breadcrumb`, `FooterLinkGroup`, `MobileNavDrawer`, `Toast`, `Skeleton`.

Every interactive element needs hover (where relevant), keyboard focus, disabled, loading, and error states.

## 5. Landing page (`/`)

### 5.1 Desktop structure (top to bottom)

**A. Hero**

- Small eyebrow chip: `Joki Game & Top Up Terpercaya`.
- Main heading: `Top Up Game & Joki Tercepat`, with **Tercepat** blue.
- Supporting description about secure, quick ordering.
- Trust snippets: **Proses Cepat**, **Aman & Terpercaya**, **Harga Kompetitif**, **Layanan 24/7** (only if actually supported).
- Primary CTA: `Lihat Semua Layanan` → services section/listing.
- Secondary CTA: `Cek Pesanan` → order tracking.
- Gaming illustration on the right. Use a two-column hero arrangement.

**B. Game Populer**

- Title, one-line description, `Lihat Semua` link.
- Responsive cards for Roblox, Mobile Legends, Free Fire, PUBG Mobile, Valorant, Genshin Impact (illustrative catalog; configure real availability in data).
- Cards contain game art, game title, brief service label, and optional `Populer` badge.
- Clicking a card goes to that game’s available services/order flow.

**C. Kategori Layanan**

- Grid tiles: Joki Game, Top Up Game, Voucher Game, Pulsa & Paket Data, E-Wallet, Lainnya.
- Each tile has one icon, bold name, and short descriptive text.

**D. Promotional banner**

- Heading: `Butuh Top Up Cepat?`.
- Short message and `Top Up Sekarang` CTA.
- Optional diamond/gaming illustration.

**E. Kenapa Pilih JokiHub?**

- Four compact benefits: Proses Super Cepat, 100% Aman, Harga Terbaik, Layanan 24/7.
- Treat these as proposed marketing copy; validate before publishing any absolute claims.

**F. Footer** — full desktop layout described in §4.3.

### 5.2 Mobile structure

Maintain the same content order, not just a cropped desktop view:

- Compact mobile header.
- Hero copy, illustration below/alongside, benefits row, then **full-width** primary CTA. Secondary CTA may be below or in mobile menu.
- `Game Populer` as a **3-column** image grid where width permits, falling back to 2 columns on narrow screens.
- `Kategori Layanan` as a **2-column** grid.
- Promotion as a vertically stacked card with a full-width CTA.
- Four benefits in a 2-column grid or compact stack.
- **Mobile footer** with brand, social links, grouped links, and copyright.

## 6. Order / checkout page (`/order/:gameSlug`)

### 6.1 Shared content

- Breadcrumb: `Beranda > Shop > Joki Game > Pesan` (adapt to selected category).
- Page title: `Pesan Layanan`.
- Subtitle: `Ikuti langkah di bawah untuk memesan layanan dengan mudah dan cepat.`
- Four labeled steps: **Pilih Game**, **Pilih Layanan**, **Detail Order**, **Bayar**.
- Main form should preserve previous selections when moving between steps.

#### Step 1 — Pilih Game

- Game selector with visual cards; selected game has blue border, tinted background, and check indicator.
- Suggested wireframe games: Roblox, Mobile Legends, Free Fire, PUBG Mobile, Valorant, Genshin Impact.
- If the URL preselects a game, reflect that selection in the UI and allow switching when permitted.

#### Step 2 — Pilih Layanan

- Single-select service rows with radio marker, title, duration estimate, and price.
- Example placeholder options for the Roblox wireframe:

| Service            | Estimate  |  Example price |
| ------------------ | --------- | -------------: |
| Bronze → Silver    | 1–2 days  |      Rp 25.000 |
| Silver → Gold      | 1–3 days  |      Rp 40.000 |
| Gold → Platinum    | 2–4 days  |      Rp 70.000 |
| Platinum → Diamond | 3–5 days  |     Rp 120.000 |
| Joki Star (Custom) | Ask admin | Quote required |

**All example prices and timelines are illustrative, not verified business offers.** Service choices and prices must come from actual catalog data.

#### Step 3 — Detail Order

- **Nama Lengkap** — required.
- **No. WhatsApp** — required, international dial code supported; validate phone format.
- **Username / ID Akun** — required (game-specific label/validation).
- **Server (Opsional)** — optional where relevant.
- **Detail Tambahan (Opsional)** — textarea for goal, target rank, or notes.
- Do not collect passwords, OTPs, or sensitive account credentials in this general form. If a service truly needs account access, define a separate secure handoff.

#### Step 4 — Bayar

- Payment method selection and confirmation stage. This is in the product flow, but **the payment method UI was not fully represented in the current wireframe**; design before implementation.
- Reconfirm service, details, quantity, and final amount.
- Process payment only through an approved payment provider. Avoid collecting raw card data in app forms.

### 6.2 Order summary

Show the selected game, chosen service, estimated completion, unit price, quantity (`− 1 +`), and computed total.

- Formula: `total = unitPrice × quantity` plus any **explicitly disclosed** fees/discounts.
- Highlight total in blue.
- `Lanjut Pembayaran` continues only if required order information is valid.
- A separate **Garansi & Keamanan** information panel can appear underneath the desktop summary. All guarantees must reflect actual terms.

### 6.3 Desktop order layout

- Header and breadcrumb at top.
- Full-width progress stepper below title.
- Two-column main section: left **form (~68–72%)**, right **sticky summary (~28–32%)**.
- Form content split into separate panels for game, service, and details.
- Summary includes a strong CTA and trust information.
- On smaller desktop/tablet, allow summary to shift below the form if needed.

### 6.4 Mobile order layout

- Compact navigation bar and title.
- Horizontal four-step indicator (short labels: Game, Layanan, Detail, Bayar).
- Game selection as a horizontally scrollable row.
- Service selection as a stacked list of full-width radio cards.
- Order details as full-width stacked inputs.
- **Sticky bottom total + `Lanjut Pembayaran` action**, always accounting for phone safe-area insets.
- Detailed summary may be in a collapsible panel above the sticky bar; should be accessible before payment.
- Add sufficient bottom content padding so the last field, legal links, and footer are not obscured.
- Keep the footer available at the end of the page; the sticky bar is not a substitute for a footer.

## 7. Interaction and state rules

| Trigger                     | Expected behavior                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Select a game               | Update selected card; load matching services; reset incompatible service selection |
| Select service              | Show price, estimate, and update order summary immediately                         |
| Change quantity             | Min 1; refresh total; never permit zero or negative quantities                     |
| Type in order details       | Persist inputs during steps; validate on blur and submit                           |
| Click `Lanjut Pembayaran`   | Validate required fields, move to payment step, or show field-level errors         |
| Choose `Joki Star (Custom)` | Show `Tanya Admin` or quote flow instead of inventing a price                      |
| Click game card on home     | Open relevant game order/listing view                                              |
| Click `Cek Pesanan`         | Open tracking flow when implemented                                                |
| Tap mobile hamburger        | Open navigable drawer, close via close button, Escape, or outside tap              |
| Tap search                  | Open search input/results; clear and close controls available                      |

Suggested states: `idle`, `loading`, `empty`, `selected`, `validation-error`, `submitting`, `payment-pending`, `success`, `failed`. Prevent duplicate order submission.

## 8. Accessibility

- Target WCAG 2.2 AA: contrast, focus visibility, semantic headings and labels, and accessible errors.
- Minimum 44×44px tap targets for mobile interactive controls.
- Radio groups must expose real radio semantics and keyboard support.
- Stepper should announce current step (e.g., `aria-current="step"`).
- Inputs require visible labels; placeholders are supplemental only.
- Show both icon/shape and color for selected, success, and error states.
- Respect `prefers-reduced-motion` for transitions and smooth scroll.
- Set `lang="id"` on Indonesian UI pages.

## 9. Suggested implementation structure

```text
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── order/[gameSlug]/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/                  # Header, MobileNav, Footer
│   ├── home/                    # Hero, GameGrid, Categories, Benefits
│   ├── order/                   # Stepper, GamePicker, ServicePicker,
│   │                            # OrderDetailsForm, Summary, PaymentStep
│   └── ui/                      # Buttons, Inputs, Cards, Badges, etc.
├── data/                        # Placeholder catalog data for prototyping
├── lib/                         # Format IDR, validation, total calculation
└── types/                       # Game, Service, Order, Payment types
```

Suggested stack if building with React: **Next.js App Router + TypeScript + Tailwind CSS**, optionally with a form library (React Hook Form + Zod) and component primitives. Keep server-verified pricing authoritative during checkout; client totals are only for display.

## 10. Responsive acceptance checklist

- [ ] Landing desktop contains header, hero, game cards, categories, promo, benefits, **footer**.
- [ ] Landing mobile contains all the same sections in a readable order, **including footer**.
- [ ] Order desktop uses readable form + summary columns.
- [ ] Order mobile uses one-column form with sticky total/payment CTA.
- [ ] Dark theme is used on first load across all pages.
- [ ] Selected game/service states are visible without depending on color alone.
- [ ] Quantity changes and service changes update displayed totals.
- [ ] Required fields validate and display useful error messages.
- [ ] No horizontal viewport scrolling at 320px, 375px, 768px, 1024px, and 1440px.
- [ ] Sticky mobile CTA never covers input fields or footer content.
- [ ] Header nav, search, and mobile drawer are keyboard/touch accessible.
- [ ] Example pricing, contact info, guarantee claims, and service hours are replaced with confirmed business data before launch.

## 11. Source and fidelity notes

- Visual reference supplied by the user: https://joki.dadalisnack.com/joki/
- Immediate design reference: dark JokiHub wireframe showing **four views** — landing desktop, landing mobile, order desktop, and order mobile.
- This document describes **the designed wireframe**, not a verified inventory of the live reference site's current functionality.
- Exact illustrations, production copy, brand identity, real catalog data, payment methods, and legal/footer contact details should be confirmed before implementation.
