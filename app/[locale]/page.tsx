import BannerSection from '@/components/BannerSection';
import CategorySection from '@/components/CategorySection';
import ProductSection from '@/components/ProductSection';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-2 pb-20">
      <BannerSection locale={locale} type="hero" />
      <CategorySection locale={locale} />
      
      <ProductSection 
        title={locale === 'uz' ? 'Yangi kelganlar' : 'Новинки'} 
        query="isNew=true" 
        locale={locale} 
      />

      <BannerSection locale={locale} type="middle" />

      <ProductSection 
        title={locale === 'uz' ? 'Ommabop' : 'Популярные'} 
        query="isPopular=true" 
        locale={locale} 
      />
    </div>
  );
}