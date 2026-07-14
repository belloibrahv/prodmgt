import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: { default: "TechVaults Project Manager", template: "%s · TechVaults" },
  description: "Internal product and project management platform for TechVaults Limited.",
  icons: { icon: "/tab-icon-vaults.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-full">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-roboto)",
              fontSize: "13px",
              borderRadius: "12px",
              background: "#201a1a",
              color: "#fff",
            },
            success: { iconTheme: { primary: "#1da851", secondary: "#fff" } },
            error:   { iconTheme: { primary: "#e53935", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
