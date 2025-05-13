import { useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';

export default function WalletListener() {
  const { connected } = useWallet();
  const prevConnected = useRef<boolean>(false);

  useEffect(() => {
    prevConnected.current = connected;
  }, [connected]);

  useEffect(() => {
    if (connected && !prevConnected.current) {
      toast.success('Phantom wallet connected');
    } else if (!connected && prevConnected.current) {
      toast.info('Phantom wallet disconnected');
    }
    prevConnected.current = connected;
  }, [connected]);

  return null;
}
