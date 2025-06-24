# 🚀 BaseClean Quick Start Guide

## What is BaseClean?

BaseClean is the **safest and simplest** way to burn worthless ERC20 tokens from your wallet. Unlike other token burners, BaseClean requires **ZERO approvals** - making it completely secure.

---

## ⚡ Quick Start (2 minutes)

### **Step 1: Launch App**
```bash
cd baseclean
npm install
npm run dev
```
Open: http://localhost:3000

### **Step 2: Connect Wallet**
- Click "Connect Wallet"
- Select MetaMask (or your preferred wallet)
- Switch to Base network

### **Step 3: Burn Tokens**
1. App automatically scans your wallet for tokens
2. Select worthless tokens you want to burn
3. Click "Burn Selected"
4. Sign each simple transfer transaction
5. Done! Tokens are permanently burned

---

## 🔒 **Why BaseClean is Safer**

### **Traditional Token Burners:**
❌ Require approving contracts  
❌ Permanent approval = permanent risk  
❌ Complex multi-step process  
❌ Trust required in smart contracts  

### **BaseClean Direct Transfer:**
✅ **Zero approvals needed**  
✅ **Zero permanent permissions**  
✅ **Simple transfer transactions**  
✅ **No trust required**  

---

## 🎯 **Perfect For**

- 🗑️ **Airdrop tokens** you don't want
- 🎭 **Meme coins** that went to zero
- 🧪 **Test tokens** cluttering your wallet
- 🚫 **Scam tokens** you want to remove
- 🧹 **General wallet cleanup**

---

## 📱 **How It Works**

1. **Token Discovery:** App scans your wallet using Covalent API
2. **Token Selection:** Choose which tokens to burn
3. **Direct Transfer:** Each token is transferred directly to burn address
4. **No Contracts:** No approvals, no batch contracts, just simple transfers
5. **Immediate Results:** Tokens disappear from your wallet instantly

**Burn Address:** `0x000000000000000000000000000000000000dEaD`

---

## 🌐 **Supported Networks**

- ✅ **Base Mainnet** (Production)
- ✅ **Base Sepolia** (Testing)

---

## 🔧 **Technical Details**

### **What Happens When You Burn:**
```typescript
// For each selected token, BaseClean calls:
await token.transfer(
  "0x000000000000000000000000000000000000dEaD", 
  yourBalance
);
```

That's it! No approvals, no contracts, just simple transfers.

### **Transaction Count:**
- **1 token = 1 transaction**
- **10 tokens = 10 transactions** 
- **Zero approval transactions ever**

---

## ❓ **FAQ**

### **Q: Why don't I need approvals?**
A: Because you're directly calling `transfer()` on each token. You own the tokens, so you can transfer them without approving any contract.

### **Q: Is this really safer than other burners?**
A: Yes! Other burners require you to approve contracts, which creates permanent security risks. BaseClean never asks for approvals.

### **Q: What if a transaction fails?**
A: Each token burns independently. If one fails, the others still burn successfully.

### **Q: Can I get my tokens back?**
A: No, burning is permanent. Only burn tokens you're sure you don't want.

---

## 🆘 **Need Help?**

- 📖 **Full Testing Guide:** See `TESTING_GUIDE.md`
- 🔥 **How It Works:** See `DIRECT_TRANSFER_EXPLANATION.md`
- 🐛 **Issues:** Check the troubleshooting section in the testing guide

---

## 🎉 **Ready to Clean Your Wallet?**

Start the app and begin burning those worthless tokens safely! 

**Remember: BaseClean is the only token burner that requires zero approvals.** 🔒 