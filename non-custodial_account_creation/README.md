
---

# Non-Custodial Account Creation on Stellar

## Table of Contents
- [What is a Non-Custodial Account?](#what-is-a-non-custodial-account)
- [Key Concepts](#key-concepts)
- [Account Creation Strategies](#account-creation-strategies)
- [Implementation Guide](#implementation-guide)
- [Code Examples](#code-examples)
- [Account Funding](#account-funding)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting & Common Errors](#troubleshooting--common-errors)

---

## What is a Non-Custodial Account?

In a **non-custodial** model, the user stores their own secret key and maintains full control over their funds. The application never has access to the user's private keys or secret seed.

**Key Principle:** The encrypted secret key should only ever live in the browser/client. It should never be shared with your server or anybody else.

This aligns with the core philosophy of decentralization: **"Not your keys, not your coins."**

---

## Key Concepts

### Keypair Components

| Component | Description | Sharing Status |
|-----------|-------------|----------------|
| **Public Key** (Account ID) | Used to identify the account on the Stellar network | ✅ Safe to share |
| **Secret Seed** (Private Key) | Proves ownership and controls the account | ❌ NEVER share |
| **Keypair** | Contains both public key and secret seed | N/A |

Every Stellar account has a **public key** and a **secret seed**. The seed is the single secret piece of data used to generate both the public and private keys.

### Stellar Account Requirements

- **Minimum Balance**: Accounts must maintain a minimum balance of **1 XLM** to exist on the ledger
- **Trustlines**: Additional .5 XLM reserve for establishing the first trustline
- **Recommended Starting Balance**: **2 XLM** (minimum balance + trustline reserve + transaction fees)

---

## Account Creation Strategies

When implementing non-custodial accounts in your application, you have two primary strategies:

### Strategy 1: Wallet Creates Account on User Sign-Up

**Flow:**
1. User signs up → Wallet generates keypair
2. Wallet creates and funds the account with 2 XLM
3. Wallet establishes necessary trustlines
4. User can immediately use the wallet

**Best for:** Applications that want users to have immediate access

### Strategy 2: Anchor Creates Account on First Deposit

**Flow:**
1. Wallet registers user and generates keypair
2. User initiates first deposit
3. Anchor receives fiat transfer
4. Anchor creates and funds the Stellar account
5. Wallet detects account creation and establishes trustlines

**Best for:** Applications where the anchor (financial institution) handles onboarding

---

## Implementation Guide

### Step 1: Generate a Keypair

The first step is generating a cryptographic keypair. This is done entirely client-side.

**JavaScript (with Stellar SDK):**
```javascript
const StellarSdk = require('@stellar/stellar-sdk');

// Generate a random keypair
const pair = StellarSdk.Keypair.random();

// Store these values
const secretSeed = pair.secret();     // SAV76USXIJOBMEQXPANUOQM6F5LIOTLPDIDVRJBFFE2MDJXG24TAPUU7
const publicKey = pair.publicKey();   // GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB

console.log('Public Key (share this):', publicKey);
console.log('Secret Seed (KEEP SECRET):', secretSeed);
```

**Keypair Generation Examples (Multiple Languages):**

```python
# Python
from stellar_sdk import Keypair

pair = Keypair.random()
print("Public Key:", pair.public_key)
print("Secret Seed:", pair.secret)
```

```java
// Java
import org.stellar.sdk.KeyPair;

KeyPair pair = KeyPair.random();
System.out.println("Public Key: " + pair.getAccountId());
System.out.println("Secret Seed: " + new String(pair.getSecretSeed()));
```

```go
// Go
package main

import (
    "log"
    "github.com/stellar/go/keypair"
)

func main() {
    pair, err := keypair.Random()
    if err != nil {
        log.Fatal(err)
    }
    log.Println("Public Key:", pair.Address())
    log.Println("Secret Seed:", pair.Seed())
}
```

### Step 2: Encrypt and Store the Secret Key

For non-custodial security, encrypt the secret key before storing it locally.

```javascript
// Using @stellar/typescript-wallet-sdk-km for encryption
import { KeyManager } from '@stellar/typescript-wallet-sdk-km';

// Encrypt with user's pincode
const encryptedKey = await KeyManager.encryptKeypair(
    secretSeed,
    userPincode
);

// Store in localStorage (client-side only)
localStorage.setItem('stellar_key_id', encryptedKey.keyId);
localStorage.setItem('stellar_encrypted_key', encryptedKey.encryptedData);

// NEVER send this to your backend
```

### Step 3: Create the Account on Stellar Network

**On Testnet (using Friendbot):**

Friendbot is a utility that creates and funds test accounts.

```javascript
// Fund using Friendbot on Testnet
async function fundWithFriendbot(publicKey) {
    const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const data = await response.json();
    
    if (response.ok) {
        console.log('Account created and funded!', data);
    } else {
        console.error('Error:', data);
    }
    return data;
}

// Call it
await fundWithFriendbot(publicKey);
```

**On Mainnet:**

On Mainnet, accounts must be funded with real XLM. Options:
1. **Exchange Purchase**: Buy XLM from an exchange and send to the public key
2. **Create Account Operation**: An existing funded account can create a new account using the `createAccount` operation

```javascript
// Create account on Mainnet (from an existing funded account)
const server = new StellarSdk.Server('https://horizon.stellar.org');
const sourceAccount = await server.loadAccount(fundingAccountPublicKey);

const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.PUBLIC
})
    .addOperation(StellarSdk.Operation.createAccount({
        destination: newUserPublicKey,
        startingBalance: "2"  // 2 XLM minimum recommended
    }))
    .setTimeout(30)
    .build();

// Sign with funding account's secret key
transaction.sign(StellarSdk.Keypair.fromSecret(fundingAccountSecret));

// Submit transaction
const result = await server.submitTransaction(transaction);
```

### Step 4: Verify Account Creation

```javascript
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

async function checkAccountExists(publicKey) {
    try {
        const account = await server.loadAccount(publicKey);
        console.log('Account exists!');
        console.log('Balances:', account.balances);
        return account;
    } catch (error) {
        if (error.response?.status === 404) {
            console.log('Account not found yet');
            return null;
        }
        throw error;
    }
}

// Check account
const account = await checkAccountExists(publicKey);
```

### Step 5: Establish Trustlines (For Custom Assets)

If your application deals with custom tokens (like the bounty platform's asset), users need to establish trustlines.

```javascript
async function addTrustline(userKeypair, assetCode, assetIssuer) {
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const account = await server.loadAccount(userKeypair.publicKey());
    
    const asset = new StellarSdk.Asset(assetCode, assetIssuer);
    
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
    })
        .addOperation(StellarSdk.Operation.changeTrust({
            asset: asset,
            limit: "1000000"
        }))
        .setTimeout(30)
        .build();
    
    transaction.sign(userKeypair);
    const result = await server.submitTransaction(transaction);
    
    console.log('Trustline established!', result);
    return result;
}
```

---

## Account Funding

### Testnet Funding

| Method | Endpoint | XLM Provided | Notes |
|--------|----------|--------------|-------|
| Friendbot | `https://friendbot.stellar.org?addr={publicKey}` | 10,000 XLM | Instant, no auth needed |

### Mainnet Funding Options

| Option | Who Funds | Pros | Cons |
|--------|-----------|------|------|
| **Exchange Purchase** | User buys XLM | Truly non-custodial | User needs to buy crypto |
| **Platform Sponsors** | Your platform covers cost | Better UX for users | You pay the XLM cost |
| **Sponsored Reserves** | Your platform sponsors the account | XLM returns to you if account closes | More complex implementation |

### Recommended Mainnet Funding Flow

```javascript
// Your backend would handle this
async function fundUserAccount(userPublicKey) {
    // Your platform has a funded "master" account
    const masterKeypair = StellarSdk.Keypair.fromSecret(process.env.MASTER_SECRET);
    
    const server = new StellarSdk.Server('https://horizon.stellar.org');
    const masterAccount = await server.loadAccount(masterKeypair.publicKey());
    
    const transaction = new StellarSdk.TransactionBuilder(masterAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.PUBLIC
    })
        .addOperation(StellarSdk.Operation.createAccount({
            destination: userPublicKey,
            startingBalance: "2.5"  // 2.5 XLM (2 for requirements, .5 for fees)
        }))
        .setTimeout(60)
        .build();
    
    transaction.sign(masterKeypair);
    const result = await server.submitTransaction(transaction);
    
    console.log('User funded:', result);
    return result;
}
```

---

## Security Best Practices

### 1. Never Store Secrets on Your Backend

> "Since we are building a non-custodial application, the encrypted secret key will only ever live in the browser. It will never be shared with a server or anybody else." — Stellar Docs

### 2. Encrypt Before Storage

Always encrypt secret seeds before storing them in localStorage or IndexedDB.

```javascript
// Use the Wallet SDK's KeyManager
import { KeyManager } from '@stellar/typescript-wallet-sdk-km';

// Encrypt with user's pincode/password
const encrypted = await KeyManager.encryptKeypair(secretSeed, userPin);
```

### 3. Implement Authentication for Sensitive Operations

```javascript
// Require PIN confirmation before signing transactions
async function signWithUserConfirm(keyId, pin, transaction) {
    const decryptedKey = await KeyManager.decryptKeypair(keyId, pin);
    const keypair = StellarSdk.Keypair.fromSecret(decryptedKey);
    
    transaction.sign(keypair);
    return transaction;
}
```

### 4. Use Clear Session Management

```javascript
// Clear sensitive data on logout
function logout() {
    localStorage.removeItem('stellar_key_id');
    localStorage.removeItem('stellar_encrypted_key');
    sessionStorage.clear();
    window.location.href = '/login';
}
```

### 5. Minimum Balance Monitoring

Monitor account balances to ensure they never fall below the minimum reserve.

```javascript
const MINIMUM_BALANCE = 1;  // XLM
const TRUSTLINE_RESERVE = 0.5;  // XLM per trustline

async function checkAccountHealth(publicKey) {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    const requiredReserve = MINIMUM_BALANCE + (account.balances.length * TRUSTLINE_RESERVE);
    
    if (parseFloat(xlmBalance.balance) < requiredReserve) {
        console.warn('Account below minimum reserve!');
        return false;
    }
    return true;
}
```

---

## Troubleshooting & Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `404 Not Found` when loading account | Account not created on network yet | Fund the account first using Friendbot (testnet) or createAccount operation |
| `400 Bad Request` from Friendbot | Invalid public key format | Ensure public key is valid 56-character string starting with G |
| `Insufficient balance` for transaction | Account lacks XLM for fees | Add XLM to account for transaction fees (min 0.00001 XLM per operation) |
| `trustline already exists` | Duplicate trustline operation | Check if trustline exists before attempting to add |
| Minimum balance not maintained | Account balance too low | Add XLM or remove trustlines to reduce required balance |

---

## Complete Integration Example

Here's a complete flow integrating account creation into your bounty platform:

```javascript
// frontend/auth.js
import StellarSdk from '@stellar/stellar-sdk';
import { KeyManager } from '@stellar/typescript-wallet-sdk-km';

class StellarAuth {
    constructor() {
        this.server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    }
    
    // Step 1: Register new user
    async registerUser(pinCode) {
        // Generate keypair client-side
        const pair = StellarSdk.Keypair.random();
        
        // Encrypt secret with PIN
        const encrypted = await KeyManager.encryptKeypair(pair.secret(), pinCode);
        
        // Store encrypted data locally
        localStorage.setItem('stellarKeyId', encrypted.keyId);
        localStorage.setItem('stellarEncrypted', JSON.stringify(encrypted.encryptedData));
        
        // Send ONLY public key to your backend
        await fetch('/api/users/register', {
            method: 'POST',
            body: JSON.stringify({
                publicKey: pair.publicKey()
            })
        });
        
        // Fund on testnet (production: your backend would fund via createAccount)
        await this.fundTestAccount(pair.publicKey());
        
        return pair.publicKey();
    }
    
    async fundTestAccount(publicKey) {
        const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
        if (!response.ok) throw new Error('Funding failed');
        console.log('Account funded on testnet!');
    }
    
    async signTransaction(transactionXdr, pinCode) {
        // Get encrypted key
        const keyId = localStorage.getItem('stellarKeyId');
        const encryptedData = JSON.parse(localStorage.getItem('stellarEncrypted'));
        
        // Decrypt with PIN
        const decryptedSeed = await KeyManager.decryptKeypair(keyId, pinCode, encryptedData);
        const keypair = StellarSdk.Keypair.fromSecret(decryptedSeed);
        
        // Sign transaction
        const transaction = StellarSdk.TransactionBuilder.fromXDR(transactionXdr, StellarSdk.Networks.TESTNET);
        transaction.sign(keypair);
        
        return transaction.toXDR();
    }
}
```

---

## Additional Resources

- [Stellar Wallet SDK](https://stellar.org/products-and-tools/wallet-sdk) - Prepackaged features for wallet building
- [Stellar Laboratory](https://www.stellar.org/laboratory/) - Test transactions and account creation
- [Stellar Developer Docs - Account Creation](https://developers.stellar.org/docs/build/apps/example-application-tutorial/account-creation)
- [Application Design Considerations](https://developers.stellar.org/docs/build/apps/application-design-considerations)

---

**Version:** 1.0.0  
**Last Updated:** May 21, 2026
**Stellar SDK Version:** 12.0.0+

This guide provides everything needed to implement non-custodial Stellar accounts for your bounty platform. The key takeaway: **generate keys client-side, encrypt them, store locally, and never touch the backend**.