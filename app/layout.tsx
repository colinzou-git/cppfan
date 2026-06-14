import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { BuildInfoFooter } from "@/components/build-info-footer";

export const metadata: Metadata = {
  title: "cppFan",
  description:
    "An adaptive C++ and data-structures learning app with review scheduling and skill mastery tracking.",
  applicationName: "cppFan",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
        <BuildInfoFooter />
      </body>
    </html>
  );
}
