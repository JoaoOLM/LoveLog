'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, PencilBrush, IText, FabricImage, Path } from 'fabric';
import { fetchData, updateData, deleteData } from '@/hooks/api';

export const useBoard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toolSelected, setToolSelected] = useState<'brush' | 'select' | 'text'>('brush');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);

    // Função para buscar dados do mural
    const fetchBoard = async () => {
        try {
            return await fetchData('board');
        } catch (error) {
            console.error('Erro ao buscar mural:', error);
            throw error;
        }
    };

    // Função para salvar dados do mural
    const saveBoard = async (content: JSON) => {
        console.log('Salvando mural com conteúdo:', content);
        try {
            return await updateData('board/', { content: content });
        } catch (error) {
            console.error('Erro ao salvar mural:', error);
            throw error;
        }
    };

    // Função para excluir dados do mural
    const deleteBoard = async () => {
        try {
            return await deleteData('board');
        } catch (error) {
            console.error('Erro ao excluir mural:', error);
            throw error;
        }
    };

    // Debounce para auto-save
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedSave = useCallback(async () => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            if (canvas && !saving) {
                try {
                    setSaving(true);
                    const boardContent = canvas.toJSON();
                    await saveBoard(boardContent);
                    console.log('Auto-save realizado com sucesso');
                } catch (err) {
                    console.error('Erro no auto-save:', err);
                    setError('Erro ao salvar automaticamente. Tente salvar manualmente.');
                } finally {
                    setSaving(false);
                }
            }
        }, 2000); // Salva após 2 segundos de inatividade
    }, [canvas, saving]);

    // Função para ajustar o tamanho do canvas
    const resizeCanvas = useCallback(() => {
        if (!canvas || !canvasRef.current) return;

        const container = canvasRef.current.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth - 32; // Subtract padding
        const containerHeight = 600;

        // Definir tamanho do canvas
        canvas.setDimensions({
            width: containerWidth,
            height: containerHeight
        });

        // Definir tamanho do elemento canvas no DOM
        canvasRef.current.style.width = `${containerWidth}px`;
        canvasRef.current.style.height = `${containerHeight}px`;

        // Renderizar novamente
        canvas.renderAll();
    }, [canvas]);

    // Inicia o Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        // Obter dimensões do container
        const container = canvasRef.current.parentElement;
        const containerWidth = container ? container.clientWidth - 32 : 800;
        const containerHeight = 600;

        const fabricCanvas = new Canvas(canvasRef.current, {
            isDrawingMode: true,
            width: containerWidth,
            height: containerHeight,
            backgroundColor: '#ffffff',
        });

        const brush = new PencilBrush(fabricCanvas);
        brush.width = brushSize;
        brush.color = color;
        fabricCanvas.freeDrawingBrush = brush;

        setCanvas(fabricCanvas);

        // Configurar o canvas no DOM
        canvasRef.current.style.width = `${containerWidth}px`;
        canvasRef.current.style.height = `${containerHeight}px`;

        (async () => {
            try {
                setLoading(true);
                const response = await fetchBoard();
                console.log('Dados do mural carregados:', response);

                if (response && response.content) {
                    const boardContent = typeof response.content === 'string'
                        ? JSON.parse(response.content)
                        : response.content;

                    await fabricCanvas.loadFromJSON(boardContent);
                    console.log('Mural carregado com sucesso');
                }
            } catch (err) {
                // Silencia erro no GET inicial (404, etc)
                console.info('[useBoard] não foi possível carregar mural existente, iniciando em branco:', err);
            } finally {
                fabricCanvas.renderAll();
                setLoading(false);
            }
        })();

        // Event listener para redimensionamento
        const handleResize = () => {
            setTimeout(() => {
                resizeCanvas();
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            fabricCanvas.dispose();
            window.removeEventListener('resize', handleResize);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Efeito para redimensionar canvas quando o componente monta
    useEffect(() => {
        if (canvas) {
            setTimeout(() => {
                resizeCanvas();
            }, 100);
        }
    }, [canvas, resizeCanvas]);

    // Atualiza o pincel quando muda cor ou tamanho
    useEffect(() => {
        if (!canvas || !canvas.freeDrawingBrush) return;
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = color;
    }, [brushSize, color, canvas]);

    // Alterna ferramenta
    useEffect(() => {
        if (!canvas) return;
        canvas.isDrawingMode = toolSelected === 'brush';

        if (toolSelected === 'select') {
            canvas.selection = true;
            canvas.forEachObject(obj => {
                obj.selectable = true;
            });
        } else {
            canvas.selection = false;
            canvas.discardActiveObject();
            canvas.forEachObject(obj => {
                obj.selectable = false;
            });
            canvas.renderAll();
        }
    }, [toolSelected, canvas]);

    const saveBoardContent = async () => {
        if (!canvas) return;
        try {
            setSaving(true);
            setError(null);
            const boardContent = canvas.toJSON();
            await saveBoard(boardContent);
            console.log('Mural salvo com sucesso');
        } catch (err) {
            console.error('Erro ao salvar mural:', err);
            setError('Erro ao salvar o mural. Por favor, tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const clearBoard = async () => {
        if (!canvas) return;
        if (window.confirm('Tem certeza que deseja limpar o mural?')) {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            canvas.renderAll();
            try {
                await deleteBoard();
                console.log('Mural limpo no servidor');
            } catch (err) {
                console.error('Erro ao limpar mural no servidor:', err);
                setError('Erro ao limpar o mural no servidor.');
            }
        }
    };

    const addText = () => {
        if (!canvas) return;
        const text = new IText('Digite seu texto aqui', {
            left: 50,
            top: 50,
            fontFamily: 'Arial',
            fill: color,
            fontSize: brushSize * 5,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        setToolSelected('select'); // Muda para modo seleção para editar o texto
        canvas.renderAll();
    };

    const addImage = (file: File) => {
        if (!file || !canvas) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const imgEl = new Image();
            imgEl.src = event.target?.result as string;
            imgEl.onload = () => {
                const image = new FabricImage(imgEl);
                if (image.width! > canvas.width!) {
                    image.scaleToWidth(canvas.width! / 2);
                }
                canvas.add(image);
                setToolSelected('select'); // Muda para modo seleção após adicionar imagem
                canvas.renderAll();
            };
        };
        reader.readAsDataURL(file);
    };

    const addHeart = () => {
        if (!canvas) return;
        const heartPath = new Path('M 272.70141,238.71731 C 206.46141,238.71731 152.70146,292.4773 152.70146,358.71731 C 152.70146,493.47282 288.63461,528.80461 381.26391,662.02535 C 468.83815,529.62199 609.82641,489.17075 609.82641,358.71731 C 609.82641,292.47731 556.06651,238.7173 489.82641,238.71731 C 441.77851,238.71731 400.42481,267.08774 381.26391,307.90481 C 362.10311,267.08773 320.74941,238.7173 272.70141,238.71731 z',
            {
                left: 100,
                top: 100,
                fill: color,
                scaleX: 0.2,
                scaleY: 0.2,
            }
        );
        canvas.add(heartPath);
        setToolSelected('select'); // Muda para modo seleção após adicionar coração
        canvas.renderAll();
    };

    const downloadBoardAsImage = () => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 0
        });
        const link = document.createElement('a');
        link.download = 'nosso-mural.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Função para excluir objeto selecionado
    const deleteSelectedObject = () => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            canvas.renderAll();
        }
    };

    // Auto-salvar quando houver mudanças
    useEffect(() => {
        if (!canvas) return;

        const handleModification = () => {
            console.log('Canvas modificado - iniciando auto-save');
            debouncedSave();
        };

        // Eventos para capturar modificações
        canvas.on('path:created', handleModification); // Para desenhos à mão livre
        canvas.on('object:modified', handleModification);
        canvas.on('object:added', handleModification);
        canvas.on('object:removed', handleModification);

        return () => {
            canvas.off('path:created', handleModification);
            canvas.off('object:modified', handleModification);
            canvas.off('object:added', handleModification);
            canvas.off('object:removed', handleModification);
        };
    }, [canvas, debouncedSave]);

    return {
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
    };
};