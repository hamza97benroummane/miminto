
// ////////////////////////////////////////////////////
import { Routes, Route } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WalletListener from './components/WalletListener';
import Navbar from './components/Navbar';
import Hero from './components/home/Hero';
import TokenForm from './components/TokenForm';
import backgroundImage from './assets/images/Background.jpg';

export default function App() {
  return (

    <div className="relative w-full min-h-screen text-white overflow-x-hidden">

        {/* toasts will render into this */}
        <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        />


        {/* Full‑screen gradient background */}
        <div className="fixed inset-0 z-[-2] bg-gradient-to-b from-[#3f226b] to-black text-white py-12 px-4" />
        <div className="fixed inset-0 z-[-1] bg-[url('/stars.png')] bg-cover bg-center opacity-30" />
        {/* className="bg-gradient-to-b from-[#3f226b] to-black text-white py-12 px-4" */}
        {/* Navbar */}
        <Navbar />
        <WalletListener />
        {/* <div className="fixed inset-0 z-10 overflow-y-auto"> */}
        <div id="scroll-container" className="fixed inset-0 z-10 overflow-y-auto">
        {/* Main content */}
        
      <main className="relative z-10 pt-16 ">
        {/* <main className="relative z-10 pt-16"> */}
          <Routes>
            {/* Home Page */}
            <Route
              path="/"
              element={
                  // full‐page bg image on home
                  <div
                    className="bg-cover bg-center"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                  >
                    <Hero />
                  </div>
                }


            />

            {/* Create Token Page */}
            <Route
              path="/create-token"
              element={
                <div className="px-4 py-12 max-w-screen-xl mx-auto">
                    <div className="text-center space-y-3 mb-12">
                      <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
                        <span className="text-purple-400">Solana</span> <span className="text-pink-500">Token</span> Creator
                      </h1>
                      <p className="text-lg md:text-xl text-secondary-light max-w-lg mx-auto">
                        The perfect tool to create Solana SPL tokens.
                        <br />
                        Simple, user friendly, and fast.
                      </p>
                    </div>
                  <div className=" space-y-3 mb-12">
                    
                    <TokenForm />
                  </div>
                </div>
                
              }
            />

          </Routes>
      </main>
      </div>
    </div>
  );
}
