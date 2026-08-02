import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFL Pick'em",
  description: "Private NFL against-the-spread pick'em pool",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#013369",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
