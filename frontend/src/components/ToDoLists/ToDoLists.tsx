'use client';

import { useState, useRef, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2, Check, X, Heart, Calendar, CheckCircle } from 'lucide-react';
import { TodoList, useLists } from '@/hooks/useLists';
import { TodoItem, useItems } from '@/hooks/useItems';

// Componente principal
export default function ToDoLists() {
  const { lists, isLoading, error, createList, updateList, deleteList } = useLists();
  const [activeListId, setActiveListId] = useState('');
  const { items: activeListItems, createItem, updateItem, deleteItem } = useItems(activeListId);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState({ taskId: '', name: '', completed: false });

  // Referência para foco automático
  const newListInputRef = useRef<HTMLInputElement>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const editTaskInputRef = useRef<HTMLInputElement>(null);

  // Obter a lista ativa
  const activeList = lists.find(list => list.id === activeListId);

  // Efeito para selecionar a primeira lista disponível
  useEffect(() => {
    if (lists.length > 0 && !activeListId) {
      setActiveListId(lists[0].id);
    }
    // Se não temos mais listas ativas, resetar activeListId
    if (lists.length === 0 && activeListId) {
      setActiveListId('');
    }
  }, [lists, activeListId]);

  // Foco automático ao criar nova lista
  useEffect(() => {
    if (isCreatingList && newListInputRef.current) {
      newListInputRef.current.focus();
    }
  }, [isCreatingList]);

  // Foco automático ao editar tarefa
  useEffect(() => {
    if (editingTask.taskId && editTaskInputRef.current) {
      editTaskInputRef.current.focus();
    }
  }, [editingTask]);

  // Manipuladores para listas
  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;

    const newList = await createList({
      name: newListTitle,
      items: [] // Sempre iniciamos com um array vazio
    });

    if (newList) {
      setActiveListId(newList.id);
      setNewListTitle('');
      setIsCreatingList(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm('Tem certeza que deseja excluir esta lista?')) {
      await deleteList(listId);
      if (activeListId === listId) {
        setActiveListId(lists.length > 1 ? (lists.find(list => list.id !== listId)?.id ?? '') : '');
      }
    }
  };

  // Manipuladores para tarefas
  const handleAddTask = async () => {
    if (!newTaskText.trim() || !activeListId) return;

    try {
      const newItem = await createItem(newTaskText);
      if (newItem) {
        setNewTaskText('');
        if (newTaskInputRef.current) {
          newTaskInputRef.current.focus();
        }
      }
    } catch (err) {
      console.error("Erro ao adicionar task:", err);
    }
  };

  const handleToggleTaskComplete = async (taskId: string, item: TodoItem) => {
    try {
      await updateItem(taskId, {name: item.name, completed: !item.completed});
    } catch (err) {
      console.error("Erro ao atualizar task:", err);
    }
  };

  const handleDeleteTask = async (itemId: string) => {
    if (!activeListId) return;
    try {
      await deleteItem(itemId);
    } catch (err) {
      console.error("Erro ao deletar task:", err);
    }
  };

  const startEditingTask = (taskId: string, name: string, completed: boolean) => {
    setEditingTask({ taskId, name: name, completed: completed });
  };

  const handleSaveEditedTask = async () => {
    if (!editingTask.name.trim() || !editingTask.taskId) return;

    try {
      await updateItem(editingTask.taskId, editingTask);
      setEditingTask({ taskId: '', name: '', completed: false });
    } catch (err) {
      console.error("Erro ao editar task:", err);
    }
  };

  const cancelEditingTask = () => {
    setEditingTask({ taskId: '', name: '', completed: false });
  };

  // Função auxiliar para calcular estatísticas da lista
  const getListStats = (items: TodoItem[] | undefined) => {
    if (!items || !Array.isArray(items)) {
      return { total: 0, completed: 0 };
    }

    const total = items.length;
    const completed = items.filter(item => item.completed).length;

    return { total, completed };
  };

  // Função para obter contagem de items por lista (para exibir na sidebar)
  const getListItemCount = (listId: string) => {
    // Como não temos acesso aos items de todas as listas simultaneamente,
    // vamos usar uma aproximação baseada no activeListItems quando a lista está ativa
    if (listId === activeListId) {
      return activeListItems ? activeListItems.length : 0;
    }
    // Para outras listas, poderia implementar um cache ou buscar do backend
    return 0;
  };

  // Renderização do componente
  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-gray-50">
      {/* Barra lateral de listas */}
      <div className="w-full md:w-64 bg-white p-4 border-r border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold flex items-center">
            <Heart className="text-red-500 mr-2" size={20} />
            Lista do Casal
          </h1>
        </div>

        <div className="mb-4">
          {isCreatingList ? (
            <div
              className="flex items-center mb-2"
              tabIndex={-1}
              onBlur={(e) => {
                // Só fecha se o foco sair do input e não for para um filho
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsCreatingList(false);
                }
              }}
            >
              <input
                ref={newListInputRef}
                type="text"
                className="flex-1 border rounded p-2 mr-2"
                placeholder="Nome da lista"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
              />
            </div>
          ) : (
            <button
              className="flex w-full items-center p-2 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
              onClick={() => setIsCreatingList(true)}
            >
              <PlusCircle size={18} className="mr-2" />
              Nova Lista
            </button>
          )}
        </div>

        <div className="space-y-1">
          {isLoading && <p className="text-gray-500">Carregando listas...</p>}
          {error && <p className="text-red-500">Erro: {error}</p>}
          {lists.map(list => {
            const itemCount = getListItemCount(list.id);

            return (
              <div
                key={list.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${activeListId === list.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveListId(list.id)}
              >
                <div className="flex items-center">
                  <span className="font-medium">{list.name}</span>
                  {activeListId === list.id && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({itemCount})
                    </span>
                  )}
                </div>
                <button
                  className="text-red-500 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da lista ativa */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeList ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="text-blue-500 mr-2" size={20} />
                {activeList.name}
              </h2>
              <div className="text-sm text-gray-500">
                {getListStats(activeListItems).completed}/{getListStats(activeListItems).total} concluídas
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex mb-4">
                <input
                  ref={newTaskInputRef}
                  type="text"
                  className="flex-1 border rounded-l p-2"
                  placeholder="Adicionar nova tarefa..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button
                  className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600"
                  onClick={handleAddTask}
                >
                  <PlusCircle size={20} />
                </button>
              </div>

              <div className="space-y-2">
                {!Array.isArray(activeListItems) || activeListItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma tarefa adicionada. Comece criando uma!
                  </div>
                ) : (
                  activeListItems.map((task) => {
                    const isEditing = editingTask.taskId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 border rounded ${task.completed ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <div className="flex items-center flex-1">
                          <button
                            className={`mr-3 ${task.completed ? 'text-green-500' : 'text-gray-300'}`}
                            onClick={() => handleToggleTaskComplete(task.id, task)}
                          >
                            <CheckCircle size={20} />
                          </button>

                          {isEditing ? (
                            <input
                              ref={editTaskInputRef}
                              type="text"
                              className="flex-1 p-1 border rounded"
                              value={editingTask.name}
                              onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEditedTask()}
                            />
                          ) : (
                            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.name}
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                className="text-green-600"
                                onClick={handleSaveEditedTask}
                              >
                                <Check size={18} />
                              </button>
                              <button
                                className="text-red-600"
                                onClick={cancelEditingTask}
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="text-blue-500"
                                onClick={() => startEditingTask(task.id, task.name, task.completed)}
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                className="text-red-500"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-medium mb-3">Estatísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-sm text-gray-500">Total de tarefas</div>
                  <div className="text-xl font-bold text-blue-700">{getListStats(activeListItems).total}</div>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-sm text-gray-500">Concluídas</div>
                  <div className="text-xl font-bold text-green-700">
                    {getListStats(activeListItems).completed}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Heart className="text-red-300 mb-4" size={64} />
            {lists.length === 0 ? (
              <p>Nenhuma lista criada. Crie sua primeira lista de tarefas do casal!</p>
            ) : (
              <p>Selecione uma lista para visualizar</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}