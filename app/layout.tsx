import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "./globals.css";

// Load the font securely
const chakra = Chakra_Petch({
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Padel Scoreboard",
  description: "LED Padel System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={chakra.className}>{children}</body>
    </html>
  );
}
