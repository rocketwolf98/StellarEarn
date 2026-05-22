// ─── Lifecycle Types ────────────────────────────────────────────────────────

export type BountyStatus =
  | "draft"
  | "open"
  | "under_review"
  | "closed"
  | "cancelled";

export type SubmissionStatus =
  | "pending"
  | "under_review"
  | "winner"
  | "not_selected";

export type PrizeToken = "PHP" | "USDC" | "XLM";

export interface Winner {
  walletAddress: string;
  name: string;
  initials: string;
  color: string;
  prizeAmount: number;
  prizeToken: PrizeToken;
  submissionUrl: string;
  txHash: string;
}

export interface Submission {
  id: string;
  bountySlug: string;
  submitterName: string;
  submitterHandle: string;
  submitterInitials: string;
  submitterColor: string;
  walletAddress: string;
  submissionUrl: string;
  twitterUrl?: string;
  description: string;
  submittedAt: string; // ISO date string
  status: SubmissionStatus;
  txHash: string;
  entryFeeTxHash: string;
}

// ─── Bounties ────────────────────────────────────────────────────────────────

export const BOUNTIES = [
  {
    id: 1,
    slug: "build-soroban-token-swap",
    title: "Build a Soroban token swap interface",
    org: "StellarDAO",
    initials: "SD",
    bg: "#00A7B51a",
    color: "#00A7B5",
    prize: 25000,
    prizeToken: "PHP" as PrizeToken,
    prizeUsdc: 208,
    type: "bounty" as const,
    skill: "dev",
    deadline: "Jun 1",
    due: "Due in 6d",
    submissions: 4,
    fee: "2 XLM",
    featured: true,
    live: true,
    status: "open" as BountyStatus,
    desc: "Build a clean UI for swapping Stellar assets via a deployed Soroban contract. Integrate Freighter wallet. Supports USDC, XLM, and PHP-anchor assets.",
    deliverables: [
      "Next.js or React app deployed to Vercel",
      "Freighter wallet connect + SEP-10 auth",
      "Live testnet contract calls",
      "Mobile-responsive UI",
      "GitHub repo + recorded demo",
    ],
    winner: null,
  },
  {
    id: 2,
    slug: "design-contributor-onboarding",
    title: "Design contributor onboarding for StellarEarn",
    org: "StellarEarn",
    initials: "SE",
    bg: "#B7ACE81a",
    color: "#B7ACE8",
    prize: 12000,
    prizeToken: "PHP" as PrizeToken,
    prizeUsdc: 100,
    type: "bounty" as const,
    skill: "design",
    deadline: "May 28",
    due: "Due in 1d",
    submissions: 7,
    fee: "2 XLM",
    featured: true,
    live: false,
    status: "under_review" as BountyStatus,
    desc: "Design the onboarding experience for first-time contributors — wallet connect, profile setup, and first bounty discovery.",
    deliverables: [
      "Figma file with full flow, min 8 screens",
      "Mobile + desktop variants",
      "Wallet connect states",
      "Handoff-ready with component notes",
    ],
    winner: null,
  },
  {
    id: 3,
    slug: "write-technical-docs",
    title: "Write technical docs for Soroban escrow contract",
    org: "StellarDAO",
    initials: "SD",
    bg: "#00A7B51a",
    color: "#00A7B5",
    prize: 6500,
    prizeToken: "PHP" as PrizeToken,
    prizeUsdc: 54,
    type: "bounty" as const,
    skill: "content",
    deadline: "May 20",
    due: "Ended",
    submissions: 11,
    fee: "2 XLM",
    featured: false,
    live: false,
    status: "closed" as BountyStatus,
    desc: "Document the StellarEarn escrow contract for developers integrating with it. Cover all public functions, error codes, and JS SDK integration examples.",
    deliverables: [
      "README with full contract API docs",
      "Integration guide with JS examples",
      "Error handling reference",
      "Deployed docs site",
    ],
    winner: {
      walletAddress: "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6IQJZFE3CEWHG4M7RU1ND",
      name: "Ana Lim",
      initials: "AL",
      color: "#00A7B5",
      prizeAmount: 6500,
      prizeToken: "PHP" as PrizeToken,
      submissionUrl: "https://github.com/analim/soroban-escrow-docs",
      txHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    } satisfies Winner,
  },
  {
    id: 4,
    slug: "research-php-anchor",
    title: "Research report: PHP anchor landscape in SEA",
    org: "Stellar SEA",
    initials: "SS",
    bg: "#00A7B51a",
    color: "#00A7B5",
    prize: 18000,
    prizeToken: "PHP" as PrizeToken,
    prizeUsdc: 150,
    type: "project" as const,
    skill: "research",
    deadline: "Jun 15",
    due: "Due in 4d",
    submissions: 2,
    fee: "2 XLM",
    featured: false,
    live: true,
    status: "open" as BountyStatus,
    desc: "Map Stellar anchors operating in SEA supporting PHP, IDR, or MYR. Evaluate SEP compliance, fees, and UX.",
    deliverables: [
      "Min 5 anchors reviewed in depth",
      "SEP-6 / SEP-24 compliance matrix",
      "Fee comparison table",
      "Recommended shortlist",
      "PDF + Notion deliverable",
    ],
    winner: null,
  },
  {
    id: 5,
    slug: "community-growth-lead",
    title: "Community growth lead — Stellar PH",
    org: "Stellar SEA",
    initials: "SS",
    bg: "#B7ACE81a",
    color: "#B7ACE8",
    prize: 9000,
    prizeToken: "PHP" as PrizeToken,
    prizeUsdc: 75,
    type: "bounty" as const,
    skill: "content",
    deadline: "May 30",
    due: "Due in 4d",
    submissions: 5,
    fee: "2 XLM",
    featured: false,
    live: true,
    status: "open" as BountyStatus,
    desc: "Grow the Stellar Philippines community. Host 2 local events, produce 4 pieces of content, and onboard 50 new contributors.",
    deliverables: [
      "Evidence of 2 IRL events hosted",
      "4 published content pieces",
      "50 new signups via referral link",
      "Monthly report",
    ],
    winner: null,
  },
  {
    id: 6,
    slug: "build-freighter-mobile-adapter",
    title: "Build Freighter wallet mobile adapter",
    org: "StellarDAO",
    initials: "SD",
    bg: "#00A7B51a",
    color: "#00A7B5",
    prize: 32000,
    prizeToken: "PHP" as PrizeToken,
    prizeUsdc: 267,
    type: "project" as const,
    skill: "dev",
    deadline: "Jun 20",
    due: "Due in 19d",
    submissions: 3,
    fee: "2 XLM",
    featured: true,
    live: true,
    status: "open" as BountyStatus,
    desc: "Build a React Native compatible adapter for Freighter wallet enabling mobile dApps to sign Stellar transactions.",
    deliverables: [
      "React Native package published to npm",
      "Works with Expo and bare RN",
      "Full test suite",
      "Demo app",
    ],
    winner: null,
  },
];

