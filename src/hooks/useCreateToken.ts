

// src/hooks/useCreateToken.ts
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  DataV2,
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';
import axios from 'axios';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY!;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY!;
const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT ?? 'https://api.mainnet-beta.solana.com';
// const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT ?? 'https://api.devnet.solana.com';


// read your platform wallet from VITE_ env
const rawPlatformWallet = import.meta.env.VITE_WALLET_FEE;
if (!rawPlatformWallet) {
  throw new Error('VITE_WALLET_FEE is not defined');
}
const PLATFORM_WALLET = new PublicKey(rawPlatformWallet);

const FEE_LAMPORTS = 0.1 * LAMPORTS_PER_SOL;  // core mint fee

// extra 0.1 SOL per revoke option
const REVOKE_FEE_LAMPORTS = 0.1 * LAMPORTS_PER_SOL;

export function useCreateToken() {
  const { publicKey, signTransaction } = useWallet();
  
  // pull in sendTransaction which will sign & send in one step
  // const { publicKey, sendTransaction } = useWallet();

  const connection = new Connection(RPC_ENDPOINT, 'confirmed');

  // async function prepTx(tx: Transaction): Promise<Transaction> {
  //   if (!publicKey) throw new Error('Wallet not connected');
  //   tx.feePayer = publicKey;
  //   const { blockhash } = await connection.getLatestBlockhash();
  //   tx.recentBlockhash = blockhash;
  //   return tx;
  // }

  async function uploadToPinata(file: File): Promise<string> {
    console.log('📤 Uploading logo to Pinata…');
    const form = new FormData();
    form.append('file', file);
    const { data } = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      form,
      {
        maxBodyLength: Infinity,
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );
    const uri = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    console.log('✅ Logo uploaded:', uri);
    return uri;
  }

  async function uploadMetadata(
    name: string,
    symbol: string,
    description: string,
    imageUri: string
  ): Promise<string> {
    console.log('📤 Uploading metadata JSON to Pinata…');
    const { data } = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        name,
        symbol,
        description,
        image: imageUri,
        properties: { files: [{ uri: imageUri, type: 'image/png' }] },
      },
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );
    const uri = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    console.log('✅ Metadata uploaded:', uri);
    return uri;
  }

  async function createToken(params: {
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
    description: string;
    image: File;
    revokeMint?: boolean;
    revokeFreeze?: boolean;
    revokeUpdate?: boolean;
  }) {
    if (!publicKey) throw new Error('Wallet not connected');

    console.log('🚀 Starting token creation…');
    const imageUri = await uploadToPinata(params.image);
    const metadataUri = await uploadMetadata(
      params.name,
      params.symbol,
      params.description,
      imageUri
    );

    console.log('🔑 Generating mint keypair…');
    const mintKeypair = Keypair.generate();
    const rentLamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    console.log('📌 Calculating Associated Token Account…');
    const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);
    console.log('📌 Associated Token Address:', ata.toBase58());

    console.log('📝 Preparing metadata PDA…');
    const [metadataPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    const dataV2: DataV2 = {
      name: params.name,
      symbol: params.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };
    console.log('🧾 Metadata structure set:', dataV2);

    console.log('🧱 Building full transaction…');

// 2) inside createToken(…), *instead* of `new Transaction().add(...)`, do:
const listOfIxs: TransactionInstruction[] = [];

// a) Create account
listOfIxs.push(
  SystemProgram.createAccount({
    fromPubkey: publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: MINT_SIZE,
    lamports: rentLamports,
    programId: TOKEN_PROGRAM_ID,
  })
);

// b) Initialize mint
listOfIxs.push(
  createInitializeMintInstruction(
    mintKeypair.publicKey,
    params.decimals,
    publicKey,
    publicKey,            // always start with yourself as freezeAuthority
    TOKEN_PROGRAM_ID
  )
);

// c) ATA, mintTo, metadata…
listOfIxs.push(
  createAssociatedTokenAccountInstruction(publicKey, ata, publicKey, mintKeypair.publicKey),
  createMintToInstruction(
    mintKeypair.publicKey,
    ata,
    publicKey,
    BigInt(params.supply) * BigInt(10 ** params.decimals)
  ),
  createCreateMetadataAccountV3Instruction(
    { metadata: metadataPda, mint: mintKeypair.publicKey, mintAuthority: publicKey, payer: publicKey, updateAuthority: publicKey },
    { createMetadataAccountArgsV3: { data: dataV2, isMutable: !params.revokeUpdate, collectionDetails: null } }
  )
);

// d) Single fee transfer
const totalFee =
  FEE_LAMPORTS +
  (params.revokeUpdate ? REVOKE_FEE_LAMPORTS : 0) +
  (params.revokeFreeze ? REVOKE_FEE_LAMPORTS : 0) +
  (params.revokeMint   ? REVOKE_FEE_LAMPORTS : 0);
listOfIxs.push(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey:   PLATFORM_WALLET,
    lamports:   totalFee,
  })
);

