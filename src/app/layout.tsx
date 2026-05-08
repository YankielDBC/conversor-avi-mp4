import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVI → MP4 | Conversor WhatsApp",
  description: "Convierte videos AVI a MP4 optimizados para WhatsApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}