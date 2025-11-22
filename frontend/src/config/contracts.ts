/**
 * Contract addresses and configuration
 * Based on deployed contracts on Base Sepolia
 */

export const CONTRACT_ADDRESSES = {
  baseSepolia: {
    lottery: "0xbC5EBBe3E9B2f5624B93327005979C494aBCaE2D",
    vesting: "0xB86965556f85FdE426B98184304427aC964b1b16",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    pythIntegration: "0x71ab3BCf5df12bC46B932aAe7f6e6369393614c4",
  },
  base: {
    // TODO: Update when deployed to mainnet
    lottery: "0x0000000000000000000000000000000000000000",
    vesting: "0x0000000000000000000000000000000000000000",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    pythIntegration: "0x0000000000000000000000000000000000000000",
  },
} as const;

// Base Sepolia Chain ID
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;

// Ticket price in USDC (6 decimals) = 1 USDC
export const TICKET_PRICE = "1000000";

// Network configuration
export const NETWORK_CONFIG = {
  [BASE_SEPOLIA_CHAIN_ID]: {
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    contracts: CONTRACT_ADDRESSES.baseSepolia,
  },
  [BASE_MAINNET_CHAIN_ID]: {
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    contracts: CONTRACT_ADDRESSES.base,
  },
} as const;

// Default to Base Sepolia for development
export const DEFAULT_CHAIN_ID = BASE_SEPOLIA_CHAIN_ID;

