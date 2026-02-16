import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// 1. Load Montserrat for the Controller UI
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// 2. Load Optician Sans for the LED Board
const optician = localFont({
  src: "./fonts/Optiker-K.otf", // Ensure file is in app/fonts/
  variable: "--font-optician",
  display: "swap",
});

export const metadata = {
  title: "Padel Scoreboard",
  description: "LED Scoreboard System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply Montserrat by default, and inject the Optician variable */}
      <body className={`${montserrat.variable} ${optician.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
