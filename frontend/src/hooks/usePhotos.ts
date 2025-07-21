import { useState, useEffect, useCallback } from 'react';
import { fetchData, deleteData, uploadFile } from './api';

interface Image {
    id?: number;
    url: string;
}

export function usePhotos() {
    const [photos, setPhotos] = useState<Image[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Buscar todas as fotos
    const getPhotos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchData('photos');
            setPhotos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar fotos');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Upload de nova foto
    const uploadPhoto = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const newPhoto = await uploadFile('photos/', file);
            setPhotos((prev: Image[]) => [...prev, newPhoto]);
            return newPhoto;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer upload da foto');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Excluir foto
    const deletePhoto = useCallback(async (photoId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            await deleteData(`photos/${photoId}`);
            setPhotos((prev: Image[]) => prev.filter(item => item.id !== photoId));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir foto');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Carregar fotos automaticamente
    useEffect(() => {
        getPhotos();
    }, [getPhotos]);

    return {
        photos,
        isLoading,
        error,
        getPhotos,
        uploadPhoto,
        deletePhoto,
    };
}