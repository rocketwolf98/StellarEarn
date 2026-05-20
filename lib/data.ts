export const BOUNTIES = [
  { id: 1, slug: "build-soroban-token-swap", title: "Build a Soroban token swap interface", org: "StellarDAO", initials: "SD", bg: "#00A7B51a", color: "#00A7B5", prize: 25000, type: "bounty" as const, skill: "dev", deadline: "Jun 1", due: "Due in 6d", submissions: 4, fee: "2 XLM", featured: true, live: true, desc: "Build a clean UI for swapping Stellar assets via a deployed Soroban contract. Integrate Freighter wallet. Supports USDC, XLM, and PHP-anchor assets.", deliverables: ["Next.js or React app deployed to Vercel", "Freighter wallet connect + SEP-10 auth", "Live testnet contract calls", "Mobile-responsive UI", "GitHub repo + recorded demo"] },
  { id: 2, slug: "design-contributor-onboarding", title: "Design contributor onboarding for StellarEarn", org: "StellarEarn", initials: "SE", bg: "#B7ACE81a", color: "#B7ACE8", prize: 12000, type: "bounty" as const, skill: "design", deadline: "May 28", due: "Due in 1d", submissions: 7, fee: "2 XLM", featured: true, live: true, desc: "Design the onboarding experience for first-time contributors — wallet connect, profile setup, and first bounty discovery.", deliverables: ["Figma file with full flow, min 8 screens", "Mobile + desktop variants", "Wallet connect states", "Handoff-ready with component notes"] },
  { id: 3, slug: "write-technical-docs", title: "Write technical docs for Soroban escrow contract", org: "StellarDAO", initials: "SD", bg: "#00A7B51a", color: "#00A7B5", prize: 6500, type: "bounty" as const, skill: "content", deadline: "May 20", due: "Due in 3d", submissions: 11, fee: "2 XLM", featured: false, live: false, desc: "Document the StellarEarn escrow contract for developers integrating with it. Cover all public functions, error codes, and JS SDK integration examples.", deliverables: ["README with full contract API docs", "Integration guide with JS examples", "Error handling reference", "Deployed docs site"] },
  { id: 4, slug: "research-php-anchor", title: "Research report: PHP anchor landscape in SEA", org: "Stellar SEA", initials: "SS", bg: "#00A7B51a", color: "#00A7B5", prize: 18000, type: "project" as const, skill: "research", deadline: "Jun 15", due: "Due in 4d", submissions: 2, fee: "2 XLM", featured: false, live: true, desc: "Map Stellar anchors operating in SEA supporting PHP, IDR, or MYR. Evaluate SEP compliance, fees, and UX.", deliverables: ["Min 5 anchors reviewed in depth", "SEP-6 / SEP-24 compliance matrix", "Fee comparison table", "Recommended shortlist", "PDF + Notion deliverable"] },
  { id: 5, slug: "community-growth-lead", title: "Community growth lead — Stellar PH", org: "Stellar SEA", initials: "SS", bg: "#B7ACE81a", color: "#B7ACE8", prize: 9000, type: "bounty" as const, skill: "content", deadline: "May 30", due: "Due in 4d", submissions: 5, fee: "2 XLM", featured: false, live: true, desc: "Grow the Stellar Philippines community. Host 2 local events, produce 4 pieces of content, and onboard 50 new contributors.", deliverables: ["Evidence of 2 IRL events hosted", "4 published content pieces", "50 new signups via referral link", "Monthly report"] },
  { id: 6, slug: "build-freighter-mobile-adapter", title: "Build Freighter wallet mobile adapter", org: "StellarDAO", initials: "SD", bg: "#00A7B51a", color: "#00A7B5", prize: 32000, type: "project" as const, skill: "dev", deadline: "Jun 20", due: "Due in 19d", submissions: 3, fee: "2 XLM", featured: true, live: true, desc: "Build a React Native compatible adapter for Freighter wallet enabling mobile dApps to sign Stellar transactions.", deliverables: ["React Native package published to npm", "Works with Expo and bare RN", "Full test suite", "Demo app"] },
];

export const GRANTS = [
  { id: 1, title: "Stellar SEA Ecosystem Grant — Wave 3", org: "Stellar Foundation", initials: "SF", bg: "linear-gradient(135deg,#002E5D,#00A7B5)", prize: "₱250,000" },
  { id: 2, title: "StellarEarn Builder Grant", org: "StellarEarn", initials: "SE", bg: "linear-gradient(135deg,#00A7B5,#B7ACE8)", prize: "Up to ₱50,000" },
  { id: 3, title: "Anchor Integration Accelerator", org: "Stellar SEA", initials: "SS", bg: "linear-gradient(135deg,#FDDA24,#00A7B5)", prize: "Up to ₱100,000" },
];

export const EARNERS = [
  { name: "Juan dela Cruz", task: "Built Soroban escrow · StellarDAO", prize: "25k", token: "PHP", initials: "JC", color: "#00A7B5" },
  { name: "Maria Santos", task: "SEA Anchor Research · Stellar SEA", prize: "18k", token: "PHP", initials: "MS", color: "#00A7B5" },
  { name: "Paolo Reyes", task: "Onboarding design · StellarEarn", prize: "12k", token: "PHP", initials: "PR", color: "#B7ACE8" },
  { name: "Ana Lim", task: "Technical docs · StellarDAO", prize: "6.5k", token: "PHP", initials: "AL", color: "#00A7B5" },
  { name: "Renz Bautista", task: "Mobile wallet adapter · StellarDAO", prize: "32k", token: "PHP", initials: "RB", color: "#FDDA24" },
  { name: "Kath Villanueva", task: "Community growth · Stellar PH", prize: "9k", token: "PHP", initials: "KV", color: "#B7ACE8" },
];

export const ACTIVITIES = [
  { name: "Juan dela Cruz", handle: "@juandc", time: "2m", action: "just submitted a bounty", initials: "JC", color: "#00A7B5" },
  { name: "Maria Santos", handle: "@mariasantos", time: "15m", action: "just submitted a bounty", initials: "MS", color: "#00A7B5" },
  { name: "Paolo Reyes", handle: "@preyes", time: "33m", action: "just submitted a bounty", initials: "PR", color: "#B7ACE8" },
  { name: "Ana Lim", handle: "@analim", time: "1h", action: "just submitted a bounty", initials: "AL", color: "#00A7B5" },
  { name: "Renz Bautista", handle: "@renzb", time: "2h", action: "just submitted a bounty", initials: "RB", color: "#FDDA24" },
  { name: "Kath Villanueva", handle: "@kathv", time: "3h", action: "just submitted a bounty", initials: "KV", color: "#B7ACE8" },
];

export type Bounty = (typeof BOUNTIES)[number];
export type Tab = "all" | "bounties" | "projects";
export type Skill = "all" | "content" | "design" | "dev" | "research";
