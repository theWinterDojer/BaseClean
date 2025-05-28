import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Optimize for deployment cost vs runtime cost balance
      },
      // Security: Enable all compiler warnings
      evmVersion: "paris",
    },
  },
  
  networks: {
    // Base Mainnet
    base: {
      url: "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8453,
      gasPrice: 1000000000, // 1 gwei
    },
    
    // Base Goerli Testnet
    "base-goerli": {
      url: "https://goerli.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84531,
      gasPrice: 1000000000, // 1 gwei
    },
    
    // Hardhat local network
    hardhat: {
      chainId: 31337,
    },
  },
  
  // Contract verification
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
      "base-goerli": process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "base-goerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }
      }
    ]
  },
  
  // Gas reporting
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
    excludeContracts: ["contracts/test/"],
  },
  
  // Contract size checking
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["BatchBurner"],
  },
  
  // Security: Source map and debugging info
  sourcify: {
    enabled: true,
  },
  
  // Test configuration
  mocha: {
    timeout: 40000,
  },
};

export default config; 