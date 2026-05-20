# Soroban Bounty Platform - Smart Contract Suite

A decentralized bounty platform built on Soroban (Stellar Smart Contracts), inspired by Superteam Earn. This suite manages bounty creation, submissions, escrow, reputation tracking, and NFT portfolio minting.

## Architecture Overview

The platform consists of **4 interconnected smart contracts**:

```
┌─────────────────┐     ┌──────────────────┐
│  Bounty Contract│────▶│  Reputation      │
│  (Main Logic)   │     │  Contract        │
└────────┬────────┘     └──────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐     ┌──────────────────┐
│  Escrow         │     │  NFT Contract    │
│  Contract       │     │  (Portfolio)     │
└─────────────────┘     └──────────────────┘
```

## Contract Addresses (After Deployment)

| Contract | Address | Purpose |
|----------|---------|---------|
| BountyContract | `0x...` | Main business logic |
| ReputationContract | `0x...` | XP, badges, leaderboards |
| EscrowContract | `0x...` | Prize holding & release |
| NFTContract | `0x...` | Portfolio NFTs |

## Quick Start for Backend Integration

### 1. Contract Initialization (One-Time)

```javascript
// Deploy in this order:
// 1. ReputationContract
// 2. EscrowContract  
// 3. BountyContract
// 4. NFTContract

// Initialize BountyContract
await bountyContract.initialize(
    platformAdminAddress,    // Your wallet address
    escrowContractAddress,   // From step 2
    reputationContractAddress, // From step 1
    submissionFee           // e.g., 10000000 (10 tokens with 7 decimals)
);

// Initialize ReputationContract
await reputationContract.initialize(
    platformAdminAddress,
    bountyContractAddress    // After BountyContract is deployed
);

// Initialize EscrowContract
await escrowContract.initialize(
    bountyContractAddress    // After BountyContract is deployed
);

// Initialize NFTContract
await nftContract.initialize(
    bountyContractAddress,   // After BountyContract is deployed
    "ipfs://your-base-uri/"  // Base URI for NFT metadata
);
```

## API Reference

### Bounty Contract Functions

#### `create_bounty` - Create a new bounty

**Parameters:**
- `poster: Address` - Wallet creating the bounty
- `asset: Address` - Token contract address (e.g., USDC, XLM)
- `prize: i128` - Prize amount (in smallest unit, e.g., 10000000 = 10 USDC)
- `deadline: u64` - Unix timestamp when bounty expires
- `skill_tag: String` - Required skill (e.g., "development", "design")

**Returns:** `u64` - Bounty ID

**Events:** `CREATE` (bounty_id, poster, prize)

**Auth Required:** Poster must sign transaction

**Example:**
```javascript
const bountyId = await bountyContract.create_bounty(
    posterAddress,
    usdcAddress,
    10000000,  // 10 USDC
    Math.floor(Date.now() / 1000) + 604800, // 7 days
    "development"
);
```

---

#### `submit` - Submit work for a bounty

**Parameters:**
- `bounty_id: u64` - Bounty ID to submit to
- `contributor: Address` - Wallet submitting work
- `work_hash: String` - IPFS hash or content identifier

**Events:** `SUBMIT` (bounty_id, contributor, work_hash)

**Auth Required:** Contributor must sign transaction

**Pre-conditions:**
- Bounty must be Open or UnderReview
- Deadline not passed
- Contributor hasn't submitted before
- Contributor must pay submission fee

**Example:**
```javascript
await bountyContract.submit(
    bountyId,
    contributorAddress,
    "QmHash..."  // IPFS hash of work
);
```

---

#### `approve` - Select winner and award prize

**Parameters:**
- `bounty_id: u64` - Bounty ID
- `winner: Address` - Winning contributor's wallet
- `placement: BountyPlacement` - `First`, `Second`, or `Third`
- `review_score: u8` - Quality score 1-10

**Events:** `APPROVE` (bounty_id, winner, placement)

**Auth Required:** Bounty poster must sign transaction

