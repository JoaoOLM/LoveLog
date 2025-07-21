import Carousel from "@/components/Carousel/Carousel";
import Board from "@/components/Board/Board";
import ToDoLists from "@/components/ToDoLists/ToDoLists";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center py-10 gap-10">
      <h1 className="text-4xl font-bold text-center">LoveLog</h1>
      <Carousel />
      <Board />
      <ToDoLists />
    </main>
  );
}