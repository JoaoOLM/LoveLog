'use client';

import Carousel from "@/components/Carousel/Carousel";
import Board from "@/components/Board/Board";
import CollapsibleLists from "@/components/ToDoLists/ToDoLists";
import { useCoupleData } from '@/hooks/useCoupleData';

export default function Home() {
  const { loading, photos, board, lists } = useCoupleData();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center py-10 gap-10">
      <Carousel images={photos.map((photo: any) => photo.url)} />
      <Board />
      <CollapsibleLists /> 
    </main>
  );
}