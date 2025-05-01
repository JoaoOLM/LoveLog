'use client';

import { useEffect, useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { fetchListsWithItems } from '@/lib/api';

interface Item {
  id: number;
  content: string;
}

interface List {
  id: number;
  title: string;
  items: Item[];
}

export default function TodoLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setLoading(true);

        // chama seu helper que retorna o array de listas com itens
        const body: Array<{ id: number; nome: string; itens: { id: number; nome: string }[] }> =
          await fetchListsWithItems();

        // mapeia para o formato que o componente espera
        const formatted: List[] = body.map((l) => ({
          id: l.id,
          title: l.nome,
          items: l.itens.map((i) => ({ id: i.id, content: i.nome })),
        }));

        setLists(formatted);
      } catch (err: any) {
        console.error('Erro ao carregar listas:', err);
        setError(err.message || 'Não foi possível carregar as listas.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Carregando listas…</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6">📝 Nossas Listas</h2>

      <Accordion.Root type="multiple" className="space-y-4">
        {lists.map((list) => (
          <Accordion.Item
            key={list.id}
            value={`list-${list.id}`}
            className="border rounded-lg overflow-hidden"
          >
            <Accordion.Header className="bg-pink-100">
              <Accordion.Trigger className="w-full flex justify-between items-center p-4 font-semibold text-left">
                {list.title}
                <ChevronDownIcon className="transition-transform duration-300 data-[state=open]:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="p-4 bg-white text-gray-800 space-y-2">
              {list.items.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum item ainda...</p>
              ) : (
                <ul className="space-y-2">
                  {list.items.map((item) => (
                    <li key={item.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`item-${item.id}`}
                        className="form-checkbox h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                      />
                      <label htmlFor={`item-${item.id}`} className="ml-2">
                        {item.content}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
