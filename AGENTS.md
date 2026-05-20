<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

<!-- BEGIN:stellarearn-agent-rules -->
# StellarEarn — Agent Rules & Development Standards

> These rules govern ALL AI-assisted development on this repository. Every agent, every session. No exceptions.

---

## ⚠️ CRITICAL: This Is a Next.js App — Not a React App

**DO NOT** scaffold, generate, or suggest bare React patterns for this project.
This is a **Next.js 16 App Router** application. Every architectural decision must be
made in the context of Next.js — its file conventions, rendering model, data fetching,
routing, and deployment pipeline.

| ❌ You are NOT building this | ✅ You ARE building this |
|---|---|
| A Create React App / Vite React SPA | A Next.js 16 App Router application |
| A client-rendered React app | A server-first, RSC-driven Next.js app |
| An HTML + Vanilla JS site | A TypeScript Next.js app with shadcn/ui + Tailwind v4 |
| A standalone React component library | Page and layout components under `app/` |

If your training data suggests a pattern from a non-Next.js React context, **verify it
against `node_modules/next/dist/docs/` first**. When in doubt, the App Router docs win.

---

## 1. Project Context

**StellarEarn** is a Stellar-native bounty & grants marketplace built on:

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, RSC-first) |
| Language | **TypeScript 5** (strict mode always on) |
| Styling | **Tailwind CSS v4** + shadcn/ui (`base-nova` style) |
| UI Primitives | **shadcn/ui** + `@base-ui/react` + `lucide-react` |
| Animation | `tw-animate-css` |
| State | Zustand / React Query (planned) |
| Auth | SEP-10 + Supabase Auth |
| Database | Supabase (PostgreSQL + RLS) |
| Blockchain | Soroban smart contracts (Rust) |
| Hosting | Vercel |

**Design tokens** (defined in `app/globals.css` — NEVER hardcode these values):

```
--color-stellar-yellow:   #FDDA24
--color-stellar-black:    #0F0F0F
--color-stellar-white:    #F6F7F8
--color-stellar-gray:     #D6D2C4
--color-stellar-lavender: #B7ACE8
--color-stellar-teal:     #00A7B5
--color-stellar-navy:     #002E5D
```

Utility classes for gradients: `bg-stellar-fluid`, `bg-stellar-cosmic`.

---

## 2. Next.js Conventions (Read Before Every Code Change)

> **Always check `node_modules/next/dist/docs/` for the authoritative API before writing any Next.js code.** Training data may be outdated.

### 2.1 App Router Fundamentals

- **All components are Server Components by default.** Only add `"use client"` when the component needs browser APIs, event handlers, or React hooks.
- **Never** use `getServerSideProps`, `getStaticProps`, or `pages/` directory — this project is App Router only.
- Data fetching lives in Server Components using native `fetch()` with Next.js caching semantics.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` for each route segment where appropriate.
- Route handlers live in `app/api/[route]/route.ts` — never use `pages/api/`.

### 2.2 File & Folder Naming

```
app/
  (group)/            # route groups — no URL segment
  [param]/            # dynamic routes
  @slot/              # parallel routes
  layout.tsx          # layout (required at root)
  page.tsx            # route page
  loading.tsx         # Suspense boundary fallback
  error.tsx           # error boundary
  not-found.tsx       # 404 handler

components/
  ui/                 # shadcn/ui primitives (DO NOT modify manually)
  features/           # domain feature components
  layout/             # shell components (Navbar, Footer, Sidebar)

lib/
  stellar.ts          # Stellar SDK helpers
  soroban.ts          # Contract interaction
  anchor.ts           # SEP-10, SEP-24 flows
  utils.ts            # cn() and other utilities
  data.ts             # mock/static data (move to DB when ready)
