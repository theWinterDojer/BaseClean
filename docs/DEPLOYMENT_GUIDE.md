# 🌐 BaseClean Deployment Guide

This guide covers deploying BaseClean as a hosted service at `baseclean.io`.

## 📋 Pre-Deployment Checklist

### 🔧 Required Configuration

1. **WalletConnect Domain Setup**
   - Access your project at [cloud.reown.com](https://cloud.reown.com)
   - Add `baseclean.io` (or your chosen domain) to allowed domains
   - Remove any localhost/development domains from production config

2. **Environment Variables**
   ```bash
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   NODE_ENV=production
   ```

3. **HTTPS Configuration**
   - Ensure HTTPS deployment (required for wallet connections)
   - Configure proper SSL certificates
   - Test wallet connections over HTTPS

4. **Security Headers**
   - CSP headers are already configured in `next.config.ts`
   - Verify security headers are properly applied

## 🧪 Pre-Deployment Testing

### Required Tests
- [ ] Test production build locally with production environment variables
- [ ] Verify WalletConnect connections work with production domain
- [ ] Test all wallet types (MetaMask, Coinbase Wallet, Rainbow, etc.)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS Safari, Chrome Android)
- [ ] Test spam detection filters with various token types
- [ ] Test burn transactions with small amounts first

### Performance Testing
- [ ] Run Lighthouse performance audits (target: 90+ all categories)
- [ ] Load testing with 100+ tokens/NFTs
- [ ] Network throttling tests

## 🚀 Deployment Steps

1. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

2. **Domain Configuration**
   - Point domain DNS to deployment server
   - Configure SSL/TLS certificates
   - Test HTTPS accessibility

3. **Post-Deployment Verification**
   - [ ] Verify all environment variables are loaded
   - [ ] Test wallet connections
   - [ ] Test token scanning functionality
   - [ ] Test burn transactions
   - [ ] Verify security headers

## 📊 Monitoring Setup

### Recommended Monitoring
- **Error Tracking**: Sentry or similar service
- **Analytics**: Google Analytics, Mixpanel
- **Uptime Monitoring**: UptimeRobot or similar
- **API Rate Limits**: Monitor Alchemy, WalletConnect usage

### Performance Monitoring
- **Build Performance**: Should remain ~4.0s
- **Bundle Size**: Monitor for unexpected increases
- **API Response Times**: Alchemy and external services

## 🔒 Security Considerations

- Never commit production environment variables
- Use secure environment variable management
- Monitor for suspicious transaction patterns
- Regularly update dependencies
- Keep deployment keys secure

## 🚨 Troubleshooting

### Common Issues
- **Wallet Connection Fails**: Check HTTPS and domain configuration
- **API Errors**: Verify environment variables and API key quotas
- **Build Failures**: Check Node.js version compatibility
- **Performance Issues**: Review bundle size and dependency updates

### Support
- Check deployment logs for errors
- Verify all environment variables are set correctly
- Ensure you're using the correct network configuration
- Test on testnet before mainnet deployment 