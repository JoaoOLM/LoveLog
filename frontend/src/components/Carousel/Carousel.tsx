'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { usePhotos } from '@/hooks/usePhotos';
import { useRef, useState } from 'react';
import { BsPlus, BsTrash } from 'react-icons/bs';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function Carousel() {
  const { photos, isLoading, error, uploadPhoto, deletePhoto } = usePhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);
    try {
      await uploadPhoto(file);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number | undefined) => {
    if (!photoId) return;
    
    if (confirm('Tem certeza que deseja excluir esta foto?')) {
      await deletePhoto(photoId);
    }
  };
  
  if (isLoading && photos.length === 0) {
    return <div className="flex justify-center items-center h-[60vh]">Carregando fotos...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center h-[60vh] text-red-500">Erro: {error}</div>;
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Botão de upload */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <BsPlus size={20} />
          {uploading ? 'Fazendo upload...' : 'Adicionar Foto'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {!photos || photos.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh] bg-gray-100 rounded-2xl">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Nenhuma foto encontrada</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Adicionar primeira foto
            </button>
          </div>
        </div>
      ) : (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1}
          className="rounded-2xl overflow-hidden"
        >
          {photos.map((photo, index) => (
            <SwiperSlide key={photo.id || index} className="relative">
              <img
                src={photo.url}
                alt={`Foto ${index + 1}`}
                className="w-full h-[60vh] object-cover"
              />
              {/* Botão de excluir */}
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                title="Excluir foto"
              >
                <BsTrash size={16} />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}