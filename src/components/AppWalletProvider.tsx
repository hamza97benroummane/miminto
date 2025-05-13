import React, { FC, useMemo, useCallback } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import {
    ConnectionProvider,
    WalletProvider,
    useLocalStorage,
  } from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { toast } from 'react-toastify';

import '@solana/wallet-adapter-react-ui/styles.css';

export const AppWalletProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [autoConnect] = useLocalStorage('autoConnect', true);

  const network = WalletAdapterNetwork.Mainnet;
  // public, Phantom-friendly RPC on Mainnet
  const endpoint = network === WalletAdapterNetwork.Mainnet
    ? 'https://solana-rpc.publicnode.com'
    : clusterApiUrl(network);

  // adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  // toast any wallet errors
  const onError = useCallback((error: Error) => {
    toast.error(error.message ? `${error.name}: ${error.message}` : error.name);
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={autoConnect}
        onError={onError}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
