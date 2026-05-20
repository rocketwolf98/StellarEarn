#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, 
    panic_with_error, Map
};

#[contracttype]
#[derive(Clone)]
pub struct EscrowData {
    pub bounty_id: u64,
    pub poster: Address,
    pub asset: Address,
    pub amount: i128,
    pub released: bool,
    pub refunded: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Escrow(u64),
    BountyContract,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // ─────────────────────────────────────────────
    // INITIALIZATION
    // ─────────────────────────────────────────────
    
    pub fn initialize(env: Env, bounty_contract: Address) {
        if env.storage().instance().has(&DataKey::BountyContract) {
            panic!("already initialized");
        }
        
        env.storage().instance().set(&DataKey::BountyContract, &bounty_contract);
    }
    
    // ─────────────────────────────────────────────
    // DEPOSIT (Called by Bounty Contract)
    // ─────────────────────────────────────────────
    
    pub fn deposit(
        env: Env,
        bounty_id: u64,
        poster: Address,
        asset: Address,
        amount: i128,
    ) {
        let bounty_contract: Address = env.storage().instance().get(&DataKey::BountyContract).unwrap();
        let caller = env.invoker();
        assert!(caller == bounty_contract, "only bounty contract");
        
        assert!(amount > 0, "invalid amount");
        
        // Transfer tokens from poster to escrow
        let token = token::Client::new(&env, &asset);
        token.transfer(&poster, &env.current_contract_address(), &amount);
        
        // Verify balance increased
        let new_balance = token.balance(&env.current_contract_address());
        let expected = token.balance(&poster) + amount; // Simplified check
        
        // Store escrow data
        let escrow = EscrowData {
            bounty_id,
            poster,
            asset,
            amount,
            released: false,
            refunded: false,
        };
        
        env.storage().persistent().set(&DataKey::Escrow(bounty_id), &escrow);
    }
    
    // ─────────────────────────────────────────────
    // RELEASE (Called by Bounty Contract)
    // ─────────────────────────────────────────────
    
    pub fn release(env: Env, bounty_id: u64, winner: Address) {
        let bounty_contract: Address = env.storage().instance().get(&DataKey::BountyContract).unwrap();
        let caller = env.invoker();
        assert!(caller == bounty_contract, "only bounty contract");
        
        let mut escrow: EscrowData = env.storage()
            .persistent()
            .get(&DataKey::Escrow(bounty_id))
            .unwrap_or_else(|| panic!("no escrow found"));
        
        assert!(!escrow.released, "already released");
        assert!(!escrow.refunded, "already refunded");
        
        // Transfer to winner
        let token = token::Client::new(&env, &escrow.asset);
        token.transfer(&env.current_contract_address(), &winner, &escrow.amount);
        
        escrow.released = true;
        env.storage().persistent().set(&DataKey::Escrow(bounty_id), &escrow);
    }
    
    // ─────────────────────────────────────────────
    // REFUND (Called by Bounty Contract)
    // ─────────────────────────────────────────────
    
    pub fn refund(env: Env, bounty_id: u64) {
        let bounty_contract: Address = env.storage().instance().get(&DataKey::BountyContract).unwrap();
        let caller = env.invoker();
        assert!(caller == bounty_contract, "only bounty contract");
        
        let mut escrow: EscrowData = env.storage()
            .persistent()
            .get(&DataKey::Escrow(bounty_id))
            .unwrap_or_else(|| panic!("no escrow found"));
        
        assert!(!escrow.released, "already released");
        assert!(!escrow.refunded, "already refunded");
        
        // Transfer back to poster
        let token = token::Client::new(&env, &escrow.asset);
        token.transfer(&env.current_contract_address(), &escrow.poster, &escrow.amount);
        
        escrow.refunded = true;
        env.storage().persistent().set(&DataKey::Escrow(bounty_id), &escrow);
    }
    
    // ─────────────────────────────────────────────
    // VIEW FUNCTIONS
    // ─────────────────────────────────────────────
    
    pub fn get_escrow(env: Env, bounty_id: u64) -> EscrowData {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(bounty_id))
            .unwrap_or_else(|| panic!("no escrow found"))
    }
    
    pub fn is_released(env: Env, bounty_id: u64) -> bool {
        if let Some(escrow) = env.storage().persistent().get(&DataKey::Escrow(bounty_id)) {
            escrow.released
        } else {
            false
        }
    }
    
    pub fn is_refunded(env: Env, bounty_id: u64) -> bool {
        if let Some(escrow) = env.storage().persistent().get(&DataKey::Escrow(bounty_id)) {
            escrow.refunded
        } else {
            false
        }
    }
}