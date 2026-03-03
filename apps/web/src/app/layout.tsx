import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VizTechStack — Learn by Seeing",
  description: "Nền tảng học lập trình tương tác với mô phỏng 3D. Học Next.js, React và hơn thế nữa.",
  keywords: ["học lập trình", "Next.js", "React", "3D visualization", "interactive learning"],
  authors: [{ name: "VizTechStack" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
