'use client';

import { useEffect, useState, useRef } from 'react';
import { Canvas, PencilBrush, IText, FabricImage, Path } from 'fabric';
import { fetchBoard, saveBoard, deleteBoard } from '@/lib/api';

export const useBoard = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toolSelected, setToolSelected] = useState<'brush' | 'select' | 'text'>('brush');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);

    // Inicia o Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const fabricCanvas = new Canvas(canvasRef.current, {
            isDrawingMode: true,
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
        });

        const brush = new PencilBrush(fabricCanvas);
        brush.width = brushSize;
        brush.color = color;
        fabricCanvas.freeDrawingBrush = brush;

        setCanvas(fabricCanvas);

        (async () => {
            try {
                const response = await fetchBoard();
                const raw = response.content;
                if (raw) {
                    const json = typeof raw === 'string' ? JSON.parse(raw) : raw;
                    await fabricCanvas.loadFromJSON(json);
                }
            } catch (err) {
                // silencia erro no GET inicial (404, etc)
                console.info('[useBoard] não foi possível carregar mural existente, iniciando em branco:', err);
            } finally {
                fabricCanvas.renderAll();
                setLoading(false);
            }
        })();

        return () => {
            fabricCanvas.dispose();
        };
    }, []);

    // atualiza o pincel quando muda cor ou tamanho
    useEffect(() => {
        if (!canvas || !canvas.freeDrawingBrush) return;
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = color;
    }, [brushSize, color, canvas]);

    // alterna ferramenta
    useEffect(() => {
        if (!canvas) return;
        canvas.isDrawingMode = toolSelected === 'brush';
    }, [toolSelected, canvas]);

    const saveBoardContent = async () => {
        if (!canvas) return;
        try {
            setSaving(true);
            const boardContent = canvas.toJSON();
            await saveBoard(boardContent);
        } catch {
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
            } catch {
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
        canvas.renderAll();
    };

    const downloadBoardAsImage = () => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL();
        const link = document.createElement('a');
        link.download = 'nosso-mural.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
    };
};
