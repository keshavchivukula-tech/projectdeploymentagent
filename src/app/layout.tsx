import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Keshav Deployment tool | Antigravity",
  description: "Automated code extraction and deployment pipeline for developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background text-foreground tracking-tight`}>
        {children}
        <Toaster position="top-right" richColors closeButton theme="light" />
      </body>
    </html>
  );
}
