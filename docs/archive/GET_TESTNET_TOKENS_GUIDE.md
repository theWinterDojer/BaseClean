# 🧪 Getting Testnet Tokens for BatchBurner Testing

This guide helps you get both ETH for gas fees and ERC20 tokens to test your batch burning functionality on Base Sepolia.

---

## 🚰 **Step 1: Get Base Sepolia ETH (Gas Fees)**

### **Recommended Faucets:**

#### **1. Chainlink Faucet** ⭐ **(Best Option)**
- **URL:** https://faucets.chain.link/
- **Amount:** 0.5 ETH per request
- **Rate limit:** 24 hours
- **Steps:**
  1. Visit the faucet
  2. Select "Base Sepolia" 
  3. Connect your wallet
  4. Click "Send me ETH"

#### **2. QuickNode Faucet** 
- **URL:** https://faucet.quicknode.com/base/sepolia
- **Amount:** 0.05 ETH (0.1 ETH with tweet)
- **Rate limit:** 12 hours
- **Requirements:** 0.001 ETH on Ethereum mainnet
- **Steps:**
  1. Connect wallet
  2. Select Base Sepolia
  3. Tweet about the faucet for bonus
  4. Claim tokens

#### **3. Alchemy Faucet**
- **URL:** https://www.alchemy.com/faucets/base-sepolia
- **Amount:** 0.5 ETH per request
- **Requirements:** Free Alchemy account
- **Rate limit:** 24 hours

---

## 🪙 **Step 2: Get ERC20 Test Tokens to Burn**

### **Method 1: Use Popular Test Tokens** ⭐ **(Recommended)**

#### **LINK Token (Chainlink)**
- **Address:** `0xE4aB69C077896252FAFBD49EFD26B5D171A32410`
- **Source:** https://faucets.chain.link/
- **Amount:** 25 LINK per request
- **Rate limit:** 24 hours

#### **USDC Test Token**
- **Address:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e` 
- **Source:** Circle's testnet faucet
- **URL:** https://faucet.circle.com/

### **Method 2: Deploy Your Own Test Tokens**

Create simple ERC20 tokens for testing:

```solidity
// TestToken.sol
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**decimals()); // 1M tokens
    }
    
    // Faucet function for easy minting
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
```

**Deployment steps:**
1. Use Remix IDE: https://remix.ethereum.org
2. Connect to Base Sepolia via MetaMask
3. Deploy multiple tokens with different names
4. Mint tokens to your address

### **Method 3: Use Existing Testnet Token Contracts**

Common testnet tokens on Base Sepolia:

```typescript
// Add these to your testing
const TESTNET_TOKENS = [
  {
    name: "Test USDC",
    symbol: "USDC",
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    decimals: 6
  },
  {
    name: "Chainlink Token", 
    symbol: "LINK",
    address: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
    decimals: 18
  },
  {
    name: "Test DAI",
    symbol: "DAI", 
    address: "0x7683022d84F726a96c4C7E3C5c3Cffe3C4c2C0E8", // Example
    decimals: 18
  }
];
```

---

## 🔧 **Step 3: Quick Test Token Setup Script**

Create a script to quickly mint test tokens:

```typescript
// scripts/mintTestTokens.ts
import { ethers } from 'ethers';

const TEST_TOKEN_ABI = [
  "function faucet(uint256 amount) external",
  "function mint(address to, uint256 amount) external", 
  "function balanceOf(address) view returns (uint256)"
];

async function mintTestTokens() {
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  const testTokens = [
    "0x...", // Your deployed test token addresses
    "0x...",
    "0x..."
  ];
  
  for (const tokenAddress of testTokens) {
    const token = new ethers.Contract(tokenAddress, TEST_TOKEN_ABI, wallet);
    
    try {
      // Try faucet function first
      await token.faucet(ethers.parseEther("1000"));
      console.log(`Minted 1000 tokens from ${tokenAddress}`);
    } catch {
      try {
        // Try mint function as fallback
        await token.mint(wallet.address, ethers.parseEther("1000"));
        console.log(`Minted 1000 tokens from ${tokenAddress}`);
      } catch (error) {
        console.log(`Failed to mint from ${tokenAddress}:`, error);
      }
    }
  }
}
```

---

## 🧪 **Step 4: Testing Your BatchBurner**

### **Pre-Testing Checklist:**
- [ ] Have at least 0.1 ETH on Base Sepolia
- [ ] Have 3-5 different ERC20 tokens with balances
- [ ] Switch MetaMask to Base Sepolia network
- [ ] Confirm your app shows testnet tokens

### **Testing Scenarios:**

#### **1. Single Token Burn**
- Select 1 token with small balance
- Test approval flow
- Execute burn transaction
- Verify tokens sent to burn address

#### **2. Batch Token Burn**
- Select 3-5 tokens
- Test batch approval
- Execute batch burn
- Check gas usage vs individual burns

#### **3. Edge Cases**
- Try burning 0 amount (should fail)
- Try burning without approval (should fail)
- Test with max batch size
- Test network switching during process

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**❌ "Insufficient balance" error**
- Wait for faucet cooldown to expire
- Try multiple faucets
- Check you're on correct network

**❌ "Contract not found" error**
- Ensure you're on Base Sepolia (Chain ID: 84532)
- Check contract address in your config
- Verify contract is deployed

**❌ "Transaction failed" error**
- Increase gas limit
- Check token approval status
- Ensure sufficient ETH for gas

### **Verification Steps:**

1. **Check balances:** Use BaseScan Sepolia to verify tokens
   - URL: https://sepolia.basescan.org/address/[YOUR_ADDRESS]

2. **Verify burns:** Check burn address for received tokens
   - Burn Address: `0x000000000000000000000000000000000000dEaD`
   - URL: https://sepolia.basescan.org/address/0x000000000000000000000000000000000000dEaD

3. **Monitor transactions:** Track all txs on BaseScan
   - Check gas usage
   - Verify successful execution
   - Confirm token transfers

---

## 📞 **Quick Help**

**Need more tokens?**
- Use multiple faucets
- Deploy your own test tokens
- Ask in Base Discord: https://base.org/discord

**Testing not working?**
- Check network (should be Base Sepolia - Chain ID 84532)
- Verify contract address is set correctly
- Ensure sufficient gas (ETH) balance

**Ready for mainnet?**
- All tests passing ✅
- Contract verified ✅  
- Sufficient mainnet ETH for deployment ✅
- Environment variables configured ✅

**🎯 Happy testing! The more thorough your testnet testing, the smoother your mainnet launch will be.** 