import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Dental Hub",
  description: "Professional dental services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0047FF",
          colorBackground: "#FFFFFF",
          colorInputBackground: "#F8F9FA",
          colorInputText: "#0A1120",
          colorText: "#0A1120",
          colorTextSecondary: "#64748B",
          colorDanger: "#E11D48",
          fontFamily: "var(--font-sans)",
          borderRadius: "0.5rem",
        },
        elements: {
          rootBox: "w-full",
          cardBox: "w-full border-none bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] rounded-xl pt-8",
          headerTitle: "font-serif text-4xl font-bold text-[#0A1120]",
          headerSubtitle: "text-slate-500 font-light",
          socialButtonsBlockButton: "w-full justify-center border-slate-200 hover:bg-slate-50 transition-colors text-slate-700",
          formButtonPrimary: "w-full bg-[#0047FF] text-white hover:bg-[#0037cc] hover:shadow-md hover:-translate-y-[1px] transition-all",
          formFieldInput: "border-[#0047FF]/20 bg-[#F8F9FA] text-[#0A1120] hover:border-[#0047FF]/40 focus-visible:ring-1 focus-visible:ring-[#0047FF] focus-visible:ring-offset-0 transition-colors",
          formFieldLabel: "text-[#0A1120] font-medium",
          footerActionLink: "text-[#0047FF] hover:text-[#0037cc] font-medium",
          dividerText: "text-slate-600 font-medium",
          dividerLine: "bg-slate-200",
          footer: "bg-white border-t border-slate-100",
        },
      }}
    >
      <html
        lang="en"
        className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <TooltipProvider>{children}</TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
