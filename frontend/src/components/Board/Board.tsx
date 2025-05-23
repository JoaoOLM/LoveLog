'use client';

import { useBoard } from '@/hooks/useBoard';
import { useState, useRef, useEffect } from 'react';
import { BsPencil, BsCursor, BsType, BsImage, BsHeart, BsTrash, BsDownload, BsSave, BsXCircle } from 'react-icons/bs';
import { TbRefresh } from 'react-icons/tb';

export default function Board() {
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
    deleteSelectedObject,
    resizeCanvas,
  } = useBoard();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addImage(e.target.files[0]);
      e.target.value = ''; // Limpa o input para permitir selecionar o mesmo arquivo novamente
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Redimensionar canvas quando a janela muda de tamanho
  useEffect(() => {
    const handleResize = () => {
      if (resizeCanvas) {
        setTimeout(() => {
          resizeCanvas();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  return (
    <div className="flex flex-col space-y-4 p-4 bg-gray-50 rounded-lg shadow w-full">
      <h2 className="text-2xl font-bold text-center text-purple-800">Nosso Mural</h2>

      {/* Barra de Ferramentas */}
      <div className="flex flex-wrap gap-2 justify-center bg-white p-2 rounded-lg shadow-sm">
        {/* Ferramentas de Desenho */}
        <div className="flex space-x-2 items-center border-r pr-2">
          <button
            onClick={() => setToolSelected('brush')}
            className={`p-2 rounded-md transition-colors ${toolSelected === 'brush' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
            title="Pincel"
          >
            <BsPencil size={20} />
          </button>
          <button
            onClick={() => setToolSelected('select')}
            className={`p-2 rounded-md transition-colors ${toolSelected === 'select' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
            title="Selecionar"
          >
            <BsCursor size={20} />
          </button>
          <button
            onClick={() => setToolSelected('text')}
            className={`p-2 rounded-md transition-colors ${toolSelected === 'text' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}
            title="Texto"
            onDoubleClick={addText}
          >
            <BsType size={20} />
          </button>
        </div>

        {/* Controles de cor e tamanho */}
        <div className="flex space-x-2 items-center border-r pr-2">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-8 h-8 rounded-md border-2 border-gray-300 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              title="Escolher Cor"
            />
            {showColorPicker && (
              <div className="absolute z-20 mt-2 p-3 bg-white rounded-lg shadow-xl border">
                <div className="grid grid-cols-5 gap-2">
                  {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
                    '#ff00ff', '#00ffff', '#ff9900', '#9900ff', '#ffffff'].map(colorOption => (
                      <button
                        key={colorOption}
                        className="w-6 h-6 rounded-sm border border-gray-300 transition-transform hover:scale-110"
                        style={{ backgroundColor: colorOption }}
                        onClick={() => {
                          setColor(colorOption);
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                </div>
                <div className="mt-2 pt-2 border-t">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 rounded border-0"
                    title="Cor customizada"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Tamanho: {brushSize}px</label>
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

        {/* Adição de objetos */}
        <div className="flex space-x-2 items-center border-r pr-2">
          <button
            onClick={addText}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Adicionar Texto"
          >
            <BsType size={20} />
          </button>
          <button
            onClick={handleImageClick}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Adicionar Imagem"
          >
            <BsImage size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={addHeart}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors text-red-500"
            title="Adicionar Coração"
          >
            <BsHeart size={20} />
          </button>
          <button
            onClick={deleteSelectedObject}
            className="p-2 rounded-md hover:bg-red-50 text-red-600 transition-colors"
            title="Excluir Selecionado"
          >
            <BsTrash size={20} />
          </button>
        </div>

        {/* Ações do mural */}
        <div className="flex space-x-2 items-center">
          <button
            onClick={downloadBoardAsImage}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Baixar como Imagem"
          >
            <BsDownload size={20} />
          </button>
          <button
            onClick={saveBoardContent}
            disabled={saving}
            className={`p-2 rounded-md transition-colors ${saving ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            title="Salvar Mural"
          >
            {saving ? <TbRefresh className="animate-spin" size={20} /> : <BsSave size={20} />}
          </button>
          <button
            onClick={clearBoard}
            className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            title="Limpar Mural"
          >
            <BsXCircle size={20} />
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md flex justify-between items-center border border-red-200">
          <p className="flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 ml-2"
            title="Fechar erro"
          >
            <BsXCircle size={20} />
          </button>
        </div>
      )}

      {/* Container do Canvas */}
      <div
        ref={canvasContainerRef}
        className="relative border-2 border-gray-300 rounded-lg overflow-hidden shadow-inner bg-white"
        style={{ minHeight: '600px' }}
      >
        {/* Área de Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-30">
            <div className="flex flex-col items-center">
              <TbRefresh className="animate-spin text-purple-600" size={40} />
              <p className="mt-2 text-purple-800 font-medium">Carregando mural...</p>
            </div>
          </div>
        )}

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="block max-w-full max-h-full"
          style={{
            width: '100%',
            height: '600px',
            touchAction: 'none' // Previne scroll no mobile
          }}
        />
      </div>

      {/* Status */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-gray-500">
          {saving ? (
            <span className="flex items-center">
              <TbRefresh className="animate-spin mr-1" size={16} />
              Salvando automaticamente...
            </span>
          ) : (
            'Pronto para edição • Auto-save ativo'
          )}
        </div>
        <div className="text-gray-400">
          Ferramenta: <span className="font-medium text-purple-600">
            {toolSelected === 'brush' ? 'Pincel' :
              toolSelected === 'select' ? 'Seleção' : 'Texto'}
          </span>
        </div>
      </div>
    </div>
  );
}