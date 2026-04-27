'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { ChangeEvent } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div className="relative inline-block text-left">
      <select
        defaultValue={locale}
        onChange={onSelectChange}
        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  );
}
