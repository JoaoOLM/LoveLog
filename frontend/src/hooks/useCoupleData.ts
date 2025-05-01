'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchPhotos, fetchBoard, fetchListsWithItems } from "@/lib/api";

export function useCoupleData() {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const [board, setBoard] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const coupleCode = localStorage.getItem('coupleCode');

    if (!coupleCode) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const [photosData, boardData, listsData] = await Promise.all([
          fetchPhotos(),
          fetchBoard(),
          fetchListsWithItems()
        ]);

        setPhotos(photosData);
        setBoard(boardData);
        setLists(listsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  return {
    loading,
    photos,
    board,
    lists,
  };
}