**Effects:**
- Releases prize from escrow to winner
- Awards XP (80/60/50 based on placement)
- Mints portfolio NFT for winner
- Awards reviewer XP to poster (5-10 XP based on review_score)
- Marks bounty as Completed

**Example:**
```javascript
await bountyContract.approve(
    bountyId,
    winnerAddress,
    "First",  // or "Second", "Third"
    9  // Review score
);
```

---

#### `cancel` - Cancel bounty (only if no submissions)

**Parameters:**
- `bounty_id: u64` - Bounty ID to cancel

**Events:** `CANCEL` (bounty_id)

**Auth Required:** Bounty poster must sign transaction

**Pre-conditions:**
- No submissions received
- Bounty not yet expired

**Effects:**
- Refunds prize to poster
- Marks bounty as Cancelled

**Example:**
```javascript
await bountyContract.cancel(bountyId);
```

---

#### `expire` - Mark expired bounty (anyone can call)

**Parameters:**
- `bounty_id: u64` - Expired bounty ID

**Events:** `EXPIRE` (bounty_id)

**Pre-conditions:**
- Deadline passed
- Bounty not already finalized

**Effects:**
- Refunds prize to poster
- Refunds all submission fees to contributors
- Marks bounty as Expired

**Example:**
```javascript
await bountyContract.expire(bountyId);
```

---

#### `claim_fees` - Platform admin collects fees

**Parameters:**
- `platform_admin: Address` - Admin wallet (must match configured admin)
- `bounty_id: u64` - Completed bounty ID

**Events:** `CLAIM` (bounty_id, admin, amount)

**Auth Required:** Platform admin must sign

**Pre-conditions:**
- Bounty status = Completed
- Fees not yet claimed

**Example:**
```javascript
await bountyContract.claim_fees(adminAddress, bountyId);
```

---

#### `review_submission` - Rate a submission (optional)

**Parameters:**
- `bounty_id: u64` - Bounty ID
- `contributor: Address` - Contributor to rate
- `score: u8` - Score 1-10

**Auth Required:** Bounty poster

**Example:**
```javascript
await bountyContract.review_submission(bountyId, contributorAddress, 8);
```

---

### View Functions (No Transaction Required)

#### `get_bounty(bounty_id: u64) -> Bounty`

Returns bounty details:
```typescript
interface Bounty {
    id: u64;
    poster: Address;
    asset: Address;
    prize: i128;
    submission_fee: i128;
    deadline: u64;
    skill_tag: String;
    status: 'Open' | 'UnderReview' | 'Completed' | 'Cancelled' | 'Expired';
    winner: Address | null;
    placement: 'First' | 'Second' | 'Third' | null;
}
```

#### `get_submissions(bounty_id: u64) -> Vec<Submission>`

Returns all submissions:
```typescript
interface Submission {
    bounty_id: u64;
    contributor: Address;
    work_hash: String;
    timestamp: u64;
    fee_paid: i128;
    review_score: u8 | null;
}
```

#### `bounty_count() -> u64`

Returns total number of bounties created.

#### `get_pending_fees(bounty_id: u64) -> i128`

Returns unclaimed fees for a bounty.

#### `get_platform_pending_fees() -> i128`

Returns total unclaimed fees across all bounties.

---

### Reputation Contract Functions

#### `get_profile(contributor: Address) -> ContributorProfile`

```typescript
interface ContributorProfile {
    total_xp: i128;
    skill_xp: Map<String, i128>;
    completed_bounties: u32;
    won_bounties: u32;
    reviewed_bounties: u32;
    member_tier: 'Lurker' | 'Contributor' | 'Member' | 'Lead' | 'Legend';
    last_active: u64;
    nft_portfolio: Vec<u64>;
}
```

#### `get_skill_leaderboard(skill_tag: String, limit: u32) -> Vec<(Address, i128)>`

Returns top contributors for a specific skill.

#### `get_badges(contributor: Address) -> Vec<Badge>`

Returns all badges earned by a contributor.

#### `get_contributor_stats(contributor: Address) -> (i128, u32, MemberTier)`