```

### 2.3 Component Rules

- **Props interfaces** must be explicitly typed; no implicit `any`.
- **`cn()` from `@/lib/utils`** is the ONLY way to compose Tailwind class strings. Never use string template literals to concatenate class names.
- Prefer **named exports** over default exports for all components.
- Co-locate component-specific types with the component file.
- Use shadcn/ui variants via `class-variance-authority` (CVA) — do not re-invent variant logic.

### 2.4 Deprecated / Forbidden Patterns

| ❌ Forbidden | ✅ Use Instead |
|---|---|
| `pages/` directory | `app/` directory |
| `getServerSideProps` / `getStaticProps` | `async` Server Components + `fetch()` |
| `next/router` | `next/navigation` (`useRouter`, `usePathname`, `redirect`) |
| `<img>` tags | `<Image>` from `next/image` |
| `<a>` for internal links | `<Link>` from `next/link` |
| Hardcoded design token values | CSS custom properties via Tailwind classes |
| `localStorage` in Server Components | Only use in Client Components or `useEffect` |
| `process.env` in client code | Only `NEXT_PUBLIC_` prefixed vars on the client |

---

## 3. Git & Version Control Standards

### 3.1 Commit Early, Commit Often

- **Commit after every logical unit of work** — a single component, a bug fix, a refactor. Do NOT accumulate large changesets.
- The agent MUST commit before moving to the next task step.
- Never leave the working tree dirty at the end of a session.

### 3.2 Conventional Commits (Enforced)

All commit messages must follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | When to Use |
|---|---|
| `feat` | New feature or component |
| `fix` | Bug fix |
| `refactor` | Code restructure without behavior change |
| `style` | Formatting, CSS, design tweaks (no logic change) |
| `chore` | Build config, deps, tooling |
| `docs` | Documentation only |
| `test` | Test additions or changes |
| `perf` | Performance improvement |
| `security` | Security fix or hardening |
| `ci` | CI/CD pipeline changes |

**Scopes (use project domain terms):**

`bounty`, `escrow`, `reputation`, `anchor`, `auth`, `wallet`, `profile`, `ui`, `api`, `contracts`, `deps`, `config`

**Examples:**

```
feat(bounty): add bounty creation form with Soroban escrow funding
fix(auth): handle SEP-10 challenge expiry edge case
style(ui): align bounty card padding with design tokens
refactor(anchor): extract SEP-24 flow into reusable hook
security(api): sanitize IPFS hash input before storing
chore(deps): upgrade next to 16.2.6
```

### 3.3 Branch Strategy

```
main          — production-ready, protected
dev           — integration branch, merges to main via PR
feat/*        — feature branches off dev
fix/*         — bug fix branches off dev
hotfix/*      — critical fixes branched off main
```

- **Never commit directly to `main`.**
- All merges to `main` require a PR with a passing build.
- Feature branches are short-lived — merge and delete within the session if possible.
- Tag releases: `git tag v<major>.<minor>.<patch>` following [SemVer](https://semver.org/).

### 3.4 Pre-commit Checklist

Before every commit, verify:

1. `npm run lint` passes with zero errors
2. `npx tsc --noEmit` passes
3. No hardcoded secrets or API keys in staged files
4. No `console.log` debug statements left in production code
5. No commented-out dead code blocks
6. All new files follow the folder structure defined in §2.2

### 3.5 `.gitignore` Must Include

```
.env
.env.local
.env.*.local
*.pem
*.key
*.p12
supabase/.temp/
```

---

## 4. Decision-Making Framework

> When the AI faces an architectural or implementation choice, it MUST follow this framework before writing code.

### 4.1 The SAFE Decision Protocol

**S — Scope the change.** Define exactly what files and systems are affected. If more than 3 files need changes for a single feature, stop and write an implementation plan first.

**A — Alternatives considered.** For any non-trivial choice, document at least 2 alternatives and the reason for rejection.

**F — Flag breaking changes.** Any change to a shared type, API contract, or database schema MUST be flagged explicitly before proceeding.

**E — Estimate impact.** Assess whether the change affects: (a) on-chain contracts, (b) auth flows, (c) financial data, or (d) user data. Higher impact = more caution.

### 4.2 Decision Tiers

| Tier | Examples | Required Action |
|---|---|---|
| 🟢 **Low** | Styling tweaks, new UI component, copy changes | Proceed directly |
| 🟡 **Medium** | New API route, new DB query, state management | Document intent in commit body |
| 🔴 **High** | Schema migrations, contract changes, auth flow, financial logic | Stop. Write plan. Get explicit approval before coding. |
| 🚨 **Critical** | Wallet key handling, escrow release logic, KYC/PII data | Stop. Security review required. Never proceed alone. |

### 4.3 AI Uncertainty Protocol

If the agent is **not confident** about the correct behavior of an API, library, or protocol:

1. **Read the source** — check `node_modules/<package>/dist/` or official docs first.
2. **Do not guess** — never write code based on assumed behavior of Stellar SDK, Soroban, or SEP protocols.
3. **Ask before coding** — surface the uncertainty explicitly with a concrete question.
4. **Prefer the conservative path** — when in doubt, do less. A smaller correct change beats a larger broken one.

### 4.4 Soroban & Financial Logic — Zero Tolerance

- Any code that interacts with `bounty.rs`, `escrow.rs`, or `reputation.rs` contracts is **Tier 🚨 Critical**.
- Escrow release logic must be reviewed against the contract ABI before any frontend call.
- Never derive financial amounts client-side. Always verify against the contract's returned value.
- Always use Stellar's `BigInt` or `i128`-safe math — never use JavaScript `number` for on-chain amounts.

---

## 5. Code Quality & Linting Standards

### 5.1 TypeScript — Strict Always

The `tsconfig.json` has `"strict": true`. This is permanent. Never disable it. Key implications:

- No `any` — use `unknown` + type narrowing, or define a proper type.
- No non-null assertions (`!`) unless you can prove the value exists with a comment explaining why.
- All function return types must be inferable or explicitly declared for public API functions.
- Use `satisfies` over `as` for type assertions when shape-checking objects.

### 5.2 ESLint Configuration

The project uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. Additional rules to enforce:

**`eslint.config.mjs` must include these rules:**

```js
rules: {
  // React
  "react/no-danger": "error",             // No dangerouslySetInnerHTML
  "react/jsx-no-target-blank": "error",   // rel="noopener noreferrer" required
  "react-hooks/exhaustive-deps": "warn",  // Hooks deps correctness

  // TypeScript
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  "@typescript-eslint/consistent-type-imports": "error",  // import type {}

  // Security
  "no-eval": "error",
  "no-implied-eval": "error",
  "no-new-func": "error",

  // Best practices
  "no-console": ["warn", { "allow": ["warn", "error"] }],
  "prefer-const": "error",
  "no-var": "error",
  "eqeqeq": ["error", "always"],
}
```

> Run `npm run lint` after every file change. Zero warnings tolerance in production-bound code.

### 5.3 Code Formatting

- **Prettier** is the formatter. Never manually reformat code — run the formatter.
- Tab width: 2 spaces. Single quotes. Trailing commas: `"es5"`. Semicolons: yes.
- **Import order** (enforced by `eslint-plugin-import` or manually):
  1. React / Next.js
  2. Third-party libraries
  3. Internal aliases (`@/components`, `@/lib`)
  4. Relative imports
  5. CSS/style imports

### 5.4 Component Quality Checklist

Before marking a component done:

- [ ] Fully typed props interface (no `any`)
- [ ] Accessibility: interactive elements have `aria-label` or visible label
- [ ] Responsive: works at `sm`, `md`, `lg` breakpoints
- [ ] Dark mode: uses CSS variables, not hardcoded colors
- [ ] No raw color values — only design tokens from §1
- [ ] `cn()` used for all conditional class composition
- [ ] No unnecessary `"use client"` directive
- [ ] No `console.log` in production code
- [ ] Loading and error states handled where data is fetched

### 5.5 Performance Rules

- **Images**: Always use `next/image` with explicit `width`/`height` or `fill` + container sizing.
- **Fonts**: Load via `next/font` — never import from Google Fonts CDN directly.
- **Lazy loading**: Large feature sections should use `React.lazy` + `Suspense` or Next.js dynamic imports (`dynamic(() => import(...), { ssr: false })`).
- **Bundle size**: Avoid importing entire libraries when tree-shaking is possible (e.g., `import { X } from 'lodash'` → use native JS or specific import).
- **Memoization**: Use `useMemo` / `useCallback` only when profiling reveals a bottleneck — not preemptively.

---

## 6. Security Standards (OWASP-Aligned)

> **Security is non-negotiable.** This app handles financial transactions, wallet signatures, and real user funds. A breach is catastrophic.

### 6.1 Environment Variables & Secrets

- **All secrets live in `.env.local`** — never committed. See `.gitignore`.
- Client-accessible vars MUST use the `NEXT_PUBLIC_` prefix. All others are server-only.
- Never log `process.env` values. Never pass secret values to client components.
- Rotate any key that was accidentally committed immediately.

**Required env var naming:**
```
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # SERVER ONLY — never NEXT_PUBLIC_
STELLAR_HORIZON_URL=...              # SERVER ONLY
SEP10_SIGNING_KEY=...                # SERVER ONLY
```

### 6.2 Input Validation & Sanitization (OWASP A03)

- **Never trust client input.** All data from forms, query params, and request bodies must be validated server-side.
- Use a schema validation library (e.g., `zod`) for all API route inputs and form submissions.
- IPFS hashes submitted by users must match the pattern `/^Qm[1-9A-Za-z]{44}$|^bafy[0-9a-z]{55}$/` before storage.
- Stellar account IDs must be validated with `StellarSDK.StrKey.isValidEd25519PublicKey()` before use.
- Never use `dangerouslySetInnerHTML` — if unavoidable, sanitize with `DOMPurify` first.

### 6.3 Authentication & Authorization (OWASP A01, A07)

- **SEP-10 is the ONLY authentication mechanism.** No password-based auth.
- Supabase RLS policies must be enabled on ALL tables that store user data.
- Server-side Route Handlers must verify the Supabase session before returning sensitive data.
- JWT tokens from SEP-10 must be verified server-side — never trust client-provided JWT values.
- Session tokens must NOT be stored in `localStorage`. Use `httpOnly` cookies or Supabase's default session management.

### 6.4 API Route Security

Every API route handler (`app/api/*/route.ts`) must:

1. **Authenticate** — verify the user's session.
2. **Authorize** — verify the user has permission for the requested resource.
3. **Validate** — parse and validate request body/params with Zod.
4. **Rate limit** — apply rate limiting for public-facing endpoints (use Vercel's built-in or `@upstash/ratelimit`).
5. **Return minimal data** — never return more fields than the client needs.

```ts
// Template for secure route handler
export async function POST(req: Request) {
  // 1. Auth
  const session = await getServerSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Validate
  const body = await req.json();
  const parsed = MySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

  // 3. Authorize (check ownership, role, etc.)
  // ...

  // 4. Business logic
  // ...
}
```

### 6.5 Supabase & Database Security (OWASP A04)

- **Row Level Security (RLS) is mandatory** on all tables. Never disable it.
- Use Supabase's `createServerClient()` (service role) only in server-side code. Use `createBrowserClient()` (anon key) on the client.
- Parameterized queries only — never string-concatenate SQL. Supabase client handles this automatically; do not bypass it with `.rpc()` calls containing unsanitized strings.
- Storage buckets must have explicit RLS policies. No public write access to storage.

### 6.6 Content Security Policy (OWASP A05)

Add security headers in `next.config.ts`:

```ts
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // tighten in prod
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co https://horizon-testnet.stellar.org",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];
```

### 6.7 Wallet & Stellar-Specific Security

- **Never request signing of arbitrary data.** Only sign XDR-encoded Stellar transactions or SEP-10 challenge transactions.
- Always display human-readable transaction details to the user before requesting Freighter to sign.
- Verify the SEP-10 server's home domain matches the expected anchor domain before processing the challenge.
- Always use Stellar **Testnet** during development. Add a visual indicator in the UI when on testnet.
- Smart contract `invoke` calls must include a maximum fee budget. Never use unlimited fees.

### 6.8 Dependency Security

- Run `npm audit` before every release. Fix all `high` and `critical` severity issues.
- Pin major versions in `package.json`. Use `^` for minor/patch updates only.
- Review the changelog and diff of any new dependency before adding it — especially for crypto-adjacent packages.
- Prefer packages with active maintenance and audit histories. Avoid packages last published >2 years ago.

### 6.9 Logging & Error Handling (OWASP A09)

- **Never log sensitive data**: wallet private keys, SEP-10 tokens, user PII, financial amounts in raw form.
- Errors returned to the client must be generic. Log detailed errors server-side only.
- Use structured logging (key-value) — not `console.log("stuff:", data)`.
- Implement a global error boundary in `app/error.tsx` for graceful client-side failure.

---

## 7. Design System Rules

### 7.1 Tailwind v4 Usage

This project uses **Tailwind CSS v4** with its new CSS-first configuration in `app/globals.css`. Key differences:

- Config lives in `@theme inline { ... }` blocks in CSS — not `tailwind.config.js`.
- Use `@utility` to define custom utilities.
- `@custom-variant dark (...)` replaces `darkMode: 'class'` config.
- PostCSS handles everything via `@tailwindcss/postcss`.

### 7.2 shadcn/ui Components

- **Style: `base-nova`** — this is the configured style. Do not mix with other styles.
- Add new components via `npx shadcn@latest add <component>` — never create UI primitives manually in `components/ui/`.
- Do not modify files in `components/ui/` directly unless fixing a bug that can't be worked around. Changes will be overwritten on `shadcn` updates.
- Custom variants go in `components/features/` or via CVA wrappers.

### 7.3 Visual Consistency

- All interactive elements must have a visible focus ring (`:focus-visible` state).
- Motion/animation must respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  ```
- Text contrast must meet WCAG AA minimum (4.5:1 for body text, 3:1 for large text).

