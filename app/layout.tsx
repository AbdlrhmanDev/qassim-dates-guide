import type { Metadata } from "next";
import { Amiri, Noto_Sans_Arabic } from "next/font/google";
import { Providers } from "./providers";
import "@/index.css";

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-amiri",
});

const notoSansArabic = Noto_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-arabic",
});

export const metadata: Metadata = {
  title: "تمور القصيم | Qassim Dates",
  description: "اكتشف تراث تمور القصيم - منصة ثقافية تربط المستهلكين بمنتجي التمور في منطقة القصيم بالمملكة العربية السعودية",
  authors: [{ name: "Qassim Dates" }],
  openGraph: {
    title: "تمور القصيم | Qassim Dates",
    description: "اكتشف تراث تمور القصيم - منصة ثقافية تربط المستهلكين بمنتجي التمور في منطقة القصيم",
    type: "website",
    images: ["/favicon.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@QassimDates",
    images: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning className={`${amiri.variable} ${notoSansArabic.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
