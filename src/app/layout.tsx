import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "./store-provider";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_TITLE,
  description: process.env.NEXT_PUBLIC_TITLE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StoreProvider>
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  </StoreProvider>;
}
