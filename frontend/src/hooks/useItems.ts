import { useEffect, useState, useCallback } from 'react';
import { fetchData, createData, updateData, deleteData } from '@/hooks/api';

export interface TodoItem {
    id: string;
    name: string;
    completed: boolean;
}

export function useItems(listId: string) {
    const [items, setItems] = useState<TodoItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getItems = useCallback(async () => {
        if (!listId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchData(`lists/${listId}/items`);
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar itens');
        } finally {
            setIsLoading(false);
        }
    }, [listId]);

    const getItem = useCallback(async (itemId: string) => {
        if (!listId || !itemId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchData(`lists/${listId}/items/${itemId}`);
            setItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar iten');
        } finally {
            setIsLoading(false);
        }
    }, [listId]);

    const createItem = useCallback(async (name: string) => {
        try {
            const newItem = await createData(`lists/${listId}/items/`, {
                name,
                completed: false,
                list: listId,
            });
            setItems((prev) => [...prev, newItem]);
            return newItem;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar item');
            return null;
        }
    }, [listId]);

    const updateItem = useCallback(async (itemId: string, item: Omit<TodoItem, 'id'> ) => {
        if (!listId || !itemId) return;
        try {
            const updatedItem = await updateData(`lists/${listId}/items/${itemId}/`, {
                name: item.name,
                completed: item.completed,
            });
            setItems((prev) =>
                prev.map((item) => (item.id === itemId ? updatedItem : item))
            );
            return updatedItem;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar item');
            return null;
        }
    }, [listId]);

    const deleteItem = useCallback(async (itemId: string) => {
        console.log("listId: ", listId);
        console.log("itemId: ", itemId);
        if (!listId || !itemId) return;
        console.log('deleteItem: ', itemId, "from list: ", listId);
        try {
            await deleteData(`lists/${listId}/items/${itemId}`);
            setItems((prev) => prev.filter((i) => i.id !== itemId));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao deletar item');
            return false;
        }
    }, [listId]);

    useEffect(() => {
        getItems();
    }, [getItems]);

    return {
        items,
        isLoading,
        error,
        getItems,
        getItem,
        createItem,
        updateItem,
        deleteItem,
    };
}
