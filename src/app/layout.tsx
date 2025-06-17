import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/providers/authProvider";

export const metadata: Metadata = {
  title: "QnA App",
  description: "A Question and Answer application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
