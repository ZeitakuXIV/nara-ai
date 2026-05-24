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
    <html lang="en" className="bg-nara-light overflow-hidden">
      <body className="font-sans antialiased bg-nara-light">
        {/* We remove the global nav here because an App typically doesn't have a web-style nav on the Auth screen */}
        <main className="h-[100dvh] flex flex-col overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
