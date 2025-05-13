// src/components/Navbar.tsx
import { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import logo from '../assets/images/logoA.png';  // ← your logo import


const links = [
  { label: 'Home', to: '/' },
  { label: 'Token Creation', to: '/create-token' , isHash: true },
  // { label: '', to: '/#how-to-use', isHash: true },



];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname, hash } = useLocation();

  return (
    <nav className="bg-black/60 backdrop-blur-md px-4 py-4 fixed w-full z-20 top-0">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Mimint Logo" className="h-8 w-auto" />
          <span className="ml-2 text-xl font-bold text-white">Mimint</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex space-x-14 items-center">
          {links.map(({ label, to, isHash }) =>
            isHash ? (
              <HashLink
                key={label}
                smooth
                to={to}
                className={`text-sm font-medium px-3 py-1 rounded ${
                  pathname === '/' && hash === to.slice(to.indexOf('#')) 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {label}
              </HashLink>
            ) : (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium px-3 py-1 rounded ${
                  pathname === to
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {label}
              </Link>
            )
          )}
          <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg" />
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden p-2 text-gray-300 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#1a1a2e] border-t border-gray-700">
          <div className="flex flex-col px-4 py-4 space-y-1">
            {links.map(({ label, to, isHash }) =>
              isHash ? (
                <HashLink
                  key={label}
                  smooth
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-medium px-3 py-2 rounded text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  {label}
                </HashLink>
              ) : (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-base font-medium px-3 py-2 rounded ${
                    pathname === to
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              )
            )}
            <WalletMultiButton className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg" />
          </div>
        </div>
      )}
    </nav>
);
}