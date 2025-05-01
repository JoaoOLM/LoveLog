import { useBoard } from "@/hooks/useBoard";

export default function CoupleBoard() {
  const {
    canvasRef,
    loading,
    saving,
    error,
    toolSelected,
    color,
    brushSize,
    setToolSelected,
    setColor,
    setBrushSize,
    addText,
    addImage,
    addHeart,
    clearBoard,
    saveBoardContent,
    downloadBoardAsImage,
    setError,
  } = useBoard();

  return (
    <div className="flex flex-col">
      {/* Overlay de loading */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex justify-center items-center">
          Carregando mural...
        </div>
      )}

      <div className={`${loading ? 'opacity-50 pointer-events-none' : ''} bg-white p-4 rounded-lg shadow`}>
        <h2 className="text-2xl font-bold mb-4">Nosso Mural</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button className="float-right" onClick={() => setError(null)}>
              &times;
            </button>
          </div>
        )}

        {/* Ferramentas */}
        <div className="flex space-x-2 mb-4">
          <button
            className={`px-3 py-1 rounded ${toolSelected === 'brush' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setToolSelected('brush')}
          >
            Pincel
          </button>
          <button
            className={`px-3 py-1 rounded ${toolSelected === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setToolSelected('select')}
          >
            Selecionar
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() => {
              setToolSelected('text');
              addText();
            }}
          >
            Texto
          </button>

          <div className="flex items-center space-x-2">
            <label>Cor:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label>Tamanho:</label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex space-x-2 mb-4">
          <button className="px-3 py-1 rounded bg-pink-400 text-white" onClick={addHeart}>
            Adicionar Coração
          </button>
          <label className="px-3 py-1 rounded bg-green-500 text-white cursor-pointer">
            Adicionar Imagem
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addImage(e.target.files[0]);
              }}
            />
          </label>
          <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={clearBoard}>
            Limpar Mural
          </button>
          <button className="px-3 py-1 rounded bg-purple-500 text-white" onClick={downloadBoardAsImage}>
            Baixar como Imagem
          </button>
        </div>

        {/* Aqui garantimos que o canvas sempre exista na árvore */}
        <div className="border border-gray-300 rounded">
          <canvas ref={canvasRef} id="couple-board" width={800} height={600} />
        </div>

        {/* Botão de salvar */}
        <div className="mt-4 flex justify-end">
          <button
            className={`px-4 py-2 rounded bg-blue-600 text-white ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={saveBoardContent}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Mural'}
          </button>
        </div>
      </div>
    </div>
  );
};
