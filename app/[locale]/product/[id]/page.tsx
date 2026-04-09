import ProductDetailView from '@/components/product/ProductDetailView';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  return <ProductDetailView locale={locale} productId={id} />;
}
