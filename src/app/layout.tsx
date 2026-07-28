import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineProx · Día de la Familia",
  description: "Registro para el Día de la Familia CineProx",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
