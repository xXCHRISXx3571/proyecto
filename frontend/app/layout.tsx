import type { Metadata } from "next";
import "./globals.css";

import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Los 3 Pelagatos",
  description: "Tienda de cafés colombianos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div style={{ paddingTop: "70px", flex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
