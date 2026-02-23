import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "ReisDagboek | Travel Journal",
  description: "Plan en volg al je reizen. Beheer je itinerary, budget en ontdek geweldige plekken.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
        </div>
      </body>
    </html>
  );
}
