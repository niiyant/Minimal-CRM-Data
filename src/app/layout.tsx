import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM Minimal",
  description: "Sistema CRM minimalista",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-white">
          <nav className="border-b border-gray-200 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">CRM Minimal</span>
                  </Link>
                </div>
                <ul className="flex items-center space-x-8">
                  <li>
                    <Link href="/locations" className="text-gray-600 hover:text-gray-900">
                      Ubicaciones
                    </Link>
                  </li>
                  <li>
                    <Link href="/contacts" className="text-gray-600 hover:text-gray-900">
                      Contactos
                    </Link>
                  </li>
                  <li>
                    <Link href="/appointments" className="text-gray-600 hover:text-gray-900">
                      Citas
                    </Link>
                  </li>
                  <li>
                    <div className="relative group">
                      <Link href="/calls" className="text-gray-600 hover:text-gray-900">
                        Llamadas
                      </Link>
                      <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                        <div className="py-1">
                          <Link href="/calls" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            Resumen
                          </Link>
                          <Link href="/calls/table" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            Tabla
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative group">
                      <Link href="/opportunities" className="text-gray-600 hover:text-gray-900">
                        Oportunidades
                      </Link>
                      <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                        <div className="py-1">
                          <Link href="/opportunities" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            Resumen
                          </Link>
                          <Link href="/opportunities/table" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            Tabla
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative group">
                      <Link href="/pipelines" className="text-gray-600 hover:text-gray-900">
                        Pipelines
                      </Link>
                      <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                        <div className="py-1">
                          <Link href="/pipelines" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            Resumen
                          </Link>
                          <Link href="/pipelines/table" className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            Tabla
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