Returns (total_xp, completed_bounties, member_tier).

---

### Escrow Contract Functions

#### `get_escrow(bounty_id: u64) -> EscrowData`

```typescript
interface EscrowData {
    bounty_id: u64;
    poster: Address;
    asset: Address;
    amount: i128;
    released: boolean;
    refunded: boolean;
}
```

#### `is_released(bounty_id: u64) -> bool`
#### `is_refunded(bounty_id: u64) -> bool`

---

### NFT Contract Functions

#### `get_nft(token_id: u64) -> PortfolioNFT`

```typescript
interface PortfolioNFT {
    token_id: u64;
    owner: Address;
    bounty_id: u64;
    metadata_uri: String;
    minted_at: u64;
}
```

#### `get_owner_nfts(owner: Address) -> Vec<PortfolioNFT>`
#### `total_supply() -> u64`

---

## Integration Examples

### Backend API Endpoints (Suggested)

```javascript
// POST /api/bounties/create
app.post('/api/bounties/create', async (req, res) => {
    const { posterAddress, prize, deadline, skillTag } = req.body;
    
    // Call smart contract
    const tx = await bountyContract.create_bounty(
        posterAddress,
        USDC_ADDRESS,
        prize * 1e7, // Convert to smallest unit
        deadline,
        skillTag
    );
    
    // Wait for confirmation
    await tx.wait();
    
    res.json({ bountyId: tx.result, txHash: tx.hash });
});

// GET /api/bounties/:id
app.get('/api/bounties/:id', async (req, res) => {
    const bounty = await bountyContract.get_bounty(req.params.id);
    const submissions = await bountyContract.get_submissions(req.params.id);
    
    res.json({ bounty, submissions });
});

// GET /api/leaderboard/:skill
app.get('/api/leaderboard/:skill', async (req, res) => {
    const leaderboard = await reputationContract.get_skill_leaderboard(
        req.params.skill,
        100 // limit
    );
    
    // Enrich with profile data
    const enriched = await Promise.all(
        leaderboard.map(async ([address, xp]) => ({
            address,
            xp,
            profile: await reputationContract.get_profile(address)
        }))
    );
    
    res.json(enriched);
});

// GET /api/contributors/:address/stats
app.get('/api/contributors/:address/stats', async (req, res) => {
    const [xp, bounties, tier] = await reputationContract.get_contributor_stats(
        req.params.address
    );
    
    const badges = await reputationContract.get_badges(req.params.address);
    const nfts = await nftContract.get_owner_nfts(req.params.address);
    
    res.json({ xp, bounties, tier, badges, nfts });
});
```

### Webhook Configuration

Set up webhooks to listen for contract events:

```javascript
// Listen for bounty completion
bountyContract.on('APPROVE', async (bountyId, winner, placement) => {
    // Notify winner
    await sendEmail(winner.email, 'You won a bounty!');
    
    // Update database
    await db.bounties.update(bountyId, { status: 'completed', winner });
    
    // Update leaderboard cache
    await updateLeaderboardCache();
});

// Listen for new submissions
bountyContract.on('SUBMIT', async (bountyId, contributor, workHash) => {
    // Notify bounty poster
    await sendNotification(bountyId, 'New submission received');
    
    // Store work metadata
    await db.submissions.create({
        bountyId,
        contributor,
        workHash,
        timestamp: Date.now()
    });
});
```

## Database Schema Suggestions

```sql
-- Bounties table
CREATE TABLE bounties (
    id BIGINT PRIMARY KEY,
    poster_address VARCHAR(56),
    prize_amount BIGINT,
    submission_fee BIGINT,
    deadline TIMESTAMP,
    skill_tag VARCHAR(50),
    status VARCHAR(20),
    winner_address VARCHAR(56),
    placement VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    bounty_id BIGINT REFERENCES bounties(id),
    contributor_address VARCHAR(56),
    work_hash VARCHAR(100),
    ipfs_url TEXT,
    fee_paid BIGINT,
    review_score SMALLINT,
    submitted_at TIMESTAMP DEFAULT NOW()
);

-- Contributors table (cached from chain)
CREATE TABLE contributors (
    address VARCHAR(56) PRIMARY KEY,
    total_xp BIGINT,
    member_tier VARCHAR(20),
    completed_bounties INT,
    won_bounties INT,
    last_active TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard cache
CREATE TABLE skill_leaderboards (
    skill_tag VARCHAR(50),
    contributor_address VARCHAR(56),
    xp BIGINT,
    rank INT,
    updated_at TIMESTAMP,
    PRIMARY KEY (skill_tag, contributor_address)
);
```

