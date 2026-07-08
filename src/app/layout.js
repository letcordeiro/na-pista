import { Barlow_Condensed, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata = {
  title: "Na Pista — painel do motorista",
  description:
    "Controle de ganhos, gastos e consumo de combustível para motoristas de aplicativo.",
  applicationName: "NaPista",
};

export const viewport = {
  themeColor: "#14161B",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${barlow.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
