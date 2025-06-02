import { NextApiRequest, NextApiResponse } from 'next';

/**
 * ScamSniffer API Route
 * 
 * Server-side endpoint to fetch ScamSniffer blacklist data, bypassing CORS restrictions
 * that occur when fetching GitHub raw URLs directly from the browser.
 */

// Cache for server-side data
let serverCache: { addresses: string[]; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const SCAM_SNIFFER_ENDPOINTS = [
  'https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/address.txt',
  'https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/addresses.txt',
  'https://api.github.com/repos/scamsniffer/scam-database/contents/blacklist'
];

async function fetchScamSnifferData(): Promise<string[]> {
  // Try direct text files first
  for (const endpoint of SCAM_SNIFFER_ENDPOINTS.slice(0, 2)) {
    try {
      console.log(`Trying ScamSniffer endpoint: ${endpoint}`);
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'BaseClean-ScamSniffer-Integration'
        }
      });
      
      if (response.ok) {
        const text = await response.text();
        const addresses = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length === 42 && line.startsWith('0x'))
          .map(addr => addr.toLowerCase());
        
        if (addresses.length > 0) {
          console.log(`ScamSniffer: Found ${addresses.length} addresses from ${endpoint}`);
          return addresses;
        }
      }
    } catch (error) {
      console.log(`Failed to fetch from ${endpoint}:`, error);
    }
  }

  // Try GitHub API as fallback
  try {
    console.log('Trying GitHub API fallback...');
    const response = await fetch(SCAM_SNIFFER_ENDPOINTS[2], {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BaseClean-ScamSniffer-Integration'
      }
    });

    if (response.ok) {
      const files: Array<{ name: string; download_url: string }> = await response.json();
      console.log('Available files:', files.map((f) => f.name));
      
      // Find any address-related file
      for (const file of files) {
        if ((file.name.includes('address') || file.name.includes('blacklist')) && 
            (file.name.endsWith('.txt') || file.name.endsWith('.json'))) {
          try {
            const fileResponse = await fetch(file.download_url, {
              headers: {
                'User-Agent': 'BaseClean-ScamSniffer-Integration'
              }
            });
            
            if (fileResponse.ok) {
              const content = await fileResponse.text();
              
              let addresses: string[] = [];
              
              if (file.name.endsWith('.json')) {
                const data = JSON.parse(content);
                if (Array.isArray(data)) {
                  addresses = data.filter(addr => typeof addr === 'string');
                } else if (data.addresses) {
                  addresses = Array.isArray(data.addresses) ? data.addresses : [];
                } else {
                  addresses = Object.values(data).flat().filter((addr): addr is string => typeof addr === 'string');
                }
              } else {
                addresses = content
                  .split('\n')
                  .map(line => line.trim())
                  .filter(line => line.length > 0);
              }
              
              const validAddresses = addresses
                .filter(addr => typeof addr === 'string' && addr.length === 42 && addr.startsWith('0x'))
                .map(addr => addr.toLowerCase());
              
              if (validAddresses.length > 0) {
                console.log(`ScamSniffer: Found ${validAddresses.length} addresses from ${file.name}`);
                return validAddresses;
              }
            }
          } catch (fileError) {
            console.log(`Failed to process file ${file.name}:`, fileError);
          }
        }
      }
    }
  } catch (apiError) {
    console.log('GitHub API fallback failed:', apiError);
  }

  console.log('All ScamSniffer endpoints failed, returning empty array');
  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (serverCache && (now - serverCache.timestamp) < CACHE_DURATION) {
      console.log(`ScamSniffer: Serving cached data (${serverCache.addresses.length} addresses)`);
      return res.status(200).json({
        addresses: serverCache.addresses,
        cached: true,
        timestamp: serverCache.timestamp,
        count: serverCache.addresses.length
      });
    }

    // Fetch fresh data
    console.log('ScamSniffer: Fetching fresh data...');
    const addresses = await fetchScamSnifferData();
    
    // Update cache
    serverCache = {
      addresses,
      timestamp: now
    };

    console.log(`ScamSniffer: Serving fresh data (${addresses.length} addresses)`);
    return res.status(200).json({
      addresses,
      cached: false,
      timestamp: now,
      count: addresses.length
    });

  } catch (error) {
    console.error('ScamSniffer API error:', error);
    
    // Return cached data if available, even if stale
    if (serverCache) {
      console.log('ScamSniffer: Serving stale cached data due to error');
      return res.status(200).json({
        addresses: serverCache.addresses,
        cached: true,
        stale: true,
        timestamp: serverCache.timestamp,
        count: serverCache.addresses.length,
        error: 'Fresh data unavailable, serving cached data'
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch ScamSniffer data',
      addresses: [],
      count: 0
    });
  }
} 