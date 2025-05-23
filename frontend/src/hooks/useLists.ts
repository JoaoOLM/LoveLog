import { useState, useEffect, useCallback } from 'react';
import { fetchData, updateData, deleteData, createData } from '@/hooks/api';
import { TodoItem } from '@/hooks/useItems';

export interface TodoList {
    id: string;
    name: string;
    items: TodoItem[];
}

export function useLists() {
    const [lists, setLists] = useState<TodoList[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Busca todas as listas (sem os itens)
    const getLists = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchData('lists');
            setLists(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar listas');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Busca uma lista específica
    const getList = useCallback(async (listId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchData(`lists/${listId}`);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar lista');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cria uma nova lista
    const createList = useCallback(async (list: Omit<TodoList, 'id'>) => {
        setIsLoading(true);
        setError(null);
        try {
            const newList = await createData('lists/', { name: list.name });
            setLists((prev) => [...prev, newList]);
            return newList;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar lista');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Atualiza uma lista existente
    const updateList = useCallback(async (listId: string, partialList: Partial<TodoList>) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedList = await updateData(`lists/${listId}/`, partialList);
            setLists((prev) =>
                prev.map((item) => (item.id === listId ? updatedList : item))
            );
            return updatedList;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar lista');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Exclui uma lista
    const deleteList = useCallback(async (listId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await deleteData(`lists/${listId}`);
            setLists((prev) => prev.filter((item) => item.id !== listId));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao excluir lista');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getLists();
    }, [getLists]);

    return {
        lists,
        isLoading,
        error,
        getLists,
        getList,
        createList,
        updateList,
        deleteList,
    };
}
