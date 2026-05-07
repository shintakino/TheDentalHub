import Link from "next/link";
import { Metadata } from "next";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Dental Hub | Precision Care, Elevated",
  description: "The premium dental marketplace for elite care and high-performance clinic operations.",
  openGraph: {
    title: "The Dental Hub | Precision Care, Elevated",
    description: "Connect with the world's most precise dental professionals or scale your clinic with our clinical OS.",
    images: ["/images/og-main.png"],
  },
};

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-50 flex items-center justify-between px-8 py-8 max-w-[1400px] mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-3xl font-bold tracking-tight text-[#0A1120]">
            The Dental Hub.
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link href="/search" className="text-sm font-medium text-[#64748B] hover:text-[#0047FF] transition-colors">
            Find a Clinic
          </Link>
          <Link href="/about" className="text-sm font-medium text-[#64748B] hover:text-[#0047FF] transition-colors">
            Our Standard
          </Link>
          <Link 
            href="/sign-in" 
            className={cn(buttonVariants({ variant: "outline" }), "border-[#0047FF]/20 text-[#0047FF] hover:bg-[#0047FF]/5")}
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up?redirect_url=/onboarding/clinic" 
            className={cn(buttonVariants({ variant: "default" }), "bg-[#0047FF] hover:bg-[#0037cc]")}
          >
            List your Clinic
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 px-6 flex flex-col items-center text-center max-w-[900px] mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0047FF]/5 border border-[#0047FF]/10 text-[#0047FF] text-xs font-semibold tracking-wider uppercase mb-8 animate-fade-in">
          <ShieldCheck className="w-3.5 h-3.5" />
          The Standard of Excellence
        </div>
        
        <h1 className="font-serif text-6xl md:text-8xl font-bold text-[#0A1120] leading-[1.1] mb-8 tracking-tight">
          The Standard of Care, <br />
          <span className="italic text-[#0047FF]">Elevated.</span>
        </h1>
        
        <p className="font-sans text-xl text-[#64748B] leading-relaxed mb-12 max-w-[600px]">
          Precision care for patients. <br />
          Professional scale for elite clinics.
        </p>

        {/* Hero Search Bar */}
        <form 
          action="/search"
          className="w-full max-w-2xl relative group animate-slide-up"
        >
          <div className="absolute inset-0 bg-[#0047FF]/10 blur-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] p-2">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-[#64748B] mr-3" />
              <input 
                name="query"
                placeholder="Search by clinic, city, or specialty..."
                className="w-full border-none bg-transparent focus:outline-none text-lg placeholder:text-[#94A3B8] px-2"
              />
            </div>
            <Button size="lg" type="submit" className="bg-[#0047FF] hover:bg-[#0037cc] rounded-xl px-8 h-12">
              Search
            </Button>
          </div>
        </form>
      </section>

      {/* Dual Funnel Path */}
      <section className="relative z-10 px-6 pb-32 max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8">
        {/* Patient Path */}
        <div className="bg-white rounded-[32px] p-12 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] flex flex-col items-start hover:-translate-y-1 transition-transform duration-500 cursor-pointer group">
          <div className="w-16 h-16 rounded-2xl bg-[#0047FF]/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <Sparkles className="w-8 h-8 text-[#0047FF]" />
          </div>
          <h2 className="font-serif text-4xl font-bold text-[#0A1120] mb-4">Find Elite Care.</h2>
          <p className="text-[#64748B] text-lg mb-8 leading-relaxed">
            Discover the most precise dental professionals in your area. Instant booking, transparent pricing, and clinical excellence.
          </p>
          <Link 
            href="/search" 
            className="inline-flex items-center text-[#0047FF] font-semibold text-lg group/link"
          >
            Start Searching
            <ArrowRight className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Provider Path */}
        <div className="bg-white rounded-[32px] p-12 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] flex flex-col items-start hover:-translate-y-1 transition-transform duration-500 cursor-pointer group">
          <div className="w-16 h-16 rounded-2xl bg-[#0047FF]/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <Zap className="w-8 h-8 text-[#0047FF]" />
          </div>
          <h2 className="font-serif text-4xl font-bold text-[#0A1120] mb-4">Scale your Practice.</h2>
          <p className="text-[#64748B] text-lg mb-8 leading-relaxed">
            The Operating System for modern dental clinics. Manage appointments, branches, and patient experience with surgical precision.
          </p>
          <Link 
            href="/sign-up?redirect_url=/onboarding/clinic" 
            className="inline-flex items-center text-[#0047FF] font-semibold text-lg group/link"
          >
            List your Clinic
            <ArrowRight className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Value Props Grid */}
      <section className="bg-white py-32 border-t border-[#0A1120]/5">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <div className="font-serif text-2xl font-bold text-[#0A1120]">Instant Booking.</div>
            <p className="text-[#64748B] leading-relaxed">
              Zero-friction scheduling that respects your time and your patients' urgency.
            </p>
          </div>
          <div className="space-y-4">
            <div className="font-serif text-2xl font-bold text-[#0A1120]">Zero Double-Bookings.</div>
            <p className="text-[#64748B] leading-relaxed">
              Our real-time scheduling engine ensures absolute availability accuracy across all branches.
            </p>
          </div>
          <div className="space-y-4">
            <div className="font-serif text-2xl font-bold text-[#0A1120]">Premium Presence.</div>
            <p className="text-[#64748B] leading-relaxed">
              A bespoke clinical landing page for every branch, reflecting the quality of your care.
            </p>
          </div>
        </div>
      </section>

      {/* Structured Data (JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalOrganization",
            "name": "The Dental Hub",
            "url": "https://thedentalhub.com",
            "logo": "https://thedentalhub.com/logo.png",
            "description": "Professional dental services and clinic management platform.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            }
          }),
        }}
      />
    </div>
  );
}
