# 🚀 BatchBurner Mainnet Deployment Guide

This guide walks you through the secure deployment process for the BatchBurner contract on Base mainnet.

## ⚠️ CRITICAL SAFETY FIRST

**NEVER rush to mainnet!** Follow this exact process to avoid costly mistakes.

---

## 📋 PHASE 1: Pre-Deployment Setup

### 1.1 Create Deployment Wallet
```bash
# Use a SEPARATE wallet for deployment - NEVER your main wallet!
# Fund with only ~0.005-0.01 ETH for deployment
# Use hardware wallet for mainnet if possible
```

### 1.2 Environment Setup
Create `.env` file in contracts directory:
```bash
# Deployment wallet private key (dedicated wallet only!)
PRIVATE_KEY=your_deployment_wallet_private_key

# Etherscan API key for verification (works for Base - get from etherscan.io/apis)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: CoinMarketCap API for gas reporting
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

### 1.3 Verify Setup
```bash
# Navigate to contracts directory first
cd contracts

# Install dependencies
npm install

# Compile contract
npm run compile

# Check contract size
npm run size

# Run all tests
npm run test
```

---

## 🧪 PHASE 2: Base Sepolia Testnet Deployment

### 2.1 Get Testnet ETH
- Visit: https://www.alchemy.com/faucets/base-sepolia
- Get ~0.01 ETH for testing

### 2.2 Deploy to Testnet
```bash
# Deploy to Base Sepolia testnet
npm run deploy:testnet
```

### 2.3 Verify Testnet Contract
```bash
# Verify on testnet BaseScan
npm run verify:testnet
```

### 2.4 Record Testnet Address
```
Testnet Contract: [SAVE_ADDRESS_HERE]
Testnet Explorer: https://sepolia.basescan.org/address/[CONTRACT_ADDRESS]
```

---

## 🧪 PHASE 3: Testnet Testing

### 3.1 Basic Function Tests
- [ ] Check `isOperational()` returns true
- [ ] Verify `MAX_BATCH_SIZE()` is 100
- [ ] Confirm `BURN_ADDRESS` is correct
- [ ] Test emergency pause/unpause (owner only)

### 3.2 Token Burning Tests
- [ ] Test single ERC20 burn (use testnet tokens)
- [ ] Test batch ERC20 burn (2-5 tokens)
- [ ] Test approval requirements
- [ ] Verify tokens go to burn address

### 3.3 Security Tests
- [ ] Try calling with non-owner (should fail)
- [ ] Test with zero amounts (should revert)
- [ ] Test with mismatched arrays (should revert)
- [ ] Test exceeding batch size (should revert)

---

## 🚀 PHASE 4: Mainnet Deployment

### 4.1 Final Pre-Deployment Checks
- [ ] All testnet tests passed
- [ ] Contract verified on testnet
- [ ] Deployment wallet funded (~0.005 ETH)
- [ ] Private key secured
- [ ] Etherscan API key ready

### 4.2 Deploy to Base Mainnet
```bash
# FINAL DEPLOYMENT - Double check everything!
npm run deploy:mainnet
```

### 4.3 Immediate Post-Deployment Actions
```bash
# 1. Verify contract immediately
npm run verify:mainnet

# 2. Save contract address safely
echo "Mainnet Contract: [CONTRACT_ADDRESS]" >> deployment_record.txt

# 3. Check on BaseScan
# Visit: https://basescan.org/address/[CONTRACT_ADDRESS]
```

---

## 🔍 PHASE 5: Post-Deployment Verification

### 5.1 Contract State Verification
```bash
# Check these on BaseScan or through contract calls:
# 1. isOperational() = true
# 2. owner() = your_deployment_address
# 3. MAX_BATCH_SIZE() = 100
# 4. BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD
# 5. Contract is verified (green checkmark)
```

### 5.2 Security Verification
- [ ] Contract source code matches on BaseScan
- [ ] All functions have correct visibility
- [ ] Owner address is correct
- [ ] No unexpected proxy patterns

### 5.3 Production Testing (SMALL AMOUNTS ONLY!)
- [ ] Test with worthless/test token first
- [ ] Verify burn transaction on BaseScan
- [ ] Check token appears in burn address
- [ ] Test batch functionality with 2-3 tokens

---

## 🛡️ PHASE 6: Production Integration

### 6.1 Update Frontend Config
```typescript
// Update baseclean/src/config/web3.ts
NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET=0x[CONTRACT_ADDRESS]
NEXT_PUBLIC_BATCH_BURNER_ADDRESS_TESTNET=0xc0a4D1A2c85B1Da29d1Ebc038941Cd8883357325
```

### 6.2 Frontend Testing
- [ ] Contract address loads correctly
- [ ] Approval flow works
- [ ] Batch burning UI functions
- [ ] Transaction status updates properly

### 6.3 Monitoring Setup
- [ ] Bookmark contract on BaseScan
- [ ] Set up transaction alerts (optional)
- [ ] Monitor for any unusual activity

---

## 📊 Expected Costs (Base Network)

| Operation | Gas Estimate | Cost @ 1 gwei |
|-----------|--------------|---------------|
| Contract Deployment | ~2,800,000 | ~0.0028 ETH |
| Single Token Burn | ~65,000 | ~0.000065 ETH |
| 10 Token Batch | ~380,000 | ~0.00038 ETH |
| 50 Token Batch | ~1,750,000 | ~0.00175 ETH |

---

## 🚨 Emergency Procedures

### If Something Goes Wrong:
1. **Pause contract immediately**: Call `emergencyPause()`
2. **Document the issue**: Screenshots, transaction hashes
3. **Do not deploy fixes**: Investigate thoroughly first
4. **Contact security experts**: If vulnerability suspected

### Emergency Contact Info:
- BaseScan Support: https://basescan.org/contactus
- OpenZeppelin Security: security@openzeppelin.org

---

## ✅ Final Deployment Checklist

**Before Mainnet Deployment:**
- [ ] Testnet deployment successful
- [ ] All tests passed
- [ ] Contract verified on testnet
- [ ] Deployment wallet secured
- [ ] Gas price acceptable
- [ ] Team ready to monitor

**After Mainnet Deployment:**
- [ ] Contract verified on BaseScan
- [ ] Initial state correct
- [ ] Small test transaction successful
- [ ] Frontend integration working
- [ ] Monitoring setup complete

---

## 📞 Support

If you encounter issues during deployment:
1. Check this guide first
2. Review deployment logs carefully
3. Verify all environment variables
4. Test on testnet if unsure

**Remember: It's better to be overcautious than sorry!**

---

**🎯 Ready to proceed? Start with Phase 1!** 