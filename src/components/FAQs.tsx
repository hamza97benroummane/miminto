import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Is it safe to create Solana meme coin with Mimint?",
    answer:
      "Absolutely. Mimint uses trusted Solana programs under the hood, ensuring security and transparency.",
  },
  {
    question: "How long does it take to launch a coin?",
    answer:
      "On average, less than 2 minutes. Just enter a few details and hit launch!",
  },
  {
    question: "Do I fully own the meme coin?",
    answer:
      "Yes — you have complete ownership, including the mint authority unless you revoke it.",
  },
  {
    question: "Can I manage meme coin authorities later?",
    answer:
      "Yes! Mimint allows you to set or revoke mint/freeze authorities with just a few clicks.",
  },
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-gradient-to-b from-[#3f226b] to-black text-white py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold">
            <span className="text-pink-500">Frequently</span> Asked Questions
          </h2>
          <p className="mt-2 text-white/60">
            Everything you need to know about launching with Mimint.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-white/10 rounded-xl p-5 bg-[#111019] shadow-lg transition-all duration-300"
              >
                <button
                  className="w-full flex justify-between items-center text-left"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <div
                  className={`mt-3 text-white/70 text-sm overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-40' : 'max-h-0'
                  }`}
                >
                  {isOpen && <p>{faq.answer}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}