// e) Inline revokes
if (params.revokeMint) {
  listOfIxs.push(
    createSetAuthorityInstruction(
      mintKeypair.publicKey,
      publicKey,
      AuthorityType.MintTokens,
      null
    )
  );
}
if (params.revokeFreeze) {
  listOfIxs.push(
    createSetAuthorityInstruction(
      mintKeypair.publicKey,
      publicKey,
      AuthorityType.FreezeAccount,
      null
    )
  );
}




// 3) prepend compute budget Ixs
const priorityFee    = 1_500_000;   // microLamports
const computeUnitLim = 1_350_000;   // units
listOfIxs.unshift(
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }),
  ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitLim })
);

// 4) build the single Transaction
const { blockhash } = await connection.getLatestBlockhash('finalized');
const tx = new Transaction({
  recentBlockhash: blockhash,
  feePayer:        publicKey,
}).add(...listOfIxs);

// 5) sign & send with both keypairs
await tx.partialSign(mintKeypair);          // your token‐mint keypair signs first
const signed = await signTransaction(tx);    // Phantom pops once for wallet
const txid   = await connection.sendRawTransaction(signed.serialize(), {
  skipPreflight: true,
});
await connection.confirmTransaction(txid, 'finalized');

console.log('🆗 All done at:', `https://solscan.io/tx/${txid}`);

    return { mintAddress: mintKeypair.publicKey.toBase58(), metadataUri };
  }

  return { createToken };
}




//////////////////////////////////////////////////////////////////////////////////////////


// // src/hooks/useCreateToken.ts
// import { useWallet } from '@solana/wallet-adapter-react';
// import {
//   Connection,
//   Keypair,
//   SystemProgram,
//   Transaction,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from '@solana/web3.js';
// import {
//   TOKEN_PROGRAM_ID,
//   MINT_SIZE,
//   createInitializeMintInstruction,
//   getAssociatedTokenAddress,
//   createAssociatedTokenAccountInstruction,
//   createMintToInstruction,
//   createSetAuthorityInstruction,
//   AuthorityType,
//   getMint,
// } from '@solana/spl-token';
// import {
//   PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
//   DataV2,
//   createCreateMetadataAccountV3Instruction,
// } from '@metaplex-foundation/mpl-token-metadata';
// import axios from 'axios';

// const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY!;
// const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY!;
// const RPC_ENDPOINT = import.meta.env.VITE_RPC_ENDPOINT ?? 'https://api.mainnet-beta.solana.com';
// // const PLATFORM_WALLET = new PublicKey('DYNoEom1wAMaS1yvz7qFX8oy7xgtK5aCAEm9eDkHgHRt');

// // read your platform wallet from VITE_ env
// const rawPlatformWallet = import.meta.env.VITE_WALLET_FEE;
// if (!rawPlatformWallet) {
//   throw new Error('VITE_WALLET_FEE is not defined');
// }
// const PLATFORM_WALLET = new PublicKey(rawPlatformWallet);

// // const FEE_LAMPORTS = 0.001 * LAMPORTS_PER_SOL; // 0.05 SOL fee

// const FEE_LAMPORTS = 0.001 * LAMPORTS_PER_SOL;  // core mint fee
// // extra 0.1 SOL per revoke option
// const REVOKE_FEE_LAMPORTS = 0.1 * LAMPORTS_PER_SOL;

// export function useCreateToken() {
//   const { publicKey, signTransaction } = useWallet();
//   const connection = new Connection(RPC_ENDPOINT, 'confirmed');

//   async function prepTx(tx: Transaction): Promise<Transaction> {
//     if (!publicKey) throw new Error('Wallet not connected');
//     tx.feePayer = publicKey;
//     const { blockhash } = await connection.getLatestBlockhash();
//     tx.recentBlockhash = blockhash;
//     return tx;
//   }

