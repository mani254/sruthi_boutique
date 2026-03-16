import { Sidebar } from "@/components/layout/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"
import { Inter } from "next/font/google"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-background text-foreground" suppressHydrationWarning>
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
