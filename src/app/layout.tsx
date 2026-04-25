import type { Metadata, Viewport } from "next";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/utils/constants";
import { SupabaseProvider } from "@/presentation/providers/SupabaseProvider";
import { AuthProvider } from "@/presentation/providers/AuthProvider";
import { Navbar } from "@/presentation/layout/Navbar";
import { ToastWrapper } from "@/presentation/ui/ToastWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a1628",
  // When the iOS keyboard appears, resize the layout viewport so `dvh`
  // units shrink to fit the visible area instead of scrolling the
  // whole page up. Keeps the globe visible above the input on Worldle,
  // Name All, Capitals, etc.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <SupabaseProvider>
          <AuthProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <ToastWrapper />
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
