import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/index.css";

export const metadata: Metadata = {
  title: "تمور القصيم | Qassim Dates",
  description: "اكتشف تراث تمور القصيم - منصة ثقافية تربط المستهلكين بمنتجي التمور في منطقة القصيم بالمملكة العربية السعودية",
  authors: [{ name: "Qassim Dates" }],
  openGraph: {
    title: "تمور القصيم | Qassim Dates",
    description: "اكتشف تراث تمور القصيم - منصة ثقافية تربط المستهلكين بمنتجي التمور في منطقة القصيم",
    type: "website",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@QassimDates",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