// ─── Mock Submissions ────────────────────────────────────────────────────────

export const SUBMISSIONS: Submission[] = [
  {
    id: "sub-001",
    bountySlug: "build-soroban-token-swap",
    submitterName: "Juan dela Cruz",
    submitterHandle: "@juandc",
    submitterInitials: "JC",
    submitterColor: "#00A7B5",
    walletAddress: "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6IQJZFE3CEWHG4M7RU1ND",
    submissionUrl: "https://github.com/juandc/stellar-token-swap",
    twitterUrl: "https://x.com/juandc/status/mock",
    description:
      "A full Soroban token swap UI with Freighter integration, USDC/XLM/PHP support, and testnet contract calls. Deployed on Vercel.",
    submittedAt: "2026-05-20T10:30:00Z",
    status: "pending",
    txHash: "f1e2d3c4b5a6f1e2d3c4b5a6f1e2d3c4b5a6f1e2d3c4b5a6f1e2d3c4b5a6f1e2",
    entryFeeTxHash:
      "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  },
  {
    id: "sub-002",
    bountySlug: "build-soroban-token-swap",
    submitterName: "Renz Bautista",
    submitterHandle: "@renzb",
    submitterInitials: "RB",
    submitterColor: "#FDDA24",
    walletAddress: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
    submissionUrl: "https://github.com/renzb/xlm-swap-dapp",
    description:
      "Token swap interface with animated price impact indicator and slippage controls.",
    submittedAt: "2026-05-21T08:00:00Z",
    status: "pending",
    txHash: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
    entryFeeTxHash:
      "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
  },
  {
    id: "sub-003",
    bountySlug: "design-contributor-onboarding",
    submitterName: "Paolo Reyes",
    submitterHandle: "@preyes",
    submitterInitials: "PR",
    submitterColor: "#B7ACE8",
    walletAddress: "GBVVJJWVPBNT2YYQNZJPF5YKBGBU4FNGJ5JZWPVNMKW3TXQXTHWF2BD",
    submissionUrl: "https://figma.com/file/mock/stellar-onboarding",
    description:
      "10-screen Figma file covering wallet connect, profile setup, and first bounty discovery with dark mode support.",
    submittedAt: "2026-05-19T14:00:00Z",
    status: "under_review",
    txHash: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
    entryFeeTxHash:
      "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
  },
  {
    id: "sub-004",
    bountySlug: "write-technical-docs",
    submitterName: "Ana Lim",
    submitterHandle: "@analim",
    submitterInitials: "AL",
    submitterColor: "#00A7B5",
    walletAddress: "GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6IQJZFE3CEWHG4M7RU1ND",
    submissionUrl: "https://github.com/analim/soroban-escrow-docs",
    description:
      "Complete API reference for the StellarEarn escrow contract with JS integration examples and a deployed docs site.",
    submittedAt: "2026-05-18T09:00:00Z",
    status: "winner",
    txHash: "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1",
    entryFeeTxHash:
      "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  },
];

// ─── "My" mock submissions (simulated logged-in user) ────────────────────────

export const MY_SUBMISSIONS: Submission[] = [
  SUBMISSIONS[0], // open bounty — pending
  SUBMISSIONS[2], // under_review bounty — under_review
];

// ─── Grants ──────────────────────────────────────────────────────────────────

export const GRANTS = [
  {
    id: 1,
    title: "Stellar SEA Ecosystem Grant — Wave 3",
    org: "Stellar Foundation",
    initials: "SF",
    bg: "linear-gradient(135deg,#002E5D,#00A7B5)",
    prize: "₱250,000",
  },
  {
    id: 2,
    title: "StellarEarn Builder Grant",
    org: "StellarEarn",
    initials: "SE",
    bg: "linear-gradient(135deg,#00A7B5,#B7ACE8)",
    prize: "Up to ₱50,000",
  },
  {
    id: 3,
    title: "Anchor Integration Accelerator",
    org: "Stellar SEA",
    initials: "SS",
    bg: "linear-gradient(135deg,#FDDA24,#00A7B5)",
    prize: "Up to ₱100,000",
  },
];

// ─── Earners ─────────────────────────────────────────────────────────────────

export const EARNERS = [
  {
    name: "Juan dela Cruz",
    task: "Built Soroban escrow · StellarDAO",
    prize: "25k",
    token: "PHP",
    initials: "JC",
    color: "#00A7B5",
  },
  {
    name: "Maria Santos",
    task: "SEA Anchor Research · Stellar SEA",
    prize: "18k",
    token: "PHP",
    initials: "MS",
    color: "#00A7B5",
  },
  {
    name: "Paolo Reyes",
    task: "Onboarding design · StellarEarn",
    prize: "12k",
    token: "PHP",
    initials: "PR",
    color: "#B7ACE8",
  },
  {
    name: "Ana Lim",
    task: "Technical docs · StellarDAO",
    prize: "6.5k",
    token: "PHP",
    initials: "AL",
    color: "#00A7B5",
  },
  {
    name: "Renz Bautista",
    task: "Mobile wallet adapter · StellarDAO",
    prize: "32k",
    token: "PHP",
    initials: "RB",
    color: "#FDDA24",
  },
  {
    name: "Kath Villanueva",
    task: "Community growth · Stellar PH",
    prize: "9k",
    token: "PHP",
    initials: "KV",
    color: "#B7ACE8",
  },
];

// ─── Activities ───────────────────────────────────────────────────────────────

export const ACTIVITIES = [
  {
    name: "Juan dela Cruz",
    handle: "@juandc",
    time: "2m",
    action: "just submitted a bounty",
    initials: "JC",
    color: "#00A7B5",
  },
  {
    name: "Maria Santos",
    handle: "@mariasantos",
    time: "15m",
    action: "just submitted a bounty",
    initials: "MS",
    color: "#00A7B5",
  },
  {
    name: "Paolo Reyes",
    handle: "@preyes",
    time: "33m",
    action: "just submitted a bounty",
    initials: "PR",
    color: "#B7ACE8",
  },
  {
    name: "Ana Lim",
    handle: "@analim",
    time: "1h",
    action: "just submitted a bounty",
    initials: "AL",
    color: "#00A7B5",
  },
  {
    name: "Renz Bautista",
    handle: "@renzb",
    time: "2h",
    action: "just submitted a bounty",
    initials: "RB",
    color: "#FDDA24",
  },
  {
    name: "Kath Villanueva",
    handle: "@kathv",
    time: "3h",
    action: "just submitted a bounty",
    initials: "KV",
    color: "#B7ACE8",
  },
];

// ─── Derived Types ────────────────────────────────────────────────────────────

export type Bounty = (typeof BOUNTIES)[number];
export type Tab = "all" | "bounties" | "projects";
export type Skill = "all" | "content" | "design" | "dev" | "research";
