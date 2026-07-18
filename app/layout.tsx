import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "BoxKhaNad — กล่องขนาดไหนถึงพอดี?";
const description =
  "คำนวณขนาดสิ่งของรวมวัสดุกันกระแทก แล้วเทียบกล่องพัสดุที่ใช้ในไทย";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const socialImage = `${origin}/og.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: socialImage,
          width: 1731,
          height: 909,
          alt: "BoxKhaNad กล่องขนาดไหนถึงพอดี",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
