import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import ClasshopperLogo from '../components/ClasshopperLogo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Classhopper Forum',
  description: 'Classhopper öğrenci forumu ve kayıt sistemi',
  keywords: ['classhopper', 'forum', 'öğrenci', 'proje', 'klan'],
  authors: [{ name: 'Classhopper Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* Header with Logo */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <ClasshopperLogo size={96} className="text-primary-600" />
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Ana Sayfa
                </a>
                <a href="/form" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium">
                  Form
                </a>
              </nav>
            </div>
          </div>
        </header>
        
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
