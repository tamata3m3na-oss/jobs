import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Providers } from '@/providers';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import Navbar from '@/components/layouts/Navbar';

const inter = Inter({ subsets: ['latin'] });

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main>{children}</main>
              </div>
            </NextIntlClientProvider>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
