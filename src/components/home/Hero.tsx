// src/components/home/Hero.tsx
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';

import circleShape from '../../assets/images/cursor.png';
import triangleShape from '../../assets/images/message.png';
// import hexagonShape from '../../assets/images/mimint.png';
import backgroundImage from '../../assets/images/Background.jpg';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  // // Redirect when wallet connects
  useEffect(() => {
    if (publicKey) navigate('/create-token');
  }, [publicKey, navigate]);

  // Redirect only once after wallet connection
//   useEffect(() => {
//     const already = sessionStorage.getItem('mimintRedirected');
//     if (publicKey && !already) {
//       sessionStorage.setItem('mimintRedirected', 'true');
//       navigate('/create-token');
//     }
//   }, [publicKey, navigate]);

  // Framer-motion variants for floating shapes
  const float = {
    animate: {
      y: [0, -20, 0],
      transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' }
    }
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* semi-transparent color overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 to-black/60" />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
          Launch Your Token in Style
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
          The easiest way to create, pool, and launch SPL tokens on Solana.  
          Built for builders, by builders.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <WalletMultiButton className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition">
            {publicKey ? 'Go to Dashboard' : 'Connect Wallet'}
          </WalletMultiButton>

        </div>
      </motion.div>

      {/* Floating decorative shapes */}
      {/* {[circleShape, triangleShape, hexagonShape].map((src, i) => ( */}
      {[circleShape, triangleShape].map((src, i) => (
        <motion.img
          key={i}
          src={src}
          alt=""
          drag
          dragConstraints={containerRef}
          variants={float}
          animate="animate"
          className={`
            absolute opacity-70
            ${i === 0 ? 'w-16 h-16 top-10 left-8' : ''}
            ${i === 1 ? 'w-20 h-20 bottom-12 right-16' : ''}
            ${i === 2 ? 'w-12 h-12 top-1/2 right-1/4' : ''}
            sm:${i === 0 ? 'w-20 h-20 top-12 left-12' : ''}
            sm:${i === 1 ? 'w-24 h-24 bottom-16 right-20' : ''}
            sm:${i === 2 ? 'w-16 h-16 top-[45%] right-1/3' : ''}
          `}
        />
      ))}
    </section>
  );
}