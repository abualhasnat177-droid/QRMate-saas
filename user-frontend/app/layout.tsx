import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./ThemeContext";
import LiveChat from "./components/LiveChat";
import AuthProvider from "./components/AuthProvider";

export const metadata: Metadata = {
  title: "QRMate Dashboard",
  description: "Manage your premium QR codes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <LiveChat />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
