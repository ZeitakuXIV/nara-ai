import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  themeColor: "#3D644D", // Match theme color better
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
        {/* Global Animated Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
          <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-nara-emerald/10 rounded-full mix-blend-multiply filter blur-[80px] animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] bg-nara-hunter/10 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-[60vw] h-[60vw] bg-nara-emerald/5 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000" />
        </div>

        <main className="h-[100dvh] w-full flex flex-col relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
