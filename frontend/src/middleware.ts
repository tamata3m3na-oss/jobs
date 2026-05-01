import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales: locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    '/',
    '/(ar|en)/:path*',
    // Exclude paths starting with these patterns
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
