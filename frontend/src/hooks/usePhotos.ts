import { useState, useEffect, useCallback } from 'react';
import { fetchData, updateData, deleteData } from './api';

interface Image {
    id?: string;
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

    // Buscar uma foto específica
    const getPhoto = useCallback(async (photoId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchData(`photos/${photoId}`);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar foto');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Adicionar nova foto
    const addPhoto = useCallback(async (photo: Omit<Image, 'id'>) => {
        setIsLoading(true);
        setError(null);
        try {
            const newPhoto = await updateData('photos/create', photo);
            setPhotos((prev: Image[]) => [...prev, newPhoto]);
            return newPhoto;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao adicionar foto');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Excluir foto
    const deletePhoto = useCallback(async (photoId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // Fixed endpoint from 'lists' to 'photos'
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
        getPhoto,
        addPhoto,
        deletePhoto,
    };
}