---

## 8. Key External Resources

> Read before touching the related system.

| Resource | URL | Required For |
|---|---|---|
| Stellar Docs | https://developers.stellar.org | SDK, SEP protocols, RPC |
| Soroban SDK | https://docs.rs/soroban-sdk | Smart contract dev |
| Stellar CLI | https://developers.stellar.org/docs/tools/stellar-cli | Deploy + invoke contracts |
| SEP-10 Spec | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md | Auth implementation |
| SEP-24 Spec | https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0024.md | Anchor cash-out flow |
| Freighter API | https://docs.freighter.app | Wallet integration |
| Next.js Docs | https://nextjs.org/docs | Framework reference |
| shadcn/ui | https://ui.shadcn.com | UI component library |
| Supabase Docs | https://supabase.com/docs | DB + Auth + Storage |
| OWASP Top 10 | https://owasp.org/www-project-top-ten/ | Security baseline |
| Conventional Commits | https://www.conventionalcommits.org | Commit message format |
| Zod | https://zod.dev | Schema validation |

---

## 9. Agent Behavioral Rules

### 9.1 Before Writing Any Code

1. Read the relevant section of `node_modules/next/dist/docs/` for the Next.js API being used.
2. Confirm the change falls within the correct Decision Tier (§4.2).
3. Check if an existing pattern in the codebase already solves the problem.

### 9.2 During Coding

- Make the smallest change that solves the problem. Scope creep is a bug.
- Do not refactor unrelated code while fixing a targeted issue.
- Every new file must have its imports organized per §5.3.
- If a TODO is added, format it as: `// TODO(@<context>): <description>`.

### 9.3 After Every Code Change

1. Run `npm run lint` — fix all errors.
2. Run `npx tsc --noEmit` — fix all type errors.
3. Commit with a Conventional Commit message.
4. Verify the dev server (`npm run dev`) still compiles without errors.

### 9.4 Session End Protocol

Before ending any development session:

- [ ] All changes committed with descriptive messages
- [ ] Working tree is clean (`git status` shows nothing)
- [ ] No `.env` secrets committed
- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] Any new dependencies documented in commit body

<!-- END:stellarearn-agent-rules -->
