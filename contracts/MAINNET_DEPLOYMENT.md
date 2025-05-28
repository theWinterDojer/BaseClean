# 🚀 MAINNET DEPLOYMENT - STEP BY STEP

## ⚠️ CRITICAL: Follow this EXACT process for safe mainnet deployment

### **STEP 1: Environment Setup**

1. **Create a dedicated deployment wallet** (NEVER use your main wallet!)
2. **Fund it with ~0.01 ETH** (enough for deployment + buffer)
3. **Get BaseScan API key** from https://basescan.org/apis

4. **Create `.env` file** in the contracts directory:
```bash
# Your deployment wallet private key (64 characters, no 0x prefix)
PRIVATE_KEY=your_deployment_wallet_private_key_here

# Your BaseScan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here
```

### **STEP 2: Pre-Deployment Tests**

Run these commands to ensure everything works:

```bash
# Navigate to contracts directory first
cd contracts

# Install dependencies (if not already done)
npm install

# Clean and compile
npm run compile

# Run tests
npm run test

# Check contract size (should be under 24KB)
npm run size
```

**✅ All tests must pass before proceeding!**

### **STEP 3: Testnet Deployment (MANDATORY)**

**Never skip testnet testing!**

```bash
# Deploy to Base Goerli testnet first
npm run deploy:testnet
```

**Save the testnet contract address and test it thoroughly:**
- Check functions work on BaseScan
- Test with small amounts
- Verify all security features

### **STEP 4: Mainnet Deployment**

**Only proceed if testnet testing was successful!**

```bash
# Deploy to Base mainnet
npm run deploy:mainnet
```

**Expected output:**
```
🚀 Starting BatchBurner deployment...
📝 Deploying with account: 0x...
💰 Account balance: 0.01 ETH
⛽ Estimated gas for deployment: ~2,800,000
✅ BatchBurner deployed to: 0x...
✅ All security checks passed!
🎉 Deployment completed successfully!
```

### **STEP 5: Immediate Verification**

```bash
# Verify contract on BaseScan (replace with your contract address)
npx hardhat verify --network base 0xYOUR_CONTRACT_ADDRESS
```

### **STEP 6: Security Verification**

Visit your contract on BaseScan and verify:
- ✅ Contract is verified (green checkmark)
- ✅ `isOperational()` returns `true`
- ✅ `MAX_BATCH_SIZE()` returns `100`
- ✅ `BURN_ADDRESS` is `0x000000000000000000000000000000000000dEaD`
- ✅ `owner()` is your deployment address

### **STEP 7: Production Testing**

**Test with SMALL amounts first:**
1. Get a worthless test token
2. Approve the contract
3. Burn 1 token to verify it works
4. Check the token appears in the burn address

### **STEP 8: Frontend Integration**

Update your frontend config with the new contract address:
```typescript
// In baseclean/src/config/web3.ts
NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET=0xYOUR_CONTRACT_ADDRESS
```

---

## 🚨 Emergency Procedures

**If something goes wrong:**
1. **Pause the contract immediately:** Call `emergencyPause()`
2. **Document everything:** Screenshots, transaction hashes
3. **Do not panic deploy fixes**
4. **Investigate thoroughly**

---

## 📊 Expected Costs

| Operation | Gas | Cost @ 1 gwei |
|-----------|-----|---------------|
| Deployment | ~2,800,000 | ~0.0028 ETH |
| Verification | Free | Free |
| Single burn | ~65,000 | ~0.000065 ETH |

---

## ✅ Final Checklist

**Before mainnet deployment:**
- [ ] Testnet deployment successful
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Deployment wallet funded
- [ ] BaseScan API key ready

**After mainnet deployment:**
- [ ] Contract verified on BaseScan
- [ ] Security checks passed
- [ ] Small test transaction successful
- [ ] Frontend updated
- [ ] Contract address saved securely

---

**🎯 Ready? Start with Step 1!** 