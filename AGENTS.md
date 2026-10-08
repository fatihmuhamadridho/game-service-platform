# JokiHub Project Guidance

## Product and design source

- Treat `DESIGN.md` as the product and visual source of truth for the JokiHub gaming-services storefront.
- Build for the documented landing page and `/order/:gameSlug` checkout flow. Auth, order tracking, payment-provider screens, admin, and service management are future scope unless the user requests them.
- Use Indonesian for customer-facing UI copy. Keep game and brand names as written.
- Use dark mode by default: deep navy page and card surfaces, electric-blue primary actions, readable contrast, rounded cards, and compact layouts.
- Follow responsive behavior in `DESIGN.md`, including usable layout at 320px, touch targets of at least 44px, and a mobile order CTA that does not cover page content or footer.
- Treat catalog entries, prices, turnaround estimates, contact details, guarantees, and marketing claims as real only when confirmed in project data or by the user. Clearly keep prototype values illustrative.
- Never collect passwords, OTPs, raw card details, or other sensitive credentials in general order forms. Payment must use an approved provider.

## Repository structure

- This repository uses the Next.js App Router under `src/app`. Keep route files focused on route composition and page metadata.
- Shared utilities, providers, configs, services, and interfaces belong under `src/common`.
- Keep feature-specific business and data flow under `src/features/<Feature>/domain` and `src/features/<Feature>/infrastructure`; keep feature UI under `src/features/<Feature>/views`.
- Shared user/core behavior belongs under `src/core`.
- Keep UI orchestration in feature `views/pages`. Templates compose sections; organisms, molecules, and atoms remain presentational.
- Keep UI-facing interfaces in `views/interfaces`; do not import domain types directly into presentational views. Map domain data at page or feature boundary.
- Do not create a parallel generic `src/components`, `src/data`, or `src/lib` architecture when existing feature/common structure fits.

## UI and styling

- Prefer existing RangKaui and Mantine-compatible components where available; use `@tabler/icons-react` for icons already supported by the project. Avoid adding a UI dependency without a clear need.
- Use CSS Modules with local component styles, following existing `.module.css` conventions. Do not introduce SCSS modules unless project tooling is deliberately changed.
- Use Tailwind CSS 4 utilities where they fit existing patterns. Keep component-specific styling local; avoid unrelated global styles.
- Use semantic, accessible controls. Every interactive element needs visible keyboard focus and appropriate disabled, loading, and error states.
- Forms need visible labels; placeholders are supplemental. Expose selections with semantics and indicators beyond color alone.
- Respect reduced-motion preferences. Set document language to `id` for Indonesian pages.
- Keep mobile navigation, search, horizontal game selection, and sticky checkout actions keyboard and touch accessible.

## TypeScript and React

- Follow strict TypeScript. Explicitly type reusable or non-trivial component props; prefer `import type` for type-only imports.
- Keep domain types in feature `domain`, and UI-facing types in `views/interfaces`.
- Keep data fetching and React Query configuration close to feature hooks.
- Use Next.js App Router metadata APIs (`Metadata` in `layout.tsx` or route metadata exports); do not use `next/head` in App Router pages.
- Prefer named exports for feature components. Use route-required exports in `src/app`.

## Checkout behavior

- Keep selected game, service, order details, and quantity coherent as the user moves through steps.
- Selecting a different game must refresh compatible services and clear an incompatible service selection.
- Quantity has a minimum of one. Compute displayed totals from selected service and quantity, and disclose any fees or discounts.
- Validate required fields on blur and submit, preserve entered values across steps, and prevent duplicate submissions.
- Treat client-side totals as display only; server-verified catalog pricing is authoritative when a backend exists.
- A custom or quote-required service must route to a quote/contact flow instead of inventing a price.

## Workflow

- Follow existing naming, aliases, and feature patterns before adding new structure.
- Run lint after larger refactors. Run Prettier and TypeScript checks before finishing when relevant to the change.
- Do not run production builds unless the user explicitly asks. Leave build validation to the user.
- Do not add or run tests unless the user asks to test or verify implementation.

## Git

- Do not run `git add` unless explicitly requested.
- When asked to commit, write a message that reflects actual changes.
- Push only when the user asks.