//   async function uploadToPinata(file: File): Promise<string> {
//     console.log('📤 Uploading logo to Pinata…');
//     const form = new FormData();
//     form.append('file', file);
//     const { data } = await axios.post(
//       'https://api.pinata.cloud/pinning/pinFileToIPFS',
//       form,
//       {
//         maxBodyLength: Infinity,
//         headers: {
//           pinata_api_key: PINATA_API_KEY,
//           pinata_secret_api_key: PINATA_SECRET_API_KEY,
//         },
//       }
//     );
//     const uri = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
//     console.log('✅ Logo uploaded:', uri);
//     return uri;
//   }

//   async function uploadMetadata(
//     name: string,
//     symbol: string,
//     description: string,
//     imageUri: string
//   ): Promise<string> {
//     console.log('📤 Uploading metadata JSON to Pinata…');
//     const { data } = await axios.post(
//       'https://api.pinata.cloud/pinning/pinJSONToIPFS',
//       {
//         name,
//         symbol,
//         description,
//         image: imageUri,
//         properties: { files: [{ uri: imageUri, type: 'image/png' }] },
//       },
//       {
//         headers: {
//           pinata_api_key: PINATA_API_KEY,
//           pinata_secret_api_key: PINATA_SECRET_API_KEY,
//         },
//       }
//     );
//     const uri = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
//     console.log('✅ Metadata uploaded:', uri);
//     return uri;
//   }

//   async function createToken(params: {
//     name: string;
//     symbol: string;
//     decimals: number;
//     supply: number;
//     description: string;
//     image: File;
//     revokeMint?: boolean;
//     revokeFreeze?: boolean;
//     revokeUpdate?: boolean;
//   }) {
//     if (!publicKey) throw new Error('Wallet not connected');

//     console.log('🚀 Starting token creation…');
//     const imageUri = await uploadToPinata(params.image);
//     const metadataUri = await uploadMetadata(
//       params.name,
//       params.symbol,
//       params.description,
//       imageUri
//     );

//     console.log('🔑 Generating mint keypair…');
//     const mintKeypair = Keypair.generate();
//     const rentLamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

//     console.log('📌 Calculating Associated Token Account…');
//     const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, publicKey);
//     console.log('📌 Associated Token Address:', ata.toBase58());

//     console.log('📝 Preparing metadata PDA…');
//     const [metadataPda] = await PublicKey.findProgramAddress(
//       [
//         Buffer.from('metadata'),
//         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//         mintKeypair.publicKey.toBuffer(),
//       ],
//       TOKEN_METADATA_PROGRAM_ID
//     );
//     const dataV2: DataV2 = {
//       name: params.name,
//       symbol: params.symbol,
//       uri: metadataUri,
//       sellerFeeBasisPoints: 0,
//       creators: null,
//       collection: null,
//       uses: null,
//     };
//     console.log('🧾 Metadata structure set:', dataV2);

//     console.log('🧱 Building full transaction…');
//     let tx: Transaction;
//     try {
//       tx = new Transaction()
//         .add(
//           SystemProgram.createAccount({
//             fromPubkey: publicKey,
//             newAccountPubkey: mintKeypair.publicKey,
//             space: MINT_SIZE,
//             lamports: rentLamports,
//             programId: TOKEN_PROGRAM_ID,
//           })
//         )
//         .add(
//           createInitializeMintInstruction(
//             mintKeypair.publicKey,
//             params.decimals,
//             publicKey,
//             params.revokeFreeze ? null : publicKey,
//             TOKEN_PROGRAM_ID
//           )
//         )
//         .add(
//           createAssociatedTokenAccountInstruction(
//             publicKey,
//             ata,
//             publicKey,
//             mintKeypair.publicKey
//           )
//         )
//         .add(
//           createMintToInstruction(
//             mintKeypair.publicKey,
//             ata,
//             publicKey,
//             BigInt(params.supply) * BigInt(10 ** params.decimals)
//           )
//         )
//         .add(
//           createCreateMetadataAccountV3Instruction(
//             {
//               metadata: metadataPda,
//               mint: mintKeypair.publicKey,
//               mintAuthority: publicKey,
//               payer: publicKey,
//               updateAuthority: publicKey,
//             },
//             {
//               createMetadataAccountArgsV3: {
//                 data: dataV2,
//                 isMutable: true,
//                 collectionDetails: null,
//               },
//             }
//           )
//         )


