import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAInstallGuide from "./components/PWAInstallGuide";
import FloatingChat from "./components/FloatingChat";

export const metadata: Metadata = {
  title: "NARA",
  description: "Nutrition Adaptive Reasoning Agent",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NARA",
  },
};

export const viewport: Viewport = {
  themeColor: "#3D644D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {/* GLOBAL PREMIUM BACKGROUND: High-fidelity animated blobs for all pages */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-nara-emerald/10 rounded-full mix-blend-multiply filter blur-[80px] animate-blob" />
          <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] bg-nara-hunter/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-10%] left-[10%] w-[80vw] h-[80vw] bg-nara-emerald/5 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000" />
        </div>

        <PWAInstallGuide />
        <FloatingChat />
        
        <main className="h-screen w-full flex flex-col relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
