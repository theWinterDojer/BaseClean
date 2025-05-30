# 🚀 Mainnet Transition Checklist

**CRITICAL: Complete ALL items before mainnet deployment to ensure seamless transition**

---

## ⚠️ **IDENTIFIED RISKS & FIXES**

### **🔴 HIGH PRIORITY - Must Fix Before Mainnet**

#### **1. Missing Environment Variable Configuration**
**Issue:** `NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET` is empty
```typescript
// Current: Will cause contract calls to fail on mainnet
[SUPPORTED_CHAINS.BASE.id]: process.env.NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET || '',
```

**✅ Fix Required:**
```bash
# Add to baseclean/.env.local (create if doesn't exist)
NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET=0x[DEPLOYED_MAINNET_CONTRACT_ADDRESS]
NEXT_PUBLIC_BATCH_BURNER_ADDRESS_TESTNET=0xe7Be0b49536986612DB901C29199c927eE391108
```

#### **2. Fallback Contract Address Issue**
**Issue:** Empty address will break contract interactions on mainnet

**✅ Fix Required:** Add validation in `getBatchBurnerConfig`:
```typescript
// Add this validation to src/lib/batchBurner.ts
export function getBatchBurnerConfig(chainId: number) {
  const contractAddress = BATCH_BURNER_ADDRESSES[chainId as keyof typeof BATCH_BURNER_ADDRESSES];
  
  if (!contractAddress || contractAddress === '0x') {
    console.error(`No BatchBurner contract address configured for chain ${chainId}`);
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }
  
  return {
    address: contractAddress as `0x${string}`,
    abi: BATCH_BURNER_ABI,
  };
}
```

### **🟡 MEDIUM PRIORITY - Recommended Improvements**

#### **3. Network Detection & User Guidance**
**Enhancement:** Better UX when contract isn't available
```typescript
// Add to useBatchBurnerStatus hook
return {
  isOperational: isOperational ?? false,
  maxBatchSize: maxBatchSize ? Number(maxBatchSize) : 100,
  isLoading,
  error,
  isContractAvailable: !!config.address && config.address !== '0x',
  contractAddress: config.address,
  // Add these for better UX:
  networkName: chainId === 8453 ? 'Base Mainnet' : 'Base Sepolia',
  isTestnet: chainId !== 8453,
};
```

#### **4. Environment-Specific Configuration**
**Enhancement:** Add runtime environment detection
```typescript
// Add to src/config/web3.ts
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const DEFAULT_CHAIN = IS_PRODUCTION ? SUPPORTED_CHAINS.BASE : SUPPORTED_CHAINS.BASE_SEPOLIA;
```

---

## 📋 **PRE-MAINNET DEPLOYMENT CHECKLIST**

### **Phase 1: Environment Setup**
- [ ] Create `baseclean/.env.local` with proper variables
- [ ] Verify all API keys are production-ready
- [ ] Confirm Covalent API works for Base mainnet
- [ ] Test wallet connection to Base mainnet

### **Phase 2: Contract Deployment**
- [ ] Deploy BatchBurner to Base mainnet
- [ ] Verify contract on BaseScan
- [ ] Update `NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET`
- [ ] Test contract functions on BaseScan

### **Phase 3: Frontend Integration**
- [ ] Update environment variables
- [ ] Test network switching functionality
- [ ] Verify token balance fetching on mainnet
- [ ] Test approval & burning flow with test tokens

### **Phase 4: Production Testing**
- [ ] Deploy to staging/preview environment
- [ ] Test with mainnet-connected wallet
- [ ] Verify contract address loads correctly
- [ ] Test emergency scenarios (network switching)

---

## 🛠️ **IMMEDIATE FIXES NEEDED**

### **1. Add Environment File**
```bash
# Create baseclean/.env.local
cat > baseclean/.env.local << 'EOF'
# API Keys
NEXT_PUBLIC_COVALENT_API_KEY=cqt_rQWWpQRXJpbMqHb8vbf8ctR3RDBX
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=399eb6cfd79646eaae8648161ce51643

# Contract Addresses (UPDATE MAINNET ADDRESS AFTER DEPLOYMENT)
NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BATCH_BURNER_ADDRESS_TESTNET=0xe7Be0b49536986612DB901C29199c927eE391108

# Environment
NODE_ENV=development
EOF
```

### **2. Add Contract Validation**
- Update `getBatchBurnerConfig` with address validation
- Add error handling for missing contracts
- Improve user feedback when contract unavailable

### **3. Add Network Status Component**
Create a component to show current network and contract status:
```typescript
// src/components/NetworkStatus.tsx
export function NetworkStatus() {
  const chainId = useChainId();
  const { isContractAvailable, contractAddress, networkName } = useBatchBurnerStatus();
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isContractAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">{networkName}</span>
        {contractAddress && (
          <span className="text-xs text-gray-500">
            Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </span>
        )}
      </div>
    </div>
  );
}
```

---

## 🚨 **MAINNET DEPLOYMENT DAY**

### **Steps to Execute (IN ORDER):**

1. **Deploy contract to mainnet**
   ```bash
   cd contracts
   npm run deploy:mainnet
   ```

2. **Immediately update environment**
   ```bash
   # Update .env.local with deployed address
   NEXT_PUBLIC_BATCH_BURNER_ADDRESS_MAINNET=0x[DEPLOYED_ADDRESS]
   ```

3. **Rebuild and test**
   ```bash
   npm run build
   npm run start
   ```

4. **Verify everything works**
   - [ ] Contract address loads
   - [ ] Token balances display
   - [ ] Approval flow works
   - [ ] Batch burning functions

---

## ✅ **CURRENT STATUS: SAFE FOR MAINNET?**

**🔴 NO - Address critical issues first:**
1. Missing mainnet contract address configuration
2. No contract address validation
3. Missing environment file with proper variables

**🟢 After fixes applied:** YES - The network-aware architecture is solid and will handle mainnet transition smoothly.

---

## 📞 **Emergency Contacts & Resources**

- **BaseScan Mainnet:** https://basescan.org
- **BaseScan Testnet:** https://sepolia.basescan.org
- **Base RPC Status:** https://status.base.org
- **Covalent Docs:** https://www.covalenthq.com/docs/api/

**Remember: Test thoroughly on testnet first! 🧪** 