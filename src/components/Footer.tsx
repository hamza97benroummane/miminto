
import { FaTelegramPlane, FaInstagram  } from 'react-icons/fa';
import { FaSquareXTwitter } from "react-icons/fa6";
import Logo from '../assets/images/mimint.png';


export default function Footer() {
  return (
    <footer className="bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & copyright */}

              {/* style={{ backgroundImage: `url(${backgroundImage})` }} */}
        <div>
          <img src={Logo} alt="Mimint Logo" className="h-25 mb-1" />
          <p className="text-gray-400 text-sm">
            © 2025 Mimint. All rights reserved.
          </p>
        </div>

        {/* About & social */}
        <div className="md:col-start-3">
          <h3 className="text-lg font-semibold mb-2">About Mimint</h3>
          <p className="text-gray-400 text-sm mb-4">
            Mimint.io is a decentralized Solana launchpad for creating and
            managing SPL tokens with ease.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://t.me/+99XzRZ1bx74yNGM0"
              target="_blank"
              rel="noreferrer"
            >
              <FaTelegramPlane className="w-5 h-5 text-gray-400 hover:text-white" />
            </a>
            <a
              href="https://www.instagram.com/mimint_tool?igsh=NTNmOGNjemh1ZXBz&utm_source=qr"
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram className="w-5 h-5 text-gray-400 hover:text-white" />
            </a>
            <a href="https://x.com/mimint_tool" target="_blank" rel="noreferrer">
              <FaSquareXTwitter className="w-5 h-5 text-gray-400 hover:text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
