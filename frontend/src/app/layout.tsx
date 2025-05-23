import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoveLog",
  description: "Jorunal digital de relacionamento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>
        {children}
      </body>
    </html>
  );
}
