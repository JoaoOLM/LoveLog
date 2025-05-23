'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { usePhotos } from '@/hooks/usePhotos';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Carousel() {
  const { photos, isLoading, error } = usePhotos();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-[60vh]">Carregando fotos...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center h-[60vh] text-red-500">Erro: {error}</div>;
  }
  
  if (!photos || photos.length === 0) {
    return <div className="flex justify-center items-center h-[60vh]">Nenhuma foto encontrada</div>;
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        className="rounded-2xl overflow-hidden"
      >
        {photos.map((photo, index) => (
          <SwiperSlide key={photo.id || index}>
            <img
              src={photo.url}
              alt={`Foto ${index + 1}`}
              className="w-full h-[60vh] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}