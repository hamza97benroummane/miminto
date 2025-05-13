import { useState, Fragment, useEffect } from 'react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import { useCreateToken } from '../hooks/useCreateToken';

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

export default function TokenForm() {
  // form fields
  const [tokenName, setTokenName]     = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [supply, setSupply]           = useState('');
  const [decimals, setDecimals]       = useState(6);
  const [description, setDescription] = useState('');
  const [logo, setLogo]               = useState<File | null>(null);
  const [revokeUpdate, setRevokeUpdate] = useState(false);
  const [revokeFreeze, setRevokeFreeze] = useState(false);
  const [revokeMint, setRevokeMint]     = useState(false);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);


  // submission state
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // modal state
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [showModal, setShowModal]     = useState(false);

  const { publicKey }   = useWallet();
  const { createToken } = useCreateToken();


  // Whenever `logo` changes, generate (and clean up) the object URL
  useEffect(() => {
    if (logo) {
      const url = URL.createObjectURL(logo);
      setLogoPreview(url);
      return () => {
        URL.revokeObjectURL(url);
        setLogoPreview(null);
      };
    }
  }, [logo]);

  // reset form
  const resetForm = () => {
    setTokenName('');
    setTokenSymbol('');
    setSupply('');
    setDecimals(6);
    setDescription('');
    setLogo(null);
    setRevokeUpdate(false);
    setRevokeFreeze(false);
    setRevokeMint(false);
    setError(null);
  };

  // close modal and clear
  const handleClose = () => {
    setShowModal(false);
    setMintAddress(null);
    resetForm();
  };

  const handleSubmit = async () => {
    // require wallet
    if (!publicKey) {
      toast.warn('Please connect your wallet first');
      return;
    }
    // require all fields
    if (!tokenName.trim() || !tokenSymbol.trim() || !supply.trim() || !description.trim()) {
      toast.error('All fields are required');
      return;
    }
    if (!logo) {
      toast.error('Logo is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { mintAddress } = await createToken({
        name:           tokenName,
        symbol:         tokenSymbol,
        decimals,
        supply:         Number(supply),
        description,
        image:          logo,
        revokeMint,
        revokeFreeze,
        revokeUpdate,
      });
      setMintAddress(mintAddress);
      setShowModal(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      {/* loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-4 rounded-lg">
            <Spinner />
            <span>Processing...</span>
          </div>
        </div>
      )}

      {/* form card */}
      <div className="w-full max-w-2xl bg-bg-overlay border border-primary rounded-xl p-8 shadow-card backdrop-blur-md mx-auto">

        {/* name & symbol */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1 text-gray-300 font-semibold">
              Token Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={tokenName}
              onChange={e => setTokenName(e.target.value)}
              placeholder="Enter token name"
              className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-pink-500"
              // className="block w-full rounded-md bg-bg DEFAULT px-4 py-2 focus:ring-2 focus:ring-secondary focus:border-secondary"
              />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300 font-semibold">
              Token Symbol <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={tokenSymbol}
              onChange={e => setTokenSymbol(e.target.value)}
              placeholder="Enter token symbol"
              className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* decimals & supply */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm mb-1 text-gray-300 font-semibold">
              Decimals <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              value={decimals}
              min={0} max={18}
              onChange={e => setDecimals(Number(e.target.value))}
              className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300 font-semibold">
              Supply <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="number"
              value={supply}
              onChange={e => setSupply(e.target.value)}
              placeholder="Enter total supply"
              className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {/* description */}
        <div className="mt-6">
          <label className="block text-sm mb-1 text-gray-300 font-semibold">
            Token Description <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter a short description"
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-pink-500"
          />
        </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4 border border-secondary rounded-xl p-4 bg-bg">
        <label className="relative flex items-center justify-center border-2 border-dashed border-secondary rounded-xl cursor-pointer h-32 overflow-hidden bg-bg">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo preview"
              className="object-contain h-full w-full"
            />
          ) : (
            <span className="text-secondary-light">
              Click to Upload Logo
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.currentTarget.files?.[0] || null;
              setLogo(file);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>

        {/* Guidelines */}
        <div className="text-gray-400 text-xs space-y-1">
          <p>Supported: PNG / GIF / JPG / WEBP / JPEG</p>
          <p>Recommended: 1000×1000 px for best cross-platform display</p>
        </div>
      </div>

        {/* authorities */}
        <div className="grid md:grid-cols-3 gap-4 mt-6 text-sm">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={revokeUpdate}
                onChange={() => setRevokeUpdate(u => !u)}
                className="h-4 w-4 text-pink-500"
              />
              <span className="font-semibold text-white">Revoke Update (Immutable)</span>
            </label>
            <p className="text-gray-400 mt-2 text-xs">
              Renouncing ownership means you will not be able to modify the token metadata. It indeed makes investors feel more secure.
            </p>
            <p className="font-semibold mt-2 text-xs">
              +0.1 SOL
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={revokeFreeze}
                onChange={() => setRevokeFreeze(f => !f)}
                className="h-4 w-4 text-pink-500"
              />
              <span className="font-semibold text-white">Revoke Freeze</span>
            </label>
            <p className="text-gray-400 mt-2 text-xs">
              Revoking Freeze Authority removes control over account-level actions.
            </p>
            <p className="font-semibold mt-2 text-xs">
              +0.1 SOL
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={revokeMint}
                onChange={() => setRevokeMint(m => !m)}
                className="h-4 w-4 text-pink-500"
              />
              <span className="font-semibold text-white">Revoke Mint</span>
            </label>
            <p className="text-gray-400 mt-2 text-xs">
              Prevents additional supply by removing minting rights.
            </p>
            <p className="font-semibold mt-2 text-xs">
              +0.1 SOL
            </p>
          </div>
        </div>

        {/* wallet & submit */}
        <div className="mt-8 space-y-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
          >
            {loading && <Spinner />}
            {loading ? 'Creating…' : 'Create Token'}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>

      {/* success modal */}
      {showModal && mintAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-2xl font-bold">🎉 Token Created!</h3>
            <p className="break-all text-gray-800 dark:text-gray-200">{mintAddress}</p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() =>
                  window.open(
                    `https://solscan.io/address/${mintAddress}`,
                    '_blank'
                  )
                }
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                View on Solscan
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}

