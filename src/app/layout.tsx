import type { Metadata } from "next";
import "./globals.css";
import { Pixelify_Sans } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/sonner"

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: "BadgerBash",
  description: "Play quick games with your friends! Uno, Monopoly, Codenames, multiplayer party games for a chill night gaming experience!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pixelifySans.className}`}
      >
        <AuthProvider>
          {children}
          <Toaster/>
        </AuthProvider>
      </body>
    </html>
  );
}