import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope, Inter, Poppins } from 'next/font/google';
import { getUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import Header from '@/components/header';
import { ThemeProvider } from '@/contexts/theme-context';
import { siteConfig } from '@/lib/config';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700']
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <html
      lang="en"
      className={`${manrope.className} ${inter.variable} ${poppins.variable}`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
        <ThemeProvider>
          <SWRConfig
            value={{
              fallback: {
                // We do NOT await here
                // Only components that read this data will suspend
                '/api/user': getUser()
              }
            }}
          >
            <div className="flex flex-col min-h-screen">
              {isAdminRoute && <Header />}
              {children}
            </div>
          </SWRConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
