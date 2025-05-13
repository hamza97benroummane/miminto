
const steps = [
  {
    title: 'Connect your Solana wallet',
    description: 'Simply click the Select Wallet button in the navbar.',
  },
  {
    title: 'Enter token name & symbol',
    description: 'Your symbol can be up to 8 characters long.',
  },
  {
    title: 'Write a short description',
    description: 'Explain what your meme coin stands for.',
  },
  {
    title: 'Upload a logo',
    description: 'Use a square, high-res image (1000 ×1000  recommended).',
  },
  {
    title: 'Select decimals',
    description: '9 is the default and recommended value.',
  },
  {
    title: 'Set authorities (optional)',
    description: 'Customize mint/update/freeze rights, or keep default.',
  },
  {
    title: 'Click Create Token',
    description: 'Your coin will be live on Solana in seconds.',
  },
];

export default function HowToUse() {
  return (
    <section className="bg-black bg-gradient-to-b from-black to-[#3f226b] text-white py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            <span className="text-green-400">How</span> to Use Mimint Creator
          </h2>
          <p className="mt-2 text-white/60 max-w-xl mx-auto">
            Follow these simple steps to launch your meme coin on Solana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 bg-[#111015] p-6 rounded-2xl border border-white/10 shadow-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 text-white font-bold flex items-center justify-center rounded-full">
                {i + 1}
              </div>
              <div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-1 text-white/70 text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}