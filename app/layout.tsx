import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata = {
  title: "QSocial",
  description: "Post it. Experience it. It's gone in 7 days."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <main className="min-h-screen pb-20">{children}</main>
          <BottomNav />
        </body>
      </html>
    </ClerkProvider>
  );
}