'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchApi, getImageUrl } from '@/services/api';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useEffect, useState } from 'react';
import { BannerSectionSkeleton } from '@/components/home/HomeSkeletons';

interface Banner {
  _id: string;
  title: { uz: string; ru: string };
  image: string;
  linkType: string;
  linkId?: string;
}

export default function BannerSection({ locale, type = 'hero' }: { locale: string, type?: 'hero' | 'middle' }) {
  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ['banners', type],
    queryFn: () => fetchApi(`/banners?type=${type}`)
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: false, align: 'start' },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  if (isLoading) {
    return <BannerSectionSkeleton />;
  }

  if (!banners?.length) {
    return null;
  }

  return (
    <div className="py-4">
      <div className="overflow-hidden px-4" ref={emblaRef}>
        <div className="flex gap-4">
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="flex-[0_0_100%] min-w-0 h-44 rounded-3xl overflow-hidden relative shadow-lg"
            >
              <img
                src={getImageUrl(banner.image)}
                alt={banner.title[locale as 'uz' | 'ru']}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-white font-bold text-xl drop-shadow-2xl"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {banner.title[locale as 'uz' | 'ru']}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all ${index === selectedIndex
                  ? 'w-6 bg-gray-800'
                  : 'w-2 bg-gray-300'
                }`}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
