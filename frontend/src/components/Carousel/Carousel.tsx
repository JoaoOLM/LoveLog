"use client";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface CarouselProps {
  images: string[];
}

export default function Carousel({ images }: CarouselProps) {
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
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image}
              alt={`Photo ${index + 1}`}
              className="w-full h-[60vh] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}