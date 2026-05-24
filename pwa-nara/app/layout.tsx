import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NARA",
  description: "Nutrition Adaptive Reasoning Agent",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NARA",
  },
};

export const viewport: Viewport = {
  themeColor: "#F8FAFC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Essential for PWA app-feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {/* We remove the global nav here because an App typically doesn't have a web-style nav on the Auth screen */}
        <main className="min-h-[100dvh] flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
