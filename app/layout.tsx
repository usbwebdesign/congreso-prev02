import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

// Configuramos la fuente Sora con los pesos que vas a necesitar
const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora", // Creamos una variable de CSS
});

export const metadata: Metadata = {
  title: "V Congreso Multidisciplinario USBMéxico 2026",
  description: "Innovar para transformar - USBNetwork",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      {/* Inyectamos la variable de la fuente en el body */}
      <body className={`${sora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}