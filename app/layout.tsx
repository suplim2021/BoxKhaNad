import type { Metadata } from "next";
import "./globals.css";

const title = "BoxKhaNad — กล่องขนาดไหนถึงพอดี?";
const description =
  "คำนวณขนาดสิ่งของรวมวัสดุกันกระแทก แล้วเทียบกล่องพัสดุที่ใช้ในไทย";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://boxkhanad.suplim.chatgpt.site";
const socialImage = `${siteUrl}/og.png`;

export const metadata: Metadata = {
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
