# ⚡ StellarEarn

> A Stellar-native bounty & grants marketplace with on-chain reputation, trustless escrow, and PHP cashout via GCash.

Built on **Stellar / Soroban** · PHP Anchor Payouts · Trustless Escrow · On-chain Reputation

---

## Overview

StellarEarn is a contributor marketplace for the Stellar ecosystem — where DAOs and Stellar-native projects post bounties and grants, contributors complete real work, earn in local assets (PHP/USDC), and build verifiable on-chain reputation.

Unlike generic crypto task boards, StellarEarn is built around three pillars:

- **Real payouts** — PHP cashout via GCash through Stellar anchors (SEP-24)
- **Trustless escrow** — Soroban smart contracts hold and release funds automatically
- **On-chain reputation** — soulbound badges, XP scores, and portfolio NFTs that follow the contributor permanently

---

## Problem

| Problem | Who Feels It | Current Workaround |
|---|---|---|
| Bounty payouts have high fees (ETH gas, PayPal FX) | Filipino contributors | Lose 5–15% per payout |
| No verifiable proof of work in Web3 | Contributors seeking reputation | LinkedIn (centralized, gameable) |
| DAOs can't trustlessly escrow small bounties | Posters / project teams | Manual honor system |
| Stellar ecosystem has no contributor marketplace | Stellar projects needing talent | Post in Discord manually |
| Crypto earnings hard to convert to local cash | Unbanked / underbanked users | P2P trading with risk |

---

## Solution — The Core Loop

```
POSTER (DAO / Stellar project)
    → Creates bounty or grant on-chain via Soroban escrow
    → Funds in USDC or PHP-anchor asset

CONTRIBUTOR
    → Browses listings, submits work + delivery proof
    → Reviewed and approved by poster

ON APPROVAL
    → Soroban escrow releases payment automatically
    → Contributor receives USDC / PHP asset on Stellar
    → Can withdraw to GCash via SEP-24 anchor flow

REPUTATION (parallel track)
    ├── Soulbound Badge   — non-transferable, per bounty completed
    ├── XP Score          — cumulative, gates higher-tier bounties
    └── Portfolio NFT     — visual proof of work, shareable on-chain
```

---

## Actors

| Actor | Role | Incentive |
|---|---|---|
| **Stellar Projects / DAOs** | Post bounties & grants, fund escrow | Get quality contributors reliably |
| **Contributors** | Complete tasks, earn, build reputation | Real money + verifiable career proof |
| **Stellar Anchors** | PHP / USDC on-ramp and off-ramp | Transaction volume fees |

---

## Reputation System

Three-layer design that compounds over time:

### Layer 1 — Soulbound Badge
- Non-transferable token, issued per bounty completed
- Tagged by skill category: `design` / `dev` / `writing` / `research` / `community`
- Stored on-chain via `reputation.rs` Soroban contract

### Layer 2 — XP Score
- Cumulative across all completions, stored on-chain
- Gates access to higher-value bounties:

  | XP Range | Tier | Max Bounty Value |
  |---|---|---|
  | 0 – 99 | Basic | $50 |
  | 100 – 499 | Mid | $500 |
  | 500+ | Grant | No cap (milestone escrow) |

