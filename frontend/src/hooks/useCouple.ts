import { useState, useEffect, useCallback } from 'react';
import { fetchData, updateData } from '@/hooks/api';

interface Couple {
  id: string;
}

export function useCouple() {
  const [coupleData, setCoupleData] = useState<Couple | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do casal
  const getCoupleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchData('couple');
      setCoupleData(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados do casal');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar dados do casal
  const updateCoupleData = useCallback(async (data: Partial<Couple>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedData = await updateData('couple/update', JSON.parse(JSON.stringify(data)));
      setCoupleData((prev: Couple | null) => prev ? { ...prev, ...updatedData } : updatedData);
      return updatedData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados do casal');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar dados do casal automaticamente
  useEffect(() => {
    getCoupleData();
  }, [getCoupleData]);

  return {
    coupleData,
    isLoading,
    error,
    getCoupleData,
    updateCoupleData,
  };
}