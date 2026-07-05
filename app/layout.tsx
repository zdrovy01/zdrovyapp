import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/footer";
import PageTransition from "@/components/page-transition";
import { LanguageProvider } from "@/config/language-context";
import { AuthProvider } from "@/config/auth-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Zdrovy App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <main>
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