//         // .add(
//         //   SystemProgram.transfer({
//         //     fromPubkey: publicKey,
//         //     toPubkey: PLATFORM_WALLET,
//         //     lamports: FEE_LAMPORTS,
//         //   })
//         // );

//         //  // if user asked to revoke metadata updates
//         //  if (params.revokeUpdate) {
//         //    tx.add(
//         //      SystemProgram.transfer({
//         //        fromPubkey: publicKey,
//         //        toPubkey:   PLATFORM_WALLET,
//         //        lamports:   REVOKE_FEE_LAMPORTS,
//         //      })
//         //    );
//         //  }
        
//         //  // if user asked to revoke freeze authority
//         //  if (params.revokeFreeze) {
//         //    tx.add(
//         //      SystemProgram.transfer({
//         //        fromPubkey: publicKey,
//         //        toPubkey:   PLATFORM_WALLET,
//         //        lamports:   REVOKE_FEE_LAMPORTS,
//         //      })
//         //    );
//         //  }
        
//         //  // if user asked to revoke mint authority
//         //  if (params.revokeMint) {
//         //    tx.add(
//         //      SystemProgram.transfer({
//         //        fromPubkey: publicKey,
//         //        toPubkey:   PLATFORM_WALLET,
//         //        lamports:   REVOKE_FEE_LAMPORTS,
//         //      })
//         //    );
//         //  }


//         const numRevokes =
//         (params.revokeMint   ? 1 : 0) +
//         (params.revokeFreeze ? 1 : 0) +
//         (params.revokeUpdate ? 1 : 0);

//       const totalFee = FEE_LAMPORTS + numRevokes * REVOKE_FEE_LAMPORTS;

//       tx.add(
//         SystemProgram.transfer({
//           fromPubkey: publicKey!,
//           toPubkey: PLATFORM_WALLET,
//           lamports: totalFee,
//         })
//       );


//       console.log('✅ Transaction built successfully');
//     } catch (err) {
//       console.error('❌ Error building transaction:', err);
//       throw err;
//     }

//     console.log('🔐 Signing transaction…');
//     tx = await prepTx(tx);
//     tx.partialSign(mintKeypair);
//     const signedTx = await signTransaction(tx);

//     console.log('📤 Sending transaction…');
//     const sig = await connection.sendRawTransaction(signedTx.serialize());
//     console.log(`📤 Transaction sent: https://solscan.io/tx/${sig}`);

//     console.log('🕐 Confirming transaction…');
//     await connection.confirmTransaction(sig, 'finalized');
//     console.log('✅ Transaction confirmed');

//     if (params.revokeMint || params.revokeFreeze) {
//       console.log('🔒 Starting revocation steps…');
//       const mintInfo = await getMint(connection, mintKeypair.publicKey);
//       console.log('🔎 Current mint info:', {
//         mintAuthority: mintInfo.mintAuthority?.toBase58() ?? 'null',
//         freezeAuthority: mintInfo.freezeAuthority?.toBase58() ?? 'null',
//       });

//       let txR = new Transaction();
//       if (params.revokeMint && mintInfo.mintAuthority) {
//         console.log('➡️ Adding revoke mint authority instruction');
//         txR.add(
//           createSetAuthorityInstruction(
//             mintKeypair.publicKey,
//             publicKey,
//             AuthorityType.MintTokens,
//             null
//           )
//         );
//       }
//       if (params.revokeFreeze && mintInfo.freezeAuthority) {
//         console.log('➡️ Adding revoke freeze authority instruction');
//         txR.add(
//           createSetAuthorityInstruction(
//             mintKeypair.publicKey,
//             publicKey,
//             AuthorityType.FreezeAccount,
//             null
//           )
//         );
//       }

//       if (txR.instructions.length > 0) {
//         console.log('🔐 Signing revoke transaction…');
//         txR = await prepTx(txR);
//         const signedR = await signTransaction(txR);
//         console.log('📤 Sending revoke transaction…');
//         const sigR = await connection.sendRawTransaction(signedR.serialize());
//         console.log(`📤 Revoke sent: https://solscan.io/tx/${sigR}`);

//         console.log('🕐 Confirming revoke transaction…');
//         await connection.confirmTransaction(sigR, 'finalized');
//         console.log('✅ Revocation confirmed');
//       } else {
//         console.log('🚫 No revocation instructions to send');
//       }
//     }

//     return { mintAddress: mintKeypair.publicKey.toBase58(), metadataUri };
//   }

//   return { createToken };
// }