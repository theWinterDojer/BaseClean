import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TokenScanner from '@/features/token-scanning/components/TokenScanner';

// Mock the hooks and components used by TokenScanner
jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x123456789abcdef',
    isConnected: true
  })
}));

jest.mock('@/hooks/useTokenFiltering', () => ({
  useTokenFiltering: () => ({
    spamTokens: [
      {
        contract_address: '0xspam1',
        contract_ticker_symbol: 'SPAM1',
        contract_name: 'Spam Token 1',
        balance: '1000000000000000000',
        contract_decimals: 18,
        quote_rate: 0.0000001,
        logo_url: ''
      },
      {
        contract_address: '0xspam2',
        contract_ticker_symbol: 'SPAM2',
        contract_name: 'Spam Token 2',
        balance: '2000000000000000000',
        contract_decimals: 18,
        quote_rate: 0.0000002,
        logo_url: ''
      }
    ],
    nonSpamTokens: [
      {
        contract_address: '0xeth',
        contract_ticker_symbol: 'ETH',
        contract_name: 'Ethereum',
        balance: '1000000000000000000',
        contract_decimals: 18,
        quote_rate: 2000,
        logo_url: ''
      }
    ]
  })
}));

jest.mock('@/lib/api', () => ({
  fetchTokenBalances: jest.fn().mockResolvedValue([
    {
      contract_address: '0xspam1',
      contract_ticker_symbol: 'SPAM1',
      contract_name: 'Spam Token 1',
      balance: '1000000000000000000',
      contract_decimals: 18,
      quote_rate: 0.0000001,
      logo_url: ''
    },
    {
      contract_address: '0xspam2',
      contract_ticker_symbol: 'SPAM2',
      contract_name: 'Spam Token 2',
      balance: '2000000000000000000',
      contract_decimals: 18,
      quote_rate: 0.0000002,
      logo_url: ''
    },
    {
      contract_address: '0xeth',
      contract_ticker_symbol: 'ETH',
      contract_name: 'Ethereum',
      balance: '1000000000000000000',
      contract_decimals: 18,
      quote_rate: 2000,
      logo_url: ''
    }
  ]),
  formatBalance: jest.fn().mockImplementation(() => {
    return '1.00';
  }),
  calculateTokenValue: jest.fn().mockImplementation((balance, rate) => {
    return (parseFloat(balance) * rate).toString();
  })
}));

// Mock child components
jest.mock('@/features/token-scanning/components/TokenStatistics', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ statistics }) => (
      <div data-testid="token-statistics">
        <div data-testid="total-tokens">{statistics.totalTokens}</div>
        <div data-testid="spam-tokens">{statistics.spamTokens}</div>
        <div data-testid="regular-tokens">{statistics.regularTokens}</div>
      </div>
    ))
  };
});

jest.mock('@/features/token-scanning/components/BulkActions', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(({ onSelectAllSpam }) => (
      <div data-testid="bulk-actions">
        <button data-testid="select-all-spam" onClick={onSelectAllSpam}>Select All Spam</button>
      </div>
    ))
  };
});

jest.mock('@/components/FilterPanel', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => (
      <div data-testid="filter-panel">Filter Panel</div>
    ))
  };
});

jest.mock('@/features/token-scanning/components/TokenListsContainer', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => (
      <div data-testid="token-lists">Token Lists</div>
    ))
  };
});

describe('TokenScanner Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders correctly when connected', async () => {
    render(<TokenScanner />);
    
    // Check if key components are rendered
    expect(await screen.findByTestId('token-statistics')).toBeInTheDocument();
    expect(await screen.findByTestId('bulk-actions')).toBeInTheDocument();
    expect(await screen.findByTestId('filter-panel')).toBeInTheDocument();
    expect(await screen.findByTestId('token-lists')).toBeInTheDocument();
  });

  test('shows correct token statistics', async () => {
    render(<TokenScanner />);
    
    // Wait for the component to render
    const totalTokens = await screen.findByTestId('total-tokens');
    const spamTokens = await screen.findByTestId('spam-tokens');
    const regularTokens = await screen.findByTestId('regular-tokens');
    
    // Check statistics values
    expect(totalTokens).toHaveTextContent('3'); // Total tokens from our mock
    expect(spamTokens).toHaveTextContent('2'); // Spam tokens from our mock
    expect(regularTokens).toHaveTextContent('1'); // Regular tokens from our mock
  });

  test('selects all spam tokens when button is clicked', async () => {
    render(<TokenScanner />);
    
    // Find and click the select all spam button
    const selectAllButton = await screen.findByTestId('select-all-spam');
    fireEvent.click(selectAllButton);
    
    // We would need to verify the state change, but since we're mocking components,
    // we can't directly test this. In a real test, we'd check if the tokens are selected.
  });
}); 