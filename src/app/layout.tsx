import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Mi Factura DTE | Dashboard de Cotizaciones",
  description: "Sistema premium de gestión de cotizaciones",
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable} antialiased`}>
      <body className="bg-slate-50/50" suppressHydrationWarning>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <div className="flex w-72 flex-col">
              <Sidebar />
            </div>
          </div>

          {/* Main content */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-md px-8 shadow-sm">
              <div className="flex items-center gap-x-4">
                <h1 className="text-lg font-semibold text-slate-800 font-outfit">Dashboard</h1>
              </div>
              <div className="flex items-center gap-x-6">
                <div className="flex items-center gap-x-3">
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                    MS
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-semibold text-slate-900">Darrell Steward</p>
                    <p className="text-xs text-slate-500 font-medium">Super admin</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable area */}
            <main className="flex-1 overflow-y-auto bg-[#F8FAFC]/50 p-8">
              <div className="mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