### Layer 3 — Portfolio NFT
- Transferable visual artifact per completed bounty
- Contains: task title, poster org, payout amount, date, skill tag
- Shareable link — verifiable on [Stellar Expert](https://stellar.expert/explorer/testnet)
- Acts as a decentralized, on-chain CV for contributors

---

## Tech Stack

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Main web app |
| Wallet | Freighter Wallet SDK | Stellar account connect + signing |
| Styling | Tailwind CSS | UI |
| State | Zustand / React Query | Client state + server sync |

### Blockchain Layer

| Contract | Language | Responsibility |
|---|---|---|
| `bounty.rs` | Rust / Soroban | Bounty/grant lifecycle state machine |
| `escrow.rs` | Rust / Soroban | Holds funds, releases on approval |
| `reputation.rs` | Rust / Soroban | Mints badges, tracks XP, issues portfolio NFT |

### Stellar Protocol

| Protocol | Purpose |
|---|---|
| SEP-10 | Wallet authentication — sign-in with Stellar account |
| SEP-24 | Interactive anchor flow — PHP deposit/withdrawal via GCash |
| SEP-6 | Non-interactive anchor transfers (alternative) |
| Stellar SDK (JS) | Account management, asset transfers, RPC calls |

### Backend / Infra

| Layer | Technology | Purpose |
|---|---|---|
| Database | Supabase (PostgreSQL) | Submissions, user profiles, off-chain metadata |
| Auth | SEP-10 + Supabase Auth | Wallet-based authentication |
| Storage | Supabase Storage | Submission files, deliverable uploads |
| Hosting | Vercel | Frontend deployment |

---

## Soroban Contract Architecture

### `bounty.rs`
```rust
create_bounty(poster, asset, amount, deadline, skill_tag)
submit_work(contributor, bounty_id, ipfs_hash)
approve(poster, contributor)  // triggers escrow release + rep mint
reject(poster, contributor)   // returns submission to open
cancel(poster)                // refunds escrow to poster
get_bounty(bounty_id)         // returns full bounty state
```

### `escrow.rs`
```rust
deposit(asset, amount, bounty_id)
release(to, amount, bounty_id)
refund(to, amount, bounty_id)
get_balance(bounty_id) -> u128
```

### `reputation.rs`
```rust
mint_badge(contributor, bounty_id, skill_tag)  // soulbound
add_xp(contributor, amount)
get_score(contributor) -> u32
get_badges(contributor) -> Vec<Badge>
mint_portfolio_nft(contributor, metadata_uri)  // transferable
```

---

## Anchor Integration — PHP Cashout Flow

This is the primary differentiator. Non-crypto users interact with real PHP via GCash.

### Contributor Cashout
1. Contributor clicks **"Withdraw to GCash"** in the app
2. App initiates SEP-24 interactive withdrawal flow with anchor
3. Contributor completes KYC once (stored by anchor)
4. PHP-anchor asset on Stellar burns / transfers to anchor
5. Anchor credits GCash wallet in PHP within minutes

### Poster Funding
1. Poster deposits PHP via GCash to anchor's deposit address
2. Anchor issues equivalent PHP-asset on Stellar
3. Poster funds Soroban escrow contract with issued asset
4. Bounty is now live and fully collateralized on-chain

---

## Hackathon Build Scope

### ✅ Must Have — MVP
- [ ] Bounty creation with Soroban escrow funding
- [ ] Submission flow (upload deliverable, store IPFS hash)
- [ ] Poster approval → automatic Soroban payout to contributor
- [ ] Freighter wallet connect + SEP-10 auth
- [ ] XP tracking on-chain via `reputation.rs`

### 🔶 Strong to Have
- [ ] Soulbound badge minting on bounty completion
- [ ] Simulated SEP-24 anchor off-ramp flow (testnet)
- [ ] Portfolio NFT mint + shareable profile link
- [ ] Contributor profile page showing badges + XP

### 🔷 Nice to Have
- [ ] XP-gated bounty tier enforcement in contract
- [ ] Grant module with milestone-based escrow
- [ ] DAO multi-sig approval for high-value bounties
- [ ] On-chain leaderboard by skill category

---

## Why This Wins

| Judging Criteria | How StellarEarn Hits It |
|---|---|
| Real user-facing app | Contributors are real people earning real money for real work |
| Anchor integration | SEP-24 PHP cashout via GCash — fiat actually enters/exits |
| Local assets | PHP-anchor asset as primary payout denomination |
| DeFi utility | Trustless Soroban escrow — no middleman, automatic release |
| Soroban technical depth | 3 contracts: bounty + escrow + reputation (badges, XP, NFT) |
| Unique angle | On-chain reputation system doesn't exist on Stellar yet |
| Local market fit | Targets Filipino freelancers and Stellar SEA contributors |

---

## Repository Structure

```
stellar-earn/
├── contracts/
│   ├── bounty/             # bounty.rs — lifecycle state machine
│   ├── escrow/             # escrow.rs — fund holding + release
│   └── reputation/         # reputation.rs — badges, XP, NFTs
├── frontend/
│   ├── app/
│   │   ├── bounties/       # listing, detail, create pages
│   │   ├── profile/        # contributor profile + rep display
│   │   └── grants/         # grant module
│   ├── components/
│   └── lib/
│       ├── stellar.ts      # Stellar SDK helpers
│       ├── soroban.ts      # Contract interaction
│       └── anchor.ts       # SEP-10, SEP-24 flows
├── backend/
│   └── supabase/           # DB schema, RLS policies, storage buckets
└── README.md
```

---

## Key Resources

| Resource | Link | Used For |
|---|---|---|
| Stellar Docs | [developers.stellar.org](https://developers.stellar.org) | SDK, SEP protocols, RPC |
| Soroban SDK | [docs.rs/soroban-sdk](https://docs.rs/soroban-sdk) | Smart contract dev (Rust) |
| Stellar CLI | [stellar-cli docs](https://developers.stellar.org/docs/tools/stellar-cli) | Deploy + invoke contracts |
| Freighter Wallet | [freighter.app](https://freighter.app) | Browser wallet integration |
| Stellar Expert | [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet) | Contract + tx explorer |
| Stellar Lab | [lab.stellar.org](https://lab.stellar.org) | XDR builder, tx playground |
| Rise In | [risein.com/programs](https://risein.com/programs) | Soroban learning path |

---

*StellarEarn — Built for the Stellar Hackathon*