import type { Metadata } from "next";
import "./globals.css";
import { Pixelify_Sans } from 'next/font/google'

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: "BadgerBash",
  description: "Play quick games with your friends!",
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
        {children}
      </body>
    </html>
  );
}
