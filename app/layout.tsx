import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MacroScope | Economic Cycle & Market Regime Dashboard",
  description: "Translate macro data into market expectations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
