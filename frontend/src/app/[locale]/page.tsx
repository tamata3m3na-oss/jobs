import { useTranslations } from 'next-intl';

export default function Index() {
  const t = useTranslations('Common');
  const nt = useTranslations('Navigation');

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div className="p-8 border rounded-xl hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4">{nt('jobs')}</h2>
          <p className="text-gray-600">Explore the latest job opportunities and apply today.</p>
        </div>
        <div className="p-8 border rounded-xl hover:shadow-lg transition-shadow">
          <h2 className="text-2xl font-semibold mb-4">{nt('postJob')}</h2>
          <p className="text-gray-600">Find the best talent for your company and grow your team.</p>
        </div>
      </div>
    </div>
  );
}