## Error Handling

Common errors and handling:

| Error | Cause | Solution |
|-------|-------|----------|
| `already initialized` | Contract already set up | Skip initialization |
| `invalid prize` | Prize <= 0 | Validate input > 0 |
| `invalid deadline` | Deadline in past | Set future timestamp |
| `expired` | Bounty deadline passed | Check deadline before submit |
| `already submitted` | Duplicate submission | Prevent multiple submissions |
| `not active` | Bounty not Open/UnderReview | Check status first |
| `has submissions` | Can't cancel with submissions | Use expire instead |
| `not platform admin` | Unauthorized admin action | Check admin wallet |

## Gas Optimization Tips

1. **Batch queries**: Use `get_bounties` with pagination instead of individual calls
2. **Cache frequently accessed data**: Store leaderboards in your database
3. **Use view functions**: They're free and don't consume gas
4. **Monitor submission fees**: Adjust based on network conditions

## Testing Checklist

- [ ] Create bounty with valid params
- [ ] Create bounty with invalid params (should fail)
- [ ] Submit work to bounty
- [ ] Submit duplicate work (should fail)
- [ ] Approve winner with correct placement
- [ ] Approve non-contributor (should fail)
- [ ] Cancel bounty with no submissions
- [ ] Cancel bounty with submissions (should fail)
- [ ] Expire bounty after deadline
- [ ] Claim fees as admin
- [ ] Claim fees as non-admin (should fail)
- [ ] Verify XP awarded correctly
- [ ] Verify NFT minted on win
- [ ] Check leaderboard updates

## Support & Maintenance

### Admin Responsibilities
1. Monitor submission fee claims
2. Update XP multipliers if needed
3. Handle edge cases (manual refunds if contract bugs)
4. Maintain NFT metadata infrastructure

### Monitoring Metrics
- Total bounties created
- Success rate (completed vs expired)
- Average time to completion
- Total fees collected
- Active contributors count

## Deployment Script Example

```javascript
// deploy.js
const { deployContract, getWallet } = require('soroban-client');

async function deploy() {
    const admin = await getWallet();
    
    // Deploy contracts
    const rep = await deployContract('reputation.wasm', admin);
    const escrow = await deployContract('escrow.wasm', admin);
    const bounty = await deployContract('bounty.wasm', admin);
    const nft = await deployContract('nft.wasm', admin);
    
    // Initialize
    await bounty.initialize(admin.address, escrow.address, rep.address, 1000000);
    await rep.initialize(admin.address, bounty.address);
    await escrow.initialize(bounty.address);
    await nft.initialize(bounty.address, 'ipfs://base/');
    
    console.log('Deployment complete!');
    console.log('Bounty:', bounty.address);
    console.log('Reputation:', rep.address);
    console.log('Escrow:', escrow.address);
    console.log('NFT:', nft.address);
}
```

## Security Considerations

1. **Never store private keys** in your backend
2. **Verify all signatures** before processing off-chain actions
3. **Rate limit API endpoints** to prevent spam
4. **Monitor for suspicious patterns** (rapid-fire submissions, etc.)
5. **Keep contracts upgraded** with latest security patches
6. **Use multisig for platform admin wallet**

## Contact & Support

For technical questions or bug reports:
- Create issue in GitHub repository
- Contact: [Your contact info]

---

**Version:** 1.0.0  
**Last Updated:** May 21, 2026
**Soroban Version:** 20.0.0+