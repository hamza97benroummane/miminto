// src/hooks/useTokenMetadata.ts
import { useState, useEffect } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID, DataV2, Metadata } from '@metaplex-foundation/mpl-token-metadata';
import axios from 'axios';

export interface TokenMetadata {
  name: string;
  symbol: string;
  image: string;
}

export function useTokenMetadata(
  connection: Connection,
  mint: string | null
) {
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error,   setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!mint) return setMetadata(null);
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) find the PDA for metadata account
        const mintPk = new PublicKey(mint);
        const [metaPda] = await PublicKey.findProgramAddress(
          [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mintPk.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        );

        // 2) fetch and deserialize on-chain DataV2
        const acctInfo = await connection.getAccountInfo(metaPda);
        if (!acctInfo) throw new Error('No metadata account');
        const meta = Metadata.deserialize(acctInfo.data)[0] as Metadata;
        const data = meta.data as DataV2;

        // 3) GET the JSON from the URI
        const { data: json } = await axios.get<{ name:string, symbol:string, image:string }>(data.uri);

        setMetadata({
          name:   json.name,
          symbol: json.symbol,
          image:  json.image,
        });
      } catch (err:unknown) {
        if (err instanceof Error) {
            setError(err.message);
          } else {
            setError(String(err));
          }
        } finally {
          setLoading(false);
      }
    })();
  }, [connection, mint]);

  return { metadata, loading, error };

}
