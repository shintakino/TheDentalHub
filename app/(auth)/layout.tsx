export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel: Hidden on small screens, takes up 50% on lg screens */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between relative z-10 shadow-2xl overflow-hidden border-r border-slate-200">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-80 mix-blend-normal bg-cover bg-center"
          style={{ backgroundImage: "url('/images/auth-bg-light.png')" }}
        />
        {/* Gradient Overlays for text legibility and depth */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent w-full" />
        
        {/* Subtle decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-primary z-10" />
        
        <div className="relative z-10 px-16 py-24 xl:px-24 mt-12">
          <h1 className="font-serif text-5xl xl:text-6xl font-bold tracking-tight mb-8 text-[#0A1120] leading-[1.1]">
            The Dental Hub.
          </h1>
          <p className="text-xl xl:text-2xl text-slate-800 font-normal leading-relaxed max-w-md">
            Elevating clinical excellence through precision scheduling and intelligent practice management.
          </p>
        </div>
        
        <div className="relative z-10 mt-auto px-16 pb-16 xl:px-24 xl:pb-24">
          <p className="text-sm text-slate-500 font-medium tracking-widest uppercase">
            System v3.0 &bull; Secure Access
          </p>
        </div>
      </div>

      {/* Right Panel: Full width on small screens, 50% on lg screens */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#FAFAFA] relative">
        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none" />
        <div className="w-full max-w-md flex flex-col justify-center space-y-6 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
