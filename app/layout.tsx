import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import { Poiret_One } from "next/font/google";

const poiret = Poiret_One({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KAVI Reader",
  description: "Interactive reader with Google login",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${poiret.className} antialiased`}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
