# BaseClean

BaseClean is a web application for scanning and burning unwanted or spam ERC-20 tokens from Base blockchain wallets.

**🚀 Visit [baseclean.io](https://baseclean.io) to use the application**

## Overview

BaseClean helps users identify and burn unwanted spam tokens that often clutter wallets on the Base blockchain. The application provides an intuitive interface to:

- Scan wallet for tokens
- Automatically identify potential spam tokens
- Filter tokens by various criteria
- Safely burn unwanted tokens

## Key Features

- **Token Scanning**: Automatically scans wallets for all ERC-20 tokens
- **Spam Detection**: Uses multiple heuristics to identify potential spam tokens
- **Value Filtering**: Filter tokens by their USD value
- **Bulk Actions**: Select and burn multiple tokens at once
- **Safety Checks**: Prevents accidental burning of valuable tokens

## Using BaseClean

1. Visit [baseclean.io](https://baseclean.io)
2. Connect your wallet using the Connect button
3. Browse your tokens and identify unwanted ones
4. Select tokens to burn and confirm the transaction
5. Enjoy a cleaner wallet!

## Contributing

Interested in contributing to BaseClean? Follow these steps to set up the project locally:

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/theWinterDojer/BaseClean.git
cd baseclean
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your API keys.

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

The project follows a well-organized directory structure:

```
baseclean/
├── public/            # Static assets
├── src/
│   ├── components/    # Shared UI components
│   ├── config/        # Configuration files and constants
│   ├── constants/     # Application-wide constants
│   ├── contexts/      # React context providers
│   ├── features/      # Feature-based organization
│   │   └── token-scanning/
│   │       ├── components/  # Feature-specific components
│   │       ├── hooks/       # Feature-specific hooks
│   │       └── utils/       # Feature-specific utilities
│   ├── hooks/         # Shared custom hooks
│   ├── layout/        # Layout components
│   ├── lib/           # Core libraries and utilities
│   ├── pages/         # Next.js pages
│   ├── styles/        # Global styles
│   ├── tests/         # Test files
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Shared utility functions
```

## Development Guidelines

### Adding New Features

1. Create a new directory under `src/features/` for your feature
2. Organize components, hooks, and utilities within the feature directory
3. Export the main component from the feature directory

### Testing

Run tests with:
```bash
npm test
# or
yarn test
```

## Tech Stack

- **Frontend**: React, Next.js, TypeScript
- **Styling**: TailwindCSS
- **Blockchain Integration**: Wagmi, RainbowKit
- **API**: Covalent API for token data

## Deployment

The application is deployed to production using Vercel. For contributors wanting to deploy their own instance:

```bash
npm run build
npm run start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- [Covalent API](https://www.covalenthq.com/) for token data
- [RainbowKit](https://www.rainbowkit.com/) for wallet connection
- [Wagmi](https://wagmi.sh/) for blockchain interactions
- [TailwindCSS](https://tailwindcss.com/) for styling
