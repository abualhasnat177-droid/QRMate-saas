import type { Metadata } from "next";
import "./globals.css";
import LiveChat from "./components/LiveChat";

export const metadata: Metadata = {
  title: "QRMate - Modern QR Code Generator",
  description: "Create, track, and manage professional QR codes for your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth antialiased font-sans">
      <body className="font-sans antialiased bg-[#F5F1EB] text-[#2D2A26] selection:bg-teal-100 selection:text-teal-900 min-h-screen flex flex-col relative">
        {children}
        <LiveChat />
      </body>
    </html>
  );
}
